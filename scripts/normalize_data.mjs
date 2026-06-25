#!/usr/bin/env node
/**
 * 資料格式正規化器 (Data Format Normalizer)
 * ------------------------------------------------------------------
 * 不同 batch / 不同 AI agent 產出的標準 JSON，在「單位、記法、結構」上
 * 各寫各的（h vs 小時、℃ vs °C、details 裡混入物件、孤兒判定鍵…）。
 * 本工具把這些**純格式**差異收斂成單一標準，且：
 *   - 冪等 (idempotent)：跑第二次不會再改任何東西。
 *   - 語意安全：只動單位 token 與結構外殼，**絕不改數值**。所有單位
 *     比對都以「數字緊鄰」為錨點，避開 mAh / mm·s⁻¹ / ms 等假陽性。
 *
 * 設計給「破曉大隊」維護 cron 在生成資料後當收尾步驟呼叫，
 * 讓未來產出自動保持一致。
 *
 * 用法：
 *   node scripts/normalize_data.mjs            # 乾跑，列出所有將變更（不寫檔）
 *   node scripts/normalize_data.mjs --write    # 實際寫回
 *   node scripts/normalize_data.mjs --all      # 連 git-dirty 檔也處理（預設略過，避免動到 cron 進行中的工作）
 */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data');
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check'); // CI 模式：有待正規化內容就 exit 1
const INCLUDE_DIRTY = process.argv.includes('--all') || CHECK;
const SYSTEM_FILES = new Set(['catalog.json', 'taxonomy.json']);

// ── 找出 git-dirty 的 data 檔，預設略過（不碰 cron 進行中的工作）────
let dirty = new Set();
try {
  const out = execSync('git status --porcelain -- data', { cwd: ROOT, encoding: 'utf8' });
  for (const line of out.split('\n')) {
    const m = line.slice(3).trim();
    if (m.startsWith('data/')) dirty.add(path.basename(m));
  }
} catch { /* git 不可用就不略過 */ }

// ── 單位 / 記法正規化 ──────────────────────────────────────────────
// 標準形：時間用繁中（小時 / 分鐘 / 秒）、溫度用 °C。
// 所有規則皆以「數字緊鄰」為錨，且對 SI 單位加負向前看 (?![A-Za-z])，
// 故 mAh、Wh、kWh、mm/s、ms、Hz、stages… 都不會被誤觸（單位後緊跟字母即跳過）。
// 數值本身永遠原封不動。
const NUM = '(\\d+(?:\\.\\d+)?)';
const UNIT_RULES = [
  // SI 時間符號 → 繁中（單位後若接字母代表是別的單位/單字，跳過）
  [new RegExp(`${NUM}\\s*h(?![A-Za-z])`, 'g'), '$1 小時'],   // 6h / 3 h → 6 小時
  [new RegExp(`${NUM}\\s*min(?![A-Za-z])`, 'g'), '$1 分鐘'], // 30min → 30 分鐘
  [new RegExp(`${NUM}\\s*s(?![A-Za-z])`, 'g'), '$1 秒'],     // 10s → 10 秒（ms/mm/s 因前字非數字而豁免）
  // 既有繁中：只正規化間距
  [new RegExp(`${NUM}\\s*小時`, 'g'), '$1 小時'],            // 1小時 → 1 小時
  [new RegExp(`${NUM}\\s*分鐘`, 'g'), '$1 分鐘'],
  [new RegExp(`${NUM}\\s*秒鐘`, 'g'), '$1 秒'],              // 秒鐘 → 秒
  [new RegExp(`${NUM}\\s*秒(?!鐘)`, 'g'), '$1 秒'],
  // 溫度：全形 ℃ → 標準 °C，並正規化間距
  [/℃/g, '°C'],
  [new RegExp(`${NUM}\\s*°C`, 'g'), '$1 °C'],                // 57°C → 57 °C
];

function normStr(s) {
  if (typeof s !== 'string') return s;
  let out = s;
  for (const [re, rep] of UNIT_RULES) out = out.replace(re, rep);
  // 收掉因替換產生的雙空格
  out = out.replace(/ {2,}/g, ' ');
  return out;
}

// 把 {id, rule_zh, rule_en} 之類的物件壓成可讀字串（優先繁中）
function objToText(o) {
  if (o == null) return '';
  if (typeof o === 'string' || typeof o === 'number') return String(o);
  if (Array.isArray(o)) return o.map(objToText).filter(Boolean).join('；');
  return o.rule_zh || o.rule_en || o.value || o.detail || o.text || JSON.stringify(o);
}

const AC_CORE = new Set(['summary', 'details']);

