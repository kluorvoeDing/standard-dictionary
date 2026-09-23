import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../..');
const DATA_DIR = path.join(ROOT, 'data');

function enrichFile(filename, enricherFn) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`File ${filename} does not exist.`);
    return;
  }
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const tests = json.tests || json.test_items || [];
  
  let modifiedCount = 0;
  tests.forEach(test => {
    if (enricherFn(test)) {
      modifiedCount++;
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`[Enriched] ${filename}: ${modifiedCount} tests enriched.`);
}

// 1. GB38031
enrichFile('GB38031.json', (test) => {
  if (!test.conditions) test.conditions = {};
  const isCell = test.test_objects?.includes('CELL') && !test.test_objects?.includes('PACK_SYSTEM');
  let changed = false;

  if (isCell) {
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "3 顆",
        detail: "依照表 1 規定，單體測試項目每組需 3 顆樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "常溫標準充放電確認容量後滿充",
        detail: "依 7.1.1 規定，室溫下以 1/3 C 充電至終止電壓轉恆壓至 0.05 C 截止，靜置 30 分鐘。"
      };
      changed = true;
    }
    if (test.normalized_id === 'MECH-CRUSH' && !test.conditions.apparatus) {
      test.conditions.apparatus = {
        value: "半徑 75 mm 半圓柱壓頭",
        detail: "擠壓頭半徑為 75 mm 的半圓柱體，長度大於被擠壓單體尺寸。"
      };
      changed = true;
    }
  } else {
    // Pack / System
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "1 組",
        detail: "電池包或系統試驗需 1 組完整樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "調整至 50% 或 100% 規定的 SOC",
        detail: "試驗前依各測試要求調整至指定的荷電狀態 (50% 或 100% SOC)。"
      };
      changed = true;
    }
    if (test.normalized_id === 'THERM-TR-EXT' && !test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "熱失控觸發後至少 2 小時",
        detail: "熱失控觸發後持續觀察至少 2 小時，確認無起火與爆炸擴散。"
      };
      changed = true;
    }
  }
  return changed;
});

// 2. GB31241
enrichFile('GB31241.json', (test) => {
  if (!test.conditions) test.conditions = {};
  let changed = false;

  if (!test.conditions.sample_quantity) {
    test.conditions.sample_quantity = {
      value: "每組 5 顆",
      detail: "型式試驗中每項單體或電池組測試基本樣品數為 5 顆。"
    };
    changed = true;
  }
  if (!test.conditions.pre_conditioning) {
    test.conditions.pre_conditioning = {
      value: "按 4.5.1 規定的充電方法滿充",
      detail: "在室溫下以製造商規定的充電方法充滿電，並靜置穩定。"
    };
    changed = true;
  }
  if (test.normalized_id === 'ELEC-OC' && !test.conditions.observation_period) {
    test.conditions.observation_period = {
      value: "試驗完成後觀察 1 小時",
      detail: "充電結束或保護動作後，在試驗環境中觀察 1 小時。"
    };
    changed = true;
  }
  return changed;
});

// 3. UL1642
enrichFile('UL1642.json', (test) => {
  if (!test.conditions) test.conditions = {};
  let changed = false;

  if (test.normalized_id === 'ELEC-SC-EXT' && !test.conditions.observation_period) {
    test.conditions.sample_quantity = {
      value: "每組 5 顆 (共 20 顆)",
      detail: "室溫組 10 顆（5 新鮮 + 5 循環）；55 °C 組 10 顆（5 新鮮 + 5 循環）。"
    };
    test.conditions.observation_period = {
      value: "殼溫回復至室溫 或 6 小時",
      detail: "持續短路直到外殼溫度降至環境溫度，並持續觀察至少 6 小時。"
    };
    changed = true;
  }
  if (test.normalized_id === 'ELEC-OC' && !test.conditions.observation_period) {
    test.conditions.sample_quantity = {
      value: "一次 15 顆 / 二次 10 顆",
      detail: "一次電池：滿充 5 + 半放 5 + 完放 5；二次電池：新鮮滿充 5 + 循環後滿充 5。"
    };
    test.conditions.observation_period = {
      value: "最短 7 小時",
      detail: "以 3×Ic 充電持續至少 7 小時或直到達到製造商指定條件。"
    };
    changed = true;
  }
  if (test.normalized_id === 'MECH-CRUSH' && !test.conditions.apparatus) {
    test.conditions.sample_quantity = {
      value: "10 顆 (5 新鮮 + 5 循環)",
      detail: "5 顆新鮮滿充電芯與 5 顆循環後滿充電芯。"
    };
    test.conditions.apparatus = {
      value: "直徑 32 mm 平板液壓壓頭",
      detail: "平坦金屬壓板，兩面平行。"
    };
    changed = true;
  }
  return changed;
});

