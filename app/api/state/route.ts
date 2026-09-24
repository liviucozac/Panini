import { NextResponse } from "next/server";
import { redis, KEYS } from "@/lib/redis";
import type { Ingredient, Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const [ingredients, orders] = await Promise.all([
    redis.get<Ingredient[]>(KEYS.ingredients),
    redis.hgetall<Record<string, Order>>(KEYS.orders),
  ]);
  return NextResponse.json({ ingredients: ingredients ?? [], orders: orders ?? {} });
}
