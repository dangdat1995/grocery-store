"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Category } from "@/types";

interface CategoryBarProps {
  categories: Category[];
}

export default function CategoryBar({ categories }: CategoryBarProps) {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 py-3 min-w-max px-4">
        <Link
          href="/san-pham"
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
            pathname === "/san-pham"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Tất cả
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/danh-muc/${cat.slug}`}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              pathname === `/danh-muc/${cat.slug}`
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
