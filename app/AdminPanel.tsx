"use client";

import { useEffect, useMemo, useState } from "react";
import { ADMIN, DRAGOSTE, type AppState, type Ingredient } from "@/lib/types";
import { lei } from "@/lib/format";

export default function AdminPanel({ data, pin, reload }: { data: AppState; pin: string; reload: () => void }) {
  const editable = useMemo(() => data.ingredients.filter((i) => i.id !== DRAGOSTE.id), [data.ingredients]);
  const [draft, setDraft] = useState<Ingredient[]>(editable);
  const [msg, setMsg] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  useEffect(() => setDraft(editable), [editable]);

  const call = async (action: string, extra: object = {}) => {
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, action, ...extra }),
    });
    await reload();
    return r.ok;
  };

  const edit = (id: string, patch: Partial<Ingredient>) =>
    setDraft((d) => d.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const add = (sauce: boolean) =>
    setDraft((d) => [...d, { id: crypto.randomUUID(), name: "", price: 0, sauce }]);

  const saveIngredients = async () => {
    const ok = await call("saveIngredients", { ingredients: draft });
    setMsg(ok ? "Ingredientele au fost salvate." : "Nu s-au salvat. Verifică PIN-ul.");
  };

  const reset = async () => {
    if (!confirm("Ștergi toate comenzile? Ingredientele rămân.")) return;
    setMsg((await call("resetOrders")) ? "Comenzile au fost șterse." : "Nu s-au șters.");
  };

  const savePeople = async (people: string[]) => {
    const ok = await call("savePeople", { people });
    setMsg(ok ? "Lista de oameni a fost salvată." : "Nu s-a salvat lista.");
  };

  const addPerson = () => {
    const n = newName.trim();
    if (!n || data.people.includes(n)) return;
    setNewName("");
    savePeople([...data.people, n]);
  };

  const removePerson = (n: string) => {
    if (!confirm(`Îl scoți pe ${n}? Și comanda lui dispare.`)) return;
    savePeople(data.people.filter((p) => p !== n));
  };

  const byId = useMemo(() => new Map(data.ingredients.map((i) => [i.id, i])), [data.ingredients]);
  const priceOf = (ids: string[]) => ids.reduce((s, id) => s + (byId.get(id)?.price ?? 0), 0);

  const rows = data.people.map((p) => ({ name: p, order: data.orders[p] }));
  const grand = rows.reduce((s, r) => s + (r.order ? r.order.count * priceOf(r.order.ingredientIds) : 0), 0);
  const sandwiches = rows.reduce((s, r) => s + (r.order?.count ?? 0), 0);
  const missing = rows.filter((r) => !r.order).map((r) => r.name);

  const shopping = data.ingredients
    .filter((i) => !i.sauce)
    .map((i) => ({
      name: i.name,
      portions: rows.reduce((s, r) => s + (r.order?.ingredientIds.includes(i.id) ? r.order.count : 0), 0),
    }))
    .filter((x) => x.portions > 0);

  return (
    <div className="admin">
      <section aria-labelledby="ppl-t">
        <h2 id="ppl-t">Oameni</h2>
        <ul className="people">
          {data.people.map((p) => (
            <li key={p}>
              <span>{p}</span>
              {p !== ADMIN && <button className="ghost" aria-label={`Scoate-l pe ${p}`} onClick={() => removePerson(p)}>✕</button>}
            </li>
          ))}
        </ul>
        <div className="row add-person">
          <input placeholder="Nume nou" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPerson()} />
          <button className="save" onClick={addPerson}>Adaugă</button>
        </div>
      </section>

      <section aria-labelledby="ing-t">
        <h2 id="ing-t">Ingrediente</h2>
        <p className="hint">Prețul e pe porție, pentru un sandviș. Ce bifezi ca sos devine capcană. „Dragoste” e fixă și gratuită.</p>
        <ul className="editor">
          {draft.map((i) => (
            <li key={i.id} className={i.sauce ? "is-sauce" : ""}>
              <input aria-label="Nume" placeholder={i.sauce ? "ex. maioneză" : "ex. șnițel"} value={i.name} onChange={(e) => edit(i.id, { name: e.target.value })} />
              <input aria-label="Preț" type="number" min={0} step={0.5} inputMode="decimal" value={i.price} onChange={(e) => edit(i.id, { price: Number(e.target.value) })} />
              <label className="sauce-toggle">
                <input type="checkbox" checked={i.sauce} onChange={(e) => edit(i.id, { sauce: e.target.checked })} /> sos
              </label>
              <button className="ghost" aria-label={`Șterge ${i.name || "rândul"}`} onClick={() => setDraft((d) => d.filter((x) => x.id !== i.id))}>✕</button>
            </li>
          ))}
        </ul>
        <div className="row">
          <button className="ghost" onClick={() => add(false)}>Adaugă ingredient</button>
          <button className="ghost" onClick={() => add(true)}>Adaugă sos (capcană)</button>
        </div>
        <button className="save wide" onClick={saveIngredients}>Salvează ingredientele</button>
        {msg && <p className="hint">{msg}</p>}
      </section>

      <section aria-labelledby="ord-t">
        <h2 id="ord-t">Comenzi</h2>
        <div className="scroll">
          <table>
            <tbody>
              {rows.map(({ name, order }) => (
                <tr key={name} className={order ? "" : "none"}>
                  <th>{name}</th>
                  <td>{order ? `${order.count} × ${order.ingredientIds.map((id) => byId.get(id)?.name).filter(Boolean).join(", ") || "pâine goală"}` : "n-a comandat"}</td>
                  <td className="num">{order ? lei(order.count * priceOf(order.ingredientIds)) : ""}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th>Total</th>
                <td>{sandwiches} sandvișuri</td>
                <td className="num">{lei(grand)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        {missing.length > 0 && <p className="hint">Mai trebuie să comande: {missing.join(", ")}.</p>}
      </section>

      <section aria-labelledby="shop-t">
        <h2 id="shop-t">De cumpărat</h2>
        {shopping.length === 0 ? (
          <p className="hint">Lista apare când intră primele comenzi.</p>
        ) : (
          <ul className="shopping">
            {shopping.map((s) => (
              <li key={s.name}><span>{s.name}</span><strong>{s.portions} porții</strong></li>
            ))}
          </ul>
        )}
        <button className="ghost danger" onClick={reset}>Șterge toate comenzile</button>
      </section>
    </div>
  );
}
