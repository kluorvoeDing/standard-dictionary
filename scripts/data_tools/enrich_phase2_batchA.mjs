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
  console.log(`[Batch A Enriched] ${filename}: ${modifiedCount} tests enriched.`);
}

// 1. AIS-038 (11 tests)
enrichFile('AIS-038.json', (test) => {
  if (!test.conditions) test.conditions = {};
  let changed = false;

  if (!test.conditions.sample_quantity) {
    test.conditions.sample_quantity = {
      value: "1 組 REESS",
      detail: "各項車輛 REESS 濫用試驗需 1 組完整代表性待測樣品。"
    };
    changed = true;
  }
  if (!test.conditions.pre_conditioning) {
    test.conditions.pre_conditioning = {
      value: "依附錄 2 調整至 50% 或 100% SOC",
      detail: "測試開始前，SOC 應依 Annexure IX, Appendix 2 規定調整至對應數值。"
    };
    changed = true;
  }
  if (!test.conditions.observation_period) {
    test.conditions.observation_period = {
      value: "測試後在環境溫度下觀察 1 小時",
      detail: "試驗步驟完成後，在試驗環境溫度下持續監控樣品至少 1 小時。"
    };
    changed = true;
  }
  return changed;
});

// 2. ULC2580 (29 tests)
enrichFile('ULC2580.json', (test) => {
  if (!test.conditions) test.conditions = {};
  const isCell = test.test_objects?.includes('CELL') && !test.test_objects?.includes('PACK_SYSTEM');
  let changed = false;

  if (isCell) {
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每組 5 顆電芯",
        detail: "電芯級別測試依表 14.1 規定，每項條件使用 5 顆樣品（新鮮態或循環態）。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "常溫標準充放電確認容量後滿充",
        detail: "依製造商規定之標準充電程序充滿電。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "外殼溫度恢復室溫 或 1 小時",
        detail: "持續觀察至電芯外殼溫度冷卻至室溫或至少觀察 1 小時。"
      };
      changed = true;
    }
  } else {
    // Module or Pack / System
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "1 組代表性模組或電池包",
        detail: "電池包或系統級測試需 1 組完整代表性 DUT。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "依試驗要求調整至 100% 或特定 SOC",
        detail: "依各測試章節要求調整初始荷電狀態。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "測試完成後觀察 1 小時 (熱失控監控 2 小時)",
        detail: "試驗結束後外殼冷卻並在環境中觀察至少 1 小時；熱擴散試驗需監控 2 小時。"
      };
      changed = true;
    }
    if (test.normalized_id === 'MECH-CRUSH' && !test.conditions.apparatus) {
      test.conditions.apparatus = {
        value: "半徑 75 mm 半圓柱壓頭 或 直徑 150 mm 平板",
        detail: "依樣品尺寸選用半徑 75 mm 之圓柱壓頭或平整鋼製壓板。"
      };
      changed = true;
    }
  }
  return changed;
});

// 3. IEC62660-3 (8 tests)
enrichFile('IEC62660-3.json', (test) => {
  if (!test.conditions) test.conditions = {};
  let changed = false;

  if (!test.conditions.sample_quantity) {
    test.conditions.sample_quantity = {
      value: "每項測試 3 顆電芯",
      detail: "各項安全測試使用 3 顆依 6.1 條款充滿電之二次鋰電芯。"
    };
    changed = true;
  }
  if (!test.conditions.pre_conditioning) {
    test.conditions.pre_conditioning = {
      value: "依製造商規定方法 100% 充滿電",
      detail: "在 25 ± 5 °C 下依製造商指定方法進行標準充電，並靜置 1 小時。"
    };
    changed = true;
  }
  if (!test.conditions.observation_period) {
    test.conditions.observation_period = {
      value: "測試完成後觀察 1 小時",
      detail: "試驗結束後在試驗環境溫度下持續監控 1 小時以確認無延遲起火。"
    };
    changed = true;
  }
  if (test.section === '6.2.2' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "半徑 75 mm 半圓柱鋼製壓頭",
      detail: "使用半徑 75 mm 之半圓柱形鋼製壓頭，長度大於被測電芯寬度。"
    };
    changed = true;
  }
  if (test.section === '6.4.4' && !test.conditions.apparatus) {
    test.conditions.apparatus = {
      value: "附錄 C 替代直角 L 型鎳片 (0.2 × 0.1 × 1.0 mm)",
      detail: "高 0.2 mm、寬 0.1 mm、每邊長 1.0 mm 之微型 L 型鎳片，放置於隔膜與電極間引發內短路。"
    };
    changed = true;
  }
  return changed;
});

