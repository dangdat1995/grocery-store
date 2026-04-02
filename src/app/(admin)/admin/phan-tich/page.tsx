"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Building2,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Percent,
  Truck,
  CreditCard,
  Star,
  Clock,
  Activity,
  Layers,
} from "lucide-react";

// Time period options
type Period = "today" | "yesterday" | "7days" | "30days" | "this_month" | "last_month" | "this_quarter" | "this_year" | "custom";

const PERIOD_LABELS: Record<Period, string> = {
  today: "Hôm nay",
  yesterday: "Hôm qua",
  "7days": "7 ngày qua",
  "30days": "30 ngày qua",
  this_month: "Tháng này",
  last_month: "Tháng trước",
  this_quarter: "Quý này",
  this_year: "Năm nay",
  custom: "Tuỳ chọn",
};

// Demo data for branches
const BRANCH_DATA = [
  {
    id: "all",
    name: "Tổng thể",
    periods: {
      today: { revenue: 3250000, orders: 12, customers: 10, avgOrder: 270833, cancelRate: 8.3, returnRate: 0, newCustomers: 3, deliveryFee: 180000 },
      yesterday: { revenue: 2800000, orders: 10, customers: 8, avgOrder: 280000, cancelRate: 10, returnRate: 0, newCustomers: 2, deliveryFee: 150000 },
      "7days": { revenue: 18500000, orders: 72, customers: 45, avgOrder: 256944, cancelRate: 6.9, returnRate: 1.4, newCustomers: 15, deliveryFee: 960000 },
      "30days": { revenue: 78000000, orders: 310, customers: 180, avgOrder: 251613, cancelRate: 7.1, returnRate: 1.9, newCustomers: 55, deliveryFee: 3900000 },
      this_month: { revenue: 78000000, orders: 310, customers: 180, avgOrder: 251613, cancelRate: 7.1, returnRate: 1.9, newCustomers: 55, deliveryFee: 3900000 },
      last_month: { revenue: 65000000, orders: 265, customers: 155, avgOrder: 245283, cancelRate: 8.3, returnRate: 2.3, newCustomers: 42, deliveryFee: 3200000 },
      this_quarter: { revenue: 210000000, orders: 850, customers: 420, avgOrder: 247059, cancelRate: 7.5, returnRate: 2.0, newCustomers: 135, deliveryFee: 10500000 },
      this_year: { revenue: 420000000, orders: 1680, customers: 720, avgOrder: 250000, cancelRate: 7.8, returnRate: 2.1, newCustomers: 280, deliveryFee: 21000000 },
      custom: { revenue: 78000000, orders: 310, customers: 180, avgOrder: 251613, cancelRate: 7.1, returnRate: 1.9, newCustomers: 55, deliveryFee: 3900000 },
    },
    topProducts: [
      { name: "Gạo ST25 5kg", qty: 85, revenue: 11475000 },
      { name: "Thịt ba chỉ heo", qty: 72, revenue: 6120000 },
      { name: "Sữa TH True Milk 1L", qty: 120, revenue: 3840000 },
      { name: "Cam sành (kg)", qty: 65, revenue: 2925000 },
      { name: "Cà phê G7 18 gói", qty: 48, revenue: 2496000 },
      { name: "Nước mắm Phú Quốc", qty: 35, revenue: 1925000 },
      { name: "Dầu ăn Simply 1L", qty: 42, revenue: 1890000 },
      { name: "Trứng gà (hộp 10)", qty: 55, revenue: 1650000 },
    ],
    dailyRevenue: [
      { date: "27/03", revenue: 2100000, orders: 9 },
      { date: "28/03", revenue: 2650000, orders: 11 },
      { date: "29/03", revenue: 1900000, orders: 8 },
      { date: "30/03", revenue: 3100000, orders: 13 },
      { date: "31/03", revenue: 2800000, orders: 10 },
      { date: "01/04", revenue: 3200000, orders: 12 },
      { date: "02/04", revenue: 3250000, orders: 12 },
    ],
    paymentBreakdown: { cod: 35, vnpay: 28, momo: 22, bank_transfer: 15 },
    statusBreakdown: { delivered: 65, delivering: 12, preparing: 8, confirmed: 5, pending: 3, cancelled: 7 },
    hourlyOrders: [0, 0, 0, 0, 0, 1, 3, 5, 8, 12, 10, 8, 7, 6, 5, 7, 9, 11, 8, 5, 3, 2, 1, 0],
  },
  {
    id: "b1",
    name: "Chi nhánh chính - Quận 1",
    periods: {
      today: { revenue: 1800000, orders: 7, customers: 6, avgOrder: 257143, cancelRate: 0, returnRate: 0, newCustomers: 2, deliveryFee: 80000 },
      yesterday: { revenue: 1500000, orders: 6, customers: 5, avgOrder: 250000, cancelRate: 16.7, returnRate: 0, newCustomers: 1, deliveryFee: 70000 },
      "7days": { revenue: 10200000, orders: 40, customers: 28, avgOrder: 255000, cancelRate: 5, returnRate: 2.5, newCustomers: 8, deliveryFee: 520000 },
      "30days": { revenue: 42000000, orders: 170, customers: 100, avgOrder: 247059, cancelRate: 5.9, returnRate: 1.8, newCustomers: 30, deliveryFee: 2100000 },
      this_month: { revenue: 42000000, orders: 170, customers: 100, avgOrder: 247059, cancelRate: 5.9, returnRate: 1.8, newCustomers: 30, deliveryFee: 2100000 },
      last_month: { revenue: 36000000, orders: 148, customers: 88, avgOrder: 243243, cancelRate: 6.8, returnRate: 2.0, newCustomers: 24, deliveryFee: 1800000 },
      this_quarter: { revenue: 115000000, orders: 470, customers: 240, avgOrder: 244681, cancelRate: 6.4, returnRate: 1.9, newCustomers: 72, deliveryFee: 5750000 },
      this_year: { revenue: 230000000, orders: 920, customers: 410, avgOrder: 250000, cancelRate: 6.7, returnRate: 2.0, newCustomers: 150, deliveryFee: 11500000 },
      custom: { revenue: 42000000, orders: 170, customers: 100, avgOrder: 247059, cancelRate: 5.9, returnRate: 1.8, newCustomers: 30, deliveryFee: 2100000 },
    },
    topProducts: [
      { name: "Gạo ST25 5kg", qty: 48, revenue: 6480000 },
      { name: "Sữa TH True Milk 1L", qty: 68, revenue: 2176000 },
      { name: "Thịt ba chỉ heo", qty: 38, revenue: 3230000 },
      { name: "Cam sành (kg)", qty: 35, revenue: 1575000 },
      { name: "Trứng gà (hộp 10)", qty: 30, revenue: 900000 },
    ],
    dailyRevenue: [
      { date: "27/03", revenue: 1200000, orders: 5 },
      { date: "28/03", revenue: 1500000, orders: 6 },
      { date: "29/03", revenue: 1100000, orders: 5 },
      { date: "30/03", revenue: 1700000, orders: 7 },
      { date: "31/03", revenue: 1500000, orders: 6 },
      { date: "01/04", revenue: 1800000, orders: 7 },
      { date: "02/04", revenue: 1800000, orders: 7 },
    ],
    paymentBreakdown: { cod: 30, vnpay: 32, momo: 25, bank_transfer: 13 },
    statusBreakdown: { delivered: 68, delivering: 10, preparing: 7, confirmed: 6, pending: 4, cancelled: 5 },
    hourlyOrders: [0, 0, 0, 0, 0, 1, 2, 4, 6, 9, 8, 6, 5, 4, 4, 5, 7, 8, 6, 4, 2, 1, 1, 0],
  },
  {
    id: "b2",
    name: "Chi nhánh Quận 7",
    periods: {
      today: { revenue: 950000, orders: 3, customers: 3, avgOrder: 316667, cancelRate: 0, returnRate: 0, newCustomers: 1, deliveryFee: 60000 },
      yesterday: { revenue: 850000, orders: 3, customers: 2, avgOrder: 283333, cancelRate: 0, returnRate: 0, newCustomers: 1, deliveryFee: 50000 },
      "7days": { revenue: 5500000, orders: 22, customers: 14, avgOrder: 250000, cancelRate: 9.1, returnRate: 0, newCustomers: 5, deliveryFee: 300000 },
      "30days": { revenue: 24000000, orders: 95, customers: 55, avgOrder: 252632, cancelRate: 8.4, returnRate: 2.1, newCustomers: 17, deliveryFee: 1200000 },
      this_month: { revenue: 24000000, orders: 95, customers: 55, avgOrder: 252632, cancelRate: 8.4, returnRate: 2.1, newCustomers: 17, deliveryFee: 1200000 },
      last_month: { revenue: 19500000, orders: 80, customers: 46, avgOrder: 243750, cancelRate: 10, returnRate: 2.5, newCustomers: 12, deliveryFee: 950000 },
      this_quarter: { revenue: 63000000, orders: 255, customers: 125, avgOrder: 247059, cancelRate: 8.6, returnRate: 2.0, newCustomers: 42, deliveryFee: 3150000 },
      this_year: { revenue: 126000000, orders: 505, customers: 210, avgOrder: 249505, cancelRate: 9.1, returnRate: 2.2, newCustomers: 88, deliveryFee: 6300000 },
      custom: { revenue: 24000000, orders: 95, customers: 55, avgOrder: 252632, cancelRate: 8.4, returnRate: 2.1, newCustomers: 17, deliveryFee: 1200000 },
    },
    topProducts: [
      { name: "Thịt ba chỉ heo", qty: 34, revenue: 2890000 },
      { name: "Gạo ST25 5kg", qty: 37, revenue: 4995000 },
      { name: "Cà phê G7 18 gói", qty: 28, revenue: 1456000 },
      { name: "Nước mắm Phú Quốc", qty: 20, revenue: 1100000 },
      { name: "Dầu ăn Simply 1L", qty: 22, revenue: 990000 },
    ],
    dailyRevenue: [
      { date: "27/03", revenue: 600000, orders: 3 },
      { date: "28/03", revenue: 750000, orders: 3 },
      { date: "29/03", revenue: 500000, orders: 2 },
      { date: "30/03", revenue: 900000, orders: 4 },
      { date: "31/03", revenue: 850000, orders: 3 },
      { date: "01/04", revenue: 900000, orders: 3 },
      { date: "02/04", revenue: 950000, orders: 3 },
    ],
    paymentBreakdown: { cod: 40, vnpay: 24, momo: 20, bank_transfer: 16 },
    statusBreakdown: { delivered: 62, delivering: 14, preparing: 9, confirmed: 4, pending: 3, cancelled: 8 },
    hourlyOrders: [0, 0, 0, 0, 0, 0, 1, 2, 3, 5, 4, 3, 3, 2, 2, 3, 4, 5, 3, 2, 1, 1, 0, 0],
  },
  {
    id: "b3",
    name: "Chi nhánh Thủ Đức",
    periods: {
      today: { revenue: 500000, orders: 2, customers: 2, avgOrder: 250000, cancelRate: 50, returnRate: 0, newCustomers: 0, deliveryFee: 40000 },
      yesterday: { revenue: 450000, orders: 1, customers: 1, avgOrder: 450000, cancelRate: 0, returnRate: 0, newCustomers: 0, deliveryFee: 30000 },
      "7days": { revenue: 2800000, orders: 10, customers: 8, avgOrder: 280000, cancelRate: 10, returnRate: 0, newCustomers: 2, deliveryFee: 140000 },
      "30days": { revenue: 12000000, orders: 45, customers: 30, avgOrder: 266667, cancelRate: 8.9, returnRate: 2.2, newCustomers: 8, deliveryFee: 600000 },
      this_month: { revenue: 12000000, orders: 45, customers: 30, avgOrder: 266667, cancelRate: 8.9, returnRate: 2.2, newCustomers: 8, deliveryFee: 600000 },
      last_month: { revenue: 9500000, orders: 37, customers: 25, avgOrder: 256757, cancelRate: 10.8, returnRate: 2.7, newCustomers: 6, deliveryFee: 450000 },
      this_quarter: { revenue: 32000000, orders: 125, customers: 70, avgOrder: 256000, cancelRate: 9.6, returnRate: 2.4, newCustomers: 21, deliveryFee: 1600000 },
      this_year: { revenue: 64000000, orders: 255, customers: 120, avgOrder: 250980, cancelRate: 10.2, returnRate: 2.4, newCustomers: 42, deliveryFee: 3200000 },
      custom: { revenue: 12000000, orders: 45, customers: 30, avgOrder: 266667, cancelRate: 8.9, returnRate: 2.2, newCustomers: 8, deliveryFee: 600000 },
    },
    topProducts: [
      { name: "Gạo ST25 5kg", qty: 18, revenue: 2430000 },
      { name: "Sữa TH True Milk 1L", qty: 25, revenue: 800000 },
      { name: "Cà phê G7 18 gói", qty: 15, revenue: 780000 },
      { name: "Dầu ăn Simply 1L", qty: 12, revenue: 540000 },
      { name: "Cam sành (kg)", qty: 10, revenue: 450000 },
    ],
    dailyRevenue: [
      { date: "27/03", revenue: 300000, orders: 1 },
      { date: "28/03", revenue: 400000, orders: 2 },
      { date: "29/03", revenue: 300000, orders: 1 },
      { date: "30/03", revenue: 500000, orders: 2 },
      { date: "31/03", revenue: 450000, orders: 1 },
      { date: "01/04", revenue: 500000, orders: 2 },
      { date: "02/04", revenue: 500000, orders: 2 },
    ],
    paymentBreakdown: { cod: 42, vnpay: 25, momo: 18, bank_transfer: 15 },
    statusBreakdown: { delivered: 60, delivering: 13, preparing: 9, confirmed: 5, pending: 4, cancelled: 9 },
    hourlyOrders: [0, 0, 0, 0, 0, 0, 1, 1, 2, 3, 2, 2, 2, 1, 1, 2, 3, 3, 2, 1, 1, 0, 0, 0],
  },
];

