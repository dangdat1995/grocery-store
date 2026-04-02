import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

const SYSTEM_PROMPT = `Bạn là Giám đốc chiến lược AI của cửa hàng tạp hoá online. Bạn quản lý TOÀN BỘ hoạt động kinh doanh.

## VAI TRÒ
Bạn là chuyên gia tư vấn kinh doanh cấp cao. Bạn nhìn TỔNG THỂ: doanh thu, kho, khách hàng, đơn hàng, marketing — rồi đưa ra chiến lược TỐI ƯU và KHOA HỌC.
Trả lời bằng tiếng Việt, chuyên nghiệp, có cấu trúc rõ ràng, dùng emoji.

## NGUYÊN TẮC VÀNG
1. **DỮ LIỆU LÀ GỐC** — Mọi đề xuất PHẢI dựa trên dữ liệu thực. Trích dẫn con số cụ thể.
2. **GỢI Ý TRƯỚC → HỎI Ý KIẾN → THỰC HIỆN** — KHÔNG BAO GIỜ tạo action block ngay lần đầu. Luôn: (a) Phân tích, (b) Đề xuất kèm lý do, (c) Hỏi "Bạn duyệt phương án nào?", (d) Chờ admin đồng ý rồi mới tạo actions.
3. **CHIẾN LƯỢC TỔNG THỂ** — Khi được hỏi chiến lược, phải bao quát TẤT CẢ mảng: Đơn hàng → Kho → Doanh thu → Khách hàng → Marketing → Chăm sóc KH. Không bỏ sót.
4. **ƯU TIÊN THEO CẤP ĐỘ** — Mỗi đề xuất phải đánh dấu: 🔴 Khẩn cấp (làm ngay) | 🟡 Quan trọng (trong tuần) | 🟢 Cải thiện (trong tháng)
5. **HỎI KHI CẦN** — Nếu thiếu thông tin để ra quyết định, HỎI admin thay vì giả định.

## LOGIC PHÂN TÍCH CHIẾN LƯỢC

### 📦 XỬ LÝ ĐƠN HÀNG (ưu tiên cao nhất):
- Đơn chờ xử lý >0: 🔴 Nhắc admin xác nhận ngay
- Đơn huỷ nhiều: Phân tích nguyên nhân (giá? hết hàng? giao chậm?)
- Giá trị đơn trung bình thấp: Đề xuất combo, min order cho voucher

### 📦 QUẢN LÝ KHO:
- **Sắp hết (<10) + bán chạy**: 🔴 Nhập hàng GẤP, thông báo "Sắp hết nhanh tay!"
- **Sắp hết (<10) + bán chậm**: 🟢 Không cần nhập gấp
- **Tồn cao (>80)**: 🟡 Giải phóng kho: giảm 20-40%, tặng kèm đơn lớn, combo với SP bán chạy
- **SP bán chạy + tồn ổn**: Giữ nguyên, có thể tăng giá nhẹ nếu cầu > cung

### 💰 TĂNG DOANH THU:
- **Doanh thu tuần giảm**: 🔴 Flash sale + voucher kích cầu NGAY
- **Ngày bán yếu**: 🟡 Tạo event "Ngày Vàng" vào ngày yếu
- **Cuối tuần mạnh**: Tận dụng: combo giá trị cao, upsell
- **Đầu tháng**: "Đi chợ đầu tháng" giảm mạnh staples (gạo, dầu, nước mắm)
- **AOV thấp**: Voucher có min order, combo, tặng kèm đơn lớn

### 👥 CHĂM SÓC KHÁCH HÀNG:
- **Khách mới >50%**: 🟡 Voucher welcome 10-15%, nurture series
- **Tỷ lệ quay lại <50%**: 🔴 Voucher win-back "QUAYLAI", thông báo push
- **Khách Đồng gần lên Bạc**: 🟡 Voucher khuyến khích, thông báo "Bạn sắp lên hạng!"
- **Khách Vàng/Kim Cương**: 🟢 VIP exclusive, early access, free ship
- **Điểm tích luỹ nhiều chưa dùng**: 🟡 Push thông báo nhắc, ngày "Điểm x2"

### 🎯 MARKETING & TRUYỀN THÔNG:
- Mỗi chiến dịch = Banner + Sự kiện + Voucher + Thông báo (bộ 4 đồng bộ)
- Banner: tiêu đề hấp dẫn, tag nổi bật (HOT DEAL, FLASH SALE, FREE SHIP...)
- Thông báo: gửi push ngay khi tạo chiến dịch
- Tần suất: tối đa 2-3 chiến dịch/tuần, không spam

## HÀNH ĐỘNG (Actions)
Khi admin ĐỒNG Ý, tạo action blocks trong \`\`\`action ... \`\`\` code block.

### Tạo banner:
\`\`\`action
{"action":"create_banner","data":{"title":"...","subtitle":"...","tag":"HOT DEAL","gradient":"from-green-600 via-emerald-500 to-teal-500","link":"/san-pham","emoji":"🔥"}}
\`\`\`
Gradient: "from-green-600 via-emerald-500 to-teal-500" | "from-green-700 via-emerald-600 to-teal-600" | "from-emerald-600 via-green-500 to-lime-500" | "from-teal-600 via-emerald-500 to-green-500" | "from-emerald-500 via-teal-500 to-cyan-500"

### Tạo voucher:
\`\`\`action
{"action":"create_voucher","data":{"code":"...","description":"...","discount_type":"percent","discount_value":20,"max_discount":50000,"min_order_amount":200000,"usage_limit":100,"per_user_limit":1,"start_date":"...","end_date":"..."}}
\`\`\`
discount_type: "percent" | "fixed" | "free_ship"

### Tạo sự kiện:
\`\`\`action
{"action":"create_event","data":{"title":"...","description":"...","discount_type":"percent","discount_value":30,"min_order_amount":0,"start_date":"...","end_date":"..."}}
\`\`\`

### Gửi thông báo:
\`\`\`action
{"action":"create_notification","data":{"type":"promo","title":"...","message":"...","link":"/san-pham","is_global":true}}
\`\`\`
type: "promo" | "event" | "system" | "info"

Khi tạo actions:
- Tạo nhiều action blocks cùng lúc cho 1 chiến dịch hoàn chỉnh (banner + voucher + event + thông báo)
- Ngày bắt đầu = hôm nay, ngày kết thúc hợp lý (3-14 ngày)
- Mã voucher viết HOA, ngắn gọn, dễ nhớ`;

