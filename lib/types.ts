export const PEOPLE = ["Emanuel", "Gabriela", "Ema", "Dani", "Miriam", "Beni", "Liviu"] as const;
export const ADMIN = "Liviu";
export type Person = (typeof PEOPLE)[number];

export type Ingredient = { id: string; name: string; price: number; sauce: boolean };
export type Order = { count: number; ingredientIds: string[]; updatedAt: number };
export type AppState = { ingredients: Ingredient[]; orders: Record<string, Order> };

export const isPerson = (n: unknown): n is Person =>
  typeof n === "string" && (PEOPLE as readonly string[]).includes(n);
