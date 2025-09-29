'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { MagazineCard } from '@/components/magazine-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Magazine {
  id: string;
  tieuDe: string;
  moTa: string | null;
  anhBia: string;
  createdAt: Date;
  trangThai: string;
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

export default function MagazineListPage() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [filteredMagazines, setFilteredMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  useEffect(() => {
    fetchMagazines();
  }, []);

  useEffect(() => {
    filterMagazines();
  }, [magazines, searchTerm, sortBy]);

  const fetchMagazines = async () => {
    try {
      const response = await fetch('/api/magazines');
      const data = await response.json();
      setMagazines(data);
    } catch (error) {
      console.error('Error fetching magazines:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMagazines = () => {
    let filtered = magazines.filter(magazine =>
      magazine.trangThai === 'PUBLISHED' &&
      magazine.tieuDe.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort magazines
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'tieuDe':
          return a.tieuDe.localeCompare(b.tieuDe);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredMagazines(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-800 mb-2">
            Danh sách tạp chí
          </h1>
          <p className="text-orange-600">
            Khám phá toàn bộ bộ sưu tập tạp chí văn hóa phương đông
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm tạp chí..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Ngày xuất bản</SelectItem>
                <SelectItem value="tieuDe">Tiêu đề</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Magazine Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <MagazineCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredMagazines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMagazines.map((magazine) => (
              <MagazineCard key={magazine.id} magazine={magazine} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'Không tìm thấy tạp chí nào phù hợp' : 'Chưa có tạp chí nào được xuất bản'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}