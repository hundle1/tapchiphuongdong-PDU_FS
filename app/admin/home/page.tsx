'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Eye, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import Link from 'next/link';
import FilterByKhoa from '@/components/FilterByKhoa';
import Image from 'next/image';

interface Magazine {
  id: string;
  tieuDe: string;
  moTa: string | null;
  anhBia: string;
  trangThai: string;
  soTrang: number | null;
  createdAt: Date;
  TaiKhoanNguoiDung: {
    name: string | null;
    email: string;
  };
  major: string;
  pages: { id: string }[];
}

export default function AdminHomePage() {
  const router = useRouter();
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMagazines();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const fetchMagazines = async () => {
    try {
      const response = await fetch('/api/admin/magazines');
      if (response.ok) {
        const data = await response.json();
        setMagazines(data);
      }
    } catch (error) {
      console.error('Error fetching magazines:', error);
      toast.error('Không thể tải danh sách tạp chí');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tạp chí này?')) return;

    try {
      const response = await fetch(`/api/admin/magazines/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Xóa tạp chí thành công');
        fetchMagazines();
      } else {
        toast.error('Không thể xóa tạp chí');
      }
    } catch (error) {
      console.error('Error deleting magazine:', error);
      toast.error('Có lỗi xảy ra khi xóa tạp chí');
    }
  };

  const logout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const [selectedKhoa, setSelectedKhoa] = useState<string | null>(null)

  const filteredMagazines = magazines.filter((magazine) => {
    const matchSearch = magazine.tieuDe.toLowerCase().includes(searchTerm.toLowerCase())
    const matchKhoa = selectedKhoa ? magazine.major === selectedKhoa : true
    return matchSearch && matchKhoa
  })
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex justify-between items-center h-20">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tạp Chí Phương Đông Management
              </h1>
              <Badge
                className='text-neutral-700 mt-1 cursor-pointer bg-gray-200 hover:bg-white hover:text-black hover:border-gray-400 transparent '
                variant={user?.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}
              >
                <Link href={'/'}>
                  &lt;- Quay lại trang chủ
                </Link>
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={user?.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>
                Thầy/cô đang đăng nhập với tài khoản {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
              </Badge>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/admin/options')}
                >
                  Danh mục & Khoa
                </Button>
                {user?.role === 'SUPER_ADMIN' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/admin/role-management')}
                  >
                    Quản lý Role
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={logout}>
                  Đăng xuất
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng số tạp chí
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{magazines.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Đã xuất bản
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {magazines.filter(m => m.trangThai === 'PUBLISHED').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Bản nháp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {magazines.filter(m => m.trangThai === 'DRAFT').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Magazine Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Danh sách tạp chí đã tải lên</CardTitle>
              <Button
                onClick={() => router.push('/admin/addnew')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm tạp chí mới
              </Button>
            </div>
            <div className="flex items-center space-x-4 mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm tạp chí..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className='w-96 '>
                <FilterByKhoa selectedKhoa={selectedKhoa} onChange={setSelectedKhoa} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Ảnh bìa</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Số trang</TableHead>
                    <TableHead>Ngày xuất bản</TableHead>
                    <TableHead>Tác giả</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMagazines.map((magazine) => (
                    <TableRow key={magazine.id}>
                      <TableCell className="font-medium">
                        {magazine.tieuDe}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Image
                          src={magazine.anhBia && magazine.anhBia.trim() !== ""
                            ? magazine.anhBia
                            : "/placeholder-magazine.jpg"}
                          alt={magazine.tieuDe || "Magazine cover"}
                          width={80}
                          height={100}
                          className="object-cover rounded-md"
                          style={{ objectFit: 'cover', borderRadius: '0.375rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={magazine.trangThai === 'PUBLISHED' ? 'default' : 'secondary'}>
                          {magazine.trangThai === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {magazine.soTrang || magazine.pages.length}
                      </TableCell>
                      <TableCell>{magazine.TaiKhoanNguoiDung.name || magazine.TaiKhoanNguoiDung.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/magazine/${magazine.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/update/${magazine.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(magazine.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredMagazines.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchTerm ? 'Không tìm thấy tạp chí nào phù hợp' : 'Chưa có tạp chí nào'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div >
  );
}