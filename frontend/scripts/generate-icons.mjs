#!/usr/bin/env node
/**
 * Generates PWA icon PNGs from an inline SVG.
 * Run: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../public/icons");

// RingLink brand SVG — two interlocked rings (ring + link)
// bg: #1d100d | ring 1: #d83f2e | ring 2: #ffb4a8
const svgBase = (size, padding = 0.08) => {
  const pad = Math.round(size * padding);
  const w = size - pad * 2;
  const cx1 = pad + w * 0.38;
  const cx2 = pad + w * 0.62;
  const cy = size / 2;
  const r = w * 0.28;
  const stroke = Math.max(4, Math.round(size * 0.065));
  const rx = Math.round(size * 0.19);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rx}" fill="#1d100d"/>
  <circle cx="${cx1}" cy="${cy}" r="${r}" fill="none" stroke="#d83f2e" stroke-width="${stroke}"/>
  <circle cx="${cx2}" cy="${cy}" r="${r}" fill="none" stroke="#ffb4a8" stroke-width="${stroke}"/>
</svg>`;
};

// Maskable variant: larger padding so the rings sit well within the safe zone
const svgMaskable = (size) => svgBase(size, 0.18);

const icons = [
  { file: "icon-72.png",   size: 72,  svg: svgBase(72) },
  { file: "icon-96.png",   size: 96,  svg: svgBase(96) },
  { file: "icon-128.png",  size: 128, svg: svgBase(128) },
  { file: "icon-144.png",  size: 144, svg: svgBase(144) },
  { file: "icon-152.png",  size: 152, svg: svgBase(152) },
  { file: "icon-180.png",  size: 180, svg: svgBase(180) },
  { file: "icon-192.png",  size: 192, svg: svgBase(192) },
  { file: "icon-384.png",  size: 384, svg: svgBase(384) },
  { file: "icon-512.png",  size: 512, svg: svgBase(512) },
  { file: "icon-512-maskable.png", size: 512, svg: svgMaskable(512) },
];

for (const { file, size, svg } of icons) {
  const outPath = path.join(OUT, file);
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(outPath);
  console.log(`  ✓ ${file}`);
}

console.log(`\nIcons written to public/icons/`);
