// Knock the black background out of the brand logos using luminance→alpha, then
// crop to the content bounding box. Light-on-black ⇒ brightness IS the mask:
// preserves the glassy glow + anti-aliased edges (no fuzzy color-key holes).
import sharp from "sharp";

// Pass the source dir as the first arg: `node scripts/knockout-logo.mjs <dir>`.
// Expects logo-full-src.png (mark + wordmark) and logo-mark-src.png (mark only),
// each light-on-black.
const SRC = process.argv[2] || ".";
const items = [
  { in: `${SRC}/logo-full-src.png`, out: "public/brand/logo-full.png", cap: 1400 },
  { in: `${SRC}/logo-mark-src.png`, out: "public/brand/logo-mark.png", cap: 640 },
];

for (const it of items) {
  const { data, info } = await sharp(it.in).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const alpha = Buffer.alloc(W * H);
  const rowC = new Int32Array(H), colC = new Int32Array(W);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
      const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      // hard floor kills the background haze; gentle curve keeps glow + dim letters
      const a = L < 0.06 ? 0 : Math.round(Math.min(1, Math.pow((L - 0.06) / 0.94, 0.7)) * 255);
      alpha[i] = a;
      if (a > 60) { rowC[y]++; colC[x]++; }
    }
  }
  // bbox = rows/cols with a real run of strong pixels (ignores sparse noise)
  const MIN = 6;
  let minX = 0, maxX = W - 1, minY = 0, maxY = H - 1;
  while (minY < H - 1 && rowC[minY] < MIN) minY++;
  while (maxY > 0 && rowC[maxY] < MIN) maxY--;
  while (minX < W - 1 && colC[minX] < MIN) minX++;
  while (maxX > 0 && colC[maxX] < MIN) maxX--;
  // small padding around the content box
  const pad = Math.round(Math.max(W, H) * 0.015);
  minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
  maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(H - 1, maxY + pad);
  const cw = maxX - minX + 1, ch = maxY - minY + 1;
  console.log(`  bbox x[${minX}..${maxX}] y[${minY}..${maxY}] → ${cw}x${ch} (rowC0=${rowC[0]}, colC0=${colC[0]})`);

  // Pass 1: combine RGB + luminance alpha into a real PNG (with header).
  const rgbaPng = await sharp(data, { raw: { width: W, height: H, channels: 3 } })
    .joinChannel(alpha, { raw: { width: W, height: H, channels: 1 } })
    .png()
    .toBuffer();
  // Pass 2: crop + downscale the decoded PNG (extract behaves on a real image).
  let pipe = sharp(rgbaPng).extract({ left: minX, top: minY, width: cw, height: ch });
  if (cw > it.cap) pipe = pipe.resize({ width: it.cap });
  await pipe.png({ compressionLevel: 9 }).toFile(it.out);
  const m = await sharp(it.out).metadata();
  console.log(`wrote ${it.out} — ${m.width}x${m.height}`);
}
