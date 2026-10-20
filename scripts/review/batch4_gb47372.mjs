import { applyStandardHarmonization } from './harmonize_std.mjs';

function getGb47372Updates() {
  return {
    'GB47372-6.1': {
      soc: {
        value: '充滿電後 (100% SOC)',
        detail: '按 4.2 規定充滿電後進行試驗。'
      },
      charging_voltage: {
        value: '1.2 × n × Uup (電池充電上限電壓)',
        detail: '施加電壓為 1.2 × n × Uup (電池充電上限電壓)。'
      },
      fault_condition: {
        value: '保護電路正常條件與單一故障條件分別進行',
        detail: '在保護電路正常條件下以及單一故障條件下分別進行。'
      }
    },
    'GB47372-6.2': {
      soc: {
        value: '放完電後 (0% SOC)',
        detail: '按 4.3 規定放完電後進行試驗。'
      },
      fault_condition: {
        value: '正常工作條件及單一故障條件分別測量',
        detail: '在正常工作條件及單一故障條件下分別測量。'
      }
    },
    'GB47372-6.3': {
      soc: {
        value: '放完電後 (0% SOC)',
        detail: '按 4.3 規定放完電後進行試驗。'
      },
      fault_condition: {
        value: '正常工作條件及單一故障條件分別測量',
        detail: '在正常工作條件及單一故障條件下分別測量。'
      }
    },
    'GB47372-6.4': {
      soc: {
        value: '充滿電後 (100% SOC)',
        detail: '按 4.2 規定充滿電後進行試驗。'
      },
      fault_condition: {
        value: '正常工作條件及單一故障條件分別測量',
        detail: '在正常工作條件及單一故障條件下分別測量。'
      }
    },
    'GB47372-6.5': {
      target_temperature: {
        value: '充電高溫：Tcm + 4 °C；充電低溫：Tcl - 4 °C；放電高溫：Tdm + 4 °C',
        detail: '將空電樣品置於 Tcm + 4 °C 中充電；將空電樣品置於 Tcl - 4 °C 中充電；將滿電樣品置於 Tdm + 4 °C 中放電。'
      },
      operation: {
        value: '空電置於 Tcm + 4 °C 及 Tcl - 4 °C 充電；滿電置於 Tdm + 4 °C 放電',
        detail: '將空電樣品置於 Tcm + 4 °C 中充電；將空電樣品置於 Tcl - 4 °C 中充電；將滿電樣品置於 Tdm + 4 °C 中放電。'
      }
    },
    'GB47372-6.6': {
      soc: {
        value: '充滿電後 (100% SOC)',
        detail: '按 4.2 規定充滿電後進行試驗。'
      },
      external_resistance: {
        value: '80 ± 20 mΩ',
        detail: '輸出端口正負極之間、相線零線之間施加 (80±20) mΩ 的短路總電阻。外接總電阻小於等於 5 mΩ 之高壓大電流接觸器或專用電子短路負載。'
      },
      duration: {
        value: '持續 2 小時後斷開',
        detail: '持續 2 小時後斷開。'
      },
      apparatus: {
        value: '負載電阻 ≤ 5 mΩ 之電子開關迴路',
        detail: '外接總電阻小於等於 5 mΩ 之高壓大電流接觸器或專用電子短路負載。'
      }
    },
    'GB47372-6.7': {
      soc: {
        value: '充滿電後 (100% SOC)',
        detail: '按 4.2 規定充滿電後進行試驗。'
      },
      operation: {
        value: '反向充電 1 小時；端口互連 1 小時',
        detail: '單向輸出接口如與輸入接口一致，用直流電源按該端口最大輸出施加到輸出端口充電 1 小時；任一輸出端口與任一輸入端口用連接線連接，持續 1 小時。'
      },
      duration: {
        value: '各 1 小時',
        detail: '反向充電 1 小時，端口互連 1 小時。'
      }
    },
    'GB47372-6.9': {
      operating_conditions: {
        value: '依時間或循環次數調節最大充電電壓',
        detail: '根據運行時間或循環次數調節最大充電電壓。'
      },
      cycles: {
        value: '根據運行時間或循環次數調節最大充電電壓',
        detail: '根據運行時間或循環次數調節最大充電電壓。'
      }
    },
    'GB47372-6.10': {
      fault_condition: {
        value: '欠壓 0.4 × Udo (保持 10 秒)；過壓 Uup + 0.3 V (保持 2 秒)',
        detail: '電池調整至 0.4 × Udo 保持 10 秒，維持該電壓進行充放電；電池調整至 Uup + 0.3 V 保持 2 秒，維持該電壓進行充放電。'
      },
      duration: {
        value: '欠壓保持 10 秒；過壓保持 2 秒',
        detail: '電池調整至 0.4 × Udo 保持 10 秒，維持該電壓進行充放電；電池調整至 Uup + 0.3 V 保持 2 秒，維持該電壓進行充放電。'
      }
    },
    'GB47372-7.1': {
      soc: {
        value: '充滿電後 (100% SOC)',
        detail: '按照標準方法充滿電後。'
      },
      charging_current: {
        value: '0.2 It 恆流充電',
        detail: '用 0.2 It 恆流充電。'
      },
      charging_voltage: {
        value: '1.3 × Ucl (充電限制電壓)',
        detail: '充電至 1.3 × Ucl (充電限制電壓)。'
      },
      duration: {
        value: '恆壓充電 1 小時或總充電時間達 7 小時停止',
        detail: '繼續恆壓充電 1 小時 停止，或總充電時間達到 7 小時 停止試驗。'
      }
    },
    'GB47372-7.2': {
      soc: {
        value: '充滿電後 (100% SOC)',
        detail: '按照標準方法充滿電後。'
      },
      apparatus: {
        value: '直徑 25 mm 鋼質半圓柱體',
        detail: '直徑 25 mm 的鋼質半圓柱體。'
      },
      crush_speed: {
        value: '0.1 mm/s',
        detail: '擠壓速度為 0.1 mm/s。'
      },
      force: {
        value: '硬殼及圓柱：20 ± 1.2 kN；軟包：按表 5 規定',
        detail: '硬殼方形電池和圓柱形電池擠壓力為 20 kN ± 1.2 kN；軟包方形電池根據寬度按照表 5 規定的擠壓力進行。'
      },
      termination: {
        value: '壓力達最大值或電池電壓降 1/3',
        detail: '壓力達到最大值或電池電壓下降三分之一。'
      }
    },
    'GB47372-7.3': {
      soc: {
        value: '充滿電後 (100% SOC)',
        detail: '按照標準方法充滿電後。'
      },
      heating_rate: {
        value: '5 ± 2 °C/min',
        detail: '以 (5 ± 2) °C/min 的溫升速率進行升溫。'
      },
      target_temperature: {
        value: '135 ± 2 °C',
        detail: '箱內溫度達到 135 °C ± 2 °C。'
      },
      duration: {
        value: '恆溫並持續 60 分鐘',
        detail: '恆溫並持續 60 分鐘。'
      }
    },
    'GB47372-7.4': {
      soc: {
        value: '充滿電後 (100% SOC)',
        detail: '按照標準方法充滿電後。'
      },
      nail_diameter: {
        value: '直徑 4 mm 耐高溫鋼針 (鎢鋼)',
        detail: '直徑為 4 mm 的耐高溫鋼針（如鎢鋼），針尖圓錐角為 14°。'
      },
      needle_diameter: {
        value: '圓錐角 14°',
        detail: '針尖圓錐角為 14°。'
      },
      penetration_speed: {
        value: '20 ± 1 mm/s',
        detail: '以 (20 ± 1) mm/s 的速度貫穿電池。'
      }
    },
    'GB47372-7.5': {
      temperature: {
        value: '25 ± 5 °C',
        detail: '環境溫度 25 ± 5 °C 下進行。'
      },
      charge: {
        value: '0.8 × Icm 恆流充電至 (Ucl - 0.1 V)',
        detail: '以 0.8 × Icm 恆流充電至 (Ucl - 0.1 V)。'
      },
      discharge: {
        value: '1 It 恆流放電至 Ude',
        detail: '以 1 It 恆流放電至 Ude。'
      },
      cycles: {
        value: '300 次充放電循環 (間隔 10 分鐘)',
        detail: '進行 300 次充放電循環，間隔 10 分鐘。'
      }
    },
    'GB47372-7.6': {
      soc: {
        value: '充滿電後 (100% SOC)',
        detail: '按照標準方法充滿電後。'
      },
      trigger: {
        value: '加熱觸發 (最大功率持續加熱，表 B.1)',
        detail: '啟動加熱裝置，以最大功率持續加熱（表 B.1），直至發生熱失控或溫度達到 300 °C。'
      },
      termination_for_trigger: {
        value: '發生熱失控或溫度達到 300 °C',
        detail: '直至發生熱失控或溫度達到 300 °C。表 B.1。'
      }
    }
  };
}

applyStandardHarmonization('GB47372', getGb47372Updates());
