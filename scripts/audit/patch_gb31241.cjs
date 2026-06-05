const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../data/GB31241.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// 1. T6.3 Forced Discharge
const t6_3 = data.tests.find(t => t.id === 'GB31241-6.3' || t.id.endsWith('-6.3'));
if (t6_3 && t6_3.conditions && t6_3.conditions.current) {
    t6_3.conditions.current.value = "1It A";
}

// 2. T9.2 Missing duration
const t9_2 = data.tests.find(t => t.id === 'GB31241-9.2' || t.id.endsWith('-9.2'));
if (t9_2 && t9_2.conditions) {
    t9_2.conditions.duration = {
        value: "動作或取大值",
        detail: "對於移除保護電路的電池組充電 1 h 或(C/Icm)h，兩者取較大值。對於保留保護電路的電池組充電至保護電路動作。"
    };
}

// 3. T8.8 Washing process
const t8_8 = data.tests.find(t => t.id === 'GB31241-8.8' || t.id.endsWith('-8.8'));
if (t8_8 && t8_8.conditions && t8_8.conditions.process) {
    t8_8.conditions.process.detail = "包含浸泡(0.5h)、攪拌(0.5h, 60r/min)、脫水(10min, 800r/min)及烘乾(0.5h, 45°C)等步驟。";
}

// 4. T6.2 Overcharge CV phase
const t6_2 = data.tests.find(t => t.id === 'GB31241-6.2' || t.id.endsWith('-6.2'));
if (t6_2 && t6_2.conditions && t6_2.conditions.charge_current) {
    t6_2.conditions.charge_current.detail = "先用最大充電電流(Icm)恆流充電至試驗電壓，然後以該電壓恆壓充電。";
}

// 5. T9.2 & T9.6 Acceptance Criteria
if (t9_2 && t9_2.acceptance_criteria && t9_2.acceptance_criteria.details) {
    t9_2.acceptance_criteria.details = t9_2.acceptance_criteria.details.filter(d => !d.rule_zh.includes('保護電路'));
}
const t9_6 = data.tests.find(t => t.id === 'GB31241-9.6' || t.id.endsWith('-9.6'));
if (t9_6 && t9_6.acceptance_criteria && t9_6.acceptance_criteria.details) {
    t9_6.acceptance_criteria.details = t9_6.acceptance_criteria.details.filter(d => !d.rule_zh.includes('保護電路'));
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log("GB31241 patched successfully.");
