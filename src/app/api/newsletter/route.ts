import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { newsletters } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    await db.insert(newsletters).values({ email: email.toLowerCase().trim() }).onConflictDoNothing();
    return NextResponse.json({ ok: true, message: "Subscribed! Watch your inbox for deals." });
  } catch {
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}

export async function GET() {
  const rows = await db.select().from(newsletters).limit(200);
  return NextResponse.json({ subscribers: rows });
}
