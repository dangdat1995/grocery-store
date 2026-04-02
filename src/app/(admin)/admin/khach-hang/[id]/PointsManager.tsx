"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins, Plus, Minus, ArrowDownLeft, ArrowUpRight, Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";

interface Props {
  customerId: string;
  customerName: string | null;
  currentBalance: number;
}

interface PointsTx {
  id: string;
  type: string;
  points: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export default function PointsManager({ customerId, customerName, currentBalance }: Props) {
  const [balance, setBalance] = useState(currentBalance);
  const [transactions, setTransactions] = useState<PointsTx[]>([]);
  const [adjustPoints, setAdjustPoints] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);

  useEffect(() => {
    fetch(`/api/points?user_id=${customerId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.balance !== undefined) setBalance(data.balance);
        setTransactions(data.transactions || []);
      })
      .catch(() => {});
  }, [customerId]);

  const handleAdjust = async (positive: boolean) => {
    const pts = parseInt(adjustPoints);
    if (!pts || pts <= 0) {
      toast.error("Nhập số điểm hợp lệ");
      return;
    }

    if (isDemo) {
      const newBal = positive ? balance + pts : Math.max(0, balance - pts);
      setBalance(newBal);
      setTransactions((prev) => [
        {
          id: `demo-${Date.now()}`,
          type: positive ? "bonus" : "adjust",
          points: positive ? pts : -pts,
          balance_after: newBal,
          description: adjustReason || (positive ? `Thưởng ${pts} điểm` : `Trừ ${pts} điểm`),
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setAdjustPoints("");
      setAdjustReason("");
      setShowAdjust(false);
      toast.success(`Đã ${positive ? "cộng" : "trừ"} ${pts} điểm`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adjust",
          user_id: customerId,
          points: positive ? pts : -pts,
          description: adjustReason || (positive ? `Thưởng ${pts} điểm cho ${customerName}` : `Trừ ${pts} điểm của ${customerName}`),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBalance(data.balance);
      toast.success(`Đã ${positive ? "cộng" : "trừ"} ${pts} điểm`);
      setAdjustPoints("");
      setAdjustReason("");
      setShowAdjust(false);

      // Refresh transactions
      const txRes = await fetch(`/api/points?user_id=${customerId}`);
      const txData = await txRes.json();
      setTransactions(txData.transactions || []);
    } catch (err: any) {
      toast.error(err.message || "Lỗi");
    }
    setLoading(false);
  };

  const txIcon = (type: string) => {
    if (type === "earn") return <ArrowDownLeft className="w-3.5 h-3.5 text-green-600" />;
    if (type === "redeem") return <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />;
    if (type === "bonus") return <Gift className="w-3.5 h-3.5 text-purple-600" />;
    return <Coins className="w-3.5 h-3.5 text-gray-400" />;
  };

  return (
    <Card className="gap-0 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Coins className="w-4 h-4 text-yellow-600" /> Điểm tích luỹ
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-yellow-600">{balance}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdjust(!showAdjust)}
            className="text-xs"
          >
            Điều chỉnh
          </Button>
        </div>
      </div>

      {/* Adjust form */}
      {showAdjust && (
        <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2">
          <div className="flex gap-2">
            <Input
              type="number"
              value={adjustPoints}
              onChange={(e) => setAdjustPoints(e.target.value)}
              placeholder="Số điểm..."
              className="flex-1 h-8 text-sm"
              min={1}
            />
          </div>
          <Input
            value={adjustReason}
            onChange={(e) => setAdjustReason(e.target.value)}
            placeholder="Lý do (tuỳ chọn)..."
            className="h-8 text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleAdjust(true)}
              disabled={loading || !adjustPoints}
              className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
              Cộng điểm
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleAdjust(false)}
              disabled={loading || !adjustPoints}
              className="flex-1 text-xs"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Minus className="w-3.5 h-3.5 mr-1" />}
              Trừ điểm
            </Button>
          </div>
        </div>
      )}

      {/* Recent transactions */}
      {transactions.length > 0 ? (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {transactions.slice(0, 10).map((tx) => (
            <div key={tx.id} className="flex items-center gap-2 py-1.5 border-b last:border-0">
              <div className="w-6 h-6 bg-gray-50 rounded flex items-center justify-center shrink-0">
                {txIcon(tx.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{tx.description}</p>
                <p className="text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleDateString("vi-VN")}</p>
              </div>
              <span className={`text-xs font-bold shrink-0 ${tx.points > 0 ? "text-green-600" : "text-red-500"}`}>
                {tx.points > 0 ? "+" : ""}{tx.points}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">Chưa có giao dịch điểm</p>
      )}
    </Card>
  );
}
