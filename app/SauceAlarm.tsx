"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function SauceAlarm({ sauce, onClose }: { sauce: string; onClose: () => void }) {
  const calm = useReducedMotion();

  return (
    <motion.div
      className="alarm"
      role="alertdialog"
      aria-modal
      aria-labelledby="alarm-t"
      initial={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      animate={
        calm
          ? { opacity: 1, backgroundColor: "#e00000" }
          : { opacity: 1, backgroundColor: ["#ff0000", "#ffea00", "#ff0000", "#ff00aa", "#ff0000"] }
      }
      transition={calm ? { duration: 0.2 } : { backgroundColor: { duration: 0.5, repeat: Infinity }, opacity: { duration: 0.1 } }}
    >
      <motion.h2
        id="alarm-t"
        animate={calm ? {} : { x: [-14, 14, -10, 10, 0], rotate: [-4, 4, -2, 2, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 0.35, repeat: Infinity, repeatDelay: 0.15 }}
      >
        NU SE PUNE MAIONEZĂ SAU KETCHUP IN SANDWICHURI
      </motion.h2>
      <p>Ai încercat să pui {sauce}. Incidentul a fost raportat.</p>
      <button onClick={onClose} autoFocus>Bine, fără sos</button>
    </motion.div>
  );
}
