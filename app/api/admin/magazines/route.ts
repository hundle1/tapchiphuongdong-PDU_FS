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

export async function GET() {
  try {
    const user = await checkAdminAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }

    const magazines = await prisma.magazine.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        },
        pages: {
          select: {
            id: true
          }
        }
      }
    });

    return NextResponse.json(magazines);
  } catch (error) {
    console.error('Error fetching admin magazines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch magazines' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const magazine = await prisma.magazine.create({
      data: {
        title,
        description,
        coverImage,
        publishDate: new Date(publishDate),
        status,
        authorId: user.id,
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
    console.error('Error creating magazine:', error);
    return NextResponse.json(
      { error: 'Failed to create magazine' },
      { status: 500 }
    );
  }
}