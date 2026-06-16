// Structured data (JSON-LD) for search + answer engines.
//
// Why this exists: search engines and LLM answer engines (Google AI Overviews,
// ChatGPT, Claude, Perplexity, Gemini) extract facts far more reliably from
// explicit schema.org markup than from prose. This is the machine-readable
// twin of /llms.txt — same facts, claim-disciplined, no metrics that aren't
// measured on the site. Rendered once in the root layout so it applies
// site-wide. Keep copy in sync with app/layout.tsx and public/llms.txt.

const BASE = "https://efficientlabs.ai";

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE}/#organization`,
  name: "Efficient Labs",
  url: BASE,
  logo: `${BASE}/brand/logo-full.png`,
  description:
    "Sovereign AI infrastructure. StratosAgent runs on your own hardware; The Atmosphere meshes those nodes peer-to-peer — content-addressed, capability-secured, post-quantum.",
  slogan: "Your Intelligence. Your Infrastructure. Your Rules.",
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE}/#website`,
  url: BASE,
  name: "Efficient Labs",
  publisher: { "@id": `${BASE}/#organization` },
};

const software = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "StratosAgent",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Linux, macOS, Windows",
  url: `${BASE}/stratos`,
  publisher: { "@id": `${BASE}/#organization` },
  description:
    "The agent runtime that runs on your own hardware — local-first and owner-governed, meshed peer-to-peer through The Atmosphere.",
};

const faq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Efficient Labs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Efficient Labs builds sovereign AI infrastructure. StratosAgent runs on your own hardware and The Atmosphere meshes those nodes peer-to-peer across the world — content-addressed, capability-secured, and post-quantum — so you can build, run, remember, and scale AI without surrendering ownership.",
      },
    },
    {
      "@type": "Question",
      name: "What is StratosAgent?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "StratosAgent is a local-first AI agent runtime that runs on hardware you control. It is owner-governed, keeps its state and memory across sessions, and connects to other nodes through The Atmosphere rather than a central cloud.",
      },
    },
    {
      "@type": "Question",
      name: "What is The Atmosphere?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Atmosphere is a sovereign mesh that links AI nodes peer-to-peer. It is content-addressed, capability-secured, and post-quantum, so no central server is required to run, route, or remember — described as the sovereign internet for AI agents.",
      },
    },
    {
      "@type": "Question",
      name: "How is this different from cloud AI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your intelligence runs on infrastructure you own instead of a provider's cloud. There is no landlord and no per-use meter; your data and state stay on your hardware. Efficient Labs runs its own company on this system and publishes the operating layer's telemetry — operational proof before public proof.",
      },
    },
  ],
};

export default function StructuredData() {
  const blocks = [organization, website, software, faq];
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Static, hardcoded JSON only (no user input). Escape "<" so a stray
          // "</script>" in any string can never break out of the tag — the
          // recommended hardening for embedding JSON-LD in a script element.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}
