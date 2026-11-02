#!/usr/bin/env node
// 找出「比對頁判為不同、但數字與單位完全相同」的列：多半是同一件事寫法不同。
//
//   node scripts/review/near_same.mjs            列出全部
//   node scripts/review/near_same.mjs GB31241    只列有這份標準參與的
//   node scripts/review/near_same.mjs --json     輸出 JSON（給子代理當工作單）
//   node scripts/review/near_same.mjs --check    與基準線比較，數量增加就 exit 1（CI 用）
//   node scripts/review/near_same.mjs --update-baseline   清掉一批後降低基準線
//
// 用的是比對頁同一套邏輯（frontend/src/utils/compareRows.js 的 buildGroupRows），
// 逐一檢查「同一 normalized_id、樣品層級有交集」的每一對標準。
// 數字相同不一定同義（例如一邊多了適用條件），所以結果只是候選，要人判斷。
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { buildGroupRows } from '../../frontend/src/utils/compareRows.js';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..', '..');
const DATA = path.join(ROOT, 'data');
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const check = args.includes('--check');
const updateBaseline = args.includes('--update-baseline');
const BASELINE = path.join(ROOT, 'scripts', 'review', 'near_same_baseline.json');
const only = args.find((a) => !a.startsWith('--'));

const catalog = JSON.parse(fs.readFileSync(path.join(DATA, 'catalog.json'), 'utf8'));
const stds = catalog.map((c) => ({
  id: path.basename(c.schema_v2_json, '.json'),
  base: c.base_standard_id || c.document_id,
  tests: JSON.parse(fs.readFileSync(path.join(ROOT, c.schema_v2_json), 'utf8')).tests,
}));

// 數字＋單位的指紋：全形轉半形、去空白後取出「數字（含小數、±、範圍）＋緊接的單位」。
const fingerprint = (s) => {
  const t = String(s).normalize('NFKC').replace(/\s+/g, '').replace(/℃/g, '°C');
  const toks = t.match(/[-−]?\d+(?:\.\d+)?(?:[%°A-Za-zΩμ²³/]+(?:\/[A-Za-z]+)?)?/g) || [];
  return toks.map((x) => x.replace('−', '-')).sort().join('|');
};

const out = [];
for (let i = 0; i < stds.length; i++) {
  for (let j = i + 1; j < stds.length; j++) {
    const a = stds[i];
    const b = stds[j];
    if (a.base === b.base) continue; // 同一標準的新舊版不互比
    if (only && a.id !== only && b.id !== only) continue;
    const nids = new Set(a.tests.map((t) => t.normalized_id));
    for (const nid of new Set(b.tests.map((t) => t.normalized_id))) {
      if (!nids.has(nid)) continue;
      for (const lv of ['CELL', 'MODULE', 'PACK_SYSTEM']) {
        const ra = a.tests.filter((t) => t.normalized_id === nid && (t.test_objects || []).includes(lv));
        const rb = b.tests.filter((t) => t.normalized_id === nid && (t.test_objects || []).includes(lv));
        if (!ra.length || !rb.length) continue;
        for (const row of buildGroupRows([{ records: ra }, { records: rb }]).technical) {
          if (row.state !== 'diff') continue;
          const va = row.cells[0].map((c) => c.value);
          const vb = row.cells[1].map((c) => c.value);
          const fa = fingerprint(va.join('；'));
          if (!fa || fa !== fingerprint(vb.join('；'))) continue;
          out.push({ nid, level: lv, key: row.key, label: row.label, a: a.id, b: b.id, a_value: va.join('；'), b_value: vb.join('；'),
            a_tests: ra.map((t) => t.id), b_tests: rb.map((t) => t.id) });
        }
      }
    }
  }
}

// 同一列在多個層級重複出現時只留一筆
const seen = new Set();
const uniq = out.filter((r) => {
  const k = `${r.nid}|${r.key}|${r.a}|${r.b}|${r.a_value}|${r.b_value}`;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

if (check || updateBaseline) {
  const prev = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')).count : Infinity;
  if (updateBaseline) {
    if (uniq.length > prev) {
      console.error(`目前 ${uniq.length} 列，比基準線 ${prev} 多，不能調高基準線。`);
      process.exit(1);
    }
    fs.writeFileSync(BASELINE, JSON.stringify({ count: uniq.length, note: '比對頁判為不同、但數字與單位相同的列數；只能降不能升' }, null, 2) + '\n');
    console.log(`基準線更新為 ${uniq.length}。`);
  } else if (uniq.length > prev) {
    console.error(`寫法不一致的列由 ${prev} 增加到 ${uniq.length}。執行 node scripts/review/near_same.mjs 查看，把同義內容改成相同寫法。`);
    process.exit(1);
  } else {
    console.log(`寫法不一致的列：${uniq.length}（基準線 ${prev}）${uniq.length < prev ? '，請執行 --update-baseline 降低基準線' : ''}。`);
  }
} else if (asJson) {
  console.log(JSON.stringify(uniq, null, 2));
} else {
  for (const r of uniq) console.log(`${r.nid}｜${r.label || r.key}｜${r.a}「${r.a_value}」 vs ${r.b}「${r.b_value}」`);
  console.log(`\n共 ${uniq.length} 列：數字與單位相同、文字不同，比對頁會標成「不同」。`);
}
