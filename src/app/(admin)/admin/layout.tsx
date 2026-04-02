"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AIAssistant from "@/components/admin/AIAssistant";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Users,
  ArrowLeft,
  CalendarDays,
  Ticket,
  Settings,
  Building2,
  Warehouse,
  ShieldCheck,
  PackagePlus,
  Gift,
  BarChart3,
  Menu,
  X,
  Trophy,
  Megaphone,
  Bell,
} from "lucide-react";

const sidebarSections = [
  {
    label: null,
    items: [
      { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Đơn hàng",
    items: [
      { href: "/admin/don-hang", icon: ShoppingCart, label: "Đơn hàng" },
    ],
  },
  {
    label: "Sản phẩm",
    items: [
      { href: "/admin/san-pham", icon: Package, label: "Sản phẩm" },
      { href: "/admin/danh-muc", icon: FolderOpen, label: "Danh mục" },
      { href: "/admin/kho", icon: Warehouse, label: "Kho hàng" },
      { href: "/admin/combo", icon: PackagePlus, label: "Combo" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/quang-cao", icon: Megaphone, label: "Quảng cáo" },
      { href: "/admin/su-kien", icon: CalendarDays, label: "Sự kiện" },
      { href: "/admin/voucher", icon: Ticket, label: "Voucher" },
      { href: "/admin/qua-tang", icon: Gift, label: "Quà tặng" },
      { href: "/admin/moc-thuong", icon: Trophy, label: "Mốc thưởng" },
    ],
  },
  {
    label: "Quản lý",
    items: [
      { href: "/admin/khach-hang", icon: Users, label: "Khách hàng" },
      { href: "/admin/thong-bao", icon: Bell, label: "Thông báo" },
      { href: "/admin/chi-nhanh", icon: Building2, label: "Chi nhánh" },
      { href: "/admin/phan-tich", icon: BarChart3, label: "Phân tích" },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { href: "/admin/nhan-vien", icon: ShieldCheck, label: "Nhân viên" },
      { href: "/admin/cai-dat", icon: Settings, label: "Cài đặt" },
    ],
  },
];

// Flat list for mobile nav
const allItems = sidebarSections.flatMap((s) => s.items);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Desktop */}
      <aside className="w-56 bg-gray-900 text-white hidden md:flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-800">
          <h1 className="font-bold text-base">Quản trị</h1>
          <p className="text-[11px] text-gray-500">Tạp Hoá Online</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {sidebarSections.map((section, si) => (
            <div key={si}>
              {section.label && (
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 pt-4 pb-1">
                  {section.label}
                </p>
              )}
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                    isActive(item.href)
                      ? "bg-green-600 text-white font-medium"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-2 border-t border-gray-800">
          <Link
            href="/"
            className="flex items-center gap-2 text-[13px] text-gray-500 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Về cửa hàng
          </Link>
        </div>
      </aside>

      {/* Mobile */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="font-bold text-sm">Quản trị</h1>
          </div>
          <Link href="/" className="text-xs text-gray-400">
            Về cửa hàng
          </Link>
        </header>

        {/* Mobile nav - slide down */}
        {mobileOpen && (
          <nav className="md:hidden bg-gray-800 px-3 py-2 grid grid-cols-3 gap-1 border-b border-gray-700">
            {allItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg text-center transition-colors ${
                  isActive(item.href)
                    ? "bg-green-600 text-white"
                    : "text-gray-400 hover:bg-gray-700"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-[10px] leading-tight">{item.label}</span>
              </Link>
            ))}
          </nav>
        )}

        {/* Content */}
        <main className="flex-1 bg-gray-50 p-3 sm:p-4 md:p-6">{children}</main>
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}
