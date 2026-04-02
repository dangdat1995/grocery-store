"use client";

import Link from "next/link";

interface Brand {
  name: string;
  emoji: string;
  query: string;
}

const BRANDS: Brand[] = [
  { name: "Vinamilk", emoji: "🥛", query: "vinamilk" },
  { name: "TH True Milk", emoji: "🧃", query: "th" },
  { name: "Coca-Cola", emoji: "🥤", query: "coca" },
  { name: "Pepsi", emoji: "🫧", query: "pepsi" },
  { name: "Nestle", emoji: "☕", query: "nestle" },
  { name: "Unilever", emoji: "🧴", query: "unilever" },
  { name: "P&G", emoji: "🧹", query: "p&g" },
  { name: "Masan", emoji: "🍜", query: "masan" },
  { name: "Vissan", emoji: "🥩", query: "vissan" },
  { name: "Kinh Đô", emoji: "🍪", query: "kinh do" },
  { name: "Acecook", emoji: "🍝", query: "acecook" },
  { name: "Dutch Lady", emoji: "🐄", query: "dutch lady" },
  { name: "Orion", emoji: "🍫", query: "orion" },
  { name: "Ajinomoto", emoji: "🧂", query: "ajinomoto" },
  { name: "Chinsu", emoji: "🫘", query: "chinsu" },
  { name: "Bibica", emoji: "🎂", query: "bibica" },
];

export default function BrandShowcase() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-extrabold text-gray-800">Thương hiệu nổi bật</h3>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-8 gap-2">
        {BRANDS.map((brand) => (
          <Link
            key={brand.name}
            href={`/tim-kiem?q=${encodeURIComponent(brand.query)}`}
            className="flex flex-col items-center gap-1 p-2 rounded-xl border border-gray-100 hover:border-green-300 hover:bg-green-50 hover:shadow-sm transition-all group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">{brand.emoji}</span>
            <span className="text-[10px] font-medium text-gray-600 group-hover:text-green-600 text-center leading-tight">{brand.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
