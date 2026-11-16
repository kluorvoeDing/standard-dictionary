// 執行：node --test frontend/src/lib/
import test from 'node:test';
import assert from 'node:assert/strict';
import { numericSignature, judgeRow, buildRows, cleanTestName, comparisonToCsv } from './compare.js';
import { normalizeForCompare as frozen } from '../../../acceptance/normalize.mjs';

const cell = (...values) => values.map(value => ({ value }));
const tier = (...cols) => judgeRow(cols.map(c => (c == null ? [] : cell(...[].concat(c)))));

test('文字相同或只有格式不同：same', () => {
  assert.deepEqual(tier('57 ± 4 °C', '57±4℃'), { state: 'same', tier: 'same' });
  assert.equal(tier('滿充', '100% SOC').state, 'same');
});

test('只有一份有規定：only；都沒有：none', () => {
  assert.deepEqual(tier('80 mΩ', null), { state: 'only', tier: 'only' });
  assert.deepEqual(tier(null, null), { state: 'none', tier: 'none' });
});

test('數值不同是差異', () => {
  assert.equal(tier('< 0.1 Ω', '80 ± 20 mΩ').tier, 'differ');
  assert.equal(tier('6 小時', '6 分鐘').tier, 'differ');
  assert.equal(tier('13 kN', '13 N').tier, 'differ');
  assert.equal(tier('-40 °C', '40 °C').tier, 'differ');
  assert.equal(tier('20 ± 5 °C', '20 ± 2 °C').tier, 'differ');
  assert.equal(tier('20 ± 5 °C', '20 °C').tier, 'differ');
});

test('數值相同但比較方向或限定詞不同，仍是差異', () => {
  assert.equal(tier('≤ 11.6 kPa', '≥ 11.6 kPa').tier, 'differ');
  assert.equal(tier('6 小時', '至少 6 小時').tier, 'differ');
  assert.equal(tier('13 kN（圓柱）', '13 kN（方形）').tier, 'differ');
  assert.equal(tier('1 C 充電', '1 C 放電').tier, 'differ');
  assert.equal(tier('3.5% NaCl 水溶液', '方式一：3.5% NaCl 水溶液；方式二：水').tier, 'differ');
  assert.equal(tier('100% SOC', '滿電狀態 (100% SOC)；完成循環壽命試驗後滿電狀態 (100% SOC)').tier, 'differ');
  assert.equal(tier('每軸 3 次', '共 3 次').tier, 'differ');
});

test('數值、單位、限定詞都相同，只是寫法不同：wording（state 仍為 diff）', () => {
  for (const [a, b] of [
    ['持續 90 分鐘', '90 分鐘'],
    ['≥ 5 次循環', '至少 5 次循環'],
    ['13 ± 0.78 kN', '13.0 ± 0.78 kN'],
    ['1.0 m', '1 m'],
    ['0.8 mm (0.03 in)，最大總行程 1.6 mm (0.06 in)', '0.8 mm (0.030 in) 振幅，最大總行程 1.6 mm (0.060 in)'],
    ['直徑 150 mm 平面鋼壓板', '兩個平面間擠壓（直徑 150 mm 平面鋼壓板）'],
    ['至爆炸或燃燒殆盡', '至爆炸或燃燒完畢'],
  ]) {
    assert.deepEqual(tier(a, b), { state: 'diff', tier: 'wording' }, `${a} ⇔ ${b}`);
  }
});

test('純文字且不在同義表內：差異', () => {
  assert.equal(tier('最脆弱之方位', '最可能產生不利結果的位置').tier, 'differ');
  assert.equal(numericSignature('正弦波'), '');
});

test('三份標準中只要有一份數值不同就是差異', () => {
  assert.equal(tier('90 分鐘', '持續 90 分鐘', '60 分鐘').tier, 'differ');
  assert.equal(tier('90 分鐘', '持續 90 分鐘', null).tier, 'wording');
});

test('same 的列在凍結的驗收正規化下必定相等', () => {
  const samples = ['57 ± 4 °C', '57±4℃', '滿充', '100% SOC', '80 mΩ', '80 ｍΩ', '7 Hz ~ 200 Hz', '7 Hz～200 Hz'];
  for (const a of samples) for (const b of samples) {
    if (tier(a, b).state === 'same') assert.equal(frozen(a), frozen(b));
  }
});

