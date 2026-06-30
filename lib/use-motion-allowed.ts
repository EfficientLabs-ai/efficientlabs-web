"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function getMotionAllowedSnapshot() {
  if (typeof window === "undefined") return false;
  return !window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function subscribeToMotionPreference(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

export function useMotionAllowed() {
  return useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionAllowedSnapshot,
    () => false,
  );
}
