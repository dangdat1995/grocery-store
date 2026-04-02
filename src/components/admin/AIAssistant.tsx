"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, X, Loader2, Sparkles, MessageCircle, Minimize2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  { label: "📊 Tổng quan", prompt: "Cho tôi tổng quan tình hình cửa hàng hôm nay" },
  { label: "💰 Doanh thu", prompt: "Phân tích doanh thu gần đây và gợi ý cải thiện" },
  { label: "👥 Khách hàng", prompt: "Phân tích khách hàng theo hạng và gợi ý chăm sóc" },
  { label: "🎟️ Voucher", prompt: "Gợi ý chiến lược voucher phù hợp cho từng nhóm khách" },
  { label: "📦 Kho hàng", prompt: "Kiểm tra tồn kho và gợi ý nhập hàng" },
  { label: "⭐ Tích điểm", prompt: "Phân tích hệ thống tích điểm và gợi ý tối ưu" },
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: messages.slice(-10),
        }),
      });
      const data = await res.json();
      const aiMsg: Message = {
        role: "assistant",
        content: data.response || data.error || "Có lỗi xảy ra",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Lỗi kết nối. Vui lòng thử lại." }]);
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center group"
      >
        <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
      </button>
    );
  }

  if (minimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-xl border w-72 overflow-hidden">
        <button
          onClick={() => setMinimized(false)}
          className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
        >
          <Bot className="w-4 h-4" />
          <span className="text-sm font-medium flex-1 text-left">AI Trợ lý</span>
          <MessageCircle className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 flex items-center gap-2 shrink-0">
        <Bot className="w-5 h-5" />
        <div className="flex-1">
          <p className="font-semibold text-sm">AI Trợ lý quản lý</p>
          <p className="text-[10px] text-purple-200">Phân tích & gợi ý thông minh</p>
        </div>
        <button onClick={() => setMinimized(true)} className="p-1 hover:bg-white/20 rounded-lg">
          <Minimize2 className="w-4 h-4" />
        </button>
        <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[380px]">
        {messages.length === 0 && (
          <div className="text-center py-4">
            <Sparkles className="w-8 h-8 text-purple-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-3">Hỏi bất cứ điều gì về cửa hàng</p>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => sendMessage(qp.prompt)}
                  className="text-[11px] px-2.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-left"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-purple-600 text-white rounded-br-md"
                  : "bg-gray-100 text-gray-800 rounded-bl-md"
              }`}
            >
              <div className="whitespace-pre-wrap text-[13px] leading-relaxed [&_strong]:font-bold">
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang phân tích...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi về doanh thu, khách hàng, kho..."
            className="flex-1 rounded-xl text-sm h-9"
            disabled={loading}
          />
          <Button
            type="submit"
            size="sm"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-purple-600 hover:bg-purple-700 h-9 px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
