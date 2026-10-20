import { applyStandardHarmonization } from './harmonize_std.mjs';

function getUl9540aUpdates() {
  return {
    'UL9540A-CELL': {
      soc: {
        value: '100% SOC 或依製造商規格滿充',
        detail: '充電至 100 % SOC 或依製造商規格之滿充最高電壓。'
      },
      trigger: {
        value: '外部加熱、過充電或短路；可選連續熱斜坡 (4～7 °C/min)',
        detail: '使用外部加熱觸發；或對鉛酸/鎳鎘電池使用過充電；高溫電池亦可使用內部短路或針刺。可選連續熱斜坡直到發生熱失控 (2025年版新增, 7.3.1.5)。加熱斜率需嚴格控制在每分鐘 4 °C 至 7 °C (7.2 °F 至 12.6 °F)。'
      },
      temperature: {
        value: '25 ± 5 °C, 50 ± 25% RH',
        detail: '室內實驗室環境應為 25 ±5 °C (77 ±9 °F) 及 50 ±25 % RH。'
      },
      apparatus: {
        value: '密封測試艙 (Gas Collection Vessel)、薄膜加熱器與 FTIR 氣體分析儀；模擬模組約束',
        detail: '專用耐壓密封艙、薄膜加熱器 (Film heater)、氣體收集閥組與 FTIR 氣體成分分析儀。測量排氣溫度 (T_vent)、熱失控表面溫度、排氣成分（包括氫氣，FTIR可選）、排氣體積、爆炸下限 (LFL) 及燃燒速度。軟包與方形電芯測試時須進行約束，以模擬在 BESS 模組內的狀態並防止過度膨脹 (7.2.4)。'
      },
      method: {
        value: '測量排氣溫度 (T_vent)、氣體成分、壓力與燃燒速度',
        detail: '測量排氣溫度 (T_vent)、熱失控表面溫度、排氣成分（包括氫氣，FTIR可選）、排氣體積、爆炸下限 (LFL) 及燃燒速度。'
      }
    },
    'UL9540A-MODULE': {
      soc: {
        value: '100% SOC 或依製造商規格滿充',
        detail: '充電至 100 % SOC 或依製造商規格之滿充最高電壓。'
      },
      trigger: {
        value: '使用電池級驗證之應力方法觸發 1 個或多個電芯熱失控',
        detail: '使用在電池級測試中驗證有效的應力方法觸發一個或多個電芯熱失控。必須確立足以發生電池到電池熱傳播 (cell to cell thermal runaway propagation) 的條件 (8.2.4)。'
      },
      temperature: {
        value: '25 ± 5 °C, 50 ± 25% RH',
        detail: '室內實驗室環境應為 25 ±5 °C (77 ±9 °F) 及 50 ±25 % RH。'
      },
      apparatus: {
        value: '薄膜加熱器/過充引發裝置、多通道熱電偶陣列與排煙採樣管道',
        detail: '薄膜電阻加熱器 (Film heater)、多通道熱電偶採集儀與排煙採樣管道。測量化學與對流熱釋放速率 (HRR)、煙霧釋放速率、最高溫度、排氣成分、模組外殼完整性與火焰傳播情況。'
      },
      method: {
        value: '建立電芯間熱傳播並測量 HRR、煙霧與溫度',
        detail: '測量化學與對流熱釋放速率 (HRR)、煙霧釋放速率、最高溫度、排氣成分、模組外殼完整性與火焰傳播情況。必須確立足以發生電池到電池熱傳播 (cell to cell thermal runaway propagation) 的條件 (8.2.4)。'
      }
    },
    'UL9540A-UNIT': {
      soc: {
        value: '滿充 (MOSOC)',
        detail: '將啟動單元充至最大操作荷電狀態 (MOSOC) (9.1.9)。'
      },
      trigger: {
        value: '在單一模組內建立電芯間熱失控蔓延 (9.2.22)',
        detail: '必須在啟動 BESS 單元內的單一模組中建立電芯間的熱失控蔓延 (9.2.22)。'
      },
      temperature: {
        value: '10 °C 至 32 °C (50 °F 至 90 °F)',
        detail: '室內環境溫度應不低於 10 °C (50 °F) 且不高於 32 °C (90 °F)。'
      },
      apparatus: {
        value: '耗氧量熱儀、集煙罩、儀器化牆段 (≥ 13 mm / 1/2 in 石膏板) 與熱通量計陣列',
        detail: '安裝漆平黑的儀器化石膏牆板，並配備熱通量量規 (Schmidt-Boelter 或 Gardon) 及 Type-K 熱電偶。石膏牆板厚度至少需為 13 mm (1/2 英吋)。包含一個啟動 BESS 單元與相鄰目標 BESS 單元 (9.1)。耗氧量熱儀 (Oxygen consumption calorimeter)、集煙罩、輻射熱通量計陣列及氣體採樣探頭。'
      },
      flame_indicator: {
        value: '單層粗棉布 (住宅用 BESS 覆蓋)',
        detail: '住宅用 BESS 需覆蓋單層粗棉布 (Cheesecloth) 作為點火指示器 (9.2.21)。所用粗棉布需為未處理棉布，密度 26-28 m²/kg，每 6.45 cm² (1 in²) 雙向各有 28-32 根紗線。'
      },
      termination: {
        value: '連續 3 次 (每 15 分鐘) 溫度下降、或 < 60 °C、或火災傳播至目標單元/牆壁',
        detail: '連續 3 次(每15 分鐘)溫度下降、或低於 60 °C、或火災傳播至目標單元/牆壁時終止測試 (9.2.25)。'
      },
      method: {
        value: '依實際安裝環境（室內/室外、落地/壁掛、屋頂/停車場等）',
        detail: '室內/室外、落地/壁掛、屋頂/停車場等。包含一個啟動 BESS 單元與相鄰目標 BESS 單元 (9.1)。'
      }
    },
    'UL9540A-INSTALL': {
      method: {
        value: '方法 1：噴水滅火系統；方法 2：其他火災防護計畫（氣體/水霧/組合）；高溫電池集裝箱',
        detail: '預設 6.10×6.10×3.05 m 測試室，部署 4 個噴頭（間距 3.05 m），K 係數 5.6，啟動溫度 93 °C (10.3)。灑水器水密度需為 12.22 L/m²/min (0.3 gpm/ft²)。評估氣體滅火劑、水霧系統、組合系統等 (10.6)。依據製造商規格的集裝箱進行安裝級測試 (10.9)。'
      },
      flame_indicator: {
        value: '上方配備具防火等級的電纜托盤作為火焰傳播指示器 (10.2.2)',
        detail: '上方配備具防火等級的電纜托盤作為火焰傳播指示器 (10.2.2)。'
      },
      apparatus: {
        value: '模擬安裝室 (6.10 × 6.10 × 3.05 m)、4 個噴頭自動噴淋/氣體滅火與熱通量計',
        detail: '預設 6.10×6.10×3.05 m 測試室，部署 4 個噴頭（間距 3.05 m），K 係數 5.6，啟動溫度 93 °C (10.3)。符合 NFPA 855 / UL 9540A 規格之模擬室內安裝試驗艙、滅火水噴淋或氣體滅火裝置。'
      }
    }
  };
}

applyStandardHarmonization('UL9540A', getUl9540aUpdates());
