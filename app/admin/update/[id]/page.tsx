'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface PageData {
  id?: string;
  pageNumber: number;
  imageUrl: string;
  content: string;
}

interface Magazine {
  id: string;
  title: string;
  description: string | null;
  coverImage: string;
  publishDate: string;
  status: string;
  pages: PageData[];
}

export default function UpdateMagazinePage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    publishDate: '',
    status: 'DRAFT',
  });
  const [pages, setPages] = useState<PageData[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && params.id) {
      fetchMagazine(params.id as string);
    }
  }, [user, params.id]);

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

  const fetchMagazine = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/magazines/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMagazine(data);

        // Set form data
        setFormData({
          title: data.title,
          description: data.description || '',
          coverImage: data.coverImage,
          publishDate: new Date(data.publishDate).toISOString().split('T')[0],
          status: data.status,
        });

        // Set pages data
        setPages(data.pages.sort((a: any, b: any) => a.pageNumber - b.pageNumber));
      } else {
        toast.error('Không thể tải thông tin tạp chí');
        router.push('/admin/home');
      }
    } catch (error) {
      console.error('Error fetching magazine:', error);
      toast.error('Có lỗi xảy ra khi tải tạp chí');
      router.push('/admin/home');
    } finally {
      setInitialLoading(false);
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

    if (pages.length === 0) {
      toast.error('Vui lòng thêm ít nhất một trang');
      return;
    }

    // Validate all pages have image URLs
    const invalidPages = pages.filter(page => !page.imageUrl.trim());
    if (invalidPages.length > 0) {
      toast.error('Vui lòng nhập URL hình ảnh cho tất cả các trang');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/magazines/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          publishDate: new Date(formData.publishDate),
          pages,
        }),
      });

      if (response.ok) {
        toast.success('Cập nhật tạp chí thành công');
        router.push('/admin/home');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Có lỗi xảy ra khi cập nhật tạp chí');
      }
    } catch (error) {
      console.error('Error updating magazine:', error);
      toast.error('Có lỗi xảy ra khi cập nhật tạp chí');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user || !magazine) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy tạp chí</h2>
          <Button onClick={() => router.push('/admin/home')}>
            Quay lại trang chủ
          </Button>
        </div>
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
                Cập nhật tạp chí
              </h1>
              <p className="text-sm text-gray-500">
                Chỉnh sửa thông tin tạp chí: {magazine.title}
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
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập mô tả tạp chí"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImage">URL ảnh bìa *</Label>
                <Input
                  id="coverImage"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://example.com/cover-image.jpg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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
              {pages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Chưa có trang nào. Nhấn &quot;Thêm trang&quot; để bắt đầu.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pages.map((page, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <Badge variant="outline">Trang {page.pageNumber}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>URL hình ảnh *</Label>
                          <Input
                            value={page.imageUrl}
                            onChange={(e) => updatePage(index, 'imageUrl', e.target.value)}
                            placeholder="https://example.com/page-image.jpg"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Nội dung mô tả</Label>
                          <Input
                            value={page.content || ''}
                            onChange={(e) => updatePage(index, 'content', e.target.value)}
                            placeholder="Mô tả nội dung trang này"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              {loading ? 'Đang cập nhật...' : 'Cập nhật tạp chí'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}