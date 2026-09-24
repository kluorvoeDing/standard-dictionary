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
  console.log(`[Batch C Enriched] ${filename}: ${modifiedCount} tests enriched.`);
}

// 1. GB43854 (23 tests)
enrichFile('GB43854.json', (test) => {
  if (!test.conditions) test.conditions = {};
  const isCell = test.test_objects?.includes('CELL') && !test.test_objects?.includes('PACK_SYSTEM');
  let changed = false;

  if (isCell) {
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 5 顆電芯",
        detail: "電動自行車用電芯依 6.1 樣品規定，各項安全試驗每項需 5 顆樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "按 6.2 規定程序充滿電",
        detail: "在 25 ± 2 °C 下按製造商指定充電程序充滿電至 100% SOC，靜置 1 小時。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "試驗結束後觀察 1 小時",
        detail: "試驗完成後在環境溫度下持續監控樣品狀態 1 小時。"
      };
      changed = true;
    }
  } else {
    // Battery pack / system
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 3 組代表性電池組",
        detail: "電池組級別安全試驗每項需 3 組完整樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "依規定充電至 100% SOC",
        detail: "依照製造商說明書充電規格充至滿電狀態。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "試驗結束後觀察 1 小時 (熱擴散監控 2 小時)",
        detail: "試驗後靜置觀察 1 小時；熱擴散試驗需持續監控 2 小時；浸水試驗後乾燥靜置 24 小時。"
      };
      changed = true;
    }
  }

  // Apparatus
  if (test.normalized_id === 'MECH-NAIL' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "直徑 5-8 mm 耐高溫鋼針",
      detail: "直徑 5 mm 至 8 mm 耐高溫鎢鋼針，頂端圓錐角 45° 至 60°，貫穿速度 25 ± 5 mm/s。"
    };
    changed = true;
  }
  if (test.normalized_id === 'MECH-CRUSH' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "半徑 75 mm 半圓柱形鋼製壓板",
      detail: "半徑 75 mm 半圓柱壓頭，長度大於被測樣品表面寬度。"
    };
    changed = true;
  }
  return changed;
});

// 2. GB40165 (23 tests)
enrichFile('GB40165.json', (test) => {
  if (!test.conditions) test.conditions = {};
  const isCell = test.test_objects?.includes('CELL') && !test.test_objects?.includes('PACK_SYSTEM');
  let changed = false;

  if (isCell) {
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 5 顆電芯",
        detail: "固定式電子設備用電芯安全試驗每項需 5 顆樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "按 4.5 規定的充電方法滿充",
        detail: "在 20 ± 5 °C 下依規定程序充滿電並靜置 1 小時。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "試驗結束後觀察 1 小時",
        detail: "試驗完成後在環境溫度下觀察 1 小時。"
      };
      changed = true;
    }
  } else {
    // Battery pack
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 3 組電池組",
        detail: "電池組級別各項安全試驗每項需 3 組完整樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "按規定方法充滿電至 100% SOC",
        detail: "在製造商指定工作條件下充至滿電狀態。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "試驗結束後觀察 1 小時",
        detail: "在環境溫度下靜置觀察 1 小時。"
      };
      changed = true;
    }
  }

  // Apparatus
  if (test.normalized_id === 'MECH-CRUSH' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "半徑 75 mm 半圓柱壓頭 或 平板",
      detail: "半徑 75 mm 之圓柱壓板或平整鋼壓板，液壓平穩施壓。"
    };
    changed = true;
  }
  if (test.normalized_id === 'MECH-IMPACT' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "直徑 15.8 mm 鋼棒 與 9.1 kg 重錘",
      detail: "直徑 15.8 ± 0.1 mm 鋼棒橫置於樣品表面，9.1 ± 0.1 kg 重錘自 610 ± 25 mm 自由落下。"
    };
    changed = true;
  }
  return changed;
});

