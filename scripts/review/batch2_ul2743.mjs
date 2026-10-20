import { applyStandardHarmonization } from './harmonize_std.mjs';

function getUl2743Updates() {
  return {
    'UL2743-T55-2': {
      external_resistance: {
        value: '≤ 10 mΩ (開關迴路電阻 < 20 mΩ)',
        detail: '輸出端子以不超過 10 mΩ 的阻抗進行短路。如果提供升壓電纜 (booster cable)，短路也必須發生在電纜末端。外接總電阻小於 20 mΩ 之開關負載迴路。'
      },
      termination: {
        value: '保護斷開或恆溫；自動復位 7 小時；手動復位 10 次',
        detail: '持續短路直到內部保護裝置斷開，或達到穩定的恆溫狀態。若自動復位保護器作動，測試需持續 7 小時；若手動復位保護器作動，需操作 10 次循環。'
      },
      fault_condition: {
        value: '電源連接額定電壓；開關開啟與關閉各測；125% 分支過流保護 (最小 20 A)',
        detail: 'Power pack connected to a source of supply adjusted to its rated voltage. 若行動電源配有控制輸出的開關，則測試應在開關開啟與關閉兩種狀態下分別進行。供電電路必須具備額定輸入電流 125% (最小 20 A) 的分支電路過流保護。'
      },
      apparatus: {
        value: '軟木表面覆蓋薄棉紙與起司布（或紗布）；負載電阻 < 20 mΩ 大電流開關迴路',
        detail: '設備需放置在軟木表面上，覆蓋薄棉紙，並用起司布（或紗布）鬆散覆蓋。外接總電阻小於 20 mΩ 之開關負載迴路。'
      }
    },
    'UL2743-T55-9': {
      charging_current: {
        value: '通用：3 倍最大電流；非通用：最大電壓與電流輸出',
        detail: '通用充電接口：以最大充電電壓及 3 倍最大充電電流進行充電。非通用充電接口：以外部充電器可提供的最大電壓與電流輸出進行充電。'
      },
      duration: {
        value: '1.25 小時',
        detail: '持續充電 1.25 小時。'
      },
      fault_condition: {
        value: '充電保護電路無故障或有單一故障',
        detail: '測試需在充電保護電路無單一故障或有單一故障的情況下進行 (with or without a single fault condition) 或電池內部提供的充電電路。'
      },
      operating_conditions: {
        value: '放置軟木表面覆蓋 2 層薄棉紙與 1 層 100% 醫療級棉紗布',
        detail: '設備需放置在軟木表面上，覆蓋兩層 (2 層) 薄棉紙，並覆蓋一層 (1 層) 未經處理的 100% 醫療級棉紗布。'
      }
    },
    'UL2743-T60-3': {
      drop_height: {
        value: '≤ 18 kg 為 0.9 m (3 次)；> 18 kg 附把手為 0.9 m (1 次)；> 25 kg 附輪子為 0.5 m (1 次)',
        detail: '重量 ≤ 18 kg：從 0.9 m 高度落下 3 次。重量 > 18 kg 且附提把：從 0.9 m 高度落下 1 次。重量 > 25 kg 且附輪子：從 0.5 m 高度落下 1 次。自 1 m 高度跌落。'
      },
      drop_count: {
        value: '1 次或 3 次（依重量與移動配件）',
        detail: '重量 ≤ 18 kg 落下 3 次；重量 > 18 kg 且附提把落下 1 次；重量 > 25 kg 且附輪子落下 1 次。'
      },
      drop_surface: {
        value: '平整混凝土地面上鋪設 20 mm 厚硬木板',
        detail: '跌落至平整水泥基座上鋪設 20 mm 厚硬質木板。'
      },
      temperature: {
        value: '室溫 (樣品 1) 與 0 °C (樣品 2)',
        detail: '第 1 個樣品在室溫；第 2 個樣品需在 0 °C 進行調節。如果製造商規定的最低工作溫度低於 0 °C，則採用該最低溫度 (放置 4 小時)。'
      },
      cold_conditioning: {
        value: '第 2 個樣品在 0 °C (或最低工作溫度) 下調節 4 小時',
        detail: '第 2 個樣品需在 0 °C 進行調節。如果製造商規定的最低工作溫度低於 0 °C，則採用該最低溫度 (放置 4 小時)。'
      }
    }
  };
}

applyStandardHarmonization('UL2743', getUl2743Updates());
