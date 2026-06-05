"use client";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import OsSidebar from "./OsSidebar";

/**
 * OsMobileDrawer — the slide-in nav for < lg. Fixed overlay with a blurred
 * scrim and a spring-animated left panel. Closes on scrim-click, Escape, and
 * any nav click (handled by passing onNavigate=onClose to the sidebar).
 * Scroll-lock while open. Respects prefers-reduced-motion via globals + the
 * short spring (transform is the only animated property).
 */
export default function OsMobileDrawer({
  open,
  email,
  onClose,
}: {
  open: boolean;
  email: string | null;
  onClose: () => void;
}) {
  // Escape to close + scroll-lock while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <motion.div
            className="absolute inset-0 bg-[color:var(--color-void)]/70 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="absolute left-0 top-0 h-full w-[78%] max-w-[280px] border-r border-[color:var(--color-line)] bg-[color:var(--color-void-2)]"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <button
              onClick={onClose}
              aria-label="Close navigation"
              className="absolute right-3 top-4 z-10 grid h-8 w-8 place-items-center rounded-lg text-[color:var(--color-ink-dim)] hover:text-[color:var(--color-ink)]"
            >
              <X size={18} />
            </button>
            <OsSidebar email={email} onNavigate={onClose} />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
