import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs/promises';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await prisma.taiKhoanNguoiDung.findUnique({
    where: { id: decoded.userId },
    select: { id: true, role: true },
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return null;
  }

  return user;
}

// 📌 GET danh sách tạp chí
export async function GET() {
  try {
    const user = await checkAdminAuth();
    if (!user) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
    }

    const magazines = await prisma.magazine.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        TaiKhoanNguoiDung: { select: { name: true, email: true } },
        fileUpload: true,
      },
    });

    return NextResponse.json(magazines);
  } catch (error) {
    console.error('Error fetching magazines:', error);
    return NextResponse.json({ error: 'Lỗi khi lấy danh sách tạp chí' }, { status: 500 });
  }
}

// 📌 POST tạo tạp chí mới + upload file
export async function POST(req: Request) {
  try {
    const user = await checkAdminAuth();
    if (!user) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
    }

    const formData = await req.formData();
    const tieuDe = formData.get('tieuDe') as string;
    const moTa = formData.get('moTa') as string | null;
    const trangThai = formData.get('trangThai') as string;
    const anhBia = formData.get('anhBia') as string | null;
    const file = formData.get('file') as File | null;

    if (!tieuDe || !file) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    let soTrang: number | null = null;

    // Đọc file 1 lần
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (ext === '.pdf') {
      const data = await pdf(buffer);
      soTrang = data.numpages || 0;
    } else if (ext === '.docx') {
      const { value } = await mammoth.extractRawText({ arrayBuffer });
      soTrang = value ? 1 : 0; // tạm gán 1 nếu có nội dung
    } else {
      return NextResponse.json({ error: 'Chỉ hỗ trợ PDF hoặc DOCX' }, { status: 400 });
    }

    // 📂 Lưu file vào public/uploads/magazines/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'magazines');
    await fs.mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, new Uint8Array(buffer));

    const publicUrl = `/uploads/magazines/${fileName}`;

    // 📌 Lưu record file
    const fileRecord = await prisma.file.create({
      data: {
        fileName,
        fileType: file.type,
        fileUrl: publicUrl,
      },
    });

    // 📌 Lưu tạp chí
    const magazine = await prisma.magazine.create({
      data: {
        tieuDe,
        moTa,
        anhBia: anhBia || null,
        trangThai,
        soTrang: soTrang ?? 0,
        fileUploadId: fileRecord.id,
        taiKhoanNguoiDungId: user.id,
      },
      include: {
        fileUpload: true,
        TaiKhoanNguoiDung: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(magazine);
  } catch (error) {
    console.error('Error creating magazine:', error);
    return NextResponse.json({ error: 'Lỗi khi tạo tạp chí' }, { status: 500 });
  }
}
