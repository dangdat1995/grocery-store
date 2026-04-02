import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Tạp Hoá Online - Giao hàng tận nơi trong 20km",
    template: "%s | Tạp Hoá Online",
  },
  description:
    "Cửa hàng tạp hoá online - Rau củ, thịt cá, đồ khô, gia vị tươi ngon. Giao hàng tận nơi trong bán kính 20km. Đặt hàng dễ dàng, giao nhanh trong ngày.",
  keywords: [
    "tạp hoá online",
    "mua rau online",
    "đi chợ online",
    "giao hàng tận nơi",
    "cửa hàng tạp hoá",
  ],
  openGraph: {
    title: "Tạp Hoá Online - Giao hàng tận nơi trong 20km",
    description:
      "Đặt hàng tạp hoá online, giao nhanh trong ngày. Rau củ, thịt cá, đồ khô tươi ngon.",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-be-vietnam-pro)]">
        {children}
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}
