import { applyStandardHarmonization } from './harmonize_std.mjs';

function getUl9540Updates() {
  return {
    'UL9540-30': {
      operation: {
        value: '最大負載充放電循環（至少 2 次循環）',
        detail: '系統按製造商規格在最大負載下進行正常充放電循環測試（至少 2 次循環）。'
      },
      thermal_equilibrium: {
        value: '±2 °C (連續 3 次測量)',
        detail: '以至少 15 分鐘或 10% 已流逝測試時間（取大者）為間隔，連續 3 次測量的溫度變化在 ±2 °C 內。'
      }
    },
    'UL9540-32': {
      voltage: {
        value: '依 UL 62368-1 決定',
        detail: '參考 UL 62368-1 / CSA C22.2 No. 62368-1 決定耐受電壓於危險電壓電路與非載流導電部件之間。'
      },
      duration: {
        value: '1 分鐘（生產測試可減至 1 秒）',
        detail: '持續施加 1 分鐘（生產測試可減至 1 秒）。'
      },
      apparatus: {
        value: '耐壓測試儀 (Hipot) 與 兆歐表（變壓器容量 ≥ 500 VA）',
        detail: '高壓絕緣電阻測試儀 (Megohmmeter) 與工頻/直流耐壓測試儀 (Dielectric Voltage Withstand Tester)。變壓器容量應 ≥ 500 VA。'
      }
    },
    'UL9540-33': {
      waveform: {
        value: '1.2/50 µs 衝擊電壓波形',
        detail: '施加 1.2/50 µs 衝擊電壓波形（模擬浪湧）。'
      },
      count: {
        value: '正負極各 3 至 5 次',
        detail: '正負極各施加 3 次脈衝。對於超過 1000 V 的電路，正負極各施加 5 次脈衝。'
      },
      duration: {
        value: '脈衝間隔 ≥ 1 秒',
        detail: '脈衝之間的間隔應大於或等於 1 秒。'
      },
      apparatus: {
        value: '耐壓測試儀 (Hipot) 與 兆歐表',
        detail: '高壓絕緣電阻測試儀 (Megohmmeter) 與工頻/直流耐壓測試儀 (Dielectric Voltage Withstand Tester)。'
      }
    },
    'UL9540-34': {
      measurement: {
        value: '接地端子與待接地金屬零件間（或任意兩點間）阻抗',
        detail: '測量接地端子與待接地金屬零件間（或任意兩點之間）的阻抗。'
      },
      current: {
        value: '依據 4 種方法之一（阻抗計、10 A、UL 62368-1 或 IEC 60364-4-41）',
        detail: '允許使用四種方法之一：阻抗計、10A (NFPA 79)、依據 UL 62368-1 保護額定電流、或 IEC 60364-4-41。'
      },
      apparatus: {
        value: '接地阻抗測試儀',
        detail: '接地阻抗測試儀器。'
      }
    },
    'UL9540-35': {
      voltage: {
        value: '500 Vdc',
        detail: '施加 500 Vdc 電壓測量危險電壓電路與可接觸導電部件之間的絕緣電阻。'
      },
      duration: {
        value: '1 分鐘',
        detail: '施加時間 1 分鐘。'
      },
      apparatus: {
        value: '耐壓測試儀 (Hipot) 與 兆歐表',
        detail: '高壓絕緣電阻測試儀 (Megohmmeter) 與工頻/直流耐壓測試儀 (Dielectric Voltage Withstand Tester)。'
      }
    },
    'UL9540-40.1': {
      test_type: {
        value: '吊裝與固定應力測試',
        detail: '施加 3 倍系統重量的力，持續 1 分鐘。'
      },
      force: {
        value: '3 倍系統重量',
        detail: '施加 3 倍系統重量的力。'
      },
      duration: {
        value: '1 分鐘',
        detail: '持續 1 分鐘。'
      }
    },
    'UL9540-40.2': {
      soc: {
        value: '完全充電',
        detail: '測試樣品 (DUT) 應處於完全充電狀態 (Fully charged)。'
      },
      impact_mass: {
        value: '535 g 鋼球',
        detail: '使用 535 g 鋼球。'
      },
      drop_height: {
        value: '1.29 m',
        detail: '從 1.29 m 高度跌落。'
      },
      impact_energy: {
        value: '6.8 J',
        detail: '產生 6.8 J 的衝擊能量。'
      },
      impact_count: {
        value: '至少 3 次',
        detail: '對外殼進行至少 3 次衝擊。'
      }
    },
    'UL9540-40.3': {
      soc: {
        value: '完全充電',
        detail: '測試樣品 (DUT) 應處於完全充電狀態 (Fully charged)。'
      },
      test_type: {
        value: '穩態擠壓應力測試',
        detail: '施加 250 N ± 10 N 的穩態力，施加平面的直徑必須為 30 mm。'
      },
      force: {
        value: '250 ± 10 N',
        detail: '施加 250 N ± 10 N 的穩態力。'
      },
      duration: {
        value: '5 秒',
        detail: '持續 5 秒。'
      },
      apparatus: {
        value: '直徑 30 mm 平面工具',
        detail: '施加平面的直徑必須為 30 mm。'
      }
    },
    'UL9540-40.4': {
      soc: {
        value: '完全放電',
        detail: '測試樣品 (DUT) 應處於完全放電狀態 (Fully discharged)。'
      },
      temperature: {
        value: '70 °C 或最高運行溫度 +10 °C',
        detail: '在 70 °C 或正常運行最高溫度加 10 °C 的環境中進行。'
      },
      duration: {
        value: '7 小時',
        detail: '持續 7 小時。'
      }
    },
    'UL9540-38': {
      test_type: {
        value: '含流體部件工作壓力洩漏測試',
        detail: '對含流體部件施加 1.5 倍最大運行壓力（液體測試）或 1.1 倍最大運行壓力（氣體測試）。'
      },
      force: {
        value: '1.5 倍最大運行壓力 (液體) / 1.1 倍最大運行壓力 (氣體)',
        detail: '對含流體部件施加 1.5 倍最大運行壓力（液體測試）或 1.1 倍最大運行壓力（氣體測試）。'
      }
    },
    'UL9540-39': {
      test_type: {
        value: '耐壓強度測試 (1 分鐘)',
        detail: '液壓強度測試施加 1.5 倍設計壓力（1 分鐘）；氣壓強度測試施加 1.3 倍設計壓力（1 分鐘）。'
      },
      force: {
        value: '1.5 倍設計壓力 (液壓) / 1.3 倍設計壓力 (氣壓)',
        detail: '液壓強度測試施加 1.5 倍設計壓力（1 分鐘）；氣壓強度測試施加 1.3 倍設計壓力（1 分鐘）。'
      },
      duration: {
        value: '1 分鐘',
        detail: '持續 1 分鐘。'
      }
    },
    'UL9540-26.2': {
      trigger: {
        value: '單元容量超限（住宅 > 20 kWh / 非住宅 > 50 kWh）或間距減小/室內安裝',
        detail: '當單元容量超過 20 kWh（住宅）或 50 kWh（非住宅），或間距減小、室內安裝時，必須執行 UL 9540A 測試以驗證火災蔓延特性。'
      },
      method: {
        value: '執行 UL 9540A 測試驗證火災蔓延特性',
        detail: '必須執行 UL 9540A 測試以驗證火災蔓延特性。'
      }
    }
  };
}

applyStandardHarmonization('UL9540', getUl9540Updates());
