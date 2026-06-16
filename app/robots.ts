import type { MetadataRoute } from "next";

// Public marketing surface is indexable; private/early-access + API routes are not.
//
// AEO posture: we explicitly WELCOME AI answer-engine crawlers (GPTBot,
// ClaudeBot, PerplexityBot, Google-Extended, etc.) so Efficient Labs can be
// cited by ChatGPT, Claude, Perplexity and Gemini. They get the same allow/
// disallow surface as everyone else — listed by name to make the intent
// explicit and durable.
const PRIVATE = ["/ops", "/api/", "/dashboard", "/app", "/login", "/signup"];
const AI_CRAWLERS = [
  "GPTBot",          // OpenAI training/index
  "OAI-SearchBot",   // ChatGPT search
  "ChatGPT-User",    // ChatGPT browsing on a user's behalf
  "ClaudeBot",       // Anthropic crawler
  "Claude-Web",      // Anthropic browsing
  "anthropic-ai",
  "PerplexityBot",   // Perplexity
  "Perplexity-User",
  "Google-Extended", // Google Gemini / AI Overviews
  "Applebot-Extended",
  "Bytespider",
  "CCBot",           // Common Crawl (feeds many models)
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: PRIVATE })),
    ],
    sitemap: "https://efficientlabs.ai/sitemap.xml",
    host: "https://efficientlabs.ai",
  };
}
