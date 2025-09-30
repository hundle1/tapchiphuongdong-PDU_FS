'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Image from 'next/image';
import CoverImagePicker from '@/components/CoverImagePicker';
import MultiSelect from '@/components/MultiSelect';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import FileUploader from '@/components/FileUploader';
import type { Accept } from "react-dropzone";

export default function AddNewMagazinePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [allCategories, setAllCategories] = useState<{ id: string; name: string }[]>([]);
  const [allMajors, setAllMajors] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    tieuDe: '',
    tenTacgia: 'Admin',
    moTa: '',
    anhBia: '',
    ngayXuatBan: new Date().toISOString().split('T')[0],
    categoryIds: [] as string[],
    majorIds: [] as string[],
    trangThai: 'DRAFT',
  });

  const [file, setFile] = useState<File | null>(null);
  useEffect(() => {
    checkAuth();
  }, []);

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

  useEffect(() => {
    fetchCategoriesAndMajors();
  }, []);

  const fetchCategoriesAndMajors = async () => {
    try {
      const [catRes, majorRes] = await Promise.all([
        fetch('/api/admin/options/category'),
        fetch('/api/admin/options/major'),
      ]);

      if (catRes.ok && majorRes.ok) {
        const categories = await catRes.json();
        const majors = await majorRes.json();
        setAllCategories(categories);
        setAllMajors(majors);
      } else {
        toast.error('Không thể tải danh mục/khoa');
      }
    } catch (error) {
      console.error('Lỗi load categories/majors', error);
      toast.error('Lỗi khi tải danh mục/khoa');
    }
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tieuDe.trim()) {
      toast.error('Vui lòng nhập tiêu đề tạp chí');
      return;
    }

    if (!formData.anhBia.trim()) {
      toast.error('Vui lòng nhập URL ảnh bìa');
      return;
    }

    if (!file) {
      toast.error('Vui lòng upload file PDF hoặc Word');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('tieuDe', formData.tieuDe);
      formDataToSend.append('tenTacGia', formData.tenTacgia || 'Admin');
      formDataToSend.append('moTa', formData.moTa);
      formDataToSend.append('anhBia', formData.anhBia);
      formDataToSend.append('ngayXuatBan', formData.ngayXuatBan);
      formDataToSend.append('trangThai', formData.trangThai);
      formData.categoryIds.forEach((id) => formDataToSend.append('categoryIds', id));
      formData.majorIds.forEach((id) => formDataToSend.append('majorIds', id));
      formDataToSend.append('file', file);


      const response = await fetch('/api/admin/magazines/', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success('Tạo tạp chí thành công');
        router.push('/admin/home');
      } else {
        let errorMessage = 'Có lỗi xảy ra khi tạo tạp chí';

        try {
          const error = await response.json();
          if (error?.error) errorMessage = error.error;
        } catch {
          // body không phải JSON hoặc rỗng
        }
        toast.error(errorMessage);
      }

    } catch (error) {
      console.error('Error creating magazine:', error);
      toast.error('Có lỗi xảy ra khi tạo tạp chí');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex justify-between items-center max-w-full mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex justify-between items-center h-20">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tạp Chí Phương Đông Management
              </h1>
              <div>
                <Badge className='cursor-not-allowed hover:bg-black'>
                  <Link href={'#'} className='cursor-not-allowed hover:bg-black'>Quay lại trang chủ</Link>
                </Badge>
                <Badge
                  className='text-neutral-700 mt-1 cursor-pointer bg-gray-200 hover:bg-white hover:text-black hover:border-gray-400 transparent '
                >
                  <Link href={'/admin'}>
                    &lt;- Quay lại trang admin
                  </Link>
                </Badge>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-4">
              <Badge variant={user?.role === 'SUPER_ADMIN' ? 'default' : 'secondary'} className='cursor-default'>
                Tạp chí sẽ ghi nhận tên thầy/cô &quot;{user?.name}&quot; là người tạo
              </Badge>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/admin/options')}
                >
                  Danh Mục hoặc Khoa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fetch('/api/admin/auth/logout').then(() => {
                      router.push('/admin/login');
                    });
                  }}
                >
                  Đăng xuất
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full px-4 sm:px-6 lg:px-8 py-8 mx-52">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* tiêu đề  */}
              <div>
                <Label htmlFor="categoryName">Chuyên mục</Label>
              </div>
              <div className="space-y-4">
                <Label htmlFor="tieuDe">Tiêu đề tạp chí *</Label>
                <Input
                  id="tieuDe"
                  value={formData.tieuDe}
                  onChange={(e) =>
                    setFormData({ ...formData, tieuDe: e.target.value })
                  }
                  placeholder="Nhập tiêu đề tạp chí"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                {/* Cột trái */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenTacGia">Tên tác giả*</Label>
                    <Input
                      id="tenTacGia"
                      value={formData.tenTacgia}
                      onChange={(e) =>
                        setFormData({ ...formData, tenTacgia: e.target.value })
                      }
                      placeholder="Nhập tên tác giả"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ngayXuatBan">Ngày xuất bản</Label>
                    <Input
                      id="ngayXuatBan"
                      type="date"
                      value={formData.ngayXuatBan}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ngayXuatBan: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-6'>
                    <MultiSelect
                      label="Danh mục sách"
                      options={allCategories} // [{id, name}, ...]
                      selectedIds={formData.categoryIds}
                      onChange={(ids) => setFormData({ ...formData, categoryIds: ids })}
                    />
                    <MultiSelect
                      label="Khoa/Ngành"
                      options={allMajors}
                      selectedIds={formData.majorIds}
                      onChange={(ids) => setFormData({ ...formData, majorIds: ids })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trangThai">Trạng thái</Label>
                    <Select
                      value={formData.trangThai}
                      onValueChange={(value) =>
                        setFormData({ ...formData, trangThai: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Bản nháp</SelectItem>
                        <SelectItem value="PUBLISHED">Xuất bản</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="moTa">Mô tả</Label>
                    <Textarea
                      id="moTa"
                      value={formData.moTa}
                      onChange={(e) =>
                        setFormData({ ...formData, moTa: e.target.value })
                      }
                      placeholder="Nhập mô tả tạp chí"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Cột phải */}
                <div className="flex flex-col space-y-4">
                  <CoverImagePicker
                    value={formData.anhBia}
                    onChange={(val) => setFormData({ ...formData, anhBia: val })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Tải lên file PDF/Word</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploader
                label="Chọn file *"
                accept={{
                  'application/pdf': [],
                  'application/msword': [],
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': []
                }}
                file={file}
                onFileChange={setFile}
              />
            </CardContent>
          </Card>
          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/home')}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Đang tạo...' : 'Tạo tạp chí'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
