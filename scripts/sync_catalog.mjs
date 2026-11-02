#!/usr/bin/env node
// 讓 data/catalog.json 與各標準資料檔保持一致。
//
//   node scripts/sync_catalog.mjs          寫入：測試數、可用樣品層級改為由資料檔計算
//   node scripts/sync_catalog.mjs --check  只檢查，不一致就 exit 1（CI 用）
//
// 由資料計算的欄位：test_count_v2、item_count（= tests 數）、available_objects（= 各測試 test_objects 的聯集）。
// 只檢查、不自動改的欄位：
//   publication_date  必須是 YYYY、YYYY-MM 或 YYYY-MM-DD（比對頁用它排序版本、顯示年份）；版次沿革寫在 edition_history。
//   schema_v2_json    指向的檔案必須存在。
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const CATALOG = path.join(ROOT, 'data', 'catalog.json');
const check = process.argv.includes('--check');
const OBJECT_ORDER = ['CELL', 'MODULE', 'PACK_SYSTEM'];

const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
const problems = [];
const changes = [];

for (const entry of catalog) {
  const id = entry.document_id;
  if (!/^\d{4}(-\d{2}(-\d{2})?)?$/.test(String(entry.publication_date || ''))) {
    problems.push(`${id}：publication_date「${entry.publication_date}」不是 YYYY、YYYY-MM 或 YYYY-MM-DD（沿革請寫在 edition_history）`);
  }
  if (!entry.schema_v2_json) {
    problems.push(`${id}：缺 schema_v2_json`);
    continue;
  }
  const file = path.join(ROOT, entry.schema_v2_json);
  if (!fs.existsSync(file)) {
    problems.push(`${id}：schema_v2_json 指向不存在的檔案 ${entry.schema_v2_json}`);
    continue;
  }
  const tests = JSON.parse(fs.readFileSync(file, 'utf8')).tests || [];
  const rank = (o) => (OBJECT_ORDER.includes(o) ? OBJECT_ORDER.indexOf(o) : 99);
  const objects = [...new Set(tests.flatMap((t) => t.test_objects || []))].sort((a, b) => rank(a) - rank(b));
  const want = { test_count_v2: tests.length, item_count: tests.length, available_objects: objects };
  for (const [k, v] of Object.entries(want)) {
    if (JSON.stringify(entry[k]) !== JSON.stringify(v)) {
      changes.push(`${id}：${k} ${JSON.stringify(entry[k])} → ${JSON.stringify(v)}`);
      entry[k] = v;
    }
  }
}

const ids = catalog.map((e) => e.document_id);
for (const f of fs.readdirSync(path.join(ROOT, 'data'))) {
  if (!f.endsWith('.json') || ['catalog.json', 'taxonomy.json', 'field_schema.json'].includes(f)) continue;
  if (!catalog.some((e) => e.schema_v2_json === `data/${f}`)) problems.push(`data/${f} 沒有登記在 catalog.json`);
}
const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dup.length) problems.push(`document_id 重複：${dup.join('、')}`);

for (const c of changes) console.log(c);
for (const p of problems) console.error(`錯誤：${p}`);

if (check) {
  if (changes.length || problems.length) {
    console.error(`catalog.json 與資料不一致（${changes.length} 處需同步、${problems.length} 個錯誤）。請執行 node scripts/sync_catalog.mjs。`);
    process.exit(1);
  }
  console.log('catalog.json 與資料一致。');
} else {
  if (changes.length) fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2) + '\n');
  console.log(`已同步 ${changes.length} 處。`);
  if (problems.length) process.exit(1);
}
