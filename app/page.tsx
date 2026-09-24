"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ADMIN, PEOPLE, type AppState, type Ingredient } from "@/lib/types";
import SauceAlarm from "./SauceAlarm";
import AdminPanel from "./AdminPanel";
import { lei } from "@/lib/format";


export default function Home() {
  const [data, setData] = useState<AppState | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [me, setMe] = useState<string | null>(null);
  const [pin, setPin] = useState<string | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [tab, setTab] = useState<"order" | "admin">("order");

  const [count, setCount] = useState(1);
  const [picked, setPicked] = useState<string[]>([]);
  const [sauce, setSauce] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const draftFor = useRef<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/state", { cache: "no-store" });
      if (!r.ok) throw new Error();
      setData(await r.json());
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    load();
    try {
      const saved = localStorage.getItem("me");
      if (saved && saved !== ADMIN && (PEOPLE as readonly string[]).includes(saved)) setMe(saved);
    } catch {}
  }, [load]);

  // Load the person's saved order into the form once, when they're picked.
  useEffect(() => {
    if (!me || !data || draftFor.current === me) return;
    const o = data.orders[me];
    setCount(o?.count ?? 1);
    setPicked(o?.ingredientIds ?? []);
    draftFor.current = me;
  }, [me, data]);

  const choose = (name: string) => {
    if (name === ADMIN && !pin) return setPinOpen(true);
    setMe(name);
    setTab("order");
    try { if (name !== ADMIN) localStorage.setItem("me", name); } catch {}
  };

  const toggle = (ing: Ingredient) => {
    if (ing.sauce) return setSauce(ing.name);
    setPicked((p) => (p.includes(ing.id) ? p.filter((x) => x !== ing.id) : [...p, ing.id]));
  };

  const ingredients = data?.ingredients ?? [];
  const perSandwich = useMemo(
    () => ingredients.filter((i) => picked.includes(i.id)).reduce((s, i) => s + i.price, 0),
    [ingredients, picked]
  );

  const save = async () => {
    if (!me) return;
    setSaving(true);
    const r = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: me, count, ingredientIds: picked }),
    });
    setSaving(false);
    setFlash(r.ok ? (count === 0 ? "Comanda a fost ștearsă." : "Comanda a fost salvată.") : "Nu s-a salvat. Mai încearcă o dată.");
    setTimeout(() => setFlash(null), 2500);
    load();
  };

  const hasOrder = !!(me && data?.orders[me]);

  return (
    <main className="wrap">
      <header className="top">
        <h1>Sandvișuri de sâmbătă</h1>
        <p className="sub">Alege ce vrei, Liviu le face. Fără sosuri.</p>
      </header>

      {loadError && <p className="error">Nu mă pot conecta la baza de date. Reîncarcă pagina.</p>}

      <section aria-labelledby="who">
        <h2 id="who">{me ? `Salut, ${me}` : "Cine ești?"}</h2>
        <div className="chips">
          {PEOPLE.map((p) => (
            <button
              key={p}
              className={`chip ${me === p ? "on" : ""} ${data?.orders[p] ? "done" : ""}`}
              onClick={() => choose(p)}
              aria-pressed={me === p}
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {me === ADMIN && (
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === "order"} onClick={() => setTab("order")}>Comanda mea</button>
          <button role="tab" aria-selected={tab === "admin"} onClick={() => setTab("admin")}>Ingrediente și total</button>
        </div>
      )}

      {me && tab === "admin" && pin && data && <AdminPanel data={data} pin={pin} reload={load} />}

      {me && tab === "order" && data && (
        <section aria-labelledby="order">
          <h2 id="order" className="sr">Comanda ta</h2>

          <div className="stepper">
            <span>Câte sandvișuri?</span>
            <div className="stepper-ctl">
              <button onClick={() => setCount((c) => Math.max(0, c - 1))} aria-label="Mai puține">−</button>
              <motion.strong key={count} initial={{ scale: 1.4 }} animate={{ scale: 1 }}>{count}</motion.strong>
              <button onClick={() => setCount((c) => Math.min(10, c + 1))} aria-label="Mai multe">+</button>
            </div>
          </div>

          {ingredients.length === 0 ? (
            <p className="empty">
              {me === ADMIN ? "Nu ai adăugat încă ingrediente. Treci la „Ingrediente și total”." : "Liviu n-a pus încă ingredientele. Revino puțin mai târziu."}
            </p>
          ) : (
            <ul className="ingredients">
              {ingredients.map((ing) => {
                const on = picked.includes(ing.id);
                return (
                  <li key={ing.id}>
                    <button className={`ing ${on ? "on" : ""} ${ing.sauce ? "sauce" : ""}`} onClick={() => toggle(ing)} aria-pressed={on}>
                      <span className="tick" aria-hidden>{on ? "✓" : ""}</span>
                      <span className="ing-name">{ing.name}</span>
                      <span className="ing-price">{lei(ing.price)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="bar">
            <div className="bar-sum">
              <small>{count} × {lei(perSandwich)}</small>
              <motion.strong key={perSandwich * count} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                {lei(perSandwich * count)}
              </motion.strong>
            </div>
            <button className="save" onClick={save} disabled={saving || (count > 0 && picked.length === 0)}>
              {saving ? "Se salvează…" : count === 0 && hasOrder ? "Șterge comanda" : "Salvează comanda"}
            </button>
          </div>
        </section>
      )}

      <AnimatePresence>
        {flash && (
          <motion.div className="toast" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
            {flash}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{sauce && <SauceAlarm sauce={sauce} onClose={() => setSauce(null)} />}</AnimatePresence>

      {pinOpen && (
        <PinDialog
          onClose={() => setPinOpen(false)}
          onOk={(p) => {
            setPin(p);
            setPinOpen(false);
            setMe(ADMIN);
            setTab("admin");
          }}
        />
      )}
    </main>
  );
}

function PinDialog({ onClose, onOk }: { onClose: () => void; onOk: (pin: string) => void }) {
  const [value, setValue] = useState("");
  const [err, setErr] = useState(false);

  const submit = async () => {
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: value, action: "verify" }),
    });
    if (r.ok) onOk(value);
    else setErr(true);
  };

  return (
    <div className="scrim" onClick={onClose}>
      <div className="dialog" role="dialog" aria-modal aria-labelledby="pin-t" onClick={(e) => e.stopPropagation()}>
        <h2 id="pin-t">Doar Liviu are voie aici</h2>
        <input
          autoFocus
          type="password"
          inputMode="numeric"
          placeholder="PIN"
          value={value}
          onChange={(e) => { setValue(e.target.value); setErr(false); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        {err && <p className="error">PIN greșit. Frumoasă încercare.</p>}
        <div className="row">
          <button className="ghost" onClick={onClose}>Renunță</button>
          <button className="save" onClick={submit}>Intră</button>
        </div>
      </div>
    </div>
  );
}
