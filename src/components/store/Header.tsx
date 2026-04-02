"use client";

import Link from "next/link";
import { ShoppingCart, Phone, Search, User, Menu, MapPin, Package, ChevronDown, Check, Building2, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { STORE_NAME, STORE_PHONE } from "@/lib/constants";
import { useCartStore } from "@/stores/cart-store";
import { useBranchStore } from "@/stores/branch-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);
  const branchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const getItemCount = useCartStore((s) => s.getItemCount);
  const { selectedBranch, branches, selectBranch } = useBranchStore();
  const storeName = useSettingsStore((s) => s.settings.store_name) || STORE_NAME;
  const storePhone = useSettingsStore((s) => s.settings.store_phone) || STORE_PHONE;
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (branchRef.current && !branchRef.current.contains(e.target as Node)) setBranchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? "shadow-md" : "border-b border-gray-100"}`}>
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-extrabold text-sm text-gray-800 leading-none">{storeName}</h1>
              <p className="text-[9px] text-gray-400 mt-0.5">Chợ tươi tại nhà</p>
            </div>
          </Link>

          {/* Branch selector */}
          {branches.length > 0 && (
            <div ref={branchRef} className="relative hidden lg:block">
              <button onClick={() => setBranchOpen(!branchOpen)} className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-green-600 transition-colors border rounded-lg px-2.5 py-1.5">
                <MapPin className="w-3 h-3 text-green-500" />
                <span className="font-medium max-w-[140px] truncate">{selectedBranch?.name || "Chọn chi nhánh"}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${branchOpen ? "rotate-180" : ""}`} />
              </button>
              {branchOpen && (
                <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-2xl border z-[60] min-w-[260px] py-1">
                  <p className="px-3 py-1.5 text-[10px] text-gray-400 font-semibold uppercase">Chi nhánh mua hàng</p>
                  {branches.map((b: any) => (
                    <button
                      key={b.id}
                      onClick={() => { selectBranch(b); setBranchOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs hover:bg-green-50 transition-colors ${selectedBranch?.id === b.id ? "text-green-700 bg-green-50 font-semibold" : "text-gray-700"}`}
                    >
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{b.name}</p>
                        <p className="text-[10px] text-gray-400">{b.address}, {b.district}</p>
                      </div>
                      {selectedBranch?.id === b.id && <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm rau, thịt, cá, trái cây..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 rounded-full border-gray-200 bg-gray-50 pl-9 pr-20 text-sm focus:bg-white focus:border-green-400 focus-visible:ring-green-400/30"
              />
              <button type="submit" className="absolute right-1 top-1 bottom-1 px-3.5 bg-green-600 hover:bg-green-700 text-white rounded-full text-[11px] font-bold transition-colors">
                Tìm kiếm
              </button>
            </div>
          </form>

          {/* Right side: hotline + nav + actions */}
          <div className="flex items-center gap-1 ml-auto">
            <a href={`tel:${storePhone}`} className="hidden xl:flex items-center gap-1 text-[11px] text-gray-500 hover:text-green-600 px-2">
              <Phone className="w-3 h-3" /> {storePhone}
            </a>
            <Link href="/chi-nhanh" className="hidden lg:flex items-center gap-1 text-[11px] text-gray-500 hover:text-green-600 px-2">
              <MapPin className="w-3 h-3" /> Cửa hàng
            </Link>
            <Link href="/admin" className="hidden sm:flex items-center gap-1 text-[11px] text-gray-500 hover:text-green-600 px-2">
              <Package className="w-3 h-3" /> Quản trị
            </Link>

            <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />

            <NotificationBell />

            {user ? (
              <Link href="/tai-khoan" className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                <User className="w-4.5 h-4.5 text-gray-600" />
                <span className="text-[11px] text-gray-600 hidden sm:block">Tài khoản</span>
              </Link>
            ) : (
              <Link href="/dang-nhap" className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                <User className="w-4.5 h-4.5 text-gray-600" />
                <span className="text-[11px] text-gray-600 hidden sm:block">Đăng nhập</span>
              </Link>
            )}

            <Link href="/gio-hang" className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors relative">
              <div className="relative">
                <ShoppingCart className="w-4.5 h-4.5 text-gray-600" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold h-3.5 min-w-[14px] rounded-full flex items-center justify-center px-0.5 shadow-sm">
                    {getItemCount()}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-gray-600 hidden sm:block">Giỏ hàng</span>
            </Link>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-lg h-8 w-8 hover:bg-gray-50 transition-colors">
                <Menu className="w-5 h-5 text-gray-600" />
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="p-4 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-sm">{storeName}</h2>
                      <p className="text-white/70 text-[11px]">Chợ tươi tại nhà</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input placeholder="Tìm kiếm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 rounded-lg h-9" />
                    </div>
                  </form>
                  <nav className="space-y-0.5">
                    {[
                      { href: "/", label: "Trang chủ", icon: "🏠" },
                      { href: "/san-pham", label: "Tất cả sản phẩm", icon: "🛒" },
                      { href: "/chi-nhanh", label: "Hệ thống cửa hàng", icon: "🏪" },
                      { href: "/gio-hang", label: "Giỏ hàng", icon: "🛍️" },
                      { href: "/tai-khoan", label: "Tài khoản", icon: "👤" },
                      { href: "/admin", label: "Quản trị", icon: "⚙️" },
                    ].map((item) => (
                      <Link key={item.href} href={item.href} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-700 text-sm transition-colors">
                        <span>{item.icon}</span> {item.label}
                      </Link>
                    ))}
                  </nav>
                  {user && (
                    <button onClick={signOut} className="w-full text-left py-2 px-3 rounded-lg hover:bg-red-50 text-red-500 text-sm">
                      Đăng xuất
                    </button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
