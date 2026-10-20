import { applyStandardHarmonization } from './harmonize_std.mjs';

function getAis156Updates() {
  return {
    'AIS-156-VIB': {
      soc: {
        value: '≥ 50% SOC (正常操作範圍上半部)',
        detail: '正常操作 SOC 範圍的上半部 (Upper 50 per cent of the normal operating SOC range)。'
      },
      waveform: {
        value: '正弦波對數掃頻 (7～200 Hz 耗時 15 分鐘)',
        detail: '正弦波對數掃頻，頻率在 7 Hz 至 200 Hz 之間往返，每次 15 分鐘。'
      },
      vibration_frequency: {
        value: '7～200 Hz',
        detail: '頻率在 7 Hz 至 200 Hz 之間往返。'
      },
      acceleration_peak: {
        value: '< 12 kg: 7～18 Hz 10 m/s², 漸增至 80 m/s² (50～200 Hz)；≥ 12 kg: 7～18 Hz 10 m/s², 漸增至 20 m/s² (25～200 Hz)',
        detail: '7-18 Hz：10 m/s²；18-~50 Hz：漸增至 80 m/s²；50-200 Hz：80 m/s²。≥ 12 kg：7-18 Hz：10 m/s²；18-~25 Hz：漸增至 20 m/s²；25-200 Hz：20 m/s²。'
      },
      amplitude: {
        value: '0.8 mm（總偏移量 1.6 mm）',
        detail: '在頻率增加期間，振幅保持在 0.8 mm（總偏移量 1.6 mm）。'
      },
      test_duration: {
        value: '12 次循環，共 3 小時（垂直安裝方向）；完成後 1 次標準循環與 1 小時觀察',
        detail: '垂直安裝方向進行 12 次循環，總計 3 小時。測試後進行一次 (1) 標準充放電循環，並觀察 1 小時。'
      },
      axes: {
        value: '垂直安裝方向',
        detail: '垂直安裝方向進行 12 次循環，總計 3 小時。'
      },
      temperature: {
        value: '20 ± 10 °C',
        detail: '測試在環境溫度 20 ± 10 °C 下進行。'
      }
    },
    'AIS-156-THERM-CYCLE': {
      soc: {
        value: '≥ 50% SOC (正常操作範圍上半部)',
        detail: '正常操作 SOC 範圍的上半部 (Upper 50 per cent of the normal operating SOC range)。'
      },
      high_temperature: {
        value: '60 ± 2 °C (≥ 6 小時)',
        detail: '最高溫度 60 ± 2 °C (或製造商要求之更高溫度)。每個極端溫度下停留至少 6 小時。'
      },
      low_temperature: {
        value: '-40 ± 2 °C (≥ 6 小時)',
        detail: '最低溫度 -40 ± 2 °C (或製造商要求之更低溫度)。每個極端溫度下停留至少 6 小時。'
      },
      transition_time: {
        value: '≤ 30 分鐘',
        detail: '極端溫度間的轉換時間不得超過 30 分鐘。'
      },
      dwell_time: {
        value: '各溫階 ≥ 6 小時；循環後 20 ± 10 °C 靜置 24 小時；完成後 1 次標準循環與 1 小時觀察',
        detail: '每個極端溫度下停留至少 6 小時。循環完成後於 20 ± 10 °C 靜置 24 小時。靜置後進行一次 (1) 標準充放電循環，並觀察 1 小時。'
      },
      cycles: {
        value: '≥ 5 次循環',
        detail: '至少進行 5 次完整循環。'
      }
    },
    'AIS-156-DROP': {
      soc: {
        value: '≥ 90% SOC',
        detail: 'SOC 至少為額定容量的 90%。'
      },
      temperature: {
        value: '20 ± 10 °C',
        detail: '測試在環境溫度 20 ± 10 °C 下進行。'
      },
      drop_height: {
        value: '1.0 m',
        detail: '從 1.0 m 高度自由落下。'
      },
      drop_surface: {
        value: '平滑水平混凝土墊或等效硬度表面',
        detail: '跌落表面為平滑水平混凝土墊或具有等效硬度的表面。'
      },
      drop_count: {
        value: '6 次（6 個不同方向各 1 次）；完成後標準循環或 1 小時觀察',
        detail: '從 6 個不同方向各跌落一次 (1 次)。測試後直接進行標準循環（若適用）或觀察 1 小時。'
      },
      orientation: {
        value: '6 個不同方向各 1 次',
        detail: '從 6 個不同方向各跌落一次。'
      }
    },
    'AIS-156-SHOCK': {
      soc: {
        value: '≥ 50% SOC',
        detail: '正常操作 SOC 範圍的上半部 (Upper 50 per cent of the normal operating SOC range)。'
      },
      temperature: {
        value: '20 ± 10 °C',
        detail: '測試在環境溫度 20 ± 10 °C 下進行。'
      },
      waveform: {
        value: '半正弦波',
        detail: '半正弦衝擊。'
      },
      acceleration_peak: {
        value: '< 12 kg 為 1500 m/s² (6 ms)；≥ 12 kg 為 500 m/s² (11 ms)',
        detail: '對於質量小於 12 kg 的 REESS：半正弦衝擊，峰值加速度 1500 m/s²，脈衝持續時間 6 ms。對於質量達 12 kg 或以上的 REESS：半正弦衝擊，峰值加速度 500 m/s²，脈衝持續時間 11 ms。'
      },
      pulse_duration: {
        value: '6 ms (< 12 kg) / 11 ms (≥ 12 kg)',
        detail: '脈衝持續時間 6 ms (< 12 kg) 或 11 ms (≥ 12 kg)。'
      },
      shock_count: {
        value: '18 次（3 個安裝方向正負各 3 次）；完成後 1 次標準循環與 1 小時觀察',
        detail: '在三個 (3 個) 互相垂直的安裝方向上，每個方向正負各 3 次衝擊，總計 18 次。測試後進行一次 (1) 標準充放電循環，並觀察 1 小時。'
      },
      direction: {
        value: '3 個互相垂直方向（正負各 3 次）',
        detail: '在三個互相垂直的安裝方向上，每個方向正負各 3 次衝擊，總計 18 次。'
      }
    },
    'AIS-156-FIRE': {
      soc: {
        value: '≥ 50% SOC',
        detail: '正常操作 SOC 範圍的上半部 (Upper 50 per cent of the normal operating SOC range)。'
      },
      temperature: {
        value: '≥ 0 °C',
        detail: '測試在至少 0 °C 的環境溫度下進行。'
      },
      apparatus: {
        value: '商業燃料燃燒盤（超出水平投影 20～50 cm）',
        detail: '使用裝有商業燃料的燃燒盤，燃燒盤尺寸需超出測試物體水平投影 20-50 cm。'
      },
      fire_exposure: {
        value: '預熱 60 秒 (距 ≥ 3 m) → 直接火焰 70 秒 → 間接火焰 60 秒 (或延續直接 60 秒) → 降溫至少 3 小時',
        detail: 'A階段：燃料盤必須在距離受測設備至少 3 公尺 (at least 3 m) 的距離處點燃並預熱 60 秒。B階段：將燃燒盤移至測試設備下方，直接火焰暴露 70 秒。C階段：在燃燒盤上方加入耐火屏蔽層，進行間接火焰暴露 60 秒 (或可選擇延續 B 階段直接暴露 60 秒)。D階段：移除火源，觀察直至測試設備溫度降至環境溫度，或確認溫度已持續下降至少 3 小時。'
      },
      termination: {
        value: '火源移除後觀察至降至環境溫度或持續下降至少 3 小時',
        detail: '移除油盤後，必須觀察測試裝置，直到測試裝置之表面溫度降至環境溫度，或已持續降溫至少 3 小時為止。'
      }
    },
    'AIS-156-SC-EXT': {
      soc: {
        value: '≥ 50% SOC',
        detail: '正常操作 SOC 範圍的上半部 (Upper 50 per cent of the normal operating SOC range)。'
      },
      temperature: {
        value: '20 ± 10 °C（或應要求在更高溫度）',
        detail: '測試在環境溫度 20 ± 10 °C 下進行 (或製造商要求之更高溫度)。'
      },
      fault_condition: {
        value: '主接觸器閉合',
        detail: '充電與放電的所有相關主接觸器均處於閉合狀態。'
      },
      external_resistance: {
        value: '≤ 5 mΩ',
        detail: '連接正負極的短路電阻不得超過 5 mΩ。'
      },
      duration: {
        value: '持續至保護中斷或限制，或外殼溫度穩定 (1 小時內變化 < 4 °C) 後至少 1 小時',
        detail: '持續短路直至保護功能中斷或限制電流，或在外殼溫度穩定 (1 小時內溫度梯度小於 4 °C) 後至少持續 1 小時。'
      },
      termination: {
        value: '保護中斷/限制電流，或溫度穩定後 1 小時；完成後 1 次標準循環與 1 小時觀察',
        detail: '持續短路直至保護功能中斷或限制電流，或在外殼溫度穩定 (1 小時內溫度梯度小於 4 °C) 後至少持續 1 小時。測試後進行一次 (1) 標準充放電循環，並觀察 1 小時。'
      }
    },
    'AIS-156-OC': {
      temperature: {
        value: '20 ± 10 °C（或應要求在更高溫度）',
        detail: '測試在環境溫度 20 ± 10 °C 下進行 (或製造商要求之更高溫度)。'
      },
      charging_current: {
        value: '≥ 1/3 C（不超過正常工作範圍內最大電流）',
        detail: '以至少 1/3 C 的速率充電，但不超過製造商指定的正常工作範圍內的最大電流。'
      },
      fault_condition: {
        value: '停用外部充電控制限制',
        detail: '任何外部的充電控制限制應被停用。'
      },
      termination: {
        value: '保護介入自動中斷/限制，或充至額定充電容量 2 倍 (200%)；完成後 1 次標準循環與 1 小時觀察',
        detail: '持續充電直至測試設備自動中斷或限制充電；若保護未介入，則持續充至額定充電容量的兩倍 (2 倍 / 200%)。測試後進行一次 (1) 標準充放電循環，並觀察 1 小時。'
      }
    },
    'AIS-156-OD': {
      temperature: {
        value: '20 ± 10 °C（或應要求在更高溫度）',
        detail: '測試在環境溫度 20 ± 10 °C 下進行 (或製造商要求之更高溫度)。'
      },
      discharge_current: {
        value: '≥ 1/3 C（不超過正常工作範圍內最大電流）',
        detail: '以至少 1/3 C 的速率放電，但不超過製造商指定的正常工作範圍內的最大電流。'
      },
      termination: {
        value: '保護介入自動中斷/限制，或放電至標稱電壓 25%；完成後 1 次標準充電與 1 小時觀察',
        detail: '持續放電直至測試設備自動中斷或限制放電；若保護未介入，則放電至標稱電壓的 25%。測試後進行一次 (1) 標準充電，並觀察 1 小時。'
      }
    },
    'AIS-156-THERM-ABUSE': {
      cooling: {
        value: '若可在無冷卻下運行則停用冷卻系統',
        detail: '若 REESS 可在無冷卻狀態下運行，則停用冷卻系統。'
      },
      operation: {
        value: '以最快提升電芯溫度之穩定電流連續充放電循環',
        detail: '以能在正常操作範圍內最快提升電芯溫度的穩定電流進行連續充放電。持續量測外殼內靠近電芯處的溫度。'
      },
      target_temperature: {
        value: '對流烤箱逐漸升溫至保護閾值或最高操作溫度並維持',
        detail: '將設備置於對流烤箱或環境試驗箱中，將環境溫度逐漸提升至保護閾值溫度或最高操作溫度並維持。'
      },
      termination: {
        value: 'REESS 抑制或限制充放電，或溫度穩定（2 小時內變化 < 4 °C）',
        detail: '測試持續直至 REESS 抑制或限制充放電，或溫度穩定 (2 小時內溫度梯度小於 4 °C)。'
      }
    }
  };
}

applyStandardHarmonization('AIS-156', getAis156Updates());
