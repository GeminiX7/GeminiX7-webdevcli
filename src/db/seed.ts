import { db } from "@/db";
import { users, categories, brands, products, orders, orderItems, reviews, newsletters } from "@/db/schema";
import { seedCategories, seedBrands, seedProducts, seedUsers, seedReviews, IMG } from "./seed-data";
import { hashPassword } from "@/lib/auth";
import { generateOrderNumber, generateTrackingNumber } from "@/lib/utils";
import { eq, sql } from "drizzle-orm";

export async function seedDatabase() {
  // Check if already seeded
  const existing = await db.select({ count: sql<number>`count(*)` }).from(products);
  const count = Number(existing[0]?.count || 0);
  if (count > 0) {
    return { seeded: false, message: "Already seeded", products: count };
  }

  // Users
  const userIds: Record<string, number> = {};
  for (const u of seedUsers) {
    const [row] = await db.insert(users).values({
      name: u.name,
      email: u.email,
      passwordHash: await hashPassword(u.password),
      role: u.role,
      phone: u.phone,
      address: u.address,
      city: u.city,
      state: u.state,
    }).returning({ id: users.id });
    userIds[u.email] = row.id;
  }

  // Categories
  const catIds: Record<string, number> = {};
  for (const c of seedCategories) {
    const [row] = await db.insert(categories).values({
      name: c.name, slug: c.slug, description: c.description,
      imageUrl: c.imageUrl, icon: c.icon, store: c.store, sortOrder: c.sortOrder,
    }).returning({ id: categories.id });
    catIds[c.slug] = row.id;
  }

  // Brands
  const brandIds: Record<string, number> = {};
  for (const b of seedBrands) {
    const [row] = await db.insert(brands).values({
      name: b.name, slug: b.slug, description: b.description, isFeatured: b.isFeatured,
    }).returning({ id: brands.id });
    brandIds[b.slug] = row.id;
  }

  // Products
  const prodIds: Record<string, number> = {};
  const prodList: { id: number; name: string; price: number; image: string; slug: string }[] = [];
  for (const p of seedProducts) {
    const [row] = await db.insert(products).values({
      name: p.name, slug: p.slug, sku: p.sku, description: p.description,
      shortDescription: p.shortDescription, price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      categoryId: catIds[p.categorySlug] ?? null,
      brandId: brandIds[p.brandSlug] ?? null,
      store: p.store, stock: p.stock,
      images: p.images, specs: p.specs, features: p.features, tags: p.tags,
      ratingAvg: p.ratingAvg, ratingCount: p.ratingCount, soldCount: p.soldCount,
      isFeatured: p.isFeatured ?? false, isNewArrival: p.isNewArrival ?? false, isOnSale: p.isOnSale ?? false,
    }).returning({ id: products.id });
    prodIds[p.slug] = row.id;
    prodList.push({ id: row.id, name: p.name, price: p.price, image: p.images[0], slug: p.slug });
  }

  // Reviews
  for (const r of seedReviews) {
    const pid = prodIds[r.productSlug];
    if (!pid) continue;
    await db.insert(reviews).values({
      productId: pid, authorName: r.authorName, rating: r.rating, title: r.title, comment: r.comment,
    });
  }

  // Orders (realistic demo)
  const demoOrders = [
    { name: "Chiamaka Okafor", email: "chiamaka@gmail.com", phone: "+234 806 234 5678", city: "Owerri", items: ["iphone-16-128", "apple-airpods-pro-2"], status: "delivered", pay: "paid", days: 12 },
    { name: "Emeka Nwosu", email: "emeka.n@gmail.com", phone: "+234 705 345 6789", city: "Owerri", items: ["sony-ps5-slim-disc", "ea-fc-25-ps5"], status: "delivered", pay: "paid", days: 9 },
    { name: "Adaeze Iheanacho", email: "adaeze.i@yahoo.com", phone: "+234 813 456 7890", city: "Owerri", items: ["lenovo-ideapad-slim-3"], status: "shipped", pay: "paid", days: 5 },
    { name: "Kelechi Madu", email: "kelechi.m@gmail.com", phone: "+234 902 111 2233", city: "Owerri", items: ["apple-macbook-air-m3-13", "logitech-mx-master-3s"], status: "processing", pay: "paid", days: 3 },
    { name: "Blessing Eze", email: "blessing.e@gmail.com", phone: "+234 814 555 6677", city: "Nekede", items: ["samsung-galaxy-a55", "anker-65w-gan-combo"], status: "processing", pay: "pending", days: 2 },
    { name: "David Obi", email: "david.o@gmail.com", phone: "+234 703 888 9900", city: "Ihiagwa", items: ["hp-pavilion-gaming-15"], status: "pending", pay: "pending", days: 1 },
    { name: "Favour Uche", email: "favour.u@gmail.com", phone: "+234 816 222 3344", city: "Owerri", items: ["oraimo-boompop-2", "anker-737-powercore-24k"], status: "pending", pay: "pending", days: 0 },
    { name: "Tobi Adeyemi", email: "tobi.a@gmail.com", phone: "+234 805 777 8899", city: "Orlu", items: ["sony-dualsense-white", "ea-fc-25-ps5"], status: "delivered", pay: "paid", days: 15 },
    { name: "Ngozi Kalu", email: "ngozi.k@gmail.com", phone: "+234 809 333 4455", city: "Owerri", items: ["apple-watch-s9-45"], status: "delivered", pay: "paid", days: 20 },
    { name: "Ibrahim Musa", email: "ibrahim.m@gmail.com", phone: "+234 807 666 7788", city: "Owerri", items: ["xiaomi-redmi-note-13-pro"], status: "cancelled", pay: "failed", days: 7 },
  ];

  for (const o of demoOrders) {
    const orderNum = generateOrderNumber();
    let subtotal = 0;
    const lines: { pid: number; name: string; image: string; price: number; qty: number }[] = [];
    for (const slug of o.items) {
      const p = prodList.find((x) => x.slug === slug);
      if (!p) continue;
      const qty = 1;
      subtotal += p.price * qty;
      lines.push({ pid: p.id, name: p.name, image: p.image, price: p.price, qty });
    }
    const shippingFee = subtotal >= 250000 ? 0 : 3500;
    const total = subtotal + shippingFee;
    const created = new Date();
    created.setDate(created.getDate() - o.days);
    const [ord] = await db.insert(orders).values({
      orderNumber: orderNum,
      userId: userIds[o.email] ?? null,
      status: o.status,
      paymentStatus: o.pay,
      paymentMethod: o.pay === "paid" ? "bank_transfer" : "pay_on_pickup",
      subtotal, shippingFee, discount: 0, total,
      customerName: o.name, customerEmail: o.email, customerPhone: o.phone,
      shippingAddress: "Demo address, Owerri", shippingCity: o.city, shippingState: "Imo State",
      trackingNumber: generateTrackingNumber(),
      createdAt: created, updatedAt: created,
    }).returning({ id: orders.id });
    for (const l of lines) {
      await db.insert(orderItems).values({
        orderId: ord.id, productId: l.pid, productName: l.name, productImage: l.image,
        unitPrice: l.price, quantity: l.qty, total: l.price * l.qty,
      });
    }
  }

  // Newsletter
  await db.insert(newsletters).values([
    { email: "chiamaka@gmail.com" },
    { email: "techlover.owerri@gmail.com" },
  ]).onConflictDoNothing();

  return { seeded: true, message: "Seeded successfully", products: seedProducts.length };
}
