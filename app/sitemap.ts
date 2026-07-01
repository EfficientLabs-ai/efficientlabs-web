import type { MetadataRoute } from "next";
import { ARTICLES } from "@/data/docs";

const BASE = "https://efficientlabs.ai";

// Every PUBLIC, indexable route. Mirrors app/robots.ts: the private/early-access
// surface (/ops, /api, /dashboard, /app, /login, /signup) and transactional pages
// (/welcome — noindex) are intentionally excluded. Docs slugs come from
// data/docs.ts (the single source of truth) so the sitemap can't drift.
//
// changeFrequency/priority are advisory hints. The homepage is the anchor (1.0);
// the conversion + status surfaces rank above the legal/static pages.
type Entry = { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number };

const STATIC_ROUTES: Entry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/start", changeFrequency: "weekly", priority: 0.9 },
  { path: "/install", changeFrequency: "weekly", priority: 0.8 },
  { path: "/atmosphere", changeFrequency: "monthly", priority: 0.8 },
  { path: "/architecture", changeFrequency: "monthly", priority: 0.8 },
  { path: "/stratos", changeFrequency: "monthly", priority: 0.8 },
  { path: "/enterprise", changeFrequency: "monthly", priority: 0.7 },
  { path: "/security", changeFrequency: "monthly", priority: 0.7 },
  { path: "/score", changeFrequency: "weekly", priority: 0.7 },
  { path: "/verify", changeFrequency: "monthly", priority: 0.7 },
  { path: "/docs", changeFrequency: "weekly", priority: 0.7 },
  { path: "/status", changeFrequency: "daily", priority: 0.7 },
  { path: "/updates", changeFrequency: "daily", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // No fabricated lastModified: stamping every entry with `new Date()` marks the
  // whole site "just changed" on every generation, which weakens the crawler
  // signal. Only docs with a real checked-in `updated` date carry a timestamp.
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${BASE}${r.path}`,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Every published docs article (data/docs.ts is the source of truth).
  const docEntries: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${BASE}/docs/${a.slug}`,
    ...(a.updated ? { lastModified: new Date(a.updated) } : {}),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...docEntries];
}
