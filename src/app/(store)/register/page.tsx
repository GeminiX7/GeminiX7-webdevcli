"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { Button, Input } from "@/components/ui";

export default function RegisterPage() {
  const { register } = useShop();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError("Passwords do not match");
    setError("");
    setLoading(true);
    const res = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
    setLoading(false);
    if (!res.ok) return setError(res.error || "Registration failed");
    router.push("/");
  };

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-ink-900 text-white shadow-lg"><Store size={22} /></div>
        <p className="text-2xl font-black">Don<span className="text-brand-600">wise</span></p>
      </Link>
      <div className="mt-6 w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
        <h1 className="text-xl font-black text-slate-900">Create your account 🎉</h1>
        <p className="mt-1 text-sm text-slate-500">Join thousands shopping with Donwise Owerri.</p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <Input label="Full Name" placeholder="e.g. Chiamaka Okafor" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          <Input label="Phone Number" placeholder="e.g. 0803 123 4567" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Password" type="password" placeholder="Min. 6 chars" value={form.password} onChange={(e) => set("password", e.target.value)} required />
            <Input label="Confirm" type="password" placeholder="Repeat" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} required />
          </div>
          {error && <p className="rounded-xl bg-red-50 p-3 text-[13px] font-semibold text-red-600">{error}</p>}
          <Button type="submit" loading={loading} className="w-full" size="lg">Create Account</Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account? <Link href="/login" className="font-bold text-brand-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
