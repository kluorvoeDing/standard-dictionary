#!/usr/bin/env node
/**
 * 資料完整性驗證器 (Data Integrity Validator)
 * ------------------------------------------------------------------
 * 驗證 data/ 下的 catalog.json 與各標準 JSON 的結構正確性。
 * 設計目標：抓出「會讓網站出錯或資料失真」的真 bug，同時把
 * 「品質瑕疵」列為警告而不阻斷建置。
 *
 * 用法：
 *   node scripts/validate_data.mjs          # 有硬錯誤才 exit 1
 *   node scripts/validate_data.mjs --strict # 連警告也視為失敗
 *
 * 由 GitHub Actions（.github/workflows/data-integrity.yml）在每次
 * push / PR 時自動執行。
 */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data');
const STRICT = process.argv.includes('--strict');

const SYSTEM_FILES = new Set(['catalog.json', 'taxonomy.json']);
const PLACEHOLDER_RE = /(待確認|待補|TODO|TBD|FIXME|未知|N\/A|\bnull\b|\?\?\?)/i;

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

function loadJSON(p) {
  try {
    return { data: JSON.parse(fs.readFileSync(p, 'utf8')) };
  } catch (e) {
    return { error: e.message };
  }
}

// ── 載入 taxonomy 作為合法 token 的權威來源 ──────────────────────
let okCategories = new Set();
let okObjects = new Set();
{
  const { data: tax, error } = loadJSON(path.join(DATA, 'taxonomy.json'));
  if (error) {
    err('taxonomy.json', `無法解析：${error}`);
  } else {
    okCategories = new Set(Object.keys(tax.categories || {}));
    okObjects = new Set((tax.test_objects || []).map((o) => o.id).filter(Boolean));
  }
}

// ── 載入 catalog ────────────────────────────────────────────────
const catalogPath = path.join(DATA, 'catalog.json');
const { data: catalog, error: catErr } = loadJSON(catalogPath);
if (catErr) {
  err('catalog.json', `無法解析：${catErr}`);
  report();
}
if (!Array.isArray(catalog)) {
  err('catalog.json', '最上層必須是陣列');
  report();
}

const registeredFiles = new Set();
const seenDocIds = new Set();

catalog.forEach((entry, i) => {
  const tag = `catalog[${i}]`;
  const id = entry.document_id;
  // 硬錯誤
  if (!id || typeof id !== 'string') err(tag, '缺少 document_id');
  else if (seenDocIds.has(id)) err('catalog.json', `document_id 重複：${id}`);
  else seenDocIds.add(id);

  const ref = entry.schema_v2_json;
  if (!ref || typeof ref !== 'string') {
    err(tag, `${id || '?'} 缺少 schema_v2_json`);
  } else {
    const abs = path.join(ROOT, ref);
    if (!fs.existsSync(abs)) err('catalog.json', `${id} 指向不存在的檔案：${ref}`);
    else registeredFiles.add(path.basename(ref));
  }

  if (!entry.display_name) err(tag, `${id || '?'} 缺少 display_name`);

  // 警告級
  for (const f of ['full_name', 'available_objects', 'is_latest', 'latest_version', 'versions_behind', 'document_type']) {
    if (entry[f] === undefined) warn(tag, `${id} 建議補上欄位 ${f}`);
  }
  for (const o of entry.available_objects || []) {
    if (!okObjects.has(o)) warn(tag, `${id} 的 available_objects 含未登記 token「${o}」（taxonomy 未定義）`);
  }
});

// ── 掃描磁碟上所有標準檔 ────────────────────────────────────────
const onDisk = fs
  .readdirSync(DATA)
  .filter((f) => f.endsWith('.json') && !SYSTEM_FILES.has(f));

// 孤兒檔：在磁碟上但 catalog 沒註冊
for (const f of onDisk) {
  if (!registeredFiles.has(f)) err('catalog.json', `孤兒檔：data/${f} 存在但未在 catalog 註冊（前端看不到）`);
}

// ── 逐一驗證標準檔內容 ──────────────────────────────────────────
for (const f of onDisk) {
  const { data: d, error } = loadJSON(path.join(DATA, f));
  if (error) { err(f, `無法解析：${error}`); continue; }

  if (!d.document || typeof d.document !== 'object') err(f, '缺少 document 區塊');
  else if (!d.document.id) warn(f, 'document 缺少 id');

  if (!Array.isArray(d.tests) || d.tests.length === 0) {
    err(f, 'tests 必須是非空陣列');
    continue;
  }

  if (!d.metadata) warn(f, '缺少 metadata 區塊');
  if (!d.test_sequence) warn(f, '缺少 test_sequence 區塊');

  const seenTestIds = new Set();
  d.tests.forEach((t, ti) => {
    const tag = `${f} · tests[${ti}]`;
    // 硬錯誤
    if (!t.id) err(tag, '測試缺少 id');
    else if (seenTestIds.has(t.id)) err(f, `測試 id 重複：${t.id}`);
    else seenTestIds.add(t.id);
    if (!t.name_zh && !t.name_en) err(tag, `${t.id || '?'} 缺少名稱 (name_zh/name_en)`);

    // 警告級
    if (t.category && okCategories.size && !okCategories.has(t.category))
      warn(tag, `${t.id} 的 category「${t.category}」未在 taxonomy 登記`);
    if (!Array.isArray(t.test_objects) || t.test_objects.length === 0)
      warn(tag, `${t.id} 的 test_objects 為空`);
    else
      for (const o of t.test_objects)
        if (!okObjects.has(o)) warn(tag, `${t.id} 的 test_objects 含未登記 token「${o}」`);

    if (t.conditions === undefined) warn(tag, `${t.id} 缺少 conditions`);
    if (t.acceptance_criteria === undefined) warn(tag, `${t.id} 缺少 acceptance_criteria`);

    // 偷懶佔位值掃描（只看條件與判定，降低誤報）
    const probe = JSON.stringify({ c: t.conditions, a: t.acceptance_criteria });
    const hit = probe.match(PLACEHOLDER_RE);
    if (hit) warn(tag, `${t.id} 疑似偷懶/佔位值：「${hit[0]}」`);
  });
}

report();

function report() {
  const line = '─'.repeat(60);
  console.log(line);
  if (warnings.length) {
    console.log(`🟡 警告 (${warnings.length})：`);
    warnings.forEach((w) => console.log('   • ' + w));
    console.log(line);
  }
  if (errors.length) {
    console.log(`🔴 硬錯誤 (${errors.length})：`);
    errors.forEach((e) => console.log('   • ' + e));
  } else {
    console.log('✅ 無硬錯誤：資料結構完整。');
  }
  console.log(line);
  console.log(`結果：${errors.length} 個錯誤、${warnings.length} 個警告。`);

  const fail = errors.length > 0 || (STRICT && warnings.length > 0);
  process.exit(fail ? 1 : 0);
}
