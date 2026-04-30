#!/usr/bin/env python3
"""
精簡條件和判定欄位
規則：
1. 統一使用繁體中文
2. 精簡冗餘描述
3. 移除廢話
"""

import json
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

# 精簡規則
REFINE_RULES = {
    # SOC 相關
    r"SOC（充電狀態）": "SOC",
    r"SOC\(充電狀態\)": "SOC",
    r"充電狀態": "SOC",
    r"按 7.1.1 方法進行標準充電": "按 7.1.1 充電",
    r"按 7.1.2 方法充滿電": "按 7.1.2 充電",
    r"按 7.1.1 規定充電": "按 7.1.1 充電",
    r"按 7.1.1 規定充滿電": "按 7.1.1 充電",
    r"按 4.5.1 規定充電": "按 4.5.1 充電",
    r"按 4.5.1 規定充滿電": "按 4.5.1 充電",
    r"按 7.2 方法準備": "按 7.2 準備",
    r"按 7.2 方法": "按 7.2",
    r"Fully charged": "100% SOC",
    r"fully charged": "100% SOC",
    r"Completely 放電 d": "0% SOC",
    r"One-half 放電 d": "50% SOC",
    r"放電至製造商規定的終止電壓": "放電至終止電壓",
    r"放電至製造商規定容量": "放電至規定容量",
    r"放電至製造商規定的 EODV": "放電至 EODV",
    
    # 持續時間精簡
    r"持續時間：外部短路 10 min": "持續時間：10 min",
    r"持續時間：外部短路": "持續時間：",
    r"duration: 外部短路": "持續時間：",
    r"duration: Until": "持續時間：直到",
    r"duration: At least": "持續時間：至少",
    r"duration: ": "持續時間：",
    r"**持續時間：**": "持續時間：",
    
    # 觀察精簡
    r"observation: 試驗環境溫度下觀察": "觀察：",
    r"observation: 觀察": "觀察：",
    r"observation: ": "觀察：",
    r"試驗環境溫度下觀察": "觀察",
    r"試驗後觀察": "試驗後觀察",
    r"rest period: 測試後靜置觀察": "試驗後觀察",
    r"rest period: ": "試驗後觀察",
    
    # 溫度精簡
    r"temperature: ": "溫度：",
    r"**溫度：**": "溫度：",
    r"temp: ": "溫度：",
    r"ambient temperature: ": "環境溫度：",
    r"target temperature: ": "目標溫度：",
    r"target **溫度：**": "目標溫度：",
    
    # 電阻精簡
    r"resistance: ": "電阻：",
    r"**電阻：**": "電阻：",
    r"External 線路電阻": "外部電阻",
    r"外部線路電阻": "外部電阻",
    r"Connection resistance": "連接電阻",
    r"total external resistance": "總外部電阻",
    
    # 電流精簡
    r"charging current: ": "充電電流：",
    r"charging **電流：**": "充電電流：",
    r"discharge current: ": "放電電流：",
    r"放電 **電流：**": "放電電流：",
    r"current: ": "電流：",
    r"**電流：**": "電流：",
    r"charging **電壓：**": "充電電壓：",
    r"charging voltage: ": "充電電壓：",
    
    # 測試方法精簡
    r"test method: ": "測試方法：",
    r"**測試方法：**": "測試方法：",
    r"按標準規定": "按標準",
    r"按 8.2.13 進行外部短路保護試驗": "按 8.2.13 測試",
    r"按 8.2.14 進行過充電保護試驗": "按 8.2.14 測試",
    r"按 8.2.15 進行過放電保護試驗": "按 8.2.15 測試",
    r"按 8.2.12 進行過流保護試驗": "按 8.2.12 測試",
    r"按 8.2.11 進行過溫保護試驗": "按 8.2.11 測試",
    r"按 8.2.16 進行底部撞擊試驗": "按 8.2.16 測試",
    r"按 8.2.1 進行振動試驗": "按 8.2.1 測試",
    r"按 8.2.2 進行機械衝擊試驗": "按 8.2.2 測試",
    r"按 8.2.3 進行模擬碰撞試驗": "按 8.2.3 測試",
    r"按 8.2.4 進行擠壓試驗": "按 8.2.4 測試",
    r"按 8.2.5 進行濕熱循環試驗": "按 8.2.5 測試",
    r"按 8.2.6 進行浸水試驗": "按 8.2.6 測試",
    r"按 8.2.7.1 進行外部火燒試驗": "按 8.2.7.1 測試",
    r"按 8.2.8 進行溫度衝擊試驗": "按 8.2.8 測試",
    r"按 8.2.9 進行鹽霧試驗": "按 8.2.9 測試",
    r"按 8.2.10 進行高海拔試驗": "按 8.2.10 測試",
    r"按照 8.3 進行過壓充電控制試驗": "按 8.3 測試",
    r"按照 8.4 進行過流充電控制試驗": "按 8.4 測試",
    r"按照 8.5 進行欠壓放電控制試驗": "按 8.5 測試",
    r"按照 8.6 進行過熱控制試驗": "按 8.6 測試",
    
    # 判定精簡
    r"應不起火、不爆炸": "無起火、爆炸",
    r"應無起火、無爆炸": "無起火、爆炸",
    r"應無起火現象、無爆炸": "無起火、爆炸",
    r"應無洩漏、無起火、無爆炸": "無洩漏、起火、爆炸",
    r"應無洩漏現象、無起火、無爆炸": "無洩漏、起火、爆炸",
    r"應無洩漏、外殼破裂、起火或爆炸現象": "無洩漏、破裂、起火、爆炸",
    r"應無洩漏現象、外殼破裂、起火或爆炸現象": "無洩漏、破裂、起火、爆炸",
    r"應無爆炸、無起火": "無爆炸、起火",
    r"應無爆炸現象、無起火": "無爆炸、起火",
    r"無 disassembly": "無分解",
    r"無 rupture": "無破裂",
    r"無 fire": "無起火",
    r"無 explosion": "無爆炸",
    
    # 其他精簡
    r"cycle count: ": "循環次數：",
    r"waveform: ": "波形：",
    r"frequency range: ": "頻率範圍：",
    r"acceleration: ": "加速度：",
    r"pulse duration: ": "脈衝持續時間：",
    r"pulse **持續時間：**": "脈衝持續時間：",
    r"drop height: ": "跌落高度：",
    r"height: ": "高度：",
    r"force: ": "作用力：",
    r"**作用力：**": "作用力：",
    r"speed: ": "速度：",
    r"ramp rate: ": "升溫速率：",
    r"hold time: ": "保持時間：",
    r"stabilization: ": "穩定時間：",
    r"preconditioning: ": "預處理：",
    r"apparatus: ": "設備：",
    r"orientation: ": "方向：",
    r"direction: ": "方向：",
    r"monitoring: ": "監測：",
    r"fault condition: ": "故障條件：",
    r"termination criteria: ": "終止條件：",
    r"target voltage: ": "目標電壓：",
    r"target **電壓：**": "目標電壓：",
    r"pressure: ": "壓力：",
    r"**壓力：**": "壓力：",
    r"humidity: ": "濕度：",
    r"fire source: ": "火源：",
    r"floor: ": "地板：",
    r"drop count: ": "跌落次數：",
    r"shock count: ": "衝擊次數：",
    r"mass: ": "質量：",
    r"depth: ": "深度：",
    r"charge failure procedure: ": "充電失效程序：",
    r"normal charge: ": "正常充電：",
    r"vehicle based: ": "車輛級：",
    r"component based: ": "元件級：",
    r"charge method: ": "充電方法：",
    r"charging method: ": "充電方法：",
    r"充電 method: ": "充電方法：",
    r"measurement: ": "測量：",
    r"limits table": "限制见表",
    r"series cells: ": "串聯電池數：",
    r"parallel strings: ": "並聯串數：",
    r"setup: ": "設置：",
    r"trigger method: ": "觸發方法：",
    r"trigger location: ": "觸發位置：",
    r"trigger cell count: ": "觸發電池數：",
    r"test a: ": "測試 A：",
    r"test b: ": "測試 B：",
    r"tests included: ": "測試包含：",
    r"reference: ": "參考：",
    r"cooling system: ": "冷卻系統：",
    r"BMS requirement: ": "BMS 要求：",
    r"BMS 應控制": "BMS 控制",
    r"BMS terminates": "BMS 終止",
    r"BMS shall detect": "BMS 檢測",
    r"應滿足如下要求之一": "滿足以下之一",
    r"按方式一進行": "方式一",
    r"按方式二進行": "方式二",
    r"試驗後滿足": "試驗後符合",
    r"若有交流電路": "交流電路",
    r"絕緣電阻不小于": "絕緣電阻≥",
    r"絕緣電阻應不小于": "絕緣電阻≥",
    r"試驗後的絕緣電阻應不小于": "試驗後絕緣電阻≥",
    r"試驗後 30 min 內的絕緣電阻應不小于": "試驗後 30min 內絕緣電阻≥",
    r"保護裝置應啟動": "保護啟動",
    r"保護裝置應啟動防止": "保護啟動防止",
    r"保護裝置應正常運作": "保護正常",
    r"保護控制正常": "保護正常",
    r"保護功能應正常運作": "保護正常",
    r"應無起火現象": "無起火",
    r"應無爆炸現象": "無爆炸",
    r"應不爆炸": "無爆炸",
    r"應不起火": "無起火",
    r"應無洩漏現象": "無洩漏",
    r"應無破裂": "無破裂",
    r"應無排氣": "無排氣",
    r"應無可燃氣體": "無可燃氣體",
    r"應無有毒氣體": "無有毒氣體",
    r"應無電擊": "無電擊",
    r"應滿足阻燃要求": "符合阻燃要求",
    r"應不導致": "不導致",
    r"應提供": "提供",
    r"應監測": "監測",
    r"應記錄": "記錄",
    r"應使用": "使用",
    r"應放置": "放置",
    r"應設置": "設置",
    r"應調整": "調整",
    r"應充電": "充電",
    r"應放電": "放電",
    r"應靜置": "靜置",
    r"應恢復": "恢復",
    r"應計算": "計算",
    r"應繪製": "繪製",
    r"應符合": "符合",
    r"應小於": "<",
    r"應大於": ">",
    r"應等於": "=",
    r"應不超過": "≤",
    r"應不低於": "≥",
    r"至少": "≥",
    r"至多": "≤",
    r"不超過": "≤",
    r"不低於": "≥",
    r"不小於": "≥",
    r"不大於": "≤",
}

