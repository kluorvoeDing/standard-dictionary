import { applyStandardHarmonization } from './harmonize_std.mjs';

function getAis038Updates() {
  return {
    'AIS-038-IX-A': {
      soc: {
        value: '依 Annexure IX, Appendix 2 調整',
        detail: '測試開始前，SOC 應依 Annexure IX, Appendix 2 調整。'
      },
      temperature: {
        value: '22 ± 5 °C',
        detail: '測試應在環境溫度 22 ± 5 °C 下進行。'
      },
      waveform: {
        value: '正弦波對數掃頻 (7～50 Hz 耗時 15 分鐘)',
        detail: '振動波形為正弦波，以對數掃頻在 7 Hz 至 50 Hz 間往返，耗時 15 分鐘。'
      },
      vibration_frequency: {
        value: '7～50 Hz',
        detail: '7 Hz 至 50 Hz 間往返。'
      },
      acceleration_peak: {
        value: '7～18 Hz: 10 m/s²；18～30 Hz: 10→2 m/s²；30～50 Hz: 2 m/s²',
        detail: '依 Table 1：7-18 Hz 為 10 m/s²；18-30 Hz 逐漸從 10 降至 2 m/s²；30-50 Hz 為 2 m/s²。'
      },
      test_duration: {
        value: '12 次循環，共 3 小時（垂直安裝方向）；完成後 1 次標準循環與 1 小時觀察',
        detail: '每軸重複 12 次，總計 3 小時，施加於 REESS 之垂直安裝方向。振動後進行一次 (1) 標準循環，並在測試環境下觀察 1 小時。'
      },
      axes: {
        value: 'REESS 之垂直安裝方向',
        detail: '施加於 REESS 之垂直安裝方向。'
      }
    },
    'AIS-038-IX-B': {
      soc: {
        value: '依 Annexure IX, Appendix 2 調整',
        detail: '測試開始前，SOC 應依 Annexure IX, Appendix 2 調整。'
      },
      high_temperature: {
        value: '60 ± 2 °C (≥ 6 小時)',
        detail: '在 60 ± 2 °C 下存放至少 6 小時。'
      },
      low_temperature: {
        value: '-40 ± 2 °C (≥ 6 小時)',
        detail: '在 -40 ± 2 °C 下存放至少 6 小時。'
      },
      transition_time: {
        value: '≤ 30 分鐘',
        detail: '極端溫度之間的最大轉換時間不得超過 30 分鐘。'
      },
      dwell_time: {
        value: '各溫階 ≥ 6 小時；循環後 22 ± 5 °C 存放 24 小時；完成後 1 次標準循環與 1 小時觀察',
        detail: '各溫階存放至少 6 小時。循環完成後，樣品在 22 ± 5 °C 環境溫度下存放 24 小時。存放 24 小時後進行一次 (1) 標準循環，並觀察 1 小時。'
      },
      cycles: {
        value: '至少 5 次循環',
        detail: '重複上述程序，直到完成至少 5 次總循環。'
      }
    },
    'AIS-038-IX-C': {
      soc: {
        value: '依照 Annexure IX 一般測試條件調整 SOC',
        detail: '依照 Annexure IX 的一般測試條件調整 SOC。'
      },
      temperature: {
        value: '20 ± 10 °C',
        detail: '測試應在 20 ± 10 °C 環境溫度下進行。'
      },
      waveform: {
        value: '依車型加速度（M1/N1/M2/M3 車型規定時間與加速度範圍）',
        detail: '測試依據 M1/N1/M2/M3 車型規定的時間與加速度 (g) 範圍進行，並無強制指定半正弦或鋸齒波。'
      },
      acceleration_peak: {
        value: 'M1/N1: 縱向 20～28 g, 橫向 8～15 g；M2/M3/N2/N3: 縱向 10～17 g, 橫向 5～10 g',
        detail: 'M1 與 N1 車輛：縱向加速度峰值範圍約 20-28 g，橫向 8-15 g。M2/M3 與 N2/N3 車輛：縱向加速度峰值範圍約 10-17 g，橫向 5-10 g。'
      }
    },
    'AIS-038-IX-D': {
      soc: {
        value: '依照 Annexure IX 一般測試條件調整 SOC',
        detail: '依照 Annexure IX 的一般測試條件調整 SOC。'
      },
      temperature: {
        value: '20 ± 10 °C',
        detail: '測試應在 20 ± 10 °C 環境溫度下進行。'
      },
      force: {
        value: '100 kN～105 kN',
        detail: '施加至少 100 kN 但不超過 105 kN 的擠壓力 (除非另有規定)。'
      },
      crush_speed: {
        value: '施加力至目標值時間 < 3 分鐘',
        detail: '施加力至目標值的時間應小於 3 分鐘。'
      },
      duration: {
        value: '達到目標力後保持 100 ms～10 秒',
        detail: '達到目標力後保持時間為至少 100 毫秒且不超過 10 秒。'
      },
      orientation: {
        value: '水平且垂直於 REESS 安裝於車輛時行駛方向',
        detail: '力道應水平施加，並垂直於 REESS 安裝於車輛時的行駛方向。'
      },
      apparatus: {
        value: '≤ 600 × 600 mm 擠壓板 (crush plate)',
        detail: '使用 600 mm x 600 mm 或更小的擠壓板 (crush plate)。'
      }
    },
    'AIS-038-IX-E': {
      soc: {
        value: '依照 Annexure IX 一般測試條件調整 SOC',
        detail: '依照 Annexure IX 的一般測試條件調整 SOC。'
      },
      temperature: {
        value: '≥ 0 °C',
        detail: '測試應在至少 0 °C 的環境溫度下進行。'
      },
      fire_exposure: {
        value: '汽油池火（預熱 60 秒、直接火焰 70 秒、間接火焰 60 秒）或 LPG 噴嘴（800～1100 °C 燃燒 2 分鐘，30 秒內達 800 °C）',
        detail: '可選擇車輛級別或組件級別測試。組件級別可選用 Gasoline pool fire 或 LPG burner。Phase A (預熱) 60 秒；Phase B (直接火焰) 70 秒；Phase C (耐火磚阻隔間接火焰) 60 秒 (或延長 B 階段 60 秒)；Phase D (觀察) 3 小時。LPG 火焰平均溫度 30 秒內達 800 °C，維持在 800-1100 °C，受測設備暴露於火焰中 2 分鐘。測試後觀察 3 小時。'
      },
      burner: {
        value: '汽油池火或 LPG 燃燒器',
        detail: 'Gasoline pool fire 或 LPG burner。'
      },
      termination: {
        value: '火燒結束後觀察 3 小時或降至環境溫度',
        detail: '測試後觀察 3 小時。'
      }
    },
    'AIS-038-IX-F': {
      soc: {
        value: '依照 Annexure IX 一般測試條件調整 SOC',
        detail: '依照 Annexure IX 的一般測試條件調整 SOC。'
      },
      temperature: {
        value: '20 ± 10 °C（或應要求在更高溫度）',
        detail: '測試在 20 ± 10 °C 或應製造商要求在更高溫度下進行。'
      },
      external_resistance: {
        value: '≤ 5 mΩ (含接線)',
        detail: '使用不超過 5 mΩ (含接線) 的短路連接短接正負極。'
      },
      duration: {
        value: '持續至保護切斷或外殼溫度穩定後至少 1 小時',
        detail: '持續短路直到 REESS 保護功能切斷電流，或在測試設備外殼溫度穩定 (2 小時內溫度梯度變化 < 4 °C) 後至少持續 1 小時。'
      },
      termination: {
        value: '保護功能切斷電流，或溫度穩定後 1 小時；完成後 1 次標準循環與 1 小時觀察',
        detail: '持續短路直到 REESS 保護功能切斷電流，或在測試設備外殼溫度穩定 (2 小時內溫度梯度變化 < 4 °C) 後至少持續 1 小時。短路終止後直接進行一次 (1) 標準循環，並觀察 1 小時。'
      }
    },
    'AIS-038-IX-G': {
      soc: {
        value: '正常操作範圍中間值',
        detail: '測試前 SOC 調整至正常操作範圍的中間。'
      },
      temperature: {
        value: '20 ± 10 °C（或應要求在更高溫度）',
        detail: '測試在 20 ± 10 °C 或應製造商要求在更高溫度下進行。'
      },
      charging_current: {
        value: '製造商規定的最大充電電流',
        detail: '以外部充電設備提供製造商規定的最大充電電流進行充電。'
      },
      charging_voltage: {
        value: '大於電壓限制（高於限制 10% / 約 1.1 倍）',
        detail: '外部充放電設備的跳脫電壓設定應至少高於受測設備電壓限制的 10% (約 1.1 倍)。'
      },
      termination: {
        value: '保護啟動、溫度達最高工作溫度 +10 °C，或開始充電後 12 小時；完成後 1 次標準循環與 1 小時觀察',
        detail: '持續充電直到過充保護功能啟動。若失效，則持續至 REESS 溫度達到最高工作溫度以上 10 °C。若電流未中斷且溫度未超限，則在開始充電後 12 小時終止。終止後進行一次 (1) 標準循環，並觀察 1 小時。'
      }
    },
    'AIS-038-IX-H': {
      soc: {
        value: '正常操作範圍內較低水準',
        detail: '測試前 SOC 調整至正常操作範圍內的較低水準。'
      },
      temperature: {
        value: '20 ± 10 °C（或應要求在更高溫度）',
        detail: '測試在 20 ± 10 °C 或應製造商要求在更高溫度下進行。'
      },
      discharge_current: {
        value: '正常操作範圍內的穩定電流',
        detail: '以外部充放電設備進行放電，使用製造商規定的正常操作範圍內的穩定電流。'
      },
      termination: {
        value: '放電至額定電壓 25%、保護觸發或溫度穩定（2 小時內變化 < 4 °C）；完成後 1 次標準充放電與 1 小時觀察',
        detail: '放電至額定電壓的 25% 或保護觸發，或測試設備溫度穩定（2 小時內溫度梯度小於 4 °C）。試驗後，直接進行一次 (1) 標準充電，隨後進行一次 (1) 標準放電，並在測試環境下觀察 1 小時。'
      }
    },
    'AIS-038-IX-I': {
      target_temperature: {
        value: '高於最高工作溫度（確保溫度能持續上升）',
        detail: '測試環境溫度應設定為確保 REESS 溫度能持續上升的程度，或將 REESS 加熱至過溫保護預期作動之溫度。'
      },
      operation: {
        value: '在提高環境溫度下以正常範圍內使溫度最快上升之電流連續充放電',
        detail: '在提高的環境溫度下，以正常操作範圍內能使電芯溫度盡可能快速上升的電流進行連續充放電操作。'
      },
      termination: {
        value: '過溫保護功能啟動（冷卻啟動或電流限制/切斷）；未動作則持續至溫度穩定（2 小時內變化 < 4 °C）',
        detail: '持續測試直到過溫保護功能（如冷卻啟動或電流限制/切斷）成功啟動。若保護裝置未動作，則持續直到受測設備溫度穩定（2 小時內溫度梯度變化小於 4 °C）。'
      }
    },
    'AIS-038-IX-J': {
      soc: {
        value: '正常操作範圍的中間值',
        detail: '測試前將 REESS 的 SOC 調整至正常操作範圍的中間值。'
      },
      temperature: {
        value: '20 ± 10 °C',
        detail: '測試在 20 ± 10 °C 下進行。'
      },
      current: {
        value: '大於最大允許電流（透過協商決定）',
        detail: '過電流的大小與等級應透過與製造商協商來決定。'
      },
      termination: {
        value: '保護啟動並切斷/限制電流；未動作則持續至溫度穩定（2 小時內變化 < 4 °C）；完成後 1 次標準循環與 1 小時觀察',
        detail: '持續過電流直到過電流保護功能啟動並切斷或限制電流。若保護裝置未動作，則持續直到受測設備溫度穩定（2 小時內溫度梯度變化小於 4 °C）。終止後進行一次 (1) 標準循環，並觀察 1 小時。'
      }
    },
    'AIS-038-X': {
      soc: {
        value: '充滿電',
        detail: '測試前 SOC 應調整至滿充狀態。'
      },
      trigger: {
        value: '加熱 (Heating)、針刺 (Nail penetration) 或過充 (Overcharge)',
        detail: '觸發熱失控的候選方法僅為：加熱 (Heating)、針刺 (Nail penetration) 或過充 (Overcharge)。'
      },
      trigger_location: {
        value: '最靠近中心且最易將熱量傳導至相鄰電芯之單體電芯',
        detail: '選擇最靠近中心，其熱失控產生的熱量最容易傳導至相鄰電芯的單體電芯。'
      },
      temperature: {
        value: '25 ± 2 °C',
        detail: '測試應在 25 ± 2 °C 下進行。'
      }
    }
  };
}

applyStandardHarmonization('AIS-038', getAis038Updates());
