import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder");

// Map action → admin page path to revalidate + navigation link
const ACTION_PAGES: Record<string, { revalidate: string[]; link: string; linkLabel: string }> = {
  create_banner: {
    revalidate: ["/admin/quang-cao", "/"],
    link: "/admin/quang-cao",
    linkLabel: "Xem quảng cáo",
  },
  create_voucher: {
    revalidate: ["/admin/voucher"],
    link: "/admin/voucher",
    linkLabel: "Xem voucher",
  },
  create_event: {
    revalidate: ["/admin/su-kien"],
    link: "/admin/su-kien",
    linkLabel: "Xem sự kiện",
  },
  create_notification: {
    revalidate: ["/admin/thong-bao"],
    link: "/admin/thong-bao",
    linkLabel: "Xem thông báo",
  },
};

export async function POST(request: NextRequest) {
  const { action, data } = await request.json();

  if (!action || !data) {
    return NextResponse.json({ error: "Missing action or data" }, { status: 400 });
  }

  const pageInfo = ACTION_PAGES[action];

  if (isDemo) {
    const demoItem = buildDemoItem(action, data);
    return NextResponse.json({
      success: true,
      demo: true,
      message: getDemoMessage(action, data),
      link: pageInfo?.link,
      linkLabel: pageInfo?.linkLabel,
      item: demoItem,
    });
  }

  const supabase = await createClient();

  try {
    let result: any;

    switch (action) {
      case "create_banner": {
        const { data: banner, error } = await supabase
          .from("banners")
          .insert({
            title: data.title,
            subtitle: data.subtitle || null,
            tag: data.tag || null,
            tag_color: data.tag_color || "bg-yellow-400 text-yellow-900",
            link: data.link || "/san-pham",
            gradient: data.gradient || "from-green-600 via-emerald-500 to-teal-500",
            emoji: data.emoji || null,
            media_type: data.media_type || "none",
            media_url: data.media_url || null,
            sort_order: data.sort_order ?? 0,
            is_active: true,
          })
          .select()
          .single();
        if (error) throw error;
        result = { message: `Đã tạo banner "${data.title}"`, banner };
        break;
      }

      case "create_voucher": {
        const { data: voucher, error } = await supabase
          .from("vouchers")
          .insert({
            code: data.code.toUpperCase().trim(),
            description: data.description || null,
            discount_type: data.discount_type || "percent",
            discount_value: data.discount_value || 0,
            max_discount: data.max_discount || null,
            min_order_amount: data.min_order_amount || 0,
            usage_limit: data.usage_limit || 0,
            per_user_limit: data.per_user_limit || 1,
            start_date: data.start_date,
            end_date: data.end_date,
            is_active: true,
          })
          .select()
          .single();
        if (error) throw error;
        result = { message: `Đã tạo voucher "${data.code}"`, voucher };
        break;
      }

      case "create_event": {
        const slug = data.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        const { data: event, error } = await supabase
          .from("events")
          .insert({
            title: data.title,
            slug,
            description: data.description || null,
            discount_type: data.discount_type || "percent",
            discount_value: data.discount_value || 0,
            min_order_amount: data.min_order_amount || 0,
            start_date: data.start_date,
            end_date: data.end_date,
            is_active: true,
            media: data.media || [],
          })
          .select()
          .single();
        if (error) throw error;
        result = { message: `Đã tạo sự kiện "${data.title}"`, event };
        break;
      }

      case "create_notification": {
        const { data: notif, error } = await supabase
          .from("notifications")
          .insert({
            type: data.type || "promo",
            title: data.title,
            message: data.message,
            link: data.link || null,
            is_global: data.is_global !== false,
          })
          .select()
          .single();
        if (error) throw error;
        result = { message: `Đã gửi thông báo "${data.title}"`, notif };
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    // Revalidate relevant pages so they show updated data
    if (pageInfo?.revalidate) {
      pageInfo.revalidate.forEach((path) => {
        try { revalidatePath(path); } catch {}
      });
    }

    // Extract the created item for client-side state updates
    const item = result.banner || result.voucher || result.event || result.notif;

    return NextResponse.json({
      success: true,
      ...result,
      item,
      link: pageInfo?.link,
      linkLabel: pageInfo?.linkLabel,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi thực thi" }, { status: 500 });
  }
}

function buildDemoItem(action: string, data: any): any {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  switch (action) {
    case "create_banner":
      return {
        id,
        title: data.title,
        subtitle: data.subtitle || "",
        tag: data.tag || "",
        tag_color: data.tag_color || "bg-yellow-400 text-yellow-900",
        link: data.link || "/san-pham",
        gradient: data.gradient || "from-green-600 via-emerald-500 to-teal-500",
        emoji: data.emoji || "",
        media_type: data.media_type || "none",
        media_url: data.media_url || "",
        sort_order: data.sort_order ?? 0,
        is_active: true,
      };
    case "create_voucher":
      return {
        id,
        code: data.code?.toUpperCase().trim(),
        description: data.description || "",
        discount_type: data.discount_type || "percent",
        discount_value: data.discount_value || 0,
        max_discount: data.max_discount || null,
        min_order_amount: data.min_order_amount || 0,
        usage_limit: data.usage_limit || 0,
        used_count: 0,
        per_user_limit: data.per_user_limit || 1,
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: true,
        created_at: now,
      };
    case "create_event":
      return {
        id,
        title: data.title,
        description: data.description || "",
        discount_type: data.discount_type || "percent",
        discount_value: data.discount_value || 0,
        min_order_amount: data.min_order_amount || 0,
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: true,
        event_products: [{ count: 0 }],
        media: data.media || [],
        created_at: now,
      };
    case "create_notification":
      return {
        id,
        type: data.type || "promo",
        title: data.title,
        message: data.message,
        link: data.link || null,
        is_global: data.is_global !== false,
        is_read: false,
        created_at: now,
      };
    default:
      return { id };
  }
}

function getDemoMessage(action: string, data: any): string {
  switch (action) {
    case "create_banner":
      return `Demo: Đã tạo banner "${data.title}"`;
    case "create_voucher":
      return `Demo: Đã tạo voucher "${data.code}"`;
    case "create_event":
      return `Demo: Đã tạo sự kiện "${data.title}"`;
    case "create_notification":
      return `Demo: Đã gửi thông báo "${data.title}"`;
    default:
      return `Demo: Action "${action}" completed`;
  }
}
