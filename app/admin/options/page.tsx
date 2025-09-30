'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import router from 'next/router';

interface CategoryOrMajor {
    id: string;
    name: string;
}

export default function OptionsPage() {
    const [categories, setCategories] = useState<CategoryOrMajor[]>([]);
    const [majors, setMajors] = useState<CategoryOrMajor[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'category' | 'major'>('category');
    const [modalName, setModalName] = useState('');

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/options');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
                setMajors(data.majors || []);
            } else {
                toast.error('Không thể tải dữ liệu');
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi server khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (type: 'category' | 'major', id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa?')) return;
        try {
            const res = await fetch(`/api/admin/options/${type}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Xóa thành công');
                fetchOptions();
            } else {
                toast.error('Không thể xóa');
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi xóa');
        }
    };

    const handleEdit = (type: 'category' | 'major', id: string) => {
        const newName = prompt('Nhập tên mới');
        if (!newName) return;
        fetch(`/api/admin/options/${type}/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name: newName }),
            headers: { 'Content-Type': 'application/json' },
        }).then(res => {
            if (res.ok) {
                toast.success('Cập nhật thành công');
                fetchOptions();
            } else toast.error('Không thể cập nhật');
        }).catch(() => toast.error('Lỗi server'));
    };

    const openModal = (type: 'category' | 'major') => {
        setModalType(type);
        setModalName('');
        setShowModal(true);
    };

    const handleModalSubmit = async () => {
        if (!modalName.trim()) {
            toast.error('Tên không được để trống');
            return;
        }
        try {
            const res = await fetch(`/api/admin/options/${modalType}`, {
                method: 'POST',
                body: JSON.stringify({ name: modalName }),
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                toast.success(`Thêm ${modalType === 'category' ? 'danh mục' : 'khoa/ngành'} thành công`);
                setShowModal(false);
                fetchOptions();
            } else {
                toast.error('Không thể thêm mới');
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi server');
        }
    };

    return (
        <>
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-20">
                    <div className="flex justify-between items-center h-20">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Tạp Chí Phương Đông Management
                            </h1>
                            <div className="mt-1 flex flex-wrap gap-2">
                                <Badge className='cursor-not-allowed hover:bg-black'>
                                    <Link href={'#'} className='cursor-not-allowed hover:bg-black'>Quay lại trang chủ</Link>
                                </Badge>
                                <Badge className='text-neutral-700 cursor-pointer bg-gray-200 hover:bg-white hover:text-black hover:border-gray-400'>
                                    <Link href={'/admin'}>
                                        &lt;- Quay lại trang admin
                                    </Link>
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="min-h-screen bg-gray-100 p-8">
                <h1 className="text-2xl font-bold mb-6">Quản lý Danh mục & Khoa/Ngành</h1>
                <div className="grid grid-cols-2 gap-6">
                    {/* Categories */}
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle>Danh mục</CardTitle>
                            <Button size="sm" onClick={() => openModal('category')}>
                                <Plus className="h-4 w-4 mr-2" /> Thêm mới
                            </Button>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tên danh mục</TableHead>
                                        <TableHead>Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.map(cat => (
                                        <TableRow key={cat.id}>
                                            <TableCell>{cat.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEdit('category', cat.id)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleDelete('category', cat.id)}>
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {categories.length === 0 && <p className="text-center py-4 text-gray-500">Chưa có danh mục nào</p>}
                        </CardContent>
                    </Card>

                    {/* Majors */}
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle>Khoa/Ngành</CardTitle>
                            <Button size="sm" onClick={() => openModal('major')}>
                                <Plus className="h-4 w-4 mr-2" /> Thêm mới
                            </Button>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tên khoa/ngành</TableHead>
                                        <TableHead>Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {majors.map(maj => (
                                        <TableRow key={maj.id}>
                                            <TableCell>{maj.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEdit('major', maj.id)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleDelete('major', maj.id)}>
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {majors.length === 0 && <p className="text-center py-4 text-gray-500">Chưa có khoa/ngành nào</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-black"
                            onClick={() => setShowModal(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <h2 className="text-xl font-bold mb-4">
                            Thêm {modalType === 'category' ? 'Danh mục' : 'Khoa/Ngành'}
                        </h2>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                            placeholder={`Nhập tên ${modalType === 'category' ? 'danh mục' : 'khoa/ngành'} mới`}
                            value={modalName}
                            onChange={(e) => setModalName(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowModal(false)}>Hủy</Button>
                            <Button onClick={handleModalSubmit}>Thêm</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
