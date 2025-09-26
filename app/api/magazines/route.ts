import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const magazines = await prisma.magazine.findMany({
      where: {
        status: 'PUBLISHED'
      },
      orderBy: {
        publishDate: 'desc'
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
            id: true,
            pageNumber: true
          }
        }
      }
    });

    return NextResponse.json(magazines);
  } catch (error) {
    console.error('Error fetching magazines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch magazines' },
      { status: 500 }
    );
  }
}