"use client";

import { useState } from "react";
import { FileText, Printer, Download, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface InvoiceButtonsProps {
  orderId: string;
  size?: "sm" | "default";
}

export default function InvoiceButtons({ orderId, size = "sm" }: InvoiceButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    setLoading("pdf");
    try {
      const res = await fetch(`/api/invoices/${orderId}?format=pdf`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hoa-don-${orderId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Đã tải hoá đơn PDF");
    } catch {
      toast.error("Lỗi tải hoá đơn");
    }
    setLoading(null);
  };

  const handlePrint = async () => {
    setLoading("print");
    try {
      // Open thermal printer HTML in new window
      const printWindow = window.open(
        `/api/invoices/${orderId}?format=thermal`,
        "_blank",
        "width=350,height=600"
      );
      if (!printWindow) {
        toast.error("Cho phép popup để in hoá đơn");
      }
    } catch {
      toast.error("Lỗi in hoá đơn");
    }
    setLoading(null);
  };

  const handlePrintA4 = async () => {
    setLoading("a4");
    try {
      const res = await fetch(`/api/invoices/${orderId}?format=pdf`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => printWindow.print();
      }
    } catch {
      toast.error("Lỗi in hoá đơn");
    }
    setLoading(null);
  };

  const handleSendEmail = async () => {
    setLoading("email");
    try {
      const res = await fetch(`/api/invoices/${orderId}/email`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi gửi email");
      toast.success(data.message || "Đã gửi hoá đơn qua email");
    } catch (err: any) {
      toast.error(err.message || "Lỗi gửi email hoá đơn");
    }
    setLoading(null);
  };

  return (
    <div className="flex items-center gap-1.5">
      <Button
        size={size}
        variant="outline"
        onClick={handleDownloadPDF}
        disabled={!!loading}
        className="text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        {loading === "pdf" ? (
          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5 mr-1" />
        )}
        PDF
      </Button>
      <Button
        size={size}
        variant="outline"
        onClick={handlePrint}
        disabled={!!loading}
        className="text-purple-600 border-purple-200 hover:bg-purple-50"
        title="In hoá đơn nhiệt (80mm)"
      >
        {loading === "print" ? (
          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
        ) : (
          <Printer className="w-3.5 h-3.5 mr-1" />
        )}
        In
      </Button>
      <Button
        size={size}
        variant="outline"
        onClick={handlePrintA4}
        disabled={!!loading}
        className="text-green-600 border-green-200 hover:bg-green-50"
        title="In hoá đơn A4"
      >
        {loading === "a4" ? (
          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
        ) : (
          <FileText className="w-3.5 h-3.5 mr-1" />
        )}
        A4
      </Button>
      <Button
        size={size}
        variant="outline"
        onClick={handleSendEmail}
        disabled={!!loading}
        className="text-orange-600 border-orange-200 hover:bg-orange-50"
        title="Gửi hoá đơn qua email"
      >
        {loading === "email" ? (
          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
        ) : (
          <Mail className="w-3.5 h-3.5 mr-1" />
        )}
        Email
      </Button>
    </div>
  );
}
