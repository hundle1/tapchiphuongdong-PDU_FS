import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

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

// 🔍 GET chi tiết magazine
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await checkAdminAuth();
    if (!user) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
    }

    const magazine = await prisma.magazine.findUnique({
      where: { id: params.id },
      include: {
        fileUpload: true,
        categoryName: true,
        TaiKhoanNguoiDung: { select: { name: true, email: true } },
      },
    });

    if (!magazine) {
      return NextResponse.json({ error: 'Không tìm thấy tạp chí' }, { status: 404 });
    }

    return NextResponse.json(magazine);
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi lấy thông tin tạp chí' },
      { status: 500 }
    );
  }
}

// 📝 PUT cập nhật magazine
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await checkAdminAuth();
    if (!user) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
    }

    const body = await req.json();
    const {
      tieuDe,
      moTa,
      anhBiaLocal,
      anhBiaUrl,
      trangThai,
      soTrang,
      tenTacGia,
      ngayXuatBan,
      categories, // array id category
    } = body;

    if (!tieuDe?.trim()) {
      return NextResponse.json({ error: 'Thiếu tiêu đề' }, { status: 400 });
    }

    const magazine = await prisma.magazine.update({
      where: { id: params.id },
      data: {
        tieuDe: tieuDe.trim(),
        moTa: moTa?.trim() || null,
        anhBiaLocal: anhBiaLocal?.trim() || null,
        anhBiaUrl: anhBiaUrl?.trim() || null,
        trangThai: trangThai || 'draft',
        soTrang: soTrang ?? undefined,
        tenTacGia: tenTacGia?.trim() || null,
        ngayXuatBan: ngayXuatBan ? new Date(ngayXuatBan) : null,
        updatedAt: new Date(),
        categoryName: categories?.length
          ? { set: categories.map((id: string) => ({ id })) }
          : undefined,
      },
      include: {
        fileUpload: true,
        categoryName: true,
        TaiKhoanNguoiDung: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(magazine);
  } catch (error) {
    return NextResponse.json(
      { error: 'Cập nhật tạp chí thất bại' },
      { status: 500 }
    );
  }
}

// 🗑 DELETE magazine
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await checkAdminAuth();
    if (!user) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
    }

    const magazine = await prisma.magazine.findUnique({
      where: { id: params.id },
      include: { fileUpload: true },
    });

    if (!magazine) {
      return NextResponse.json({ error: 'Không tìm thấy tạp chí' }, { status: 404 });
    }

    // Xóa file vật lý nếu tồn tại
    if (magazine.fileUpload?.fileUrl) {
      const filePath = path.join(process.cwd(), 'public', magazine.fileUpload.fileUrl);
      try {
        await fs.unlink(filePath);
      } catch {
        // file không tồn tại thì bỏ qua
      }
    }

    // Xóa trong DB
    await prisma.magazine.delete({ where: { id: params.id } });
    if (magazine.fileUploadId) {
      await prisma.file.delete({ where: { id: magazine.fileUploadId } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Xóa tạp chí thất bại' },
      { status: 500 }
    );
  }
}
