import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/navbar';
import { MagazineCard } from '@/components/magazine-card';
import { Card, CardContent } from '@/components/ui/card';
import HeroSkeleton from '@/components/HeroSkeleton';
import { Footer } from 'react-day-picker';

async function getMagazines() {
  const magazines = await prisma.magazine.findMany({
    where: {
      trangThai: 'PUBLISHED'
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 8
  });

  return magazines;
}

function MagazineCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="aspect-[3/4] bg-gray-200 rounded-t-lg"></div>
      <CardContent className="p-4">
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </CardContent>
    </Card>
  );
}

export default async function HomePage() {
  const magazines = await getMagazines();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <Navbar />
      <HeroSkeleton />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold text-orange-800 mb-4">
            Tạp Chí Phương Đông
          </h1>
          <p className="text-xl text-orange-600 max-w-2xl mx-auto mb-8">
            Nơi lưu giữ và chia sẻ văn hóa truyền thống phương đông.
            Khám phá kho tàng tri thức và nghệ thuật qua từng trang sách.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-red-400 mx-auto"></div>
        </section>

        {/* Featured Magazines */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-orange-800">
              Tạp chí mới nhất
            </h2>
          </div>

          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <MagazineCardSkeleton key={i} />
              ))}
            </div>
          }>
            {magazines.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {magazines.map((magazine) => (
                  <MagazineCard
                    key={magazine.id}
                    magazine={{
                      id: magazine.id,
                      title: magazine.tieuDe,
                      description: magazine.moTa,
                      coverImage: magazine.anhBia ?? '',
                      publishDate: magazine.createdAt,
                      status: magazine.trangThai,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">
                  Chưa có tạp chí nào được xuất bản
                </p>
              </div>
            )}
          </Suspense>
        </section>

        {/* About Section */}
        <section className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-orange-800 mb-4">
            Về Tạp Chí Phương Đông
          </h3>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Tạp chí Phương Đông là nền tảng số hóa văn hóa truyền thống, nơi bạn có thể
            khám phá những giá trị văn hóa phương đông qua các bài viết chuyên sâu,
            hình ảnh đẹp mắt và trải nghiệm đọc tương tác độc đáo.
          </p>
        </section>
      </main>
    </div>
  );
}