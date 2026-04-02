import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register Vietnamese-compatible font
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf" },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Roboto", fontSize: 10, color: "#1f2937" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24, borderBottom: "2px solid #16a34a", paddingBottom: 16 },
  storeName: { fontSize: 20, fontWeight: "bold", color: "#16a34a" },
  storeInfo: { fontSize: 9, color: "#6b7280", marginTop: 4 },
  invoiceTitle: { fontSize: 16, fontWeight: "bold", textAlign: "right", color: "#1f2937" },
  invoiceNumber: { fontSize: 10, textAlign: "right", color: "#6b7280", marginTop: 4 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 6, color: "#374151", textTransform: "uppercase" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  label: { color: "#6b7280", fontSize: 9 },
  value: { fontSize: 10 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", padding: 6, borderRadius: 4, marginBottom: 4 },
  tableHeaderText: { fontWeight: "bold", fontSize: 9, color: "#374151" },
  tableRow: { flexDirection: "row", padding: 6, borderBottom: "1px solid #f3f4f6" },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "center" },
  col3: { flex: 1.5, textAlign: "right" },
  col4: { flex: 1.5, textAlign: "right" },
  totalSection: { marginTop: 12, padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  totalLabel: { color: "#6b7280", fontSize: 10 },
  totalValue: { fontSize: 10 },
  grandTotal: { flexDirection: "row", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #bbf7d0", marginTop: 4 },
  grandTotalLabel: { fontWeight: "bold", fontSize: 13 },
  grandTotalValue: { fontWeight: "bold", fontSize: 13, color: "#16a34a" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", fontSize: 8, color: "#9ca3af", borderTop: "1px solid #e5e7eb", paddingTop: 8 },
  watermark: { fontSize: 8, color: "#d1d5db", textAlign: "center", marginTop: 20 },
});

function fmtVND(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

export interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  orderDate: string;
  issuedAt: string;
  storeName: string;
  storePhone: string;
  storeAddress: string;
  buyerName: string;
  buyerPhone?: string;
  buyerAddress?: string;
  buyerTaxCode?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  items: { name: string; quantity: number; price: number; subtotal: number }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  voucherCode?: string;
  voucherDiscount: number;
  voucherDescription?: string;
  taxRate: number;
  taxAmount: number;
  total: number;
  note?: string;
}

export function InvoicePDF({ data }: { data: InvoiceData }) {
  const fmtDateTime = (d: string) =>
    new Date(d).toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const paymentLabels: Record<string, string> = {
    cod: "Thanh toán khi nhận hàng (COD)",
    vnpay: "VNPay",
    momo: "MoMo",
    bank_transfer: "Chuyển khoản ngân hàng",
  };
  const paymentStatusLabels: Record<string, string> = {
    paid: "Đã thanh toán",
    unpaid: "Chưa thanh toán",
    refunded: "Đã hoàn tiền",
    failed: "Thanh toán lỗi",
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.storeName}>{data.storeName}</Text>
            <Text style={styles.storeInfo}>{data.storeAddress}</Text>
            <Text style={styles.storeInfo}>Hotline: {data.storePhone}</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>HOÁ ĐƠN BÁN HÀNG</Text>
            <Text style={styles.invoiceNumber}>Số: {data.invoiceNumber}</Text>
            <Text style={styles.invoiceNumber}>Đơn hàng: {data.orderNumber}</Text>
            <Text style={styles.invoiceNumber}>Ngày đặt: {fmtDateTime(data.orderDate)}</Text>
            <Text style={styles.invoiceNumber}>Ngày xuất HĐ: {fmtDateTime(data.issuedAt)}</Text>
          </View>
        </View>

        {/* Buyer info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Họ tên:</Text>
            <Text style={styles.value}>{data.buyerName}</Text>
          </View>
          {data.buyerPhone && (
            <View style={styles.row}>
              <Text style={styles.label}>Điện thoại:</Text>
              <Text style={styles.value}>{data.buyerPhone}</Text>
            </View>
          )}
          {data.buyerAddress && (
            <View style={styles.row}>
              <Text style={styles.label}>Địa chỉ:</Text>
              <Text style={styles.value}>{data.buyerAddress}</Text>
            </View>
          )}
          {data.buyerTaxCode && (
            <View style={styles.row}>
              <Text style={styles.label}>MST:</Text>
              <Text style={styles.value}>{data.buyerTaxCode}</Text>
            </View>
          )}
          {data.paymentMethod && (
            <View style={styles.row}>
              <Text style={styles.label}>Thanh toán:</Text>
              <Text style={styles.value}>
                {paymentLabels[data.paymentMethod] || data.paymentMethod}
                {data.paymentStatus ? ` — ${paymentStatusLabels[data.paymentStatus] || data.paymentStatus}` : ""}
              </Text>
            </View>
          )}
        </View>

        {/* Items table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Sản phẩm</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>SL</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>Đơn giá</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>Thành tiền</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.col1}>{item.name}</Text>
              <Text style={[styles.col2, { textAlign: "center" }]}>{item.quantity}</Text>
              <Text style={[styles.col3, { textAlign: "right" }]}>{fmtVND(item.price)}</Text>
              <Text style={[styles.col4, { textAlign: "right" }]}>{fmtVND(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tạm tính:</Text>
            <Text style={styles.totalValue}>{fmtVND(data.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Phí giao hàng:</Text>
            <Text style={styles.totalValue}>
              {data.deliveryFee === 0 ? "Miễn phí" : fmtVND(data.deliveryFee)}
            </Text>
          </View>
          {data.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: "#ef4444" }]}>Giảm giá:</Text>
              <Text style={[styles.totalValue, { color: "#ef4444" }]}>-{fmtVND(data.discount)}</Text>
            </View>
          )}
          {data.voucherDiscount > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: "#ef4444" }]}>
                Mã KM: {data.voucherCode || "Voucher"}{data.voucherDescription ? ` (${data.voucherDescription})` : ""}
              </Text>
              <Text style={[styles.totalValue, { color: "#ef4444" }]}>-{fmtVND(data.voucherDiscount)}</Text>
            </View>
          )}
          {data.taxAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>VAT ({data.taxRate * 100}%):</Text>
              <Text style={styles.totalValue}>{fmtVND(data.taxAmount)}</Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>TỔNG CỘNG:</Text>
            <Text style={styles.grandTotalValue}>{fmtVND(data.total)}</Text>
          </View>
        </View>

        {data.note && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.label}>Ghi chú: {data.note}</Text>
          </View>
        )}

        <Text style={styles.watermark}>
          Hoá đơn tạo tự động bởi Tạp Hoá Online
        </Text>

        <Text style={styles.footer}>
          Cảm ơn quý khách đã mua hàng! | {data.storeName} | {data.storePhone}
        </Text>
      </Page>
    </Document>
  );
}
