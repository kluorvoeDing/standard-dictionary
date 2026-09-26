#!/usr/bin/env node
// 把驗收通過的決定寫入 data/<標準代號>.json。
//
//   node scripts/review/apply.mjs <標準代號> [--dry]
//
// 讀 .review-work/out/<標準代號>.decisions.json，再以 .overrides.json（主代理的修正）取代同一測試＋欄位的決定。
// 寫入前會先跑 verify.py，有任何問題就不寫。
//   replace → conditions[欄位] = { value, detail, source_reference }（source_reference 為條款以「；」串接）
//   keep    → 值不變；有附條款時補上 source_reference，比對頁才會顯示「已對照原文」
//   delete  → 移除欄位
// 寫入後請執行：node scripts/normalize_data.mjs --write --all、npm run validate、node scripts/audit_enrichment.mjs
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { PARAMETER_DICTIONARY, canonicalKey } from '../../frontend/src/utils/parameterDictionary.js';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..', '..');
const WORK = process.env.REVIEW_WORK || path.join(ROOT, '.review-work');
const [std] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const dry = process.argv.includes('--dry');
if (!std) {
  console.error('用法：node scripts/review/apply.mjs <標準代號> [--dry]');
  process.exit(1);
}

try {
  execFileSync('python3', [path.join(ROOT, 'scripts', 'review', 'verify.py'), std], { stdio: 'inherit' });
} catch {
  console.error('verify.py 有問題，沒有寫入。');
  process.exit(1);
}

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const file = path.join(ROOT, 'data', `${std}.json`);
const data = readJson(file);
const work = readJson(path.join(WORK, 'work', `${std}.json`));
const { decisions } = readJson(path.join(WORK, 'out', `${std}.decisions.json`));
const ovPath = path.join(WORK, 'out', `${std}.overrides.json`);
const overrides = fs.existsSync(ovPath) ? readJson(ovPath) : [];

const byKey = new Map(decisions.map((d) => [`${d.id}|${d.field}`, d]));
for (const o of overrides) byKey.set(`${o.id}|${o.field}`, o);

const tests = new Map(data.tests.map((t) => [t.id, t]));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const stats = { changed: 0, added: 0, removed: 0, unchanged: 0 };
const touched = new Set();
const unlabeled = new Set();

for (const d of byKey.values()) {
  const t = tests.get(d.id);
  const c = (t.conditions ||= {});
  const ref = (d.clauses || []).join('；');
  let next;
  if (d.action === 'delete') {
    if (d.field in c) {
      delete c[d.field];
      stats.removed++;
      touched.add(d.id);
    }
    continue;
  }
  if (d.action === 'keep') {
    const prev = c[d.field];
    next = ref && prev && typeof prev === 'object' ? { ...prev, source_reference: ref } : prev;
  } else {
    next = { value: d.value, ...(d.detail ? { detail: d.detail } : {}), ...(ref ? { source_reference: ref } : {}) };
  }
  if (same(c[d.field], next)) {
    stats.unchanged++;
    continue;
  }
  if (!(d.field in c)) {
    stats.added++;
    if (!PARAMETER_DICTIONARY[canonicalKey(d.field)]) unlabeled.add(d.field);
  } else stats.changed++;
  c[d.field] = next;
  touched.add(d.id);
}

if (touched.size) {
  const today = new Date().toISOString().slice(0, 10);
  data.metadata ||= {};
  if (work.mode === 'all-fields') {
    const list = (data.metadata.parameter_review ||= []);
    list.push(`${today}：依原文補齊試驗參數（${[...touched].join('、')}），出處見各欄位 source_reference。`);
  } else if (!String(data.metadata.enrichment || '').includes('已逐項對照原文核對')) {
    const note = `${today} 已逐項對照原文核對試驗程序欄位：有原文依據者改為原文規定並附條款（source_reference），原文未規定者刪除。`;
    data.metadata.enrichment = data.metadata.enrichment ? `${data.metadata.enrichment}；${note}` : note;
  }
}

if (!dry) fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
console.log(`${std}${dry ? '（試跑，未寫入）' : ''}：修改 ${stats.changed}、新增 ${stats.added}、刪除 ${stats.removed}、不變 ${stats.unchanged}；影響 ${touched.size} 項測試`);
if (unlabeled.size) {
  console.log(`新欄位沒有中文標籤：${[...unlabeled].join('、')}。請在 frontend/src/utils/parameterDictionary.js 補標籤，或在 ALIASES 對應到既有欄位。`);
}
if (!dry && touched.size) {
  console.log('接著執行：node scripts/normalize_data.mjs --write --all && npm run validate && node scripts/audit_enrichment.mjs');
}
