#!/usr/bin/env node
// 唯讀稽核：找出 Phase 1 / Phase 2 自動補上、尚未對照原文核對的「試驗程序」欄位。
//
//   node scripts/audit_enrichment.mjs            → 終端機摘要
//   node scripts/audit_enrichment.mjs --json out → 另存逐筆明細（給核對工作單用）
//
// 判斷方式：
//   - 樣板值：同一份標準、同一個樣品層級中，同一個值套用在 ≥ 80% 的測試（該層級至少 3 項）。
//     依層級分開算，才抓得到「電芯一句、電池包一句」這種樣板。
//   - 重複欄位：同一項測試同時有補強欄位與原本萃取的同義欄位
//   - 已核對：值帶有 source_reference（已對照原文、附條款），不算樣板
// 本腳本不修改任何資料。
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { PROCEDURE_FIELDS as FIELDS } from './review/fields.mjs';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data');
const SYSTEM_FILES = new Set(['catalog.json', 'taxonomy.json']);
const TEMPLATE_SHARE = 0.8;
const TEMPLATE_MIN_TESTS = 3;

const jsonOut = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;

const rows = [];
const detail = [];
for (const f of fs.readdirSync(DATA).filter((n) => n.endsWith('.json') && !SYSTEM_FILES.has(n)).sort()) {
  const d = JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
  const tests = d.tests || [];
  const std = { file: f, tests: tests.length, fields: {}, duplicates: 0 };

  for (const [field, synonyms] of Object.entries(FIELDS)) {
    const values = tests.map((t) => t.conditions?.[field]?.value).filter(Boolean);
    const checked = tests.filter((t) => t.conditions?.[field]?.source_reference).length;
    const distinct = new Set(values).size;

    // 依樣品層級（test_objects 組合）分組，找出每組套用率 ≥ 80% 的值
    const byLevel = new Map();
    tests.forEach((t) => {
      const level = (t.test_objects || []).slice().sort().join('+') || '?';
      if (!byLevel.has(level)) byLevel.set(level, []);
      const c = t.conditions?.[field];
      byLevel.get(level).push(c?.source_reference ? null : c?.value);
    });
    const templateValues = new Set();
    for (const vals of byLevel.values()) {
      if (vals.length < TEMPLATE_MIN_TESTS) continue;
      const counts = new Map();
      vals.filter(Boolean).forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
      for (const [v, c] of counts) if (c / vals.length >= TEMPLATE_SHARE) templateValues.add(v);
    }
    const isTemplate = (t) => !t.conditions?.[field]?.source_reference && templateValues.has(t.conditions?.[field]?.value);
    const templatedCount = tests.filter(isTemplate).length;
    const templated = templatedCount > 0;
    std.fields[field] = { present: values.length, distinct, templatedCount, templated, checked };

    tests.forEach((t) => {
      const c = t.conditions || {};
      if (!c[field]) return;
      const dupKeys = synonyms.filter((k) => c[k]);
      if (dupKeys.length) std.duplicates++;
      detail.push({
        file: f,
        id: t.id,
        section: t.section,
        name: t.name_zh,
        field,
        value: c[field].value,
        templated: isTemplate(t),
        checked: Boolean(c[field].source_reference),
        duplicates: dupKeys.map((k) => ({ key: k, value: c[k]?.value })),
      });
    });
  }
  rows.push(std);
}

const pad = (s, n) => String(s).padEnd(n);
console.log(pad('標準', 18) + pad('測試', 6) + pad('樣品數量', 14) + pad('前置處理', 14) + pad('觀察期', 14) + '重複');
for (const r of rows) {
  const cell = (k) => {
    const x = r.fields[k];
    if (!x.present) return '—';
    if (x.checked === x.present) return `${x.present}/${x.distinct}種 已核對`;
    return `${x.present}/${x.distinct}種${x.templated ? ` 樣板${x.templatedCount}` : ''}`;
  };
  console.log(pad(r.file.replace('.json', ''), 18) + pad(r.tests, 6) + pad(cell('sample_quantity'), 14) + pad(cell('pre_conditioning'), 14) + pad(cell('observation_period'), 14) + (r.duplicates || '—'));
}
const templatedStd = rows.filter((r) => Object.values(r.fields).some((x) => x.templated)).length;
const dupTotal = rows.reduce((a, r) => a + r.duplicates, 0);
console.log(`\n共 ${rows.length} 份標準；${templatedStd} 份有樣板值；重複欄位 ${dupTotal} 筆。`);
const templatedTotal = detail.filter((x) => x.templated).length;
console.log(`樣板值共 ${templatedTotal} 筆（佔補強欄位 ${detail.length} 筆的 ${Math.round((templatedTotal / detail.length) * 100)}%）。`);
const checkedTotal = detail.filter((x) => x.checked).length;
console.log(`已核對 ${checkedTotal} 筆（帶 source_reference）。`);
console.log('欄位格式：有此欄位的測試數/不同值數量；「樣板N」＝其中 N 筆是同層級 ≥ 80% 測試共用的同一句；「已核對」＝全部已對照原文。');

if (jsonOut) {
  fs.writeFileSync(jsonOut, JSON.stringify({ summary: rows, detail }, null, 2));
  console.log(`明細已寫入 ${jsonOut}（${detail.length} 筆）`);
}
