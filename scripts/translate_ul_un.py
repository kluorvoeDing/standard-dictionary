#!/usr/bin/env python3
"""
補充 UL1642 和 UN38.3 的完整繁體中文翻譯
"""

import json
import os
import re

os.chdir(os.path.dirname(os.path.abspath(__file__)))

# UL1642 完整翻譯對照表
UL1642_FULL_TRANSLATIONS = {
    # 強制放電測試
    "One fully 放電 d cell connected in series with 100% SOC cells": "1 個完全放電的電池與 100% SOC 電池串聯",
    "Room temperature": "室溫",
    "Number of charged cells = maximum series count - 1": "充電電池數 = 最大串聯數 - 1",
    
    # 溫度循環測試
    "chamber required: True": "需要測試艙：是",
    "循環次數：10": "循環次數：10",
    "step a: Raise to 70±3°C (158±5°F) within 30 min, maintain 4 hours": "步驟 a：30 分鐘內升溫至 70±3°C，保持 4 小時",
    "step b: Reduce to 20±3°C (68±5°F) within 30 min, maintain 2 hours": "步驟 b：30 分鐘內降溫至 20±3°C，保持 2 小時",
    "step c: Reduce to -40±3°C (-40±5°F) within 30 min, maintain 4 hours": "步驟 c：30 分鐘內降溫至 -40±3°C，保持 4 小時",
    "step d: Raise to 20±3°C (68±5°F) within 30 min, maintain 2 hours": "步驟 d：30 分鐘內升溫至 20±3°C，保持 2 小時",
    "樣品不應爆炸或起火。In addition, the samples shall not vent or leak as described in 5.1.1. (Section 18.2)": "樣品不應爆炸或起火。此外，樣品不應如 5.1.1 所述排氣或洩漏。（第 18.2 節）",
    
    # 低氣壓測試
    "壓力：11.6 kPa (1.68 psi) absolute": "壓力：11.6 kPa（絕對）",
    "溫度：20±3°C (68±5°F)": "溫度：20±3°C",
    "持續時間：6 hours": "持續時間：6 小時",
    "樣品不應爆炸或起火。In addition, the samples shall not vent or leak as described in 5.1.1. (Section 19.2)": "樣品不應爆炸或起火。此外，樣品不應如 5.1.1 所述排氣或洩漏。（第 19.2 節）",
    
    # 彈射測試
    "apparatus screen: Steel wire mesh, 20 openings per 25.4 mm (1 in), wire diameter 0.43 mm (0.017 in), covering 102-mm (4-in) diameter hole": "設備篩網：鋼絲網，每 25.4mm（1 英寸）20 個開口，線徑 0.43mm，覆蓋 102mm（4 英寸）直徑孔",
    "apparatus cage: Eight-sided covered wire cage, 610-mm (2-ft) across, 305-mm (1-ft) high, 0.25-mm (0.010-in) aluminum wire, 16-18 wires per 25.4 mm (1 in)": "設備籠：八面覆蓋鐵絲籠，610mm（2 英尺）寬，305mm（1 英尺）高，0.25mm 鋁線，每 25.4mm 16-18 根線",
    "burner: Meker type burner mounted 38 mm (1-1/2 in) below screen": "燃燒器：Meker 型燃燒器，安裝在篩網下方 38mm（1-1/2 英寸）",
    "flame: Bright blue flame causing screen to glow bright red": "火焰：明亮藍色火焰，使篩網發亮紅色",
    "No part of an exploding cell or battery shall penetrate the wire screen such that some or all of the cell or battery protrudes through the screen. (Section 20.1)": "爆炸電池或電池組的任何部分不應穿透鐵絲篩網，使電池或電池組的部分或全部突出篩網。（第 20.1 節）",
    
    # 擠壓測試
    "force: 13±0.78 kN (2900±175 lbf)": "作用力：13±0.78 kN",
    "termination criteria: Voltage drop to one-third of initial voltage or deformation of 15% of sample height, whichever comes first": "終止條件：電壓降至初始電壓的三分之一或樣品高度變形 15%，以先發生者為準",
    "orientation: Cylindrical/prismatic: Long axis parallel to flat surfaces; Coin cell: Flat surface parallel to flat surfaces": "方向：圓柱/方型：長軸平行於平坦表面；鈕扣型：平坦表面平行於平坦表面",
    
    # 外部短路測試
    "樣品不應爆炸或起火。 (Section 10.5)": "樣品不應爆炸或起火。（第 10.5 節）",
    
    # 過度充電測試
    "樣品不應爆炸或起火。 (Section 11.5, 11.10)": "樣品不應爆炸或起火。（第 11.5、11.10 節）",
    
    # 強制放電測試
    "樣品不應爆炸或起火。 (Section 12.6)": "樣品不應爆炸或起火。（第 12.6 節）",
}

