const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');

// Helper to load, modify and save
function updateJSON(filename, updater) {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return;
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    updater(data);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${filename}`);
}

// 1. IEC62619
updateJSON('IEC62619.json', (data) => {
    const test = data.tests.find(t => t.id === 'IEC62619-7.2.6');
    if (test && test.conditions && test.conditions.forced_discharge_current) {
        test.conditions.forced_discharge_current.detail = test.conditions.forced_discharge_current.detail.replace(/Im \/ It × 90/g, '(1 It / Im) × 90');
    }
});

// 2. UL1973
updateJSON('UL1973.json', (data) => {
    const t16 = data.tests.find(t => t.id === 'UL1973-16');
    if (t16) t16.conditions.charging_rate.detail = "20% greater than the maximum specified charging rate.";

    const t18 = data.tests.find(t => t.id === 'UL1973-18');
    if (t18) t18.conditions.discharge_rate.detail = "90% of the rated overcurrent protection value, and 135% of the main fuse rating (or 150% for Exception 1).";

    const t30 = data.tests.find(t => t.id === 'UL1973-30');
    if (t30) t30.conditions.force = { value: "100 ±6 kN", detail: "Apply maximum force of 100 ±6 kN." };

    const t33 = data.tests.find(t => t.id === 'UL1973-33');
    if (t33) t33.conditions.height = { value: "Variable", detail: "100 cm for 7 kg or less, 10 cm for >7 kg but less than 100 kg, and 2.5 cm for > 100 kg." };

    const tE3 = data.tests.find(t => t.id === 'UL1973-E3');
    if (tE3) {
        tE3.conditions.ambient_temp = { value: "25 ±5 °C", detail: "Test ambient temperature." };
        tE3.conditions.duration = { value: "7 h", detail: "Apply the short for 7 h or until temperatures on the cell cool to within ±10 °C." };
    }

    const tE4 = data.tests.find(t => t.id === 'UL1973-E4');
    if (tE4 && tE4.conditions.impact) {
        tE4.conditions.impact.detail = "Explicitly requires a 15.8 ±0.1-mm bar, a 9.1 ±0.46-kg weight, and a drop height of 610 ±25 mm.";
    }

    const tE6 = data.tests.find(t => t.id === 'UL1973-E6');
    if (tE6 && tE6.conditions.temperature) {
        tE6.conditions.temperature.detail = "Rate of 5 ±2 °C per minute to a temperature of 130 ±2 °C.";
    }
});

// 3. ULC2580
updateJSON('ULC2580.json', (data) => {
    const t25 = data.tests.find(t => t.id === 'ULC2580-T25');
    if (t25) {
        t25.acceptance_criteria.details.push("Reaching 110% of the rated charge capacity or the manufacturer-specified charging limit would be considered as a failure of the overcharge evaluation.");
    }

    const t26 = data.tests.find(t => t.id === 'ULC2580-T26');
    if (t26) {
        t26.conditions.repeat_test = { value: "Yes", detail: "Testing is repeated at a load that draws a maximum current no less than 15% below the operation of the short circuit protection." };
        t26.conditions.duration = { value: "7 h", detail: "Until fully discharged or 7 hours after stabilization, or a fire or explosion has occurred." };
    }

    const t28 = data.tests.find(t => t.id === 'ULC2580-T28');
    if (t28) {
        t28.conditions.stabilization = { value: "1 h", detail: "All cell temperatures are estimated to be within ±10°C (±18°F) of the chamber temperature for 1 h before testing." };
    }

    const t38 = data.tests.find(t => t.id === 'ULC2580-T38');
    if (t38) {
        t38.original_text_snippet = "The DUT shall be subjected to a crush force of 100 ±6 kN.";
        t38.conditions.force = { value: "100 ±6 kN", detail: "Exception 1 strictly sets the force at 100 ±6 kN." };
        t38.conditions.direction = { value: "3 mutually perpendicular directions", detail: "3 mutually perpendicular directions of press (or 2 for cylindrical)." };
    }

    const t39 = data.tests.find(t => t.id === 'ULC2580-T39');
    if (t39) {
        t39.original_text_snippet = "The DUT is to be subjected to the thermal shock test of SAE J2464, except that the temperature extremes are from 85 ±2°C to −40 ±2°C.";
        t39.conditions.method = { value: "SAE J2464 (modified)", detail: "Thermal shock test of SAE J2464, except that the temperature extremes are from 85 ±2°C to −40 ±2°C." };
    }

    const t40 = data.tests.find(t => t.id === 'ULC2580-T40');
    if (t40) {
        if (t40.conditions.method) t40.conditions.method.detail += " with a severity level of 6.";
        else t40.conditions.severity = { value: "Level 6", detail: "Severity level of 6 per IEC 60068-2-52." };
    }

    const t41 = data.tests.find(t => t.id === 'ULC2580-T41');
    if (t41) {
        t41.conditions.temperature = { value: "Room temperature", detail: "Immersion at room temperature." };
        t41.conditions.duration = { value: "1 h", detail: "1 hour or until any visible reactions have stopped." };
    }
});

// 4. UL9540A
updateJSON('UL9540A.json', (data) => {
    const tmod = data.tests.find(t => t.id === 'UL9540A-MODULE');
    if (tmod && tmod.acceptance_criteria) {
        const detailIdx = tmod.acceptance_criteria.details.findIndex(d => d.includes("模組外表面溫度不超過"));
        if (detailIdx !== -1) {
             tmod.acceptance_criteria.details[detailIdx] += " (as measured adjacent to the initiating cell where the greatest thermal exposure is anticipated).";
        } else {
             tmod.acceptance_criteria.details.push("Module exterior surface temp does not exceed cell vent temp, as measured adjacent to the initiating cell where the greatest thermal exposure is anticipated.");
        }
    }
});

// 5. UN38.3
updateJSON('UN38.3.json', (data) => {
    const t4 = data.tests.find(t => t.id === 'UN38.3-T4');
    if (t4 && t4.conditions && t4.conditions.small_battery_parameters) {
        t4.conditions.small_battery_parameters.detail = t4.conditions.small_battery_parameters.detail.replace(/30000/g, '100850');
        t4.conditions.small_battery_parameters.value = t4.conditions.small_battery_parameters.value.replace(/30000/g, '100850');
    }
});
