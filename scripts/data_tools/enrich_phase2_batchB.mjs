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
  console.log(`[Batch B Enriched] ${filename}: ${modifiedCount} tests enriched.`);
}

// 1. JISC8715-2 (11 tests)
enrichFile('JISC8715-2.json', (test) => {
  if (!test.conditions) test.conditions = {};
  const isCell = test.test_objects?.includes('CELL') && !test.test_objects?.includes('PACK_SYSTEM');
  let changed = false;

  if (isCell) {
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 5 顆電芯",
        detail: "單電池級別測試每項條件使用 5 顆新鮮或循環後之代表性單電池。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "依製造商規範 100% 滿充並靜置",
        detail: "在常溫環境下依製造商規定之充放電程序充滿電至 100% SOC，靜置 1 小時至 4 小時。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "試驗結束後觀察 1 小時",
        detail: "試驗步驟完成後，在環境溫度下持續監控樣品狀態至少 1 小時。"
      };
      changed = true;
    }
  } else {
    // Module or Pack/System
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "1 組代表性模組或電池系統",
        detail: "電池系統或模組測試需 1 組完整代表性 DUT。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "依系統規範充電至 100% SOC",
        detail: "依製造商規格將電池系統充滿電，並確保 BMS 處於正常運作狀態。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "試驗結束後觀察 1 小時 (熱蔓延監控至冷卻)",
        detail: "測試結束後外觀檢查並持續監控 1 小時；熱蔓延試驗需監控至外殼溫度冷卻並靜置 1 小時。"
      };
      changed = true;
    }
  }

  // Apparatus supplements
  if (test.normalized_id === 'MECH-IMPACT' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "直徑 15.8 mm 鋼棒 與 9.1 kg 重錘",
      detail: "直徑 15.8 ± 0.1 mm 平滑鋼棒，9.1 ± 0.1 kg 重錘自 610 ± 25 mm 高度自由落下。"
    };
    changed = true;
  }
  if (test.normalized_id === 'MECH-DROP' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "平整水泥地面 或 50 mm 厚硬質木板",
      detail: "平整堅固之水泥地面或平鋪於堅固基座上的厚度 50 mm 硬質木板。"
    };
    changed = true;
  }
  if (test.normalized_id === 'ELEC-SC-INT' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "直徑 10 mm 壓頭 與 微型小鎳片",
      detail: "高 0.2 mm、寬 0.1 mm、每邊長 1.0 mm 之微型 L 型小鎳片，搭配直徑 10 mm 壓頭加壓治具。"
    };
    changed = true;
  }
  return changed;
});

// 2. SAND2017 (12 tests)
enrichFile('SAND2017.json', (test) => {
  if (!test.conditions) test.conditions = {};
  const isCell = test.test_objects?.includes('CELL') && !test.test_objects?.includes('PACK_SYSTEM');
  let changed = false;

  if (isCell) {
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "建議每條件 3 至 5 顆電芯",
        detail: "推薦測試矩陣建議電芯級濫用評估每項條件使用 3 至 5 顆樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "依測試需求調整至 100% 或 50% SOC",
        detail: "常溫下依標準程序充滿電 (100% SOC)，若評估運輸態則調整為 50% SOC。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "測試後監控 1 至 2 小時 (防範遲滯熱失控)",
        detail: "試驗步驟完成後持續記錄溫度、電壓與氣體釋放至少 1 小時至 2 小時以防範遲滯熱失控。"
      };
      changed = true;
    }
  } else {
    // Module or Pack/System
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "建議 1 至 2 組模組或電池包",
        detail: "模組或電池包級別濫用試驗建議使用 1 至 2 組代表性 DUT 進行驗證。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "依指定工作模式滿充至 100% SOC",
        detail: "依儲能系統規範在受控環境下充電至滿電態。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "持續監控至溫度冷卻並靜置至少 2 小時",
        detail: "持續監控外殼溫度與煙霧釋放直至溫度降至環境溫度，並持續觀察至少 2 小時。"
      };
      changed = true;
    }
  }

  // Apparatus supplements
  if (test.normalized_id === 'MECH-CRUSH' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "伺服控制液壓壓機與專用平/圓壓頭",
      detail: "配備精密位移與力量反饋之伺服液壓機，壓頭依電芯形狀選用平壓板或圓柱體。"
    };
    changed = true;
  }
  if (test.normalized_id === 'MECH-NAIL' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "直徑 3.175 mm 鎢鋼/淬火鋼針",
      detail: "直徑 3.175 mm (1/8 inch) 或更高硬度耐高溫鋼針，伺服穿刺驅動機構。"
    };
    changed = true;
  }
  return changed;
});

