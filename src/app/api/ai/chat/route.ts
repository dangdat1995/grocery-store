import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

// System prompt for the AI assistant
const SYSTEM_PROMPT = `Bạn là trợ lý AI quản lý cửa hàng tạp hoá online. Bạn giúp admin:
- Phân tích doanh thu, đơn hàng, khách hàng
- Gợi ý chiến lược khuyến mãi, voucher, tích điểm
- Tư vấn quản lý kho, sản phẩm bán chạy
- Trả lời câu hỏi về hệ thống

Luôn trả lời ngắn gọn, chuyên nghiệp, bằng tiếng Việt.
Khi được cung cấp dữ liệu cửa hàng, hãy phân tích và đưa ra gợi ý cụ thể.
Dùng emoji phù hợp để dễ đọc.`;

// Gather store context data
async function getStoreContext(supabase: any) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [orders30d, orders7d, customers, topProducts, lowStock] = await Promise.all([
    supabase.from("orders").select("id, total, status, payment_status, created_at").gte("created_at", thirtyDaysAgo),
    supabase.from("orders").select("id, total, status").gte("created_at", sevenDaysAgo),
    supabase.from("profiles").select("id, loyalty_tier, total_orders, total_spent, points_balance").eq("role", "customer"),
    supabase.from("order_items").select("product_name, quantity").order("quantity", { ascending: false }).limit(10),
    supabase.from("products").select("name, stock_quantity").lt("stock_quantity", 10).eq("is_active", true).order("stock_quantity").limit(10),
  ]);

  const allOrders = orders30d.data || [];
  const recentOrders = orders7d.data || [];
  const allCustomers = customers.data || [];

  const revenue30d = allOrders.filter((o: any) => o.payment_status === "paid").reduce((s: number, o: any) => s + o.total, 0);
  const revenue7d = recentOrders.filter((o: any) => o.payment_status === "paid").reduce((s: number, o: any) => s + o.total, 0);
  const pendingOrders = allOrders.filter((o: any) => o.status === "pending").length;
  const deliveredOrders = allOrders.filter((o: any) => o.status === "delivered").length;

  const tierCounts: Record<string, number> = {};
  allCustomers.forEach((c: any) => {
    const t = c.loyalty_tier || "new";
    tierCounts[t] = (tierCounts[t] || 0) + 1;
  });

  return `
📊 DỮ LIỆU CỬA HÀNG (tự động cập nhật):

💰 Doanh thu:
- 30 ngày qua: ${revenue30d.toLocaleString("vi-VN")}đ (${allOrders.length} đơn)
- 7 ngày qua: ${revenue7d.toLocaleString("vi-VN")}đ (${recentOrders.length} đơn)
- Đơn chờ xử lý: ${pendingOrders}
- Đơn đã giao: ${deliveredOrders}

👥 Khách hàng (${allCustomers.length} tổng):
${Object.entries(tierCounts).map(([t, c]) => `- ${t}: ${c} người`).join("\n")}

📦 Top sản phẩm bán chạy:
${(topProducts.data || []).slice(0, 5).map((p: any, i: number) => `${i + 1}. ${p.product_name} (${p.quantity} đã bán)`).join("\n")}

⚠️ Sắp hết hàng:
${(lowStock.data || []).map((p: any) => `- ${p.name}: còn ${p.stock_quantity}`).join("\n") || "Không có"}
`.trim();
}

const DEMO_RESPONSES: Record<string, string> = {
  default: `📊 **Tổng quan cửa hàng:**

💰 Doanh thu 30 ngày: **8.500.000đ** (45 đơn)
📈 Tăng 15% so với tháng trước

🎯 **Gợi ý hôm nay:**
1. Có **3 đơn chờ xác nhận** — nên xử lý sớm
2. **Gạo ST25** đang bán chạy nhất — cân nhắc tăng tồn kho
3. Khách hạng Vàng tăng 2 người → chiến lược giữ chân tốt

💡 **Khuyến mãi:**
- Nên tạo voucher giảm 10% cho khách hạng Bạc+ để kích thích mua thêm
- Combo "Bếp Nhà" đang match rate cao → cân nhắc thêm combo mới`,
};

