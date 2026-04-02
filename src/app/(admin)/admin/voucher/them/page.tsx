"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function CreateVoucherPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: "",
    description: "",
    discount_type: "percent",
    discount_value: "",
    max_discount: "",
    min_order_amount: "0",
    usage_limit: "0",
    per_user_limit: "1",
    start_date: "",
    end_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.start_date || !form.end_date) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("vouchers").insert({
      code: form.code.toUpperCase().trim(),
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: parseInt(form.discount_value) || 0,
      max_discount: form.max_discount ? parseInt(form.max_discount) : null,
      min_order_amount: parseInt(form.min_order_amount) || 0,
      usage_limit: parseInt(form.usage_limit) || 0,
      per_user_limit: parseInt(form.per_user_limit) || 1,
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
      is_active: true,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message.includes("duplicate") ? "Mã voucher đã tồn tại" : "Lỗi: " + error.message);
      return;
    }

    toast.success("Tạo voucher thành công!");
    router.push("/admin/voucher");
  };

  const updateForm = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5">Tạo Voucher mới</h1>
      <Card className="p-3 sm:p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Mã voucher *</Label>
              <Input value={form.code} onChange={(e) => updateForm("code", e.target.value.toUpperCase())} placeholder="GIAM20K" className="mt-1 font-mono" required />
            </div>
            <div>
              <Label>Loại giảm giá</Label>
              <select value={form.discount_type} onChange={(e) => updateForm("discount_type", e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2 text-sm">
                <option value="percent">Giảm %</option>
                <option value="fixed">Giảm tiền (VND)</option>
                <option value="free_ship">Miễn phí ship</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Mô tả</Label>
            <Input value={form.description} onChange={(e) => updateForm("description", e.target.value)} placeholder="Giảm 20% cho đơn từ 200k" className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Giá trị giảm *</Label>
              <Input type="number" value={form.discount_value} onChange={(e) => updateForm("discount_value", e.target.value)} placeholder={form.discount_type === "percent" ? "20" : "20000"} className="mt-1" required />
            </div>
            <div>
              <Label>Giảm tối đa (VND)</Label>
              <Input type="number" value={form.max_discount} onChange={(e) => updateForm("max_discount", e.target.value)} placeholder="50000" className="mt-1" />
              <p className="text-xs text-gray-400 mt-1">Chỉ áp dụng cho loại %</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Đơn tối thiểu (VND)</Label>
              <Input type="number" value={form.min_order_amount} onChange={(e) => updateForm("min_order_amount", e.target.value)} placeholder="100000" className="mt-1" />
            </div>
            <div>
              <Label>Giới hạn sử dụng</Label>
              <Input type="number" value={form.usage_limit} onChange={(e) => updateForm("usage_limit", e.target.value)} className="mt-1" />
              <p className="text-xs text-gray-400 mt-1">0 = không giới hạn</p>
            </div>
            <div>
              <Label>Tối đa/người</Label>
              <Input type="number" value={form.per_user_limit} onChange={(e) => updateForm("per_user_limit", e.target.value)} className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Bắt đầu *</Label>
              <Input type="datetime-local" value={form.start_date} onChange={(e) => updateForm("start_date", e.target.value)} className="mt-1" required />
            </div>
            <div>
              <Label>Kết thúc *</Label>
              <Input type="datetime-local" value={form.end_date} onChange={(e) => updateForm("end_date", e.target.value)} className="mt-1" required />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo voucher"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Huỷ</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