// 4. AIS-156 (10 tests)
enrichFile('AIS-156.json', (test) => {
  if (!test.conditions) test.conditions = {};
  let changed = false;

  if (!test.conditions.sample_quantity) {
    test.conditions.sample_quantity = {
      value: "1 組輕型電動車 REESS",
      detail: "各項濫用測試需 1 組完整代表性二輪/三輪車輛牽引電池組。"
    };
    changed = true;
  }
  if (!test.conditions.pre_conditioning) {
    test.conditions.pre_conditioning = {
      value: "依 Appendix 2 調整至 100% SOC",
      detail: "在環境溫度下進行標準充電至 100% 滿充狀態。"
    };
    changed = true;
  }
  if (!test.conditions.observation_period) {
    test.conditions.observation_period = {
      value: "測試後在環境溫度下觀察 1 小時",
      detail: "測試結束後外觀檢查並持續觀察 1 小時。"
    };
    changed = true;
  }
  return changed;
});

// 5. GB40559 (30 tests)
enrichFile('GB40559.json', (test) => {
  if (!test.conditions) test.conditions = {};
  const isCell = test.test_objects?.includes('CELL') && !test.test_objects?.includes('PACK_SYSTEM');
  let changed = false;

  if (isCell) {
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 5 顆電芯",
        detail: "平衡車與滑板車鋰電池型式檢驗中，電芯級試驗每項需 5 顆樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "按 4.5 規定的充電方法滿充",
        detail: "在 20 ± 5 °C 環境下按製造商規定之方法充滿電。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "試驗完成後觀察 1 小時",
        detail: "完成試驗步驟後在環境中靜置觀察 1 小時。"
      };
      changed = true;
    }
  } else {
    // Battery pack
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 3 組電池組",
        detail: "電池組級別測試每項通常需 3 組完整樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "依條款規定滿充或放電態",
        detail: "依照各具體安全保護試驗章節要求調整初始狀態。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "試驗完成後觀察 1 小時 (浸水後靜置 24 小時)",
        detail: "試驗後靜置觀察 1 小時；浸水試驗後需在乾燥環境靜置 24 小時。"
      };
      changed = true;
    }
    if (test.normalized_id === 'MECH-DROP' && !test.conditions.apparatus) {
      test.conditions.apparatus = {
        value: "厚度 20 mm 硬木板平鋪於水泥地面",
        detail: "跌落表面為鋪設在平整混凝土基座上的厚度 20 mm 硬質木板。"
      };
      changed = true;
    }
  }
  return changed;
});

// 6. GB47741 (37 tests)
enrichFile('GB47741.json', (test) => {
  if (!test.conditions) test.conditions = {};
  const isCell = test.test_objects?.includes('CELL') && !test.test_objects?.includes('PACK_SYSTEM');
  let changed = false;

  if (isCell) {
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 5 顆電芯",
        detail: "電動輪椅用電芯試驗每組需 5 顆樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "按標準充電程序充滿電",
        detail: "室溫下依規定充電程序滿充並靜置穩定。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "試驗完成後觀察 1 小時",
        detail: "試驗結束後在環境溫度下觀察 1 小時。"
      };
      changed = true;
    }
  } else {
    // Battery system
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 3 組電池系統",
        detail: "輪椅電池系統試驗每項需 3 組完整樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "依規範滿充或設定特定 SOC",
        detail: "試驗前確保電池系統處於製造商指定工作狀態。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "試驗結束後觀察 1 小時",
        detail: "在環境溫度下持續監控 1 小時。"
      };
      changed = true;
    }
  }
  return changed;
});

// 7. UL2271 (23 tests)
enrichFile('UL2271.json', (test) => {
  if (!test.conditions) test.conditions = {};
  const isCell = test.test_objects?.includes('CELL') && !test.test_objects?.includes('PACK_SYSTEM');
  let changed = false;

  if (isCell) {
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "每項 5 顆電芯",
        detail: "電芯層級試驗每項使用 5 顆樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "室溫標準充放電確認容量後滿充",
        detail: "在製造商指定之充電規格下滿充。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "外殼溫度恢復室溫 或 1 小時",
        detail: "持續觀察直到樣品冷卻至環境溫度或至少觀察 1 小時。"
      };
      changed = true;
    }
  } else {
    // Pack / Module / System
    if (!test.conditions.sample_quantity) {
      test.conditions.sample_quantity = {
        value: "1 組代表性 DUT",
        detail: "輕型車電池組測試需 1 組完整組裝之樣品。"
      };
      changed = true;
    }
    if (!test.conditions.pre_conditioning) {
      test.conditions.pre_conditioning = {
        value: "依製造商規定滿充並靜置",
        detail: "在 20 ± 5 °C 下依製造商指定方法進行充電。"
      };
      changed = true;
    }
    if (!test.conditions.observation_period) {
      test.conditions.observation_period = {
        value: "外殼溫度恢復室溫 或 1 小時",
        detail: "試驗後持續監控外殼溫度至恢復室溫。"
      };
      changed = true;
    }
    if (test.normalized_id === 'MECH-CRUSH' && !test.conditions.apparatus) {
      test.conditions.apparatus = {
        value: "半徑 75 mm 半圓柱鋼製壓頭",
        detail: "平滑半圓柱鋼製壓板，長度足以覆蓋整個被測表面。"
      };
      changed = true;
    }
  }
  return changed;
});

console.log("Batch A enrichment script execution complete!");
