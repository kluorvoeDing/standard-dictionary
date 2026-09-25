#!/usr/bin/env node
// UI 風格檢查：前端與 API 的原始碼不得出現 emoji（見 AGENTS.md「UI 風格鐵律」）。
// 需要圖示時請用 frontend/src/components/Icon.jsx 的線條圖示。
// 允許少數單色文字符號（✓ ✕ ← → ↑ ↓ ↺ ⓘ ⌘ ✦），它們是排版符號，不是彩色 emoji。
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const TARGETS = ['frontend/src', 'api'];
const EXTENSIONS = /\.(jsx?|mjs|cjs|tsx?|css|html)$/;
const ALLOWED = new Set([...'✓✕←→↑↓↺ⓘ⌘✦']);
const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}]/gu;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'node_modules' || e.name === 'dist' ? [] : walk(p);
    return EXTENSIONS.test(e.name) ? [p] : [];
  });
}

const hits = [];
for (const target of TARGETS) {
  for (const file of walk(path.join(ROOT, target))) {
    fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      const found = [...line.matchAll(EMOJI)].map((m) => m[0]).filter((c) => !ALLOWED.has(c));
      if (found.length) hits.push(`${path.relative(ROOT, file)}:${i + 1}  ${found.join(' ')}  ${line.trim().slice(0, 80)}`);
    });
  }
}

if (hits.length) {
  console.error(`✗ 發現 ${hits.length} 處 emoji（請改用 Icon.jsx 線條圖示或純文字）：`);
  hits.forEach((h) => console.error('   ' + h));
  process.exit(1);
}
console.log('✓ UI 風格檢查通過：frontend/src 與 api/ 沒有 emoji。');
