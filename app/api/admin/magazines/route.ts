import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs/promises';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

async function checkAdminAuth() {
  const token = (await cookies()).get('admin_token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await prisma.taiKhoanNguoiDung.findUnique({
    where: { id: decoded.userId },
    select: { id: true, role: true },
  });

  return user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? user : null;
}

export async function POST(req: Request) {
  try {
    const user = await checkAdminAuth();
    if (!user) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
    }

    const formData = await req.formData();
    const tieuDe = (formData.get('tieuDe') as string)?.trim();
    const tenTacGia = (formData.get('tenTacGia') as string)?.trim() || null;
    const moTa = (formData.get('moTa') as string)?.trim() || null;
    const anhBiaLocal = (formData.get('anhBiaLocal') as string)?.trim() || null;
    const anhBiaUrl = (formData.get('anhBiaUrl') as string)?.trim() || null;
    const ngayXuatBan = formData.get('ngayXuatBan') as string | null;
    const trangThai = (formData.get('trangThai') as string) || 'draft';
    const categories = formData.getAll('categories') as string[]; // nhiều category id
    const file = formData.get('file') as File | null;

    if (!tieuDe) {
      return NextResponse.json({ error: 'Tiêu đề là bắt buộc' }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: 'File là bắt buộc' }, { status: 400 });
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Chỉ hỗ trợ file PDF hoặc Word' }, { status: 400 });
    }

    // Đọc file buffer một lần
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = path.extname(file.name).toLowerCase();
    let soTrang: number | null = null;

    try {
      if (ext === '.pdf') {
        const data = await pdf(buffer);
        soTrang = data.numpages || 0;
      } else {
        const { value } = await mammoth.extractRawText({ arrayBuffer });
        const wordCount = value.split(/\s+/).length;
        soTrang = Math.max(1, Math.ceil(wordCount / 250));
      }
    } catch {
      return NextResponse.json({ error: 'Lỗi khi xử lý file' }, { status: 400 });
    }

    // 📂 Lưu file
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'magazines');
    await fs.mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, new Uint8Array(buffer));

    const publicUrl = `/uploads/magazines/${fileName}`;

    // 🗄️ Ghi database
    const result = await prisma.$transaction(async (tx) => {
      const fileRecord = await tx.file.create({
        data: { fileName, fileType: file.type, fileUrl: publicUrl },
      });

      const magazine = await tx.magazine.create({
        data: {
          tieuDe,
          tenTacGia,
          moTa,
          anhBiaLocal,
          anhBiaUrl,
          trangThai,
          soTrang,
          fileUploadId: fileRecord.id,
          taiKhoanNguoiDungId: user.id,
          ngayXuatBan: ngayXuatBan ? new Date(ngayXuatBan) : null,
          categoryName: categories.length
            ? {
              connect: categories.map((id) => ({ id })),
            }
            : undefined,
        },
        include: {
          fileUpload: true,
          TaiKhoanNguoiDung: { select: { name: true, email: true } },
          categoryName: true,
        },
      });

      return magazine;
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Lỗi server khi tạo tạp chí',
        details:
          process.env.NODE_ENV === 'development' && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}




