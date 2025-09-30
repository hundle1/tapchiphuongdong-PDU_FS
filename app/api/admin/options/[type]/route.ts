// app/api/admin/options/[type]/route.ts
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

// GET: lấy danh sách theo type
export async function GET(req: Request, { params }: { params: { type: string } }) {
    try {
        const user = await checkAdminAuth();
        if (!user) return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });

        const { type } = params;
        let data;

        if (type === 'category') {
            data = await prisma.category.findMany({ select: { id: true, name: true } });
        } else if (type === 'major') {
            data = await prisma.major.findMany({ select: { id: true, name: true } });
        } else {
            return NextResponse.json({ error: 'Loại không hợp lệ' }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                error: 'Lỗi server khi lấy dữ liệu',
                details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

// POST: thêm mới theo type
export async function POST(req: Request, { params }: { params: { type: string } }) {
    try {
        const user = await checkAdminAuth();
        if (!user) return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });

        const { type } = params;
        const body = await req.json();
        const { name } = body;

        if (!name) return NextResponse.json({ error: 'Thiếu tên' }, { status: 400 });

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
            { error: 'Lỗi server khi thêm mới', details: error instanceof Error ? error.message : undefined },
            { status: 500 }
        );
    }
}
