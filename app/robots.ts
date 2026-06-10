import type { MetadataRoute } from "next";

// Public marketing surface is indexable; private/early-access + API routes are not.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/ops", "/api/", "/dashboard", "/app", "/login", "/signup"],
    },
    sitemap: "https://efficientlabs.ai/sitemap.xml",
    host: "https://efficientlabs.ai",
  };
}
