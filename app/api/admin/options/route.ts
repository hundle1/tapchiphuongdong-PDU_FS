// app/api/admin/options/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

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

export async function GET() {
    try {
        const user = await checkAdminAuth();
        if (!user) return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });

        const [categories, majors] = await Promise.all([
            prisma.category.findMany({ select: { id: true, name: true } }),
            prisma.major.findMany({ select: { id: true, name: true } }),
        ]);

        return NextResponse.json({ categories, majors });
    } catch (error) {
        return NextResponse.json(
            {
                error: 'Lỗi server khi lấy dữ liệu',
                details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const user = await checkAdminAuth();
        if (!user) return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });

        const body = await req.json();
        const { name, type } = body; // type = 'category' | 'major'

        if (!name || !type) return NextResponse.json({ error: 'Thiếu dữ liệu' }, { status: 400 });

        let created;
        if (type === 'category') {
            created = await prisma.category.create({ data: { name } });
        } else if (type === 'major') {
            created = await prisma.major.create({ data: { name } });
        } else {
            return NextResponse.json({ error: 'Loại không hợp lệ' }, { status: 400 });
        }

        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                error: 'Lỗi server khi thêm mới',
                details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

// DELETE cho category hoặc major theo id
export async function DELETE(req: Request, { params }: { params: { type: string; id: string } }) {
    try {
        const user = await checkAdminAuth();
        if (!user) return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });

        const { type, id } = params;

        if (!id || !type) return NextResponse.json({ error: 'Thiếu dữ liệu' }, { status: 400 });

        if (type === 'category') {
            await prisma.category.delete({ where: { id } });
        } else if (type === 'major') {
            await prisma.major.delete({ where: { id } });
        } else {
            return NextResponse.json({ error: 'Loại không hợp lệ' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                error: 'Lỗi server khi xóa',
                details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}
