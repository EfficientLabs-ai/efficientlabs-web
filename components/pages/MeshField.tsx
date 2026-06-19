/**
 * THE P2P MESH — a signature diagram for /atmosphere. Six peers ring an empty
 * centre (there is no hub); links breathe and discovery packets travel directly
 * peer-to-peer across the space where a central server would otherwise sit. Pure
 * SVG, server-rendered, CSS-only motion (.mesh-*, transform/opacity); reduced
 * motion shows a calm lit mesh. Illustrative structure only — no live metrics.
 */
const NODES = [
  { x: 64, y: 66, c: "#0a84ff" },
  { x: 210, y: 44, c: "#22d3ee" },
  { x: 356, y: 66, c: "#8b5cf6" },
  { x: 372, y: 196, c: "#0a84ff" },
  { x: 210, y: 224, c: "#22d3ee" },
  { x: 48, y: 196, c: "#8b5cf6" },
];

// ring edges + three cross links — all peer-to-peer, none through the centre.
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 3], [1, 4], [2, 5],
];

const PACKETS = [
  { a: 0, b: 3, d: "0s", dur: "4.2s" },
  { a: 4, b: 1, d: "1.3s", dur: "4.6s" },
  { a: 2, b: 5, d: "2.6s", dur: "4s" },
];

export default function MeshField() {
  return (
    <div className="mx-auto max-w-2xl">
      <svg viewBox="0 0 420 268" className="w-full" role="img" aria-label="A peer-to-peer mesh of six nodes connected directly, with no central hub">
        {/* empty centre — the absence of a hub, stated */}
        <circle cx="210" cy="134" r="30" fill="none" stroke="var(--color-edge)" strokeWidth="1" strokeDasharray="3 4" opacity="0.5" />
        <text x="210" y="131" textAnchor="middle" className="mono" fontSize="8" fill="var(--color-ink-faint)" letterSpacing="1.5">NO</text>
        <text x="210" y="142" textAnchor="middle" className="mono" fontSize="8" fill="var(--color-ink-faint)" letterSpacing="1.5">HUB</text>

        {/* links */}
        {EDGES.map(([a, b], i) => (
          <line
            key={`e${i}`} className="mesh-link"
            x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y}
            stroke="var(--color-signal)" strokeWidth="1"
            style={{ ["--m-d" as string]: `${(i % 4) * 0.4}s` }}
          />
        ))}

        {/* peers */}
        {NODES.map((n, i) => (
          <g key={`n${i}`}>
            <circle cx={n.x} cy={n.y} r="11" fill={n.c} opacity="0.12" />
            <circle
              className="mesh-node" cx={n.x} cy={n.y} r="5.5" fill={n.c}
              style={{ ["--m-d" as string]: `${i * 0.32}s` }}
            />
          </g>
        ))}

        {/* discovery packets — direct peer-to-peer */}
        {PACKETS.map((p, i) => (
          <circle
            key={`p${i}`} className="mesh-pkt" r="3.5" cx="0" cy="0" fill="#eaf3ff"
            style={{
              ["--x1" as string]: `${NODES[p.a].x}px`, ["--y1" as string]: `${NODES[p.a].y}px`,
              ["--x2" as string]: `${NODES[p.b].x}px`, ["--y2" as string]: `${NODES[p.b].y}px`,
              ["--pkt-dur" as string]: p.dur, ["--pkt-d" as string]: p.d,
            }}
          />
        ))}
      </svg>
      <p className="mono mt-4 text-center text-[11px] tracking-[0.16em] text-[color:var(--color-ink-faint)]">
        PEER-TO-PEER · NO CENTRAL SERVER · NO OFF-SWITCH
      </p>
    </div>
  );
}