# UN38.3 完整翻譯對照表
UN383_FULL_TRANSLATIONS = {
    # 外部短路測試
    "預處理：加熱至均勻穩定溫度 57±4°C（小型電池/電池組至少 6 小時，大型 12 小時）": "預處理：加熱至均勻穩定溫度 57±4°C（小型電池/電池組至少 6 小時，大型 12 小時）",
    "電阻：總外部電阻小於 0.1 歐姆": "電阻：總外部電阻小於 0.1 歐姆",
    "持續時間：外殼溫度恢復至 57±4°C 後至少 1 小時，或大型電池降至最大溫升的一半並保持低於該值": "持續時間：外殼溫度恢復至 57±4°C 後至少 1 小時，或大型電池降至最大溫升的一半並保持低於該值",
    "判定：外部溫度不應超過 170°C。試驗中及試驗後 6 小時內無分解、無破裂、無起火。": "判定：外部溫度不應超過 170°C。試驗中及試驗後 6 小時內無分解、無破裂、無起火。",
    
    # 高度模擬測試
    "壓力：11.6 kPa (1.68 psi)": "壓力：11.6 kPa",
    "溫度：20±3°C (68±5°F)": "溫度：20±3°C",
    "持續時間：6 hours": "持續時間：6 小時",
    "樣品不應洩漏、排氣、分解、破裂或起火。": "樣品不應洩漏、排氣、分解、破裂或起火。",
    
    # 溫度循環測試
    "step 1: Store at 70±3°C (158±5°F) for 6 hours": "步驟 1：70±3°C 儲存 6 小時",
    "step 2: Store at -40±3°C (-40±5°F) for 6 hours": "步驟 2：-40±3°C 儲存 6 小時",
    "transition time: 30 minutes maximum between temperature extremes": "轉換時間：極端溫度之間最多 30 分鐘",
    "cycle count: 10 cycles, then store for 24 hours at 20±3°C (68±5°F)": "循環次數：10 次循環，然後在 20±3°C 儲存 24 小時",
    "樣品不應洩漏、排氣、分解、破裂或起火。": "樣品不應洩漏、排氣、分解、破裂或起火。",
    
    # 振動測試
    "waveform: Sinusoidal waveform with logarithmic sweep": "波形：對數掃頻正弦波",
    "frequency range: 7 Hz to 200 Hz to 7 Hz in 15 minutes": "頻率範圍：7Hz 至 200Hz 再回到 7Hz，15 分鐘",
    "cycle count: 12 cycles per axis (3 hours per axis)": "循環次數：每軸 12 次循環（每軸 3 小時）",
    "orientation: Three mutually perpendicular axes": "方向：三個相互垂直的軸",
    "樣品不應洩漏、排氣、分解、破裂或起火。": "樣品不應洩漏、排氣、分解、破裂或起火。",
    
    # 衝擊測試
    "waveform: Half-sine shock pulse": "波形：半正弦衝擊脈衝",
    "acceleration: 150 gn": "加速度：150 gn",
    "pulse duration: 6 ms": "脈衝持續時間：6 ms",
    "shock count: 3 shocks per direction, 3 directions (18 total)": "衝擊次數：每方向 3 次，3 個方向（共 18 次）",
    "orientation: Three mutually perpendicular directions": "方向：三個相互垂直的方向",
    "樣品不應洩漏、排氣、分解、破裂或起火。": "樣品不應洩漏、排氣、分解、破裂或起火。",
    
    # 外部短路測試
    "resistance: Total external resistance less than 0.1 ohm": "電阻：總外部電阻小於 0.1 歐姆",
    "duration: At least 1 hour after case temperature returns to 57 ± 4°C": "持續時間：外殼溫度恢復至 57±4°C 後至少 1 小時",
    "判定：外部溫度不應超過 170°C。試驗中及試驗後 6 小時內無分解、無破裂、無起火。": "判定：外部溫度不應超過 170°C。試驗中及試驗後 6 小時內無分解、無破裂、無起火。",
    
    # 擠壓測試
    "force: 13±0.78 kN (2900±175 lbf)": "作用力：13±0.78 kN",
    "termination criteria: Voltage drop to one-third or deformation of 15%": "終止條件：電壓降至三分之一或變形 15%",
    "orientation: Cylindrical/prismatic: Long axis parallel; Coin cell: Flat surface parallel": "方向：圓柱/方型：長軸平行；鈕扣型：平坦表面平行",
    "樣品不應洩漏、排氣、分解、破裂或起火。": "樣品不應洩漏、排氣、分解、破裂或起火。",
    
    # 過充電測試
    "charging current: 2.0 It A": "充電電流：2.0 It A",
    "charging voltage: 1.4 × maximum charging voltage (not exceeding 6.0 V)": "充電電壓：1.4 × 最大充電電壓（不超過 6.0V）",
    "charging voltage series: 1.2 × maximum charging voltage / number of series cells": "充電電壓串聯：1.2 × 最大充電電壓 / 串聯電池數",
    "樣品不應洩漏、排氣、分解、破裂或起火。": "樣品不應洩漏、排氣、分解、破裂或起火。",
    
    # 強制放電測試
    "current: 1 It A": "電流：1 It A",
    "target voltage: Negative of maximum charging voltage": "目標電壓：負的最大充電電壓",
    "duration: 90 minutes": "持續時間：90 分鐘",
    "樣品不應洩漏、排氣、分解、破裂或起火。": "樣品不應洩漏、排氣、分解、破裂或起火。",
}

