import { applyStandardHarmonization } from './harmonize_std.mjs';

function getGbt36276Updates() {
  return {
    'GBT36276-6.7.1.1': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 6.2.4.1.1 完成初始化充電。'
      },
      charging_current: {
        value: 'I = P_rc / U_nom 恆定電流充電',
        detail: '以 I = P_rc / U_nom 的恆定電流進行充電。'
      },
      termination: {
        value: '單體電壓達充電截止電壓 1.5 倍，或時間達 1 小時停止充電；停止後觀察 1 小時',
        detail: '充電至任一電池單體電壓達到電池單體充電截止電壓的 1.5 倍，或時間達到 1 小時停止充電。停止充電後觀察 1 小時。'
      }
    },
    'GBT36276-6.7.1.2': {
      soc: {
        value: '空電狀態 (0% SOC)',
        detail: '按照 6.2.4.2.1 完成了初始化放電。'
      },
      discharge_current: {
        value: 'I = P_rd / U_nom 恆定電流放電',
        detail: '以 I = P_rd / U_nom 的恆定電流進行放電。'
      },
      termination: {
        value: '電壓達到 0 V，或時間達到 1 小時停止放電；停止後觀察 1 小時',
        detail: '放電至電壓達到 0 V，或時間達到 1 小時停止放電。停止放電後觀察 1 小時。'
      }
    },
    'GBT36276-6.7.1.3': {
      soc: {
        value: '空電狀態 (0% SOC)',
        detail: '按照 6.2.4.2.1 完成了初始化放電。'
      },
      current: {
        value: '4 × P_rc 恆功率充電至截止電壓（靜置 10 分鐘）；4 × P_rd 恆功率放電至截止電壓',
        detail: '以 4 倍 P_rc 恆功率充電至充電截止電壓，靜置 10 分鐘。以 4 倍 P_rd 恆功率放電至放電截止電壓。'
      },
      duration: {
        value: '充電靜置 10 分鐘；放電結束後觀察 1 小時',
        detail: '充電至充電截止電壓後靜置 10 分鐘。放電結束後觀察 1 小時。'
      }
    },
    'GBT36276-6.7.1.4': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 6.2.4.1.1 完成初始化充電。'
      },
      external_resistance: {
        value: '單體：[0.8, 1.0] mΩ (10 分鐘)；模組雙重短路：[0.8, 1.0] mΩ (10 分鐘) 及 [27.0, 32.8] mΩ (30 分鐘)',
        detail: '單體外部線路總電阻應在 [0.8, 1.0] mΩ，保持 10 分鐘。模塊先在 [0.8, 1.0] mΩ 下短路 10 分鐘；更換樣品後，在 [27.0, 32.8] mΩ 下短路 30 分鐘。斷開短路後觀察 1 小時。'
      },
      duration: {
        value: '單體 10 分鐘；模組 10 分鐘及 30 分鐘；斷開後觀察 1 小時',
        detail: '保持 10 分鐘或 30 分鐘。斷開短路後觀察 1 小時。'
      }
    },
    'GBT36276-6.7.1.5': {
      conditioning: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 6.2.4.1.1 完成初始化充電。'
      },
      voltage: {
        value: '500 V / 1000 V / 2500 V（依截止電壓決定）',
        detail: '根據截止電壓不同，施加 500 V、1000 V 或 2500 V 試驗電壓。'
      },
      duration: {
        value: '1 分鐘',
        detail: '持續 1 分鐘，測量絕緣電阻。'
      }
    },
    'GBT36276-6.7.2.1': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 6.2.4.1.1 完成初始化充電。'
      },
      crush_speed: {
        value: '5 mm/s',
        detail: '初始速度設置為 5 mm/s。'
      },
      force: {
        value: '50 kN（保持 10 分鐘）',
        detail: '擠壓力達到 50 kN 時保持該擠壓力 10 分鐘。停止擠壓後觀察 1 小時。'
      },
      duration: {
        value: '保持 10 分鐘',
        detail: '擠壓力達到 50 kN 時保持該擠壓力 10 分鐘。'
      },
      apparatus: {
        value: '半徑 75 mm 半圓柱鋼壓頭 (R=75 mm)',
        detail: '使用半徑 75 mm 的半圓柱體擠壓頭，長度大於被測樣品表面寬度。'
      }
    },
    'GBT36276-6.7.2.2': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 6.2.4.1.1 完成初始化充電。'
      },
      drop_height: {
        value: '單體 1.5 m；模組 2.0 m',
        detail: '單體從 1.5 m 高度跌落；模塊從 2.0 m 高度跌落至水泥地面。跌落後觀察 1 小時。'
      },
      drop_surface: {
        value: '水泥地面',
        detail: '跌落至水泥地面。'
      },
      orientation: {
        value: '正極或負極朝下跌落',
        detail: '正極或負極朝下跌落。'
      }
    },
    'GBT36276-6.7.4.2.1': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 6.2.4.1.1 完成初始化充電。'
      },
      operation: {
        value: '加熱部件加熱同時以 I = P_rc / U_nom 恆流充電',
        detail: '使用加熱部件對單體進行加熱，同時以 I = P_rc / U_nom 的特定電流進行恆流充電觸發。'
      },
      termination: {
        value: '連續 3 個溫升速率 dT/dt ≥ 3 °C/s，或起火爆炸，或達到 300 °C，或時間達 4 小時；測試後觀察 1 小時',
        detail: '監測溫度速率，當連續三個 (3 個) 溫升速率 ≥ 3 °C/s，或起火爆炸，或達到 300 °C，或時間達到 4 小時時停止加熱。測試後觀察 1 小時。'
      }
    },
    'GBT36276-6.7.4.2.2': {
      soc: {
        value: '完成循環壽命試驗後滿電狀態 (100% SOC)',
        detail: '單體電池在完成規定的循環壽命試驗後進行本測試。按照 6.2.4.1.1 完成初始化充電。'
      },
      operation: {
        value: '加熱部件加熱同時以 I = P_rc / U_nom 恆流充電（循環壽命後樣品）',
        detail: '使用加熱部件對單體進行加熱，同時以 I = P_rc / U_nom 的特定電流進行恆流充電觸發。'
      },
      termination: {
        value: '連續 3 個溫升速率 dT/dt ≥ 3 °C/s，或起火爆炸，或達到 300 °C，或時間達 4 小時；測試後觀察 1 小時',
        detail: '監測溫度速率，當連續三個 (3 個) 溫升速率 ≥ 3 °C/s，或起火爆炸，或達到 300 °C，或時間達到 4 小時時停止加熱。測試後觀察 1 小時。'
      }
    },
    'GBT36276-6.7.4.3': {
      trigger: {
        value: '中心單體或最小並聯單元恆流充電觸發（以額定功率與標稱電壓之比為電流）',
        detail: '對模塊內的中心單體或最小並聯單元觸發熱失控，採用恆流充電，以觸發對象的額定功率與其標稱電壓的比值作為電流值。測試後觀察 1 小時，監測相鄰單體是否發生熱失控。'
      },
      apparatus: {
        value: '500 W～1000 W 平面加熱板 或 專用觸發裝置',
        detail: '加熱功率 500 W 至 1000 W 之加熱板或電芯內部微加熱觸發裝置。'
      }
    },
    'GBT36276-6.7.2.3': {
      soc: {
        value: '滿電狀態 (100% SOC)',
        detail: '按照 6.2.4.1.2 完成初始化充電。'
      },
      waveform: {
        value: '三軸隨機振動',
        detail: 'X、Y、Z軸三個方向隨機振動，每軸 180 分鐘。依次進行絕緣性能試驗和耐壓性能試驗。'
      },
      axes: {
        value: 'X、Y、Z 軸 3 個方向',
        detail: 'X、Y、Z軸三個方向隨機振動，每軸 180 分鐘。'
      },
      test_duration: {
        value: '每軸 180 分鐘（共 540 分鐘 / 9 小時）；試驗後觀察 1 小時',
        detail: 'X、Y、Z軸三個方向隨機振動，每軸 180 分鐘。試驗結束後觀察 1 小時。依次進行絕緣性能試驗和耐壓性能試驗。'
      },
      vibration_rms: {
        value: '0.51 g',
        detail: '振動加速度均方根值為 0.51 g。'
      }
    }
  };
}

applyStandardHarmonization('GBT36276', getGbt36276Updates());
