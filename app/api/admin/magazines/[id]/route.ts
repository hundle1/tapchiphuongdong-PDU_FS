import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function checkAdminAuth() {
  const token = cookies().get('admin_token')?.value;
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await checkAdminAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }

    // Delete magazine and its pages (cascade)
    await prisma.magazine.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting magazine:', error);
    return NextResponse.json(
      { error: 'Failed to delete magazine' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await checkAdminAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }

    const magazine = await prisma.magazine.findUnique({
      where: {
        id: params.id,
      },
      include: {
        pages: {
          orderBy: {
            pageNumber: 'asc'
          }
        },
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!magazine) {
      return NextResponse.json(
        { error: 'Magazine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(magazine);
  } catch (error) {
    console.error('Error fetching magazine:', error);
    return NextResponse.json(
      { error: 'Failed to fetch magazine' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await checkAdminAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }

    const { title, description, coverImage, publishDate, status, pages } = await request.json();

    if (!title || !coverImage || !pages || pages.length === 0) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Delete existing pages and create new ones
    await prisma.page.deleteMany({
      where: { magazineId: params.id }
    });

    const magazine = await prisma.magazine.update({
      where: { id: params.id },
      data: {
        title,
        description,
        coverImage,
        publishDate: new Date(publishDate),
        status,
        pages: {
          create: pages.map((page: any) => ({
            pageNumber: page.pageNumber,
            imageUrl: page.imageUrl,
            content: page.content || null,
          }))
        }
      },
      include: {
        pages: true,
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(magazine);
  } catch (error) {
    console.error('Error updating magazine:', error);
    return NextResponse.json(
      { error: 'Failed to update magazine' },
      { status: 500 }
    );
  }
}