export async function POST(request: NextRequest) {
  const { message, history } = await request.json();

  if (!message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  if (isDemo) {
    // Smart demo responses
    const lower = message.toLowerCase();
    let response = DEMO_RESPONSES.default;

    if (lower.includes("doanh thu") || lower.includes("revenue")) {
      response = `💰 **Phân tích doanh thu:**

📅 **30 ngày qua:** 8.500.000đ (45 đơn)
📅 **7 ngày qua:** 2.100.000đ (12 đơn)
📅 **Hôm nay:** 350.000đ (2 đơn)

📈 **Xu hướng:** Tăng 15% so với tháng trước
🏆 **Ngày bán tốt nhất:** Thứ 7 (trung bình 450k/ngày)
📉 **Ngày yếu nhất:** Thứ 3 (trung bình 180k/ngày)

💡 **Gợi ý:** Tạo flash sale vào thứ 3 để cân bằng doanh thu các ngày trong tuần.`;
    } else if (lower.includes("khách") || lower.includes("customer")) {
      response = `👥 **Phân tích khách hàng:**

📊 **Phân bổ hạng:**
- 🌱 Mới: 120 người (60%)
- 🥉 Đồng: 45 người (22%)
- 🥈 Bạc: 20 người (10%)
- 🥇 Vàng: 12 người (6%)
- 💎 Kim Cương: 3 người (2%)

🎯 **Insights:**
- 45 khách Đồng cần thêm 7 đơn để lên Bạc → gửi voucher khuyến khích
- 3 khách Vàng gần đạt 50 đơn → sắp lên Kim Cương, nên chăm sóc đặc biệt
- 30% khách mới chưa quay lại sau đơn đầu → cần voucher welcome back

💡 **Gợi ý:** Tạo voucher "QUAYLAI-10" giảm 10% cho khách >14 ngày chưa mua.`;
    } else if (lower.includes("voucher") || lower.includes("khuyến mãi") || lower.includes("giảm giá")) {
      response = `🎟️ **Phân tích voucher:**

📊 **Đang hoạt động:** 4 voucher
- GIAM20K: dùng 23/100 (23%)
- FREESHIP: dùng 12/50 (24%)
- SALE10: hết hạn
- GIAM50K: dùng hết 50/50

🎯 **Gợi ý chiến lược:**
1. **Khách mới:** Tạo voucher giảm 15% tối đa 30k, đơn tối thiểu 150k
2. **Khách Đồng:** Giảm 8% tối đa 40k — khuyến khích lên Bạc
3. **Khách Vàng+:** Giảm 12% tối đa 80k + free ship — giữ chân VIP
4. **Flash sale:** Giảm 20% tối đa 50k, giới hạn 20 mã, 24h — tạo urgency

💡 Nên phát voucher theo hạng thay vì phát đồng loạt → tăng tỷ lệ sử dụng 35%.`;
    } else if (lower.includes("kho") || lower.includes("tồn") || lower.includes("hết hàng")) {
      response = `📦 **Tình trạng kho:**

⚠️ **Sắp hết hàng (< 10):**
- Gạo ST25 5kg: còn 3 → **CẦN NHẬP GẤP**
- Nước mắm Phú Quốc: còn 5
- Sữa TH 1L: còn 8

📈 **Bán chạy nhất tuần:**
1. Rau muống (45 bó)
2. Gạo ST25 (32 bao)
3. Cà chua (28 kg)
4. Thịt ba chỉ (25 kg)
5. Trứng gà (20 vỉ)

💡 **Gợi ý:**
- Nhập thêm Gạo ST25 ít nhất 50 bao
- Rau muống tiêu thụ nhanh → đặt hàng mỗi 2 ngày
- Cân nhắc thêm sản phẩm mới: rau xà lách, cải thìa (đang trend)`;
    } else if (lower.includes("tích điểm") || lower.includes("points") || lower.includes("điểm")) {
      response = `⭐ **Phân tích hệ thống tích điểm:**

📊 **Tổng quan:**
- Tổng điểm phát: 12.500 điểm
- Tổng điểm đã dùng: 3.200 điểm (26%)
- Điểm đang lưu hành: 9.300 điểm

💰 **Giá trị quy đổi:** 93.000đ (nợ tiềm ẩn)

🎯 **Insights:**
- Tỷ lệ dùng điểm 26% → khá thấp, khách có thể quên
- Khách Vàng+ tích điểm x2-x3 nhưng ít dùng → nhắc nhở

💡 **Gợi ý:**
1. Thêm thông báo "Bạn có X điểm!" trên trang checkout
2. Tạo ngày "Điểm x2" hàng tháng để kích thích mua sắm
3. Cho phép dùng điểm đổi quà thay vì chỉ giảm giá`;
    }

    // Simulate delay
    await new Promise((r) => setTimeout(r, 500));
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
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
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
