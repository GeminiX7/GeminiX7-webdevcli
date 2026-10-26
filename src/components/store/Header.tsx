"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Search, Heart, ShoppingCart, User, Menu, X, MapPin, Truck, Phone,
  LayoutGrid, ChevronDown, GitCompareArrows, BadgeCheck, Package,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { SITE, NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { StoreLogo } from "@/components/store/StoreLogo";

type Category = { id: number; name: string; slug: string; description?: string | null; store: string };

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener("donwise:navigate", onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("donwise:navigate", onChange);
  };
}

export function TopBar() {
  return (
    <div className="bg-ink-900 text-white">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-[11px] font-medium sm:text-xs">
        <p className="hidden items-center gap-1.5 text-slate-300 md:flex">
          <MapPin size={13} className="text-brand-400" /> {SITE.address}
        </p>
        <p className="flex items-center gap-1.5 md:hidden"><MapPin size={13} className="text-brand-400" /> Owerri, Imo State</p>
        <p className="hidden items-center gap-1.5 lg:flex"><Truck size={14} className="text-emerald-400" /> Free delivery in Owerri on orders over ₦250,000</p>
        <div className="flex items-center gap-3 text-slate-300">
          <span className="hidden items-center gap-1.5 sm:flex"><Phone size={13} /> {SITE.phone}</span>
          <Link href="/track-order" className="hover:text-white">Track Order</Link>
          <span className="text-slate-600">|</span>
          <Link href="/contact" className="hover:text-white">Help Center</Link>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const { user, cartCount, wishlist, compare } = useShop();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [cats, setCats] = useState<Category[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const shopStore = useSyncExternalStore(
    subscribeToLocation,
    () => new URLSearchParams(window.location.search).get("store"),
    () => null,
  );
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [navIndicator, setNavIndicator] = useState({ left: 0, width: 0, visible: false });
  const navLinksRef = useRef<HTMLDivElement>(null);
  const navItemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((j) => setCats(j.categories || [])).catch(() => {});
  }, []);

  const activeNavLabel = pathname === "/shop"
    ? NAV_LINKS.find((link) => link.href === `/shop?store=${shopStore}`)?.label ?? null
    : NAV_LINKS.find((link) => link.href === "/" ? pathname === "/" : !link.href.startsWith("/shop") && pathname.startsWith(link.href))?.label ?? null;
  const indicatorLabel = hoveredNav ?? activeNavLabel;

  useEffect(() => {
    const container = navLinksRef.current;
    const item = indicatorLabel ? navItemRefs.current[indicatorLabel] : null;
    if (!container || !item) {
      setNavIndicator((current) => current.visible ? { ...current, visible: false } : current);
      return;
    }

    const update = () => setNavIndicator({
      left: item.offsetLeft,
      width: item.offsetWidth,
      visible: true,
    });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [indicatorLabel]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (cat !== "all") params.set("category", cat);
    router.push(`/shop?${params.toString()}`);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 shadow-sm shadow-slate-200/50 backdrop-blur">
      <div className="mx-auto flex min-h-[76px] max-w-7xl items-center gap-3 px-4 py-3 lg:gap-5">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <StoreLogo className="shadow-lg shadow-brand-600/25" />
          <div className="leading-tight">
            <p className="text-lg font-black tracking-tight text-ink-900 sm:text-xl">Don<span className="text-brand-600">wise</span></p>
            <p className="hidden text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:block">Computers • iPhones • Games</p>
          </div>
        </Link>

        {/* Search desktop */}
        <form onSubmit={submit} className="hidden min-w-0 flex-1 items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition focus-within:border-brand-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/10 lg:flex">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search laptops, iPhones, PS5, accessories..." className="h-12 min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-slate-400" />
          <div className="hidden border-l border-slate-200 xl:block">
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-12 max-w-48 bg-transparent px-3 text-xs font-semibold text-slate-600 outline-none">
              <option value="all">All Categories</option>
              {cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <button type="submit" aria-label="Search" className="m-1 grid h-10 w-12 shrink-0 place-items-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700"><Search size={18} /></button>
        </form>

        {/* Icons */}
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <Link href="/compare" className="relative hidden flex-col items-center gap-1 rounded-xl px-2.5 py-1.5 text-slate-600 transition hover:bg-brand-50 hover:text-brand-700 sm:flex">
            <GitCompareArrows size={19} />
            <span className="text-[10px] font-semibold">Compare</span>
            {compare.length > 0 && <span className="absolute -top-0.5 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">{compare.length}</span>}
          </Link>
          <Link href="/wishlist" className="relative flex flex-col items-center gap-1 rounded-xl px-2.5 py-1.5 text-slate-600 transition hover:bg-brand-50 hover:text-brand-700 sm:px-3">
            <Heart size={19} />
            <span className="hidden text-[10px] font-semibold sm:block">Wishlist</span>
            {wishlist.length > 0 && <span className="absolute -top-0.5 right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{wishlist.length}</span>}
          </Link>
          <Link href="/cart" className="relative flex flex-col items-center gap-1 rounded-xl px-2.5 py-1.5 text-slate-600 transition hover:bg-brand-50 hover:text-brand-700 sm:px-3">
            <ShoppingCart size={19} />
            <span className="hidden text-[10px] font-semibold sm:block">Cart</span>
            {cartCount > 0 && <span className="absolute -top-0.5 right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">{cartCount}</span>}
          </Link>
          {user ? (
            <Link href={user.role === "admin" ? "/admin" : "/account"} className="hidden flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-slate-600 transition hover:bg-brand-50 hover:text-brand-700 md:flex">
              <div className="grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-[10px] font-black text-white">{user.name[0]}</div>
              <span className="max-w-20 truncate text-[10px] font-semibold">{user.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link href="/login" className="hidden flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-slate-600 transition hover:bg-brand-50 hover:text-brand-700 md:flex">
              <User size={20} />
              <span className="text-[10px] font-semibold">Sign In</span>
            </Link>
          )}
          <button type="button" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 md:hidden">
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Nav desktop */}
      <nav className="hidden border-t border-slate-100 md:block" aria-label="Main navigation">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4">
          <div className="relative shrink-0">
            <button type="button" aria-expanded={catOpen} onClick={() => setCatOpen(!catOpen)} className="my-2 flex items-center gap-2 rounded-xl bg-ink-900 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20">
              <LayoutGrid size={15} /> Shop by Category <ChevronDown size={14} className={cn("transition", catOpen && "rotate-180")} />
            </button>
            {catOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setCatOpen(false)} />
                <div className="absolute left-0 top-full z-20 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl fade-up">
                  {cats.map((c) => (
                    <Link key={c.id} href={`/shop?category=${c.slug}`} onClick={() => setCatOpen(false)} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700">
                      <span>{c.name}</span>
                      <span className="text-[10px] font-bold uppercase text-slate-400">{c.store}</span>
                    </Link>
                  ))}
                  <Link href="/shop" onClick={() => setCatOpen(false)} className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-bold text-brand-700">
                    <Package size={15} /> View All Products
                  </Link>
                </div>
              </>
            )}
          </div>
          <div ref={navLinksRef} onPointerLeave={() => setHoveredNav(null)} className="relative flex min-w-0 flex-1 items-center justify-between overflow-x-auto no-scrollbar">
            {NAV_LINKS.map((link) => {
              const active = activeNavLabel === link.label;
              return (
                <Link
                  key={link.label}
                  ref={(element) => { navItemRefs.current[link.label] = element; }}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => {
                    setHoveredNav(null);
                    window.setTimeout(() => window.dispatchEvent(new Event("donwise:navigate")), 0);
                  }}
                  onPointerEnter={() => setHoveredNav(link.label)}
                  className={cn(
                    "relative z-10 flex h-[54px] shrink-0 items-center px-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:text-brand-700 sm:px-3 lg:text-xs",
                    active || hoveredNav === link.label ? "text-brand-700" : "text-slate-700 hover:text-brand-700",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-1 z-0 h-0.5 rounded-full bg-brand-600 shadow-[0_0_12px_rgba(29,100,216,0.6)] transition-[left,width,opacity] duration-300 ease-out"
              style={{ left: navIndicator.left, width: navIndicator.width, opacity: navIndicator.visible ? 1 : 0 }}
            />
          </div>
          <div className="ml-auto hidden shrink-0 items-center gap-1.5 py-2 text-xs font-semibold text-emerald-700 xl:flex">
            <BadgeCheck size={15} /> 100% Genuine
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-5 pt-3 md:hidden">
          <form onSubmit={submit} className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." className="h-11 flex-1 bg-transparent px-4 text-sm outline-none" />
            <button type="submit" className="m-1 grid h-9 w-10 place-items-center rounded-lg bg-brand-600 text-white"><Search size={16} /></button>
          </form>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {NAV_LINKS.map((link) => {
              const active = activeNavLabel === link.label;
              return (
                <Link key={link.label} href={link.href} onClick={() => {
                  setMobileOpen(false);
                  window.setTimeout(() => window.dispatchEvent(new Event("donwise:navigate")), 0);
                }} aria-current={active ? "page" : undefined} className={cn("rounded-xl border px-3 py-2.5 text-[13px] font-bold transition", active ? "border-brand-200 bg-brand-50 text-brand-700" : "border-slate-100 bg-slate-50 text-slate-700 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700")}>{link.label}</Link>
              );
            })}
          </div>
          <div className="mt-3 flex gap-2">
            <Link href="/compare" onClick={() => setMobileOpen(false)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-[13px] font-bold text-slate-700"><GitCompareArrows size={15} /> Compare ({compare.length})</Link>
            {user ? (
              <Link href={user.role === "admin" ? "/admin" : "/account"} onClick={() => setMobileOpen(false)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ink-900 py-2.5 text-[13px] font-bold text-white"><User size={15} /> {user.name.split(" ")[0]}</Link>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-[13px] font-bold text-white"><User size={15} /> Sign In</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
