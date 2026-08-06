const fs = require('fs');
const path = require('path');

// --- UL3030 ---
const ul3030Path = path.join(__dirname, '../data/UL3030.json');
let ul3030Data = JSON.parse(fs.readFileSync(ul3030Path, 'utf8'));
ul3030Data.tests.forEach(test => {
  if (test.id === 'UL3030-32.5') {
    if (test.acceptance_criteria && test.acceptance_criteria.details) {
      if (!test.acceptance_criteria.details.includes('通過 Dielectric Voltage Withstand Test (29) (若具危險電壓)')) {
        test.acceptance_criteria.details.push('通過 Dielectric Voltage Withstand Test (29) (若具危險電壓)');
      }
    }
  }
  if (test.id === 'UL3030-35') {
    if (test.acceptance_criteria && test.acceptance_criteria.details) {
      test.acceptance_criteria.details = test.acceptance_criteria.details.map(d => {
        if (d.includes('電氣間隙縮減')) {
          return '通過 2.5mm 測試棒及圖 12.1 關節探針測試，且無 Table 26.1 中任何失效情形';
        }
        return d;
      });
    }
  }
});
fs.writeFileSync(ul3030Path, JSON.stringify(ul3030Data, null, 2), 'utf8');

// --- ULC2580 ---
const ulc2580Path = path.join(__dirname, '../data/ULC2580.json');
let ulc2580Data = JSON.parse(fs.readFileSync(ulc2580Path, 'utf8'));
ulc2580Data.tests.forEach(test => {
  if (['ULC2580-T33', 'ULC2580-T35', 'ULC2580-T36', 'ULC2580-T39', 'ULC2580-T40'].includes(test.id)) {
    if (test.acceptance_criteria) {
      if (test.acceptance_criteria.summary) {
        test.acceptance_criteria.summary = test.acceptance_criteria.summary.replace('無外部排氣、破裂或洩漏', '無外部排氣、無破裂、無洩漏');
      }
      if (test.acceptance_criteria.details) {
        test.acceptance_criteria.details = test.acceptance_criteria.details.map(d => d.replace('無外部排氣、破裂或洩漏', '無外部排氣、無破裂、無洩漏'));
      }
    }
  }
  if (test.id === 'ULC2580-T37') {
    if (test.exemptions) {
      test.exemptions = test.exemptions.filter(e => !e.rule_zh.includes('不可從車輛拆卸'));
    }
  }
  if (test.id === 'ULC2580-T42') {
    if (test.conditions && test.conditions.test_profile) {
      test.conditions.test_profile.detail = test.conditions.test_profile.detail.replace('或按車輛預期的火災暴露條件進行', '').replace('，或按車輛預期的火災暴露條件進行', '');
      test.conditions.test_profile.original_text_snippet = 'The sample is to be subjected to external fire exposure in accordance with the anticipated fire exposure conditions for the vehicle application.'; // Wait, the subagent says this snippet was FABRICATED. I should remove it.
      if (test.conditions.test_profile.original_text_snippet === 'The sample is to be subjected to external fire exposure in accordance with the anticipated fire exposure conditions for the vehicle application.') {
        delete test.conditions.test_profile.original_text_snippet;
      }
    }
  }
  if (test.id === 'ULC2580-T43-2') {
    if (test.acceptance_criteria) {
      if (test.acceptance_criteria.summary && !test.acceptance_criteria.summary.includes('無爆炸')) {
        test.acceptance_criteria.summary = test.acceptance_criteria.summary + '、無外部起火、無爆炸';
      }
      if (test.acceptance_criteria.details) {
        test.acceptance_criteria.details.unshift('無外部起火', '無爆炸');
      }
    }
  }
});
fs.writeFileSync(ulc2580Path, JSON.stringify(ulc2580Data, null, 2), 'utf8');

// For ULC2580, I'll also do a global replace for the fabricated snippet just in case.
let ulcStr = fs.readFileSync(ulc2580Path, 'utf8');
ulcStr = ulcStr.replace(/"original_text_snippet": "The sample is to be subjected to external fire exposure in accordance with the anticipated fire exposure conditions for the vehicle application."/g, '');
// And remove trailing commas if left behind. We can just rely on the JSON parse above which should be sufficient.
fs.writeFileSync(ulc2580Path, ulcStr, 'utf8');

console.log('Fixed files for Iteration 68');
