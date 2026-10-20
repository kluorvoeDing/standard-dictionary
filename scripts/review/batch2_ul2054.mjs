import { applyStandardHarmonization } from './harmonize_std.mjs';

function getUl2054Updates() {
  return {
    'UL2054-T11': {
      external_resistance: {
        value: '80 ± 20 mΩ',
        detail: '使用總外部電阻為 80 ± 20 mΩ 的電路負載短接正負極。'
      },
      temperature: {
        value: '20 ± 5 °C (室溫) 及 55 ± 2 °C (電芯) / 55 ± 5 °C (電池組)',
        detail: '室溫短路測試於 20 ± 5 °C 下進行。高溫短路測試於 55 ± 2 °C (電芯) 或 55 ± 5 °C (電池組) 下進行。'
      },
      termination: {
        value: '完全放電 (< 0.2 V) 且外殼溫度恢復至環境 ±10 °C，或起火/爆炸',
        detail: '持續短路直到起火或爆炸，或直到達到完全放電狀態（電芯 < 0.2 V）和/或外殼溫度恢復至環境溫度 ±10 °C 內。'
      },
      fault_condition: {
        value: '單一故障與最大次級負載測試',
        detail: '對電池組進行單一組件故障測試。若保護裝置作動，需使用不會使保護裝置作動的最大負載重複測試。'
      },
      apparatus: {
        value: '80 ± 20 mΩ 外部短路迴路；5 個室溫樣品中 1 個覆蓋薄紙與單層粗棉布',
        detail: '由銅導線與開關組成之負載電路，總電阻值為 80 ± 20 mΩ。5 個室溫測試樣品中的 1 個，必須在柔軟的木頭表面覆蓋紙巾並在上方覆蓋單層粗棉布的情況下進行短路測試。'
      }
    },
    'UL2054-T12': {
      charging_current: {
        value: '3 × Ic (最大充電電流)',
        detail: '施加製造商指定之最大充電電流 (Ic) 的 3 倍恆定充電電流。'
      },
      temperature: {
        value: '20 ± 5 °C',
        detail: '測試環境溫度需維持在 20 ± 5 °C。'
      },
      duration: {
        value: '一次電池：最少 7 小時；二次電池：充電結束後加 7 小時',
        detail: '一次電池充電時間依公式計算：t = 2.5 * (C / (3 * Ic))，最少為 7 小時。二次電池充電持續時間為達到製造商規定的充電結束條件所需的時間再加 7 小時。'
      },
      protective_device: {
        value: '單一故障；PTC/可復位重置至少 10 次；若動作以最大不動作負載重測',
        detail: '對充電電路中任何單一組件施加故障。若 PTC 或可復位保護裝置作動，測試期間必須重置至少 10 次。若保護裝置作動，需使用不會使保護裝置作動的最大負載重複測試。'
      }
    },
    'UL2054-T13': {
      charging_current: {
        value: '10 × C5（1 個樣品以 5 × C5 測試）',
        detail: '以 10 倍的 C5 安培率進行恆定電流充電。5 個樣品中至少有 1 個需以 5 倍的 C5 速率進行相同測試。'
      },
      charging_voltage: {
        value: '足以維持測試電流之供電電壓',
        detail: '使用足以在整個測試期間維持 10 倍 C5 安培率的供電電壓。'
      },
      temperature: {
        value: '20 ± 5 °C',
        detail: '測試環境溫度需維持在 20 ± 5 °C。'
      },
      termination: {
        value: '爆炸、排氣或單次保護作動且溫度穩定或回到室溫',
        detail: '測試持續進行直到電芯或電池爆炸、排氣、或單次動作保護裝置作動，且內部電芯外殼溫度達到穩定狀態或恢復至室溫。'
      },
      protective_device: {
        value: '單一故障；PTC/可復位重置至少 10 次',
        detail: '對充電電路中任何單一組件施加故障。若 PTC 或可復位保護裝置作動，測試期間必須重置至少 10 次。'
      }
    },
    'UL2054-T14': {
      setup: {
        value: '完全放電電芯與滿充電芯串聯後短路',
        detail: '將完全放電的電芯與同類型完全充電的電芯串聯（數量等於電池組總電芯數減一），然後短接形成電池組。'
      },
      external_resistance: {
        value: '80 ± 20 mΩ',
        detail: '使用具有 80 ± 20 mΩ 電阻負載的銅線連接。'
      },
      temperature: {
        value: '20 ± 5 °C',
        detail: '測試在 20 ± 5 °C 的環境溫度下進行。'
      },
      fault_condition: {
        value: '放電電路單一故障',
        detail: '對放電電路中可能導致過度放電的任何單一組件施加故障。'
      },
      termination: {
        value: '起火或爆炸，或完全放電且殼溫回復至環境 ±10 °C 內',
        detail: '放電直到起火或爆炸，或直到達到完全放電狀態且電芯外殼溫度恢復至環境溫度 ±10 °C 內。'
      }
    },
    'UL2054-T18': {
      force: {
        value: '13 ± 1.0 kN (3000 lbf)',
        detail: '電池在兩個平面之間被擠壓，擠壓力為 13 ± 1.0 kN (3000 lbf)。'
      },
      termination: {
        value: '達到最大力 (13 ± 1.0 kN) 即釋放',
        detail: '一旦達到最大力 13 ± 1.0 kN，即釋放壓力。'
      },
      orientation: {
        value: '縱軸平行於擠壓平面；方形需旋轉 90° 測寬窄面；鈕扣型平面平行',
        detail: '圓柱形和方形電池：縱軸平行於擠壓平面。方形電池需旋轉 90 度測試寬窄面。鈕扣電池：平面平行於擠壓平面。'
      },
      temperature: {
        value: '20 ± 5 °C',
        detail: '測試在 20 ± 5 °C 的環境溫度下進行。'
      },
      apparatus: {
        value: '直徑 150 mm 平面鋼壓板',
        detail: '平整平行的鋼製壓板，加壓液壓活塞行程可控，施壓至 13 ± 0.78 kN (13 ± 1.0 kN)。'
      }
    },
    'UL2054-T19': {
      drop_height: {
        value: '610 ± 25 mm (24 ± 1 in)',
        detail: '重物從 610 ± 25 mm (24 ± 1 英寸) 的高度落下。'
      },
      impact_mass: {
        value: '9.1 ± 0.46 kg (20 ± 1 lb)',
        detail: '使用 9.1 ± 0.46 kg (20 ± 1 lb) 的重物。'
      },
      steel_bar: {
        value: '直徑 15.8 ± 0.1 mm (5/8 in) 鋼棒',
        detail: '一根直徑 15.8 ± 0.1 mm (5/8 英寸) 的棒子橫跨放置在測試樣品的中心。'
      },
      impact_count: {
        value: '每個樣品 1 次',
        detail: '每個樣品只承受 1 次衝擊。'
      },
      temperature: {
        value: '20 ± 5 °C',
        detail: '測試在 20 ± 5 °C 的環境溫度下進行。'
      }
    },
    'UL2054-T20': {
      acceleration_peak: {
        value: '125～175 g（初始 3 ms 內最低平均 ≥ 75 g）',
        detail: '初始 3 毫秒的最小平均加速度為 75 g，峰值加速度在 125 g 到 175 g 之間。'
      },
      direction: {
        value: '3 個相互垂直方向',
        detail: '在 3 個相互垂直的方向上對電池進行測試。'
      },
      shock_count: {
        value: '共 3 次（每個相互垂直方向各 1 次）',
        detail: '總共施加 3 次衝擊（每個相互垂直的方向各 1 次）。'
      },
      temperature: {
        value: '20 ± 5 °C',
        detail: '測試在 20 ± 5 °C 的環境溫度下進行。'
      }
    },
    'UL2054-T21': {
      waveform: {
        value: '簡諧運動',
        detail: '電池承受簡諧運動。'
      },
      amplitude: {
        value: '0.8 mm (0.03 in)，最大總行程 1.6 mm (0.06 in)',
        detail: '振動幅度為 0.8 mm (0.03 英寸)，即總最大偏移量為 1.6 mm (0.06 英寸)。'
      },
      frequency_range: {
        value: '10～55 Hz',
        detail: '頻率在 10 到 55 Hz 之間變化，掃頻速率約為 1 Hz/min。'
      },
      sweep_rate: {
        value: '1 Hz/min',
        detail: '掃頻速率約為 1 Hz/min。'
      },
      test_duration: {
        value: '每個方向 90～100 分鐘',
        detail: '在 3 個相互垂直的方向上，每個方向測試 90–100 分鐘。'
      },
      axes: {
        value: '3 個相互垂直方向',
        detail: '在 3 個相互垂直的方向上分別進行測試。'
      },
      temperature: {
        value: '20 ± 5 °C',
        detail: '測試在 20 ± 5 °C 的環境溫度下進行。'
      }
    },
    'UL2054-T23': {
      test_type: {
        value: '靜態擠壓應力 (250 N)',
        detail: '使用提供 30 mm 直徑圓形平面的合適工具向外殼頂部、底部和側面施加力。'
      },
      force: {
        value: '250 ± 10 N',
        detail: '施加 250 ± 10 N 的力。'
      },
      duration: {
        value: '5 秒',
        detail: '壓力維持 5 秒。'
      },
      apparatus: {
        value: '直徑 30 mm 圓形平面工具',
        detail: '使用提供 30 mm 直徑圓形平面的合適工具向外殼頂部、底部和側面施加力。'
      },
      surfaces: {
        value: '外殼頂部、底部和側面',
        detail: '向外殼頂部、底部和側面施加力。'
      },
      temperature: {
        value: '20 ± 5 °C',
        detail: '測試在 20 ± 5 °C 的環境溫度下進行。'
      }
    },
    'UL2054-T24': {
      test_type: {
        value: '高溫外殼應力消除',
        detail: '在高溫下檢驗塑膠外殼是否有應力釋放導致變形或內部組件暴露。'
      },
      temperature: {
        value: '70 °C 或最高工作溫度 +10 °C',
        detail: '在 70 °C (158 °F) 下進行測試。若電池最大工作溫度超過 60 °C，則測試溫度為最大工作溫度加上 10 °C。'
      },
      duration: {
        value: '7 小時',
        detail: '在循環空氣恆溫箱中保持 7 小時。'
      },
      apparatus: {
        value: '循環空氣恆溫箱；完全放電或使用假電芯 (dummy cells)',
        detail: '在循環空氣恆溫箱中保持 7 小時。樣品在測試前必須完全放電，或者配備『假』電芯（dummy cells）。'
      }
    },
    'UL2054-T25': {
      drop_height: {
        value: '1 m (3.28 ft)',
        detail: '從 1 m (3.28 英尺) 高度跌落。'
      },
      drop_surface: {
        value: '混凝土表面',
        detail: '跌落至混凝土表面。'
      },
      drop_count: {
        value: '每個樣品 3 次',
        detail: '每個樣品跌落 3 次，以可能產生最不利結果的方向跌落。'
      },
      cold_conditioning: {
        value: '塑膠外殼預期用於 0 °C 時：跌落前 0 °C 處理 3 小時',
        detail: '如果電池組使用塑膠外殼，且預期會在 0 °C 下使用，則跌落前必須在 0 °C 下進行 3 小時的低溫預處理。'
      },
      temperature: {
        value: '20 ± 5 °C',
        detail: '測試在 20 ± 5 °C 的環境溫度下進行。'
      }
    },
    'UL2054-T26': {
      burner: {
        value: '明火燃燒器，距網下方 38 mm',
        detail: '工作台中心帶有 102 mm 圓孔，上方覆蓋金屬絲網 (每英吋 20 孔，金屬絲直徑 0.43 mm)，距離燃燒器 38 mm。使用燃燒器加熱，直到電池爆炸或電池燃燒殆盡。'
      },
      apparatus: {
        value: '八角形鋁質金屬絲籠 (610 × 305 mm, 16–18 wires/inch, 直徑 0.25 mm)',
        detail: '測試電池用 610 × 305 mm 的八角形鋁質金屬絲籠覆蓋，網格密度為每英吋 16–18 根金屬絲。鋁線直徑為 0.25 mm。'
      },
      duration: {
        value: '至爆炸或燃燒殆盡',
        detail: '使用燃燒器加熱，直到電池爆炸或電池燃燒殆盡。'
      }
    },
    'UL2054-T27': {
      heating_rate: {
        value: '5 ± 2 °C/min',
        detail: '以每分鐘 5 ± 2 °C 的速率升溫。'
      },
      target_temperature: {
        value: '130 ± 2 °C (266 ± 4 °F)',
        detail: '升溫至 130 ± 2 °C (266 ± 4 °F)。'
      },
      duration: {
        value: '保持 10 分鐘',
        detail: '達到 130 °C 後維持 10 分鐘。'
      }
    },
    'UL2054-T28': {
      high_temperature: {
        value: '70 ± 3 °C (158 °F)，維持 4 小時',
        detail: '70 ± 3 °C (158 °F) 維持 4 小時；轉換時間 < 30 分鐘。'
      },
      low_temperature: {
        value: '-40 ± 3 °C (-40 °F)，維持 4 小時',
        detail: '-40 ± 3 °C (-40 °F) 維持 4 小時；轉換時間 < 30 分鐘；回到 20 ± 3 °C。'
      },
      transition_time: {
        value: '轉換時間 < 30 分鐘',
        detail: '各溫階之間轉換時間小於 30 分鐘。'
      },
      dwell_time: {
        value: '高溫 4 小時；低溫 4 小時；室溫 2 小時 (20 ± 3 °C / 68 °F)；完成 10 次循環後 20 ± 5 °C 靜置至少 24 小時',
        detail: '70 ± 3 °C 維持 4 小時；20 ± 3 °C (68 °F) 維持 2 小時；-40 ± 3 °C 維持 4 小時；回到 20 ± 3 °C。完成 10 次循環後，在 20 ± 5 °C (68 ± 9 °F) 下儲存靜置至少 24 小時再進行檢查。'
      },
      cycles: {
        value: '10 次循環',
        detail: '重複上述溫度循環配置 10 次。'
      }
    }
  };
}

applyStandardHarmonization('UL2054', getUl2054Updates());
