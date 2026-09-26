#!/usr/bin/env node
// 產生一份標準的核對工作單，給子代理使用。
//
//   node scripts/review/make_worklist.mjs <標準代號>
//       試驗程序欄位（sample_quantity／pre_conditioning／observation_period 與同義重複欄位）
//   node scripts/review/make_worklist.mjs <標準代號> --tests <id,id,...> --all-fields
//       指定測試的全部條件（用於補齊「只寫參照、沒有參數」的測試；允許新增欄位）
//
// 輸出 .review-work/work/<標準代號>.json。標準代號就是 data/ 下的檔名（不含 .json）。
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { PROCEDURE_FIELDS } from './fields.mjs';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..', '..');
const WORK = process.env.REVIEW_WORK || path.join(ROOT, '.review-work');

const args = process.argv.slice(2);
const std = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--tests');
if (!std) {
  console.error('用法：node scripts/review/make_worklist.mjs <標準代號> [--tests id,id --all-fields]');
  process.exit(1);
}
const allFields = args.includes('--all-fields');
const only = args.includes('--tests') ? new Set(args[args.indexOf('--tests') + 1].split(',')) : null;

const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', `${std}.json`), 'utf8'));
const synonyms = Object.values(PROCEDURE_FIELDS).flat();
const valueOf = (v) => (v && typeof v === 'object' ? v.value : v);

const tests = data.tests
  .filter((t) => !only || only.has(t.id))
  .map((t) => {
    const c = t.conditions || {};
    const current = {};
    const duplicates = {};
    const other = {};
    for (const [k, v] of Object.entries(c)) {
      if (allFields || k in PROCEDURE_FIELDS) current[k] = v;
      else if (synonyms.includes(k)) duplicates[k] = v;
      else other[k] = valueOf(v);
    }
    return {
      id: t.id,
      section: t.section,
      name_zh: t.name_zh,
      name_en: t.name_en,
      test_objects: t.test_objects,
      source_reference: t.source_reference,
      current,
      duplicate_fields: duplicates,
      other_conditions: other,
      acceptance_criteria: allFields ? t.acceptance_criteria : undefined,
    };
  });

if (only) {
  const missing = [...only].filter((id) => !tests.some((t) => t.id === id));
  if (missing.length) {
    console.error(`找不到測試：${missing.join(', ')}`);
    process.exit(1);
  }
}

const out = {
  standard: std,
  mode: allFields ? 'all-fields' : 'procedure',
  // 工作 A 只能改三個欄位；工作 B（all-fields）可以新增具體參數欄位
  fields: allFields ? null : Object.keys(PROCEDURE_FIELDS),
  allow_new_fields: allFields,
  source_file: `.review-work/src/${std}.txt`,
  document: data.document,
  test_sequence: data.test_sequence,
  tests,
};
fs.mkdirSync(path.join(WORK, 'work'), { recursive: true });
const file = path.join(WORK, 'work', `${std}.json`);
fs.writeFileSync(file, JSON.stringify(out, null, 1));
console.log(`${std}: ${tests.length} 項測試（${out.mode}）→ ${file}`);