// 3. GB31241.4 (28 tests)
enrichFile('GB31241.4.json', (test) => {
  if (!test.conditions) test.conditions = {};
  const isCell = test.test_objects?.includes('CELL') && !test.test_objects?.includes('PACK_SYSTEM');
  let changed = false;

  if (isCell) {
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 5 顆電芯",
        detail: "玩具用電芯試驗每項條件需 5 顆樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "按 4.5 規定之充電方法充滿電",
        detail: "在 20 ± 5 °C 下依規定程序充滿電並靜置 1 小時。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "試驗完成後觀察 1 小時",
        detail: "試驗完成後在環境溫度下靜置觀察 1 小時。"
      };
      changed = true;
    }
  } else {
    // Battery pack
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 3 組電池組",
        detail: "玩具用電池組試驗每項需 3 組完整樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "依條款規定滿充至 100% SOC",
        detail: "依製造商說明書規定方法充滿電。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "試驗完成後觀察 1 小時",
        detail: "在環境溫度下持續觀察 1 小時以確認無異常發熱與起火。"
      };
      changed = true;
    }
  }

  // Apparatus
  if (test.normalized_id === 'MECH-DROP' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "混凝土基座上鋪設 4 mm 鋼板 或 硬木板",
      detail: "混凝土平整地面上鋪設 4 mm 鋼板（模擬玩具硬質衝擊面）或 20 mm 硬木板。"
    };
    changed = true;
  }
  return changed;
});

// 4. GB47372 (16 tests)
enrichFile('GB47372.json', (test) => {
  if (!test.conditions) test.conditions = {};
  let changed = false;

  if (!test.conditions.sample_quantity) {
    test.conditions.sample_quantity = {
      value: "每項 3 組完整移動電源",
      detail: "移動電源整機各項安全試驗每項需 3 組完整代表性 DUT。"
    };
    changed = true;
  }
  if (!test.conditions.pre_conditioning) {
    test.conditions.pre_conditioning = {
      value: "以額定輸入規格充滿電 (100% SOC)",
      detail: "按製造商標稱輸入功率充電至滿電並靜置穩定 1 小時。"
    };
    changed = true;
  }
  if (!test.conditions.observation_period) {
    test.conditions.observation_period = {
      value: "試驗結束後觀察 1 小時",
      detail: "試驗完成後在環境溫度下持續監控樣品外殼溫度與外觀 1 小時。"
    };
    changed = true;
  }

  // Apparatus
  if (test.normalized_id === 'ELEC-SC-EXT' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "負載電阻 ≤ 5 mΩ 之電子開關迴路",
      detail: "外接總電阻小於等於 5 mΩ 之高壓大電流接觸器或專用電子短路負載。"
    };
    changed = true;
  }
  if (test.normalized_id === 'MECH-DROP' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "混凝土地面鋪設 18 mm 硬木板",
      detail: "混凝土基座上鋪設厚度 18 mm 至 20 mm 之平整硬質木板。"
    };
    changed = true;
  }
  return changed;
});

// 5. JISC8714 (7 tests)
enrichFile('JISC8714.json', (test) => {
  if (!test.conditions) test.conditions = {};
  const isCell = test.test_objects?.includes('CELL') && !test.test_objects?.includes('PACK_SYSTEM');
  let changed = false;

  if (isCell) {
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 5 顆電芯 (新鮮態或循環態)",
        detail: "各項電芯安全試驗使用 5 顆新鮮態或高溫循環後樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "依 4.1 條款在規定溫度下滿充電",
        detail: "依製造商規格在室溫 (20 ± 5 °C) 或高溫上限下充滿電至 100% SOC，靜置 1-4 小時。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "試驗結束後觀察 1 小時",
        detail: "試驗完成後在環境溫度下觀察 1 小時以確認無起火或爆炸。"
      };
      changed = true;
    }
  } else {
    // Pack / System
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 3 組電池組",
        detail: "電池組級別測試每項使用 3 組完整樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "依標準充電程序充滿電至 100% SOC",
        detail: "在常溫下以標準充電方式充滿電。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "試驗結束後觀察 1 小時",
        detail: "在環境溫度下靜置觀察 1 小時。"
      };
      changed = true;
    }
  }

  // Apparatus
  if (test.normalized_id === 'ELEC-SC-INT' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "直徑 10 mm 壓頭 與 微型小鎳片",
      detail: "直徑 10 mm 壓頭加壓治具，內置高 0.2 mm、寬 0.1 mm、長 1.0 mm L 型微小鎳片。"
    };
    changed = true;
  }
  if (test.normalized_id === 'MECH-CRUSH' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "直徑 150 mm 平面鋼製壓板",
      detail: "直徑 150 mm 之平整鋼板，以液壓平穩加壓至 13 kN。"
    };
    changed = true;
  }
  return changed;
});

