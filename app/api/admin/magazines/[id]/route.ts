import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

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

// DELETE magazine
export async function DELETE(
  request: Request,
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

    // Xóa file vật lý nếu có
    if (magazine.fileUpload?.fileUrl) {
      const filePath = path.join(process.cwd(), 'public', magazine.fileUpload.fileUrl);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn('File không tồn tại hoặc đã xóa:', filePath);
      }
    }

    // Xóa magazine và file record
    await prisma.magazine.delete({ where: { id: params.id } });
    if (magazine.fileUploadId) {
      await prisma.file.delete({ where: { id: magazine.fileUploadId } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting magazine:', error);
    return NextResponse.json({ error: 'Xóa tạp chí thất bại' }, { status: 500 });
  }
}

// GET magazine detail
export async function GET(
  request: Request,
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
        Page: { orderBy: { soTrang: 'asc' } },
        fileUpload: true,
        TaiKhoanNguoiDung: { select: { name: true, email: true } },
      },
    });

    if (!magazine) {
      return NextResponse.json({ error: 'Không tìm thấy tạp chí' }, { status: 404 });
    }

    // Nếu soTrang = 0 thì fallback sang số lượng Page
    const finalData = {
      ...magazine,
      soTrang: magazine.soTrang !== null ? magazine.soTrang : magazine.Page.length,
    };

    return NextResponse.json(finalData);
  } catch (error) {
    console.error('Error fetching magazine:', error);
    return NextResponse.json({ error: 'Lỗi khi lấy thông tin tạp chí' }, { status: 500 });
  }
}

// PUT update magazine
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await checkAdminAuth();
    if (!user) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });
    }

    const { tieuDe, moTa, anhBia, trangThai, soTrang } = await request.json();

    if (!tieuDe || !anhBia) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    const magazine = await prisma.magazine.update({
      where: { id: params.id },
      data: {
        tieuDe,
        moTa,
        anhBia,
        trangThai,
        soTrang: soTrang ?? undefined, // cho phép update nếu có
      },
      include: {
        Page: true,
        fileUpload: true,
        TaiKhoanNguoiDung: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(magazine);
  } catch (error) {
    console.error('Error updating magazine:', error);
    return NextResponse.json({ error: 'Cập nhật tạp chí thất bại' }, { status: 500 });
  }
}
