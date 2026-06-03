import type { MetadataRoute } from "next";

const BASE = "https://efficientlabs.ai";

// Only the public marketing surface. Private/early-access routes
// (/ops, /dashboard, /login, /signup) are intentionally excluded.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${BASE}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/pricing`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/updates`, lastModified, changeFrequency: "daily", priority: 0.6 },
  ];
}