// 6. UL2054 (14 tests)
enrichFile('UL2054.json', (test) => {
  if (!test.conditions) test.conditions = {};
  const isCell = test.test_objects?.includes('CELL') && !test.test_objects?.includes('PACK_SYSTEM');
  let changed = false;

  if (isCell) {
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每條件 5 顆電芯 (共 10 顆)",
        detail: "每項測試需 5 顆新鮮態與 5 顆循環老化後電芯，共 10 顆樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "室溫標準充滿電 (100% SOC)",
        detail: "在 20 ± 5 °C 下按製造商規格充滿電並靜置平衡。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "殼溫回復至室溫 或 6 小時",
        detail: "持續觀察直到外殼溫度冷卻至環境溫度，並持續觀察至少 6 小時。"
      };
      changed = true;
    }
  } else {
    // Pack / System
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每條件 5 組電池組 (新鮮與循環各 5 組)",
        detail: "電池包測試每項使用 5 組新鮮態與 5 組循環後樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "依製造商規範 100% 滿充",
        detail: "依指定充電器規格充電至 100% SOC。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "殼溫回復至室溫 或 6 小時",
        detail: "試驗後持續監控至樣品溫度恢復室溫或觀察至少 6 小時。"
      };
      changed = true;
    }
  }

  // Apparatus
  if (test.normalized_id === 'ELEC-SC-EXT' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "80 ± 20 mΩ 外部短路迴路",
      detail: "由銅導線與開關組成之負載電路，總電阻值為 80 ± 20 mΩ。"
    };
    changed = true;
  }
  if (test.normalized_id === 'MECH-CRUSH' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "直徑 150 mm 平面鋼壓板",
      detail: "平整平行的鋼製壓板，加壓液壓活塞行程可控，施壓至 13 ± 0.78 kN。"
    };
    changed = true;
  }
  return changed;
});

// 7. UL2056 (12 tests)
enrichFile('UL2056.json', (test) => {
  if (!test.conditions) test.conditions = {};
  const isCell = test.test_objects?.includes('CELL') && !test.test_objects?.includes('PACK_SYSTEM');
  let changed = false;

  if (isCell) {
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 5 顆電芯",
        detail: "電芯強制放電等單元試驗每項需 5 顆樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "按規格完全放電",
        detail: "以製造商額定放電電流放電至截止電壓。"
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
    // Power Bank Pack / System
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 3 至 5 組移動電源",
        detail: "移動電源整機各項濫用試驗每項需 3 至 5 組代表性 DUT。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "以最大額定規格充滿電 (100% SOC)",
        detail: "使用製造商指定充電參數滿充並靜置穩定。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "外殼冷卻至室溫 或 1 小時",
        detail: "試驗結束後在環境溫度下觀察至少 1 小時以確認無異常與復燃。"
      };
      changed = true;
    }
  }

  // Apparatus
  if (test.normalized_id === 'ELEC-SC-EXT' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "負載電阻 < 20 mΩ 之大電流開關",
      detail: "低阻抗開關迴路，外接導線與接觸電阻總和小於 20 mΩ。"
    };
    changed = true;
  }
  if (test.normalized_id === 'MECH-DROP' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "混凝土地面鋪設 20 mm 硬木板",
      detail: "混凝土基座上鋪設平整厚度 20 mm 之硬木板。"
    };
    changed = true;
  }
  return changed;
});

// 8. UL9540 (12 tests)
enrichFile('UL9540.json', (test) => {
  if (!test.conditions) test.conditions = {};
  let changed = false;

  if (!test.conditions.sample_quantity) {
    test.conditions.sample_quantity = {
      value: "1 組代表性儲能系統 (BESS DUT)",
      detail: "儲能系統設備各項電氣、機械與環境耐受測試需 1 組完整系統樣品。"
    };
    changed = true;
  }
  if (!test.conditions.pre_conditioning) {
    test.conditions.pre_conditioning = {
      value: "安裝於額定工況並滿充電至 100% SOC",
      detail: "依系統安裝手冊完成全部接線與接地，並充電至 100% SOC。"
    };
    changed = true;
  }
  if (!test.conditions.observation_period) {
    test.conditions.observation_period = {
      value: "試驗完成後持續觀察 2 小時",
      detail: "試驗結束後持續監控外殼溫度、絕緣與電氣狀態至少 2 小時。"
    };
    changed = true;
  }

  // Apparatus
  if (test.normalized_id === 'ELEC-IR' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "耐壓測試儀 (Hipot) 與 兆歐表",
      detail: "高壓絕緣電阻測試儀 (Megohmmeter) 與工頻/直流耐壓測試儀 (Dielectric Voltage Withstand Tester)。"
    };
    changed = true;
  }
  return changed;
});

