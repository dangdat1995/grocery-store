const vndFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

/**
 * Format price in VND: 25000 → "25.000 ₫"
 */
export function formatVND(amount: number): string {
  return vndFormatter.format(amount);
}

/**
 * Format price short: 25000 → "25.000đ"
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

/**
 * Format phone number: 0901234567 → "090 123 4567"
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Format date Vietnamese: "01/04/2026 14:30"
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
