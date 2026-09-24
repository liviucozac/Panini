import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "",
  token: process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
});

export const KEYS = {
  ingredients: "sandvisuri:ingredients",
  orders: "sandvisuri:orders", // hash: name -> Order (one field per person, no overwrite races)
};
