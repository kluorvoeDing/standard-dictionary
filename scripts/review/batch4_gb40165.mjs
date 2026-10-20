import { applyStandardHarmonization } from './harmonize_std.mjs';

function getGb40165Updates() {
  return {
    'GB40165-6.1': {
      soc: {
        value: '100% SOC',
        detail: '按照 4.5.1 規定的試驗方法充滿電後。'
      },
      temperature: {
        value: '55 ± 5 °C',
        detail: '放置在 55 °C ± 5 °C 的環境中，待電池達到 55 °C ± 5 °C 後，再放置 30 分鐘。'
      },
      external_resistance: {
        value: '≤ 30 mΩ',
        detail: '用導線連接正負極端，確保全部外部電阻不高於 30 mΩ。'
      },
      termination: {
        value: '溫降達峰值溫升 50% 或短接時間達 24 小時',
        detail: '電池溫度下降值達到峰值溫升 50%；或短接時間達到 24 小時。'
      },
      apparatus: {
        value: '表面達溫後再放置 30 分鐘',
        detail: '待電池達到 55 °C ± 5 °C 後，再放置 30 分鐘。'
      }
    },
    'GB40165-6.2': {
      soc: {
        value: '100% SOC',
        detail: '按照 4.5.1 規定的試驗方法充滿電後。'
      },
      charging_current: {
        value: '最大持續充電電流',
        detail: '用製造商規定的最大持續充電電流充電。'
      },
      charging_voltage: {
        value: '1.2 倍充電上限電壓或 5 V (標稱 < 3 V 者為 1.5 倍)',
        detail: '充電至 1.2 倍的充電上限電壓或 5 V (取兩者較大值)。對於標稱電壓小於 3 V 的電池，充至 1.5 倍。'
      },
      termination: {
        value: '恆壓 1 小時或溫降達峰值溫升 50%',
        detail: '充電至規定電壓後持續充電時間達到 1 小時；或電池溫度下降值達到峰值溫升 50%。'
      }
    },
    'GB40165-6.3': {
      soc: {
        value: '放完電後 (0% SOC)',
        detail: '按照 4.5.2 規定的試驗方法放完電後。'
      },
      current: {
        value: '1C A 反向充電',
        detail: '以 1C A 電流進行反向充電。'
      },
      duration: {
        value: '90 分鐘',
        detail: '反向充電至負的充電上限電壓，反向充電時間共計 90 分鐘。'
      }
    },
    'GB40165-7.1': {
      soc: {
        value: '100% SOC',
        detail: '按照 4.5.1 規定的試驗方法充滿電後。'
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
    'GB40165-7.2': {
      soc: {
        value: '100% SOC',
        detail: '按照 4.5.1 規定的試驗方法充滿電後。'
      },
      high_temperature: {
        value: '72 ± 2 °C (保持 6 小時)',
        detail: '升為 72 °C ± 2 °C，保持 6 小時；溫度轉換時間不大於 30 分鐘。對於大型鋰離子電池，暴露於極端試驗溫度的時間至少應為 12 小時。'
      },
      low_temperature: {
        value: '-40 ± 2 °C (保持 6 小時)',
        detail: '降為 -40 °C ± 2 °C，保持 6 小時；溫度轉換時間不大於 30 分鐘。'
      },
      transition_time: {
        value: '≤ 30 分鐘',
        detail: '溫度轉換時間不大於 30 分鐘。'
      },
      cycles: {
        value: '10 次循環 (大型電池極端溫度至少 12 小時)',
        detail: '共循環 10 次。對於大型鋰離子電池，暴露於極端試驗溫度的時間至少應為 12 小時。'
      }
    },
    'GB40165-7.3': {
      soc: {
        value: '100% SOC',
        detail: '按照 4.5.1 規定的試驗方法充滿電後。'
      },
      waveform: {
        value: '正弦振動 (7 Hz → 200 Hz → 7 Hz)',
        detail: '按表 4 中的參數進行正弦振動測試 (7 Hz~200 Hz~7 Hz，加速度幅值高達 8 gn)。'
      },
      vibration_frequency: {
        value: '7 Hz～200 Hz～7 Hz (依表 4)',
        detail: '按表 4 中的參數進行正弦振動測試 (7 Hz~200 Hz~7 Hz，加速度幅值高達 8 gn)。'
      },
      acceleration_peak: {
        value: '高達 8 gn (依表 4)',
        detail: '按表 4 中的參數進行正弦振動測試 (7 Hz~200 Hz~7 Hz，加速度幅值高達 8 gn)。'
      },
      test_duration: {
        value: '每個方向 12 個循環 (共 3 小時)',
        detail: '每個方向進行 12 個循環，每個方向循環時間共計 3 小時的振動。'
      }
    },
    'GB40165-7.4': {
      soc: {
        value: '100% SOC',
        detail: '按照 4.5.1 規定的試驗方法充滿電後。'
      },
      waveform: {
        value: '半正弦脈衝衝擊',
        detail: '半正弦脈衝衝擊，峰值加速度 150 gn，脈衝持續時間 6 ms (大型電池 50 gn, 11 ms)。'
      },
      acceleration_peak: {
        value: '150 gn (大型電池 50 gn)',
        detail: '峰值加速度 150 gn (大型電池 50 gn)。'
      },
      pulse_duration: {
        value: '6 ms (大型電池 11 ms)',
        detail: '脈衝持續時間 6 ms (大型電池 50 gn, 11 ms)。'
      },
      shock_count: {
        value: '總共 18 次 (圓柱形電池 12 次)',
        detail: '每個方向進行三次衝擊，接著在反方向進行三次衝擊，總共進行 18 次衝擊 (圓柱形電池 12 次)。'
      }
    },
    'GB40165-7.5': {
      soc: {
        value: '100% SOC',
        detail: '按照 4.5.1 規定的試驗方法充滿電後。'
      },
      drop_height: {
        value: 'm < 7 kg 跌落 100 cm (依質量選擇)',
        detail: '根據質量選擇跌落高度，m<7 kg 跌落 100 cm，自由跌落於混凝土板上。'
      },
      drop_surface: {
        value: '混凝土板',
        detail: '自由跌落於混凝土板上。'
      }
    },
    'GB40165-7.6.1': {
      applicability: {
        value: '圓柱直徑 ≥ 18.0 mm 電池',
        detail: '適用於直徑大於或等於 18.0 mm 的圓柱形電池。'
      },
      soc: {
        value: '50% SOC',
        detail: '按照 4.5.2 規定的試驗方法放出 50% 電量。'
      },
      steel_bar: {
        value: '直徑 15.8 ± 0.1 mm 鋼棒橫置於樣品表面',
        detail: '直徑 15.8 ± 0.1 mm 鋼棒橫置於樣品表面，9.1 ± 0.1 kg 重錘自 610 ± 25 mm 自由落下。'
      },
      impact_mass: {
        value: '9.1 ± 0.1 kg 重物',
        detail: '9.1 kg 重物（9.1 ± 0.1 kg 重錘）。'
      },
      drop_height: {
        value: '610 ± 25 mm 自由落體',
        detail: '從 610 mm 高處（自 610 ± 25 mm 自由落下）撞擊。'
      }
    },
    'GB40165-7.6.2': {
      applicability: {
        value: '稜柱型、軟包裝和直徑 < 18.0 mm 圓柱電池',
        detail: '適用於稜柱型、軟包裝和直徑小於 18.0 mm 的圓柱形電池。'
      },
      soc: {
        value: '100% SOC',
        detail: '按照 4.5.1 規定的試驗方法充滿電後。'
      },
      apparatus: {
        value: '半徑 75 mm 半圓柱壓頭 或 平整鋼壓板',
        detail: '半徑 75 mm 之圓柱壓板或平整鋼壓板，液壓平穩施壓。在兩個平面之間進行擠壓。'
      },
      force: {
        value: '13.0 ± 0.78 kN',
        detail: '兩平板間擠壓力達到 13.0 kN ± 0.78 kN；或電池的電壓下降至少 100 mV。'
      },
      termination: {
        value: '擠壓力達 13.0 ± 0.78 kN 或電壓降至少 100 mV',
        detail: '兩平板間擠壓力達到 13.0 kN ± 0.78 kN；或電池的電壓下降至少 100 mV。'
      }
    },
    'GB40165-7.7': {
      soc: {
        value: '100% SOC',
        detail: '按照 4.5.1 規定的試驗方法充滿電後。'
      },
      heating_rate: {
        value: '(5 ± 2) °C/min',
        detail: '以 (5±2) °C/min 的溫升速率升溫，當溫度達到 130 °C ± 2 °C 後恆溫。'
      },
      target_temperature: {
        value: '130 ± 2 °C',
        detail: '當溫度達到 130 °C ± 2 °C 後恆溫。'
      },
      duration: {
        value: '恆溫保持 1 小時 (單電池測試)',
        detail: '恆溫保持 1 小時 (單電池測試)。'
      }
    },
    'GB40165-8.1': {
      soc: {
        value: '100% SOC',
        detail: '按照 4.5.1 規定的試驗方法充滿電後。'
      },
      cycles: {
        value: '溫度循環試驗 (方法見 7.2)',
        detail: '進行溫度循環試驗，試驗方法見 7.2。'
      }
    },
    'GB40165-8.2': {
      soc: {
        value: '100% SOC',
        detail: '按照 4.5.1 規定的試驗方法充滿電後。'
      },
      waveform: {
        value: '正弦振動 (依表 4 或表 6)',
        detail: '標準電池組依據 7.3 (表 4)；僅大型電池組依據表 6 進行正弦振動。'
      },
      test_duration: {
        value: '每個方向 12 個循環 (共 3 小時)',
        detail: '每個方向進行 12 個循環，共計 3 小時的振動。依據 7.3 表 4 或表 6。'
      }
    },
    'GB40165-8.3': {
      soc: {
        value: '100% SOC',
        detail: '按照 4.5.1 規定的試驗方法充滿電後。'
      },
      waveform: {
        value: '加速度衝擊 (方法見 7.4)',
        detail: '進行加速度衝擊試驗，試驗方法見 7.4。'
      }
    },
    'GB40165-8.4': {
      soc: {
        value: '100% SOC',
        detail: '按照 4.5.1 的試驗方法充滿電後。'
      },
      drop_surface: {
        value: '混凝土板',
        detail: '對於非懸掛式大型電池組，最大平面向下跌落於混凝土板上，且採用最不利的跌落高度。'
      },
      orientation: {
        value: '依質量及表 5 選擇整體或角和邊跌落；非懸掛式大型電池組最大平面向下',
        detail: '根據樣品質量，按照表 5 選擇對整體或角和邊進行跌落試驗。對於非懸掛式大型電池組，最大平面向下跌落於混凝土板上，且採用最不利的跌落高度。'
      }
    },
    'GB40165-9.3': {
      soc: {
        value: '0% SOC',
        detail: '按照 4.5.2 規定的試驗方法放完電後。'
      },
      charging_current: {
        value: '推薦充電器的最大持續充電電流',
        detail: '用推薦充電器的最大持續充電電流充電至超過上限電壓 10%。'
      },
      charging_voltage: {
        value: '超過上限電壓 10% (110% 充電上限電壓)',
        detail: '用推薦充電器的最大持續充電電流充電至超過上限電壓 10%。終止動作必須在充電電壓達到 110% 充電上限電壓時或之前出現，並保持 1 小時。'
      },
      termination: {
        value: 'BMU/BMS 終止充電 (110% 充電上限電壓時或之前)，保持 1 小時',
        detail: '充電至 BMU/BMS 終止充電，終止動作必須在充電電壓達到 110% 充電上限電壓時或之前出現，並保持 1 小時。'
      },
      cycles: {
        value: '測試 3 次',
        detail: '將樣品進行 3 次測試。'
      }
    },
    'GB40165-9.4': {
      soc: {
        value: '0% SOC',
        detail: '按照 4.5.2 規定的試驗方法放完電後。'
      },
      current: {
        value: '超過最大持續充電電流 20% (120% 充電電流)',
        detail: '用超過最大持續充電電流 20% 的電流進行充電。'
      },
      termination: {
        value: 'BMU/BMS 發現過流並控制在最大持續充電電流以下，保持 1 小時',
        detail: 'BMU/BMS 應發現過流並將充電電流控制在最大持續充電電流以下，保持 1 小時。'
      },
      cycles: {
        value: '測試 3 次',
        detail: '將樣品進行 3 次測試。'
      }
    },
    'GB40165-9.5': {
      soc: {
        value: '100% SOC',
        detail: '按照 4.5.1 規定的試驗方法充滿電後。'
      },
      discharge_current: {
        value: '最大放電電流',
        detail: '用最大放電電流放電至樣品中任意一隻電池的放電電壓低於放電截止電壓 10%。'
      },
      termination: {
        value: 'BMU/BMS 終止放電 (低於 90% 放電截止電壓時或之前)，保持 1 小時',
        detail: '放電至 BMU/BMS 終止放電，這一動作應在放電電壓低於 90% 放電截止電壓時或之前出現，保持 1 小時。'
      },
      cycles: {
        value: '測試 3 次',
        detail: '將樣品進行 3 次測試。'
      }
    },
    'GB40165-9.6': {
      soc: {
        value: '100% SOC',
        detail: '按照 4.5.1 規定的試驗方法充滿電後。'
      },
      current: {
        value: '超過最大放電電流 20% (120% 放電電流)',
        detail: '用超過最大放電電流 20% 的電流進行放電。'
      },
      termination: {
        value: 'BMU/BMS 發現過流放電並控制在最大放電電流以下，保持 1 小時',
        detail: 'BMU/BMS 應發現過流放電並將放電電流控制在最大放電電流以下，保持 1 小時。'
      },
      cycles: {
        value: '測試 3 次',
        detail: '將樣品進行 3 次測試。'
      }
    },
    'GB40165-9.7': {
      soc: {
        value: '100% SOC',
        detail: '按照 4.5.1 規定的試驗方法充滿電後。'
      },
      external_resistance: {
        value: '30 ± 10 mΩ',
        detail: '短路樣品的正負極端子，外部短路總電阻為 30 mΩ ± 10 mΩ。'
      },
      termination: {
        value: 'BMU/BMS 發現短路並動作切斷電路，保持 1 小時',
        detail: 'BMU/BMS 應發現短路並動作切斷電路，保持 1 小時。'
      },
      apparatus: {
        value: '測試 3 次',
        detail: '將樣品進行 3 次測試。'
      }
    },
    'GB40165-9.8': {
      soc: {
        value: '0% SOC',
        detail: '按照 4.5.2 規定的試驗方法放完電後。'
      },
      current: {
        value: '1C A 反向充電',
        detail: '以 1C A 電流進行反向充電。'
      },
      termination: {
        value: 'BMU/BMS 發現反向充電並動作切斷充電電流，保持 1 小時',
        detail: 'BMU/BMS 應發現反向充電並動作切斷充電電流，保持 1 小時。'
      },
      cycles: {
        value: '測試 3 次',
        detail: '將樣品進行 3 次測試。'
      }
    },
    'GB40165-9.9': {
      soc: {
        value: '50% SOC',
        detail: '按照 4.5.2 規定的試驗方法放出 50% 電量。'
      },
      target_temperature: {
        value: '比最大工作溫度高 5 °C',
        detail: '使樣品的溫度上升至比最大工作溫度高 5 °C。在此高溫下繼續充電至 BMU/BMS 終止充電。'
      },
      operation: {
        value: '高溫下繼續充電至 BMU/BMS 終止充電，保持 1 小時；測試 3 次',
        detail: '使樣品的溫度上升至比最大工作溫度高 5 °C。在此高溫下繼續充電至 BMU/BMS 終止充電。試驗結束後保持 1 小時。將樣品進行 3 次測試。'
      },
      termination: {
        value: '保持 1 小時；測試 3 次',
        detail: '試驗結束後保持 1 小時。將樣品進行 3 次測試。'
      }
    }
  };
}

applyStandardHarmonization('GB40165', getGb40165Updates());
