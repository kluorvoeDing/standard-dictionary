import { applyStandardHarmonization } from './harmonize_std.mjs';

function getGb312414Updates() {
  return {
    'GB31241.4-6.1': {
      soc: {
        value: '標準充電後 (100% SOC)',
        detail: '將電池按照 4.5.1 規定的試驗方法充滿電後。'
      },
      temperature: {
        value: '57 ± 4 °C',
        detail: '待電池表面溫度達到 57 °C ± 4 °C 後，再放置 30 分鐘。'
      },
      external_resistance: {
        value: '80 ± 10 mΩ',
        detail: '用導線連接正負極，全部外部電阻為 80 mΩ ± 10 mΩ。'
      },
      termination: {
        value: '溫度降至峰值 20% 或短路持續 24 小時',
        detail: '電池溫度下降值達到溫度最大值的 20% 或短接時間達到 24 小時。'
      },
      apparatus: {
        value: '表面達溫後放置 30 分鐘',
        detail: '待電池表面溫度達到 57 °C ± 4 °C 後，再放置 30 分鐘。'
      }
    },
    'GB31241.4-6.2': {
      soc: {
        value: '標準充電後 (100% SOC)',
        detail: '將電池按照 4.5.1 規定的試驗方法充滿電後。'
      },
      charging_current: {
        value: '0.2 It 恆流充電',
        detail: '用 0.2 It 恆流充電。'
      },
      charging_voltage: {
        value: '1.3 × Ucl (額定能量高於 50 Wh 之電池組為 1.5 × Ucl)',
        detail: '至 1.3 × Ucl (充電限制電壓)。額定能量高於 50 Wh 電池組的組成電池過充試驗電壓為 1.5 × Ucl。'
      },
      termination: {
        value: '繼續恆壓 1 小時或總充電時間達 7 小時停止',
        detail: '繼續恆壓充電 1 小時停止試驗，或總充電時間達到 7 小時停止試驗。'
      }
    },
    'GB31241.4-6.3': {
      soc: {
        value: '標準放電後 (0% SOC)',
        detail: '按照 4.5.2 規定的試驗方法放完電後。'
      },
      current: {
        value: '1 It 反向充電',
        detail: '以 1 It 電流進行反向充電。'
      },
      target_voltage: {
        value: '-Uup (負的電池充電上限電壓)',
        detail: '如果在反向充電 90 分鐘內，電壓達到負的電池充電上限電壓 (-Uup)，應透過減小電流保持該電壓繼續進行反向充電，直至 90 分鐘結束。'
      },
      duration: {
        value: '90 分鐘',
        detail: '反向充電時間共計 90 分鐘。'
      }
    },
    'GB31241.4-7.2': {
      soc: {
        value: '標準充電後 (100% SOC)',
        detail: '將樣品按照 4.5.1 規定的試驗方法充滿電後。'
      },
      temperature: {
        value: '20 ± 5 °C',
        detail: '放置於 20 °C ± 5 °C 的真空箱中。'
      },
      pressure: {
        value: '11.6 kPa (模擬海拔 15240 m)',
        detail: '抽真空將箱內壓強降低至 11.6 kPa (模擬海拔 15240 m)。'
      },
      duration: {
        value: '保持 6 小時',
        detail: '保持 6 小時。'
      }
    },
    'GB31241.4-7.3': {
      soc: {
        value: '標準充電後 (100% SOC)',
        detail: '將充滿電的樣品放置在試驗箱內。'
      },
      high_temperature: {
        value: '72 ± 2 °C (保持 6 小時)',
        detail: '在 72 °C ± 2 °C 保持 6 小時。轉換時間不大於 30 分鐘。'
      },
      low_temperature: {
        value: '-40 ± 2 °C (保持 6 小時)',
        detail: '在 -40 °C ± 2 °C 保持 6 小時。轉換時間不大於 30 分鐘。'
      },
      transition_time: {
        value: '≤ 30 分鐘',
        detail: '轉換時間不大於 30 分鐘。'
      },
      cycles: {
        value: '10 次循環',
        detail: '共循環 10 次。'
      }
    },
    'GB31241.4-7.4': {
      soc: {
        value: '標準充電後 (100% SOC)',
        detail: '將充滿電的樣品緊固在振動試驗臺上。'
      },
      waveform: {
        value: '正弦對數掃頻 (7 Hz → 200 Hz → 7 Hz)',
        detail: '對數掃頻循環 7 Hz ~ 200 Hz ~ 7 Hz，時間 15 分鐘，加速度幅值 1 gn 至 8 gn，位移幅值 0.8 mm。'
      },
      vibration_frequency: {
        value: '7 Hz～200 Hz～7 Hz',
        detail: '對數掃頻循環 7 Hz ~ 200 Hz ~ 7 Hz，時間 15 分鐘。'
      },
      amplitude: {
        value: '位移幅值 0.8 mm',
        detail: '位移幅值 0.8 mm。'
      },
      acceleration_peak: {
        value: '1 gn 至 8 gn',
        detail: '加速度幅值 1 gn 至 8 gn。'
      },
      sweep_rate: {
        value: '對數掃頻時間 15 分鐘',
        detail: '對數掃頻循環 7 Hz ~ 200 Hz ~ 7 Hz，時間 15 分鐘。'
      },
      test_duration: {
        value: '每個方向 12 個循環 (共計 3 小時)',
        detail: '每個方向進行 12 個循環，共計 3 小時。圓柱形/扣式 2 個方向，方形/軟包 3 個方向。'
      },
      axes: {
        value: '圓柱／扣式 2 個方向；方形／軟包 3 個方向',
        detail: '圓柱形/扣式 2 個方向，方形/軟包 3 個方向。'
      }
    },
    'GB31241.4-7.5': {
      soc: {
        value: '標準充電後 (100% SOC)',
        detail: '將充滿電的樣品固定在衝擊臺上。'
      },
      waveform: {
        value: '半正弦脈衝',
        detail: '進行半正弦脈衝衝擊試驗。'
      },
      acceleration_peak: {
        value: '峰值 150 gn ± 25 gn',
        detail: '峰值加速度為 150 gn ± 25 gn，脈衝持續時間為 6 ms ± 1 ms。'
      },
      pulse_duration: {
        value: '6 ms ± 1 ms',
        detail: '脈衝持續時間為 6 ms ± 1 ms。'
      },
      direction: {
        value: '圓柱／扣式 2 個方向正反；方形／軟包 3 個方向正反',
        detail: '圓柱/扣式 12 次 (2 個方向的正反)，方形/軟包 18 次 (3 個方向的正反)。'
      },
      shock_count: {
        value: '每方向 3 次（圓柱／扣式共 12 次，方形／軟包共 18 次）',
        detail: '每個方向進行 3 次。圓柱/扣式 12 次 (2個方向的正反)，方形/軟包 18 次 (3個方向的正反)。'
      }
    },
    'GB31241.4-7.6': {
      soc: {
        value: '標準充電後 (100% SOC)',
        detail: '充滿電後自由落體跌落於混凝土地面上。'
      },
      drop_height: {
        value: '電池及非用戶更換型：1 m；用戶可更換型電池組：2 m',
        detail: '電池和非用戶可更換型電池組 1 m；用戶可更換型電池組 2 m。'
      },
      drop_surface: {
        value: '混凝土平整地面鋪設 4 mm 鋼板或 20 mm 硬木板',
        detail: '混凝土平整地面上鋪設 4 mm 鋼板（模擬玩具硬質衝擊面）或 20 mm 硬木板。'
      },
      orientation: {
        value: '各面跌落（電芯：端面各 1 次、側面 2 次；方形/軟包 6 面各 1 次；電池組：3 軸正反各 1 次共 6 次）',
        detail: '電池: 圓柱/扣式端面各 1 次，側面 2 次；方形/軟包每個面各 1 次。電池組: 三個相互垂直軸正反方向共 6 次；不可更換電池組允許安裝在設備內每面 1 次。'
      },
      drop_count: {
        value: '電芯 4 次或 6 次；電池組 6 次',
        detail: '電池: 圓柱/扣式端面各 1 次，側面 2 次；方形/軟包每個面各 1 次。電池組: 三個相互垂直軸正反方向共 6 次。'
      }
    },
    'GB31241.4-7.7': {
      soc: {
        value: '標準充電後 (100% SOC)',
        detail: '將電池充滿電後置於兩個平面內。'
      },
      apparatus: {
        value: '直徑 25 mm 鋼質半圓柱體橫置',
        detail: '直徑 25 mm 鋼質半圓柱體橫置。'
      },
      crush_speed: {
        value: '0.1 mm/s',
        detail: '擠壓電池的速度為 0.1 mm/s。'
      },
      force: {
        value: '圓柱／硬殼／扣式：20 ± 1.2 kN；軟包：按表 6 (2～20 kN)',
        detail: '圓柱/硬殼/扣式擠壓力為 20 kN ± 1.2 kN；軟包電池根據寬度按表 6 規定（2~20 kN）。'
      },
      termination: {
        value: '壓力達最大值或電壓降 1/3；停止並觀察 5 分鐘',
        detail: '壓力達到最大值或電壓下降三分之一 (1/3)，停止並觀察 5 分鐘。'
      }
    },
    'GB31241.4-7.8': {
      soc: {
        value: '標準充電後 (100% SOC)',
        detail: '將電池充滿電後置於平臺表面。'
      },
      steel_bar: {
        value: '直徑 15.8 ± 0.2 mm 金屬棒橫置於幾何中心',
        detail: '直徑 15.8 mm ± 0.2 mm 的金屬棒橫置在電池幾何中心。'
      },
      impact_mass: {
        value: '9.1 ± 0.1 kg 重物',
        detail: '9.1 kg ± 0.1 kg 重物。'
      },
      drop_height: {
        value: '610 ± 25 mm 自由落體',
        detail: '從 610 mm ± 25 mm 高處自由落體。'
      }
    },
    'GB31241.4-7.9': {
      soc: {
        value: '標準充電後 (100% SOC)',
        detail: '將電池充滿電後放入室溫試驗箱中。'
      },
      heating_rate: {
        value: '5 ± 2 °C/min',
        detail: '以 5 °C/min ± 2 °C/min 的速率升溫。'
      },
      target_temperature: {
        value: '135 ± 2 °C',
        detail: '升溫至 135 °C ± 2 °C 後恆溫。'
      },
      duration: {
        value: '持續 60 分鐘',
        detail: '持續 60 分鐘。'
      }
    },
    'GB31241.4-7.10': {
      soc: {
        value: '標準充電後 (100% SOC)',
        detail: '將電池充滿電。'
      },
      nail_diameter: {
        value: '直徑 4 mm 耐高溫鋼針',
        detail: '直徑 4 mm 的耐高溫鋼針，圓錐角 14°。'
      },
      needle_diameter: {
        value: '圓錐角 14°',
        detail: '圓錐角 14°。'
      },
      penetration_speed: {
        value: '20 ± 1 mm/s',
        detail: '以 20 mm/s ± 1 mm/s 的速度刺入。'
      },
      penetration: {
        value: '垂直於極板方向貫穿幾何中心，針尖完全穿過電池',
        detail: '從垂直於極板方向貫穿幾何中心，針尖完全穿過電池。'
      }
    },
    'GB31241.4-7.13': {
      soc: {
        value: '標準充電後 (100% SOC)',
        detail: '將電池組充滿電後。'
      },
      depth: {
        value: '沒過樣品 5 cm～10 cm',
        detail: '室溫下在水中浸泡，水深沒過樣品 5 cm ~ 10 cm。'
      },
      duration: {
        value: '浸泡 24 小時',
        detail: '浸泡 24 小時。'
      }
    },
    'GB31241.4-7.15': {
      enclosure_material: {
        value: '外殼、PCB 板、導線及其他封裝材料評估',
        detail: '針對外殼、PCB 板、導線及其他封裝材料進行可燃性評估。'
      }
    },
    'GB31241.4-8.2': {
      fault_condition: {
        value: '單一故障條件',
        detail: '在單一故障條件下進行。'
      },
      soc: {
        value: '充滿電 (100% SOC)',
        detail: '將電池組充滿電後進行。'
      },
      charging_current: {
        value: '最大充電電流 (Icm)',
        detail: '以製造商規定的最大充電電流充電。'
      },
      charging_voltage: {
        value: '(n × 6.0) V 或製造商規定的最高電壓值 (取較高值)',
        detail: '充電電壓為 (n × 6.0) V 或製造商規定的可能承受的最高電壓值 (取兩者較高值)。'
      },
      termination: {
        value: '保護動作後靜置 1 分鐘',
        detail: '保護裝置動作後靜置 1 分鐘。'
      }
    },
    'GB31241.4-8.3': {
      cycles: {
        value: '500 次循環測試',
        detail: '進行 500 次循環測試。每次保護裝置動作後靜置 1 分鐘。'
      },
      current: {
        value: '1.5 × Icp (1.5 倍過流充電保護電流)',
        detail: '充電電流為 1.5 倍過流充電保護電流。'
      },
      charging_voltage: {
        value: '(n × 6.0) V 或最高電壓值 (取較高值)',
        detail: '充電電壓為 (n × 6.0) V 或是最高電壓值 (取兩者較高值)。'
      },
      termination: {
        value: '保護動作後靜置 1 分鐘',
        detail: '每次保護裝置動作後靜置 1 分鐘。'
      }
    },
    'GB31241.4-8.4': {
      cycles: {
        value: '500 次循環測試',
        detail: '進行 500 次循環測試。每次保護裝置動作後靜置 1 分鐘。'
      },
      discharge_current: {
        value: 'Idr (推薦放電電流)',
        detail: '放電電流為推薦放電電流。'
      },
      termination: {
        value: '保護動作後靜置 1 分鐘',
        detail: '每次保護裝置動作後靜置 1 分鐘。'
      }
    },
    'GB31241.4-8.5': {
      cycles: {
        value: '500 次循環測試',
        detail: '進行 500 次循環測試。每次保護裝置動作後靜置 1 分鐘。'
      },
      current: {
        value: '1.5 × Idp (1.5 倍過流放電保護電流)',
        detail: '放電電流為 1.5 倍過流放電保護電流。'
      },
      termination: {
        value: '保護動作後靜置 1 分鐘',
        detail: '每次保護裝置動作後靜置 1 分鐘。'
      }
    },
    'GB31241.4-8.6': {
      fault_condition: {
        value: '單一故障條件',
        detail: '在單一故障條件下進行。'
      },
      external_resistance: {
        value: '80 ± 10 mΩ',
        detail: '外部短路總電阻為 (80 ± 10) mΩ。'
      },
      termination: {
        value: '保護動作後靜置 1 分鐘',
        detail: '短路正負極或輸出端子，保護裝置動作後靜置 1 分鐘。'
      }
    },
    'GB31241.4-8.7': {
      soc: {
        value: '標準放電後 (0% SOC)',
        detail: '電池組放完電後。'
      },
      current: {
        value: '1 It 反向充電',
        detail: '以 1 It 電流進行反向充電。'
      },
      target_voltage: {
        value: '-Uup (負的充電上限電壓)',
        detail: '至負的充電上限電壓 (-Uup)。'
      },
      cycles: {
        value: '3 次測試',
        detail: '進行 3 次測試。'
      }
    },
    'GB31241.4-8.8': {
      soc: {
        value: '標準放電後 (0% SOC)',
        detail: '電池組放完電後。'
      },
      operation: {
        value: '高溫 (最高充電溫度或 55 °C 取高者加 5 °C) 放 6 小時後充電；低溫 (最低充電溫度或 0 °C 取低者減 5 °C) 放 16 小時後充電；用推薦充電電流充電保持 10 分鐘',
        detail: '在高溫 (最高充電溫度或 55 °C 取高者加 5 °C) 環境放置 6 小時後充電；在低溫 (最低充電溫度或 0 °C 取低者減 5 °C) 環境放置 16 小時後充電；用推薦充電電流進行充電，保持 10 分鐘。'
      },
      duration: {
        value: '高溫 6 小時、低溫 16 小時、充電保持 10 分鐘',
        detail: '在高溫環境放置 6 小時後充電，在低溫環境放置 16 小時後充電，用推薦充電電流進行充電，保持 10 分鐘。'
      }
    },
    'GB31241.4-8.9': {
      soc: {
        value: '充滿電後 (100% SOC)',
        detail: '將電池組充滿電後。'
      },
      target_temperature: {
        value: '最高放電溫度或 45 °C (取大者) 加 5 °C',
        detail: '最高放電溫度或 45 °C (取大者) 加 5 °C 的環境中放置 8 小時。按放電程序進行放電，保持 10 分鐘。'
      },
      duration: {
        value: '放置 8 小時，放電保持 10 分鐘',
        detail: '最高放電溫度或 45 °C (取大者) 加 5 °C 的環境中放置 8 小時。按放電程序進行放電，保持 10 分鐘。'
      },
      operation: {
        value: '按放電程序進行放電，保持 10 分鐘',
        detail: '按放電程序進行放電，保持 10 分鐘。放置 8 小時。'
      }
    },
    'GB31241.4-8.10': {
      applicability: {
        value: '多級串聯電池組',
        detail: '適用於構成多級串聯電池組的每一級電池或電池並聯塊。'
      },
      charging_current: {
        value: '推薦充電電流 (Icr)',
        detail: '以 Icr 進行充電，使該電池電壓超過充電限制電壓。'
      }
    },
    'GB31241.4-8.11': {
      applicability: {
        value: '多級串聯電池組',
        detail: '適用於構成多級串聯電池組的每一級電池或電池並聯塊。'
      },
      discharge_current: {
        value: '推薦放電電流 (Idr)',
        detail: '以 Idr 進行放電，使該電池電壓低於放電終止電壓。'
      }
    }
  };
}

applyStandardHarmonization('GB31241.4', getGb312414Updates());
