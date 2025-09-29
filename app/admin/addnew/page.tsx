'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AddNewMagazinePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tieuDe: '',
    moTa: '',
    anhBia: '',
    publishDate: new Date().toISOString().split('T')[0],
    trangThai: 'draft',
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
        router.push('/admin/login'); useState
      }
    } catch (error) {
      router.push('/admin/login');
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
      formDataToSend.append('moTa', formData.moTa);
      formDataToSend.append('anhBia', formData.anhBia);
      formDataToSend.append('publishDate', formData.publishDate);
      formDataToSend.append('trangThai', formData.trangThai);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/home')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Thêm tạp chí mới
              </h1>
              <p className="text-sm text-gray-500">
                Tạo tạp chí mới cho hệ thống
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề tạp chí *</Label>
                  <Input
                    id="title"
                    value={formData.tieuDe}
                    onChange={(e) =>
                      setFormData({ ...formData, tieuDe: e.target.value })
                    }
                    placeholder="Nhập tiêu đề tạp chí"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publishDate">Ngày xuất bản</Label>
                  <Input
                    id="publishDate"
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publishDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label htmlFor="anhBia">URL ảnh bìa *</Label>
                <Input
                  id="anhBia"
                  value={formData.anhBia}
                  onChange={(e) =>
                    setFormData({ ...formData, anhBia: e.target.value })
                  }
                  placeholder="https://example.com/cover-image.jpg"
                  required
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
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Tải lên file PDF/Word</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Chọn file *</Label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                />
                {file && (
                  <p className="text-sm text-gray-600">
                    File đã chọn: <span className="font-medium">{file.name}</span>
                  </p>
                )}
              </div>
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
