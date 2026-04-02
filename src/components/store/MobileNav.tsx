"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, ShoppingCart, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";

const navItems = [
  { href: "/", icon: Home, label: "Trang chủ" },
  { href: "/san-pham", icon: Grid3X3, label: "Danh mục" },
  { href: "/gio-hang", icon: ShoppingCart, label: "Giỏ hàng" },
  { href: "/dang-nhap", icon: User, label: "Tài khoản" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const getItemCount = useCartStore((s) => s.getItemCount);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t md:hidden safe-area-pb">
      <div className="flex items-center justify-around py-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl relative transition-all ${
                isActive
                  ? "text-green-600"
                  : "text-gray-400 active:text-gray-600"
              }`}
            >
              {isActive && (
                <div className="absolute -top-1.5 w-6 h-1 bg-green-600 rounded-full" />
              )}
              <item.icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
              {item.href === "/gio-hang" && getItemCount() > 0 && (
                <Badge className="absolute -top-0.5 right-1 h-4 min-w-4 p-0 px-1 flex items-center justify-center text-[10px] bg-green-600 shadow-sm">
                  {getItemCount()}
                </Badge>
              )}
              <span className={`text-[10px] font-medium ${isActive ? "text-green-600" : ""}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
