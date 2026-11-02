#!/usr/bin/env node
// 全域檢索驗證：範例都要有相關結果、數值查詢要比對到同單位同數值的量。
// 執行：node scripts/check_search.mjs（失敗時 exit 1）
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { buildIndex, search, extractQuantities, normalize, SEARCH_EXAMPLES } from '../frontend/src/utils/search.js';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/catalog.json'), 'utf8'));

// 與前端相同：同一標準取最新版
const byBase = new Map();
for (const d of catalog) {
  const id = d.base_standard_id || d.document_id;
  const cur = byBase.get(id);
  if (!cur || (d.is_latest && !cur.is_latest) || d.publication_date > cur.publication_date) byBase.set(id, d);
}
const standards = [...byBase.values()]
  .filter((d) => d.schema_v2_json)
  .map((doc) => ({
    id: doc.base_standard_id || doc.document_id,
    doc,
    data: JSON.parse(fs.readFileSync(path.join(ROOT, doc.schema_v2_json), 'utf8')),
  }));
const index = buildIndex(standards);
console.log(`索引：${standards.length} 份標準、${index.length} 項測試\n`);

let failed = 0;
const fail = (msg) => { failed++; console.log(`  失敗：${msg}`); };

function show(q) {
  const r = search(index, q);
  console.log(`「${q}」 ${r.total} 筆`);
  for (const x of r.slice(0, 3)) {
    const h = x.hits[0] ? `${x.hits[0].label}：${x.hits[0].text.slice(0, 36)}` : '';
    console.log(`  ${x.item.baseId} ${x.item.section} ${x.item.nameZh.slice(0, 18)}  ${h}`);
  }
  return r;
}

// 1. 每個範例至少 1 筆，且第一筆的名稱或命中參數含有查詢的關鍵詞
for (const ex of SEARCH_EXAMPLES) {
  const r = show(ex.query);
  if (!r.length) { fail('沒有結果'); continue; }
  const top = r[0];
  const hay = normalize([top.item.nameZh, top.item.nameEn, ...top.hits.map((h) => h.text), ...top.accept].join(' '));
  const missing = ex.expect.filter((k) => !hay.includes(normalize(k)));
  if (missing.length) fail(`第一筆沒有出現 ${missing.join('、')}`);
}

// 2. 數值查詢：6V 命中含 6.0 V 的條件
console.log('');
{
  const r = show('6V');
  if (!r.length) fail('6V 沒有結果');
  if (!r.every((x) => x.hits.some((h) => extractQuantities(normalize(h.text)).some((q) => q.v === 6 && q.u === 'v')) || x.accept.length)) {
    fail('6V 有結果的命中條件不含 6 V');
  }
  if (!r.some((x) => x.hits.some((h) => /6\.0\s*V/.test(h.text)))) fail('6V 沒有命中「6.0 V」');
}

// 3. 1m 不命中只含 1 mm 或 10 m 的條件
{
  const r = show('1m');
  if (!r.length) fail('1m 沒有結果');
  for (const x of r) {
    const hit = x.hits.some((h) => extractQuantities(normalize(h.text)).some((q) => q.v === 1 && q.u === 'm')) || x.accept.length;
    if (!hit) fail(`1m 命中了沒有 1 m 的條件：${x.item.baseId} ${x.item.section}`);
  }
}

// 4. 數值與單位等價
console.log('');
for (const [q, re] of [['80mΩ', /80\s*±\s*\d+\s*mΩ|80\s*mΩ/], ['13kN', /13(\.0)?\s*±\s*[\d.]+\s*kN|13(\.0)?\s*kN/], ['7天', /7\s*天/]]) {
  const r = show(q);
  if (!r.length) fail(`${q} 沒有結果`);
  else if (!r.some((x) => x.hits.some((h) => re.test(h.text)))) fail(`${q} 的命中片段沒有出現預期寫法`);
}

// 單位邊界：1 mm 不是 1 m，10 m 不是 1 m
{
  const has = (txt) => extractQuantities(normalize(txt)).some((q) => q.v === 1 && q.u === 'm');
  if (has('1 mm') || has('10 m')) fail('1m 單位邊界錯誤');
  if (!has('1.0 m') || !has('1 m')) fail('1m 應命中 1.0 m、1 m');
}

// 5. 「6.0 V」「跌落 1 m」不可被拆成單字母而塞滿上限
console.log('');
for (const q of ['6.0 V', '跌落 1 m']) {
  const r = show(q);
  if (r.total >= 50) fail(`${q} 結果數 ${r.total} 不應 >= 50`);
  if (!r.length) fail(`${q} 沒有結果`);
}
// 單一字元不當獨立詞
for (const q of ['V', 'm', 'C']) {
  if (search(index, q).length) fail(`單一字元「${q}」不應有結果`);
}
// 空白寫法等價
{
  const a = search(index, '6V').map((x) => x.item.id).join();
  const b = search(index, '6.0 V').map((x) => x.item.id).join();
  if (a !== b) fail('「6V」與「6.0 V」結果應相同');
}
// 沒有的條件不可亂命中
if (search(index, '3C 充電').length) fail('資料中沒有 3C，「3C 充電」不應有結果');

console.log(failed ? `\n${failed} 項失敗` : '\n全部通過');
process.exit(failed ? 1 : 0);