const PAYMENT_LABELS: Record<string, string> = { cod: "COD", vnpay: "VNPay", momo: "MoMo", bank_transfer: "CK Ngân hàng" };
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  delivered: { label: "Hoàn thành", color: "bg-green-500" },
  delivering: { label: "Đang giao", color: "bg-blue-500" },
  preparing: { label: "Đang chuẩn bị", color: "bg-yellow-500" },
  confirmed: { label: "Đã xác nhận", color: "bg-cyan-500" },
  pending: { label: "Chờ xử lý", color: "bg-orange-500" },
  cancelled: { label: "Đã huỷ", color: "bg-red-500" },
};

function GrowthIndicator({ current, previous, suffix = "" }: { current: number; previous: number; suffix?: string }) {
  if (!previous) return null;
  const pct = ((current - previous) / previous) * 100;
  const up = pct > 0;
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold ${up ? "text-green-600" : "text-red-500"}`}>
      {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(pct).toFixed(1)}%{suffix}
    </span>
  );
}

function BarChart({ data, maxVal }: { data: { label: string; value: number; sub?: string }[]; maxVal: number }) {
  return (
    <div className="flex items-end gap-1.5 h-32">
      {data.map((d, i) => {
        const pct = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="text-[10px] text-gray-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              {d.sub || formatPrice(d.value)}
            </div>
            <div
              className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-md min-h-[4px] transition-all hover:from-green-500 hover:to-green-300"
              style={{ height: `${Math.max(pct, 3)}%` }}
            />
            <span className="text-[9px] text-gray-400">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600 w-28 truncate">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold w-10 text-right">{value}%</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30days");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [compareMode, setCompareMode] = useState(false);

  const branchData = BRANCH_DATA.find((b) => b.id === selectedBranch) || BRANCH_DATA[0];
  const currentStats = branchData.periods[period];

  // Get previous period for comparison
  const prevPeriodMap: Record<Period, Period> = {
    today: "yesterday",
    yesterday: "yesterday",
    "7days": "7days",
    "30days": "30days",
    this_month: "last_month",
    last_month: "last_month",
    this_quarter: "this_quarter",
    this_year: "this_year",
    custom: "custom",
  };
  const prevStats = branchData.periods[prevPeriodMap[period]];

  // Revenue chart data
  const maxRevenue = Math.max(...branchData.dailyRevenue.map((d) => d.revenue), 1);

  // Branch comparison
  const branchComparison = useMemo(() => {
    return BRANCH_DATA.filter((b) => b.id !== "all").map((b) => ({
      name: b.name.replace("Chi nhánh ", "").replace(" - ", "\n"),
      shortName: b.name.replace("Chi nhánh chính - ", "").replace("Chi nhánh ", ""),
      ...b.periods[period],
    }));
  }, [period]);

  const maxBranchRevenue = Math.max(...branchComparison.map((b) => b.revenue), 1);

  // Hourly heatmap
  const maxHourly = Math.max(...branchData.hourlyOrders, 1);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" /> Phân tích kinh doanh
          </h1>
          <p className="text-[11px] sm:text-sm text-gray-500 mt-0.5">Báo cáo chi tiết theo thời gian và chi nhánh</p>
        </div>
      </div>

      {/* Period + Branch selector */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex flex-wrap gap-1.5 bg-gray-100 rounded-xl p-1.5">
          {(Object.entries(PERIOD_LABELS) as [Period, string][]).filter(([k]) => k !== "custom").map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === key ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="border rounded-xl px-3 py-1.5 text-sm min-w-[180px]"
        >
          {BRANCH_DATA.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <Button
          variant={compareMode ? "default" : "outline"}
          size="sm"
          className={`rounded-xl text-xs ${compareMode ? "bg-green-600 hover:bg-green-700" : ""}`}
          onClick={() => setCompareMode(!compareMode)}
        >
          <Layers className="w-3.5 h-3.5 mr-1" /> So sánh CN
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Doanh thu", value: formatPrice(currentStats.revenue), icon: DollarSign, color: "from-green-500 to-emerald-600", raw: currentStats.revenue, rawPrev: prevStats.revenue },
          { label: "Đơn hàng", value: currentStats.orders, icon: ShoppingCart, color: "from-blue-500 to-indigo-600", raw: currentStats.orders, rawPrev: prevStats.orders },
          { label: "Khách hàng", value: currentStats.customers, icon: Users, color: "from-purple-500 to-violet-600", raw: currentStats.customers, rawPrev: prevStats.customers },
          { label: "Giá trị TB/đơn", value: formatPrice(currentStats.avgOrder), icon: Target, color: "from-orange-500 to-amber-600", raw: currentStats.avgOrder, rawPrev: prevStats.avgOrder },
        ].map((kpi) => (
          <Card key={kpi.label} className="gap-0 p-0 overflow-hidden">
            <div className={`bg-gradient-to-r ${kpi.color} p-3 flex items-center gap-2`}>
              <kpi.icon className="w-5 h-5 text-white/80" />
              <span className="text-white/90 text-xs font-medium">{kpi.label}</span>
            </div>
            <div className="p-4">
              <p className="text-2xl font-extrabold">{kpi.value}</p>
              <GrowthIndicator current={kpi.raw} previous={kpi.rawPrev} suffix={` vs ${prevPeriodMap[period] === "yesterday" ? "hôm qua" : "kỳ trước"}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "KH mới", value: currentStats.newCustomers, icon: Users, color: "text-cyan-600 bg-cyan-100" },
          { label: "Tỷ lệ huỷ", value: `${currentStats.cancelRate}%`, icon: Percent, color: currentStats.cancelRate > 10 ? "text-red-600 bg-red-100" : "text-green-600 bg-green-100" },
          { label: "Tỷ lệ trả", value: `${currentStats.returnRate}%`, icon: Truck, color: "text-orange-600 bg-orange-100" },
          { label: "Phí giao hàng", value: formatPrice(currentStats.deliveryFee), icon: Truck, color: "text-blue-600 bg-blue-100" },
          { label: "LN ước tính", value: formatPrice(Math.round(currentStats.revenue * 0.18)), icon: TrendingUp, color: "text-green-600 bg-green-100" },
        ].map((item) => (
          <Card key={item.label} className="gap-0 p-3 flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
              <item.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm">{item.value}</p>
              <p className="text-[10px] text-gray-500">{item.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue chart + Payment/Status breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Revenue trend */}
        <Card className="gap-0 p-4 md:col-span-2">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-600" /> Biểu đồ doanh thu 7 ngày
          </h3>
          <BarChart
            data={branchData.dailyRevenue.map((d) => ({
              label: d.date,
              value: d.revenue,
              sub: `${d.orders} đơn`,
            }))}
            maxVal={maxRevenue}
          />
        </Card>

        {/* Payment breakdown */}
        <Card className="gap-0 p-4">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600" /> Phương thức TT
          </h3>
          <div className="space-y-3">
            {Object.entries(branchData.paymentBreakdown).map(([key, pct]) => (
              <HorizontalBar key={key} label={PAYMENT_LABELS[key] || key} value={pct} maxValue={100} color={
                key === "cod" ? "bg-orange-500" : key === "vnpay" ? "bg-blue-500" : key === "momo" ? "bg-pink-500" : "bg-indigo-500"
              } />
            ))}
          </div>
        </Card>
      </div>

      {/* Order status + Hourly heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Status breakdown */}
        <Card className="gap-0 p-4">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-600" /> Trạng thái đơn hàng (%)
          </h3>
          <div className="space-y-2.5">
            {Object.entries(branchData.statusBreakdown).map(([key, pct]) => {
              const info = STATUS_LABELS[key];
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${info?.color || "bg-gray-400"}`} />
                  <span className="text-xs text-gray-600 w-28">{info?.label || key}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${info?.color || "bg-gray-400"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Hourly heatmap */}
        <Card className="gap-0 p-4">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" /> Giờ cao điểm đặt hàng
          </h3>
          <div className="grid grid-cols-12 gap-1">
            {branchData.hourlyOrders.map((count, hour) => {
              const intensity = maxHourly > 0 ? count / maxHourly : 0;
              return (
                <div key={hour} className="text-center">
                  <div
                    className="w-full aspect-square rounded-md mb-0.5"
                    style={{
                      backgroundColor: intensity === 0
                        ? "#f3f4f6"
                        : `rgba(22, 163, 74, ${0.2 + intensity * 0.8})`,
                    }}
                    title={`${hour}h: ${count} đơn`}
                  />
                  <span className="text-[8px] text-gray-400">{hour}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-[10px] text-gray-400">Ít</span>
            {[0.15, 0.35, 0.55, 0.75, 0.95].map((op) => (
              <div key={op} className="w-4 h-4 rounded" style={{ backgroundColor: `rgba(22, 163, 74, ${op})` }} />
            ))}
            <span className="text-[10px] text-gray-400">Nhiều</span>
          </div>
        </Card>
      </div>

      {/* Top products */}
      <Card className="gap-0 p-4 mb-6">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" /> Top sản phẩm bán chạy
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium text-xs text-gray-500 w-8">#</th>
                <th className="pb-2 font-medium text-xs text-gray-500">Sản phẩm</th>
                <th className="pb-2 font-medium text-xs text-gray-500 text-right">SL bán</th>
                <th className="pb-2 font-medium text-xs text-gray-500 text-right">Doanh thu</th>
                <th className="pb-2 font-medium text-xs text-gray-500 text-right w-48">Tỷ trọng</th>
              </tr>
            </thead>
            <tbody>
              {branchData.topProducts.map((p, i) => {
                const totalRev = branchData.topProducts.reduce((s, x) => s + x.revenue, 0);
                const pct = totalRev > 0 ? (p.revenue / totalRev) * 100 : 0;
                return (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        i < 3 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
                      }`}>{i + 1}</span>
                    </td>
                    <td className="py-2.5 font-medium">{p.name}</td>
                    <td className="py-2.5 text-right text-gray-600">{p.qty}</td>
                    <td className="py-2.5 text-right font-bold text-green-600">{formatPrice(p.revenue)}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-10 text-right">{pct.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Branch comparison */}
      {compareMode && (
        <Card className="gap-0 p-4 mb-6">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" /> So sánh chi nhánh — {PERIOD_LABELS[period]}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium text-xs text-gray-500">Chi nhánh</th>
                  <th className="pb-2 font-medium text-xs text-gray-500 text-right">Doanh thu</th>
                  <th className="pb-2 font-medium text-xs text-gray-500 text-right">Đơn hàng</th>
                  <th className="pb-2 font-medium text-xs text-gray-500 text-right">KH</th>
                  <th className="pb-2 font-medium text-xs text-gray-500 text-right">TB/đơn</th>
                  <th className="pb-2 font-medium text-xs text-gray-500 text-right">Huỷ</th>
                  <th className="pb-2 font-medium text-xs text-gray-500 text-right">KH mới</th>
                  <th className="pb-2 font-medium text-xs text-gray-500 w-48">Tỷ trọng DT</th>
                </tr>
              </thead>
              <tbody>
                {branchComparison.map((b, i) => {
                  const revPct = maxBranchRevenue > 0 ? (b.revenue / maxBranchRevenue) * 100 : 0;
                  return (
                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-8 rounded-full ${["bg-green-500", "bg-blue-500", "bg-purple-500"][i] || "bg-gray-400"}`} />
                          <span className="font-medium">{b.shortName}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right font-bold text-green-600">{formatPrice(b.revenue)}</td>
                      <td className="py-3 text-right">{b.orders}</td>
                      <td className="py-3 text-right">{b.customers}</td>
                      <td className="py-3 text-right">{formatPrice(b.avgOrder)}</td>
                      <td className="py-3 text-right">
                        <span className={`text-xs font-medium ${b.cancelRate > 10 ? "text-red-600" : "text-green-600"}`}>{b.cancelRate}%</span>
                      </td>
                      <td className="py-3 text-right">{b.newCustomers}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-3">
                            <div className={`h-3 rounded-full ${["bg-green-500", "bg-blue-500", "bg-purple-500"][i] || "bg-gray-400"}`} style={{ width: `${revPct}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Totals */}
              <tfoot>
                <tr className="border-t-2 font-bold bg-gray-50">
                  <td className="py-3">Tổng cộng</td>
                  <td className="py-3 text-right text-green-600">{formatPrice(branchComparison.reduce((s, b) => s + b.revenue, 0))}</td>
                  <td className="py-3 text-right">{branchComparison.reduce((s, b) => s + b.orders, 0)}</td>
                  <td className="py-3 text-right">{branchComparison.reduce((s, b) => s + b.customers, 0)}</td>
                  <td className="py-3 text-right">{formatPrice(Math.round(branchComparison.reduce((s, b) => s + b.revenue, 0) / Math.max(branchComparison.reduce((s, b) => s + b.orders, 0), 1)))}</td>
                  <td className="py-3 text-right">
                    {(branchComparison.reduce((s, b) => s + b.cancelRate, 0) / branchComparison.length).toFixed(1)}%
                  </td>
                  <td className="py-3 text-right">{branchComparison.reduce((s, b) => s + b.newCustomers, 0)}</td>
                  <td className="py-3" />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Branch revenue comparison chart */}
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-xs font-medium text-gray-500 mb-3">Doanh thu so sánh</h4>
            <div className="flex items-end gap-6 h-28">
              {branchComparison.map((b, i) => {
                const pct = maxBranchRevenue > 0 ? (b.revenue / maxBranchRevenue) * 100 : 0;
                const colors = ["from-green-500 to-emerald-600", "from-blue-500 to-indigo-600", "from-purple-500 to-violet-600"];
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[11px] font-bold text-gray-600">{formatPrice(b.revenue)}</span>
                    <div
                      className={`w-full bg-gradient-to-t ${colors[i] || "from-gray-400 to-gray-500"} rounded-t-lg min-h-[8px]`}
                      style={{ height: `${Math.max(pct, 5)}%` }}
                    />
                    <span className="text-[10px] text-gray-500 text-center">{b.shortName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