test('buildRows：同義鍵對齊、保留原始鍵與測試代號、程序列分開', () => {
  const columns = [
    { records: [{ id: 'A-1', section: '6.1', conditions: {
      temp: { value: '57 ± 4 °C', source_reference: '6.1 a)' },
      sample_quantity: { value: '3 個' },
    }, acceptance_criteria: { summary: '無起火', details: ['無起火'] } }] },
    { records: [{ id: 'B-1', section: '7', conditions: { temperature: '55 ± 5 °C', external_resistance: '80 mΩ' } }] },
    { records: [] },
  ];
  const { technical, procedure, criteria, counts } = buildRows(columns);
  const temp = technical.find(r => r.key === 'temperature');
  assert.equal(temp.tier, 'differ');
  assert.deepEqual(temp.cells[0][0], { testId: 'A-1', param: 'temp', clause: '6.1', value: '57 ± 4 °C', detail: '', source: '6.1 a)' });
  assert.equal(temp.cells[1][0].param, 'temperature');
  assert.equal(temp.cells[2].length, 0);
  assert.equal(technical.find(r => r.key === 'external_resistance').tier, 'only');
  assert.equal(procedure.length, 1);
  assert.deepEqual(counts, { differ: 1, wording: 0, same: 0, only: 1 });
  assert.equal(criteria[0][0].summary, '無起火');
  assert.equal(criteria[1].length, 0);
});

test('測試名稱只留中文', () => {
  assert.equal(cleanTestName(['撞擊試驗', '(Impact) — 適用於圓柱形電芯'].join(' ')), '撞擊（適用於圓柱形電芯）');
  assert.equal(cleanTestName(['高空模擬試驗', '(Altitude Simulation)'].join(' ')), '高空模擬');
  assert.equal(cleanTestName('外部短路'), '外部短路');
});

test('CSV：每列含判定與各標準的值、出處與空白類型', () => {
  const comparison = {
    columns: [{ baseId: 'A', doc: { display_name: 'A' } }, { baseId: 'B', doc: { display_name: 'B' } }],
    groups: [{
      name: '外部短路', cols: [{ status: 'ok' }, { status: 'uncovered' }],
      technical: [{ label: '外部電阻', tier: 'only', cells: [[{ value: '80 "mΩ"', source: '6.1' }], []] }],
      procedure: [], criteria: [[{ summary: '無起火', clause: '6.1' }], []],
    }],
  };
  const lines = comparisonToCsv(comparison).split('\r\n');
  assert.equal(lines.length, 3);
  assert.equal(lines[1], '"外部短路","外部電阻","僅一份規定","80 ""mΩ""","6.1","未涵蓋此測試",""');
});

test('括號內的條件不得被當成換算忽略', () => {
  const tier = (a, b) => judgeRow([[{ value: a }], [{ value: b }]]).tier;
  assert.equal(tier('-40 ± 2 °C (≥ 6 小時)', '-40 ± 2 °C'), 'differ');
  assert.equal(tier('1.0 m', '1 m（或實際現場使用程序規定之高度，取較大者）'), 'differ');
  assert.equal(tier('≤ 5 mΩ (含接線)', '≤ 5 mΩ'), 'differ');
  assert.equal(tier('圓錐角 45° (45°～60°)', '圓錐角 45°'), 'differ');
  assert.equal(tier('7 Hz～200 Hz～7 Hz (交越點 17.62 Hz、49.84 Hz)', '7 Hz～200 Hz'), 'differ');
  assert.equal(tier('溫度較峰值下降 20% 或短路持續 24 小時', '溫度降至峰值 20% 或短路持續 24 小時'), 'differ');
  assert.equal(tier('1 It 恆流放電至 Ude', '1It 恆流放電'), 'differ');
  assert.equal(tier('7 Hz～200 Hz～7 Hz', '7 Hz～200 Hz'), 'differ');
  assert.equal(tier('610 ± 25 mm', '610 ± 25 mm (24 ± 1 in)'), 'wording');
  assert.equal(tier('1.0 m', '1 m (3.28 ft)'), 'wording');
});
