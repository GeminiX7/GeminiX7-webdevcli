import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNaira(amount: number): string {
  return "₦" + Number(amount || 0).toLocaleString("en-NG");
}

export function formatNumber(n: number): string {
  return Number(n || 0).toLocaleString("en-NG");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function generateOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DNW-${ymd}-${rand}`;
}

export function generateTrackingNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `TRK-${s}`;
}

export function timeAgo(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export function discountPercent(price: number, compareAt?: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export const STORE_META: Record<string, { label: string; tagline: string; color: string; bg: string }> = {
  computers: { label: "Computers", tagline: "Laptops & Desktops", color: "text-blue-700", bg: "bg-blue-50" },
  iphone: { label: "iPhone Store", tagline: "Apple & Smartphones", color: "text-slate-900", bg: "bg-slate-100" },
  games: { label: "Games & PlayStation", tagline: "Consoles & Titles", color: "text-purple-700", bg: "bg-purple-50" },
  gadgets: { label: "Gadget Store", tagline: "Wearables & Smart Tech", color: "text-emerald-700", bg: "bg-emerald-50" },
  accessories: { label: "Accessories", tagline: "Audio, Power & More", color: "text-amber-700", bg: "bg-amber-50" },
};

export function productImage(p: { images?: string[] | null; name?: string }): string {
  if (p.images && p.images.length > 0) return p.images[0];
  return `https://placehold.co/800x600/1e3a8a/ffffff?text=${encodeURIComponent(p.name || "Donwise")}`;
}
