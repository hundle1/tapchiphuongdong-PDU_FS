import { NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();

    const { email, password } = await request.json();
    console.log("📩 [API] Login request body:", { email, password });

    if (!email || !password) {
      console.warn("⚠️ Thiếu email hoặc password");
      return NextResponse.json(
        { error: 'Email và mật khẩu là bắt buộc' },
        { status: 400 }
      );
    }

    let user;
    try {
      user = await authenticateUser(email, password);
      console.log("🔍 [API] authenticateUser trả về:", user);
    } catch (err) {
      console.error("❌ [API] Lỗi trong authenticateUser:", err);
      return NextResponse.json(
        { error: 'Lỗi khi xác thực tài khoản' },
        { status: 500 }
      );
    }

    if (!user) {
      console.warn("🚫 Không tìm thấy user hoặc sai mật khẩu");
      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.warn("🚫 User không có quyền:", user.role);
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 403 }
      );
    }

    let token;
    try {
      token = generateToken(user.id, user.role);
      console.log("✅ [API] Token đã tạo:", token);
    } catch (err) {
      console.error("❌ [API] Lỗi khi generateToken:", err);
      return NextResponse.json(
        { error: 'Không thể tạo token' },
        { status: 500 }
      );
    }

    try {
      cookieStore.set("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      });
      console.log("🍪 [API] Cookie đã set thành công");
    } catch (err) {
      console.error("❌ [API] Lỗi khi set cookie:", err);
      return NextResponse.json(
        { error: 'Không thể lưu cookie' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ [API] Login error ngoài cùng:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi đăng nhập 500' },
      { status: 500 }
    );
  }
}
