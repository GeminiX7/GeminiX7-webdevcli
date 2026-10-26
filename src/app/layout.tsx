import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ShopProvider } from "@/context/ShopContext";
import { Toasts } from "@/components/ui";

export const metadata: Metadata = {
  title: "Donwise Computers & iPhone Stores | Games, Gadgets & Accessories in Owerri",
  description:
    "Owerri's No.1 plug for computers, iPhones, PlayStation & games, gadgets and accessories. 100% genuine products, best prices, fast delivery in Imo State.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f4f6fb] text-slate-900 antialiased">
        <ShopProvider>
          {children}
          <Toasts />
        </ShopProvider>
      </body>
    </html>
  );
}
