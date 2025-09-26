'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface PageData {
  pageNumber: number;
  imageUrl: string;
  content: string;
}

export default function AddNewMagazinePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    publishDate: new Date().toISOString().split('T')[0],
    status: 'DRAFT',
  });

  // luôn khởi tạo với 1 page (trang bìa)
  const [pages, setPages] = useState<PageData[]>([
    { pageNumber: 1, imageUrl: '', content: '' },
  ]);

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

  const addPage = () => {
    const newPage: PageData = {
      pageNumber: pages.length + 1,
      imageUrl: '',
      content: '',
    };
    setPages([...pages, newPage]);
  };

  const removePage = (index: number) => {
    // không cho xóa trang 1 (bìa)
    if (index === 0) return;

    const updatedPages = pages.filter((_, i) => i !== index);
    // Renumber pages
    const renumberedPages = updatedPages.map((page, i) => ({
      ...page,
      pageNumber: i + 1,
    }));
    setPages(renumberedPages);
  };

  const updatePage = (index: number, field: keyof PageData, value: string) => {
    const updatedPages = pages.map((page, i) =>
      i === index ? { ...page, [field]: value } : page
    );
    setPages(updatedPages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề tạp chí');
      return;
    }

    if (!formData.coverImage.trim()) {
      toast.error('Vui lòng nhập URL ảnh bìa');
      return;
    }

    // validate page 2+ phải có ảnh
    const invalidPages = pages.filter(
      (page, i) => i > 0 && !page.imageUrl.trim()
    );
    if (invalidPages.length > 0) {
      toast.error('Vui lòng nhập URL hình ảnh cho tất cả các trang từ trang 2 trở đi');
      return;
    }

    setLoading(true);

    try {
      // đồng bộ coverImage vào page 1
      const finalPages = pages.map((page, i) =>
        i === 0 ? { ...page, imageUrl: formData.coverImage } : page
      );

      const response = await fetch('/api/admin/magazines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          publishDate: new Date(formData.publishDate),
          pages: finalPages,
        }),
      });

      if (response.ok) {
        toast.success('Tạo tạp chí thành công');
        router.push('/admin/home');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Có lỗi xảy ra khi tạo tạp chí');
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
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
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
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Nhập mô tả tạp chí"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImage">URL ảnh bìa *</Label>
                <Input
                  id="coverImage"
                  value={formData.coverImage}
                  onChange={(e) =>
                    setFormData({ ...formData, coverImage: e.target.value })
                  }
                  placeholder="https://example.com/cover-image.jpg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
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

          {/* Pages Management */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Quản lý trang ({pages.length} trang)</CardTitle>
                <Button type="button" onClick={addPage} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm trang
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pages.map((page, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <Badge variant="outline">Trang {page.pageNumber}</Badge>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {index === 0 ? (
                      <div className="text-sm text-gray-600">
                        Trang 1 sẽ luôn dùng ảnh bìa đã nhập:{" "}
                        <span className="font-medium">
                          {formData.coverImage || "(chưa có)"}
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>URL hình ảnh *</Label>
                          <Input
                            value={page.imageUrl}
                            onChange={(e) =>
                              updatePage(index, "imageUrl", e.target.value)
                            }
                            placeholder="https://example.com/page-image.jpg"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Nội dung mô tả</Label>
                          <Input
                            value={page.content}
                            onChange={(e) =>
                              updatePage(index, "content", e.target.value)
                            }
                            placeholder="Mô tả nội dung trang này"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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
