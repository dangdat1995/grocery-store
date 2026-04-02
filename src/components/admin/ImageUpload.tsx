"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  maxFiles?: number;
}

export default function ImageUpload({
  value = [],
  onChange,
  folder = "products",
  maxFiles = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (isDemo) {
        // Demo: create fake URLs from file names
        const fakeUrls = acceptedFiles.map(
          (f) => `https://placehold.co/400x400/e2e8f0/64748b?text=${encodeURIComponent(f.name.split(".")[0])}`
        );
        onChange([...value, ...fakeUrls].slice(0, maxFiles));
        toast.info("Demo: Kết nối Supabase để upload thật");
        return;
      }

      setUploading(true);
      const newUrls: string[] = [];

      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        try {
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await res.json();
          if (res.ok && data.url) {
            newUrls.push(data.url);
          } else {
            toast.error(data.error || "Lỗi upload");
          }
        } catch {
          toast.error("Lỗi upload ảnh");
        }
      }

      if (newUrls.length > 0) {
        onChange([...value, ...newUrls].slice(0, maxFiles));
        toast.success(`Đã upload ${newUrls.length} ảnh`);
      }
      setUploading(false);
    },
    [value, onChange, folder, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"] },
    maxFiles: maxFiles - value.length,
    maxSize: 5 * 1024 * 1024,
    disabled: uploading || value.length >= maxFiles,
  });

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {value.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded-md font-medium">
                  Chính
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      {value.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:border-green-400 hover:bg-green-50/50"
          } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Đang upload...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              {isDragActive ? (
                <ImageIcon className="w-8 h-8 text-green-500" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
              <p className="text-sm">
                {isDragActive ? "Thả ảnh vào đây" : "Kéo thả ảnh hoặc nhấn để chọn"}
              </p>
              <p className="text-xs text-gray-300">
                JPG, PNG, WebP, GIF - Tối đa 5MB - Còn {maxFiles - value.length} ảnh
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
