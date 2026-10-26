import type { ReactNode } from "react";
import { TopBar, SiteHeader } from "@/components/store/Header";
import { Newsletter, SiteFooter } from "@/components/store/Footer";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <TopBar />
      <SiteHeader />
      <main className="min-h-[60vh]">{children}</main>
      <Newsletter />
      <SiteFooter />
    </div>
  );
}
