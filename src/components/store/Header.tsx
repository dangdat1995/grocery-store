"use client";

import Link from "next/link";
import { ShoppingCart, Phone, Search, User, Menu, MapPin, Package, ChevronDown, Check, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    if (searchQuery.trim()) {
      router.push(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass shadow-lg border-b border-white/20"
          : "bg-white border-b"
      }`}
    >
      {/* Top bar */}
      <div className="hidden md:block bg-gradient-to-r from-green-700 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            {/* Branch selector in topbar */}
            {branches.length > 0 && (
              <div ref={branchRef} className="relative">
                <button
                  onClick={() => setBranchOpen(!branchOpen)}
                  className="flex items-center gap-1.5 hover:bg-white/10 rounded-md px-2 py-0.5 transition-colors"
                >
                  <Building2 className="w-3 h-3" />
                  <span className="font-medium">{selectedBranch?.name || "Chọn chi nhánh"}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${branchOpen ? "rotate-180" : ""}`} />
                </button>

                {branchOpen && (
                  <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-xl border z-[60] min-w-[260px] py-1 animate-fade-in-up">
                    <p className="px-3 py-1.5 text-[10px] text-gray-400 font-semibold uppercase">Chi nhánh mua hàng</p>
                    {branches.map((b: any) => (
                      <button
                        key={b.id}
                        onClick={() => { selectBranch(b); setBranchOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs hover:bg-green-50 transition-colors ${
                          selectedBranch?.id === b.id ? "text-green-700 bg-green-50 font-semibold" : "text-gray-700"
                        }`}
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
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <a href={`tel:${storePhone}`} className="hover:underline">{storePhone}</a>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="hover:underline flex items-center gap-1">
              <Package className="w-3 h-3" /> Quản trị
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 animated-gradient rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg leading-tight gradient-text">
                {storeName}
              </h1>
              <p className="text-[11px] text-gray-400">Chợ tươi tại nhà</p>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <div className="relative w-full group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600 transition-colors" />
              <Input
                placeholder="Tìm rau, thịt, cá, trái cây, đồ khô..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-11 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all bg-gray-50 focus:bg-white"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {user ? (
              <div className="flex items-center gap-1">
                <Link href="/tai-khoan">
                  <Button size="sm" variant="ghost" className="rounded-xl hover:bg-green-50">
                    <User className="w-4 h-4 text-gray-600" />
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={signOut} className="rounded-xl text-xs hover:bg-red-50 hover:text-red-600">
                  Thoát
                </Button>
              </div>
            ) : (
              <Link href="/dang-nhap">
                <Button size="sm" variant="ghost" className="rounded-xl hover:bg-green-50">
                  <User className="w-4 h-4 mr-1 text-gray-600" />
                  <span className="hidden sm:inline text-gray-600">Đăng nhập</span>
                </Button>
              </Link>
            )}

            <Link href="/gio-hang">
              <Button size="sm" variant="outline" className="relative rounded-xl border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all">
                <ShoppingCart className="w-4 h-4 text-gray-600" />
                {getItemCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-green-600 animate-bounce-in shadow-md">
                    {getItemCount()}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-xl text-sm font-medium h-9 px-3 hover:bg-green-50 transition-colors">
                <Menu className="w-5 h-5 text-gray-600" />
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="p-5 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">{storeName}</h2>
                      <p className="text-green-100 text-xs">Chợ tươi tại nhà</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Tìm kiếm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-xl"
                      />
                    </div>
                  </form>
                  <nav className="space-y-1">
                    {[
                      { href: "/", label: "Trang chủ" },
                      { href: "/san-pham", label: "Tất cả sản phẩm" },
                      { href: "/chi-nhanh", label: "Chi nhánh & Bản đồ" },
                      { href: "/gio-hang", label: "Giỏ hàng" },
                      { href: "/dang-nhap", label: "Tài khoản" },
                      { href: "/admin", label: "Quản trị" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block py-2.5 px-4 rounded-xl hover:bg-green-50 text-gray-700 hover:text-green-700 font-medium text-sm transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
