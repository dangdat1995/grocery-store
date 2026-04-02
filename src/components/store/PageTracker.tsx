"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isDemo } from "@/lib/demo";

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (isDemo) return;
    fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: pathname }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
