#!/usr/bin/env node
// UI 風格檢查（見 AGENTS.md「UI 風格鐵律」），前端與 API 原始碼：
//   1. 不得出現 emoji。需要圖示時用 frontend/src/components/Icon.jsx 的線條圖示。
//      允許少數單色文字符號（✓ ✕ ← → ↑ ↓ ↺ ⓘ ⌘ ✦），它們是排版符號，不是彩色 emoji。
//   2. 不得寫死顏色（#rrggbb、rgb()、rgba()），請用 index.css 的 token，否則深色模式會壞。
//      例外：白色（#fff）與純黑／純白的半透明遮罩和陰影，它們與主題無關。
//      index.css 內 :root 與 [data-theme] 區塊是定義 token 的地方，不檢查。
//   3. 標題不得中英並列（如「運輸安全 (Transport)」）。全大寫縮寫（SOC、ESS）不算。
// 規則 2、3 是新增的，既有違規記在 scripts/ui_style_baseline.json（每檔上限）：
// 只要某檔的違規數超過基準線就會失敗；清掉一些之後，執行 --update-baseline 把基準線降下來。
// 規則 1 沒有基準線，一律零容忍。
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const BASELINE_FILE = path.join(ROOT, 'scripts/ui_style_baseline.json');
const TARGETS = ['frontend/src', 'api'];
const EXTENSIONS = /\.(jsx?|mjs|cjs|tsx?|css|html)$/;
const ALLOWED = new Set([...'✓✕←→↑↓↺ⓘ⌘✦']);
const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}]/gu;
const COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g;
const NEUTRAL_COLOR = /^(#fff(fff)?|rgba?\(\s*(0\s*,\s*0\s*,\s*0|255\s*,\s*255\s*,\s*255)\s*(,[^)]*)?\))$/i;
const FONT_SIZE = /(?:font-size:\s*|fontSize:\s*[^,}]*?)(\d*\.?\d+)(rem|px)/g;
const BILINGUAL =/[一-鿿][^'"`\n]*?[（(][A-Za-z\- ]*[a-z][A-Za-z\- ]*[)）]/g;

const UPDATE = process.argv.includes('--update-baseline');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'node_modules' || e.name === 'dist' ? [] : walk(p);
    return EXTENSIONS.test(e.name) ? [p] : [];
  });
}

const isComment = (line) => /^\s*(\/\/|\/\*|\*)/.test(line);

const emoji = [];
const smallFont = [];
const found = { color: {}, bilingual: {} };
const details = { color: [], bilingual: [] };

function record(rule, rel, i, line, what) {
  found[rule][rel] = (found[rule][rel] || 0) + 1;
  details[rule].push(`${rel}:${i + 1}  ${what}  ${line.trim().slice(0, 70)}`);
}

for (const target of TARGETS) {
  for (const file of walk(path.join(ROOT, target))) {
    const rel = path.relative(ROOT, file);
    const isCss = file.endsWith('.css');
    let inTokens = false;
    fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      const chars = [...line.matchAll(EMOJI)].map((m) => m[0]).filter((c) => !ALLOWED.has(c));
      if (chars.length) emoji.push(`${rel}:${i + 1}  ${chars.join(' ')}  ${line.trim().slice(0, 80)}`);

      if (isCss) {
        if (/^(:root|\[data-theme[^\]]*\])\s*\{/.test(line)) inTokens = true;
        else if (inTokens && /^\}/.test(line)) { inTokens = false; return; }
        if (inTokens) return;
      }
      if (isComment(line)) return;

      for (const m of line.matchAll(FONT_SIZE)) {
        const px = m[2] === 'rem' ? parseFloat(m[1]) * 16 : parseFloat(m[1]);
        if (px < 12) smallFont.push(`${rel}:${i + 1}  ${m[0].trim()}  ${line.trim().slice(0, 70)}`);
      }

      const colors = (line.match(COLOR) || []).filter((c) => !NEUTRAL_COLOR.test(c));
      if (colors.length) record('color', rel, i, line, colors.join(' '));

      const mixed = line.match(BILINGUAL);
      if (mixed) record('bilingual', rel, i, line, mixed[0].trim().slice(0, 30));
    });
  }
}

if (UPDATE) {
  fs.writeFileSync(BASELINE_FILE, JSON.stringify(found, null, 2) + '\n');
  console.log('已更新基準線：scripts/ui_style_baseline.json');
  process.exit(0);
}

const baseline = fs.existsSync(BASELINE_FILE) ? JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8')) : {};
const LABELS = {
  color: '寫死顏色（請改用 index.css 的 token）',
  bilingual: '標題中英並列（請只留中文，或只留縮寫）',
};

let failed = false;
if (emoji.length) {
  failed = true;
  console.error(`✗ 發現 ${emoji.length} 處 emoji（請改用 Icon.jsx 線條圖示或純文字）：`);
  emoji.forEach((h) => console.error('   ' + h));
}

if (smallFont.length) {
  failed = true;
  console.error(`✗ 發現 ${smallFont.length} 處小於 12px 的字級（請用 var(--fs-2xs) 以上的字級 token）：`);
  smallFont.forEach((h) => console.error('   ' + h));
}

for (const rule of ['color', 'bilingual']) {
  const base = baseline[rule] || {};
  const over = Object.entries(found[rule]).filter(([f, n]) => n > (base[f] || 0));
  if (over.length) {
    failed = true;
    console.error(`✗ ${LABELS[rule]}：以下檔案超過基準線`);
    over.forEach(([f, n]) => console.error(`   ${f}  ${n} 處（基準線 ${base[f] || 0}）`));
    const names = new Set(over.map(([f]) => f));
    details[rule].filter((d) => names.has(d.split(':')[0])).forEach((d) => console.error('     ' + d));
  }
}

if (failed) process.exit(1);

const total = (r) => Object.values(found[r]).reduce((a, b) => a + b, 0);
console.log('✓ UI 風格檢查通過：沒有 emoji，且未新增寫死顏色或中英並列標題。');
console.log(`  既有待清理：寫死顏色 ${total('color')} 處、中英並列 ${total('bilingual')} 處（見 ui_style_baseline.json）。`);
