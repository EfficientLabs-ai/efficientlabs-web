"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { getLenis } from "@/lib/lenis-store";

/**
 * Floating "back to top" control. Appears once the visitor has scrolled past
 * ~1.2 viewports and jumps straight to the top — immediate, so they skip the
 * scroll-triggered animations on the way back up (the whole point). Uses Lenis
 * when it's driving the page, else native scroll. Hidden on the OS/ops app
 * surfaces, which have their own chrome and scroll regions.
 */
const HIDDEN = ["/app", "/ops"];

export default function BackToTop() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 1.2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (HIDDEN.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  const toTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      className={`glass group fixed bottom-6 right-6 z-50 grid h-12 w-12 place-items-center rounded-full transition-all duration-300 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp size={18} className="text-[color:var(--color-ink)] transition-transform duration-200 group-hover:-translate-y-0.5" />
    </button>
  );
}
