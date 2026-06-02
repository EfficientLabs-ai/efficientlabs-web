import {
  siModelcontextprotocol, siN8n, siTelegram, siDiscord, siMatrix, siSignal, siWhatsapp,
  siOllama, siOpenrouter, siAnthropic, siMistralai, siDeepseek, siQwen,
  siGithub, siNotion, siStripe, siPostgresql, siSupabase, siGmail, siGoogledrive,
  siLinear, siFigma, siVercel, siCloudflare, siWebassembly,
} from "simple-icons";

type SI = { path: string; hex: string; title: string };

// name → real brand mark (or null = generic node glyph fallback)
const REGISTRY: Record<string, SI | null> = {
  MCP: siModelcontextprotocol,
  n8n: siN8n,
  Telegram: siTelegram,
  Discord: siDiscord,
  Slack: null,            // not in simple-icons (trademark) — fallback glyph
  Matrix: siMatrix,
  Signal: siSignal,
  WhatsApp: siWhatsapp,
  Ollama: siOllama,
  OpenRouter: siOpenrouter,
  Anthropic: siAnthropic,
  OpenAI: null,           // not in simple-icons — fallback glyph
  Mistral: siMistralai,
  DeepSeek: siDeepseek,
  Qwen: siQwen,
  GitHub: siGithub,
  Notion: siNotion,
  Stripe: siStripe,
  Postgres: siPostgresql,
  Supabase: siSupabase,
  Gmail: siGmail,
  "Google Drive": siGoogledrive,
  Linear: siLinear,
  Figma: siFigma,
  Vercel: siVercel,
  Cloudflare: siCloudflare,
  WASI: siWebassembly,
};

// perceived luminance — very dark brand marks (Notion, Vercel, Matrix…) read as
// white-on-dark in the wild, so we render them light rather than invisible.
function displayColor(hex: string): string {
  const n = parseInt(hex, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < 0.24 ? "#e7edf5" : `#${hex}`;
}

export default function BrandIcon({ name }: { name: string }) {
  const icon = REGISTRY[name];
  if (!icon) {
    // generic sovereign-node glyph for marks we can't ship a real logo for
    return (
      <svg viewBox="0 0 24 24" style={{ color: "var(--color-signal)" }} aria-hidden>
        <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="2.4" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" style={{ color: displayColor(icon.hex) }} aria-label={icon.title} role="img">
      <path fill="currentColor" d={icon.path} />
    </svg>
  );
}
