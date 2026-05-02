import { Jimp } from "jimp";

const S = 1024;
const CX = S / 2;
const CY = S / 2;

function hex(h: string): [number, number, number, number] {
  const v = parseInt(h.replace("#", ""), 16);
  return [(v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff, 0xff];
}

const BG = hex("#0b0b10");
const GOLD = hex("#d4a240");
const GOLD_DIM = hex("#a07828");

async function main() {
  const img = new Jimp({ width: S, height: S, color: "#0b0b10" });

  // Helper: fill circle
  function circle(cx: number, cy: number, r: number, [cr, cg, cb, ca]: number[]) {
    const x0 = Math.max(0, ~~(cx - r));
    const y0 = Math.max(0, ~~(cy - r));
    const x1 = Math.min(S, ~~(cx + r + 1));
    const y1 = Math.min(S, ~~(cy + r + 1));
    for (let px = x0; px < x1; px++) {
      for (let py = y0; py < y1; py++) {
        if ((px - cx) ** 2 + (py - cy) ** 2 <= r * r) {
          const o = (py * S + px) * 4;
          img.bitmap.data[o] = cr;
          img.bitmap.data[o + 1] = cg;
          img.bitmap.data[o + 2] = cb;
          img.bitmap.data[o + 3] = ca;
        }
      }
    }
  }

  // Helper: alpha-blend ring
  function ring(cx: number, cy: number, r: number, w: number, [cr, cg, cb, ca]: number[]) {
    const x0 = Math.max(0, ~~(cx - r - w));
    const y0 = Math.max(0, ~~(cy - r - w));
    const x1 = Math.min(S, ~~(cx + r + w + 1));
    const y1 = Math.min(S, ~~(cy + r + w + 1));
    for (let px = x0; px < x1; px++) {
      for (let py = y0; py < y1; py++) {
        const d = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
        if (d >= r - w && d <= r + w) {
          const a = (1 - Math.abs(d - r) / w);
          const o = (py * S + px) * 4;
          img.bitmap.data[o] = Math.round(img.bitmap.data[o] * (1 - a) + cr * a);
          img.bitmap.data[o + 1] = Math.round(img.bitmap.data[o + 1] * (1 - a) + cg * a);
          img.bitmap.data[o + 2] = Math.round(img.bitmap.data[o + 2] * (1 - a) + cb * a);
          img.bitmap.data[o + 3] = 0xff;
        }
      }
    }
  }

  // === Background: subtle radial gradient effect ===
  ring(CX, CY, 350, 250, hex("#14141e"));
  ring(CX, CY, 450, 200, hex("#101018"));

  // === Outer decorative rings ===
  ring(CX, CY, 440, 3, GOLD_DIM);
  ring(CX, CY, 448, 16, GOLD_DIM);
  ring(CX, CY, 448, 4, GOLD);
  ring(CX, CY, 460, 2, GOLD_DIM);

  // === Yin-Yang symbol (large, centered) ===
  const R = 180;

  // Gold base
  circle(CX, CY, R, GOLD);

  // Dark half (Yang): draw S-curve
  for (let px = ~~(CX - R); px <= ~~(CX + R + 1); px++) {
    for (let py = ~~(CY - R); py <= ~~(CY + R + 1); py++) {
      const dx = px - CX;
      const dy = py - CY;
      if (dx * dx + dy * dy > R * R) continue;
      // S-curve dividing line — smooth sine-based wave
      const angle = (py - CY) / R * Math.PI * 0.5;
      const sx = CX + Math.sin(angle) * R * 0.86;
      if (px > sx) {
        const o = (py * S + px) * 4;
        img.bitmap.data[o] = BG[0];
        img.bitmap.data[o + 1] = BG[1];
        img.bitmap.data[o + 2] = BG[2];
        img.bitmap.data[o + 3] = 0xff;
      }
    }
  }

  // Yang dot (gold on dark side, upper)
  circle(CX, CY - R * 0.5, 24, GOLD);

  // Yin dot (dark on gold side, lower)
  circle(CX, CY + R * 0.5, 24, hex("#0b0b10"));

  // Small center dots
  circle(CX, CY - R * 0.5, 10, hex("#0b0b10"));
  circle(CX, CY + R * 0.5, 10, GOLD);

  // === 8 trigrams around the Yin-Yang ===
  const trigrams = [
    [1, 1, 1], [0, 1, 1], [1, 0, 1], [0, 0, 1],
    [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
  ];
  // Corresponding angles (starting from top, going clockwise)
  // 乾☰ top, 兌☱ top-right, 離☲ right, 震☳ bottom-right,
  // 坤☷ bottom, 艮☶ bottom-left, 坎☵ left, 巽☴ top-left

  const tR = 270;
  const barLen = 34;
  const barThick = 7;
  const barGap = 4;

  for (let t = 0; t < 8; t++) {
    const angle = (t / 8) * Math.PI * 2 - Math.PI / 2; // start from top
    const cx = CX + tR * Math.cos(angle);
    const cy = CY + tR * Math.sin(angle);

    // Direction perpendicular to radial = tangent direction
    const tx = -Math.sin(angle); // tangent x
    const ty = Math.cos(angle);  // tangent y

    for (let i = 0; i < 3; i++) {
      // Bar center offset along radial direction (stacked radially)
      const radialOff = (i - 1) * (barThick + barGap);
      const bx = cx + radialOff * Math.cos(angle);
      const by = cy + radialOff * Math.sin(angle);

      const halfLen = barLen / 2;
      if (trigrams[t][i] === 1) {
        // Solid line
        drawBar(bx, by, tx, ty, halfLen, barThick, GOLD, img, S);
      } else {
        // Broken line — two segments
        const segHalf = halfLen * 0.45;
        const gapOff = halfLen * 0.55;
        for (const side of [-1, 1]) {
          const sx = bx + side * gapOff * tx;
          const sy = by + side * gapOff * ty;
          drawBar(sx, sy, tx, ty, segHalf, barThick, GOLD, img, S);
        }
      }
    }
  }

  // Outer border
  ring(CX, CY, 500, 4, GOLD_DIM);

  await img.write("assets/icon.png");
  console.log("Icon generated: assets/icon.png");
}

function drawBar(
  cx: number, cy: number, tx: number, ty: number,
  halfLen: number, thick: number,
  rgba: number[], img: InstanceType<typeof Jimp>, S: number
) {
  // Bar extends from (cx - halfLen*tx, cy - halfLen*ty) to (cx + halfLen*tx, cy + halfLen*ty)
  const len2 = halfLen * halfLen;
  const x0 = Math.max(0, ~~(cx - halfLen * Math.abs(tx) - thick));
  const y0 = Math.max(0, ~~(cy - halfLen * Math.abs(ty) - thick));
  const x1 = Math.min(S, ~~(cx + halfLen * Math.abs(tx) + thick + 1));
  const y1 = Math.min(S, ~~(cy + halfLen * Math.abs(ty) + thick + 1));
  for (let px = x0; px < x1; px++) {
    for (let py = y0; py < y1; py++) {
      const dx = px - cx;
      const dy = py - cy;
      // Project onto bar direction
      const proj = dx * tx + dy * ty;
      if (Math.abs(proj) > halfLen) continue;
      // Distance from bar center line
      const dist = Math.abs(-dx * ty + dy * tx);
      if (dist > thick) continue;
      const a = dist < thick - 1 ? 1 : thick - dist;
      const o = (py * S + px) * 4;
      img.bitmap.data[o] = Math.round(img.bitmap.data[o] * (1 - a) + rgba[0] * a);
      img.bitmap.data[o + 1] = Math.round(img.bitmap.data[o + 1] * (1 - a) + rgba[1] * a);
      img.bitmap.data[o + 2] = Math.round(img.bitmap.data[o + 2] * (1 - a) + rgba[2] * a);
      img.bitmap.data[o + 3] = 0xff;
    }
  }
}

main().catch(console.error);
