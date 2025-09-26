'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const khoaList = [
    "Công nghệ thông tin",
    "Truyền thông đa phương tiện",
    "Thương mại điện tử",
    "Ngôn Ngữ Anh",
    "Ngôn Ngữ Trung",
    "Ngôn Ngữ Nhật",
    "Kinh tế",
    "Quản trị kinh doanh",
    "Tài chính – Ngân hàng",
    "Kế toán",
    "Quản trị du lịch và lữ hành",
    "Kiến trúc công trình",
    "Cơ điện tử",
    "Cơ điện điện tử"
]

interface FilterByKhoaProps {
    selectedKhoa: string | null
    onChange: (khoa: string | null) => void
}

export default function FilterByKhoa({ selectedKhoa, onChange }: FilterByKhoaProps) {
    return (
        <div className=" max-w-xs">
            <Select
                value={selectedKhoa || ""}
                onValueChange={(value) => onChange(value || null)}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn khoa để lọc" />
                </SelectTrigger>
                <SelectContent>
                    {khoaList.map((khoa, index) => (
                        <SelectItem key={khoa} value={khoa}>
                            {index} - {khoa}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
