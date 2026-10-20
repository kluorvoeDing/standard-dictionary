import { applyStandardHarmonization } from './harmonize_std.mjs';

function getUl1973Updates() {
  return {
    'UL1973-15': {
      soc: {
        value: '0% SOC (EODV)',
        detail: '放電至製造商規定的 EODV (End of Discharge Voltage)。'
      },
      charging_current: {
        value: '最大充電速率',
        detail: '使用電池組規定的最大充電速率。'
      },
      fault_condition: {
        value: '充電電路單一故障',
        detail: 'Single fault condition in the charging protection/control circuit.'
      },
      termination: {
        value: '充電至 110% 或保護啟動',
        detail: '測試持續至保護電路終止充電、充電至最大規定電壓之 110% 或發生起火/爆炸。'
      }
    },
    'UL1973-16': {
      soc: {
        value: '0% SOC (EODV)',
        detail: '放電至製造商規定的 EODV。'
      },
      current: {
        value: '高倍率（高於最大充電速率 20%）',
        detail: '20% greater than the maximum specified charging rate.'
      },
      fault_condition: {
        value: '充電電路單一故障（可能導致高倍率充電）',
        detail: '充電電路單一故障（可能導致高倍率充電）。'
      }
    },
    'UL1973-17': {
      soc: {
        value: '100% SOC (MOSOC)',
        detail: '充滿電 (Maximum Operating State of Charge, MOSOC)。'
      },
      external_resistance: {
        value: '≤ 20 mΩ',
        detail: '外部短路電阻不大於 20 mΩ。'
      },
      fault_condition: {
        value: '放電保護電路單一故障',
        detail: '放電電路中引入單一元件故障。'
      }
    },
    'UL1973-18': {
      soc: {
        value: '100% SOC',
        detail: '充滿電狀態。'
      },
      current: {
        value: '過載放電（90% 過電流保護值，主保險絲 135% 或例外 150%）',
        detail: '90% of the rated overcurrent protection value, and 135% of the main fuse rating (or 150% for Exception 1).'
      },
      fault_condition: {
        value: '放電電路單一故障',
        detail: '放電電路中引入單一元件故障。'
      }
    },
    'UL1973-19': {
      soc: {
        value: '100% SOC',
        detail: '從充滿電開始放電。'
      },
      discharge_current: {
        value: '最大放電速率',
        detail: '以最大放電速率放電。'
      },
      fault_condition: {
        value: '放電控制保護電路單一故障',
        detail: '在放電保護電路中施加單一故障。'
      },
      termination: {
        value: '至保護啟動、最低電壓/最高溫度保護，或達正常放電極限後繼續 30 分鐘',
        detail: '放電直到保護裝置啟動，或電池達到最低電壓/最高溫度保護，或在達到規定的正常放電極限後繼續放電 30 分鐘為止。'
      }
    },
    'UL1973-20': {
      target_temperature: {
        value: '上限充電與放電溫度',
        detail: '在製造商規定的上限充電溫度及上限放電溫度下運行。'
      },
      operation: {
        value: '依指定最大充放電參數進行至少 2 次完整充放電循環',
        detail: '依指定的最大充電與放電參數，進行至少兩次完整的充放電循環 (至少 2 次)。'
      }
    },
    'UL1973-21': {
      soc: {
        value: '不平衡狀態（1 個電芯/模組完放，其餘放電至約 50%）',
        detail: 'All of its modules/cells with the exception of one discharged to its specified fully discharged condition. The undischarged module/cell shall be discharged to approximately 50%.'
      },
      fault_condition: {
        value: '主動保護裝置處於單一故障條件 (Section 21.3)',
        detail: '主動保護裝置應處於單一故障條件下 (Section 21.3)。'
      }
    },
    'UL1973-24': {
      soc: {
        value: '0% 或 100% SOC',
        detail: '測試充電及放電過程。'
      },
      operation: {
        value: '在最高及最低額定環境溫度下關閉冷卻系統充放電',
        detail: '在最高及最低額定環境溫度下，關閉冷卻系統進行充放電。'
      }
    },
    'UL1973-28': {
      soc: {
        value: '100% SOC',
        detail: '充滿電 (MOSOC) 狀態。'
      },
      waveform: {
        value: '車輛振動輪廓（符合 IEC 61373 或 UL/ULC 2271 / UL/ULC 2580）',
        detail: '根據預期的車輛或輕軌應用環境的振動頻譜。Specific compliance with IEC 61373 for LER, and explicitly UL/ULC 2271 or UL/ULC 2580 for VAP applications.'
      }
    },
    'UL1973-29': {
      soc: {
        value: '100% SOC',
        detail: '充滿電狀態。'
      },
      waveform: {
        value: '半正弦波或其他（符合 IEC 61373 或 UL/ULC 2271 / 2580）',
        detail: 'Both positive and negative direction shocks shall be applied in each of 3 mutually perpendicular directions for a total of 18 shocks. 測試應符合 IEC 61373，或對於 VAP 應用符合 UL/ULC 2271 或 UL/ULC 2580 (Section 29.3)。'
      },
      shock_count: {
        value: '共 18 次（3 個互相垂直方向正反各 3 次）',
        detail: '在 3 個相互垂直的方向上，每個方向正負向各施加 3 次衝擊，共 18 次。'
      },
      direction: {
        value: '3 個互相垂直方向（正反兩向）',
        detail: '在 3 個互相垂直方向的正反兩向施加衝擊。'
      },
      mounting: {
        value: '直徑 15.8 mm 鋼棒 與 9.1 kg 重錘落錘 (610 ± 25 mm)',
        detail: '直徑 15.8 ± 0.1 mm 鋼棒橫置於樣品表面，9.1 ± 0.1 kg (9.1 ± 0.46 kg) 重錘自 610 ± 25 mm 落下。'
      }
    },
    'UL1973-30': {
      soc: {
        value: '100% SOC',
        detail: '充滿電狀態。'
      },
      force: {
        value: '100 ± 6 kN',
        detail: 'Crush between a fixed surface and a ribbed test platen in accordance with the test fixture described in SAE J2464, applied in 3 mutually perpendicular directions of press (or 2 directions for systems with 2 axes of symmetry like cylindrical designs).'
      },
      apparatus: {
        value: 'SAE J2464 肋狀壓板、半徑 75 mm 半圓柱壓頭 或 直徑 150 mm 平板',
        detail: '半徑 75 mm 之鋼製半圓柱壓板或直徑 150 mm 之平整鋼板。固定表面與依 SAE J2464 描述之試驗治具壓板之間擠壓。'
      },
      orientation: {
        value: '3 個互相垂直方向（若具 2 軸對稱則為 2 個方向）',
        detail: 'applied in 3 mutually perpendicular directions of press (or 2 directions for systems with 2 axes of symmetry like cylindrical designs).'
      }
    },
    'UL1973-33': {
      soc: {
        value: '100% SOC',
        detail: '充滿電狀態。'
      },
      drop_height: {
        value: '≤ 7 kg 為 100 cm；> 7 kg 且 < 100 kg 為 10 cm；> 100 kg 為 2.5 cm',
        detail: '100 cm for 7 kg or less, 10 cm for >7 kg but less than 100 kg, and 2.5 cm for > 100 kg.'
      }
    },
    'UL1973-35': {
      soc: {
        value: '0% SOC',
        detail: '未充電狀態。'
      },
      test_type: {
        value: '高溫外殼應力釋放測試',
        detail: '在烤箱中維持該溫度持續 7 小時。'
      },
      temperature: {
        value: '最高測得溫度 + 10 °C (≥ 70 °C)',
        detail: '最高測得溫度 + 10 °C (≥ 70 °C)。在烤箱中維持該溫度持續 7 小時。'
      },
      duration: {
        value: '7 小時',
        detail: '在烤箱中維持該溫度持續 7 小時。'
      }
    },
    'UL1973-38': {
      soc: {
        value: '100% SOC (完全充電)',
        detail: '在開始溫度循環之前，電池系統必須完全充電 (100% SOC)。'
      },
      high_temperature: {
        value: '+75 ± 2 °C，維持 6 小時',
        detail: '+75 ± 2 °C for 6 小時。'
      },
      low_temperature: {
        value: '-40 ± 2 °C，維持 6 小時',
        detail: '-40 ± 2 °C for 6 小時。'
      },
      dwell_time: {
        value: '高溫 6 小時；低溫 6 小時；常溫 2 小時 (20 ± 2 °C)',
        detail: 'Strict temperature profile: +75 ±2 °C for 6 小時, 20 ±2 °C for 2 小時, -40 ±2 °C for 6 小時, and 20 ±2 °C, repeated for a total of 10 cycles.'
      },
      cycles: {
        value: '10 次循環',
        detail: 'repeated for a total of 10 cycles.'
      }
    },
    'UL1973-42.2': {
      soc: {
        value: '100% SOC',
        detail: '充滿電狀態。'
      },
      trigger: {
        value: '內部短路或加熱器誘發單一電芯熱失控',
        detail: '在最大額定操作溫度下，於最嚴苛位置使用內部短路或加熱器觸發單一電芯熱失控。Cells must be within ±10 °C (±18 °F) of the max specified temperature just before inducing the mechanism, and once thermal runaway is shut off/stopped, the DUT is subjected to a 24-h observation period.'
      },
      temperature: {
        value: '最大額定操作溫度 ±10 °C (±18 °F)',
        detail: 'Cells must be within ±10 °C (±18 °F) of the max specified temperature just before inducing the mechanism.'
      },
      termination_for_trigger: {
        value: '觸發後關閉或停止熱失控機制，進行 24 小時觀察',
        detail: 'once thermal runaway is shut off/stopped, the DUT is subjected to a 24-h (24 小時) observation period.'
      }
    },
    'UL1973-E3': {
      soc: {
        value: '100% (MOSOC)',
        detail: '充滿電 (MOSOC) 狀態。'
      },
      external_resistance: {
        value: '≤ 20 mΩ',
        detail: '外部電阻小於等於 20 mΩ。'
      },
      temperature: {
        value: '25 ± 5 °C',
        detail: 'Test ambient temperature 25 ± 5 °C.'
      },
      duration: {
        value: '7 小時或殼溫降至環境 ±10 °C',
        detail: 'Apply the short for 7 小時 or until temperatures on the cell cool to within ±10 °C.'
      }
    },
    'UL1973-E4': {
      soc: {
        value: '100%',
        detail: '充滿電狀態。'
      },
      waveform: {
        value: '重錘落下撞擊橫置鋼棒',
        detail: 'Explicitly requires a 15.8 ±0.1-mm bar, a 9.1 ±0.46-kg weight, and a drop height of 610 ±25 mm.'
      },
      mounting: {
        value: '直徑 15.8 ± 0.1 mm 鋼棒 與 9.1 ± 0.46 kg (9.1 ± 0.1 kg) 重錘 (落高 610 ± 25 mm)',
        detail: '直徑 15.8 ± 0.1 mm 鋼棒橫置於樣品表面，9.1 ± 0.1 kg (9.1 ± 0.46 kg) 重錘自 610 ± 25 mm 落下。'
      }
    },
    'UL1973-E5': {
      soc: {
        value: '100%',
        detail: '充滿電狀態。'
      },
      drop_height: {
        value: '1.0 m',
        detail: '從 1.0 m 高度跌落 3 次。'
      },
      drop_count: {
        value: '3 次',
        detail: '跌落 3 次。'
      }
    },
    'UL1973-E6': {
      soc: {
        value: '100% (完全充電)',
        detail: '單電池在加熱測試前必須完全充電 (100% SOC)。'
      },
      heating_rate: {
        value: '5 ± 2 °C/min',
        detail: 'Rate of 5 ±2 °C per minute.'
      },
      target_temperature: {
        value: '130 ± 2 °C；Tmax > 100 °C 時為最高溫度 +30 ± 2 °C',
        detail: 'to a temperature of 130 ±2 °C. Temperature remain for 10 分鐘. Exception for cells > 500 g to be held for 30 分鐘 rather than 10 分鐘. Cells with Tmax > 100 °C to be tested at 30 ±2 °C above the manufacturers maximum specified temperature.'
      },
      duration: {
        value: '保持 10 分鐘（電芯 > 500 g 保持 30 分鐘）',
        detail: 'Temperature remain for 10 分鐘. Exception for cells > 500 g to be held for 30 分鐘 rather than 10 分鐘.'
      }
    },
    'UL1973-E7': {
      soc: {
        value: '0% SOC (完全放電)',
        detail: '在過充測試之前，單電池必須放電至指定的終止電壓 (0% SOC)。'
      },
      charging_current: {
        value: '最大充電電流恆流充電',
        detail: '以最大充電電流恆流充電。'
      },
      termination: {
        value: '120% 最大規定電壓或 130% SOC',
        detail: '充電至 120% 最大規定電壓或 130% SOC。'
      }
    },
    'UL1973-E8': {
      soc: {
        value: '0% SOC',
        detail: '放電至截止電壓 (0%)。'
      },
      duration: {
        value: '90 分鐘',
        detail: 'Discharge voltage limit not to exceed the numerical value of the upper limit charging voltage specified for the cell. If the discharge voltage limit is reached before the 90 分鐘, the cell shall be discharged at a constant voltage discharge equal to the manufacturer’s determined low voltage cutoff.'
      },
      termination: {
        value: '放電電壓達到上限充電電壓或 90 分鐘後以截止電壓恆壓放電',
        detail: 'Discharge voltage limit not to exceed the numerical value of the upper limit charging voltage specified for the cell. If the discharge voltage limit is reached before the 90 分鐘, the cell shall be discharged at a constant voltage discharge equal to the manufacturer’s determined low voltage cutoff.'
      }
    }
  };
}

applyStandardHarmonization('UL1973', getUl1973Updates());
