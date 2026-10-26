export const SITE = {
  name: "Donwise",
  fullName: "Donwise Computers & iPhone Stores",
  tagline: "Owerri's No.1 Plug for Computers, iPhones, Games & Gadgets",
  address: "12 Douglas Road, Owerri, Imo State",
  address2: "Shop B14 Somachi Plaza, Ikenegbu, Owerri",
  phone: "+234 803 123 4567",
  phone2: "+234 905 987 6543",
  email: "hello@donwise.ng",
  supportEmail: "support@donwise.ng",
  hours: "Mon – Sat: 8:00am – 8:00pm",
  freeShippingThreshold: 250000,
};

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Computers", href: "/shop?store=computers" },
  { label: "iPhone Store", href: "/shop?store=iphone" },
  { label: "Games & PS", href: "/shop?store=games" },
  { label: "Gadgets", href: "/shop?store=gadgets" },
  { label: "Accessories", href: "/shop?store=accessories" },
  { label: "Deals", href: "/deals" },
  { label: "Brands", href: "/brands" },
];

export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;
export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  refunded: "bg-slate-200 text-slate-700 border-slate-300",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  failed: "bg-red-100 text-red-800 border-red-200",
};
