import { applyStandardHarmonization } from './harmonize_std.mjs';

function getGb43854Updates() {
  return {
    'GB43854-T1': {
      charging_current: {
        value: '1 I2 (A) 恆流充電',
        detail: '用直流電源以 I2 (A) 電流充電。'
      },
      termination: {
        value: '充電至 1.5 倍充電限制電壓或總充電時間達 1.5 小時停止充電',
        detail: '充電至 1.5 倍充電限制電壓或總充電時間達到 1.5 小時，停止充電。'
      }
    },
    'GB43854-T2': {
      discharge_current: {
        value: '2 I2 (A) 恆流放電',
        detail: '對電池以 2 I2(A) 電流放電。'
      },
      duration: {
        value: '持續 90 分鐘',
        detail: '共持續 90 分鐘。'
      }
    },
    'GB43854-T3': {
      external_resistance: {
        value: '20 ± 5 mΩ',
        detail: '用外部電阻為 (20±5) mΩ 的導體連接電池正負極端。'
      },
      duration: {
        value: '保持 1 小時',
        detail: '保持 1 小時。'
      }
    },
    'GB43854-T4': {
      heating_rate: {
        value: '5 ± 2 °C/min',
        detail: '放入試驗箱中，以 (5±2) °C/min 的溫升速率進行升溫。'
      },
      target_temperature: {
        value: '130 ± 2 °C',
        detail: '當箱內溫度達到 (130±2) °C 後恆溫。'
      },
      duration: {
        value: '恆溫保持 60 分鐘',
        detail: '保持 60 分鐘。'
      }
    },
    'GB43854-T5': {
      nail_diameter: {
        value: '直徑 φ5 mm (5～8 mm 耐高溫鎢鋼針)',
        detail: '用直徑 φ5 mm 的耐高溫鋼針（如鎢鋼，針尖的圓錐角為 45°）。直徑 5 mm 至 8 mm 耐高溫鎢鋼針，頂端圓錐角 45° 至 60°，貫穿速度 25 ± 5 mm/s。'
      },
      needle_diameter: {
        value: '圓錐角 45° (45°～60°)',
        detail: '針尖的圓錐角為 45°（頂端圓錐角 45° 至 60°）。'
      },
      penetration_speed: {
        value: '25 ± 5 mm/s',
        detail: '以 (25±5) mm/s 的速度。'
      },
      penetration: {
        value: '垂直於極板方向貫穿幾何中心',
        detail: '從垂直於電池極板的方向貫穿電池的幾何中心。'
      }
    },
    'GB43854-T6': {
      charging_current: {
        value: '最大充電電流',
        detail: '用直流電源以製造商規定的最大充電電流充電。'
      },
      duration: {
        value: '持續 2 小時',
        detail: '共持續 2 小時。'
      },
      fault_condition: {
        value: '正常和單一故障條件分別進行',
        detail: '試驗應在電池組正常工作條件和充電保護元器件單一故障條件下分別進行。'
      }
    },
    'GB43854-T7': {
      discharge_current: {
        value: '2 I2 (A) 恆流放電',
        detail: '對電池組以 2 I2(A) 電流放電。'
      },
      duration: {
        value: '持續 90 分鐘',
        detail: '共持續 90 分鐘。'
      }
    },
    'GB43854-T8': {
      external_resistance: {
        value: '20 ± 5 mΩ',
        detail: '用外部電阻為 (20±5) mΩ 的導體連接電池組正負極端。'
      },
      termination: {
        value: '短路時間達 1 小時或電池組電壓低於 0.2 V',
        detail: '當電池組電壓低於 0.2 V 或者短路時間達到 1 小時，停止試驗。'
      },
      fault_condition: {
        value: '正常和單一故障條件分別進行',
        detail: '試驗應在電池組正常工作條件和放電保護元器件的單一故障條件下分別進行。'
      }
    },
    'GB43854-T9': {
      current: {
        value: '1.5 倍最大放電電流',
        detail: '用製造商規定的最大放電電流的 1.5 倍放電。'
      },
      duration: {
        value: '持續 2 小時',
        detail: '共持續 2 小時。'
      },
      fault_condition: {
        value: '正常和單一故障條件分別進行',
        detail: '試驗應在電池組正常工作條件和放電保護元器件單一故障條件下分別進行。'
      }
    },
    'GB43854-T10': {
      target_temperature: {
        value: '最高充電溫度或 55 °C 加 5 °C；最低充電溫度或 0 °C 降 5 °C',
        detail: '在製造商規定的最高充電溫度或 55 °C(取兩者較高的溫度)加 5 °C 的環境下放置 8 小時，然後用製造商規定的最大充電電流進行充電，並保持 10 分鐘，然後靜置 6 小時。在製造商規定的最低充電溫度或 0 °C(取兩者較低的溫度)再降 5 °C 的環境下放置 16 小時，然後用製造商規定的最大充電電流進行充電，並保持 10 分鐘，然後靜置 6 小時。'
      },
      duration: {
        value: '高溫放置 8 小時，低溫放置 16 小時；充電保持 10 分鐘，靜置 6 小時',
        detail: '在最高充電溫加 5 °C 環境放置 8 小時，充電保持 10 分鐘，靜置 6 小時；最低充電溫降 5 °C 環境放置 16 小時，充電保持 10 分鐘，靜置 6 小時。'
      },
      operation: {
        value: '最大充電電流充電保持 10 分鐘，靜置 6 小時',
        detail: '用製造商規定的最大充電電流進行充電，並保持 10 分鐘，然後靜置 6 小時。'
      }
    },
    'GB43854-T11': {
      voltage: {
        value: '直流 500 V (500 Vdc)',
        detail: '用絕緣電阻測量設備，施加直流電壓 500 V。'
      },
      test_points: {
        value: '正極與外殼、負極與外殼',
        detail: '測試電池組正極與外殼、負極與外殼之間的絕緣電阻值。外殼易觸及部分為絕緣材料的，用金屬條覆蓋。'
      }
    },
    'GB43854-T12': {
      crush_speed: {
        value: '5 ± 1 mm/s',
        detail: '擠壓速度為 (5±1) mm/s。'
      },
      apparatus: {
        value: '一側鋼製平板，一側鋼製異形板 (半圓柱形擠壓頭 R=75 mm，長度 > 電池，≤ 1 m)',
        detail: '放置在一側是鋼製平板，一側是鋼製異形板的中間。異形板的半圓柱形擠壓頭的半徑為 75 mm。半圓柱體的長度大於被擠壓電池的尺寸，但不超過 1 m。半徑 75 mm 半圓柱形鋼製壓板。'
      },
      orientation: {
        value: 'X 軸和 Y 軸方向 (各 1 次擠壓)',
        detail: '擠壓方向為 X 軸方向和 Y 軸方向，每個電池組只接受 1 次擠壓。'
      },
      termination: {
        value: '形變至原尺寸 70% 或擠壓力達 30 kN (保持 5 分鐘)',
        detail: '當擠壓至電池組原尺寸的 70%，或擠壓力達到 30 kN 時保持 5 分鐘。'
      },
      force: {
        value: '30 kN (保持 5 分鐘)',
        detail: '擠壓力達到 30 kN 時保持 5 分鐘。'
      }
    },
    'GB43854-T13': {
      waveform: {
        value: '半正弦波衝擊',
        detail: '每個電池組應經受峰值加速度 150 gn、脈衝持續時間 6 ms 的半正弦波衝擊。'
      },
      acceleration_peak: {
        value: '150 gn',
        detail: '峰值加速度 150 gn。'
      },
      pulse_duration: {
        value: '6 ms',
        detail: '脈衝持續時間 6 ms。'
      },
      direction: {
        value: '3 個互相垂直方向各 6 次 (3 次正方向、3 次負方向，至少 1 方向垂直於水平面)',
        detail: '在電池組 3 個互相垂直的方向上各承受 6 次等值的衝擊(3 次正方向,3 次負方向)，至少要保證 1 個方向與水平面垂直。'
      },
      shock_count: {
        value: '3 個方向各 6 次 (共 18 次)',
        detail: '在電池組 3 個互相垂直的方向上各承受 6 次等值的衝擊(3 次正方向,3 次負方向)。'
      }
    },
    'GB43854-T14': {
      waveform: {
        value: '隨機振動 (振動順序 Z-Y-X)',
        detail: '按表 1 規定振動譜進行隨機振動測試，X 軸功率譜密度均方根為 1.09 g，Y 軸為 0.68 g，Z 軸為 2.53 g。X 軸、Y 軸和 Z 軸方向各進行 12 小時振動，振動順序為 Z-Y-X。'
      },
      vibration_rms: {
        value: 'X: 1.09 g、Y: 0.68 g、Z: 2.53 g (按表 1)',
        detail: '按表 1 規定振動譜進行隨機振動測試，X 軸功率譜密度均方根為 1.09 g，Y 軸為 0.68 g，Z 軸為 2.53 g。'
      },
      test_duration: {
        value: '各方向 12 小時 (共 36 小時)',
        detail: 'X 軸、Y 軸和 Z 軸方向各進行 12 小時振動，振動順序為 Z-Y-X。'
      },
      axes: {
        value: 'X、Y、Z 軸 3 個方向 (順序 Z-Y-X)',
        detail: 'X 軸、Y 軸和 Z 軸方向各進行 12 小時振動，振動順序為 Z-Y-X。'
      }
    },
    'GB43854-T15': {
      drop_height: {
        value: '1.0 m',
        detail: '跌落高度為 1.0 m。'
      },
      drop_surface: {
        value: '混凝土地面',
        detail: '跌落至混凝土地面上。'
      },
      orientation: {
        value: '方形 6 面；圓柱形軸向及兩垂直徑向各 1 次共 6 次',
        detail: '方形電池組的 6 個表面方向，圓柱形電池組為軸向及兩個垂直的徑向各 1 次共 6 次。每兩次之間的時間間隔為 (3±1) min，測試結束靜置 4 小時。'
      },
      drop_count: {
        value: '共 6 次 (間隔 (3 ± 1) 分鐘，測試結束靜置 4 小時)',
        detail: '共 6 次。每兩次之間的時間間隔為 (3±1) min，測試結束靜置 4 小時。'
      }
    },
    'GB43854-T16': {
      force: {
        value: '4 倍電池組重量 (10 秒內均勻施加)',
        detail: '在電池組提把中間 75 mm 的長度上，10 秒內均勻施加至 4 倍電池組重量的力。'
      },
      duration: {
        value: '保持 1 分鐘',
        detail: '保持 1 分鐘。'
      },
      apparatus: {
        value: '電池組提把中間 75 mm 長度',
        detail: '在電池組提把中間 75 mm 的長度上，10 秒內均勻施加至 4 倍電池組重量的力。'
      }
    },
    'GB43854-T17': {
      pressure: {
        value: '≤ 11.6 kPa',
        detail: '放置在真空箱中，逐漸降低箱內氣壓至不大於 11.6 kPa。'
      },
      duration: {
        value: '保持 6 小時',
        detail: '保持 6 小時。'
      }
    },
    'GB43854-T18': {
      high_temperature: {
        value: '72 ± 2 °C (存放 6 小時)',
        detail: '在溫度為 (72±2) °C 的環境下存放 6 小時。兩個溫度之間的轉換時間不超過 30 分鐘。'
      },
      low_temperature: {
        value: '-40 ± 2 °C (存放 6 小時)',
        detail: '在溫度為 (-40±2) °C 的環境下存放 6 小時。兩個溫度之間的轉換時間不超過 30 分鐘。'
      },
      transition_time: {
        value: '≤ 30 分鐘',
        detail: '兩個溫度之間的轉換時間不超過 30 分鐘。'
      },
      cycles: {
        value: '10 次循環',
        detail: '共循環 10 次。'
      }
    },
    'GB43854-T19': {
      liquid: {
        value: '水 (水槽浸沒)',
        detail: '浸沒在溫度為 (20±5) °C 的水槽中 (以水淹沒電池組最上端為準)。'
      },
      temperature: {
        value: '20 ± 5 °C',
        detail: '水溫 (20±5) °C。'
      },
      depth: {
        value: '淹沒電池組最上端',
        detail: '以水淹沒電池組最上端為準。'
      },
      duration: {
        value: '浸水 48 小時',
        detail: '浸水 48 小時。'
      }
    },
    'GB43854-T20': {
      standard: {
        value: 'GB/T 2423.18—2021 試驗方法 3',
        detail: '按照 GB/T 2423.18—2021 中試驗方法 3 進行測試。'
      }
    },
    'GB43854-T21': {
      high_temperature: {
        value: '最高 65 °C (GB/T 2423.4—2008 試驗方法 2)',
        detail: '按照 GB/T 2423.4—2008 執行試驗方法 2，最高溫度為 65 °C。'
      },
      cycles: {
        value: '5 次循環',
        detail: '循環 5 次。'
      }
    },
    'GB43854-T22': {
      enclosure_material: {
        value: '非金屬外殼符合 GB/T 5169.16 V-0 級',
        detail: '非金屬材料外殼按照 GB/T 5169.16 進行測試，符合 V-0。'
      },
      pcb_material: {
        value: '印製板符合 GB/T 5169.16 V-1 級',
        detail: '印製板按照 GB/T 5169.16 進行測試，符合 V-1。'
      },
      wire_material: {
        value: '導線按附錄 A 針焰試驗測試',
        detail: '導線按照附錄 A 針焰試驗進行測試。'
      }
    },
    'GB43854-T23': {
      trigger_location: {
        value: '靠近中心位置或被包圍的單體電池',
        detail: '選擇電池組內靠近中心位置，或者被其他單體電池包圍的一個單體電池作為觸發對象。'
      },
      trigger: {
        value: '加熱或過充觸發',
        detail: '推薦加熱或過充作為熱擴散試驗的可選方法。'
      },
      heating_power: {
        value: '30 W 至 300 W (<80 Wh 為 30～200 W，≥80 Wh 為 100～300 W)',
        detail: '依單體能量選擇加熱功率：<80 Wh 為 30-200 W，≥80 Wh 為 100-300 W。'
      },
      termination_for_trigger: {
        value: '(a 且 c) 或 (b 且 c)；電壓降 > 25% 或達最高工作溫，且 dT/dt > 1 °C/s 持續 3 秒',
        detail: '電壓降>25% (a) 或 達最高工作溫度 (b)；並且 dT/dt>1 °C/s 持續 3 秒 (c)。滿足 (a且c) 或 (b且c) 判定為觸發熱失控。'
      }
    }
  };
}

applyStandardHarmonization('GB43854', getGb43854Updates());
