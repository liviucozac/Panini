import { Redis } from "@upstash/redis";
import { ADMIN, DEFAULT_PEOPLE } from "./types";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "",
  token: process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
});

export const KEYS = {
  people: "sandvisuri:people",
  ingredients: "sandvisuri:ingredients",
  orders: "sandvisuri:orders", // hash: name -> Order
};

export async function getPeople(): Promise<string[]> {
  const saved = await redis.get<string[]>(KEYS.people);
  const list = saved && saved.length ? saved : DEFAULT_PEOPLE;
  return list.includes(ADMIN) ? list : [...list, ADMIN];
}