// 4. IEC62133-2
enrichFile('IEC62133-2.json', (test) => {
  if (!test.conditions) test.conditions = {};
  let changed = false;

  if (test.section === '7.2.1' && !test.conditions.sample_quantity) {
    test.conditions.sample_quantity = {
      value: "5 顆電芯",
      detail: "5 顆依 7.1.1 規定充飽電的電芯。"
    };
    test.conditions.observation_period = {
      value: "持續充電 7 天",
      detail: "在恆溫箱中以指定充電方法連續充電 7 天。"
    };
    changed = true;
  }
  if (test.normalized_id === 'ELEC-SC-EXT') {
    test.conditions.sample_quantity = {
      value: "每溫度 5 顆 (共 10 顆)",
      detail: "20 ± 5 °C 5 顆與 55 ± 5 °C 5 顆。"
    };
    test.conditions.observation_period = {
      value: "24 小時 或 溫降 20%",
      detail: "持續短路 24 小時或外殼溫度降至最大溫升 20% 以下。"
    };
    changed = true;
  }
  if (test.section === '7.3.9' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "直角小型鎳片 (0.2 × 0.1 × 1.0 mm)",
      detail: "尺寸為高 0.2 mm、寬 0.1 mm、每邊長 1.0 mm 之 L 型鎳片。"
    };
    test.conditions.sample_quantity = {
      value: "每條件 5 顆",
      detail: "上限與下限溫度條件下各 5 顆電芯。"
    };
    changed = true;
  }
  return changed;
});

// 5. UN38.3
enrichFile('UN38.3.json', (test) => {
  if (!test.conditions) test.conditions = {};
  let changed = false;

  if (['UN38.3-T1', 'UN38.3-T2', 'UN38.3-T3', 'UN38.3-T4', 'UN38.3-T5'].includes(test.id)) {
    test.conditions.sample_quantity = {
      value: "10 顆電芯 (5 原態 + 5 循環態)",
      detail: "5 顆第 1 次循環 100% SOC 電芯 + 5 顆 25 次循環後 100% SOC 電芯。"
    };
    test.conditions.observation_period = {
      value: "測試後 6 小時",
      detail: "測試結束後在環境溫度下觀察至少 6 小時。"
    };
    changed = true;
  }
  if (test.id === 'UN38.3-T7') {
    test.conditions.sample_quantity = {
      value: "8 組電池 (4 原態 + 4 循環態)",
      detail: "4 組第 1 循環滿充電池 + 4 組 25 循環滿充電池。"
    };
    test.conditions.observation_period = {
      value: "測試後 7 天 (7 days)",
      detail: "過充完成後樣品須持續觀察 7 天。"
    };
    changed = true;
  }
  if (test.id === 'UN38.3-T8') {
    test.conditions.sample_quantity = {
      value: "20 顆電芯 (10 原態 + 10 循環態)",
      detail: "10 顆第 1 循環完放電芯 + 10 顆 25 循環完放電芯。"
    };
    test.conditions.observation_period = {
      value: "測試後 7 天 (7 days)",
      detail: "強制放電完成後持續觀察 7 天。"
    };
    changed = true;
  }
  return changed;
});

// 6. IEC62619
enrichFile('IEC62619.json', (test) => {
  if (!test.conditions) test.conditions = {};
  let changed = false;

  if (test.normalized_id === 'ELEC-SC-EXT' && !test.conditions.sample_quantity) {
    test.conditions.sample_quantity = {
      value: "1 組電池系統或模組",
      detail: "1 組含完整 BMS 與保護裝置的電池系統或模組。"
    };
    test.conditions.observation_period = {
      value: "外殼溫度恢復 或 24 小時",
      detail: "持續短路直到外殼溫度降至環境溫度 ±10 °C 或滿 24 小時。"
    };
    changed = true;
  }
  if (test.normalized_id === 'THERM-TR-EXT' && !test.conditions.observation_period) {
    test.conditions.sample_quantity = {
      value: "1 組完整系統",
      detail: "1 組代表性工業用電池系統。"
    };
    test.conditions.observation_period = {
      value: "熱失控觸發後監控 8 小時",
      detail: "目標電芯熱失控後持續監控 8 小時確認無外部火焰擴散。"
    };
    changed = true;
  }
  return changed;
});

console.log("Core standards enrichment finished!");
