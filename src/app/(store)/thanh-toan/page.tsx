"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Banknote,
  CreditCard,
  Wallet,
  Landmark,
  ShoppingCart,
  Truck,
  ShoppingBag,
  Navigation,
  Loader2,
  AlertCircle,
  CheckCircle,
  Ticket,
  X,
  Gift,
  Sparkles,
  PackagePlus,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format";
import { POINTS_VALUE as DEFAULT_POINTS_VALUE } from "@/lib/constants";
import { useCartStore } from "@/stores/cart-store";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";
import BankTransferInfo from "@/components/store/BankTransferInfo";
import { useBranchStore } from "@/stores/branch-store";

type PaymentMethod = "cod" | "vnpay" | "momo" | "bank_transfer";

interface GiftPromo {
  id: string;
  name: string;
  gift_description: string;
  condition_type: string;
  condition_value: string | null;
  min_order_amount: number;
  min_quantity: number;
  gift_quantity: number;
}

interface ComboData {
  id: string;
  name: string;
  combo_price: number;
  original_price: number;
  items: { product_id: string; product_name: string; quantity: number; price: number }[];
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuth();
  const { selectedBranch: storeBranch } = useBranchStore();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryDistance, setDeliveryDistance] = useState<number | null>(null);
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [deliveryInZone, setDeliveryInZone] = useState(true);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [customerLat, setCustomerLat] = useState<number | null>(null);
  const [customerLng, setCustomerLng] = useState<number | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [branchName, setBranchName] = useState<string | null>(null);

  // Voucher
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<{
    id: string;
    code: string;
    description: string | null;
    discount_type: string;
    discount: number;
    free_ship: boolean;
  } | null>(null);

  // Gift promotions & combos
  const [giftPromos, setGiftPromos] = useState<GiftPromo[]>([]);
  const [combos, setCombos] = useState<ComboData[]>([]);
  const [qualifiedGifts, setQualifiedGifts] = useState<GiftPromo[]>([]);
  const [matchedCombos, setMatchedCombos] = useState<{ combo: ComboData; savings: number }[]>([]);

  // Points
  const [pointsBalance, setPointsBalance] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [pointsTier, setPointsTier] = useState("new");
  const [pointsMultiplier, setPointsMultiplier] = useState(1);
  const [pointsValue, setPointsValue] = useState(DEFAULT_POINTS_VALUE);

  const subtotal = getTotal();
  const voucherDiscount = appliedVoucher?.discount || 0;
  const effectiveDeliveryFee = appliedVoucher?.free_ship ? 0 : deliveryFee;
  const comboSavings = matchedCombos.reduce((s, mc) => s + mc.savings, 0);
  const pointsDiscount = pointsToUse * pointsValue;
  const total = Math.max(0, subtotal - voucherDiscount - comboSavings - pointsDiscount + effectiveDeliveryFee);

  // Pre-fill branch from global store
  useEffect(() => {
    if (storeBranch && !branchId) {
      setBranchId(storeBranch.id);
      setBranchName(storeBranch.name);
    }
  }, [storeBranch]);

  // Load points balance
  useEffect(() => {
    if (!user) return;
    fetch("/api/points")
      .then((r) => r.json())
      .then((data) => {
        setPointsBalance(data.balance || 0);
        setPointsTier(data.tier || "new");
        setPointsMultiplier(data.multiplier || 1);
        if (data.points_value) setPointsValue(data.points_value);
      })
      .catch(() => {});
  }, [user]);

  // Load gift promos and combos
  useEffect(() => {
    if (isDemo) {
      setGiftPromos([
        { id: "g1", name: "Tặng túi nilon", gift_description: "Tặng 1 túi nilon thân thiện môi trường", condition_type: "any_product", condition_value: null, min_order_amount: 0, min_quantity: 1, gift_quantity: 1 },
        { id: "g2", name: "Quà đơn 300k", gift_description: "Tặng 1 bịch khăn giấy cao cấp", condition_type: "min_amount", condition_value: "300000", min_order_amount: 300000, min_quantity: 1, gift_quantity: 1 },
        { id: "g3", name: "Tặng nước mắm khi mua gạo", gift_description: "Tặng 1 chai nước mắm Phú Quốc 250ml", condition_type: "specific_product", condition_value: "1", min_order_amount: 0, min_quantity: 1, gift_quantity: 1 },
      ]);
      setCombos([
        {
          id: "c1", name: "Combo Bếp Nhà", combo_price: 120000, original_price: 155000,
          items: [
            { product_id: "1", product_name: "Gạo ST25 5kg", quantity: 1, price: 65000 },
            { product_id: "2", product_name: "Nước mắm Phú Quốc", quantity: 1, price: 45000 },
            { product_id: "3", product_name: "Rau muống tươi", quantity: 1, price: 15000 },
            { product_id: "4", product_name: "Thịt ba chỉ 500g", quantity: 1, price: 30000 },
          ],
        },
      ]);
      return;
    }
    // Production: fetch from APIs
    fetch("/api/vouchers/active").then(r => r.json()).then(() => {}).catch(() => {});
  }, []);

  // Calculate qualified gifts based on cart
  useEffect(() => {
    const qualified: GiftPromo[] = [];
    const cartProductIds = items.map((it) => it.product.id);

    giftPromos.forEach((g) => {
      if (g.condition_type === "any_product" && items.length > 0) {
        qualified.push(g);
      } else if (g.condition_type === "min_amount") {
        const minAmt = Number(g.condition_value || g.min_order_amount || 0);
        if (subtotal >= minAmt) qualified.push(g);
      } else if (g.condition_type === "specific_product") {
        const found = items.find((it) => it.product.id === g.condition_value && it.quantity >= (g.min_quantity || 1));
        if (found) qualified.push(g);
      } else if (g.condition_type === "specific_category") {
        const found = items.find((it) => it.product.category_id === g.condition_value);
        if (found) qualified.push(g);
      }
    });
    setQualifiedGifts(qualified);
  }, [items, subtotal, giftPromos]);

  // Detect combo matches in cart
  useEffect(() => {
    const matched: { combo: ComboData; savings: number }[] = [];
    combos.forEach((combo) => {
      const allInCart = combo.items.every((ci) => {
        const cartItem = items.find((it) => it.product.id === ci.product_id);
        return cartItem && cartItem.quantity >= ci.quantity;
      });
      if (allInCart) {
        matched.push({ combo, savings: combo.original_price - combo.combo_price });
      }
    });
    setMatchedCombos(matched);
  }, [items, combos]);

  // Almost qualified gifts
  const almostQualifiedGifts = giftPromos.filter((g) => {
    if (g.condition_type === "min_amount") {
      const minAmt = Number(g.condition_value || g.min_order_amount || 0);
      return subtotal > 0 && subtotal < minAmt && subtotal >= minAmt * 0.5;
    }
    return false;
  });

  // Get customer location via GPS
  const getMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCustomerLat(lat);
        setCustomerLng(lng);

        try {
          const res = await fetch("/api/delivery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lng }),
          });
          const data = await res.json();
          if (data.fee !== null && data.fee !== undefined) {
            setDeliveryFee(data.fee);
            setDeliveryDistance(data.distance);
            setDeliveryMessage(data.message);
            setDeliveryInZone(data.inZone);
            setBranchId(data.branch_id || null);
            setBranchName(data.branch_name || null);
          } else {
            setDeliveryInZone(false);
            setDeliveryMessage(data.message || "Ngoài vùng giao hàng");
            setBranchId(null);
            setBranchName(null);
          }
        } catch {
          toast.error("Lỗi tính phí giao hàng");
        }

        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=vi`
          );
          const geoData = await geoRes.json();
          if (geoData.address) {
            const a = geoData.address;
            if (!address) setAddress(a.road || a.pedestrian || "");
            if (!ward) setWard(a.suburb || a.quarter || a.neighbourhood || "");
            if (!district) setDistrict(a.city_district || a.county || "");
          }
        } catch {}

        setLocating(false);
        toast.success("Đã xác định vị trí của bạn");
      },
      (err) => {
        setLocating(false);
        toast.error("Không lấy được vị trí. Vui lòng cho phép truy cập vị trí.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [address, ward, district]);

  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }

    if (isDemo) {
      const code = voucherCode.toUpperCase().trim();
      if (code === "GIAM10") {
        const discount = Math.round(subtotal * 10 / 100);
        setAppliedVoucher({ id: "demo1", code, description: "Giảm 10%", discount_type: "percent", discount, free_ship: false });
        toast.success(`Áp dụng mã ${code}: Giảm ${new Intl.NumberFormat("vi-VN").format(discount)}đ`);
      } else if (code === "GIAM50K") {
        setAppliedVoucher({ id: "demo2", code, description: "Giảm 50.000đ", discount_type: "fixed", discount: 50000, free_ship: false });
        toast.success(`Áp dụng mã ${code}: Giảm 50.000đ`);
      } else if (code === "FREESHIP") {
        setAppliedVoucher({ id: "demo3", code, description: "Miễn phí ship", discount_type: "free_ship", discount: 0, free_ship: true });
        toast.success(`Áp dụng mã ${code}: Miễn phí giao hàng`);
      } else {
        toast.error("Mã voucher không hợp lệ");
      }
      return;
    }

    setVoucherLoading(true);
    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherCode, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAppliedVoucher({
        id: data.voucher.id,
        code: data.voucher.code,
        description: data.voucher.description,
        discount_type: data.voucher.discount_type,
        discount: data.discount,
        free_ship: data.free_ship,
      });
      toast.success(
        data.free_ship
          ? `Áp dụng mã ${data.voucher.code}: Miễn phí giao hàng`
          : `Áp dụng mã ${data.voucher.code}: Giảm ${new Intl.NumberFormat("vi-VN").format(data.discount)}đ`
      );
    } catch (err: any) {
      toast.error(err.message || "Mã voucher không hợp lệ");
    }
    setVoucherLoading(false);
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    toast.info("Đã xoá mã voucher");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-300" />
        </div>
        <h1 className="text-2xl font-extrabold mb-2">Giỏ hàng trống</h1>
        <p className="text-gray-400 mb-6">Thêm sản phẩm vào giỏ hàng để đặt hàng</p>
        <Link href="/san-pham">
          <Button className="bg-green-600 hover:bg-green-700 rounded-xl h-11 px-8 font-bold">Mua sắm ngay</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !phone || !address || !ward || !district) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    if (!deliveryInZone && customerLat) {
      toast.error("Địa chỉ ngoài vùng giao hàng. Vui lòng kiểm tra lại.");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: items.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_price: item.buyMode === "bulk" && item.product.bulk_price ? item.product.bulk_price : item.product.price,
          quantity: item.quantity,
          subtotal: (item.buyMode === "bulk" && item.product.bulk_price ? item.product.bulk_price : item.product.price) * item.quantity,
          buy_mode: item.buyMode || "retail",
        })),
        subtotal,
        delivery_fee: effectiveDeliveryFee,
        discount: voucherDiscount + comboSavings + pointsDiscount,
        points_used: pointsToUse,
        points_discount: pointsDiscount,
        voucher_id: appliedVoucher?.id || null,
        voucher_code: appliedVoucher?.code || null,
        combo_ids: matchedCombos.map((mc) => mc.combo.id),
        combo_savings: comboSavings,
        gift_ids: qualifiedGifts.map((g) => g.id),
        gifts: qualifiedGifts.map((g) => ({
          id: g.id,
          name: g.name,
          gift_description: g.gift_description,
          gift_quantity: g.gift_quantity,
        })),
        total,
        payment_method: paymentMethod,
        delivery_address: `${address}, ${ward}, ${district}, Hồ Chí Minh`,
        delivery_lat: customerLat,
        delivery_lng: customerLng,
        delivery_distance_km: deliveryDistance,
        branch_id: branchId,
        note,
        full_name: fullName,
        phone,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Đặt hàng thất bại");
      }

      if (paymentMethod === "vnpay" && data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      if (paymentMethod === "momo" && data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      clearCart();
      const params = new URLSearchParams({
        order: data.order_number,
        status: "success",
        method: paymentMethod,
        amount: String(total),
      });
      router.push(`/thanh-toan/ket-qua?${params}`);
    } catch (err: any) {
      toast.error(err.message || "Đặt hàng thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const paymentOptions = [
    { value: "cod" as const, label: "COD - Trả tiền khi nhận", icon: Banknote, desc: "Trả tiền mặt cho shipper", color: "from-green-500 to-emerald-600" },
    { value: "bank_transfer" as const, label: "Chuyển khoản ngân hàng", icon: Landmark, desc: "Chuyển khoản / Quét QR", color: "from-blue-500 to-indigo-600" },
    { value: "vnpay" as const, label: "VNPay", icon: CreditCard, desc: "Thẻ ngân hàng, QR Code", color: "from-cyan-500 to-blue-600" },
    { value: "momo" as const, label: "Ví MoMo", icon: Wallet, desc: "Thanh toán qua ví MoMo", color: "from-pink-500 to-rose-600" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-extrabold mb-6 animate-fade-in">Đặt hàng</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="md:col-span-2 space-y-5">
            {/* Delivery Info */}
            <Card className="p-5 rounded-2xl border-0 shadow-md animate-fade-in-up">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                Thông tin giao hàng
              </h2>

              <Button
                type="button"
                variant="outline"
                onClick={getMyLocation}
                disabled={locating}
                className="w-full mb-4 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 h-11"
              >
                {locating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4 mr-2" />
                )}
                {locating ? "Đang xác định vị trí..." : "Xác định vị trí của tôi (tự động tính phí ship)"}
              </Button>

              {deliveryMessage && (
                <div className={`mb-4 p-3 rounded-xl text-sm ${
                  deliveryInZone
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  <div className="flex items-center gap-2">
                    {deliveryInZone ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    {deliveryMessage}
                  </div>
                  {branchName && deliveryInZone && (
                    <p className="text-xs text-green-600 mt-1 ml-6 font-medium">
                      Đơn hàng sẽ xuất từ: {branchName}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-xs text-gray-500">Họ và tên *</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" className="mt-1 rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs text-gray-500">Số điện thoại *</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0901234567" className="mt-1 rounded-xl" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address" className="text-xs text-gray-500">Địa chỉ (số nhà, tên đường) *</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Nguyễn Huệ" className="mt-1 rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="ward" className="text-xs text-gray-500">Phường/Xã *</Label>
                  <Input id="ward" value={ward} onChange={(e) => setWard(e.target.value)} placeholder="Phường Bến Nghé" className="mt-1 rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="district" className="text-xs text-gray-500">Quận/Huyện *</Label>
                  <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Quận 1" className="mt-1 rounded-xl" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="note" className="text-xs text-gray-500">Ghi chú</Label>
                  <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Giao buổi chiều, gọi trước khi giao..." className="mt-1 rounded-xl" />
                </div>
              </div>
            </Card>

            {/* Payment */}
            <Card className="p-5 rounded-2xl border-0 shadow-md animate-fade-in-up">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                Phương thức thanh toán
              </h2>
              <div className="space-y-2.5">
                {paymentOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === opt.value
                        ? "border-green-500 bg-green-50 shadow-sm"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={() => setPaymentMethod(opt.value)}
                      className="accent-green-600 w-4 h-4"
                    />
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${opt.color} flex items-center justify-center shrink-0`}>
                      <opt.icon className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {paymentMethod === "bank_transfer" && (
                <div className="mt-4">
                  <BankTransferInfo amount={total} compact />
                </div>
              )}
            </Card>
          </div>

          {/* Right: Invoice Summary */}
          <div>
            <Card className="p-5 sticky top-28 rounded-2xl border-0 shadow-md animate-fade-in-up">
              <h2 className="font-bold text-lg mb-4">Hoá đơn</h2>

              {/* Cart items */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((item) => {
                  const itemPrice = item.buyMode === "bulk" && item.product.bulk_price ? item.product.bulk_price : item.product.price;
                  return (
                    <div key={`${item.product.id}_${item.buyMode || "retail"}`} className="flex justify-between text-sm">
                      <span className="line-clamp-1 flex-1 text-gray-600">
                        {item.product.name}
                        {item.buyMode === "bulk" && <span className="text-orange-500 text-xs ml-1">({item.product.bulk_unit})</span>}
                        <span className="text-gray-400"> x{item.quantity}</span>
                      </span>
                      <span className="font-semibold ml-2 shrink-0">
                        {formatPrice(itemPrice * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Matched combos */}
              {matchedCombos.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <div>
                    <p className="text-xs font-semibold text-purple-700 mb-1.5 flex items-center gap-1">
                      <PackagePlus className="w-3.5 h-3.5" /> Combo áp dụng
                    </p>
                    {matchedCombos.map((mc) => (
                      <div key={mc.combo.id} className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-2.5 py-1.5 mb-1">
                        <span className="text-xs text-purple-700 font-medium">{mc.combo.name}</span>
                        <span className="text-xs font-bold text-purple-600">-{formatPrice(mc.savings)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Qualified gift promotions */}
              {qualifiedGifts.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <div>
                    <p className="text-xs font-semibold text-green-700 mb-1.5 flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5" /> Quà tặng kèm đơn
                    </p>
                    {qualifiedGifts.map((g) => (
                      <div key={g.id} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1.5 mb-1">
                        <Sparkles className="w-3 h-3 text-yellow-500 shrink-0" />
                        <span className="text-xs text-green-700 font-medium">
                          {g.gift_description}
                          {g.gift_quantity > 1 && ` x${g.gift_quantity}`}
                        </span>
                        <span className="text-[10px] text-green-500 ml-auto">MIỄN PHÍ</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Almost qualified hints */}
              {almostQualifiedGifts.length > 0 && (
                <div className="mt-2">
                  {almostQualifiedGifts.map((g) => {
                    const minAmt = Number(g.condition_value || g.min_order_amount || 0);
                    const remaining = minAmt - subtotal;
                    return (
                      <div key={`hint-${g.id}`} className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-lg px-2.5 py-1.5 mb-1">
                        <Gift className="w-3 h-3 text-yellow-600 shrink-0" />
                        <span className="text-[11px] text-yellow-700">
                          Thêm <strong>{formatPrice(remaining)}</strong> nhận: {g.gift_description}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Voucher */}
              <Separator className="my-3" />
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-purple-600" /> Mã giảm giá
                </p>
                {appliedVoucher ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <div>
                      <p className="text-sm font-bold text-green-700">{appliedVoucher.code}</p>
                      <p className="text-xs text-green-600">
                        {appliedVoucher.free_ship
                          ? "Miễn phí giao hàng"
                          : appliedVoucher.description || `Giảm ${formatPrice(appliedVoucher.discount)}`}
                      </p>
                    </div>
                    <button onClick={removeVoucher} className="text-gray-400 hover:text-red-500 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      placeholder="Nhập mã..."
                      className="flex-1 rounded-xl text-sm uppercase"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyVoucher())}
                    />
                    <Button
                      type="button"
                      onClick={applyVoucher}
                      disabled={voucherLoading || !voucherCode.trim()}
                      variant="outline"
                      size="sm"
                      className="rounded-xl shrink-0 text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      {voucherLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Áp dụng"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Points redemption */}
              {user && pointsBalance > 0 && (
                <>
                  <Separator className="my-3" />
                  <div>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-yellow-600" /> Dùng điểm tích luỹ
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2.5 mb-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-yellow-700">Điểm hiện có: <strong>{pointsBalance}</strong></span>
                        <span className="text-[10px] text-yellow-600">1 điểm = {formatPrice(pointsValue)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0}
                          max={Math.min(
                            pointsBalance,
                            Math.floor((subtotal * 50) / 100 / pointsValue) // max 50% of subtotal
                          )}
                          value={pointsToUse}
                          onChange={(e) => setPointsToUse(Number(e.target.value))}
                          className="flex-1 accent-yellow-500 h-2"
                        />
                        <span className="text-sm font-bold text-yellow-700 w-16 text-right">{pointsToUse} đ.</span>
                      </div>
                      {pointsToUse > 0 && (
                        <p className="text-xs text-yellow-600 mt-1">
                          Giảm <strong>{formatPrice(pointsToUse * pointsValue)}</strong>
                        </p>
                      )}
                    </div>
                    {pointsMultiplier > 1 && (
                      <p className="text-[10px] text-green-600">
                        Đơn này sẽ tích x{pointsMultiplier} điểm (hạng {pointsTier === "gold" ? "Vàng" : pointsTier === "silver" ? "Bạc" : pointsTier === "platinum" ? "Kim Cương" : pointsTier === "bronze" ? "Đồng" : ""})
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Price breakdown */}
              <Separator className="my-3" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Tạm tính ({items.length} SP)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {comboSavings > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span className="flex items-center gap-1">
                      <PackagePlus className="w-3.5 h-3.5" /> Giảm combo
                    </span>
                    <span>-{formatPrice(comboSavings)}</span>
                  </div>
                )}

                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Ticket className="w-3.5 h-3.5" /> Voucher
                    </span>
                    <span>-{formatPrice(voucherDiscount)}</span>
                  </div>
                )}

                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-yellow-600">
                    <span className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" /> Điểm ({pointsToUse})
                    </span>
                    <span>-{formatPrice(pointsDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Phí giao hàng
                    {deliveryDistance && (
                      <span className="text-xs text-gray-400">({deliveryDistance}km)</span>
                    )}
                  </span>
                  <span className={effectiveDeliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                    {appliedVoucher?.free_ship ? (
                      <span className="flex items-center gap-1">
                        <span className="line-through text-gray-400">{formatPrice(deliveryFee)}</span>
                        <span className="text-green-600">Miễn phí</span>
                      </span>
                    ) : effectiveDeliveryFee === 0 ? "Miễn phí" : formatPrice(effectiveDeliveryFee)}
                  </span>
                </div>

                {qualifiedGifts.length > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5" /> Quà tặng ({qualifiedGifts.length})
                    </span>
                    <span className="font-medium">MIỄN PHÍ</span>
                  </div>
                )}

                {!customerLat && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                    Bấm "Xác định vị trí" để tính phí ship chính xác
                  </p>
                )}
              </div>

              <Separator className="my-3" />

              {/* Total */}
              <div className="flex justify-between font-extrabold text-lg">
                <span>Tổng cộng</span>
                <span className="text-green-600">{formatPrice(total)}</span>
              </div>

              {/* Total savings summary */}
              {(voucherDiscount > 0 || comboSavings > 0 || pointsDiscount > 0 || appliedVoucher?.free_ship || qualifiedGifts.length > 0) && (
                <div className="mt-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-3 py-2">
                  <p className="text-xs font-bold text-green-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                    Bạn được ưu đãi:
                  </p>
                  <ul className="text-[11px] text-green-600 mt-1 space-y-0.5">
                    {comboSavings > 0 && <li>Giảm combo: -{formatPrice(comboSavings)}</li>}
                    {voucherDiscount > 0 && <li>Voucher: -{formatPrice(voucherDiscount)}</li>}
                    {pointsDiscount > 0 && <li>Điểm tích luỹ: -{formatPrice(pointsDiscount)}</li>}
                    {appliedVoucher?.free_ship && <li>Miễn phí giao hàng</li>}
                    {qualifiedGifts.map((g) => (
                      <li key={g.id}>{g.gift_description}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-4 bg-green-600 hover:bg-green-700 rounded-xl h-12 font-bold text-base shadow-md hover:shadow-lg transition-all"
                size="lg"
                disabled={loading || (!deliveryInZone && !!customerLat)}
              >
                {loading ? "Đang xử lý..." : `Đặt hàng (${formatPrice(total)})`}
              </Button>

              {paymentMethod === "bank_transfer" && (
                <p className="text-xs text-gray-400 text-center mt-2">
                  Đơn hàng sẽ được xử lý sau khi xác nhận chuyển khoản
                </p>
              )}
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
