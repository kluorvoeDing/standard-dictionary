import { applyStandardHarmonization } from './harmonize_std.mjs';

function getUlc2580Updates() {
  return {
    'ULC2580-T25': {
      soc: {
        value: '放電至 EODV (0% SOC)',
        detail: '放電至製造商規定的放電截止電壓 (EODV)。'
      },
      charging_current: {
        value: '最大充電速率',
        detail: '使用電池組規定的最大充電速率 (maximum specified charging rate)。'
      },
      fault_condition: {
        value: '充電電路單一故障',
        detail: '充電電路中引入單一故障條件 (single fault condition) 以模擬過充。'
      },
      termination: {
        value: '110% 額定容量或保護跳脫',
        detail: '測試持續至保護電路終止充電、充電至 110% 額定容量或發生極端結果（起火/爆炸）。'
      },
      operating_conditions: {
        value: '火花點火源或氣體監測',
        detail: '測試期間必須使用火花點火源或氣體監測儀器來檢測可燃氣體。'
      }
    },
    'ULC2580-T26': {
      soc: {
        value: '滿充 (MOSOC)',
        detail: '樣品處於滿充狀態 (Maximum Operating State of Charge, MOSOC)。'
      },
      external_resistance: {
        value: '≤ 20 mΩ',
        detail: '使用總電阻不超過 20 mΩ 的負載連接正負極端子。'
      },
      temperature: {
        value: '室溫',
        detail: '測試在室溫環境下進行 (conducted at room ambient)。'
      },
      duration: {
        value: '完全放電或溫度穩定後 7 小時（起火/爆炸）',
        detail: '測試持續至完全放電，或溫度穩定後 7 小時，或發生起火/爆炸為止。'
      },
      fault_condition: {
        value: '單一元件故障；低於短路保護最大值 15% 重複測試',
        detail: '若樣品配有保護裝置，應在放電條件下可能發生的任何單一元件故障下進行測試。在低於短路保護動作電流最大值 15% 的負載下重複測試。'
      },
      apparatus: {
        value: '火花點火源或氣體監測儀器',
        detail: '測試期間必須使用火花點火源或氣體監測儀器來檢測可燃氣體。'
      }
    },
    'ULC2580-T27': {
      soc: {
        value: '滿充 (MOSOC)',
        detail: '樣品處於滿充狀態 (MOSOC)。'
      },
      discharge_current: {
        value: '最大放電速率',
        detail: '以製造商規定的最大放電速率進行恆流放電。'
      },
      termination: {
        value: '被動保護啟動，或達正常放電限值後 30 分鐘',
        detail: '持續放電直至被動保護裝置啟動，或最小電壓/最高溫度保護啟動，或達到正常放電限值後 30 分鐘。'
      },
      fault_condition: {
        value: '火花點火源或氣體監測檢測可燃氣體',
        detail: '測試期間必須使用火花點火源或氣體監測儀器來檢測可燃氣體。'
      }
    },
    'ULC2580-T28': {
      high_temperature: {
        value: '上限充電溫度',
        detail: '環境溫度設定為上限充電溫度。'
      },
      dwell_time: {
        value: '電芯達到腔室溫度 ±10 °C (±18 °F) 內，靜置 1 小時',
        detail: '在測試前，預估所有電芯溫度需達到腔室溫度 ±10 °C (±18°F) 內，並靜置 1 小時。'
      },
      cycles: {
        value: '5 次循環',
        detail: '在最大充電與放電條件下，重複執行總共 5 次完整循環。'
      }
    },
    'ULC2580-T29': {
      soc: {
        value: '1 個模組 50% SOC，其餘 0% 完全放電',
        detail: '將除一個 (1 個) 模組外的所有模組放電至完全放電狀態 (0%)。該未放電模組放電至 50% SOC 以建立不平衡狀態。'
      },
      charging_current: {
        value: '正常充電（按製造商規格充電）',
        detail: '按製造商規格對整個系統充電。'
      },
      operating_conditions: {
        value: '火花點火源或氣體監測檢測可燃氣體',
        detail: '測試期間必須使用火花點火源或氣體監測儀器來檢測可燃氣體。'
      }
    },
    'ULC2580-T30': {
      applicability: {
        value: '≥ 60 Vdc 系統',
        detail: '僅適用於額定電壓 60 Vdc 或以上的電路。'
      },
      voltage: {
        value: '1.414 × 2 × 額定電壓 (DC) 或 2 倍額定電壓 60 Hz 正弦波 (AC)',
        detail: '施加等於 1.414 倍之（2倍額定電壓）的 DC 電壓。亦可使用 2倍額定電壓之 60 Hz 正弦波 AC。'
      },
      duration: {
        value: '≥ 1 分鐘',
        detail: '測試電壓持續施加至少 1 分鐘。'
      }
    },
    'ULC2580-T31': {
      method: {
        value: '按照 ISO 6469-1 條款 6.1.3 執行',
        detail: '按照 ISO 6469-1 條款 6.1.3 執行。'
      },
      conditioning: {
        value: '接收狀態 與 IEC 60068-2-30 濕熱調節（55 ± 2 °C，6 次循環）後進行',
        detail: '分別在接收狀態與 IEC 60068-2-30 濕熱調節（55 ± 2 °C，6次循環）後進行。'
      },
      voltage: {
        value: '高於待測電路之直流電壓（至少為高壓直流母線工作電壓）',
        detail: '施加高於待測電路的直流電壓（至少為高壓直流母線的工作電壓）。'
      }
    },
    'ULC2580-T33': {
      cooling: {
        value: '在最高工作環境溫度下禁用冷卻/熱穩定系統',
        detail: '在最高工作環境溫度下，禁用冷卻/熱穩定系統。'
      },
      operation: {
        value: '以最大速率進行充電與放電測試；在最高 (7 小時) 與最低環境溫度下測試',
        detail: '在冷卻禁用的情況下，以最大速率進行充電與放電測試。將樣品置於最高規定的工作環境溫度下 7 小時。整個試驗應在最低規定的工作環境溫度下重複進行。'
      },
      duration: {
        value: '最高工作環境溫度下 7 小時',
        detail: '將樣品置於最高規定的工作環境溫度下 7 小時。'
      },
      target_temperature: {
        value: '最高與最低規定之工作環境溫度',
        detail: '置於最高規定的工作環境溫度下 7 小時，並在最低規定的工作環境溫度下重複進行。'
      },
      termination: {
        value: '測試期間使用火花點火源或氣體監測儀器檢測可燃氣體',
        detail: '測試期間必須使用火花點火源或氣體監測儀器來檢測可燃氣體。'
      }
    },
    'ULC2580-T34': {
      test_type: {
        value: '翻覆旋轉應力測試（以 90°/15 秒 連續旋轉 360°）',
        detail: '模擬車輛翻覆，以 90°/15 秒 的速率連續旋轉 360°。'
      },
      surfaces: {
        value: '3 軸向（圓柱形為 2 個方向）',
        detail: '在 3 個互相垂直的方向進行（圓柱形設計為 2 個方向）。'
      },
      apparatus: {
        value: '火花點火源或氣體監測儀器',
        detail: '測試期間必須使用火花點火源或氣體監測儀器來檢測可燃氣體。'
      }
    },
    'ULC2580-T35': {
      waveform: {
        value: '按照預期車輛的振動輪廓進行（或 SAE J2380）',
        detail: '按照預期車輛的振動輪廓進行；若無，則使用 SAE J2380 標準。測試期間必須使用火花點火源或氣體監測儀器來檢測可燃氣體。'
      }
    },
    'ULC2580-T36': {
      waveform: {
        value: '半正弦波，峰值加速度 25 gn，脈衝持續時間 15 ms',
        detail: '半正弦波，峰值加速度 25 gn，脈衝持續時間 15 ms。測試期間必須使用火花點火源或氣體監測儀器來檢測可燃氣體。'
      },
      acceleration_peak: {
        value: '25 gn',
        detail: '峰值加速度 25 gn。'
      },
      pulse_duration: {
        value: '15 ms',
        detail: '脈衝持續時間 15 ms。'
      },
      shock_count: {
        value: '18 次（3 個互相垂直軸，每軸正負方向各 3 次）',
        detail: '3 個互相垂直軸，每軸正負方向各 3 次，共 18 次衝擊。'
      },
      direction: {
        value: '3 個互相垂直軸',
        detail: '3 個互相垂直軸，每軸正負方向各 3 次。'
      }
    },
    'ULC2580-T37': {
      drop_height: {
        value: '≥ 1.0 m',
        detail: '從至少 1.0 米高度跌落至平坦混凝土表面。'
      },
      drop_surface: {
        value: '平坦混凝土表面',
        detail: '跌落至平坦混凝土表面。測試期間必須使用火花點火源或氣體監測儀器來檢測可燃氣體。'
      },
      orientation: {
        value: '最可能產生不利結果的位置（模擬維護/拆卸）',
        detail: '以最可能產生不利結果的位置跌落，模擬維護/拆卸時的實際情況。'
      }
    },
    'ULC2580-T38': {
      force: {
        value: '100 ± 6 kN (依據豁免條款 1)',
        detail: '依據豁免條款 1，施加力量嚴格設定為 100 ±6 kN。'
      },
      orientation: {
        value: '3 軸互相垂直（圓柱形為 2 個方向）',
        detail: '在 3 個相互垂直的方向進行擠壓 (圓柱形為 2 個方向)。'
      },
      apparatus: {
        value: 'SAE J2464 肋條狀測試壓板、半徑 75 mm 圓柱壓頭 或 直徑 150 mm 平板',
        detail: '必須使用符合 SAE J2464 規範的肋條狀測試壓板 (ribbed test platen) 與固定平面進行擠壓。依樣品尺寸選用半徑 75 mm 之圓柱壓頭或平整鋼製壓板。測試期間必須使用火花點火源或氣體監測儀器來檢測可燃氣體。'
      }
    },
    'ULC2580-T39': {
      high_temperature: {
        value: '85 ± 2 °C (SAE J2464 modified)',
        detail: '採用 SAE J2464 的熱衝擊測試方法，但極限溫度修改為 85 ±2 °C 至 -40 ±2 °C。'
      },
      low_temperature: {
        value: '-40 ± 2 °C',
        detail: '-40 ±2 °C。'
      },
      dwell_time: {
        value: '按 SAE J2464 修改流程（85 °C 至 -40 °C）',
        detail: '使用 SAE J2464 流程，溫度為 85 °C 至 -40 °C。'
      }
    },
    'ULC2580-T40': {
      standard: {
        value: 'IEC 60068-2-52 嚴酷等級 6',
        detail: '依據 IEC 60068-2-52 或等效標準進行鹽霧暴露，並採用嚴酷等級 6 進行測試。'
      }
    },
    'ULC2580-T41': {
      liquid: {
        value: '5% NaCl 鹽水',
        detail: '在 5% 鹽水中完全浸沒 1 小時，或滿足 NEMA 60529 / UL 50E 的 IP 等級要求。'
      },
      temperature: {
        value: '室溫',
        detail: '於室溫下進行浸水測試。'
      },
      duration: {
        value: '1 小時（或直到可見化學反應停止）',
        detail: '浸泡 1 小時或直到所有可見的化學反應停止。'
      },
      method: {
        value: '完全浸沒 1 小時（或滿足 NEMA 60529 / UL 50E 之 IP 等級）',
        detail: '在 5% 鹽水中完全浸沒 1 小時，或滿足 NEMA 60529 / UL 50E 的 IP 等級要求。'
      }
    },
    'ULC2580-T42': {
      fire_exposure: {
        value: '≥ 590 °C 火焰持續 20 分鐘（或按車輛預期條件）',
        detail: '暴露於 590 °C 以上之火焰中持續 20 分鐘，或按車輛預期的火災暴露條件進行。'
      }
    },
    'ULC2580-T43-2': {
      trigger: {
        value: '內部短路或其他手段（見 Annex C）誘導單電芯熱失控',
        detail: '使用內部短路或其他手段（見 Annex C）觸發至少一個電池發生熱失控。'
      }
    },
    'ULC2580-B2-1': {
      waveform: {
        value: '依據 IEC 62660-2 進行振動測試',
        detail: '依據 IEC 62660-2 進行振動測試。'
      }
    },
    'ULC2580-B2-2': {
      waveform: {
        value: '依據 IEC 62660-2 進行衝擊測試',
        detail: '依據 IEC 62660-2 進行衝擊測試。'
      }
    },
    'ULC2580-B2-3': {
      drop_height: {
        value: '1.0 m',
        detail: '從 1.0 m 跌落至平坦混凝土表面，共 3 次。'
      },
      drop_surface: {
        value: '平坦混凝土表面',
        detail: '跌落至平坦混凝土表面。'
      },
      drop_count: {
        value: '共 3 次',
        detail: '共 3 次跌落。'
      }
    },
    'ULC2580-B2-4': {
      apparatus: {
        value: '依據 IEC 62660-2 進行擠壓測試',
        detail: '依據 IEC 62660-2 進行擠壓測試。'
      }
    },
    'ULC2580-B2-5': {
      operation: {
        value: '依據 IEC 62660-2 進行高溫耐久性測試',
        detail: '依據 IEC 62660-2 進行高溫耐久性測試。'
      }
    },
    'ULC2580-B2-6': {
      dwell_time: {
        value: '依據 IEC 62660-2 進行溫度循環測試',
        detail: '依據 IEC 62660-2 進行溫度循環測試。'
      }
    },
    'ULC2580-B2-7': {
      external_resistance: {
        value: '依據 IEC 62660-2 外部短路規範',
        detail: '依據 IEC 62660-2 進行外部短路測試。'
      }
    },
    'ULC2580-B2-8': {
      charging_current: {
        value: '最大充電電流恆流充電',
        detail: '以最大充電電流恆流充電至 120% 最大電壓或 130% SOC。'
      },
      termination: {
        value: '120% 最大電壓或 130% SOC',
        detail: '以最大充電電流恆流充電至 120% 最大電壓或 130% SOC。'
      }
    },
    'ULC2580-B2-9': {
      discharge_current: {
        value: '依據 IEC 62660-2 強制放電電流',
        detail: '依據 IEC 62660-2 進行強制放電測試。'
      }
    }
  };
}

applyStandardHarmonization('ULC2580', getUlc2580Updates());
