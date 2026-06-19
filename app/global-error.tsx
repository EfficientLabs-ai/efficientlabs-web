"use client";

/**
 * Last-resort boundary for errors thrown in the ROOT layout itself. It replaces
 * the whole document, so it renders its own <html>/<body> with inline styles
 * (globals.css is not guaranteed here). Matches the brand void; calm + honest.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#05060a",
          color: "#e7e9ee",
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center", padding: 24 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8a8f9c", margin: 0 }}>
            Something broke
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: "12px 0 8px" }}>The page hit an error.</h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#aab0bd", margin: 0 }}>
            Your work and your node are untouched. Try again, or reload.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 24,
              padding: "10px 20px",
              borderRadius: 12,
              border: "1px solid #2a2f3a",
              background: "#1b6ef3",
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Try again
          </button>
          {error?.digest && (
            <p style={{ fontFamily: "monospace", fontSize: 10, color: "#8a8f9c", marginTop: 16 }}>
              ref: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
