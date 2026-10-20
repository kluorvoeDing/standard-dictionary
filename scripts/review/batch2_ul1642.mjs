import { applyStandardHarmonization } from './harmonize_std.mjs';

function getUl1642Updates() {
  return {
    'UL1642-T10': {
      external_resistance: {
        value: '80 ± 20 mΩ',
        detail: '將電池正負端子以電阻負載 80 ± 20 mΩ 之電路連接，進行短路。記錄電池外殼溫度。放電至起火/爆炸，或電壓降至 <0.2 V 且外殼溫度回復至環境溫度 ±10 °C 以內。'
      },
      temperature: {
        value: '20 ± 5 °C 及 55 ± 5 °C',
        detail: '測試分別在 20 ± 5 °C (68 ± 9 °F) 及 55 ± 5 °C (131 ± 9 °F) 兩個溫度下進行。電池須在端子連接前達到測試溫度平衡。'
      },
      termination: {
        value: '< 0.2 V 且殼溫回復至環境 ±10 °C',
        detail: '放電至起火或爆炸，或電壓降至 < 0.2 V 且外殼溫度回復至環境溫度 ±10 °C。電壓可能因保護裝置動作而未降至 0.2 V。'
      },
      fault_condition: {
        value: '串並聯需額外測試；保護動作後以不觸發之最大負載重測',
        detail: '若製造商指示電池用於串聯或並聯，須另以 5 組電池在最大串並聯數量配置下進行短路測試 (Section 10.3)。當過電流保護裝置在測試中動作時，須以不使保護裝置開路的最大負載重新進行測試 (Section 10.4)。所依賴之保護裝置須符合 2.3.1 要求。'
      },
      apparatus: {
        value: '80 ± 20 mΩ 外部電阻迴路',
        detail: '總電阻為 80 ± 20 mΩ 之負載迴路，連接電芯正負極終端。'
      }
    },
    'UL1642-T11': {
      temperature: {
        value: '20 ± 5 °C',
        detail: '測試在環境溫度 20 ± 5 °C (68 ± 9 °F) 下進行。'
      },
      charging_current: {
        value: '3 × Ic',
        detail: '一次電池：施加 3 倍製造商指定最大充電電流 Ic，以串聯電阻方式對 DC 電源連接。二次電池：以恒壓方式充電，電流限制為 3 倍 Ic，輸出電壓為製造商指定最大電壓。'
      },
      duration: {
        value: '一次電池：tc = 2.5C / (3×Ic)，最少 7 小時；二次電池：最少 7 小時或達到終止條件',
        detail: '一次電池充電時間公式 tc = 2.5C / (3×Ic)，其中 C 為電池容量 (Ah)，Ic 為最大充電電流 (A)。最短充電時間為 7 小時。製造商可選擇施加高於 3×Ic 的測試電流以加快測試。二次電池先以 0.2C/1 小時放電至製造商指定終止電壓，再以 3×Ic 充電。充電時間為 7 小時或達到製造商指定充電終止條件，取較長者 (Section 11.8)。'
      },
      protective_device: {
        value: '非可復位：降低電流重測；可復位：允許復位最多 10 次（充電不少於 7 小時）',
        detail: '非可復位保護裝置動作時，須以低於動作電流重新測試。可復位保護裝置允許復位最多 10 次，或直至充電時間完成但不少於 7 小時 (Section 11.4/11.9)。'
      }
    },
    'UL1642-T12': {
      applicability: {
        value: '僅適用於串聯多電芯應用',
        detail: '本測試僅適用於設計用於串聯多電芯應用（如電池組）的電芯 (Section 12.1)。'
      },
      setup: {
        value: '1 顆完放電芯串聯 (N-1) 顆滿充電芯',
        detail: '將 1 顆完全放電電芯與相同類型的滿充電芯串聯，滿充電芯數量等於最大串聯數減 1。5 顆電芯須完全放電，在室溫下進行。'
      },
      external_resistance: {
        value: '80 ± 20 mΩ',
        detail: '串聯完成後，將正負端子以 80 ± 20 mΩ 電阻負載連接進行短路 (Section 12.4)。'
      },
      termination: {
        value: '< 0.2 V 且殼溫回復至環境 ±10 °C',
        detail: '放電至起火或爆炸，或電壓降至 < 0.2 V 且外殼溫度回復至環境溫度 ±10 °C。'
      },
      temperature: {
        value: '室溫（20 ± 5 °C）',
        detail: '5 顆電芯在室溫下完全放電 (Section 12.2)。'
      },
      protective_device: {
        value: '動作後須以不觸發之最大負載重新測試',
        detail: '當過電流保護裝置動作時，須以不使保護裝置開路的最大負載重新測試 (Section 12.5)。'
      }
    },
    'UL1642-T14': {
      steel_bar: {
        value: '直徑 15.8 ± 0.1 mm，長度 ≥ 60 mm (6 cm) Type 316 不鏽鋼棒',
        detail: '使用直徑 15.8 ± 0.1 mm (5/8 ± 0.004 in)、長度至少 60 mm（6 cm，或電芯最長尺寸，取大值）之鋼棒（Type 316 不銹鋼）。'
      },
      impact_mass: {
        value: '9.1 ± 0.46 kg (20 ± 1 lbs)',
        detail: '落錘質量為 9.1 ± 0.46 kg (20 ± 1 lbs)。'
      },
      drop_height: {
        value: '610 ± 25 mm (24 ± 1 in)',
        detail: '落錘自 610 ± 25 mm (24 ± 1 in 或 61 ± 2.5 cm) 高度垂直落下撞擊鋼棒。'
      },
      orientation: {
        value: '圓柱與軟包：縱軸平行平面且垂直鋼棒；方形（非鋰離子）：需測寬面與窄面（旋轉 90°）；鈕扣型：鋼棒橫跨中心',
        detail: '圓柱形與軟包電池：長軸平行於平面，橫向垂直於放置在樣品中心的 15.8 mm 直徑鋼棒。鋰離子系統僅測試軟包及方形電芯寬面 (Section 14.2 Exception)。非鋰離子系統之方形電池：繞縱軸旋轉 90 度，使寬面與窄面均承受衝擊。鈕扣/硬幣型電池：平面平行於支撐面，15.8 mm 鋼棒橫跨中心放置 (Section 14.3)。'
      },
      impact_count: {
        value: '每個樣品 1 次',
        detail: '每個樣品僅承受一次衝擊。各樣品不同方向測試需使用不同樣品 (Section 14.2 / 14.4)。'
      },
      apparatus: {
        value: '直徑 15.8 mm 鋼棒 與 9.1 kg 落錘',
        detail: '直徑 15.8 ± 0.1 mm 平滑鋼棒，9.1 ± 0.46 kg 重錘自 610 ± 25 mm 高度自由落下。'
      }
    },
    'UL1642-T15': {
      mounting: {
        value: '剛性安裝（支撐所有安裝面）',
        detail: '電池以剛性支撐方式固定於試驗機上，固定方式須能支撐每個受測電池的所有安裝表面 (Section 15.1)。'
      },
      shock_count: {
        value: '每個方向 3 次（3 個互相垂直方向正反各 3 次，共 18 次）',
        detail: '在 3 個互相垂直的方向上，每個方向施加 3 次衝擊（正反各 3 次），共 18 次衝擊 (Section 15.2)。'
      },
      acceleration_initial: {
        value: '初始 3 ms 內最低平均加速度 ≥ 75 gn',
        detail: '衝擊脈衝在最初 3 ms 內的平均加速度不得小於 75 gn (Section 15.2)。'
      },
      acceleration_peak: {
        value: '峰值加速度 125～175 gn',
        detail: '半正弦脈衝之峰值加速度應在 125 gn 至 175 gn 之間 (Section 15.2)。'
      },
      pulse_duration: {
        value: '脈衝持續時間約 6 ms',
        detail: '半正弦波衝擊脈衝持續時間符合規範（約 6 ms）。'
      },
      direction: {
        value: '3 個互相垂直方向（若僅 2 軸對稱則為 2 個方向，正反各 3 次）',
        detail: '在 3 個互相垂直的方向上（若僅有 2 軸對稱者則為 2 個方向），正反兩向施加衝擊。每次衝擊方向垂直於電芯面 (Section 15.1/15.2)。'
      },
      temperature: {
        value: '20 ± 5 °C',
        detail: '測試在環境溫度 20 ± 5 °C (68 ± 9 °F) 下進行 (Section 15.2)。'
      }
    },
    'UL1642-T16': {
      waveform: {
        value: '簡諧運動',
        detail: '施加簡諧振動 (simple harmonic motion) (Section 16.1)。'
      },
      amplitude: {
        value: '0.8 mm (0.030 in) 振幅，最大總行程 1.6 mm (0.060 in)',
        detail: '振幅為 0.8 mm (0.030 in)，最大總行程 (峰對峰) 為 1.6 mm (0.060 in) (Section 16.1)。'
      },
      vibration_frequency: {
        value: '10 Hz～55 Hz～10 Hz',
        detail: '頻率在 10 Hz 至 55 Hz 之間往返變化 (Section 16.1)。'
      },
      sweep_rate: {
        value: '1 Hz/min 掃頻速率',
        detail: '頻率變化速率為 1 Hz/min (Section 16.1)。'
      },
      test_duration: {
        value: '每個方向 90～100 分鐘（共 4.5～5 小時）',
        detail: '在 3 個互相垂直方向的每一個方向振動 90 至 100 分鐘，總測試時間為 4.5 至 5 小時 (Section 16.2)。其中一個方向須垂直於端子面。'
      },
      axes: {
        value: '3 個互相垂直方向（若僅 2 軸對稱則為 2 個方向，含垂直端子面）',
        detail: '電池在 3 個互相垂直的方向依序測試（僅有 2 軸對稱者則為 2 個方向）。對於具扁平端子面之電池，其中一個方向須垂直於端子面 (Section 16.2)。'
      }
    },
    'UL1642-T17': {
      oven_type: {
        value: '重力對流或循環空氣烘箱',
        detail: '使用重力對流或循環空氣烘箱進行加熱 (Section 17.1)。'
      },
      initial_temperature: {
        value: '20 ± 5 °C',
        detail: '烘箱初始溫度為 20 ± 5 °C (68 ± 9 °F)。'
      },
      heating_rate: {
        value: '5 ± 2 °C/min (9 ± 3.6 °F/min)',
        detail: '升溫速率為 5 ± 2 °C (9 ± 3.6 °F) 每分鐘。'
      },
      target_temperature: {
        value: '130 ± 2 °C (266 ± 3.6 °F)；高溫電芯 > 100 °C 時為最高溫度 +30 ± 2 °C；鋰金屬最高 170 ± 2 °C (338 ± 3.6 °F)',
        detail: '升溫至 130 ± 2 °C (266 ± 3.6 °F) 並維持。若電池指定操作溫度 >100 °C，則目標溫度提高至製造商最高指定溫度 +30 ± 2 °C。鋰金屬化學體系最高至 170 ± 2 °C (338 ± 3.6 °F)。'
      },
      duration: {
        value: '保持 10 分鐘',
        detail: '在目標溫度維持 10 分鐘後，回復至室溫 (20 ± 5 °C) 再進行檢查。鋰離子電芯須依 Section 6.3–6.5 預處理：使用 45 °C/10 °C 限制，或若製造商限制超過此範圍則施加嚴格的 ±5 °C 偏移。'
      }
    },
    'UL1642-T18': {
      cycles: {
        value: '10 次循環',
        detail: '先完成第 1 次循環，再重複 9 次共 10 次循環 (Section 18.1e)。'
      },
      high_temperature: {
        value: '70 ± 3 °C (158 ± 5 °F)，維持 4 小時',
        detail: '在 30 分鐘內將溫度升至 70 ± 3 °C (158 ± 5 °F)，維持 4 小時 (Section 18.1a)。'
      },
      low_temperature: {
        value: '-40 ± 3 °C (-40 ± 5 °F)，維持 4 小時',
        detail: '在 30 分鐘內降溫至 -40 ± 3 °C (-40 ± 5 °F)，維持 4 小時 (Section 18.1c)。'
      },
      transition_time: {
        value: '轉換時間 ≤ 30 分鐘',
        detail: '在 30 分鐘內完成升降溫轉換 (Section 18.1b/d)。'
      },
      dwell_time: {
        value: '高溫 4 小時；低溫 4 小時；室溫 2 小時（20 ± 3 °C）；試驗後 20 ± 5 °C 靜置至少 24 小時',
        detail: '在 30 分鐘內降溫至 20 ± 3 °C (68 ± 5 °F)，維持 2 小時 (Section 18.1b)。在 30 分鐘內升溫至 20 ± 3 °C (Section 18.1d)。第 10 次循環完成後，電池在 20 ± 5 °C (68 ± 9 °F) 下靜置至少 24 小時再進行檢查 (Section 18.1f)。'
      }
    },
    'UL1642-T19': {
      pressure: {
        value: '11.6 kPa (1.68 psi) 絕對壓力',
        detail: '模擬約 15,240 公尺 (50,000 呎) 高空之低氣壓環境，絕對壓力 11.6 kPa (Section 19.1)。'
      },
      temperature: {
        value: '20 ± 3 °C (68 ± 5 °F)',
        detail: '測試溫度為 20 ± 3 °C (68 ± 5 °F)。'
      },
      duration: {
        value: '6 小時',
        detail: '電池在低壓環境下存放 6 小時 (Section 19.1)。'
      }
    },
    'UL1642-T20': {
      burner: {
        value: 'Meker 型燃燒器（或本生燈），距網下方 38 mm',
        detail: 'Meker 型燃燒器（或本生燈）安裝於鋼絲網下方 38 mm (1-1/2 in)。調節燃料與空氣流量，產生明亮的藍色火焰使支撐網呈明亮紅熱 (Section 20.3)。'
      },
      apparatus: {
        value: '8 面（八面）鋁線罩（610 × 305 mm）與鋼絲網平台（102 mm 孔）',
        detail: '電池放置於覆蓋平台中心 102 mm (4 in) 直徑孔的鋼絲網上。鋼絲網規格：每 25.4 mm 有 20 個開口，線徑 0.43 mm (0.017 in) (Section 20.2)。8 面帶蓋八角形鋁線罩，寬 610 mm (2 ft)、高 305 mm (1 ft)。鋁線直徑 0.25 mm (0.010 in)，每 25.4 mm 有 16–18 根線 (Section 20.4)。20 目/inch，中心配置本生燈或 Meker 燃燒器。'
      },
      duration: {
        value: '至爆炸或燃燒完畢',
        detail: '加熱至電池爆炸，或電池點燃並燒盡。除非有掉落風險，否則不需固定；需要時以單根鐵絲固定 (Section 20.5)。'
      }
    }
  };
}

applyStandardHarmonization('UL1642', getUl1642Updates());
applyStandardHarmonization('UL1642-2022', getUl1642Updates());
