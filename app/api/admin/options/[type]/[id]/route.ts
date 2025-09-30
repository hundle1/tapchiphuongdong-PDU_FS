// app/api/admin/options/[type]/[id]/route.ts
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

// PUT: cập nhật name
export async function PUT(req: Request, { params }: { params: { type: string; id: string } }) {
    try {
        const user = await checkAdminAuth();
        if (!user) return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });

        const { type, id } = params;
        const body = await req.json();
        const { name } = body;

        if (!name) return NextResponse.json({ error: 'Thiếu tên mới' }, { status: 400 });

        let updated;
        if (type === 'category') {
            updated = await prisma.category.update({ where: { id }, data: { name } });
        } else if (type === 'major') {
            updated = await prisma.major.update({ where: { id }, data: { name } });
        } else {
            return NextResponse.json({ error: 'Loại không hợp lệ' }, { status: 400 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Lỗi server khi cập nhật', details: error instanceof Error ? error.message : undefined },
            { status: 500 }
        );
    }
}

// DELETE: xóa theo id
export async function DELETE(req: Request, { params }: { params: { type: string; id: string } }) {
    try {
        const user = await checkAdminAuth();
        if (!user) return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 });

        const { type, id } = params;

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
            { error: 'Lỗi server khi xóa', details: error instanceof Error ? error.message : undefined },
            { status: 500 }
        );
    }
}
