#!/usr/bin/env node
// 依 normalized_id 分組盤查全庫（少なくとも 2 份標準共有的測試項目）之條件鍵、value、detail 前 80 字，
// 以及 canonicalKey() 對應後的鍵與中文標籤，輸出 .review-work/out/field_inventory.json。
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { canonicalKey, getParameterMeta, splitConditionValue } from '../../frontend/src/utils/parameterDictionary.js';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..', '..');
const WORK = process.env.REVIEW_WORK || path.join(ROOT, '.review-work');
const DATA_DIR = path.join(ROOT, 'data');

const catalog = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'catalog.json'), 'utf8'));
const taxonomy = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'taxonomy.json'), 'utf8'));
const taxMap = new Map((taxonomy.test_types || []).map((t) => [t.id, t]));

// 讀取所有啟用的標準 JSON
const docFiles = catalog
  .filter((c) => c.schema_v2_json && c.comparison_ready !== false)
  .map((c) => ({
    document_id: c.document_id,
    base_standard_id: c.base_standard_id || c.document_id,
    is_latest: Boolean(c.is_latest),
    file: path.join(ROOT, c.schema_v2_json),
  }));

const groups = new Map();

for (const doc of docFiles) {
  if (!fs.existsSync(doc.file)) continue;
  const stdName = path.basename(doc.file, '.json');
  const json = JSON.parse(fs.readFileSync(doc.file, 'utf8'));
  for (const test of json.tests || []) {
    const nid = test.normalized_id;
    if (!nid) continue;
    if (!groups.has(nid)) {
      const tax = taxMap.get(nid);
      groups.set(nid, {
        normalized_id: nid,
        name_zh: tax?.name_zh || test.name_zh || nid,
        name_en: tax?.name_en || test.name_en || '',
        standardsSet: new Set(),
        entries: [],
      });
    }
    const g = groups.get(nid);
    g.standardsSet.add(stdName);

    const conditions = [];
    for (const [rawKey, rawVal] of Object.entries(test.conditions || {})) {
      const { value, detail, source_reference } = splitConditionValue(rawVal);
      const cKey = canonicalKey(rawKey);
      const meta = getParameterMeta(cKey);
      conditions.push({
        raw_key: rawKey,
        canonical_key: cKey,
        label_zh: meta.label,
        category: meta.category,
        value,
        detail_preview: detail ? detail.slice(0, 80) : '',
        has_more_detail: Boolean(detail && detail.length > 80),
        source_reference: source_reference || undefined,
      });
    }

    g.entries.push({
      standard: stdName,
      base_standard_id: doc.base_standard_id,
      is_latest: doc.is_latest,
      test_id: test.id,
      section: test.section || '',
      name_zh: test.name_zh || '',
      test_objects: test.test_objects || [],
      conditions,
    });
  }
}

const sharedGroups = [...groups.values()]
  .filter((g) => g.standardsSet.size >= 2)
  .map((g) => {
    const standards = [...g.standardsSet].sort();
    // 彙整此 normalized_id 出現過的所有 canonical_key（區分技術欄位與 procedure 欄位）
    const keySummary = {};
    for (const entry of g.entries) {
      for (const cond of entry.conditions) {
        if (!keySummary[cond.canonical_key]) {
          keySummary[cond.canonical_key] = {
            canonical_key: cond.canonical_key,
            label_zh: cond.label_zh,
            category: cond.category,
            raw_keys: new Set(),
            standards: new Set(),
          };
        }
        keySummary[cond.canonical_key].raw_keys.add(cond.raw_key);
        keySummary[cond.canonical_key].standards.add(entry.standard);
      }
    }
    const keys_overview = Object.values(keySummary).map((k) => ({
      canonical_key: k.canonical_key,
      label_zh: k.label_zh,
      category: k.category,
      raw_keys: [...k.raw_keys].sort(),
      standards_count: k.standards.size,
      standards: [...k.standards].sort(),
    }));

    return {
      normalized_id: g.normalized_id,
      name_zh: g.name_zh,
      name_en: g.name_en,
      standards_count: standards.length,
      standards,
      keys_overview,
      entries: g.entries,
    };
  })
  .sort((a, b) => a.normalized_id.localeCompare(b.normalized_id));

const outDir = path.join(WORK, 'out');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'field_inventory.json');
fs.writeFileSync(
  outFile,
  JSON.stringify(
    {
      generated_at: new Date().toISOString(),
      total_shared_groups: sharedGroups.length,
      groups: sharedGroups,
    },
    null,
    2
  )
);
console.log(`已輸出 ${sharedGroups.length} 組共有測試至 ${outFile}`);
