import { applyStandardHarmonization } from './harmonize_std.mjs';

function getUl2271Updates() {
  return {
    'UL2271-T23': {
      soc: {
        value: '放電至 EODV 再過充',
        detail: '測試前樣品先放電至 EODV (End of Discharge Voltage)，再進行過充電。'
      },
      charging_current: {
        value: '最大充電電流',
        detail: '以製造商規定的最大充電電流進行恆流充電。'
      },
      fault_condition: {
        value: '單一故障',
        detail: '在充電電路中引入單一故障條件。'
      },
      termination: {
        value: '電壓達 110% 且靜置 2 小時',
        detail: '測試持續至保護電路終止充電，或電壓達到規定的 110 % 且溫度恢復至環境溫度/穩定狀態，並額外靜置 2 小時（或發生起火/爆炸）。'
      }
    },
    'UL2271-T24': {
      soc: {
        value: '放電至 EODV',
        detail: '測試前樣品放電至終止電壓 (EODV)。'
      },
      current: {
        value: '高於最大充電速率 20% (20% greater)',
        detail: '以高於規定的最大充電速率 20% (20 % greater) 進行充電。'
      },
      fault_condition: {
        value: '單一故障條件',
        detail: '過充電流保護裝置或控制器需處於單一故障條件下。'
      }
    },
    'UL2271-T25': {
      soc: {
        value: '滿充 (MOSOC)',
        detail: '樣品處於滿充狀態。'
      },
      external_resistance: {
        value: '≤ 20 mΩ',
        detail: '外部短路電阻不大於 20 mΩ。'
      },
      fault_condition: {
        value: '單一故障',
        detail: '在放電保護電路中引入單一元件故障。'
      }
    },
    'UL2271-T26': {
      soc: {
        value: '滿充 (MOSOC)',
        detail: '樣品處於滿充狀態。'
      },
      current: {
        value: '過載放電（90% BMS 保護值，或 135% 主熔斷器，或例外 150%）',
        detail: '高於正常放電速率進行放電（以 90 % BMS 過流保護值，或 135 % 主熔斷器額定值，或 Exception 1 的 150 %）。'
      },
      fault_condition: {
        value: '單一故障',
        detail: '放電電路單一故障（可能導致過載）。'
      },
      duration: {
        value: '持續至完放或靜置 7 小時',
        detail: '測試持續至完全放電，或保護啟動/溫度穩定後並已經過 7 小時。'
      }
    },
    'UL2271-T27': {
      soc: {
        value: '滿充 (MOSOC)',
        detail: '樣品處於滿充狀態。'
      },
      discharge_current: {
        value: '最大放電速率',
        detail: '以最大放電速率進行放電。'
      },
      fault_condition: {
        value: '單一故障條件',
        detail: '過放電保護控制處於單一故障條件。'
      },
      termination: {
        value: '放電至 0 V 或保護跳脫',
        detail: '持續放電直到保護裝置啟動或放電至 0 V。'
      }
    },
    'UL2271-T28': {
      target_temperature: {
        value: '上限充電溫度',
        detail: '在上限充電溫度下進行充放電。'
      },
      operation: {
        value: '≥ 2 次循環（充放電至溫度增加 ≤ 2 °C）',
        detail: '至少 2 次完整充放電循環，直到連續循環電池溫度增加不超過 2 °C。'
      }
    },
    'UL2271-T29': {
      soc: {
        value: '人工不平衡狀態（除 1 個外完放，未放者放電至約 50% SOC）',
        detail: '除一個電池/電池組外全部放電至完全放電狀態，未放電電池放電至約 50% SOC。'
      },
      charge: {
        value: '按製造商規格充電',
        detail: '在不平衡狀態下依正常規格充電。'
      }
    },
    'UL2271-T30': {
      applicability: {
        value: '≥ 60 Vdc 系統',
        detail: '僅適用於額定電壓 60 Vdc 及以上的電路。'
      },
      voltage: {
        value: '2 倍額定電壓 × 1.414（連接 AC 則為 1000 V + 2 倍額定）',
        detail: '施加 2 倍額定電壓的電壓 (直流需乘以 1.414)。若連接至 AC 電網，則為 1000 V + 2 倍額定電壓。'
      },
      duration: {
        value: '1 分鐘',
        detail: '維持 1 分鐘。'
      }
    },
    'UL2271-T31': {
      method: {
        value: '系統 ≥ 120 V 按 ISO 6469-1；< 120 V 施加 500 Vdc 60 秒',
        detail: '系統 ≥ 120 V 按 ISO 6469-1 測試。系統 < 120 V 施加 500 Vdc 60 秒。'
      },
      voltage: {
        value: '500 Vdc (< 120 V 系統)',
        detail: '施加 500 Vdc 60 秒。'
      },
      duration: {
        value: '60 秒',
        detail: '施加 500 Vdc 60 秒。'
      }
    },
    'UL2271-T32': {
      current: {
        value: '1.5 倍 Ic 或 25 A (取較大者)',
        detail: '施加 150% (1.5 倍) 最大充電電流或 25 A，取較大者。'
      },
      duration: {
        value: '5 秒',
        detail: '持續 5 秒。'
      }
    },
    'UL2271-T33': {
      waveform: {
        value: '按 ISO 6469-1 隨機振動',
        detail: '按 ISO 6469-1 進行隨機振動測試。'
      },
      vibration_frequency: {
        value: '5～200 Hz',
        detail: '隨機振動頻率範圍 5-200 Hz。'
      },
      test_duration: {
        value: '每軸 12 小時（X、Y、Z 三方向共 36 小時）',
        detail: 'X、Y、Z 三方向各 12 小時。'
      },
      axes: {
        value: 'X、Y、Z 三方向',
        detail: 'X、Y、Z 三方向各 12 小時。'
      }
    },
    'UL2271-T34': {
      waveform: {
        value: '半正弦波',
        detail: '依重量不同，加速度為 50 gn/11 ms (≤ 12 kg)、25 gn/15 ms (12–100 kg)、10 gn/20 ms (> 100 kg)。'
      },
      acceleration_peak: {
        value: '50 gn (≤ 12 kg) / 25 gn (12–100 kg) / 10 gn (> 100 kg)',
        detail: '依重量不同，加速度為 50 gn/11 ms (≤ 12 kg)、25 gn/15 ms (12–100 kg)、10 gn/20 ms (> 100 kg)。'
      },
      pulse_duration: {
        value: '11 ms (≤ 12 kg) / 15 ms (12–100 kg) / 20 ms (> 100 kg)',
        detail: '脈衝持續時間依重量分別為 11 ms、15 ms、20 ms。'
      }
    },
    'UL2271-T35': {
      applicability: {
        value: '僅適用於道路用輕型電動車（滑板車、摩托車）',
        detail: '僅適用於道路用輕型電動車（如滑板車、摩托車）。'
      },
      force: {
        value: '1000 倍重量或 100 kN',
        detail: '使用半徑 75 mm 肋狀壓板擠壓，施加至 1000 倍 DUT 重量或 100 kN（取較早者），或 50% 變形。'
      },
      crush_speed: {
        value: '約 1.5 cm/s',
        detail: '以大約 1.5 cm/s 的速度進行擠壓。'
      },
      apparatus: {
        value: '半徑 75 mm 半圓柱鋼製壓板（肋狀壓板）',
        detail: '平滑半圓柱鋼製壓板，長度足以覆蓋整個被測表面。使用半徑 75 mm 肋狀壓板擠壓。'
      },
      soc: {
        value: '完全充電',
        detail: '測試前樣品需處於完全充電狀態。'
      },
      termination: {
        value: '達 1000 倍重量、100 kN 或 50% 變形（取較早者）',
        detail: '施加至 1000 倍 DUT 重量或 100 kN（取較早者），或 50% 變形。'
      }
    },
    'UL2271-T36a': {
      soc: {
        value: '完全充電',
        detail: '測試前樣品需處於完全充電狀態。'
      },
      drop_height: {
        value: '1.0 m (±0.01 m 公差)',
        detail: '從 1 公尺高度跌落至混凝土表面 (±0.01 m tolerance)。'
      },
      drop_surface: {
        value: '混凝土表面',
        detail: '從 1 公尺高度跌落至混凝土表面。'
      },
      drop_count: {
        value: '3 次',
        detail: '進行 3 次跌落。'
      },
      cold_conditioning: {
        value: '塑膠外殼預期用於 0 °C 時：在 0 °C 下調節 3 小時',
        detail: '若外殼為塑膠且預期用於 0 °C 環境 (intended for use in 0 °C temperatures)，需在 0 °C 下調節 3 小時。'
      }
    },
    'UL2271-T36b': {
      soc: {
        value: '完全充電',
        detail: '測試前樣品需處於完全充電狀態。'
      },
      drop_height: {
        value: '≥ 1.0 m',
        detail: '從至少 1 公尺高度跌落至混凝土表面。'
      },
      drop_surface: {
        value: '混凝土表面',
        detail: '跌落至混凝土表面。'
      },
      drop_count: {
        value: '依平放與非平放邏輯進行跌落',
        detail: '根據平放與非平放跌落的條件邏輯進行跌落測試。'
      }
    },
    'UL2271-T37': {
      soc: {
        value: '完全放電',
        detail: '在進行溫度調節前，樣品需處於完全放電狀態。為了防止受電電池過熱造成危險，樣品在調節前應完全放電。'
      },
      test_type: {
        value: '高溫外殼應力釋放測試',
        detail: '放置於 70 °C 烤箱中（若最高工作溫度超過 60 °C，則為 T_max + 10 °C）。持續 7 小時。'
      },
      temperature: {
        value: '70 °C 或 T_max + 10 °C',
        detail: '放置於 70 °C 烤箱中（若最高工作溫度超過 60 °C，則為 T_max + 10 °C）。'
      },
      duration: {
        value: '7 小時',
        detail: '持續 7 小時。'
      }
    },
    'UL2271-T38': {
      test_type: {
        value: '把手提把拉力應力測試',
        detail: '對把手施加 4 倍 DUT 重量的拉力。保持 1 分鐘。'
      },
      force: {
        value: '4 倍 DUT 重量',
        detail: '對把手施加 4 倍 DUT 重量的拉力。'
      },
      duration: {
        value: '1 分鐘',
        detail: '保持 1 分鐘。'
      }
    },
    'UL2271-T39': {
      soc: {
        value: '完全充電',
        detail: '測試前樣品需處於完全充電狀態。'
      },
      orientation: {
        value: '在 3 個互相垂直方向各以每 15 秒 90° 的速度旋轉 360°',
        detail: '在 3 個互相垂直方向各以每 15 秒 90° 的速度旋轉 360°。'
      }
    },
    'UL2271-T40': {
      test_type: {
        value: '電線拉力與推回測試',
        detail: '施加 2 倍 DUT 重量（最大 156 N）拉力持續 1 分鐘。將電線向內推回 (25.4-mm increments)。'
      },
      force: {
        value: '2 倍 DUT 重量（最大 156 N）拉力',
        detail: '施加 2 倍 DUT 重量（最大 156 N）拉力持續 1 分鐘。'
      },
      duration: {
        value: '1 分鐘',
        detail: '持續 1 分鐘。'
      },
      apparatus: {
        value: '推回增量 25.4 mm (25.4-mm increments)',
        detail: '將電線向內推回 (25.4-mm increments)。'
      }
    },
    'UL2271-T41': {
      soc: {
        value: '完全充電',
        detail: '測試前樣品需處於完全充電狀態。'
      },
      liquid: {
        value: '5% NaCl 鹽水',
        detail: '浸入 5% 鹽水中。'
      },
      method: {
        value: '完全淹沒',
        detail: '完全淹沒至少 2 小時，或直到可見反應停止。'
      },
      duration: {
        value: '≥ 2 小時（或直到可見反應停止）',
        detail: '完全淹沒至少 2 小時，或直到可見反應停止。'
      }
    },
    'UL2271-T42': {
      soc: {
        value: '完全充電',
        detail: '測試前樣品需處於完全充電狀態。'
      },
      liquid: {
        value: '清水（IPX3 噴水或更高）',
        detail: '按 IEC 60529 進行 IPX3 噴水測試（或按製造商宣稱之更高防護等級）。'
      },
      method: {
        value: '按 IEC 60529 進行 IPX3 噴水測試（或更高等級）',
        detail: '按 IEC 60529 進行 IPX3 噴水測試（或按製造商宣稱之更高防護等級）。'
      }
    },
    'UL2271-T43': {
      soc: {
        value: '完全充電',
        detail: '測試前樣品需處於完全充電狀態。'
      },
      high_temperature: {
        value: '85 ± 2 °C (按 SAE J2464)',
        detail: '在 85 ± 2 °C 與 -40 ± 2 °C 之間進行 5 次循環（按 SAE J2464 熱衝擊測試程序）。'
      },
      low_temperature: {
        value: '-40 ± 2 °C',
        detail: '-40 ± 2 °C。'
      },
      dwell_time: {
        value: '按 SAE J2464 熱衝擊程序',
        detail: '按 SAE J2464 熱衝擊測試程序。'
      },
      cycles: {
        value: '5 次循環',
        detail: '進行 5 次循環（參考 Gemini md 記載的 5 次）。'
      }
    },
    'UL2271-T45': {
      trigger: {
        value: '觸發單電池熱失控（依 UL 2580 單電池失效測試方法）',
        detail: '依 UL 2580 單電池失效測試方法，誘發單一電芯熱失控。'
      },
      method: {
        value: '僅適用於額定能量 > 1 kWh 之二次鋰電池系統',
        detail: '僅適用於額定能量 > 1 kWh 的二次鋰電池系統。'
      }
    }
  };
}

applyStandardHarmonization('UL2271', getUl2271Updates());
