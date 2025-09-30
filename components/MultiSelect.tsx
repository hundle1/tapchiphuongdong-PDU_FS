'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Option {
    id: string;
    name: string;
}

interface MultiSelectProps {
    label: string;
    options: Option[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}

export default function MultiSelect({
    label,
    options,
    selectedIds,
    onChange,
}: MultiSelectProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (id: string) => {
        if (!selectedIds.includes(id)) {
            onChange([...selectedIds, id]);
        }
    };

    const handleRemove = (id: string) => {
        onChange(selectedIds.filter((x) => x !== id));
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Select
                onOpenChange={setOpen}
                open={open}
                onValueChange={(value) => handleSelect(value)} // ✅ chọn qua onValueChange
            >
                <SelectTrigger>
                    <SelectValue placeholder={`Chọn ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                            {opt.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Hiển thị tags đã chọn */}
            <div className="flex flex-wrap gap-2 mt-2">
                {selectedIds.map((id) => {
                    const item = options.find((o) => o.id === id);
                    if (!item) return null;
                    return (
                        <span
                            key={id}
                            className="flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-full text-sm"
                        >
                            {item.name}
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemove(id)}
                                className="p-0 w-4 h-4 flex items-center justify-center text-gray-600 hover:text-red-600"
                            >
                                ×
                            </Button>
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
