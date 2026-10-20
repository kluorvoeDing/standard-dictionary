import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { execFileSync } from 'node:child_process';
import { checkStandardData } from './check_numbers.mjs';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..', '..');
const DATA = path.join(ROOT, 'data');
const schema = JSON.parse(fs.readFileSync(path.join(DATA, 'field_schema.json'), 'utf8'));

export function applyStandardHarmonization(std, updates) {
  const file = path.join(DATA, `${std}.json`);
  const oldData = JSON.parse(fs.readFileSync(file, 'utf8'));
  const data = JSON.parse(JSON.stringify(oldData));
  const procKeys = new Set(schema.procedure_keys || []);

  for (const [testId, newConds] of Object.entries(updates)) {
    const t = data.tests.find((x) => x.id === testId);
    if (!t) throw new Error(`Test ${testId} not found in ${std}`);

    const merged = { ...newConds };
    // Retain all existing procedure keys if not explicitly overwritten
    for (const [k, v] of Object.entries(t.conditions || {})) {
      if (procKeys.has(k) && !merged[k]) {
        merged[k] = v;
      }
    }
    t.conditions = merged;
  }

  // 1. Check numeric integrity
  const errors = checkStandardData(std, oldData, data);
  if (errors.length > 0) {
    console.error(`✗ ${std} 數值完整性檢查失敗：`);
    errors.forEach((e) => console.error(`  ${e}`));
    throw new Error(`Numeric integrity check failed for ${std} (${errors.length} errors)`);
  }

  // 2. Write file
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  console.log(`✓ ${std}: 數值完整性檢查通過（0 遺失），已寫入檔案`);

  // 3. Normalize
  execFileSync('node', [path.join(ROOT, 'scripts', 'normalize_data.mjs'), '--write', '--all'], { stdio: 'inherit', cwd: ROOT });

  // 4. Validate
  execFileSync('npm', ['run', 'validate'], { stdio: 'inherit', cwd: ROOT });
  execFileSync('npm', ['run', 'normalize:check'], { stdio: 'inherit', cwd: ROOT });
  console.log(`✓ ${std}: 正規化與結構驗證皆通過！`);
}
