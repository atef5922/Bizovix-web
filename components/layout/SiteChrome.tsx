"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SiteTools } from "@/components/ui/SiteTools";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const workspace = pathname.startsWith("/admin") || pathname.startsWith("/account");

  if (workspace) return <main id="main-content">{children}</main>;

  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <MobileBottomNav />
      <SiteTools />
    </>
  );
}
