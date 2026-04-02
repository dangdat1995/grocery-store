"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  Send,
  X,
  Loader2,
  Sparkles,
  Minimize2,
  Megaphone,
  Ticket,
  CalendarDays,
  Bell,
  Rocket,
  CheckCircle,
  XCircle,
  BarChart3,
  Package,
  Users,
  Zap,
  Star,
  ShoppingCart,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ActionBlock {
  action: string;
  data: any;
  status: "pending" | "executing" | "done" | "error";
  result?: string;
  link?: string;
  linkLabel?: string;
}

const ACTION_CONFIG: Record<string, { label: string; icon: typeof Megaphone; color: string; bg: string }> = {
  create_banner: { label: "Tạo banner", icon: Megaphone, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  create_voucher: { label: "Tạo voucher", icon: Ticket, color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  create_event: { label: "Tạo sự kiện", icon: CalendarDays, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  create_notification: { label: "Gửi thông báo", icon: Bell, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
};

const QUICK_PROMPTS = [
  { label: "Tổng quan", prompt: "Cho tôi tổng quan tình hình cửa hàng", icon: BarChart3, color: "text-green-700 bg-green-50" },
  { label: "Doanh thu", prompt: "Phân tích doanh thu và gợi ý cải thiện", icon: Zap, color: "text-yellow-700 bg-yellow-50" },
  { label: "Khách hàng", prompt: "Phân tích khách hàng theo hạng và gợi ý chăm sóc", icon: Users, color: "text-blue-700 bg-blue-50" },
  { label: "Kho hàng", prompt: "Kiểm tra tồn kho và gợi ý nhập hàng", icon: Package, color: "text-cyan-700 bg-cyan-50" },
  { label: "Tạo chiến dịch KM", prompt: "Tạo chiến dịch khuyến mãi hoàn chỉnh: banner + voucher + thông báo cho khách", icon: Rocket, color: "text-purple-700 bg-purple-50" },
  { label: "Tạo voucher", prompt: "Gợi ý và tạo voucher giảm giá phù hợp cho tuần này", icon: Ticket, color: "text-orange-700 bg-orange-50" },
  { label: "Tạo banner", prompt: "Tạo banner quảng cáo bắt mắt cho trang chủ", icon: Megaphone, color: "text-emerald-700 bg-emerald-50" },
  { label: "Tạo sự kiện", prompt: "Tạo sự kiện khuyến mãi cho tuần tới", icon: CalendarDays, color: "text-indigo-700 bg-indigo-50" },
  { label: "Gửi thông báo", prompt: "Gửi thông báo khuyến mãi cho tất cả khách hàng", icon: Bell, color: "text-pink-700 bg-pink-50" },
  { label: "Tích điểm", prompt: "Phân tích hệ thống tích điểm và gợi ý tối ưu", icon: Star, color: "text-amber-700 bg-amber-50" },
];

// Parse action blocks from AI response
function parseActions(text: string): { clean: string; actions: ActionBlock[] } {
  const actions: ActionBlock[] = [];
  const clean = text.replace(/```action\s*\n?([\s\S]*?)```/g, (_, json) => {
    try {
      const parsed = JSON.parse(json.trim());
      actions.push({ ...parsed, status: "pending" });
      return `%%ACTION_${actions.length - 1}%%`;
    } catch {
      return json;
    }
  });
  return { clean, actions };
}

export default function AIAssistant() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [actions, setActions] = useState<Map<string, ActionBlock>>(new Map());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, actions]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history: messages.slice(-10) }),
      });
      const data = await res.json();
      const rawContent = data.response || data.error || "Có lỗi xảy ra";

      // Parse actions
      const { clean, actions: newActions } = parseActions(rawContent);
      const assistantId = crypto.randomUUID();

      // Store actions with stable ID
      const newMap = new Map(actions);
      newActions.forEach((a, i) => {
        newMap.set(`${assistantId}_${i}`, a);
      });
      setActions(newMap);

      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: clean }]);
    } catch {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: "Lỗi kết nối. Vui lòng thử lại." }]);
    }
    setLoading(false);
  };

  const executeAction = async (key: string) => {
    const action = actions.get(key);
    if (!action || action.status !== "pending") return;

    setActions((prev) => {
      const next = new Map(prev);
      next.set(key, { ...action, status: "executing" });
      return next;
    });

    try {
      const res = await fetch("/api/ai/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: action.action, data: action.data }),
      });
      const result = await res.json();

      if (result.success) {
        setActions((prev) => {
          const next = new Map(prev);
          next.set(key, {
            ...action,
            status: "done",
            result: result.message,
            link: result.link,
            linkLabel: result.linkLabel,
          });
          return next;
        });
        toast.success(result.message);
        // Refresh server-rendered pages
        router.refresh();
        // Notify admin pages to update their data with the new item
        window.dispatchEvent(new CustomEvent("ai-action-done", {
          detail: { action: action.action, item: result.item },
        }));
      } else {
        throw new Error(result.error || "Lỗi");
      }
    } catch (err: any) {
      setActions((prev) => {
        const next = new Map(prev);
        next.set(key, { ...action, status: "error", result: err.message });
        return next;
      });
      toast.error("Lỗi: " + err.message);
    }
  };

  const renderActionBlock = (key: string) => {
    const action = actions.get(key);
    if (!action) return null;

    const config = ACTION_CONFIG[action.action] || { label: action.action, icon: Sparkles, color: "text-gray-700", bg: "bg-gray-50 border-gray-200" };
    const Icon = config.icon;

    return (
      <div className={`border rounded-xl p-3 my-2 ${config.bg}`}>
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`w-4 h-4 ${config.color}`} />
          <span className={`text-xs font-bold ${config.color}`}>{config.label}</span>
        </div>

        {/* Preview data */}
        <div className="text-[11px] text-gray-600 space-y-0.5 mb-2.5">
          {action.action === "create_banner" && (
            <>
              <p><strong>Tiêu đề:</strong> {action.data.title}</p>
              <p><strong>Mô tả:</strong> {action.data.subtitle}</p>
              {action.data.tag && <p><strong>Tag:</strong> {action.data.tag}</p>}
            </>
          )}
          {action.action === "create_voucher" && (
            <>
              <p><strong>Mã:</strong> <code className="bg-white/60 px-1 rounded font-mono">{action.data.code}</code></p>
              <p><strong>Giảm:</strong> {action.data.discount_type === "percent" ? `${action.data.discount_value}%` : `${action.data.discount_value?.toLocaleString()}đ`}{action.data.max_discount ? ` (tối đa ${action.data.max_discount.toLocaleString()}đ)` : ""}</p>
              <p><strong>Đơn tối thiểu:</strong> {(action.data.min_order_amount || 0).toLocaleString()}đ</p>
            </>
          )}
          {action.action === "create_event" && (
            <>
              <p><strong>Sự kiện:</strong> {action.data.title}</p>
              <p><strong>Giảm:</strong> {action.data.discount_type === "percent" ? `${action.data.discount_value}%` : `${action.data.discount_value?.toLocaleString()}đ`}</p>
              <p><strong>Thời gian:</strong> {action.data.start_date?.slice(0, 10)} → {action.data.end_date?.slice(0, 10)}</p>
            </>
          )}
          {action.action === "create_notification" && (
            <>
              <p><strong>Tiêu đề:</strong> {action.data.title}</p>
              <p><strong>Nội dung:</strong> {action.data.message}</p>
              <p><strong>Đối tượng:</strong> {action.data.is_global ? "Tất cả khách" : "Cá nhân"}</p>
            </>
          )}
        </div>

        {/* Action buttons */}
        {action.status === "pending" && (
          <button
            onClick={() => executeAction(key)}
            className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm`}
          >
            <Rocket className="w-3.5 h-3.5" /> Thực hiện
          </button>
        )}
        {action.status === "executing" && (
          <div className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang thực hiện...
          </div>
        )}
        {action.status === "done" && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 py-1 text-xs text-green-700 font-medium">
              <CheckCircle className="w-3.5 h-3.5" /> {action.result}
            </div>
            {action.link && (
              <Link
                href={action.link}
                onClick={() => { setOpen(false); setMinimized(true); }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 hover:text-green-800 hover:underline transition-colors"
              >
                <ChevronRight className="w-3 h-3" /> {action.linkLabel || "Xem kết quả"}
              </Link>
            )}
          </div>
        )}
        {action.status === "error" && (
          <div className="flex items-center gap-1.5 py-1 text-xs text-red-600 font-medium">
            <XCircle className="w-3.5 h-3.5" /> {action.result}
          </div>
        )}
      </div>
    );
  };

  const renderMessageContent = (content: string, msgId: string) => {
    const parts = content.split(/(%%ACTION_\d+%%)/);
    return parts.map((part, i) => {
      const match = part.match(/%%ACTION_(\d+)%%/);
      if (match) {
        const actionKey = `${msgId}_${match[1]}`;
        return <div key={i}>{renderActionBlock(actionKey)}</div>;
      }
      if (!part.trim()) return null;
      return (
        <div key={i} className="whitespace-pre-wrap text-[13px] leading-relaxed">
          {part.split(/(\*\*.*?\*\*)/g).map((seg, j) => {
            if (seg.startsWith("**") && seg.endsWith("**")) {
              return <strong key={j}>{seg.slice(2, -2)}</strong>;
            }
            return <span key={j}>{seg}</span>;
          })}
        </div>
      );
    });
  };

  // --- Closed state ---
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center group"
      >
        <Bot className="w-6 h-6 group-hover:animate-pulse" />
      </button>
    );
  }

  // --- Minimized state ---
  if (minimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-xl border w-72 overflow-hidden">
        <button
          onClick={() => setMinimized(false)}
          className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
        >
          <Bot className="w-4 h-4" />
          <span className="text-sm font-medium flex-1 text-left">AI Trợ lý</span>
          {messages.length > 0 && (
            <span className="bg-white/20 rounded-full px-2 py-0.5 text-[10px]">
              {messages.length} tin
            </span>
          )}
        </button>
      </div>
    );
  }

  // --- Full chat ---
  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] max-h-[640px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm">AI Trợ lý quản lý</p>
          <p className="text-[10px] text-green-100">Phân tích, gợi ý & tạo chiến dịch tự động</p>
        </div>
        <button onClick={() => setMinimized(true)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
          <Minimize2 className="w-4 h-4" />
        </button>
        <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[440px]">
        {messages.length === 0 && (
          <div className="py-3">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Xin chào! Tôi có thể giúp gì?</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Phân tích, tạo banner, voucher, sự kiện...</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => sendMessage(qp.prompt)}
                  className={`flex items-center gap-1.5 text-[11px] px-2.5 py-2 ${qp.color} rounded-lg transition-all hover:scale-[1.02] text-left font-medium`}
                >
                  <qp.icon className="w-3.5 h-3.5 shrink-0" />
                  {qp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 ${
                msg.role === "user"
                  ? "bg-green-600 text-white rounded-br-md"
                  : "bg-gray-50 text-gray-800 rounded-bl-md border border-gray-100"
              }`}
            >
              {msg.role === "user" ? (
                <div className="whitespace-pre-wrap text-[13px]">{msg.content}</div>
              ) : (
                renderMessageContent(msg.content, msg.id)
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                <span className="text-xs">Đang phân tích...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 shrink-0 bg-gray-50/50">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi hoặc yêu cầu tạo banner, voucher..."
            className="flex-1 rounded-xl text-sm h-9 bg-white"
            disabled={loading}
          />
          <Button
            type="submit"
            size="sm"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-green-600 hover:bg-green-700 h-9 px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
