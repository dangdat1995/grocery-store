"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Loader2 } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { isDemo } from "@/lib/demo";
import InvoiceButtons from "@/components/admin/InvoiceButtons";

interface Props {
  orderId: string;
  orderNumber: string;
}

export default function InvoiceSection({ orderId, orderNumber }: Props) {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [taxCode, setTaxCode] = useState("");
  const [note, setNote] = useState("");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isDemo) {
      // Demo: không có hoá đơn sẵn
      setChecked(true);
      return;
    }
    fetch(`/api/invoices?order_id=${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.invoice) setInvoice(data.invoice);
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [orderId]);

  const createInvoice = async () => {
    if (isDemo) {
      // Demo: giả lập tạo hoá đơn
      const fakeInvoice = {
        invoice_number: `HD-${orderNumber.replace("GH-", "")}`,
        issued_at: new Date().toISOString(),
        total: 205000,
        buyer_tax_code: taxCode || null,
      };
      setInvoice(fakeInvoice);
      toast.success("Demo: Đã tạo hoá đơn " + fakeInvoice.invoice_number);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          buyer_tax_code: taxCode || undefined,
          note: note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInvoice(data.invoice);
      toast.success("Đã tạo hoá đơn " + data.invoice.invoice_number);
    } catch (err: any) {
      toast.error(err.message || "Lỗi tạo hoá đơn");
    }
    setLoading(false);
  };

  if (!checked) return null;

  return (
    <Card className="gap-0 p-5">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <FileText className="w-5 h-5 text-green-600" />
        Hoá đơn
      </h3>

      {invoice ? (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm">
              <strong>Số hoá đơn:</strong>{" "}
              <span className="font-mono text-green-600">{invoice.invoice_number}</span>
            </p>
            <p className="text-sm"><strong>Ngày xuất:</strong> {formatDate(invoice.issued_at)}</p>
            {invoice.total && <p className="text-sm"><strong>Tổng tiền:</strong> {formatPrice(invoice.total)}</p>}
            {invoice.buyer_tax_code && (
              <p className="text-sm"><strong>MST:</strong> {invoice.buyer_tax_code}</p>
            )}
          </div>
          <InvoiceButtons orderId={orderNumber} />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Chưa có hoá đơn. Xuất nhanh hoặc tạo chính thức:</p>

          {/* Quick print/download */}
          <div className="flex items-center gap-2 mb-3">
            <InvoiceButtons orderId={orderNumber} />
          </div>

          <div className="border-t pt-3">
            <p className="text-xs text-gray-400 mb-2">Hoặc tạo hoá đơn chính thức (lưu vào hệ thống):</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Mã số thuế (tuỳ chọn)</Label>
                <Input value={taxCode} onChange={(e) => setTaxCode(e.target.value)} placeholder="0123456789" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Ghi chú</Label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú hoá đơn..." className="mt-1" />
              </div>
            </div>
            <Button onClick={createInvoice} disabled={loading} className="bg-green-600 hover:bg-green-700 mt-3">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              {loading ? "Đang tạo..." : "Tạo hoá đơn chính thức"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
