"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { TIER_CONFIG, POINTS_VALUE as DEFAULT_POINTS_VALUE, TIER_POINTS_MULTIPLIER } from "@/lib/constants";
import {
  User,
  Coins,
  ShoppingCart,
  Star,
  Ticket,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  TrendingUp,
  LogOut,
  Package,
  Crown,
  ChevronRight,
} from "lucide-react";

interface PointsTx {
  id: string;
  type: string;
  points: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export default function AccountPage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [pointsBalance, setPointsBalance] = useState(0);
  const [transactions, setTransactions] = useState<PointsTx[]>([]);
  const [tier, setTier] = useState("new");
  const [multiplier, setMultiplier] = useState(1);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [pointsValue, setPointsValue] = useState(DEFAULT_POINTS_VALUE);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/dang-nhap");
    }
  }, [loading, user]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/points")
      .then((r) => r.json())
      .then((data) => {
        setPointsBalance(data.balance || 0);
        setTransactions(data.transactions || []);
        setTier(data.tier || "new");
        setMultiplier(data.multiplier || 1);
        if (data.points_value) setPointsValue(data.points_value);
      })
      .catch(() => {});

    fetch("/api/vouchers/my")
      .then((r) => r.json())
      .then((data) => setVouchers(data.vouchers || []))
      .catch(() => {});
  }, [user]);

  if (loading || !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const tierInfo = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.new;
  const tierKeys = Object.keys(TIER_CONFIG) as (keyof typeof TIER_CONFIG)[];
  const currentTierIndex = tierKeys.indexOf(tier as keyof typeof TIER_CONFIG);
  const nextTier = currentTierIndex < tierKeys.length - 1 ? tierKeys[currentTierIndex + 1] : null;
  const nextTierInfo = nextTier ? TIER_CONFIG[nextTier] : null;

  const totalSpent = profile?.total_spent || 0;
  const totalOrders = profile?.total_orders || 0;

  // Progress to next tier
  let progressPercent = 100;
  let progressLabel = "";
  if (nextTierInfo) {
    const spentProgress = Math.min(totalSpent / nextTierInfo.minSpent, 1);
    const orderProgress = Math.min(totalOrders / nextTierInfo.minOrders, 1);
    progressPercent = Math.max(spentProgress, orderProgress) * 100;
    progressLabel = `${nextTierInfo.minOrders} đơn hoặc ${formatPrice(nextTierInfo.minSpent)}`;
  }

  const txIcon = (type: string) => {
    if (type === "earn") return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
    if (type === "redeem") return <ArrowUpRight className="w-4 h-4 text-red-500" />;
    if (type === "bonus") return <Gift className="w-4 h-4 text-purple-600" />;
    return <Coins className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Profile header */}
      <Card className="gap-0 p-5 mb-4 bg-gradient-to-br from-green-600 to-emerald-700 text-white border-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <User className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{profile?.full_name || "Khách hàng"}</h1>
            <p className="text-green-100 text-sm">{user.email || profile?.phone || ""}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-bold bg-white/20`}>
            {tierInfo.icon} {tierInfo.label}
          </span>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <Coins className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
            <p className="text-2xl font-extrabold">{pointsBalance}</p>
            <p className="text-[10px] text-green-200">Điểm tích luỹ</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <ShoppingCart className="w-5 h-5 mx-auto mb-1 text-green-200" />
            <p className="text-2xl font-extrabold">{totalOrders}</p>
            <p className="text-[10px] text-green-200">Đơn hàng</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <Crown className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
            <p className="text-lg font-extrabold">{formatPrice(totalSpent)}</p>
            <p className="text-[10px] text-green-200">Tổng chi tiêu</p>
          </div>
        </div>
      </Card>

      {/* Tier progress */}
      {nextTierInfo && (
        <Card className="gap-0 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-green-600" /> Tiến trình hạng
            </p>
            <span className="text-xs text-gray-400">
              {tierInfo.icon} {tierInfo.label} → {nextTierInfo.icon} {nextTierInfo.label}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400">Cần thêm {progressLabel} để lên hạng {nextTierInfo.label}</p>
        </Card>
      )}

      {/* Points info */}
      <Card className="gap-0 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold flex items-center gap-1.5">
            <Coins className="w-5 h-5 text-yellow-600" /> Điểm tích luỹ
          </h2>
          <span className="text-2xl font-extrabold text-yellow-600">{pointsBalance}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center text-xs mb-4">
          <div className="bg-green-50 rounded-xl p-3">
            <p className="font-bold text-green-700">Quy đổi</p>
            <p className="text-green-600 mt-0.5">1 điểm = {formatPrice(pointsValue)}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3">
            <p className="font-bold text-yellow-700">Tốc độ tích</p>
            <p className="text-yellow-600 mt-0.5">x{multiplier} ({tierInfo.label})</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          Mỗi 1.000đ chi tiêu = {Math.round(1 * multiplier)} điểm. Điểm được cộng sau khi đơn hàng giao thành công.
          Dùng điểm để giảm giá tại bước thanh toán (tối đa 50% đơn hàng).
        </p>
      </Card>

      {/* My Vouchers */}
      {vouchers.length > 0 && (
        <Card className="gap-0 p-4 mb-4">
          <h2 className="font-bold mb-3 flex items-center gap-1.5">
            <Ticket className="w-5 h-5 text-purple-600" /> Voucher của tôi ({vouchers.filter((v: any) => !v.used && !v.expired).length} khả dụng)
          </h2>
          <div className="space-y-2">
            {vouchers.map((v: any, i: number) => {
              const isExpired = v.expired || new Date(v.end_date) < new Date();
              const isUsed = v.used;
              const isAvailable = !isExpired && !isUsed;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    isAvailable
                      ? "border-green-200 bg-green-50"
                      : "border-gray-100 bg-gray-50 opacity-60"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isAvailable ? "bg-green-100" : "bg-gray-200"
                  }`}>
                    <Ticket className={`w-5 h-5 ${isAvailable ? "text-green-600" : "text-gray-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs font-bold text-green-700">{v.code}</p>
                    <p className="text-[11px] text-gray-500 truncate">{v.description}</p>
                    <p className="text-[10px] text-gray-400">
                      HSD: {new Date(v.end_date).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-medium shrink-0 ${
                    isUsed ? "bg-gray-200 text-gray-500" : isExpired ? "bg-red-100 text-red-600" : "bg-green-200 text-green-700"
                  }`}>
                    {isUsed ? "Đã dùng" : isExpired ? "Hết hạn" : "Sẵn sàng"}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Link href="/don-hang" className="block">
          <Card className="gap-0 p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-sm">Đơn hàng</span>
              <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
            </div>
          </Card>
        </Link>
        <Link href="/san-pham" className="block">
          <Card className="gap-0 p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-sm">Mua sắm</span>
              <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Transaction history */}
      <Card className="gap-0 p-4 mb-4">
        <h2 className="font-bold mb-3 flex items-center gap-1.5">
          <Star className="w-4 h-4 text-yellow-600" /> Lịch sử điểm
        </h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Chưa có giao dịch điểm</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                  {txIcon(tx.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.description}</p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(tx.created_at).toLocaleDateString("vi-VN")} - Số dư: {tx.balance_after}
                  </p>
                </div>
                <span className={`text-sm font-bold shrink-0 ${tx.points > 0 ? "text-green-600" : "text-red-500"}`}>
                  {tx.points > 0 ? "+" : ""}{tx.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Sign out */}
      <Button
        variant="outline"
        className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50"
        onClick={() => { signOut(); router.push("/"); }}
      >
        <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
      </Button>
    </div>
  );
}
