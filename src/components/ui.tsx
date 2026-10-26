"use client";

import React from "react";
import { cn, formatNaira } from "@/lib/utils";
import { Star, StarHalf, Loader2, PackageOpen, X, Minus, Plus, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useShop } from "@/context/ShopContext";

// ---------- Button ----------
export function Button({ variant = "primary", size = "md", className, loading, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "outline" | "ghost" | "dark" | "danger"; size?: "sm" | "md" | "lg" | "icon"; loading?: boolean }) {
  const styles = {
    primary: "bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-blue-200",
    secondary: "bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200",
    outline: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200",
    ghost: "text-slate-600 hover:bg-slate-100",
    dark: "bg-ink-900 hover:bg-ink-800 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };
  const sizes = { sm: "h-8 px-3 text-xs rounded-lg", md: "h-10 px-4 text-sm rounded-xl", lg: "h-12 px-6 text-sm rounded-xl", icon: "h-9 w-9 rounded-lg grid place-items-center" };
  return (
    <button
      className={cn("inline-flex items-center justify-center gap-2 font-semibold transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none", styles[variant], sizes[size], className)}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

// ---------- Input ----------
export function Input({ label, error, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">{label}</label>}
      <input
        className={cn("h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 placeholder:text-slate-400", error && "border-red-400 focus:border-red-500", className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Textarea({ label, className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">{label}</label>}
      <textarea className={cn("w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 placeholder:text-slate-400", className)} {...props} />
    </div>
  );
}

export function Select({ label, children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">{label}</label>}
      <select className={cn("h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10", className)} {...props}>
        {children}
      </select>
    </div>
  );
}

// ---------- Badge ----------
export function Badge({ children, tone = "slate", className }: { children: React.ReactNode; tone?: "slate" | "blue" | "green" | "red" | "amber" | "purple"; className?: string }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    blue: "bg-brand-50 text-brand-700 border-brand-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", tones[tone], className)}>{children}</span>;
}

// ---------- Stars ----------
export function Stars({ value = 0, count, size = 14 }: { value?: number; count?: number; size?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.4;
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex items-center gap-[1px]">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < full) return <Star key={i} size={size} className="fill-amber-400 text-amber-400" />;
          if (i === full && half) return <StarHalf key={i} size={size} className="fill-amber-400 text-amber-400" />;
          return <Star key={i} size={size} className="text-slate-300" />;
        })}
      </span>
      {count !== undefined && <span className="text-xs text-slate-500">({count})</span>}
    </span>
  );
}

// ---------- Price ----------
export function Price({ price, compareAt, size = "md" }: { price: number; compareAt?: number | null; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-[15px]";
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className={cn("font-extrabold text-ink-900", cls)}>{formatNaira(price)}</span>
      {compareAt && compareAt > price && <span className="text-xs text-slate-400 line-through">{formatNaira(compareAt)}</span>}
    </span>
  );
}

// ---------- Empty State ----------
export function EmptyState({ icon, title, message, action }: { icon?: React.ReactNode; title: string; message?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        {icon || <PackageOpen className="h-8 w-8" />}
      </div>
      <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ---------- Modal ----------
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div className={cn("w-full rounded-t-3xl bg-white shadow-2xl fade-up max-h-[92vh] overflow-y-auto sm:rounded-2xl", wide ? "sm:max-w-3xl" : "sm:max-w-lg")} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
          <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"><X size={16} /></button>
        </div>
        <div className="px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}

// ---------- Quantity ----------
export function QtyStepper({ value, onChange, max = 99, small }: { value: number; onChange: (v: number) => void; max?: number; small?: boolean }) {
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1", small ? "" : "")}>
      <button onClick={() => onChange(Math.max(0, value - 1))} className="grid h-7 w-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"><Minus size={14} /></button>
      <span className={cn("min-w-7 text-center font-bold text-slate-900", small ? "text-xs" : "text-sm")}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} className="grid h-7 w-7 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"><Plus size={14} /></button>
    </div>
  );
}

// ---------- Skeletons ----------
export function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-5 w-1/3 rounded" />
      </div>
    </div>
  );
}

// ---------- Section Title ----------
export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ---------- Toasts ----------
export function Toasts() {
  const { toasts, dismissToast } = useShop();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl fade-up">
          <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl",
            t.type === "success" ? "bg-emerald-50 text-emerald-600" : t.type === "error" ? "bg-red-50 text-red-600" : "bg-brand-50 text-brand-600")}>
            {t.type === "success" ? <CheckCircle2 size={18} /> : t.type === "error" ? <AlertCircle size={18} /> : <Info size={18} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">{t.title}</p>
            {t.message && <p className="truncate text-xs text-slate-500">{t.message}</p>}
          </div>
          <button onClick={() => dismissToast(t.id)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

// ---------- Spinner page ----------
export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
