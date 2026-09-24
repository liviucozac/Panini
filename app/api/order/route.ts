import { NextResponse } from "next/server";
import { redis, KEYS, getPeople } from "@/lib/redis";
import { DRAGOSTE, type Ingredient, type Order } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const people = await getPeople();
  if (!body || typeof body.name !== "string" || !people.includes(body.name)) {
    return NextResponse.json({ error: "Alege un nume din listă." }, { status: 400 });
  }
  const count = Math.max(0, Math.min(10, Math.floor(Number(body.count) || 0)));

  if (count === 0) {
    await redis.hdel(KEYS.orders, body.name);
    return NextResponse.json({ ok: true });
  }

  // Server-side sauce police: sauces never make it into the database.
  const ingredients = (await redis.get<Ingredient[]>(KEYS.ingredients)) ?? [];
  const allowed = new Set([DRAGOSTE.id, ...ingredients.filter((i) => !i.sauce).map((i) => i.id)]);
  const ids: string[] = Array.isArray(body.ingredientIds) ? body.ingredientIds : [];

  const order: Order = {
    count,
    ingredientIds: [...new Set(ids.filter((id) => allowed.has(id)))],
    updatedAt: Date.now(),
  };
  await redis.hset(KEYS.orders, { [body.name]: order });
  return NextResponse.json({ ok: true });
}
