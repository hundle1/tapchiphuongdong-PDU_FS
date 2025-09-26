'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { MagazineReader } from '@/components/magazine-reader';
import { useLoading } from '@/components/loading-provider';
import { Skeleton } from '@/components/ui/skeleton';

interface Page {
  id: string;
  pageNumber: number;
  imageUrl: string;
  content: string | null;
}

interface Magazine {
  id: string;
  title: string;
  description: string | null;
  coverImage: string;
  publishDate: Date;
  status: string;
  pages: Page[];
}

export default function MagazineDetailPage() {
  const params = useParams();
  const { setLoading, setProgress } = useLoading();
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [loading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchMagazine(params.id as string);
    }
  }, [params.id]);

  const fetchMagazine = async (id: string) => {
    try {
      setLoading(true);
      setProgress(10);

      const response = await fetch(`/api/magazines/${id}`);
      setProgress(50);

      if (!response.ok) {
        throw new Error('Không thể tải tạp chí');
      }

      const data = await response.json();
      setProgress(80);

      setMagazine(data);
      setProgress(100);

      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 500);
    } catch (error) {
      console.error('Error fetching magazine:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      setLoading(false);
      setProgress(0);
    } finally {
      setPageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="mb-6">
            <Skeleton className="h-12 w-96 mb-4" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="bg-gradient-to-b from-amber-50 to-orange-50 rounded-lg shadow-2xl p-8">
            <Skeleton className="aspect-[3/4] max-w-2xl mx-auto" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !magazine) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {error || 'Không tìm thấy tạp chí'}
            </h1>
            <p className="text-gray-600">
              Tạp chí không tồn tại hoặc đã bị xóa.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="py-4">
        {magazine?.pages && magazine.pages.length > 0 ? (
          <MagazineReader
            pages={[...magazine.pages].sort((a, b) => a.pageNumber - b.pageNumber)}
            title={magazine.title}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[400px] text-gray-500">
            Chưa có trang nào để hiển thị
          </div>
        )}
      </main>
    </div>

  );
}