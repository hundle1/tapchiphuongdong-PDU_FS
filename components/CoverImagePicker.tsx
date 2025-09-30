"use client";

import { useState } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CoverImagePickerProps {
    value: string; // link ảnh (URL hoặc local object URL)
    onChange: (value: string) => void;
}

export default function CoverImagePicker({ value, onChange }: CoverImagePickerProps) {
    const [tab, setTab] = useState<"local" | "url">("local");

    return (
        <div className="flex flex-col space-y-4">
            {/* Tabs */}
            <div className="flex space-x-2 border-b">
                <button
                    type="button"
                    onClick={() => setTab("local")}
                    className={`px-4 py-2 text-sm rounded-t-md ${tab === "local"
                        ? "bg-white border border-b-0 border-gray-400 font-medium"
                        : "bg-gray-100 text-gray-600"
                        }`}
                >
                    Ảnh bìa local
                </button>
                <button
                    type="button"
                    onClick={() => setTab("url")}
                    className={`px-4 py-2 text-sm rounded-t-md ${tab === "url"
                        ? "bg-white border border-b-0 border-gray-400 font-medium"
                        : "bg-gray-100 text-gray-600"
                        }`}
                >
                    Ảnh bìa URL
                </button>
            </div>

            {/* Input theo tab */}
            {tab === "local" ? (
                <div className="space-y-2">
                    <Label htmlFor="anhBiaLocal">Chọn ảnh từ máy</Label>
                    <Input
                        id="anhBiaLocal"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const url = URL.createObjectURL(file);
                                onChange(url);
                            }
                        }}
                        className="w-full h-10"
                    />
                </div>
            ) : (
                <div className="space-y-2">
                    <Label htmlFor="anhBiaUrl">Nhập link ảnh bìa</Label>
                    <Input
                        id="anhBiaUrl"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="https://example.com/cover.jpg"
                        className="w-full h-10"
                    />
                </div>
            )}

            {/* Preview ảnh */}
            <div className="flex items-center justify-center gap-4">
                <div className="relative w-[600px] h-[560px] border rounded-md overflow-hidden shadow bg-gray-50 flex items-center justify-center">
                    {value ? (
                        <>
                            <Image
                                src={value}
                                alt="Ảnh bìa preview"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                            <button
                                type="button"
                                onClick={() => onChange("")}
                                className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-black text-white border border-white shadow hover:bg-red-600"
                            >
                                ✕
                            </button>
                        </>
                    ) : (
                        <p className="text-xs text-gray-400">Chưa có ảnh bìa</p>
                    )}
                </div>
            </div>
        </div>
    );
}
