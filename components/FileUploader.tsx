"use client";

import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Label } from "@/components/ui/label";
import type { Accept } from "react-dropzone";

interface FileUploaderProps {
    label?: string;
    accept?: Accept;
    file: File | null;
    onFileChange: (file: File | null) => void;
}

export default function FileUploader({
    label = "Chọn file",
    accept = {
        "application/pdf": [".pdf"],
        "application/msword": [".doc"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
    },
    file,
    onFileChange,
}: FileUploaderProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles && acceptedFiles.length > 0) {
                onFileChange(acceptedFiles[0]);
            }
        },
        [onFileChange]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        multiple: false,
    });

    // Cho phép Ctrl + V để paste file
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (e.clipboardData?.files.length) {
                const pastedFile = e.clipboardData.files[0];
                if (pastedFile) {
                    onFileChange(pastedFile);
                }
            }
        };
        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, [onFileChange]);

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
            ${isDragActive ? "border-orange-500 bg-orange-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"}
        `}
            >
                <input {...getInputProps()} />
                {file ? (
                    <p className="text-sm text-gray-700">
                        File đã chọn: <span className="font-medium">{file.name}</span>
                    </p>
                ) : (
                    <p className="text-sm text-gray-500">
                        Kéo & thả file vào đây, hoặc click để chọn <br />
                        (Hỗ trợ Ctrl + V để dán file từ clipboard)
                    </p>
                )}
            </div>
        </div>
    );
}