// 3. GB44240 (24 tests)
enrichFile('GB44240.json', (test) => {
  if (!test.conditions) test.conditions = {};
  const isCell = test.test_objects?.includes('CELL') && !test.test_objects?.includes('PACK_SYSTEM');
  let changed = false;

  if (isCell) {
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 5 顆電芯",
        detail: "按 4.3 規定，儲能電芯各項安全性能試驗每項需 5 顆樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "按 5.2 標準充電程序充滿電",
        detail: "在 25 ± 2 °C 下按製造商規定之標準充電程序充滿電，並靜置 1 小時。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "試驗結束後觀察 1 小時",
        detail: "試驗步驟完成後在環境溫度下持續監控樣品狀態 1 小時。"
      };
      changed = true;
    }
  } else {
    // Battery pack / system
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 1 組或 2 組代表性系統",
        detail: "電池組系統各項保護與安全試驗每項需 1 組或 2 組完整樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "按 5.3 規定充電至 100% SOC",
        detail: "在受控環境溫度下按製造商規定之方法充電至滿電狀態。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "試驗完成後觀察 1 小時 (熱擴散監控 2 小時)",
        detail: "試驗後靜置觀察 1 小時；熱擴散試驗需監控至少 2 小時。"
      };
      changed = true;
    }
  }

  // Apparatus supplements
  if (test.normalized_id === 'MECH-CRUSH' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "半徑 75 mm 半圓柱形鋼製壓板",
      detail: "使用半徑 75 mm 之半圓柱形鋼製壓頭，長度大於被測樣品尺寸。"
    };
    changed = true;
  }
  if (test.normalized_id === 'MECH-IMPACT' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "直徑 15.8 mm 鋼棒 與 9.1 kg 重錘",
      detail: "直徑 15.8 ± 0.1 mm 鋼棒橫置於電芯中心，9.1 ± 0.1 kg 重錘自 610 ± 25 mm 落下。"
    };
    changed = true;
  }
  return changed;
});

// 4. GBT36276 (19 tests)
enrichFile('GBT36276.json', (test) => {
  if (!test.conditions) test.conditions = {};
  const isCell = test.test_objects?.includes('CELL') && !test.test_objects?.includes('PACK_SYSTEM');
  let changed = false;

  if (isCell) {
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 5 顆電芯",
        detail: "電芯級安全性能試驗每項需 5 顆樣品（新鮮態或循環壽命態）。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "按 6.2 標稱方法充滿電 (100% SOC)",
        detail: "在 25 ± 2 °C 下按 6.2 規定方法完成預處理充電，並在環境中靜置 1 小時。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "試驗結束後觀察 1 小時",
        detail: "完成試驗程序後在環境溫度下觀察 1 小時。"
      };
      changed = true;
    }
  } else {
    // Battery module / pack / system
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 1 組或 2 組代表性模組",
        detail: "模組級測試每項需 1 組或 2 組完整代表性模組樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "依規定充電至 100% SOC",
        detail: "依模組技術條件充電至滿電狀態並靜置穩定。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "試驗結束後觀察 1 小時 (熱擴散監控 2 小時)",
        detail: "試驗後在室溫下靜置觀察 1 小時；熱失控擴展試驗需持續觀察至少 2 小時。"
      };
      changed = true;
    }
  }

  // Apparatus supplements
  if (test.normalized_id === 'MECH-CRUSH' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "半徑 75 mm 半圓柱鋼壓頭",
      detail: "半徑 75 mm 之半圓柱壓頭，長度大於被測樣品表面寬度。"
    };
    changed = true;
  }
  if (test.normalized_id === 'THERM-PROP' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "500W-1000W 平面加熱板 或 專用觸發裝置",
      detail: "加熱功率 500 W 至 1000 W 之加熱板或電芯內部微加熱觸發裝置。"
    };
    changed = true;
  }
  return changed;
});

// 5. UL1973 (21 tests)
enrichFile('UL1973.json', (test) => {
  if (!test.conditions) test.conditions = {};
  const isCell = test.test_objects?.includes('CELL') && !test.test_objects?.includes('PACK_SYSTEM');
  let changed = false;

  if (isCell) {
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 5 顆電芯 (新鮮態或循環態)",
        detail: "Annex E 單電池測試每項條件使用 5 顆新鮮態或循環後之代表性樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "常溫標準充電程序滿充",
        detail: "依製造商規格在室溫下依額定充電程序充滿電。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "殼溫回復至室溫 或 1 小時",
        detail: "持續觀察直到樣品外殼溫度冷卻至環境溫度或觀察至少 1 小時。"
      };
      changed = true;
    }
  } else {
    // Module or Pack / System
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "1 組代表性模組或電池系統",
        detail: "固定式儲能系統或模組測試需 1 組完整組裝之 DUT。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "依製造商規範 100% 滿充",
        detail: "依製造商說明書規範使用指定充電器滿充電至 100% SOC。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "冷卻至室溫 或 1 小時 (熱擴散需監控 2 小時)",
        detail: "試驗後監控外殼溫度至恢復室溫或至少觀察 1 小時；熱失控擴散耐受測試需持續監控 2 小時。"
      };
      changed = true;
    }
  }

  // Apparatus supplements
  if (test.normalized_id === 'MECH-CRUSH' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "半徑 75 mm 半圓柱壓頭 或 直徑 150 mm 平板",
      detail: "半徑 75 mm 之鋼製半圓柱壓板或直徑 150 mm 之平整鋼板。"
    };
    changed = true;
  }
  if (test.normalized_id === 'MECH-SHOCK' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "直徑 15.8 mm 鋼棒 與 9.1 kg 重錘",
      detail: "直徑 15.8 ± 0.1 mm 鋼棒橫置於樣品表面，9.1 ± 0.1 kg 重錘自 610 ± 25 mm 落下。"
    };
    changed = true;
  }
  return changed;
});

