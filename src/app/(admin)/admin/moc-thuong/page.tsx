"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { isDemo } from "@/lib/demo";
import { toast } from "sonner";
import {
  Trophy,
  Plus,
  Trash2,
  Save,
  Loader2,
  Percent,
  Banknote,
  Gift,
  Target,
  ArrowUpDown,
} from "lucide-react";

interface Milestone {
  id: string;
  min_spent: number;
  discount_percent: number;
  max_discount: number;
  voucher_code_prefix: string;
  description: string;
  is_active: boolean;
}

const DEMO_MILESTONES: Milestone[] = [
  { id: "m1", min_spent: 500000, discount_percent: 5, max_discount: 25000, voucher_code_prefix: "MOC500K", description: "Giảm 5% tối đa 25k khi chi tiêu đạt 500k", is_active: true },
  { id: "m2", min_spent: 1000000, discount_percent: 8, max_discount: 50000, voucher_code_prefix: "MOC1TR", description: "Giảm 8% tối đa 50k khi chi tiêu đạt 1 triệu", is_active: true },
  { id: "m3", min_spent: 2000000, discount_percent: 10, max_discount: 100000, voucher_code_prefix: "MOC2TR", description: "Giảm 10% tối đa 100k khi chi tiêu đạt 2 triệu", is_active: true },
  { id: "m4", min_spent: 5000000, discount_percent: 15, max_discount: 200000, voucher_code_prefix: "MOC5TR", description: "Giảm 15% tối đa 200k khi chi tiêu đạt 5 triệu", is_active: true },
  { id: "m5", min_spent: 10000000, discount_percent: 20, max_discount: 500000, voucher_code_prefix: "MOC10TR", description: "Giảm 20% tối đa 500k khi chi tiêu đạt 10 triệu", is_active: true },
];

