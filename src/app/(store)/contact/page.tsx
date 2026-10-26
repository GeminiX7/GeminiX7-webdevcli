"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Input, Textarea, Button } from "@/components/ui";
import { useShop } from "@/context/ShopContext";
import { SITE } from "@/lib/constants";

export default function ContactPage() {
  const { toast } = useShop();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast("Message sent!", { message: "We'll get back to you within 24 hours." });
    }, 900);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Contact Us</h1>
      <p className="mt-1 text-sm text-slate-500">Questions about a product, order or warranty? We&apos;d love to hear from you.</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[380px_1fr]">
        <div className="space-y-3">
          {[
            { icon: MapPin, t: "Visit Our Stores", s: `${SITE.address}\n${SITE.address2}` },
            { icon: Phone, t: "Call Us", s: `${SITE.phone}\n${SITE.phone2}` },
            { icon: Mail, t: "Email Us", s: `${SITE.email}\n${SITE.supportEmail}` },
            { icon: Clock, t: "Opening Hours", s: `${SITE.hours}\nSunday: Closed` },
          ].map((c) => (
            <div key={c.t} className="flex gap-3.5 rounded-2xl border border-slate-100 bg-white p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600"><c.icon size={19} /></div>
              <div>
                <p className="text-sm font-extrabold text-slate-900">{c.t}</p>
                <p className="mt-0.5 whitespace-pre-line text-[13px] text-slate-500">{c.s}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-extrabold text-slate-900">Send us a message</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Your Name" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <div className="sm:col-span-2"><Input label="Subject" placeholder="e.g. Enquiry about PS5 Slim" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required /></div>
            <div className="sm:col-span-2"><Textarea label="Message" rows={5} placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required /></div>
          </div>
          <Button type="submit" loading={sending} className="mt-5" size="lg"><Send size={16} /> Send Message</Button>
        </form>
      </div>
    </div>
  );
}
