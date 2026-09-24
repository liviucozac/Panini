import { NextResponse } from "next/server";
import { redis, KEYS } from "@/lib/redis";
import type { Ingredient } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!process.env.ADMIN_PIN || body?.pin !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: "PIN greșit." }, { status: 401 });
  }

  switch (body.action) {
    case "verify":
      return NextResponse.json({ ok: true });

    case "saveIngredients": {
      const raw: unknown[] = Array.isArray(body.ingredients) ? body.ingredients : [];
      const clean: Ingredient[] = raw
        .filter((i): i is Ingredient => !!i && typeof (i as Ingredient).name === "string")
        .filter((i) => i.name.trim().length > 0)
        .map((i) => ({
          id: String(i.id),
          name: i.name.trim().slice(0, 40),
          price: Math.max(0, Math.round((Number(i.price) || 0) * 100) / 100),
          sauce: !!i.sauce,
        }));
      await redis.set(KEYS.ingredients, clean);
      return NextResponse.json({ ok: true });
    }

    case "resetOrders":
      await redis.del(KEYS.orders);
      return NextResponse.json({ ok: true });

    default:
      return NextResponse.json({ error: "Acțiune necunoscută." }, { status: 400 });
  }
}