export default function MilestoneRewardsPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadMilestones();
  }, []);

  const loadMilestones = async () => {
    if (isDemo) {
      setMilestones(DEMO_MILESTONES);
      setLoading(false);
      return;
    }
    try {
      const { data } = await supabase
        .from("spending_milestones")
        .select("*")
        .order("min_spent", { ascending: true });
      setMilestones(data || []);
    } catch {}
    setLoading(false);
  };

  const addMilestone = () => {
    const newM: Milestone = {
      id: `new-${Date.now()}`,
      min_spent: 0,
      discount_percent: 5,
      max_discount: 25000,
      voucher_code_prefix: "MOC",
      description: "",
      is_active: true,
    };
    setMilestones([...milestones, newM]);
  };

  const updateMilestone = (id: string, key: keyof Milestone, value: any) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [key]: value } : m))
    );
  };

  const removeMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSave = async () => {
    // Validate
    for (const m of milestones) {
      if (!m.min_spent || m.min_spent <= 0) {
        toast.error("Mốc chi tiêu phải > 0");
        return;
      }
      if (!m.discount_percent || m.discount_percent <= 0 || m.discount_percent > 100) {
        toast.error("% giảm giá phải từ 1-100");
        return;
      }
      if (!m.max_discount || m.max_discount <= 0) {
        toast.error("Giảm tối đa phải > 0");
        return;
      }
      if (!m.voucher_code_prefix.trim()) {
        toast.error("Tiền tố mã voucher không được trống");
        return;
      }
    }

    if (isDemo) {
      toast.success(`Đã lưu ${milestones.length} mốc thưởng (demo)`);
      return;
    }

    setSaving(true);
    try {
      // Delete all existing milestones
      await supabase.from("spending_milestones").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      // Insert new ones
      if (milestones.length > 0) {
        const inserts = milestones.map((m) => ({
          min_spent: m.min_spent,
          discount_percent: m.discount_percent,
          max_discount: m.max_discount,
          voucher_code_prefix: m.voucher_code_prefix.toUpperCase().trim(),
          description: m.description || `Giảm ${m.discount_percent}% tối đa ${formatPrice(m.max_discount)} khi chi tiêu đạt ${formatPrice(m.min_spent)}`,
          is_active: m.is_active,
        }));
        const { error } = await supabase.from("spending_milestones").insert(inserts);
        if (error) throw error;
      }

      toast.success(`Đã lưu ${milestones.length} mốc thưởng`);
      loadMilestones();
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu");
    }
    setSaving(false);
  };

  // Sort milestones by min_spent
  const sorted = [...milestones].sort((a, b) => a.min_spent - b.min_spent);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" /> Mốc thưởng chi tiêu
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Khách hàng đạt mốc chi tiêu sẽ tự động nhận voucher giảm giá
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={addMilestone}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm mốc
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-xs"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
            Lưu
          </Button>
        </div>
      </div>

      {/* Visual milestone bar */}
      {sorted.length > 0 && (
        <Card className="gap-0 p-4 mb-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <p className="text-xs font-semibold text-yellow-700 mb-3 flex items-center gap-1">
            <Target className="w-3.5 h-3.5" /> Tổng quan mốc thưởng
          </p>
          <div className="flex items-end gap-3 overflow-x-auto pb-1">
            {sorted.map((m, i) => (
              <div key={m.id} className="flex flex-col items-center shrink-0 min-w-[80px]">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                  m.is_active ? "bg-yellow-500 text-white shadow" : "bg-gray-200 text-gray-500"
                }`}>
                  {m.discount_percent}%
                </div>
                <p className="text-[10px] font-bold text-gray-700">{formatPrice(m.min_spent)}</p>
                <p className="text-[9px] text-gray-400">max {formatPrice(m.max_discount)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Milestones list */}
      {sorted.length === 0 ? (
        <Card className="gap-0 p-10 text-center">
          <Trophy className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 mb-3">Chưa có mốc thưởng nào</p>
          <Button size="sm" onClick={addMilestone} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-1" /> Tạo mốc thưởng đầu tiên
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((m, index) => (
            <Card key={m.id} className="gap-0 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    m.is_active ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      Mốc {formatPrice(m.min_spent)}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Giảm {m.discount_percent}% tối đa {formatPrice(m.max_discount)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={m.is_active}
                      onChange={(e) => updateMilestone(m.id, "is_active", e.target.checked)}
                      className="accent-green-600"
                    />
                    <span className="text-xs text-gray-500">Bật</span>
                  </label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeMilestone(m.id)}
                    className="text-red-500 hover:bg-red-50 h-7 w-7 p-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Banknote className="w-3 h-3" /> Mốc chi tiêu (VNĐ)
                  </Label>
                  <Input
                    type="number"
                    value={m.min_spent}
                    onChange={(e) => updateMilestone(m.id, "min_spent", Number(e.target.value))}
                    className="mt-1 h-8 text-sm"
                    min={0}
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Percent className="w-3 h-3" /> Giảm giá (%)
                  </Label>
                  <Input
                    type="number"
                    value={m.discount_percent}
                    onChange={(e) => updateMilestone(m.id, "discount_percent", Number(e.target.value))}
                    className="mt-1 h-8 text-sm"
                    min={1}
                    max={100}
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Gift className="w-3 h-3" /> Giảm tối đa (VNĐ)
                  </Label>
                  <Input
                    type="number"
                    value={m.max_discount}
                    onChange={(e) => updateMilestone(m.id, "max_discount", Number(e.target.value))}
                    className="mt-1 h-8 text-sm"
                    min={0}
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-gray-400 flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3" /> Tiền tố mã voucher
                  </Label>
                  <Input
                    value={m.voucher_code_prefix}
                    onChange={(e) => updateMilestone(m.id, "voucher_code_prefix", e.target.value.toUpperCase())}
                    className="mt-1 h-8 text-sm font-mono"
                    placeholder="MOC500K"
                  />
                </div>
              </div>

              <div className="mt-2">
                <Label className="text-[10px] text-gray-400">Mô tả (tuỳ chọn)</Label>
                <Input
                  value={m.description}
                  onChange={(e) => updateMilestone(m.id, "description", e.target.value)}
                  className="mt-1 h-8 text-sm"
                  placeholder={`Giảm ${m.discount_percent}% tối đa ${formatPrice(m.max_discount)} khi tổng chi tiêu đạt ${formatPrice(m.min_spent)}`}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info box */}
      <Card className="gap-0 p-4 mt-4 bg-blue-50 border-blue-200">
        <p className="text-xs font-semibold text-blue-700 mb-1">Cách hoạt động</p>
        <ul className="text-[11px] text-blue-600 space-y-1">
          <li>1. Admin cài đặt các mốc chi tiêu + % giảm giá + giảm tối đa</li>
          <li>2. Khi đơn hàng được giao thành công, hệ thống kiểm tra tổng chi tiêu của khách</li>
          <li>3. Nếu đạt mốc mới, tự động tạo voucher và gửi cho khách</li>
          <li>4. Mã voucher: [tiền tố]-[mã khách] (VD: MOC500K-A1B2C3)</li>
          <li>5. Mỗi mốc chỉ nhận 1 lần, voucher có hạn 30 ngày</li>
        </ul>
      </Card>
    </div>
  );
}