// Gather comprehensive store context
async function getStoreContext(supabase: any) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const [
    orders30d, orders7d, customers, topProducts, lowStock,
    highStock, slowMoving, vouchers, events, giftPromos, banners,
  ] = await Promise.all([
    supabase.from("orders").select("id, total, status, payment_status, created_at, delivery_fee").gte("created_at", thirtyDaysAgo),
    supabase.from("orders").select("id, total, status, payment_status, created_at").gte("created_at", sevenDaysAgo),
    supabase.from("profiles").select("id, loyalty_tier, total_orders, total_spent, points_balance, created_at, updated_at").eq("role", "customer"),
    supabase.from("order_items").select("product_name, quantity").order("quantity", { ascending: false }).limit(10),
    supabase.from("products").select("name, stock_quantity, price").lt("stock_quantity", 10).eq("is_active", true).order("stock_quantity").limit(10),
    supabase.from("products").select("name, stock_quantity, price").gt("stock_quantity", 80).eq("is_active", true).order("stock_quantity", { ascending: false }).limit(10),
    supabase.from("products").select("name, stock_quantity, price").gt("stock_quantity", 30).eq("is_active", true).order("updated_at").limit(8),
    supabase.from("vouchers").select("code, discount_type, discount_value, usage_limit, used_count, start_date, end_date, is_active").eq("is_active", true).order("created_at", { ascending: false }).limit(10),
    supabase.from("events").select("title, discount_type, discount_value, start_date, end_date, is_active").eq("is_active", true).order("created_at", { ascending: false }).limit(5),
    supabase.from("gift_promotions").select("name, min_order_amount, is_active").eq("is_active", true).limit(5),
    supabase.from("banners").select("title, is_active").eq("is_active", true).limit(5),
  ]);

  const allOrders = orders30d.data || [];
  const recentOrders = orders7d.data || [];
  const allCustomers = customers.data || [];

  const paidOrders30d = allOrders.filter((o: any) => o.payment_status === "paid");
  const paidOrders7d = recentOrders.filter((o: any) => o.payment_status === "paid");
  const revenue30d = paidOrders30d.reduce((s: number, o: any) => s + o.total, 0);
  const revenue7d = paidOrders7d.reduce((s: number, o: any) => s + o.total, 0);
  const prevWeekRevenue = paidOrders30d
    .filter((o: any) => {
      const d = new Date(o.created_at);
      return d >= new Date(now.getTime() - 14 * 86400000) && d < new Date(now.getTime() - 7 * 86400000);
    })
    .reduce((s: number, o: any) => s + o.total, 0);

  const revenueChange = prevWeekRevenue > 0 ? Math.round(((revenue7d - prevWeekRevenue) / prevWeekRevenue) * 100) : 0;

  // Day of week analysis
  const dayRevenue: Record<number, number> = {};
  const dayCount: Record<number, number> = {};
  paidOrders30d.forEach((o: any) => {
    const day = new Date(o.created_at).getDay();
    dayRevenue[day] = (dayRevenue[day] || 0) + o.total;
    dayCount[day] = (dayCount[day] || 0) + 1;
  });
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const weakDays = Object.entries(dayRevenue)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 2)
    .map(([d]) => dayNames[Number(d)]);
  const strongDays = Object.entries(dayRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([d]) => dayNames[Number(d)]);

  // Customer analysis
  const tierCounts: Record<string, number> = {};
  let totalPoints = 0;
  let usedPoints = 0;
  let newCustomers14d = 0;
  allCustomers.forEach((c: any) => {
    const t = c.loyalty_tier || "new";
    tierCounts[t] = (tierCounts[t] || 0) + 1;
    totalPoints += c.points_balance || 0;
    if (c.created_at && new Date(c.created_at) >= new Date(fourteenDaysAgo)) newCustomers14d++;
  });

  // Inactive customers (no order in 14 days but have at least 1 order)
  const activeCustomers = allCustomers.filter((c: any) => c.total_orders > 0);
  const returningRate = allCustomers.length > 0 ? Math.round((activeCustomers.length / allCustomers.length) * 100) : 0;

  const pendingOrders = allOrders.filter((o: any) => o.status === "pending").length;
  const deliveredOrders = allOrders.filter((o: any) => o.status === "delivered").length;
  const cancelledOrders = allOrders.filter((o: any) => o.status === "cancelled").length;
  const cancelRate = allOrders.length > 0 ? Math.round((cancelledOrders / allOrders.length) * 100) : 0;
  const avgOrderValue = paidOrders30d.length > 0 ? Math.round(revenue30d / paidOrders30d.length) : 0;

  // Active vouchers summary
  const voucherSummary = (vouchers.data || []).map((v: any) => {
    const usageRate = v.usage_limit > 0 ? Math.round((v.used_count / v.usage_limit) * 100) : 0;
    return `${v.code}(${v.discount_type === "percent" ? v.discount_value + "%" : v.discount_value.toLocaleString() + "đ"}, dùng ${v.used_count}/${v.usage_limit || "∞"} ${usageRate}%)`;
  }).join(", ");

  // Events summary
  const eventSummary = (events.data || []).map((e: any) => {
    const status = new Date(e.end_date) < now ? "hết" : new Date(e.start_date) > now ? "sắp tới" : "đang chạy";
    return `${e.title}(${e.discount_value}${e.discount_type === "percent" ? "%" : "đ"}, ${status})`;
  }).join(", ");

  return `
📊 BÁO CÁO TỔNG THỂ CỬA HÀNG (thời gian thực):

═══ 💰 DOANH THU & ĐƠN HÀNG ═══
- 30 ngày: ${revenue30d.toLocaleString("vi-VN")}đ (${paidOrders30d.length} đơn đã TT)
- 7 ngày: ${revenue7d.toLocaleString("vi-VN")}đ (${paidOrders7d.length} đơn) | So tuần trước: ${revenueChange > 0 ? "+" : ""}${revenueChange}%
- Giá trị đơn trung bình (AOV): ${avgOrderValue.toLocaleString("vi-VN")}đ
- Ngày mạnh: ${strongDays.join(", ")} | Ngày yếu: ${weakDays.join(", ")}
- 🔴 Đơn chờ xử lý: ${pendingOrders} | Đã giao: ${deliveredOrders} | Huỷ: ${cancelledOrders} (${cancelRate}%)

═══ 📦 KHO HÀNG ═══
⚠️ Sắp hết (<10, cần nhập):
${(lowStock.data || []).map((p: any) => `- ${p.name}: còn ${p.stock_quantity} (${p.price?.toLocaleString()}đ)`).join("\n") || "Không có"}
📦 Tồn cao (>80, cần giải phóng):
${(highStock.data || []).map((p: any) => `- ${p.name}: còn ${p.stock_quantity} (${p.price?.toLocaleString()}đ)`).join("\n") || "Không có"}
🐌 Ít biến động (cần kích cầu):
${(slowMoving.data || []).map((p: any) => `- ${p.name}: còn ${p.stock_quantity} (${p.price?.toLocaleString()}đ)`).join("\n") || "Không có"}

═══ 📈 SẢN PHẨM BÁN CHẠY ═══
${(topProducts.data || []).slice(0, 7).map((p: any, i: number) => `${i + 1}. ${p.product_name} (${p.quantity} đã bán)`).join("\n")}

═══ 👥 KHÁCH HÀNG (${allCustomers.length} tổng) ═══
- Phân hạng: ${Object.entries(tierCounts).map(([t, c]) => `${t}:${c}`).join(", ")}
- Khách mới 14 ngày qua: ${newCustomers14d} | Tỷ lệ quay lại: ${returningRate}%
- Điểm lưu hành: ${totalPoints.toLocaleString()} (= ${(totalPoints * 10).toLocaleString()}đ, cần nhắc dùng)

═══ 🎯 MARKETING HIỆN TẠI ═══
🖼️ Banner đang chạy: ${(banners.data || []).map((b: any) => b.title).join(", ") || "Chưa có"}
🎟️ Voucher: ${voucherSummary || "Chưa có"}
🎉 Sự kiện: ${eventSummary || "Chưa có"}
🎁 Quà tặng: ${(giftPromos.data || []).map((g: any) => `${g.name}(đơn ≥${g.min_order_amount?.toLocaleString()}đ)`).join(", ") || "Chưa có"}

═══ 🕐 THỜI ĐIỂM ═══
Hôm nay: ${dayNames[now.getDay()]} ${now.toLocaleDateString("vi-VN")} ${now.toLocaleTimeString("vi-VN")}`.trim();
}

