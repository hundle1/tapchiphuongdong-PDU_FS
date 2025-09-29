import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const magazine = await prisma.magazine.findUnique({
      where: {
        id: params.id,
      },
      include: {
        Page: {
          orderBy: {
            soTrang: 'asc'
          }
        },
        TaiKhoanNguoiDung: {
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

    // Only return published magazines for public access
    if (magazine.trangThai !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Magazine not available' },
        { status: 403 }
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