// 6. UL9540A (4 tests)
enrichFile('UL9540A.json', (test) => {
  if (!test.conditions) test.conditions = {};
  let changed = false;

  if (test.section === '7') {
    // Cell Level
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "至少 3 顆電芯",
        detail: "電芯級別熱失控判定與產氣特性評估需至少 3 顆代表性電芯。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "常溫 100% 滿充並靜置 1 小時",
        detail: "在 25 ± 5 °C 下依製造商指定充電程序充滿電至 100% SOC。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "熱事件平息後持續觀察 2 小時",
        detail: "熱失控觸發後持續監測溫度、壓力與產氣，直至所有熱偶冷卻至室溫並持續觀察至少 2 小時。"
      };
      changed = true;
    }
    if (!test.conditions.apparatus) {
      test.conditions.apparatus = {
        value: "密封測試艙 (Gas Collection Vessel) 與加熱器",
        detail: "專用耐壓密封艙、薄膜加熱器 (Film heater)、氣體收集閥組與 FTIR 氣體成分分析儀。"
      };
      changed = true;
    }
  } else if (test.section === '8') {
    // Module Level
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "至少 1 組代表性模組",
        detail: "模組級熱傳播測試需至少 1 組包含觸發電芯與周邊受測電芯之完整模組。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "依規範滿充電至 100% SOC",
        detail: "在室溫下將模組充滿電並安裝熱電偶陣列與約束夾具。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "熱失控結束後觀察 2 小時 (防範復燃)",
        detail: "觸發熱失控後持續記錄各電芯溫度至所有熱偶溫度下降至室溫以下，並持續觀察至少 2 小時。"
      };
      changed = true;
    }
    if (!test.conditions.apparatus) {
      test.conditions.apparatus = {
        value: "電芯加熱器/過充引發裝置 與 熱電偶陣列",
        detail: "薄膜電阻加熱器 (Film heater)、多通道熱電偶採集儀與排煙採樣管道。"
      };
      changed = true;
    }
  } else if (test.section === '9') {
    // Unit Level
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "至少 1 台儲能單元機櫃 (Unit BESS)",
        detail: "單元級火災傳播測試需 1 台完整儲能單元機櫃 (內含所有模組與通風/防火隔板)。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "全單元滿充電至 100% SOC",
        detail: "將單元內所有電池模組充滿電至 100% SOC，閉合所有門板並啟用消防/排煙通訊。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "火災平息後持續監控 2 小時",
        detail: "燃燒或熱事件完全終止後持續監測溫度與可燃氣體濃度至少 2 小時。"
      };
      changed = true;
    }
    if (!test.conditions.apparatus) {
      test.conditions.apparatus = {
        value: "量熱集煙罩、熱通量計與引風管道",
        detail: "耗氧量熱儀 (Oxygen consumption calorimeter)、集煙罩、輻射熱通量計陣列及氣體採樣探頭。"
      };
      changed = true;
    }
  } else if (test.section === '10') {
    // Installation Level
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "代表性多單元安裝陣列",
        detail: "依製造商現場規格佈設代表性多機櫃陣列（含間距、模擬牆面與滅火系統）。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "全陣列單元滿充電至 100% SOC",
        detail: "目標機櫃與周圍相鄰儲能機櫃全部充滿電至 100% SOC。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "滅火系統動作並監控至常溫 (至少 2 小時)",
        detail: "滅火抑制系統動作後持續監控陣列溫度至冷卻，並持續觀察至少 2 小時以防二次復燃。"
      };
      changed = true;
    }
    if (!test.conditions.apparatus) {
      test.conditions.apparatus = {
        value: "模擬安裝室、自動噴淋/氣體滅火系統與熱通量計",
        detail: "符合 NFPA 855 / UL 9540A 規格之模擬室內安裝試驗艙、滅火水噴淋或氣體滅火裝置。"
      };
      changed = true;
    }
  }
  return changed;
});

console.log("Batch B enrichment script execution complete!");