// 9. UL3030 (17 tests)
enrichFile('UL3030.json', (test) => {
  if (!test.conditions) test.conditions = {};
  let changed = false;

  if (!test.conditions.sample_quantity) {
    test.conditions.sample_quantity = {
      value: "1 至 3 組無人機或飛行電氣系統",
      detail: "無人機系統各項電氣故障、零件失效與熱試驗需 1 至 3 組代表性 DUT。"
    };
    changed = true;
  }
  if (!test.conditions.pre_conditioning) {
    test.conditions.pre_conditioning = {
      value: "依飛行前程序充滿電至 100% SOC",
      detail: "依操作手冊規定充電至 100% 滿充電狀態並確認飛行控制系統自檢完成。"
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

  // Apparatus
  if (test.normalized_id === 'MECH-DROP' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "硬木板平鋪於水泥地面衝擊台",
      detail: "混凝土平整地面上鋪設 20 mm 硬木板，以規定飛行姿態釋放跌落。"
    };
    changed = true;
  }
  return changed;
});

// 10. UL2743 (3 tests)
enrichFile('UL2743.json', (test) => {
  if (!test.conditions) test.conditions = {};
  let changed = false;

  if (!test.conditions.sample_quantity) {
    test.conditions.sample_quantity = {
      value: "每項 3 組代表性電源包",
      detail: "可攜式應急電源包測試每項需 3 組完整樣品。"
    };
    changed = true;
  }
  if (!test.conditions.pre_conditioning) {
    test.conditions.pre_conditioning = {
      value: "以額定規格充滿電 (100% SOC) 並靜置",
      detail: "依製造商說明書規範使用指定充電器滿充電至 100% SOC，靜置 1 小時。"
    };
    changed = true;
  }
  if (!test.conditions.observation_period) {
    test.conditions.observation_period = {
      value: "外殼溫度恢復室溫 或 1 小時",
      detail: "測試結束後在環境溫度下持續監控外殼溫度至恢復室溫或至少觀察 1 小時。"
    };
    changed = true;
  }

  // Apparatus
  if (test.normalized_id === 'ELEC-SC-EXT' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "負載電阻 < 20 mΩ 之大電流開關迴路",
      detail: "外接總電阻小於 20 mΩ 之開關負載迴路。"
    };
    changed = true;
  }
  if (test.normalized_id === 'MECH-DROP' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "平整混凝土地面上鋪設硬木板",
      detail: "平整水泥基座上鋪設 20 mm 厚硬質木板，自 1 m 高度跌落。"
    };
    changed = true;
  }
  return changed;
});

// 11. UL1642-2022 (12 tests)
enrichFile('UL1642-2022.json', (test) => {
  if (!test.conditions) test.conditions = {};
  let changed = false;

  if (!test.conditions.sample_quantity) {
    test.conditions.sample_quantity = {
      value: "每組 5 顆 (新鮮態 5 顆 + 循環態 5 顆)",
      detail: "每項試驗條件需 5 顆新鮮態與 5 顆循環老化後電芯（室溫與 55 °C 試驗共 20 顆）。"
    };
    changed = true;
  }
  if (!test.conditions.pre_conditioning) {
    test.conditions.pre_conditioning = {
      value: "室溫標準充滿電 (100% SOC)",
      detail: "在 20 ± 5 °C 下按製造商規格充滿電並靜置穩定。"
    };
    changed = true;
  }
  if (!test.conditions.observation_period) {
    test.conditions.observation_period = {
      value: "殼溫回復至室溫 或 6 小時",
      detail: "持續觀察直到樣品外殼溫度冷卻至環境溫度，並持續觀察至少 6 小時。"
    };
    changed = true;
  }

  // Apparatus
  if (test.normalized_id === 'ELEC-SC-EXT' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "80 ± 20 mΩ 外部電阻迴路",
      detail: "總電阻為 80 ± 20 mΩ 之負載迴路，連接電芯正負極終端。"
    };
    changed = true;
  }
  if (test.normalized_id === 'MECH-CRUSH' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "直徑 150 mm 平面鋼壓板",
      detail: "平整平行之直徑 150 mm 鋼製壓板，平穩施壓至 13 ± 0.78 kN。"
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
  if (test.normalized_id === 'THERM-FIRE' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "8 面八角形金屬絲網罩 與 本生燈",
      detail: "每面寬 610 mm、高 305 mm 八面網罩（直徑 0.25 mm 鋼絲，20 目/inch），中心配置本生燈。"
    };
    changed = true;
  }
  return changed;
});

console.log("Batch C enrichment script execution complete!");
