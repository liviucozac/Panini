"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Purely theatrical: inputs are uncontrolled, never read, never sent anywhere.
export default function PaymentPrank({ onPaid, onCancel }: { onPaid: () => void; onCancel: () => void }) {
  const [stage, setStage] = useState<"form" | "processing" | "reveal">("form");

  const pay = (e: React.FormEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLFormElement).reset();
    setStage("processing");
    setTimeout(() => setStage("reveal"), 1600);
  };

  return (
    <div className="scrim pay-scrim">
      <motion.div
        className="pay"
        role="dialog"
        aria-modal
        aria-labelledby="pay-t"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 22, stiffness: 260 }}
      >
        <AnimatePresence mode="wait">
          {stage === "form" && (
            <motion.form key="form" onSubmit={pay} autoComplete="off" exit={{ opacity: 0 }}>
              <div className="pay-head">
                <span className="pay-lock" aria-hidden>🔒</span>
                <span>Plată securizată</span>
                <button type="button" className="pay-x" onClick={onCancel} aria-label="Renunță">✕</button>
              </div>
              <p className="pay-item">Dragoste, 1 porție premium</p>
              <p className="pay-amount" id="pay-t">€999,99</p>

              <label>Număr card<input name="x1" inputMode="numeric" placeholder="1234 5678 9012 3456" autoComplete="off" /></label>
              <div className="pay-row">
                <label>Expiră<input name="x2" placeholder="LL/AA" autoComplete="off" /></label>
                <label>CVC<input name="x3" inputMode="numeric" placeholder="123" autoComplete="off" /></label>
              </div>
              <label>Nume pe card<input name="x4" placeholder="Numele tău" autoComplete="off" /></label>

              <button type="submit" className="pay-btn">Plătește €999,99</button>
              <button type="button" className="pay-cancel" onClick={onCancel}>Renunț la dragoste</button>
            </motion.form>
          )}

          {stage === "processing" && (
            <motion.div key="proc" className="pay-proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="spinner" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} />
              <p>Se verifică sentimentele…</p>
            </motion.div>
          )}

          {stage === "reveal" && (
            <motion.div key="rev" className="pay-proc" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <p className="pay-heart" aria-hidden>❤️</p>
              <p className="pay-amount">Glumă.</p>
              <p>Dragostea e gratis. N-am salvat nimic, stai liniștit.</p>
              <button className="pay-btn" onClick={onPaid} autoFocus>Pune dragoste în sandviș</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