# 需要完全翻譯的英文短語
EN_TO_ZH = {
    "Short-circuit between positive and negative terminals shall not cause fire or explosion.": "正負極短路不應引起起火或爆炸。",
    "Short-circuit between positive and negative terminals shall not cause fire or explosion": "正負極短路不應引起起火或爆炸",
    "The samples shall not explode or catch fire.": "樣品不應爆炸或起火。",
    "The samples shall not explode or catch fire": "樣品不應爆炸或起火",
    "No fire, no explosion.": "無起火、無爆炸。",
    "No fire, no explosion": "無起火、無爆炸",
    "No electrolyte leakage, rupture, fire, or explosion.": "無電解液洩漏、破裂、起火或爆炸。",
    "No electrolyte leakage, rupture, fire, or explosion": "無電解液洩漏、破裂、起火或爆炸",
    "No disassembly, no rupture, and no fire during test and within 6 hours after test.": "試驗中及試驗後 6 小時內無分解、無破裂、無起火。",
    "No disassembly, no rupture, and no fire during test and within 6 hours after test": "試驗中及試驗後 6 小時內無分解、無破裂、無起火",
    "External temperature shall not exceed 170°C.": "外部溫度不應超過 170°C。",
    "External temperature shall not exceed 170°C": "外部溫度不應超過 170°C",
    "No disassembly, no rupture and no fire during test and within 6 hours after test.": "試驗中及試驗後 6 小時內無分解、無破裂、無起火。",
    "Charging for longer periods than specified shall not cause fire or explosion.": "超過規定時間充電不應引起起火或爆炸。",
    "Charging for longer periods than specified shall not cause fire or explosion": "超過規定時間充電不應引起起火或爆炸",
    "BMS terminates charging before exceeding upper limit charging voltage. No fire, no explosion.": "BMS 在超過上限充電電壓前終止充電。無起火、無爆炸。",
    "BMS terminates charging before exceeding upper limit charging voltage. No fire, no explosion": "BMS 在超過上限充電電壓前終止充電。無起火、無爆炸",
    "BMS shall detect overcharging current and control charging below maximum charging current. No fire, no explosion.": "BMS 應檢測過充電電流並控制充電低於最大充電電流。無起火、無爆炸。",
    "BMS shall detect overcharging current and control charging below maximum charging current. No fire, no explosion": "BMS 應檢測過充電電流並控制充電低於最大充電電流。無起火、無爆炸",
    "BMS shall detect overcharging current and control charging below maximum charging current": "BMS 應檢測過充電電流並控制充電低於最大充電電流",
    "BMS shall control temperature not to exceed upper limit charging/discharging temperature.": "BMS 應控制溫度不超過上限充電/放電溫度。",
    "BMS shall control temperature not to exceed upper limit charging/discharging temperature": "BMS 應控制溫度不超過上限充電/放電溫度",
    "BMS shall control temperature": "BMS 控制溫度",
    "BMS shall control charging voltage": "BMS 控制充電電壓",
    "BMS shall control charging current": "BMS 控制充電電流",
    "BMS shall control discharging voltage": "BMS 控制放電電壓",
    "BMS shall detect": "BMS 檢測",
    "BMS terminates": "BMS 終止",
    "Single cell failure shall not cause internal fire propagation to outside of DUT enclosure.": "單電池失效不應導致內部火災傳播至 DUT 外殼外部。",
    "Single cell failure shall not cause internal fire propagation to outside of DUT enclosure": "單電池失效不應導致內部火災傳播至 DUT 外殼外部",
    "Short-circuit between positive and negative terminals shall not cause fire, explosion, or electrolyte leakage.": "正負極短路不應引起起火、爆炸或電解液洩漏。",
    "Short-circuit between positive and negative terminals shall not cause fire, explosion, or electrolyte leakage": "正負極短路不應引起起火、爆炸或電解液洩漏",
    "The output shall comply with the limits of Table 15.1 or 15.2.": "輸出應符合表 15.1 或 15.2 的限制。",
    "The output shall comply with the limits of Table 15.1 or 15.2": "輸出應符合表 15.1 或 15.2 的限制",
    "Batteries meeting the requirements may be marked 'LPS'.": "符合要求的電池可標記為'LPS'。",
    "Batteries meeting the requirements may be marked 'LPS'": "符合要求的電池可標記為'LPS'",
    "Cell or cell block shall not catch fire or explode.": "電池或電池組不應起火或爆炸。",
    "Cell or cell block shall not catch fire or explode": "電池或電池組不應起火或爆炸",
    "Battery shall not catch fire or explode.": "電池不應起火或爆炸。",
    "Battery shall not catch fire or explode": "電池不應起火或爆炸",
    "Battery pack shall not catch fire or explode.": "電池包不應起火或爆炸。",
    "Battery pack shall not catch fire or explode": "電池包不應起火或爆炸",
    "System shall not catch fire or explode.": "系統不應起火或爆炸。",
    "System shall not catch fire or explode": "系統不應起火或爆炸",
    "No rupture, no fire.": "無破裂、無起火。",
    "No rupture, no fire": "無破裂、無起火",
    "No leakage, no fire.": "無洩漏、無起火。",
    "No leakage, no fire": "無洩漏、無起火",
    "No fire.": "無起火。",
    "No fire": "無起火",
    "No explosion.": "無爆炸。",
    "No explosion": "無爆炸",
    "No leakage.": "無洩漏。",
    "No leakage": "無洩漏",
    "No rupture.": "無破裂。",
    "No rupture": "無破裂",
    "No venting.": "無排氣。",
    "No venting": "無排氣",
    "No electrolyte leakage.": "無電解液洩漏。",
    "No electrolyte leakage": "無電解液洩漏",
    "During a normal charge procedure, hydrogen emissions shall be below 125 g during 5 h, or below 25 × t2 g during t2.": "正常充電過程中，氫氣排放量在 5 小時內應低於 125g，或在 t2 時間內低於 25×t2 g。",
    "During a normal charge procedure, hydrogen emissions shall be below 125 g during 5 h, or below 25 × t2 g during t2": "正常充電過程中，氫氣排放量在 5 小時內應低於 125g，或在 t2 時間內低於 25×t2 g",
    "During a charge carried out with charger failure, hydrogen emissions shall be below 42 g during 30 minutes.": "充電器故障充電過程中，氫氣排放量在 30 分鐘內應低於 42g。",
    "During a charge carried out with charger failure, hydrogen emissions shall be below 42 g during 30 minutes": "充電器故障充電過程中，氫氣排放量在 30 分鐘內應低於 42g",
    "Hydrogen concentration, temperature, and pressure measured in sealed chamber.": "在密閉測試艙中測量氫氣濃度、溫度和壓力。",
    "Hydrogen concentration, temperature, and pressure measured in sealed chamber": "在密閉測試艙中測量氫氣濃度、溫度和壓力",
    "Vehicle soaked at 293 ± 2 K for 12-36 h after discharge, then charged in sealed chamber.": "車輛放電後在 293±2K 環境中浸漬 12-36 小時，然後在密閉測試艙中充電。",
    "Vehicle soaked at 293 ± 2 K for 12-36 h after discharge, then charged in sealed chamber": "車輛放電後在 293±2K 環境中浸漬 12-36 小時，然後在密閉測試艙中充電",
    "REESS conditioned with minimum 5 standard cycles, soaked at 293 ± 2 K for 12-36 h, then charged in sealed chamber.": "REESS 經過至少 5 次標準循環處理，在 293±2K 環境中浸漬 12-36 小時，然後在密閉測試艙中充電。",
    "REESS conditioned with minimum 5 standard cycles, soaked at 293 ± 2 K for 12-36 h, then charged in sealed chamber": "REESS 經過至少 5 次標準循環處理，在 293±2K 環境中浸漬 12-36 小時，然後在密閉測試艙中充電",
    "Charge at constant power during t1, then overcharge at constant current during t2.": "在 t1 期間恆功率充電，然後在 t2 期間恆流過充電。",
    "Charge at constant power during t1, then overcharge at constant current during t2": "在 t1 期間恆功率充電，然後在 t2 期間恆流過充電",
    "Ambient temperature: 291-295 K during test.": "試驗期間環境溫度：291-295K。",
    "Ambient temperature: 291-295 K during test": "試驗期間環境溫度：291-295K",
    "Charging at constant power during t'1, then charging at maximum current recommended by the manufacturer during 30 minutes.": "在 t'1 期間恆功率充電，然後以製造商建議的最大電流充電 30 分鐘。",
    "Charging at constant power during t'1, then charging at maximum current recommended by the manufacturer during 30 minutes": "在 t'1 期間恆功率充電，然後以製造商建議的最大電流充電 30 分鐘",
    "Measure internal AC resistance to determine test applicability.": "測量內部交流電阻以確定測試適用性。",
    "Measure internal AC resistance to determine test applicability": "測量內部交流電阻以確定測試適用性",
    "Record pressure at which internal short circuit occurs.": "記錄發生內部短路時的壓力。",
    "Record pressure at which internal short circuit occurs": "記錄發生內部短路時的壓力",
    "Thermal runaway shall not propagate to adjacent cells, or if propagates, shall have sufficient warning time (≥5 minutes) for occupant escape.": "熱失控不應傳播至相鄰電池，或若傳播，應有足夠警告時間（≥5 分鐘）供乘員逃離。",
    "Thermal runaway shall not propagate to adjacent cells, or if propagates, shall have sufficient warning time": "熱失控不應傳播至相鄰電池，或若傳播，應有足夠警告時間",
}


