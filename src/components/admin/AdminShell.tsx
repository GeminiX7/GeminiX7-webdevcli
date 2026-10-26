"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, FolderTree, Award, ShoppingBag, Users, Star,
  Store, Menu, X, LogOut, Bell, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StoreLogo } from "@/components/store/StoreLogo";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/brands", label: "Brands", icon: Award },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export function AdminShell({ children, user }: { children: React.ReactNode; user: { name: string; email: string; role: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const Nav = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2.5 px-5 pb-6 pt-6" onClick={() => setOpen(false)}>
        <StoreLogo className="shadow-lg" />
        <div className="leading-tight">
          <p className="text-lg font-black text-white">Don<span className="text-brand-400">wise</span></p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin Panel</p>
        </div>
      </Link>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {LINKS.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn("flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition", active ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30" : "text-slate-300 hover:bg-white/5 hover:text-white")}
            >
              <l.icon size={18} />
              {l.label}
            </Link>
          );
        })}
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white">
          <Store size={18} /> View Store
        </Link>
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-sm font-black text-white">{user.name[0]}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{user.name}</p>
            <p className="truncate text-[11px] text-slate-400">{user.role}</p>
          </div>
          <button onClick={logout} title="Sign out" className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-red-500/20 hover:text-red-400"><LogOut size={17} /></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#eef1f7]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-ink-900 lg:block">{Nav}</aside>
      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-ink-900 fade-up">{Nav}</aside>
        </div>
      )}
      <div className="lg:pl-64">
        {/* Topbar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 lg:hidden"><Menu size={18} /></button>
          <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 sm:flex">
            <Search size={16} />
            <input placeholder="Search products, orders..." className="w-56 bg-transparent outline-none placeholder:text-slate-400" onKeyDown={(e) => { if (e.key === "Enter") router.push(`/admin/products?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`); }} />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600">
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <Link href="/" className="hidden h-10 items-center gap-2 rounded-xl bg-ink-900 px-4 text-[13px] font-bold text-white sm:flex">
              <Store size={15} /> View Store
            </Link>
          </div>
        </div>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
