import { NextResponse } from "next/server";
import { redis, KEYS, getPeople } from "@/lib/redis";
import { DRAGOSTE, type Ingredient, type Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const [people, ingredients, orders] = await Promise.all([
    getPeople(),
    redis.get<Ingredient[]>(KEYS.ingredients),
    redis.hgetall<Record<string, Order>>(KEYS.orders),
  ]);
  return NextResponse.json({ people, ingredients: [...(ingredients ?? []), DRAGOSTE], orders: orders ?? {} });
}
