import { NextResponse } from "next/server";
import { seedDatabase } from "@/db/seed";

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (e) {
    console.error("seed error", e);
    return NextResponse.json({ error: "Seed failed", details: String(e) }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (e) {
    console.error("seed error", e);
    return NextResponse.json({ error: "Seed failed", details: String(e) }, { status: 500 });
  }
}
