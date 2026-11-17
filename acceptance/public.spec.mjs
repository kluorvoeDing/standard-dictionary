// 公開驗收：檢查查閱視窗與比對頁的呈現契約（data-sd-* 屬性，見 docs/V2_REDESIGN.md）。
// 標準答案一律讀自 data/*.json。請勿修改本檔。
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { normalizeForCompare } from './normalize.mjs';

const root = path.resolve(import.meta.dirname, '..');
const adapter = JSON.parse(fs.readFileSync(path.join(root, 'acceptance/adapter.json'), 'utf8'));
const NON_STANDARD = new Set(['catalog.json', 'taxonomy.json', 'field_schema.json']);

// tests[].id -> { file, test }
const TESTS = new Map();
for (const f of fs.readdirSync(path.join(root, 'data'))) {
  if (!f.endsWith('.json') || NON_STANDARD.has(f)) continue;
  const doc = JSON.parse(fs.readFileSync(path.join(root, 'data', f), 'utf8'));
  for (const t of doc.tests || []) TESTS.set(t.id, { file: f.replace(/\.json$/, ''), test: t });
}

const squash = s => String(s ?? '').normalize('NFKC').replace(/\s+/g, '');
const expectedValue = cond => (cond && typeof cond === 'object' ? cond.value || cond.detail : cond);
const condOf = (testId, param) => TESTS.get(testId).test.conditions[param];
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
const sel = (testId, param) => `[data-sd-cell][data-test="${testId}"][data-param="${param}"]`;

async function readCells(page, selector) {
  return page.locator(selector).evaluateAll(els => els.map(el => ({
    text: el.textContent || '',
    test: el.getAttribute('data-test'),
    param: el.getAttribute('data-param'),
    state: el.getAttribute('data-state'),
    row: el.getAttribute('data-row'),
    provenance: el.getAttribute('data-provenance'),
  })));
}

async function expectCell(page, testId, param) {
  const cond = condOf(testId, param);
  const want = squash(expectedValue(cond));
  await expect(page.locator(sel(testId, param)).first(), `找不到 ${testId} / ${param} 的 data-sd-cell`).toBeAttached({ timeout: 15_000 });
  const cells = await readCells(page, sel(testId, param));
  const hit = cells.find(c => squash(c.text).includes(want));
  expect(hit, `${testId} / ${param} 應顯示「${expectedValue(cond)}」，實際為 ${JSON.stringify(cells.map(c => c.text))}`).toBeTruthy();
  const wantProv = cond.source_reference ? 'cited' : 'uncited';
  expect(hit.provenance, `${testId} / ${param} 的 data-provenance 應為 ${wantProv}`).toBe(wantProv);
  return hit;
}

test('adapter.json 已填寫', () => {
  expect(adapter.compareUrl, 'compareUrl 未填').toContain('{ids}');
  expect(adapter.testUrl, 'testUrl 未填（必須能直接開啟單一測試項目）').toContain('{testId}');
  expect(['inline', 'click', 'focus']).toContain(adapter.sourceReveal);
});

test('首頁沒有未處理的錯誤', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

test('比對畫面：數值、出處狀態、相同列與資料一致', async ({ page }) => {
  await page.goto(fill(adapter.compareUrl, { ids: 'IEC62133-2,UN38.3', levels: 'CELL', diff: '0' }));
  for (const [testId, param] of [
    ['IEC62133-2-7.3.1', 'external_resistance'],
    ['IEC62133-2-7.3.1', 'temperature'],
    ['UN38.3-T5', 'external_resistance'],
    ['UN38.3-T5', 'temperature'],
  ]) {
    const cell = await expectCell(page, testId, param);
    expect(['same', 'diff', 'only'], `${testId} / ${param} 在比對畫面的 data-state`).toContain(cell.state);
    expect(cell.row, `${testId} / ${param} 在比對畫面缺 data-row`).toBeTruthy();
  }

  // 所有顯示出來的值都要與資料一致
  const all = await readCells(page, '[data-sd-cell]');
  expect(all.length).toBeGreaterThan(20);
  for (const c of all) {
    const rec = TESTS.get(c.test);
    expect(rec, `data-test="${c.test}" 不存在於資料`).toBeTruthy();
    const cond = rec.test.conditions?.[c.param];
    expect(cond, `${c.test} 沒有條件 ${c.param}`).toBeTruthy();
    expect(squash(c.text), `${c.test} / ${c.param} 顯示內容與資料不符`).toContain(squash(expectedValue(cond)));
  }

  // 標示為 same 的列：各標準的值正規化後必須相等
  const rows = new Map();
  for (const c of all) {
    if (c.state !== 'same') continue;
    const std = TESTS.get(c.test).file;
    const value = normalizeForCompare(expectedValue(TESTS.get(c.test).test.conditions[c.param]));
    if (!rows.has(c.row)) rows.set(c.row, new Map());
    const byStd = rows.get(c.row);
    if (!byStd.has(std)) byStd.set(std, new Set());
    byStd.get(std).add(value);
  }
  for (const [row, byStd] of rows) {
    expect(byStd.size, `列 ${row} 標為 same，但只有一份標準有值`).toBeGreaterThan(1);
    const signatures = new Set([...byStd.values()].map(s => [...s].sort().join('\u0000')));
    expect(signatures.size, `列 ${row} 標為 same，但各標準的值不同`).toBe(1);
  }

  // 沒有資料的位置要標明類型
  const empties = await page.locator('[data-sd-empty]').evaluateAll(els => els.map(el => el.getAttribute('data-sd-empty')));
  expect(empties.length, '比對畫面應有 data-sd-empty').toBeGreaterThan(0);
  for (const kind of empties) expect(['uncovered', 'na', 'unspecified']).toContain(kind);
});

test('既有分享網址仍可開啟', async ({ page }) => {
  await page.goto('/?c=UN38.3,GB31241,IEC62133-2&lv=CELL&diff=1');
  const cell = await expectCell(page, 'GB31241-6.1', 'external_resistance');
  expect(cell.state).toBe('diff');
  const all = await readCells(page, '[data-sd-cell]');
  const stds = new Set(all.map(c => TESTS.get(c.test)?.file));
  expect([...stds].sort()).toEqual(['GB31241', 'IEC62133-2', 'UN38.3']);
});

test('單一測試項目的網址：條件、判定、出處', async ({ page }) => {
  const testId = 'IEC62133-2-7.3.6';
  await page.goto(fill(adapter.testUrl, { testId }));
  const { test: t } = TESTS.get(testId);
  for (const param of Object.keys(t.conditions)) await expectCell(page, testId, param);

  const criteria = page.locator(`[data-sd-criteria][data-test="${testId}"]`).first();
  await expect(criteria).toBeAttached();
  expect(squash(await criteria.textContent())).toContain(squash(t.acceptance_criteria.summary));

  const param = 'charging_current';
  const cell = page.locator(sel(testId, param)).first();
  if (adapter.sourceReveal === 'click') await cell.click();
  if (adapter.sourceReveal === 'focus') await cell.focus();
  const source = page.locator(`[data-sd-source][data-test="${testId}"][data-param="${param}"]`).first();
  await expect(source, '出處應在一次操作內可見').toBeVisible({ timeout: 5_000 });
  expect(squash(await source.textContent())).toContain(squash(t.conditions[param].source_reference));
});

test('沒有出處的值不得標為已有出處', async ({ page }) => {
  await page.goto(fill(adapter.testUrl, { testId: 'GB40559-7.8' }));
  const cell = await expectCell(page, 'GB40559-7.8', 'penetration_speed');
  expect(cell.provenance).toBe('uncited');
});
