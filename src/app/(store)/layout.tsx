"use client";

import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import MobileNav from "@/components/store/MobileNav";
import PageTracker from "@/components/store/PageTracker";
import DynamicStyles from "@/components/store/DynamicStyles";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <DynamicStyles />
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileNav />
      <PageTracker />
    </div>
  );
}
