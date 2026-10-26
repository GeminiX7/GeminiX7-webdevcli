import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories, brands } from "@/db/schema";
import { eq, and, or, ilike, gte, lte, desc, asc, sql, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const search = sp.get("search") || "";
  const category = sp.get("category"); // slug
  const brand = sp.get("brand"); // slug
  const store = sp.get("store");
  const minPrice = sp.get("minPrice");
  const maxPrice = sp.get("maxPrice");
  const sort = sp.get("sort") || "featured";
  const featured = sp.get("featured");
  const isNew = sp.get("new");
  const onSale = sp.get("sale");
  const limit = Math.min(Number(sp.get("limit") || "24"), 100);
  const page = Math.max(Number(sp.get("page") || "1"), 1);
  const slug = sp.get("slug");

  // Single by slug
  if (slug) {
    const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const p = rows[0];
    const [cat, br] = await Promise.all([
      p.categoryId ? db.select().from(categories).where(eq(categories.id, p.categoryId)).limit(1) : [],
      p.brandId ? db.select().from(brands).where(eq(brands.id, p.brandId)).limit(1) : [],
    ]);
    // related
    const related = await db.select().from(products)
      .where(and(eq(products.store, p.store), sql`${products.id} != ${p.id}`))
      .limit(4);
    return NextResponse.json({ product: { ...p, category: cat[0] || null, brand: br[0] || null }, related });
  }

  const conditions: ReturnType<typeof eq>[] = [];
  if (store) conditions.push(eq(products.store, store));
  if (featured === "true") conditions.push(eq(products.isFeatured, true));
  if (isNew === "true") conditions.push(eq(products.isNewArrival, true));
  if (onSale === "true") conditions.push(eq(products.isOnSale, true));
  if (minPrice) conditions.push(gte(products.price, Number(minPrice)));
  if (maxPrice) conditions.push(lte(products.price, Number(maxPrice)));
  conditions.push(eq(products.isActive, true));
  if (search) {
    conditions.push(
      or(
        ilike(products.name, `%${search}%`),
        ilike(products.description, `%${search}%`),
        ilike(products.sku, `%${search}%`)
      ) as unknown as ReturnType<typeof eq>
    );
  }

  let categoryId: number | null = null;
  if (category) {
    const c = await db.select().from(categories).where(eq(categories.slug, category)).limit(1);
    if (c[0]) categoryId = c[0].id;
    else return NextResponse.json({ products: [], total: 0, page, totalPages: 0 });
  }
  if (categoryId) conditions.push(eq(products.categoryId, categoryId));

  let brandId: number | null = null;
  if (brand) {
    const b = await db.select().from(brands).where(eq(brands.slug, brand)).limit(1);
    if (b[0]) brandId = b[0].id;
    else return NextResponse.json({ products: [], total: 0, page, totalPages: 0 });
  }
  if (brandId) conditions.push(eq(products.brandId, brandId));

  const where = and(...conditions);

  let orderBy: ReturnType<typeof desc> | ReturnType<typeof asc> | ReturnType<typeof sql> = desc(products.soldCount);
  if (sort === "price_asc") orderBy = asc(products.price);
  else if (sort === "price_desc") orderBy = desc(products.price);
  else if (sort === "newest") orderBy = desc(products.createdAt);
  else if (sort === "rating") orderBy = desc(products.ratingAvg);
  else if (sort === "name") orderBy = asc(products.name);

  const totalRows = await db.select({ count: sql<number>`count(*)` }).from(products).where(where);
  const total = Number(totalRows[0]?.count || 0);
  const totalPages = Math.ceil(total / limit);

  const rows = await db.select().from(products).where(where).orderBy(orderBy).limit(limit).offset((page - 1) * limit);

  // enrich with category/brand names
  const catIds = [...new Set(rows.map((r) => r.categoryId).filter(Boolean))] as number[];
  const brandIds = [...new Set(rows.map((r) => r.brandId).filter(Boolean))] as number[];
  const [catRows, brandRows] = await Promise.all([
    catIds.length ? db.select().from(categories).where(inArray(categories.id, catIds)) : [],
    brandIds.length ? db.select().from(brands).where(inArray(brands.id, brandIds)) : [],
  ]);
  const catMap = new Map(catRows.map((c) => [c.id, c]));
  const brandMap = new Map(brandRows.map((b) => [b.id, b]));

  return NextResponse.json({
    products: rows.map((r) => ({ ...r, category: r.categoryId ? catMap.get(r.categoryId) || null : null, brand: r.brandId ? brandMap.get(r.brandId) || null : null })),
    total, page, totalPages,
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = await req.json();
    if (!b.name || !b.price) return NextResponse.json({ error: "Name and price required" }, { status: 400 });
    const [row] = await db.insert(products).values({
      name: b.name,
      slug: b.slug || `${slugify(b.name)}-${Date.now().toString(36)}`,
      sku: b.sku || `DNW-${Date.now().toString(36).toUpperCase()}`,
      description: b.description || null,
      shortDescription: b.shortDescription || null,
      price: Number(b.price),
      compareAtPrice: b.compareAtPrice ? Number(b.compareAtPrice) : null,
      costPrice: b.costPrice ? Number(b.costPrice) : null,
      categoryId: b.categoryId || null,
      brandId: b.brandId || null,
      store: b.store || "computers",
      stock: Number(b.stock ?? 0),
      lowStockThreshold: Number(b.lowStockThreshold ?? 5),
      images: b.images || [],
      specs: b.specs || {},
      features: b.features || [],
      tags: b.tags || [],
      isFeatured: !!b.isFeatured,
      isNewArrival: !!b.isNewArrival,
      isOnSale: !!b.isOnSale,
      isActive: b.isActive ?? true,
    }).returning();
    return NextResponse.json({ product: row }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
