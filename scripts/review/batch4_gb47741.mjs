import { applyStandardHarmonization } from './harmonize_std.mjs';

function getGb47741Updates() {
  return {
    'GB47741-6.1': {
      temperature: {
        value: '57 ± 4 °C'
      },
      external_resistance: {
        value: '20 ± 5 mΩ'
      },
      termination: {
        value: '降溫後維持 1 小時'
      }
    },
    'GB47741-6.2': {
      charging_current: {
        value: '最大充電電流'
      },
      charging_voltage: {
        value: '1.5 倍充電限制電壓'
      },
      duration: {
        value: '1 小時 或總 1.5 小時'
      }
    },
    'GB47741-6.3': {
      current: {
        value: '1 It 反向充電'
      },
      duration: {
        value: '共計 90 分鐘'
      }
    },
    'GB47741-7.1': {
      pressure: {
        value: '≤ 11.6 kPa'
      },
      temperature: {
        value: '20 ± 5 °C'
      },
      duration: {
        value: '≥ 6 小時'
      }
    },
    'GB47741-7.2': {
      high_temperature: {
        value: '72 ± 2 °C (保持 6 小時)'
      },
      low_temperature: {
        value: '-40 ± 2 °C (保持 6 小時)'
      },
      cycles: {
        value: '10 次循環'
      },
      dwell_time: {
        value: '大型電池 (>500 g) 保持時間應為 12 小時',
        detail: '對於大型電池(>500 g)，保持時間應為 12 小時。'
      }
    },
    'GB47741-7.3': {
      vibration_frequency: {
        value: '7 Hz～200 Hz'
      },
      acceleration_peak: {
        value: '8 gn'
      },
      test_duration: {
        value: '每方向 3 小時'
      }
    },
    'GB47741-7.4': {
      acceleration_peak: {
        value: '150 gn (大電池 50 gn)'
      },
      pulse_duration: {
        value: '6 ms (大電池 11 ms)'
      },
      shock_count: {
        value: '每個方向 3 次'
      }
    },
    'GB47741-7.5': {
      drop_height: {
        value: '1 m'
      },
      drop_surface: {
        value: '混凝土板'
      },
      drop_count: {
        value: '4 次或 6 次'
      }
    },
    'GB47741-7.6': {
      impact_mass: {
        value: '9.1 ± 0.1 kg'
      },
      drop_height: {
        value: '610 ± 25 mm'
      },
      steel_bar: {
        value: '直徑 15.8 ± 0.1 mm 金屬棒'
      }
    },
    'GB47741-7.7': {
      force: {
        value: '26 ± 1.56 kN'
      },
      crush_speed: {
        value: '0.1 mm/s'
      },
      termination: {
        value: '最大力或電壓降三分之一 (1/3)'
      }
    },
    'GB47741-7.8': {
      target_temperature: {
        value: '135 ± 2 °C'
      },
      heating_rate: {
        value: '5 ± 2 °C/min',
        detail: '以 5 °C/min ± 2 °C/min 的升溫速率。'
      },
      duration: {
        value: '恆溫 60 分鐘'
      }
    },
    'GB47741-7.9': {
      nail_diameter: {
        value: '直徑 Φ5 mm 鋼針'
      },
      needle_diameter: {
        value: '圓錐角 45°',
        detail: '鋼針圓錐角為 45°。'
      },
      penetration_speed: {
        value: '25 ± 5 mm/s'
      },
      hold_duration: {
        value: '停留觀察 1 小時'
      }
    },
    'GB47741-7.11': {
      trigger: {
        value: '最大功率持續加熱'
      },
      termination_for_trigger: {
        value: '降壓 25% 或達 300 °C'
      }
    },
    'GB47741-8.1': {
      pressure: {
        value: '≤ 11.6 kPa'
      },
      duration: {
        value: '至少 6 小時'
      }
    },
    'GB47741-8.2': {
      high_temperature: {
        value: '72 °C (保持 6 小時)'
      },
      low_temperature: {
        value: '-40 °C (保持 6 小時)'
      },
      cycles: {
        value: '10 次循環'
      },
      dwell_time: {
        value: 'm ≤ 12 kg (6 小時) / m > 12 kg (12 小時)',
        detail: '質量 m≤12 kg 保持 6 小時，m>12 kg 保持 12 小時。'
      }
    },
    'GB47741-8.3': {
      acceleration_peak: {
        value: 'm ≤ 12 kg (8 gn) / m > 12 kg (2 gn)',
        detail: '質量 m≤12 kg 為 8gn，質量 m>12 kg 為 2gn。'
      },
      test_duration: {
        value: '每個方向 3 小時'
      }
    },
    'GB47741-8.4': {
      acceleration_peak: {
        value: '依質量計算取小者 (m ≤ 12 kg 取 150 gn 或 100850/m；m > 12 kg 取 50 gn 或 30000/m)',
        detail: '質量 m≤12 kg：取 150gn 或 100850/m 中較小者。m>12 kg：取 50gn 或 30000/m 中較小者。'
      },
      pulse_duration: {
        value: '6 ms 或 11 ms'
      }
    },
    'GB47741-8.5': {
      drop_height: {
        value: '1 m'
      },
      drop_surface: {
        value: '混凝土板'
      },
      drop_count: {
        value: '6 次'
      }
    },
    'GB47741-8.6': {
      temperature: {
        value: '70 ± 2 °C'
      },
      duration: {
        value: '7 小時'
      }
    },
    'GB47741-8.7': {
      liquid: {
        value: '3.5% NaCl 水溶液'
      },
      depth: {
        value: '最高點以上 1 cm'
      },
      duration: {
        value: '至少 30 分鐘'
      }
    },
    'GB47741-8.8': {
      enclosure_material: {
        value: '不低於 V-0 級'
      },
      pcb_material: {
        value: '不低於 V-1 級'
      }
    },
    'GB47741-9.2': {
      charging_voltage: {
        value: '1.2 倍過壓充電'
      },
      charging_current: {
        value: '推薦充電電流 (Icr) 或 m 倍推薦充電電流 (m × Icr)',
        detail: '使用推薦充電電流(Icr) 或 m倍推薦充電電流(m×Icr)進行試驗。'
      },
      termination: {
        value: '觸發保護或達到 1.2 倍電壓'
      },
      fault_condition: {
        value: '正常與單一故障條件',
        detail: '必須在正常條件與單一故障條件下進行測試。'
      }
    },
    'GB47741-9.3': {
      current: {
        value: '1.5 倍過流充電保護電流'
      }
    },
    'GB47741-9.5': {
      discharge_current: {
        value: '推薦放電電流 (Idr)'
      },
      termination: {
        value: '放電至保護電路動作'
      }
    },
    'GB47741-9.6': {
      current: {
        value: '1.5 倍過流放電保護電流'
      }
    },
    'GB47741-9.7': {
      external_resistance: {
        value: '20 ± 5 mΩ'
      },
      termination: {
        value: '電壓 < 0.2 V 或 1 小時'
      },
      fault_condition: {
        value: '正常與單一故障條件',
        detail: '必須在正常條件與單一故障條件下進行測試。'
      }
    },
    'GB47741-10.2': {
      amplitude: {
        value: '振幅 0.8 mm'
      },
      vibration_frequency: {
        value: '10 Hz～55 Hz'
      },
      test_duration: {
        value: '往返移動 95 分鐘'
      }
    },
    'GB47741-10.3': {
      pressure: {
        value: '壓差至少 88 kPa'
      },
      temperature: {
        value: '24 ± 4 °C'
      },
      duration: {
        value: '3 個相互垂直位置各至少 6 小時 (總計 18 小時)',
        detail: '三個相互垂直的位置上進行測試，每個位置至少 6 小時 (總計 18 小時)。'
      }
    },
    'GB47741-11.2': {
      temperature: {
        value: '57 ± 4 °C'
      },
      external_resistance: {
        value: '80 ± 20 mΩ'
      },
      termination: {
        value: '短接 24 小時 或溫度降 20%'
      }
    },
    'GB47741-11.3': {
      charging_current: {
        value: '2.5 倍充電電流 (充入 250% 額定容量)'
      },
      termination: {
        value: '充入 250% 額定容量'
      }
    },
    'GB47741-11.4': {
      nail_diameter: {
        value: '直徑 Φ5 mm 鋼針'
      },
      penetration_speed: {
        value: '25 ± 5 mm/s'
      },
      hold_duration: {
        value: '停留觀察 1 小時'
      }
    }
  };
}

applyStandardHarmonization('GB47741', getGb47741Updates());
