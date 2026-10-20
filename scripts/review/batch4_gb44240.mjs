import { applyStandardHarmonization } from './harmonize_std.mjs';

function getGb44240Updates() {
  return {
    'GB44240-6.1': {
      temperature: {
        value: '57 ± 4 °C',
        detail: '放置在 57 ± 4 °C 的環境中，待電池達到溫度後再放置 30 分鐘。'
      },
      external_resistance: {
        value: '≤ 5 mΩ',
        detail: '用導線連接電池正負極端，確保全部外部電阻不高於 5 mΩ。'
      },
      termination: {
        value: '溫度下降至峰值溫升 80% 或短接時間達 6 小時',
        detail: '當電池溫度下降值達到峰值溫升的 80% 或短接時間達到 6 小時 時終止（選較嚴者）。'
      },
      apparatus: {
        value: '達溫後再放置 30 分鐘',
        detail: '待電池達到溫度後再放置 30 分鐘。'
      }
    },
    'GB44240-6.2': {
      charging_current: {
        value: '最大充電電流',
        detail: '用製造商規定的最大充電電流充電。'
      },
      charging_voltage: {
        value: '1.5 倍充電限制電壓',
        detail: '充電至 1.5 倍的充電限制電壓後持續恆壓充電 1 小時，或總充電時間達到 1.5 小時。'
      },
      termination: {
        value: '恆壓 1 小時或總充電時間達 1.5 小時',
        detail: '充電至 1.5 倍的充電限制電壓後持續恆壓充電 1 小時，或總充電時間達到 1.5 小時。'
      }
    },
    'GB44240-6.3': {
      current: {
        value: '1 It 反向充電 (若 Im < 1 It 則以 Im 充電，t = (1It / Im) * 90)',
        detail: '以 1 It 的電流進行反向充電至負的充電上限電壓（-Uup）。若最大放電電流小於 1 It，則以最大放電電流反向充電，時間 t = (1It / Im) * 90。 如果在反向充電 90 分鐘 內，電壓達到負的充電上限電壓（－Uup），應通過減小電流保持該電壓繼續進行反向充電。'
      },
      duration: {
        value: '90 分鐘',
        detail: '反向充電時間共計 90 分鐘。'
      }
    },
    'GB44240-7.1': {
      pressure: {
        value: '11.6 kPa',
        detail: '抽真空將箱內壓強降低至 11.6 kPa。'
      },
      temperature: {
        value: '20 ± 5 °C',
        detail: '放置於 20 ± 5 °C 的真空箱中。'
      },
      duration: {
        value: '6 小時',
        detail: '保持 6 小時。'
      }
    },
    'GB44240-7.2': {
      high_temperature: {
        value: '72 ± 2 °C (保持 6 小時)',
        detail: '72 ± 2 °C 保持 6 小時，然後 -40 ± 2 °C 保持 6 小時。每兩個溫度之間的轉換時間應不大於 30 分鐘。'
      },
      low_temperature: {
        value: '-40 ± 2 °C (保持 6 小時)',
        detail: '-40 ± 2 °C 保持 6 小時。每兩個溫度之間的轉換時間應不大於 30 分鐘。'
      },
      transition_time: {
        value: '≤ 30 分鐘',
        detail: '每兩個溫度之間的轉換時間應不大於 30 分鐘。'
      },
      dwell_time: {
        value: '大型電池暴露極端溫度時間至少 12 小時',
        detail: '大型電池暴露極端溫度時間至少 12 小時。'
      },
      cycles: {
        value: '10 次循環',
        detail: '重複 10 次循環。'
      }
    },
    'GB44240-7.3': {
      waveform: {
        value: '正弦振動 (7 Hz → 200 Hz → 7 Hz)',
        detail: '正弦振動測試，頻率 7 Hz ~ 200 Hz ~ 7 Hz。圓柱形 2 個方向，方形和軟包 3 個方向。'
      },
      vibration_frequency: {
        value: '7 Hz～200 Hz～7 Hz',
        detail: '正弦振動測試，頻率 7 Hz ~ 200 Hz ~ 7 Hz。'
      },
      test_duration: {
        value: '每個方向 12 個循環 (共 3 小時)',
        detail: '每個方向進行 12 個循環，每個方向循環時間共計 3 小時。圓柱形 2 個方向，方形和軟包 3 個方向。'
      },
      axes: {
        value: '圓柱形 2 個方向；方形和軟包 3 個方向',
        detail: '圓柱形 2 個方向，方形和軟包 3 個方向。'
      }
    },
    'GB44240-7.4': {
      waveform: {
        value: '半正弦脈衝',
        detail: '半正弦脈衝，峰值 150 gn ± 25 gn，持續 6 ms ± 1 ms。大型電池 50 gn ± 8 gn，持續 11 ms ± 2 ms。'
      },
      acceleration_peak: {
        value: '150 gn ± 25 gn (大型電池 50 gn ± 8 gn)',
        detail: '峰值 150 gn ± 25 gn。大型電池 50 gn ± 8 gn。'
      },
      pulse_duration: {
        value: '6 ms ± 1 ms (大型電池 11 ms ± 2 ms)',
        detail: '持續 6 ms ± 1 ms。大型電池持續 11 ms ± 2 ms。'
      },
      shock_count: {
        value: '圓柱 12 次；方形軟包 18 次',
        detail: '每個方向進行三次衝擊，接著反方向三次。圓柱 12 次，方形軟包 18 次。'
      },
      direction: {
        value: '每個方向正反各 3 次',
        detail: '每個方向進行三次衝擊，接著反方向三次。'
      }
    },
    'GB44240-7.5': {
      soc: {
        value: '放電至額定容量 50%',
        detail: '試驗前需將樣品放電至額定容量的 50%。'
      },
      steel_bar: {
        value: '直徑 15.8 ± 0.1 mm 金屬棒',
        detail: '直徑 15.8 ± 0.1 mm 鋼棒橫置於電芯中心（電池幾何中心表面）。方形和軟包電池僅對其寬面進行衝擊。'
      },
      impact_mass: {
        value: '9.1 ± 0.1 kg 重物',
        detail: '採用質量為 9.1 kg ± 0.1 kg 的重物（9.1 ± 0.1 kg 重錘）。'
      },
      drop_height: {
        value: '610 ± 25 mm 自由落體',
        detail: '從 610 mm ± 25 mm 高度自由落體撞擊（自 610 ± 25 mm 落下）。'
      },
      orientation: {
        value: '圓柱縱軸向與重物表面平行，金屬棒與縱軸垂直；方形和軟包僅對寬面衝擊',
        detail: '圓柱形電池衝擊時使其縱軸向與重物表面平行，金屬棒與電池縱軸向垂直且盡量與衝擊面平行。方形和軟包電池僅對其寬面進行衝擊。'
      }
    },
    'GB44240-7.8': {
      heating_rate: {
        value: '5 ± 2 °C/min',
        detail: '升溫速率 5 ± 2 °C/min，達 130 ± 2 °C 後恆溫。'
      },
      target_temperature: {
        value: '130 ± 2 °C',
        detail: '升溫速率 5 ± 2 °C/min，達 130 ± 2 °C 後恆溫。'
      },
      duration: {
        value: '持續 1 小時',
        detail: '持續 1 小時。'
      }
    },
    'GB44240-8.3': {
      charging_current: {
        value: '推薦最大充電電流',
        detail: '用推薦最大充電電流充電。BMS 應控制充電電壓不超過充電上限電壓。'
      },
      charging_voltage: {
        value: '≥ 1.1 倍充電上限電壓',
        detail: '充電電壓設定為大於等於上限電壓的 1.1 倍。如果電壓超過 103% 或過充時間達到 1 分鐘，則停止。'
      },
      termination: {
        value: 'BMS 控制電壓不超上限；電壓超 103% 或時間達 1 分鐘停止',
        detail: 'BMS 應控制充電電壓不超過充電上限電壓。如果電壓超過 103% 或過充時間達到 1 分鐘，則停止。'
      },
      cycles: {
        value: '連續重複試驗 3 次',
        detail: '依上述步驟連續重複試驗 3 次。'
      },
      operating_conditions: {
        value: 'BMS 控制充電電壓不超過充電上限電壓',
        detail: 'BMS 應控制充電電壓不超過充電上限電壓。'
      }
    },
    'GB44240-8.4': {
      current: {
        value: '比最大充電電流大 20% (1.2 倍)',
        detail: '以比最大充電電流大 20% 的電流進行充電。BMS 應控制充電電流不超過最大充電電流。'
      },
      termination: {
        value: 'BMS 控制充電電流不超過最大充電電流',
        detail: 'BMS 應控制充電電流不超過最大充電電流。'
      },
      cycles: {
        value: '連續重複試驗 3 次',
        detail: '依上述步驟連續重複試驗 3 次。'
      },
      operating_conditions: {
        value: 'BMS 控制充電電流不超過最大充電電流',
        detail: 'BMS 應控制充電電流不超過最大充電電流。'
      }
    },
    'GB44240-8.5': {
      discharge_current: {
        value: '最大放電電流',
        detail: '使用最大放電電流進行測試。BMS 應控制放電電壓不低於放電截止電壓。'
      },
      termination: {
        value: 'BMS 控制放電電壓不低於放電截止電壓',
        detail: 'BMS 應控制放電電壓不低於放電截止電壓。'
      },
      cycles: {
        value: '連續重複試驗 3 次',
        detail: '依上述步驟連續重複試驗 3 次。'
      }
    },
    'GB44240-8.6': {
      soc: {
        value: '預先充電至 50% SOC',
        detail: '試驗前預先充電至 50% SOC。'
      },
      target_temperature: {
        value: '高於最高工作溫度 5 °C',
        detail: '將環境溫度升高至高於最高工作溫度 5 °C。BMS 應控制溫度不超過上限充放電溫度。'
      },
      operation: {
        value: 'BMS 控制溫度不超過上限充放電溫度',
        detail: 'BMS 應控制溫度不超過上限充放電溫度。'
      }
    },
    'GB44240-9.7.1': {
      trigger: {
        value: '加熱功率依單電池能量縮放 (30 W 至 >600 W)',
        detail: '加熱功率依據 Appendix B (Table B.1) 的單電池能量進行縮放（範圍從 30W 至大於 600W 不等）。'
      },
      heating_power: {
        value: '30 W 至大於 600 W (依附錄 B 表 B.1)',
        detail: '加熱功率依據 Appendix B (Table B.1) 的單電池能量進行縮放（範圍從 30W 至大於 600W 不等）。'
      },
      termination_for_trigger: {
        value: '溫度達到 300 °C 時停止加熱',
        detail: '當溫度達到 300 °C 時停止加熱。'
      }
    },
    'GB44240-9.7.2': {
      trigger: {
        value: '激光加熱為首選 (或其他觸發單體，依附錄 C、D)',
        detail: '按照附錄 C、D 進行熱擴散試驗程序。激光加熱為首選。'
      }
    },
    'GB44240-9.3': {
      voltage: {
        value: '直流 500 V',
        detail: '施加直流 500 V 電壓 60 秒。'
      },
      duration: {
        value: '60 秒',
        detail: '施加直流 500 V 電壓 60 秒。'
      },
      method: {
        value: '按照 GB 4943.1—2022 規定',
        detail: '相關檢驗方法按照 GB 4943.1—2022 的規定。'
      }
    }
  };
}

applyStandardHarmonization('GB44240', getGb44240Updates());
