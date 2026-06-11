// Server-safe palette for the proof tiles — NO "use client" here, so server
// components (VerdictBar, ProofStrip, RuntimeIntelligence) can dereference
// these objects directly without crossing the RSC client-reference boundary.
export const VERDICT: Record<string, string> = {
  GREEN: "#3fd68f",
  YELLOW: "#e8b34b",
  RED: "#ff6e6e",
};
export const CHECK_DOT: Record<string, string> = {
  ok: "#3fd68f",
  warn: "#e8b34b",
  fail: "#ff6e6e",
};