# 通用華氏溫度移除規則
FAHRENHEIT_RULES = [
    r"\s*\(\d+±?\d*°F\)",
    r"\s*\(\d+-\d+°F\)",
    r"\s*\(\d+°F\)",
]


def remove_fahrenheit(text):
    """移除華氏溫度"""
    result = text
    for pattern in FAHRENHEIT_RULES:
        result = re.sub(pattern, '', result)
    return result


def translate_ul1642(text):
    """翻譯 UL1642 內容"""
    result = text
    for en, zh in UL1642_FULL_TRANSLATIONS.items():
        result = result.replace(en, zh)
    # 移除華氏溫度
    result = remove_fahrenheit(result)
    return result


def translate_un383(text):
    """翻譯 UN38.3 內容"""
    result = text
    for en, zh in UN383_FULL_TRANSLATIONS.items():
        result = result.replace(en, zh)
    # 移除華氏溫度
    result = remove_fahrenheit(result)
    return result


def main():
    # 讀取數據
    with open('../data/comparison_rows.json', 'r', encoding='utf-8') as f:
        rows = json.load(f)
    
    # 統計
    modified = 0
    ul1642_count = 0
    un383_count = 0
    
    # 處理每筆記錄
    for row in rows:
        doc_id = row.get('document_id', '')
        
        conditions_zh = row.get('conditions_summary_zh', '')
        eval_zh = row.get('evaluation_summary_zh', '')
        
        # 統計
        if doc_id == 'UL1642':
            ul1642_count += 1
            # 應用 UL1642 翻譯
            fixed_conditions = translate_ul1642(conditions_zh)
            fixed_eval = translate_un383(eval_zh)  # UN38.3 規則也適用於部分 UL1642
        elif doc_id == 'UN38.3':
            un383_count += 1
            # 應用 UN38.3 翻譯
            fixed_conditions = translate_un383(conditions_zh)
            fixed_eval = translate_un383(eval_zh)
        else:
            # 其他記錄只移除華氏溫度
            fixed_conditions = remove_fahrenheit(conditions_zh)
            fixed_eval = remove_fahrenheit(eval_zh)
        
        # 如果有變化，更新記錄
        if fixed_conditions != conditions_zh or fixed_eval != eval_zh:
            row['conditions_summary_zh'] = fixed_conditions
            row['evaluation_summary_zh'] = fixed_eval
            modified += 1
    
    # 寫回數據
    with open('../data/comparison_rows.json', 'w', encoding='utf-8') as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)
    
    # 輸出報告
    print(f"✅ UL1642/UN38.3 翻譯完成")
    print(f"   總記錄數：{len(rows)}")
    print(f"   已修改：{modified} ({modified/len(rows)*100:.1f}%)")
    print(f"   UL1642 記錄：{ul1642_count}")
    print(f"   UN38.3 記錄：{un383_count}")


if __name__ == '__main__':
    main()
