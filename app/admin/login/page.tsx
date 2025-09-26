// \app\admin\login\page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log("📝 Form data gửi đi:", formData); // 👉 log input trước khi gửi

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("📌 API response:", response.status, data); // 👉 log kết quả trả về

      if (response.ok) {
        toast.success('Đăng nhập thành công');
        router.push('/admin');
      } else {
        toast.error(data.error || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('❌ Login error (client):', error);
      toast.error('Có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-orange-800">
            Admin Login
          </CardTitle>
          <CardDescription>
            Đăng nhập vào trang quản trị Tạp Chí Phương Đông
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@tapchiphuongdong.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-700 font-medium mb-2">Thông tin đăng nhập mẫu:</p>
            <div className="text-xs text-orange-600 space-y-1">
              <p><strong>Super Admin:</strong> superadmin@tapchiphuongdong.com / superadmin123</p>
              <p><strong>Admin:</strong> admin@tapchiphuongdong.com / admin123</p>
            </div>
          </div>

          <Button className='mt-6 w-full bg-gray-200 hover:bg-gray-300' variant="outline">
            <a href="/" className="w-full text-center">
              Quay lại trang chủ
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}