#!/usr/bin/env node
/**
 * 檢查標準改寫前後（或相較於 git HEAD），每個測試項目的舊 conditions (value + detail)
 * 中的所有數字是否仍存在於新 conditions (value + detail) 中。
 *
 * 用法：
 *   node scripts/review/check_numbers.mjs <標準代號>
 *   node scripts/review/check_numbers.mjs --all
 *
 * 比較基準：
 *   以 `git show HEAD:data/<標準>.json` 為舊版（若工作樹尚未修改，也可傳入 `--from <path>`），
 *   與目前 `data/<標準>.json`（或套用 decisions 後的預計結果）比對。
 */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..', '..');
const DATA = path.join(ROOT, 'data');

// 擷取字串中所有數字 token（支援小數，如 0.05、15.8、1000）
// 正規化：去掉千分位逗號（若有），統一以數值字串與數值雙軌比對（例如 1.0 與 1 視為相等，或精確字面匹配）
export function extractNumbers(text) {
  if (!text) return [];
  const s = String(text).normalize('NFKC');
  const matches = s.match(/\d+(?:\.\d+)?/g) || [];
  return matches;
}

export function checkTestNumbers(oldTest, newTest) {
  const collectText = (t) => {
    const parts = [];
    for (const [k, v] of Object.entries(t.conditions || {})) {
      if (v && typeof v === 'object') {
        if (v.value) parts.push(String(v.value));
        if (v.detail) parts.push(String(v.detail));
      } else if (v != null) {
        parts.push(String(v));
      }
    }
    return parts.join(' \n ');
  };

  const oldNums = extractNumbers(collectText(oldTest));
  const newNums = extractNumbers(collectText(newTest));
  const newExactSet = new Set(newNums);
  const newFloatSet = new Set(newNums.map((n) => Number(n)));

  const missing = [];
  for (const n of new Set(oldNums)) {
    if (!newExactSet.has(n) && !newFloatSet.has(Number(n))) {
      missing.push(n);
    }
  }
  return missing;
}

export function checkStandardData(std, oldData, newData) {
  const oldMap = new Map((oldData.tests || []).map((t) => [t.id, t]));
  const newMap = new Map((newData.tests || []).map((t) => [t.id, t]));
  const errors = [];

  for (const [id, oldTest] of oldMap.entries()) {
    const newTest = newMap.get(id);
    if (!newTest) {
      errors.push(`${std} · ${id}: 測試項目在新版中遺失`);
      continue;
    }
    const missing = checkTestNumbers(oldTest, newTest);
    if (missing.length > 0) {
      errors.push(`${std} · ${id} (§${oldTest.section || ''}): 舊 value+detail 中的數字在新版找不到：[${missing.join(', ')}]`);
    }
  }
  return errors;
}

// 若直接由 CLI 執行
if (import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  const fromIdx = args.indexOf('--ref');
  const gitRef = fromIdx !== -1 ? args[fromIdx + 1] : 'HEAD';
  const stds = all
    ? fs.readdirSync(DATA).filter((f) => f.endsWith('.json') && f !== 'catalog.json' && f !== 'taxonomy.json' && f !== 'field_schema.json').map((f) => path.basename(f, '.json'))
    : args.filter((a) => !a.startsWith('--') && (fromIdx === -1 || a !== args[fromIdx + 1]));

  if (stds.length === 0) {
    console.error('用法：node scripts/review/check_numbers.mjs <標準代號> [--ref HEAD] 或 --all');
    process.exit(1);
  }

  let totalErrors = 0;
  for (const std of stds) {
    const newPath = path.join(DATA, `${std}.json`);
    if (!fs.existsSync(newPath)) {
      console.error(`找不到 ${newPath}`);
      totalErrors++;
      continue;
    }
    const newData = JSON.parse(fs.readFileSync(newPath, 'utf8'));
    let oldData;
    try {
      const oldRaw = execFileSync('git', ['show', `${gitRef}:data/${std}.json`], { cwd: ROOT, encoding: 'utf8' });
      oldData = JSON.parse(oldRaw);
    } catch (e) {
      console.error(`無法從 git ${gitRef} 讀取 data/${std}.json：${e.message}`);
      totalErrors++;
      continue;
    }

    const errs = checkStandardData(std, oldData, newData);
    if (errs.length > 0) {
      errs.forEach((msg) => console.error(`✗ ${msg}`));
      totalErrors += errs.length;
    } else {
      console.log(`✓ ${std}: 數值完整性檢查通過（0 遺失）`);
    }
  }

  process.exit(totalErrors > 0 ? 1 : 0);
}
