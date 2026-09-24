export const DEFAULT_PEOPLE = ["Emanuel", "Gabriela", "Ema", "Dani", "Miriam", "Beni", "Liviu"];
export const ADMIN = "Liviu";

export type Ingredient = { id: string; name: string; price: number; sauce: boolean };
export type Order = { count: number; ingredientIds: string[]; updatedAt: number };
export type AppState = { people: string[]; ingredients: Ingredient[]; orders: Record<string, Order> };

// Hard-coded, free, and heavily defended by the payment department.
export const DRAGOSTE: Ingredient = { id: "dragoste", name: "Dragoste", price: 0, sauce: false };
