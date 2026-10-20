import { applyStandardHarmonization } from './harmonize_std.mjs';

function getGb40559Updates() {
  return {
    'GB40559-6.1': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      temperature: {
        value: '57 ± 4 °C',
        detail: '放置在 57 °C ± 4 °C 的環境中，待電池溫度達到後保持 30 分鐘。'
      },
      external_resistance: {
        value: '20 ± 5 mΩ',
        detail: '用導線連接電池正負極端，確保全部外部電阻為 20 mΩ ± 5 mΩ。'
      },
      termination: {
        value: '降溫達最大值 20% 或短接時間達 24 小時',
        detail: '電池溫度下降值達到溫度最大值的 20% 或短接時間達到 24 小時。'
      },
      apparatus: {
        value: '達溫後保持 30 分鐘',
        detail: '待電池溫度達到後保持 30 分鐘。'
      }
    },
    'GB40559-6.2': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      charging_current: {
        value: '最大充電電流',
        detail: '用製造商規定的最大充電電流繼續充電。'
      },
      charging_voltage: {
        value: '1.5 倍充電限制電壓',
        detail: '至 1.5 倍充電限制電壓後持續恆壓充電 1 小時，或總充電時間達到 1.5 小時。'
      },
      termination: {
        value: '恆壓 1 小時或總充電時間達 1.5 小時',
        detail: '至 1.5 倍充電限制電壓後持續恆壓充電 1 小時，或總充電時間達到 1.5 小時。'
      }
    },
    'GB40559-6.3': {
      soc: {
        value: '放空狀態 (0% SOC)',
        detail: '按照 4.5.2 規定的試驗方法放完電。'
      },
      current: {
        value: '1 It 反向充電',
        detail: '以 1 It 電流進行反向充電至電壓達到負的充電上限電壓值。'
      },
      duration: {
        value: '總計 90 分鐘',
        detail: '反向充電時間共計 90 分鐘，若未達負電壓則維持電流，若達到則減小電流保持該電壓。'
      }
    },
    'GB40559-7.1': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      pressure: {
        value: '11.6 kPa (模擬海拔 15240 m)',
        detail: '放置於 20 °C ± 5 °C 的真空箱中，抽真空將箱內壓強降低至 11.6 kPa。'
      },
      temperature: {
        value: '20 ± 5 °C',
        detail: '放置於 20 °C ± 5 °C 的真空箱中。'
      },
      duration: {
        value: '至少 6 小時',
        detail: '保持至少 6 小時。'
      }
    },
    'GB40559-7.2': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      high_temperature: {
        value: '72 ± 2 °C (保持 6 小時)',
        detail: '升溫至 72 °C ± 2 °C 保持 6 小時。重複 10 次循環，轉換時間不大於 30 分鐘，隨後在室溫保存 24 小時。'
      },
      low_temperature: {
        value: '-40 ± 2 °C (保持 6 小時)',
        detail: '降溫至 -40 °C ± 2 °C 保持 6 小時。轉換時間不大於 30 分鐘。'
      },
      transition_time: {
        value: '≤ 30 分鐘',
        detail: '轉換時間不大於 30 分鐘。'
      },
      cycles: {
        value: '10 次循環 (隨後在室溫保存 24 小時)',
        detail: '重複 10 次循環，轉換時間不大於 30 分鐘，隨後在室溫保存 24 小時。'
      }
    },
    'GB40559-7.3': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      waveform: {
        value: '對數掃頻 (7 Hz → 200 Hz → 7 Hz)',
        detail: '對數掃頻循環時間 15 分鐘。試驗後進行 1 次充放電循環。'
      },
      vibration_frequency: {
        value: '7 Hz～200 Hz～7 Hz',
        detail: '對數掃頻循環時間 15 分鐘。'
      },
      sweep_rate: {
        value: '對數掃頻時間 15 分鐘',
        detail: '對數掃頻循環時間 15 分鐘。'
      },
      test_duration: {
        value: '每個方向 12 個循環 (共計 3 小時)',
        detail: '每個方向進行 12 個循環，共計 3 小時。圓柱形 2 個方向，方形和軟包 3 個方向。試驗後進行 1 次充放電循環。'
      },
      axes: {
        value: '圓柱形 2 個方向；方形和軟包 3 個方向',
        detail: '圓柱形 2 個方向，方形和軟包 3 個方向。'
      }
    },
    'GB40559-7.4': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      waveform: {
        value: '半正弦脈衝 (最小平均加速度 75 gn)',
        detail: '半正弦脈衝，最小平均加速度 75 gn，峰值 150 gn ± 25 gn。'
      },
      acceleration_peak: {
        value: '峰值 150 gn ± 25 gn',
        detail: '半正弦脈衝，最小平均加速度 75 gn，峰值 150 gn ± 25 gn。'
      },
      pulse_duration: {
        value: '6 ms ± 1 ms',
        detail: '脈衝持續時間為 6 ms ± 1 ms。'
      },
      shock_count: {
        value: '每方向 3 次 (圓柱共 12 次，方形軟包共 18 次)',
        detail: '每個方向 3 次。圓柱形 2 個方向正反共 12 次；方形和軟包 3 個方向正反共 18 次。'
      },
      direction: {
        value: '圓柱形 2 個方向正反；方形和軟包 3 個方向正反',
        detail: '圓柱形 2 個方向正反共 12 次；方形和軟包 3 個方向正反共 18 次。'
      }
    },
    'GB40559-7.5': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      drop_height: {
        value: '1 m ± 0.01 m',
        detail: '自由落體跌落於混凝土板上。'
      },
      drop_surface: {
        value: '混凝土板',
        detail: '自由落體跌落於混凝土板上。'
      },
      drop_count: {
        value: '圓柱形 4 次；方形和軟包 6 次',
        detail: '圓柱形兩個端面各 1 次、圓柱面 2 次（共 4 次）；方形和軟包每個面各 1 次（共 6 次）。'
      },
      orientation: {
        value: '圓柱形兩端面各 1 次、圓柱面 2 次；方形和軟包各面各 1 次',
        detail: '圓柱形兩個端面各 1 次、圓柱面 2 次（共 4 次）；方形和軟包每個面各 1 次（共 6 次）。'
      }
    },
    'GB40559-7.6.1': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      steel_bar: {
        value: '直徑 15.8 mm 金屬棒橫置表面',
        detail: '放置有 15.8 mm 金屬棒的電池表面。'
      },
      impact_mass: {
        value: '重物 9.1 ± 0.1 kg',
        detail: '重物 9.1 kg ± 0.1 kg。'
      },
      drop_height: {
        value: '610 ± 25 mm 自由落體',
        detail: '從 610 mm ± 25 mm 高處自由落體撞擊放置有 15.8 mm 金屬棒的電池表面。'
      },
      duration: {
        value: '觀察 6 小時',
        detail: '試驗後觀察 6 小時。'
      }
    },
    'GB40559-7.6.2': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      crush_speed: {
        value: '0.1 mm/s',
        detail: '速度 0.1 mm/s。'
      },
      force: {
        value: '13.0 ± 0.78 kN',
        detail: '兩平板間施加 13.0 kN ± 0.78 kN 的擠壓力，速度 0.1 mm/s。方形軟包使用 25 mm 鋼質半圓柱體。'
      },
      apparatus: {
        value: '兩平板 (方形軟包使用 25 mm 鋼質半圓柱體)',
        detail: '兩平板間施加 13.0 kN ± 0.78 kN 的擠壓力，速度 0.1 mm/s。方形軟包使用 25 mm 鋼質半圓柱體。'
      },
      termination: {
        value: '壓力達最大值或電池電壓降 1/3',
        detail: '壓力達到最大值或電池電壓下降三分之一。'
      }
    },
    'GB40559-7.7': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      heating_rate: {
        value: '5 ± 2 °C/min',
        detail: '以 5 °C/min ± 2 °C/min 的溫升速率進行升溫。'
      },
      target_temperature: {
        value: '130 ± 2 °C',
        detail: '箱內溫度達到 130 °C ± 2 °C 後恆溫，並持續 30 分鐘。'
      },
      duration: {
        value: '持續 30 分鐘',
        detail: '箱內溫度達到 130 °C ± 2 °C 後恆溫，並持續 30 分鐘。'
      }
    },
    'GB40559-7.8': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      nail_diameter: {
        value: '直徑 ϕ5 mm 耐高溫鋼針',
        detail: '直徑 ϕ5 mm 的耐高溫鋼針，針尖圓錐角 45°。'
      },
      needle_diameter: {
        value: '圓錐角 45°',
        detail: '針尖圓錐角 45°。'
      },
      penetration_speed: {
        value: '25 ± 5 mm/s',
        detail: '以 25 mm/s ± 5 mm/s 的速度貫穿電池幾何中心。'
      },
      hold_duration: {
        value: '停留在電池中，觀察 1 小時',
        detail: '鋼針停留在電池中，並觀察 1 小時。'
      }
    },
    'GB40559-8.1': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      pressure: {
        value: '11.6 kPa (同 7.1)',
        detail: '同 7.1 試驗方法，抽真空至 11.6 kPa。放置於 20 °C ± 5 °C 的真空箱中。'
      },
      temperature: {
        value: '20 ± 5 °C',
        detail: '放置於 20 °C ± 5 °C 的真空箱中。'
      },
      duration: {
        value: '至少 6 小時',
        detail: '保持至少 6 小時。'
      }
    },
    'GB40559-8.2': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      high_temperature: {
        value: '72 ± 2 °C (保持 6 小時)',
        detail: '同 7.2 試驗方法，72 °C ± 2 °C 保持 6 小時。重複 10 次循環，轉換時間不大於 30 分鐘。'
      },
      low_temperature: {
        value: '-40 ± 2 °C (保持 6 小時)',
        detail: '-40 °C ± 2 °C 保持 6 小時。轉換時間不大於 30 分鐘。'
      },
      transition_time: {
        value: '≤ 30 分鐘',
        detail: '轉換時間不大於 30 分鐘。'
      },
      cycles: {
        value: '10 次循環',
        detail: '重複 10 次循環。'
      }
    },
    'GB40559-8.3': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      waveform: {
        value: '正弦振動 (依 7.3 或表 5)',
        detail: '按照 3 個相互垂直的方向依次進行振動試驗，每個方向 12 次循環，共計 3 小時。'
      },
      vibration_frequency: {
        value: '7 Hz～200 Hz～7 Hz',
        detail: '頻率 7 Hz~200 Hz~7 Hz。'
      },
      acceleration_peak: {
        value: '質量 ≤ 12 kg：最大 8 gn (參考 7.3)；質量 > 12 kg：最大 2 gn (參考表 5)',
        detail: '質量 ≤ 12 kg 參考 7.3 (最大 8 gn)，質量 > 12 kg 參考表 5 (最大 2 gn)，頻率 7 Hz~200 Hz~7 Hz。'
      },
      test_duration: {
        value: '每個方向 12 次循環 (共計 3 小時)',
        detail: '按照 3 個相互垂直的方向依次進行振動試驗，每個方向 12 次循環，共計 3 小時。'
      },
      axes: {
        value: '3 個相互垂直方向',
        detail: '按照 3 個相互垂直的方向依次進行試驗。'
      }
    },
    'GB40559-8.4': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      waveform: {
        value: '半正弦脈衝衝擊',
        detail: '半正弦脈衝衝擊。'
      },
      acceleration_peak: {
        value: '質量 ≤ 12 kg：150 gn 與 √(100850/m) 取小者；質量 > 12 kg：50 gn 與 √(30000/m) 取小者',
        detail: '質量 ≤ 12 kg 為 150 gn 和 √(100850/m) (取小者)；質量 > 12 kg 為 50 gn 和 √(30000/m) (取小者)。'
      },
      pulse_duration: {
        value: '質量 ≤ 12 kg 為 6 ms；質量 > 12 kg 為 11 ms',
        detail: '質量 ≤ 12 kg 為 6 ms，質量 > 12 kg 為 11 ms。'
      },
      shock_count: {
        value: '每方向 3 次 (3 個相互垂直方向正反共 18 次，圓柱形 12 次)',
        detail: '按照 3 個相互垂直的方向依次進行試驗，每個方向 3 次，共 18 次（圓柱形 12 次）。'
      },
      direction: {
        value: '3 個相互垂直方向正反',
        detail: '按照 3 個相互垂直的方向依次進行試驗。'
      }
    },
    'GB40559-8.5': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      drop_height: {
        value: '10 cm 至 100 cm (依重量：<7 kg 為 100 cm，7～20 kg 遞減，≥20 kg 為 10 cm)',
        detail: '根據重量：<7 kg 為 100 cm，7~20 kg 按公式遞減，≥20 kg 為 10 cm。'
      },
      drop_surface: {
        value: '平整混凝土基座上鋪設厚度 20 mm 硬質木板',
        detail: '跌落表面為鋪設在平整混凝土基座上的厚度 20 mm 硬質木板。自由落體跌落於混凝土板上。'
      },
      orientation: {
        value: '6 個面各跌落 1 次',
        detail: '將樣品的 6 個面進行跌落。'
      },
      drop_count: {
        value: '6 個面各 1 次 (共 6 次)',
        detail: '將樣品的 6 個面進行跌落。'
      }
    },
    'GB40559-8.6': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      temperature: {
        value: '70 ± 2 °C',
        detail: '在鼓風恆溫箱中進行擱置。'
      },
      duration: {
        value: '7 小時 (隨後恢復至室溫)',
        detail: '擱置 7 小時，然後取出樣品並恢復至室溫。'
      }
    },
    'GB40559-8.7': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      liquid: {
        value: '質量分數 3.5% NaCl 水溶液',
        detail: '室溫下浸泡在質量分數為 3.5% 的 NaCl 水溶液中。'
      },
      depth: {
        value: '比樣品高出 5 cm～10 cm',
        detail: '水深應完全淹沒試驗樣品且比試驗樣品高出 5 cm ~ 10 cm。'
      },
      duration: {
        value: '至少 30 分鐘 (擱置 24 小時後充放電循環 1 次)',
        detail: '浸泡至少 30 分鐘。將樣品擱置 24 小時，若還能放電則進行一次充放電循環。'
      }
    },
    'GB40559-8.8': {
      enclosure_material: {
        value: '外殼：不低於 V-0 級；其他封裝：不低於 V-1 級；泡沫：不低於 HF-1 級',
        detail: '外殼應為不低於 V-0 級材料，PCB 板不低於 V-1 級，其他封裝材料不低於 V-1 級，泡沫材料不低於 HF-1 級。'
      },
      pcb_material: {
        value: 'PCB 板：不低於 V-1 級',
        detail: 'PCB 板不低於 V-1 級。'
      }
    },
    'GB40559-8.9': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      trigger: {
        value: '中心位置或被包圍單體加熱或過充觸發',
        detail: '選擇電池組內靠近中心位置或被包圍的單體電池進行熱擴散觸發。加熱或過充。'
      },
      heating_power: {
        value: '30 W 至 300 W (<80 Wh 為 30～200 W，≥80 Wh 為 100～300 W)',
        detail: '依據單體額定能量選擇 30~200 W (<80 Wh) 或 100~300 W (≥80 Wh)。'
      }
    },
    'GB40559-9.2': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      charging_current: {
        value: '最大充電電流恆流充電',
        detail: '用最大充電電流恆流充電至 1.2 倍充電上限電壓或承受最高電壓。'
      },
      charging_voltage: {
        value: '1.2 倍充電上限電壓或承受最高電壓',
        detail: '用最大充電電流恆流充電至 1.2 倍充電上限電壓或承受最高電壓。'
      },
      cycles: {
        value: '500 次循環 (隨後在 BMS 單一故障下測試 1 次)',
        detail: '500 次循環測試，每次測試 BMS 均應切斷充電電路。隨後在 BMS 單一故障下測試 1 次。'
      }
    },
    'GB40559-9.3': {
      soc: {
        value: '放空電後，單一並聯塊充電至 50% SOC 產生不均衡',
        detail: '放空電後，單一並聯塊充電至 50% SOC 產生不均衡，再對電池組整體充電。'
      },
      charging_voltage: {
        value: '1.05 倍單體充電上限電壓 (BMS 應禁止充電)',
        detail: '在該並聯塊電壓達到 1.05 倍電池充電上限電壓之前，BMS 應禁止充電。'
      },
      cycles: {
        value: '選用 3 個不同並聯塊測試 3 次',
        detail: '選用 3 個不同的並聯塊，共進行 3 次測試。'
      }
    },
    'GB40559-9.4': {
      soc: {
        value: '放空狀態 (0% SOC)',
        detail: '按照 4.5.2 規定的試驗方法放完電。'
      },
      discharge_current: {
        value: '最大放電電流 (Idm) 恆流放電',
        detail: '用最大放電電流 Idm 恆流放電。'
      },
      cycles: {
        value: '電動滑板車 500 次循環；電動平衡車 3 次測試',
        detail: '電動滑板車 500 次循環測試；電動平衡車 3 次測試。'
      }
    },
    'GB40559-9.5': {
      soc: {
        value: '放空狀態 (0% SOC)',
        detail: '按照 4.5.2 規定的試驗方法放完電。'
      },
      current: {
        value: '1.5 倍過流充電保護電流',
        detail: '以 1.5 倍過流充電保護電流恆流充電至充電上限電壓。'
      },
      charging_voltage: {
        value: '充電上限電壓',
        detail: '以 1.5 倍過流充電保護電流恆流充電至充電上限電壓。'
      },
      cycles: {
        value: '500 次循環 (每次 BMS 應動作)',
        detail: '進行 500 次循環測試，每次測試 BMS 都應動作。'
      }
    },
    'GB40559-9.6': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      current: {
        value: '1.5 倍過流放電保護電流',
        detail: '以 1.5 倍過流放電保護電流恆流放電。'
      },
      cycles: {
        value: '測試 3 次',
        detail: '將樣品進行 3 次測試。'
      }
    },
    'GB40559-9.7': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      external_resistance: {
        value: '20 ± 5 mΩ',
        detail: '短路正負極端子或 BMS 中的輸出端子，外部電阻 20 mΩ ± 5 mΩ。'
      },
      apparatus: {
        value: '500 次循環短路測試 (隨後在 BMS 單一故障下測試 1 次)',
        detail: '500 次循環短路測試，隨後在 BMS 單一故障下測試 1 次。'
      }
    },
    'GB40559-9.8': {
      soc: {
        value: '放空狀態 (0% SOC)',
        detail: '按照 4.5.2 規定的試驗方法放完電。'
      },
      operation: {
        value: '高溫 (最高充電溫或 55 °C 取大者加 5 °C) 放 8 小時並嘗試充電；低溫 (最低充電溫或 0 °C 取小者降 5 °C) 放 16 小時並嘗試充電',
        detail: '在最高充電溫度或 55 °C(取大者)加 5 °C 下放 8 小時並嘗試充電；在最低充電溫度或 0 °C(取小者)再降 5 °C 下放 16 小時並嘗試充電。'
      },
      duration: {
        value: '高溫放置 8 小時，低溫放置 16 小時',
        detail: '在最高充電溫度或 55 °C(取大者)加 5 °C 下放 8 小時並嘗試充電；在最低充電溫度或 0 °C(取小者)再降 5 °C 下放 16 小時並嘗試充電。'
      }
    },
    'GB40559-9.9': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 4.5.1 規定的試驗方法充滿電。'
      },
      target_temperature: {
        value: '最高放電溫度或 45 °C (取大者) 加 5 °C',
        detail: '在最高放電溫度或 45 °C(取大者) 加 5 °C 的環境下放置 8 小時，然後嘗試放電。'
      },
      duration: {
        value: '放置 8 小時後嘗試放電',
        detail: '在最高放電溫度或 45 °C(取大者) 加 5 °C 的環境下放置 8 小時，然後嘗試放電。'
      },
      operation: {
        value: '放置 8 小時後嘗試放電',
        detail: '在最高放電溫度或 45 °C(取大者) 加 5 °C 的環境下放置 8 小時，然後嘗試放電。'
      }
    },
    'GB40559-9.10': {
      soc: {
        value: '放空狀態 (0% SOC)',
        detail: '按照 4.5.2 規定的試驗方法放完電。'
      },
      charging_current: {
        value: '1 It 反向充電至負的充電上限電壓',
        detail: '以 1 It 電流進行反向充電至負的充電上限電壓。'
      },
      cycles: {
        value: '測試 3 次',
        detail: '將樣品進行 3 次測試。'
      }
    }
  };
}

applyStandardHarmonization('GB40559', getGb40559Updates());
