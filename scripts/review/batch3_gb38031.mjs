import { applyStandardHarmonization } from './harmonize_std.mjs';

function getGb38031Updates() {
  return {
    'GB38031-8.1.2': {
      soc: {
        value: '放電終止電壓狀態',
        detail: '將試驗對象荷電狀態調整至放電終止電壓狀態。'
      },
      discharge_current: {
        value: 'I1 (1 率放電電流) 恆流放電',
        detail: '以 I1 (1 率放電電流) 恆流放電。'
      },
      duration: {
        value: '放電持續 30 分鐘',
        detail: '放電持續 30 分鐘。'
      }
    },
    'GB38031-8.1.3': {
      soc: {
        value: '標準充電後 (100% SOC)',
        detail: '試驗對象按 7.1.1 方法進行標準充電。'
      },
      charging_current: {
        value: '≥ 1 I3 恆流充電',
        detail: '以製造商規定且不小於 1 I3 的電流恆流充電。'
      },
      termination: {
        value: '充電終止電壓 1.1 倍 或 115% SOC',
        detail: '充電至製造商規定的充電終止電壓的 1.1 倍或 115% SOC 後停止充電。'
      }
    },
    'GB38031-8.1.4': {
      soc: {
        value: '標準充電後 (100% SOC)',
        detail: '試驗對象按 7.1.1 方法進行標準充電。'
      },
      external_resistance: {
        value: '< 5 mΩ',
        detail: '外部線路電阻應小於 5 mΩ。'
      },
      duration: {
        value: '短路持續 10 分鐘',
        detail: '將試驗對象正極端子和負極端子經外部短路 10 分鐘。'
      }
    },
    'GB38031-8.1.5': {
      soc: {
        value: '標準充電後 (100% SOC)',
        detail: '試驗對象按 7.1.1 方法進行標準充電。'
      },
      heating_rate: {
        value: '5 °C/min 速率升溫',
        detail: '溫度箱按照 5 °C/min 的速率由試驗環境溫度升溫。'
      },
      target_temperature: {
        value: '非鎳氫電芯：130 °C；鎳氫電芯：85 °C',
        detail: '對於鎳氫電池單體以外的試驗對象升至 130 °C；對於鎳氫電池單體升至 85 °C。'
      },
      duration: {
        value: '非鎳氫電芯：30 分鐘；鎳氫電芯：2 小時',
        detail: '非鎳氫單體保持此溫度 30 分鐘後停止加熱；鎳氫單體保持此溫度 2 小時後停止加熱。'
      }
    },
    'GB38031-8.1.6': {
      soc: {
        value: '標準充電後 (100% SOC)',
        detail: '試驗對象按 7.1.1 方法充電。'
      },
      high_temperature: {
        value: '85 °C',
        detail: '高溫極值 85 °C，按照表 1 和圖 1 曲線進行調節。'
      },
      low_temperature: {
        value: '-40 °C',
        detail: '低溫極值 -40 °C，按照表 1 和圖 1 曲線進行調節。'
      },
      cycles: {
        value: '5 次循環',
        detail: '循環次數 5 次。按照表 1 和圖 1 曲線進行調節。'
      }
    },
    'GB38031-8.1.8': {
      applicability: {
        value: '20% 至 80% SOC 充電時間 ≤ 15 分鐘之快充單體',
        detail: '試驗對象為從 20% SOC 充電至 80% SOC 總充電時間不超過 15 分鐘的電池單體。'
      },
      cycles: {
        value: '300 次快充循環 (20%～80% SOC)',
        detail: '進行 300 次連續快充循環 (20%～80% SOC)，每次充放電間靜置 30 分鐘，循環後需進行 8.1.4 外部短路試驗。'
      }
    },
    'GB38031-8.2.1': {
      soc: {
        value: '最高工作荷電狀態',
        detail: '試驗對象均以製造商規定的最高工作荷電狀態進行測試 (6.1.10)。'
      },
      waveform: {
        value: '隨機振動 12 小時 + 正弦定頻 1～2 小時',
        detail: '包含隨機振動測試 12 小時（依重量及安裝位置參考表 2、表 3 的 RMS 值如 0.52 g, 0.57 g, 0.73 g 等），以及正弦定頻振動測試 1～2 小時。'
      },
      test_duration: {
        value: '隨機振動 12 小時；正弦定頻 1～2 小時',
        detail: '隨機振動測試 12 小時，正弦定頻振動測試 1～2 小時。'
      },
      vibration_rms: {
        value: '依安裝位置參考表 2、表 3 (0.52 g, 0.57 g, 0.73 g)',
        detail: '依重量及安裝位置參考表 2、表 3 的 RMS 值如 0.52 g, 0.57 g, 0.73 g 等。'
      }
    },
    'GB38031-8.2.2': {
      soc: {
        value: '最高工作荷電狀態',
        detail: '試驗對象均以製造商規定的最高工作荷電狀態進行測試。'
      },
      waveform: {
        value: '半正弦衝擊波',
        detail: '施加半正弦衝擊波，加速度 7 g，脈衝時間 6 ms，在 ±z 方向各進行 6 次衝擊，共計 12 次。'
      },
      acceleration_peak: {
        value: '7 g',
        detail: '加速度 7 g。'
      },
      pulse_duration: {
        value: '6 ms',
        detail: '脈衝時間 6 ms。'
      },
      direction: {
        value: '±z 方向各 6 次',
        detail: '在 ±z 方向各進行 6 次衝擊。'
      },
      shock_count: {
        value: '12 次 (±z 方向各 6 次)',
        detail: '在 ±z 方向各進行 6 次衝擊，共計 12 次。'
      }
    },
    'GB38031-8.2.5': {
      soc: {
        value: '最高工作荷電狀態',
        detail: '試驗對象均以製造商規定的最高工作荷電狀態進行測試。'
      },
      high_temperature: {
        value: '最高 60 °C (或更高，依製造商規定)',
        detail: '在最高溫度 60 °C（或更高，依製造商規定）及高濕度下進行。'
      },
      cycles: {
        value: '5 次濕熱循環',
        detail: '進行 5 次濕熱循環。'
      }
    },
    'GB38031-8.2.6': {
      soc: {
        value: '最高工作荷電狀態',
        detail: '試驗對象均以製造商規定的最高工作荷電狀態進行測試。'
      },
      liquid: {
        value: '方式一：3.5% NaCl 水溶液；方式二：水',
        detail: '方式一為 3.5% NaCl 水溶液；方式二為水。'
      },
      method: {
        value: '方式一：鹽水浸泡 2 小時；方式二：符合 GB/T 4208-2017 IPX7 要求浸水',
        detail: '方式一：3.5% NaCl 水溶液浸泡 2 小時；方式二：符合 GB/T 4208-2017 IPX7 要求。'
      },
      duration: {
        value: '方式一：2 小時；方式二：按 IPX7 要求',
        detail: '方式一鹽水浸泡 2 小時；方式二符合 GB/T 4208-2017 IPX7 要求。'
      },
      temperature_diff: {
        value: '溫差 ≤ 5 °C',
        detail: '（方式二）浸水時，水溫與試驗對象的溫差不得大於 5 °C。'
      }
    },
    'GB38031-8.2.7.1': {
      soc: {
        value: '最高工作荷電狀態',
        detail: '試驗對象均以製造商規定的最高工作荷電狀態進行測試。'
      },
      fire_exposure: {
        value: '4 階段：預熱 60 秒 → 直接燃燒 70 秒 → 間接燃燒 60 秒 → 移開火源觀察 2 小時',
        detail: '包含：預熱 60 秒 (Preheat)，直接燃燒 70 秒 (Direct flame)，間接燃燒 60 秒 (Indirect flame)，和離開火源觀察 2 小時 (Observation)。'
      }
    },
    'GB38031-8.2.7.2': {
      soc: {
        value: '外部充電電池包：95% SOC；車輛能源充電：90% SOC',
        detail: '外部充電電池包調至 95% SOC；僅通過車輛能源充電的電池包調至 90% SOC。'
      },
      temperature: {
        value: '22 ± 5 °C',
        detail: '試驗前需將環境與試驗對象溫度調整至 22 °C ± 5 °C。'
      }
    },
    'GB38031-8.2.9': {
      soc: {
        value: '最高工作荷電狀態',
        detail: '試驗對象均以製造商規定的最高工作荷電狀態進行測試。'
      },
      salt_solution: {
        value: '(50 ± 5) g/L (pH 6.5～7.2)',
        detail: '使用濃度 (50±5) g/L、pH 6.5～7.2 的鹽溶液。'
      },
      temperature: {
        value: '35 °C',
        detail: '在 35 °C 下噴霧 8 小時。'
      },
      spray_cycle: {
        value: '噴霧 8 小時，靜置 16 小時',
        detail: '在 35 °C 下噴霧 8 小時，然後靜置 16 小時。在一個循環的第 4 個小時和第 5 個小時之間進行低壓上電監控。'
      },
      cycles: {
        value: '6 次循環',
        detail: '共進行 6 個循環。'
      },
      operating_state: {
        value: '低壓上電監控（第 4 至第 5 小時之間）',
        detail: '在一個循環的第 4 個小時和第 5 個小時之間進行低壓上電監控。'
      }
    },
    'GB38031-8.2.10': {
      soc: {
        value: '最高工作荷電狀態',
        detail: '試驗對象均以製造商規定的最高工作荷電狀態進行測試。'
      },
      pressure: {
        value: '61.2 kPa (模擬海拔 4000 m)',
        detail: '在 61.2 kPa (模擬海拔 4000 m) 的氣壓下保持 5 小時，然後以不小於 1 I3 的電流放電。'
      },
      duration: {
        value: '保持 5 小時',
        detail: '在 61.2 kPa 氣壓下保持 5 小時，然後以不小於 1 I3 的電流放電。'
      }
    },
    'GB38031-8.2.11': {
      soc: {
        value: '最高工作荷電狀態',
        detail: '試驗對象均以製造商規定的最高工作荷電狀態進行測試。'
      },
      initial_temperature: {
        value: '20 ± 10 °C',
        detail: '試驗環境溫度為 20 °C ± 10 °C。'
      },
      termination: {
        value: '保護動作或發出信號，或溫度變化小於 4 °C/2 小時（溫度穩定 2 小時）',
        detail: '以連續上升的溫度加熱。當保護功能自動停止、發出信號，或溫度變化小於 4 °C/2 小時時終止測試。'
      }
    },
    'GB38031-8.2.12': {
      soc: {
        value: '最高工作荷電狀態',
        detail: '試驗對象均以製造商規定的最高工作荷電狀態進行測試。'
      },
      temperature: {
        value: '20 ± 10 °C',
        detail: '試驗環境溫度為 20 °C ± 10 °C。'
      },
      current: {
        value: '5 秒內升至過流保護觸發值',
        detail: '電流在 5 秒內上升至過流保護觸發值。'
      },
      termination: {
        value: '保護動作或發出信號，或溫度變化小於 4 °C/2 小時（溫度穩定 2 小時）',
        detail: '當保護功能自動停止、發出信號，或溫度變化小於 4 °C/2 小時時終止測試。'
      }
    },
    'GB38031-8.2.13': {
      soc: {
        value: '最高工作荷電狀態',
        detail: '試驗對象均以製造商規定的最高工作荷電狀態進行測試。'
      },
      temperature: {
        value: '20 ± 10 °C',
        detail: '試驗環境溫度為 20 °C ± 10 °C。'
      },
      external_resistance: {
        value: '≤ 5 mΩ',
        detail: '外部短路電阻不超過 5 mΩ。'
      },
      termination: {
        value: '保護觸發或溫度穩定後短路狀態繼續保持 1 小時',
        detail: '保護觸發或在溫度穩定後短路狀態繼續保持 1 小時。'
      }
    },
    'GB38031-8.2.14': {
      soc: {
        value: '最高工作荷電狀態',
        detail: '試驗對象均以製造商規定的最高工作荷電狀態進行測試。'
      },
      temperature: {
        value: '20 ± 10 °C',
        detail: '試驗環境溫度為 20 °C ± 10 °C。'
      },
      termination: {
        value: '保護動作，或溫度超出最高工作溫度 10 °C，或持續充電 12 小時',
        detail: '若未起作用且溫度未超最高工作溫度 10 °C，則持續充電 12 小時；若超出 10 °C 則結束。'
      }
    },
    'GB38031-8.2.15': {
      soc: {
        value: '最高工作荷電狀態',
        detail: '試驗對象均以製造商規定的最高工作荷電狀態進行測試。'
      },
      temperature: {
        value: '20 ± 10 °C',
        detail: '試驗環境溫度為 20 °C ± 10 °C。'
      },
      termination: {
        value: '保護動作；若未起作用放電至額定電壓 25% 為止',
        detail: '若保護功能未起作用，放電至額定電壓的 25% 為止。'
      }
    },
    'GB38031-8.2.16': {
      soc: {
        value: '最高工作荷電狀態',
        detail: '試驗對象均以製造商規定的最高工作荷電狀態進行測試。'
      },
      steel_bar: {
        value: '直徑 30 mm 半球形撞擊頭',
        detail: '撞擊頭為直徑 30 mm 的半球形。'
      },
      impact_mass: {
        value: '質量 10 kg',
        detail: '撞擊頭質量 10 kg。'
      },
      impact_energy: {
        value: '150 ± 3 J',
        detail: '撞擊能量為 150 J ± 3 J。'
      },
      impact_spots: {
        value: '涵蓋前中後 3 處脆弱點',
        detail: '需對電池底部的 3 個脆弱點進行撞擊測試（涵蓋前部、中部、後部）。'
      }
    }
  };
}

applyStandardHarmonization('GB38031', getGb38031Updates());