// ============== DEMO RESPONSES ==============
function getDemoResponse(message: string, history: any[]): string {
  const lower = message.toLowerCase();
  const isConfirm = /^(ok|được|tạo|đồng ý|thực hiện|tạo đi|tạo luôn|chạy|lên|duyệt|yes|ừ|ờ|đi|làm đi|go)/i.test(lower);

  // Check if previous message was a suggestion
  const lastAssistant = [...(history || [])].reverse().find((m: any) => m.role === "assistant");
  const hadSuggestion = lastAssistant?.content?.includes("Bạn muốn tôi") || lastAssistant?.content?.includes("muốn tôi tạo") || lastAssistant?.content?.includes("thực hiện không");

  if (isConfirm && hadSuggestion) {
    // Determine what was suggested and create actions
    const prev = lastAssistant?.content?.toLowerCase() || "";
    if (prev.includes("chiến dịch") || prev.includes("campaign") || prev.includes("kế hoạch")) {
      return `👍 Tuyệt! Tôi tạo chiến dịch ngay:

**1. 🖼️ Banner trang chủ:**
\`\`\`action
{"action":"create_banner","data":{"title":"Flash Sale Giữa Tuần","subtitle":"Giảm 30% Rau củ + Freeship đơn 200k — Chỉ T3-T4!","tag":"SALE T3-T4","gradient":"from-emerald-600 via-green-500 to-lime-500","link":"/san-pham","emoji":"⚡"}}
\`\`\`

**2. 🎟️ Voucher kích cầu ngày yếu:**
\`\`\`action
{"action":"create_voucher","data":{"code":"GIUATUAN30","description":"Giảm 30% tối đa 60k — Chỉ T3+T4","discount_type":"percent","discount_value":30,"max_discount":60000,"min_order_amount":150000,"usage_limit":50,"per_user_limit":1,"start_date":"2026-04-07T00:00:00","end_date":"2026-04-08T23:59:59"}}
\`\`\`

**3. 🎉 Sự kiện Rau sạch:**
\`\`\`action
{"action":"create_event","data":{"title":"Ngày Vàng Giữa Tuần","description":"Giảm 30% rau củ quả + freeship đơn từ 200k. Áp dụng T3-T4 hàng tuần!","discount_type":"percent","discount_value":30,"min_order_amount":150000,"start_date":"2026-04-07T00:00:00","end_date":"2026-04-08T23:59:59"}}
\`\`\`

**4. 📢 Thông báo cho khách:**
\`\`\`action
{"action":"create_notification","data":{"type":"promo","title":"⚡ Flash Sale Giữa Tuần!","message":"Giảm 30% rau củ + Freeship đơn 200k. Chỉ T3-T4! Dùng mã GIUATUAN30","link":"/san-pham","is_global":true}}
\`\`\`

Bấm **Thực hiện** từng mục nhé!`;
    }

    if (prev.includes("voucher") || prev.includes("mã")) {
      return `👍 Tạo ngay bộ voucher theo nhóm khách:

**1. Voucher khách mới:**
\`\`\`action
{"action":"create_voucher","data":{"code":"WELCOME15","description":"Chào khách mới — Giảm 15% tối đa 30k","discount_type":"percent","discount_value":15,"max_discount":30000,"min_order_amount":100000,"usage_limit":200,"per_user_limit":1,"start_date":"2026-04-02T00:00:00","end_date":"2026-04-30T23:59:59"}}
\`\`\`

**2. Voucher khách cũ quay lại:**
\`\`\`action
{"action":"create_voucher","data":{"code":"QUAYLAI20","description":"Lâu rồi không gặp — Giảm 20% tối đa 50k","discount_type":"percent","discount_value":20,"max_discount":50000,"min_order_amount":200000,"usage_limit":100,"per_user_limit":1,"start_date":"2026-04-02T00:00:00","end_date":"2026-04-15T23:59:59"}}
\`\`\`

**3. Voucher VIP (Vàng+):**
\`\`\`action
{"action":"create_voucher","data":{"code":"VIP25","description":"Ưu đãi VIP — Giảm 25% tối đa 100k + Freeship","discount_type":"percent","discount_value":25,"max_discount":100000,"min_order_amount":300000,"usage_limit":30,"per_user_limit":1,"start_date":"2026-04-02T00:00:00","end_date":"2026-04-30T23:59:59"}}
\`\`\`

**4. Thông báo cho khách:**
\`\`\`action
{"action":"create_notification","data":{"type":"promo","title":"🎁 Voucher đặc biệt dành riêng cho bạn!","message":"Kiểm tra mục Voucher để nhận ưu đãi giảm đến 25%. Số lượng có hạn!","link":"/tai-khoan","is_global":true}}
\`\`\``;
    }

    if (prev.includes("tồn kho") || prev.includes("giải phóng") || prev.includes("hết hàng")) {
      return `👍 Tạo chiến dịch giải phóng kho:

**1. Banner xả kho:**
\`\`\`action
{"action":"create_banner","data":{"title":"Xả Kho Giá Sốc","subtitle":"Giảm đến 40% nhiều sản phẩm — Số lượng có hạn!","tag":"XẢ KHO","gradient":"from-teal-600 via-emerald-500 to-green-500","link":"/san-pham","emoji":"📦"}}
\`\`\`

**2. Voucher mua nhiều giảm nhiều:**
\`\`\`action
{"action":"create_voucher","data":{"code":"MUANHIEU40","description":"Đơn từ 500k giảm 40% tối đa 120k","discount_type":"percent","discount_value":40,"max_discount":120000,"min_order_amount":500000,"usage_limit":80,"per_user_limit":2,"start_date":"2026-04-02T00:00:00","end_date":"2026-04-09T23:59:59"}}
\`\`\`

**3. Thông báo:**
\`\`\`action
{"action":"create_notification","data":{"type":"promo","title":"📦 Xả Kho Giá Sốc!","message":"Giảm đến 40% nhiều SP. Dùng mã MUANHIEU40 cho đơn từ 500k. Nhanh tay, số lượng có hạn!","link":"/san-pham","is_global":true}}
\`\`\``;
    }

    // Generic confirm
    return `👍 Tạo ngay cho bạn:

\`\`\`action
{"action":"create_banner","data":{"title":"Ưu Đãi Hôm Nay","subtitle":"Giảm giá đặc biệt — Chỉ trong hôm nay!","tag":"TODAY","gradient":"from-green-600 via-emerald-500 to-teal-500","link":"/san-pham","emoji":"🎯"}}
\`\`\`

\`\`\`action
{"action":"create_notification","data":{"type":"promo","title":"🎯 Ưu đãi hôm nay!","message":"Nhiều sản phẩm giảm giá đặc biệt. Đặt hàng ngay!","link":"/san-pham","is_global":true}}
\`\`\``;
  }

  // ---- Analysis & suggestions (NO actions yet) ----

  if (lower.includes("doanh thu") || lower.includes("revenue") || lower.includes("bán hàng")) {
    return `💰 **Phân tích doanh thu:**

📅 **30 ngày:** 8.500.000đ (45 đơn đã TT)
📅 **7 ngày:** 2.100.000đ (12 đơn) — **+15%** so với tuần trước
📅 **Trung bình ngày:** ~283k/ngày

📊 **Phân tích theo ngày:**
- 📈 Ngày bán tốt: **T7, CN** (trung bình 450k/ngày)
- 📉 Ngày yếu: **T3, T4** (trung bình 180k/ngày) → chênh lệch 60%!

🎯 **Đề xuất:**
1. **Flash Sale giữa tuần (T3-T4)**: Giảm 20-30% rau củ + freeship để kéo doanh thu ngày yếu
2. **Combo cuối tuần**: Tận dụng traffic cao T7-CN, tạo combo giá trị cao hơn
3. **Voucher đơn tối thiểu 300k**: Tăng giá trị đơn trung bình

💡 **Bạn muốn tôi tạo chiến dịch Flash Sale giữa tuần không?** Tôi sẽ tạo: banner + voucher + sự kiện + thông báo push.`;
  }

  if (lower.includes("khách") || lower.includes("customer") || lower.includes("thân thiết")) {
    return `👥 **Phân tích khách hàng:**

📊 **Phân bổ hạng thành viên:**
| Hạng | Số lượng | Tỷ lệ |
|------|---------|-------|
| 🌱 Mới | 120 | 60% |
| 🥉 Đồng | 45 | 22% |
| 🥈 Bạc | 20 | 10% |
| 🥇 Vàng | 12 | 6% |
| 💎 Kim Cương | 3 | 2% |

📈 **Khách mới 14 ngày qua:** 18 người
🔄 **Tỷ lệ quay lại:** 40% (thấp — cần cải thiện!)
⭐ **Điểm lưu hành:** 12.500 điểm (= 125.000đ, tỷ lệ dùng chỉ 26%)

🎯 **Đề xuất theo nhóm:**
1. **120 khách mới** → Voucher "WELCOME15" giảm 15% đơn đầu (kích hoạt)
2. **72 khách chưa quay lại >14 ngày** → Voucher "QUAYLAI20" giảm 20% (win-back)
3. **45 khách Đồng** → Voucher "LENHAN10" giảm 10% (thúc đẩy lên Bạc)
4. **15 khách Vàng+Kim Cương** → Voucher VIP "VIP25" giảm 25% (giữ chân)
5. **Điểm tích luỹ**: Gửi thông báo nhắc khách dùng điểm

💡 **Bạn muốn tôi tạo bộ voucher cho từng nhóm khách không?**`;
  }

  if (lower.includes("kho") || lower.includes("tồn") || lower.includes("hết hàng") || lower.includes("giải phóng")) {
    return `📦 **Phân tích kho hàng:**

⚠️ **SẮP HẾT (<10 đơn vị) — Cần nhập gấp:**
- Gạo ST25 5kg: còn **3** → bán chạy #1, CẦN NHẬP GẤP
- Nước mắm Phú Quốc: còn **5**
- Sữa TH 1L: còn **8**

📦 **TỒN KHO CAO (>80) — Cần giải phóng:**
- Mì gói Hảo Hảo: còn **156** (giá 5.000đ)
- Nước ngọt Coca 330ml: còn **120** (giá 10.000đ)
- Dầu ăn Neptune 1L: còn **95** (giá 45.000đ)

📈 **Top bán chạy:** Rau muống (45), Gạo ST25 (32), Cà chua (28)

🎯 **Đề xuất:**
1. **SP tồn cao** → Giảm 30-40% hoặc tặng kèm khi mua đơn lớn
2. **Mì Hảo Hảo** → Flash sale "Mua 10 tặng 2", hoặc combo với SP khác
3. **Nước ngọt** → Bundle "Mua 6 giá 5" hoặc tặng kèm đơn từ 300k
4. **Gạo ST25 sắp hết** → KHÔNG giảm giá, thông báo "Sắp hết, nhanh tay!"
5. **SP bán chạy** → Đảm bảo nhập đủ hàng, tạo banner highlight

💡 **Bạn muốn tôi tạo chiến dịch giải phóng kho không?** (Banner xả kho + voucher mua nhiều + thông báo)`;
  }

  if (lower.includes("voucher") || lower.includes("mã giảm") || lower.includes("giảm giá")) {
    return `🎟️ **Phân tích voucher hiện tại:**

📊 **Đang hoạt động:** 4 voucher
- GIAM20K: dùng 23/100 (23%) — hiệu quả trung bình
- FREESHIP: dùng 12/50 (24%) — ổn
- GIAM50K: **hết quota** 50/50 — rất hot!
- SALE10: sắp hết hạn

🎯 **Nhận xét:**
- Voucher GIAM50K cháy hàng → khách thích giảm tiền cố định
- Tỷ lệ dùng trung bình 23-24% → cần quảng bá mạnh hơn
- Chưa có voucher phân nhóm theo hạng khách

💡 **Đề xuất chiến lược mới:**
1. **Khách mới (60%)** → "WELCOME15" giảm 15%, đơn tối thiểu 100k
2. **Khách cũ chưa quay lại** → "QUAYLAI20" giảm 20%, đơn tối thiểu 200k
3. **Khách VIP (Vàng+)** → "VIP25" giảm 25% tối đa 100k + free ship
4. **Flash sale** → "FLASH40" giảm 40%, giới hạn 30 mã, 24h (tạo urgency)

**Bạn muốn tôi tạo bộ voucher này không?** Tôi sẽ tạo cả thông báo push kèm theo.`;
  }

  if (lower.includes("sự kiện") || lower.includes("event") || lower.includes("chương trình")) {
    return `🎉 **Gợi ý sự kiện khuyến mãi:**

Dựa trên dữ liệu hiện tại, tôi đề xuất:

📅 **Sự kiện 1: "Ngày Vàng Giữa Tuần"**
- Lý do: T3-T4 doanh thu thấp nhất (-60% so T7)
- Nội dung: Giảm 25% rau củ quả, freeship đơn 200k
- Thời gian: Mỗi T3-T4 hàng tuần

📅 **Sự kiện 2: "Combo Cuối Tuần"**
- Lý do: T7-CN traffic cao, cần tăng giá trị đơn
- Nội dung: Combo Bếp Nhà (rau+thịt+gia vị) giảm 15%
- Thời gian: Mỗi T6-CN

📅 **Sự kiện 3: "Xả Kho Tháng 4"**
- Lý do: Mì gói (156), Nước ngọt (120) tồn cao
- Nội dung: Giảm 30-40% SP tồn kho, tặng kèm đơn lớn
- Thời gian: 1 tuần

**Bạn muốn tôi tạo sự kiện nào?** (Gõ 1, 2, 3 hoặc "tất cả")`;
  }

  if (lower.includes("thông báo") || lower.includes("notify") || lower.includes("push")) {
    return `📢 **Gợi ý thông báo:**

Dựa trên tình hình, tôi đề xuất gửi:

1. **Nhắc điểm tích luỹ** → 12.500 điểm chưa dùng, nhắc khách đổi
2. **SP sắp hết** → "Gạo ST25 sắp hết, nhanh tay đặt!"
3. **Khuyến mãi mới** → Thông báo kèm voucher/sự kiện vừa tạo
4. **Chào khách mới** → Welcome message cho 18 khách mới tuần qua

**Bạn muốn gửi thông báo nào?** (Gõ số hoặc "tất cả")`;
  }

  if (lower.includes("tích điểm") || lower.includes("points") || lower.includes("điểm")) {
    return `⭐ **Phân tích hệ thống tích điểm:**

📊 **Tổng quan:**
- Tổng điểm lưu hành: **12.500** điểm (= 125.000đ)
- Tỷ lệ dùng điểm: **26%** — khá thấp!
- Khách có điểm nhưng chưa dùng: ~74%

🎯 **Vấn đề:** Khách không biết hoặc quên dùng điểm

💡 **Đề xuất:**
1. Gửi thông báo "Bạn có X điểm chưa dùng!"
2. Tạo ngày "Điểm x2" vào cuối tháng
3. Cho phép đổi điểm lấy quà tặng kèm
4. Hiển thị điểm nổi bật hơn trên trang thanh toán

**Bạn muốn tôi gửi thông báo nhắc khách dùng điểm không?**`;
  }

  if (lower.includes("tổng quan") || lower.includes("tình hình") || lower.includes("overview")) {
    return `📊 **Tổng quan cửa hàng hôm nay:**

💰 **Doanh thu:**
- 30 ngày: **8.500.000đ** (45 đơn) | 7 ngày: **2.100.000đ** (+15%)
- Trung bình: 283k/ngày | Đơn chờ xử lý: **3**

👥 **Khách hàng:** 200 tổng
- 60% mới, 22% Đồng, 10% Bạc, 6% Vàng, 2% Kim Cương
- Tỷ lệ quay lại: 40% (cần cải thiện)

📦 **Kho:** 3 SP sắp hết (Gạo ST25!) | 3 SP tồn cao cần giải phóng
🎟️ **Voucher:** 4 đang chạy, GIAM50K đã hết quota
⭐ **Điểm:** 12.500 chưa dùng (chỉ 26% tỷ lệ redemption)

🎯 **Top 3 việc nên làm ngay:**
1. ⚡ Xử lý **3 đơn chờ** xác nhận
2. 📦 Nhập thêm **Gạo ST25** (còn 3, bán chạy #1)
3. 🎟️ Tạo voucher mới thay GIAM50K đã hết

💡 Bạn muốn tôi giúp gì? Tôi có thể:
- Tạo **chiến dịch khuyến mãi** hoàn chỉnh
- Tạo **voucher** theo nhóm khách hàng
- Tạo **sự kiện giải phóng kho** cho SP tồn cao
- Gửi **thông báo** nhắc khách dùng điểm`;
  }

  // Default
  return `📊 **Tổng quan cửa hàng:**

💰 Doanh thu 30 ngày: **8.500.000đ** (45 đơn)
📈 Tăng 15% so với tháng trước

🎯 **Gợi ý hôm nay:**
1. Có **3 đơn chờ xác nhận** — nên xử lý sớm
2. **Gạo ST25** đang bán chạy nhất — cân nhắc tăng tồn kho
3. Khách hạng Vàng tăng 2 người → chiến lược giữ chân tốt

💡 Bạn muốn tôi giúp gì? Tôi có thể:
- Tạo **chiến dịch khuyến mãi** hoàn chỉnh
- Tạo **voucher** theo nhóm khách hàng
- Tạo **sự kiện giải phóng kho**
- Gửi **thông báo** cho khách hàng`;
}

export async function POST(request: NextRequest) {
  const { message, history } = await request.json();

  if (!message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  if (isDemo) {
    const response = getDemoResponse(message, history || []);
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ response });
  }

  // Production: Call Claude API
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI chưa được cấu hình (thiếu ANTHROPIC_API_KEY)" }, { status: 500 });
  }

  try {
    const supabase = await createClient();
    const storeContext = await getStoreContext(supabase);

    const messages = [
      ...(history || []).slice(-10).map((h: any) => ({
        role: h.role,
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        system: `${SYSTEM_PROMPT}\n\n${storeContext}`,
        messages,
      }),
    });

    const data = await res.json();
    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const response = data.content?.[0]?.text || "Xin lỗi, tôi không thể trả lời lúc này.";
    return NextResponse.json({ response });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi AI" }, { status: 500 });
  }
}
