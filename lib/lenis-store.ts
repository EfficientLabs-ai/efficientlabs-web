import type Lenis from "lenis";

// Module-level handle to the active Lenis instance so UI chrome (the mobile
// nav sheet) can pause/resume root smoothing in step with its body-overflow
// lock. Null whenever Lenis is not running (excluded routes, reduced motion).
let instance: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  instance = l;
}

export function getLenis(): Lenis | null {
  return instance;
}
