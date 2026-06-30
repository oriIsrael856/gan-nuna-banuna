// Optimizes Parent Home illustration PNGs in place: resizes oversized exports
// (1024–1536px rendered at <130px) down to retina display size and recompresses.
// Run from app/:  node scripts/optimize-parent-home-assets.mjs
// Requires sharp (npm install --no-save sharp).
//
// Same filenames are kept, so no code/registry changes are needed.

import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const A = "assets/parent/home";

// max = longest-edge cap (display size × ~3 for retina). palette = quantize (great
// for flat illustrations); hero stays full-colour to avoid gradient banding.
const groups = [
  { dir: `${A}/summary`, max: 270, palette: true },
  { dir: `${A}/quick-actions`, max: 260, palette: true },
  { dir: `${A}/banner`, max: 380, palette: true },
  { dir: `${A}/hero`, max: 1080, palette: false },
];

const kb = (n) => Math.round(n / 1024);

let totalBefore = 0;
let totalAfter = 0;

for (const group of groups) {
  const dirPath = join(root, group.dir);
  const files = (await readdir(dirPath)).filter((f) => f.toLowerCase().endsWith(".png"));
  for (const file of files) {
    const filePath = join(dirPath, file);
    const before = (await stat(filePath)).size;
    const input = await readFile(filePath);

    const pipeline = sharp(input)
      .resize({ width: group.max, height: group.max, fit: "inside", withoutEnlargement: true })
      .png(
        group.palette
          ? { palette: true, quality: 90, effort: 10, compressionLevel: 9 }
          : { compressionLevel: 9, effort: 10 },
      );

    const output = await pipeline.toBuffer();
    await writeFile(filePath, output);

    totalBefore += before;
    totalAfter += output.length;
    console.log(`  ${file}: ${kb(before)} KB → ${kb(output.length)} KB`);
  }
}

console.log(
  `\nTOTAL: ${kb(totalBefore)} KB → ${kb(totalAfter)} KB ` +
    `(${Math.round((1 - totalAfter / totalBefore) * 100)}% smaller)`,
);