def refine_text(text):
    """應用精簡規則"""
    if not text:
        return text
    
    result = text
    
    # 先應用完整翻譯
    for en, zh in EN_TO_ZH.items():
        if en in result:
            result = result.replace(en, zh)
    
    # 再應用精簡規則（按長度排序，先處理長的，使用簡單字符串替換）
    for pattern, replacement in sorted(REFINE_RULES.items(), key=lambda x: -len(x[0])):
        result = result.replace(pattern, replacement)
    
    return result


def main():
    # 讀取數據
    with open('../data/comparison_rows.json', 'r', encoding='utf-8') as f:
        rows = json.load(f)
    
    # 統計
    modified = 0
    total = len(rows)
    
    # 處理每筆記錄
    for row in rows:
        original_zh = row.get('conditions_summary_zh', '')
        original_eval_zh = row.get('evaluation_summary_zh', '')
        
        # 如果沒有繁體中文欄位，嘗試從英文創建
        if not original_zh:
            original_zh = row.get('conditions_summary', '')
        if not original_eval_zh:
            original_eval_zh = row.get('evaluation_summary', '')
        
        # 應用精簡規則
        refined_zh = refine_text(original_zh)
        refined_eval_zh = refine_text(original_eval_zh)
        
        # 如果精簡後有變化，更新記錄
        if refined_zh != original_zh or refined_eval_zh != original_eval_zh:
            row['conditions_summary_zh'] = refined_zh
            row['evaluation_summary_zh'] = refined_eval_zh
            modified += 1
    
    # 寫回數據
    with open('../data/comparison_rows.json', 'w', encoding='utf-8') as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)
    
    # 輸出報告
    print(f"✅ 精簡完成")
    print(f"   總記錄數：{total}")
    print(f"   已修改：{modified} ({modified/total*100:.1f}%)")
    print(f"   未修改：{total - modified} ({(total-modified)/total*100:.1f}%)")


if __name__ == '__main__':
    main()
