"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useSyncExternalStore } from "react";

export type User = { id: number; name: string; email: string; role: string; phone?: string | null; city?: string | null };
export type ProductLite = {
  id: number; name: string; slug: string; price: number; compareAtPrice?: number | null;
  images: string[]; stock: number; ratingAvg?: number; ratingCount?: number; shortDescription?: string | null; store?: string;
};
export type CartLine = { productId: number; quantity: number; product: ProductLite };
export type Toast = { id: number; title: string; message?: string; type: "success" | "error" | "info" };

type ShopCtx = {
  user: User | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  cart: CartLine[];
  cartLoading: boolean;
  cartCount: number;
  cartSubtotal: number;
  addToCart: (product: ProductLite, qty?: number) => void;
  updateQty: (productId: number, qty: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  wishlist: ProductLite[];
  toggleWishlist: (product: ProductLite) => void;
  isWishlisted: (id: number) => boolean;
  compare: ProductLite[];
  toggleCompare: (product: ProductLite) => void;
  clearCompare: () => void;
  toasts: Toast[];
  toast: (title: string, opts?: { message?: string; type?: Toast["type"] }) => void;
  dismissToast: (id: number) => void;
};

const Ctx = createContext<ShopCtx | null>(null);

const STORAGE_CHANGE_EVENT = "donwise-storage-change";
const EMPTY_CART: CartLine[] = [];
const EMPTY_PRODUCTS: ProductLite[] = [];

function readLS<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function usePersistentState<T>(key: string, fallback: T) {
  const fallbackSnapshot = JSON.stringify(fallback);
  const subscribe = useCallback((onChange: () => void) => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) onChange();
    };
    const onLocalChange = (event: Event) => {
      if ((event as CustomEvent<string>).detail === key) onChange();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(STORAGE_CHANGE_EVENT, onLocalChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(STORAGE_CHANGE_EVENT, onLocalChange);
    };
  }, [key]);
  const getSnapshot = useCallback(() => {
    try {
      return localStorage.getItem(key) ?? fallbackSnapshot;
    } catch {
      return fallbackSnapshot;
    }
  }, [fallbackSnapshot, key]);
  const getServerSnapshot = useCallback(() => fallbackSnapshot, [fallbackSnapshot]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const value = useMemo(() => {
    try {
      return JSON.parse(snapshot) as T;
    } catch {
      return fallback;
    }
  }, [fallback, snapshot]);

  const setValue = useCallback((update: T | ((previous: T) => T)) => {
    const previous = readLS(key, fallback);
    const next = typeof update === "function"
      ? (update as (previous: T) => T)(previous)
      : update;
    localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: key }));
  }, [fallback, key]);

  return [value, setValue] as const;
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cart, setCart] = usePersistentState("donwise_cart", EMPTY_CART);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlist, setWishlist] = usePersistentState("donwise_wishlist", EMPTY_PRODUCTS);
  const [compare, setCompare] = usePersistentState("donwise_compare", EMPTY_PRODUCTS);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((title: string, opts?: { message?: string; type?: Toast["type"] }) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, title, message: opts?.message, type: opts?.type || "success" }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const refreshUser = useCallback(async () => {
    try {
      const r = await fetch("/api/auth/me", { cache: "no-store" });
      const j = await r.json();
      setUser(j.user || null);
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  // sync server cart/wishlist when logged in
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [c, w] = await Promise.all([
          fetch("/api/cart").then((r) => r.json()),
          fetch("/api/wishlist").then((r) => r.json()),
        ]);
        if (c.items?.length) {
          setCart((local) => {
            const server: CartLine[] = c.items.map((it: { productId: number; quantity: number; product: ProductLite }) => ({
              productId: it.productId, quantity: it.quantity, product: it.product,
            }));
            // merge: keep max qty
            const map = new Map<number, CartLine>();
            [...server, ...local].forEach((l) => {
              const prev = map.get(l.productId);
              map.set(l.productId, prev ? { ...l, quantity: Math.max(prev.quantity, l.quantity) } : l);
            });
            return [...map.values()];
          });
        }
        if (w.items?.length) {
          setWishlist((local) => {
            const ids = new Set(local.map((p) => p.id));
            const merged = [...local];
            w.items.forEach((it: { product: ProductLite }) => {
              if (!ids.has(it.product.id)) merged.push(it.product);
            });
            return merged;
          });
        }
      } catch { /* offline */ }
    })();
  }, [user, setCart, setWishlist]);

  const login = async (email: string, password: string) => {
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const j = await r.json();
    if (!r.ok) return { ok: false, error: j.error || "Login failed" };
    setUser(j.user);
    toast("Welcome back!", { message: `Signed in as ${j.user.name}`, type: "success" });
    return { ok: true };
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    const r = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const j = await r.json();
    if (!r.ok) return { ok: false, error: j.error || "Registration failed" };
    setUser(j.user);
    toast("Account created!", { message: "Welcome to Donwise 🎉", type: "success" });
    return { ok: true };
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setCart([]);
    toast("Signed out", { message: "See you soon!", type: "info" });
  };

  const addToCart = useCallback((product: ProductLite, qty = 1) => {
    setCart((prev) => {
      const found = prev.find((l) => l.productId === product.id);
      if (found) return prev.map((l) => l.productId === product.id ? { ...l, quantity: Math.min(l.quantity + qty, product.stock || 99) } : l);
      return [...prev, { productId: product.id, quantity: qty, product }];
    });
    if (user) fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id, quantity: qty }) }).catch(() => {});
    toast("Added to cart", { message: product.name.slice(0, 48), type: "success" });
  }, [user, toast, setCart]);

  const updateQty = useCallback((productId: number, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((l) => l.productId !== productId));
    } else {
      setCart((prev) => prev.map((l) => l.productId === productId ? { ...l, quantity: qty } : l));
    }
    if (user) fetch("/api/cart", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, quantity: qty }) }).catch(() => {});
  }, [user, setCart]);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
    if (user) fetch(`/api/cart?productId=${productId}`, { method: "DELETE" }).catch(() => {});
  }, [user, setCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    if (user) fetch("/api/cart", { method: "DELETE" }).catch(() => {});
  }, [user, setCart]);

  const toggleWishlist = useCallback((product: ProductLite) => {
    setWishlist((prev) => {
      const has = prev.some((p) => p.id === product.id);
      if (has) {
        if (user) fetch(`/api/wishlist?productId=${product.id}`, { method: "DELETE" }).catch(() => {});
        return prev.filter((p) => p.id !== product.id);
      }
      if (user) fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) }).catch(() => {});
      toast("Saved to wishlist", { message: product.name.slice(0, 48), type: "success" });
      return [...prev, product];
    });
  }, [user, toast, setWishlist]);

  const isWishlisted = useCallback((id: number) => wishlist.some((p) => p.id === id), [wishlist]);

  const toggleCompare = useCallback((product: ProductLite) => {
    setCompare((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev.filter((p) => p.id !== product.id);
      if (prev.length >= 4) {
        toast("Compare list full", { message: "You can compare up to 4 products", type: "error" });
        return prev;
      }
      toast("Added to compare", { message: product.name.slice(0, 48), type: "info" });
      return [...prev, product];
    });
  }, [toast, setCompare]);

  const clearCompare = useCallback(() => setCompare([]), [setCompare]);

  const cartCount = useMemo(() => cart.reduce((s, l) => s + l.quantity, 0), [cart]);
  const cartSubtotal = useMemo(() => cart.reduce((s, l) => s + l.quantity * l.product.price, 0), [cart]);

  return (
    <Ctx.Provider value={{
      user, authLoading, login, register, logout, refreshUser,
      cart, cartLoading, cartCount, cartSubtotal, addToCart, updateQty, removeFromCart, clearCart,
      wishlist, toggleWishlist, isWishlisted, compare, toggleCompare, clearCompare,
      toasts, toast, dismissToast,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useShop() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}