function normalizeTest(t) {
  // 1) conditions: value / detail 內的單位
  if (t.conditions && typeof t.conditions === 'object') {
    for (const v of Object.values(t.conditions)) {
      if (v && typeof v === 'object') {
        if ('value' in v) v.value = normStr(v.value);
        if ('detail' in v) v.detail = normStr(v.detail);
      }
    }
  }

  // 2) acceptance_criteria
  const ac = t.acceptance_criteria;
  if (ac && typeof ac === 'object') {
    if ('summary' in ac) ac.summary = normStr(ac.summary);

    // 2a) details: 攤平物件 + 單位正規化
    if (Array.isArray(ac.details)) {
      ac.details = ac.details.map((d) =>
        d && typeof d === 'object' ? normStr(objToText(d)) : normStr(d)
      );
    } else if (!ac.details) {
      ac.details = [];
    }

    // 2b) 孤兒鍵（no_venting / no_combustible_gas / functional…）→ 折進 details 後移除
    //     這些鍵 UI 從不渲染，等於遺失資訊；把其 detail 收進 details 保留可見性。
    for (const k of Object.keys(ac)) {
      if (AC_CORE.has(k)) continue;
      const v = ac[k];
      let text = '';
      if (v && typeof v === 'object') text = normStr(v.detail || objToText(v));
      else if (typeof v === 'string') text = normStr(v);
      if (text && !ac.details.includes(text)) ac.details.push(text);
      delete ac[k];
    }
  }

  // 3) exemptions: 單位 + 物件攤平
  if (Array.isArray(t.exemptions)) {
    t.exemptions = t.exemptions.map((e) =>
      e && typeof e === 'object' ? normStr(objToText(e)) : normStr(e)
    );
  }

  return t;
}

// ── 主流程 ────────────────────────────────────────────────────────
const files = fs
  .readdirSync(DATA)
  .filter((f) => f.endsWith('.json') && !SYSTEM_FILES.has(f) && !f.includes('.backup'));

let changedFiles = 0;
let changedFields = 0;
const skipped = [];
const diffs = [];

for (const f of files) {
  if (dirty.has(f) && !INCLUDE_DIRTY) { skipped.push(f); continue; }
  const p = path.join(DATA, f);
  const before = fs.readFileSync(p, 'utf8');
  let json;
  try { json = JSON.parse(before); } catch (e) { console.error(`✗ ${f} 解析失敗：${e.message}`); continue; }

  const tests = json.tests || json.test_items || [];
  const flat = (s) => JSON.stringify(s);
  const snapBefore = tests.map(flat);
  tests.forEach(normalizeTest);
  const snapAfter = tests.map(flat);

  let fileChanges = 0;
  for (let i = 0; i < snapBefore.length; i++) {
    if (snapBefore[i] !== snapAfter[i]) {
      fileChanges++;
      changedFields++;
      if (diffs.length < 40) {
        const b = JSON.parse(snapBefore[i]);
        const a = JSON.parse(snapAfter[i]);
        diffs.push({ f, id: a.id || a.normalized_id, before: b, after: a });
      }
    }
  }

  if (fileChanges > 0) {
    changedFiles++;
    // 用 2-space、保留非 ASCII 原樣
    const out = JSON.stringify(json, null, 2) + '\n';
    if (WRITE) fs.writeFileSync(p, out, 'utf8');
    console.log(`${WRITE ? '✎' : '·'} ${f}: ${fileChanges} 筆測試項目變更`);
  }
}

// 顯示前幾筆實際 before→after，方便人工把關語意安全
console.log('\n── 範例變更 (before → after) ──');
for (const d of diffs.slice(0, 12)) {
  const pick = (t) => ({
    cond: t.conditions && Object.fromEntries(Object.entries(t.conditions).map(([k, v]) => [k, v?.value ?? v])),
    summary: t.acceptance_criteria?.summary,
    details: t.acceptance_criteria?.details,
  });
  const b = pick(d.before), a = pick(d.after);
  console.log(`\n[${d.f} · ${d.id}]`);
  if (JSON.stringify(b.cond) !== JSON.stringify(a.cond)) {
    console.log('  cond  -', JSON.stringify(b.cond));
    console.log('  cond  +', JSON.stringify(a.cond));
  }
  if (JSON.stringify(b.details) !== JSON.stringify(a.details) || b.summary !== a.summary) {
    console.log('  crit  -', JSON.stringify({ summary: b.summary, details: b.details }));
    console.log('  crit  +', JSON.stringify({ summary: a.summary, details: a.details }));
  }
}

console.log(`\n總結：${changedFiles} 個檔案、${changedFields} 筆測試項目${WRITE ? ' 已寫回' : ' 將變更（乾跑，未寫檔）'}。`);
if (skipped.length) console.log(`略過 ${skipped.length} 個 git-dirty 檔（cron 進行中）：${skipped.join(', ')}　（要一起處理可加 --all）`);
if (!WRITE && !CHECK) console.log('加上 --write 以實際套用。');

if (CHECK && changedFiles > 0) {
  console.error(`\n✗ 有 ${changedFiles} 個檔案格式未正規化。請執行 \`node scripts/normalize_data.mjs --write\` 後再提交。`);
  process.exit(1);
}
