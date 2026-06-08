"use client";
import { useEffect, useState } from "react";

/**
 * Type / hold / backspace through a list of phrases.
 * Lead with the highest-value phrase — it shows first and longest on load.
 */
export default function Typewriter({
  words,
  className,
  typeMs = 70,
  deleteMs = 34,
  holdMs = 1700,
}: {
  words: string[];
  className?: string;
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
}) {
  const [i, setI] = useState(0);
  const [sub, setSub] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[i % words.length];
    // finished typing → hold, then start deleting
    if (!deleting && sub === word.length) {
      const t = setTimeout(() => setDeleting(true), holdMs);
      return () => clearTimeout(t);
    }
    // finished deleting → advance to next phrase
    if (deleting && sub === 0) {
      const t = setTimeout(() => {
        setDeleting(false);
        setI((v) => (v + 1) % words.length);
      }, 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setSub((v) => v + (deleting ? -1 : 1)), deleting ? deleteMs : typeMs);
    return () => clearTimeout(t);
  }, [sub, deleting, i, words, typeMs, deleteMs, holdMs]);

  const word = words[i % words.length];
  return (
    <span className={className} aria-live="polite">
      {word.substring(0, sub)}
      <span className="tw-caret" aria-hidden>|</span>
    </span>
  );
}
