"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Store, Eye, EyeOff } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { Button, Input, PageLoader } from "@/components/ui";

function LoginInner() {
  const { login, toast } = useShop();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Login failed");
      return;
    }
    router.push(next);
  };

  const fillDemo = (e: string, p: string) => { setEmail(e); setPassword(p); };

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-ink-900 text-white shadow-lg"><Store size={22} /></div>
        <p className="text-2xl font-black">Don<span className="text-brand-600">wise</span></p>
      </Link>
      <div className="mt-6 w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
        <h1 className="text-xl font-black text-slate-900">Welcome back 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to track orders & checkout faster.</p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div className="relative">
            <Input label="Password" type={show ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-[34px] text-slate-400">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
          </div>
          {error && <p className="rounded-xl bg-red-50 p-3 text-[13px] font-semibold text-red-600">{error}</p>}
          <Button type="submit" loading={loading} className="w-full" size="lg">Sign In</Button>
        </form>
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-[13px]">
          <p className="font-bold text-slate-700">Try demo accounts:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => fillDemo("admin@donwise.ng", "admin123")} className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-bold text-white">Admin demo</button>
            <button onClick={() => fillDemo("chiamaka@gmail.com", "customer123")} className="rounded-lg bg-brand-100 px-3 py-1.5 text-xs font-bold text-brand-700">Customer demo</button>
          </div>
        </div>
        <p className="mt-5 text-center text-sm text-slate-500">
          Don&apos;t have an account? <Link href="/register" className="font-bold text-brand-600 hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<PageLoader />}><LoginInner /></Suspense>;
}
