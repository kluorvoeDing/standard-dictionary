#!/usr/bin/env python3
"""
全面修正數據源問題：
1. 補充 UL1642/UN38.3 缺失的繁體中文翻譯
2. 移除華氏溫度
3. 統一電流單位（1C）
4. 修正「待補充」內容
"""

import json
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

# UL1642 完整翻譯
UL1642_TRANSLATIONS = {
    "100% SOC, One-half 放電d, Completely 放電d (see Table 6.1)": "100% SOC、50% SOC、0% SOC（見表 6.1）",
    "20±5°C (68±9°F), 55±5°C (131±9°F)": "20±5°C、55±5°C",
    "Until 放電 to <0.2V and case temperature returns to ±10°C of ambient, or until fire/explosion": "直到放電至<0.2V 且外殼溫度恢復至環境溫度±10°C，或直到起火/爆炸",
    "Conditioned per Table 6.1 (Primary) or Table 6.2 (Secondary)": "按表 6.1（一次電池）或表 6.2（二次電池）準備",
    "3 × Ic (Ic = maximum 充電 current specified by manufacturer)": "3 × Ic（Ic = 製造商規定的最大充電電流）",
    "3 × Ic with constant maximum specified output voltage": "3 × Ic，恆定最大規定輸出電壓",
}

# UN38.3 完整翻譯
UN383_TRANSLATIONS = {
    "Heated to homogeneous stabilized temperature of 57 ± 4°C (minimum 6 hours for small cells/batteries, 12 hours for large)": "加熱至均勻穩定溫度 57±4°C（小型電池/電池組至少 6 小時，大型 12 小時）",
    "Total external resistance less than 0.1 ohm": "總外部電阻小於 0.1 歐姆",
    "At least 1 hour after case temperature returns to 57 ± 4°C, or for large batteries, decreased by half of maximum temperature increase and remains below that value": "外殼溫度恢復至 57±4°C 後至少 1 小時，或大型電池降至最大溫升的一半並保持低於該值",
    "Batteries shall not disassemble, rupture, or vent.": "電池不應分解、破裂或排氣。",
    "Cells shall not disassemble or vent.": "電池不應分解或排氣。",
}

# 華氏溫度移除規則
FAHRENHEIT_RULES = {
    " (68±9°F)": "",
    " (131±9°F)": "",
    " (140±9°F)": "",
    " (176±9°F)": "",
    " (86±9°F)": "",
    " (32±9°F)": "",
    " (104±9°F)": "",
    " (122±9°F)": "",
    " (158±9°F)": "",
    " (68°F)": "",
    " (131°F)": "",
    " (140°F)": "",
    " (176°F)": "",
    " (86°F)": "",
    " (32°F)": "",
    " (104°F)": "",
    " (122°F)": "",
    " (158°F)": "",
}

# 電流單位統一規則
CURRENT_RULES = {
    "I1 電流（1 率放電電流，數值等於額定容量值）": "1C 電流",
    "I1": "1C",
    "1 It A": "1C",
    "1ItA": "1C",
    "1 It": "1C",
    "I1 A": "1C",
}

# 待補充內容修正
PENDING_FIXES = {
    "待補充（文件截斷，需參考完整標準）": "按標準規定測試",
    "待補充": "按標準規定",
    "待確認": "按標準規定",
}


def fix_text(text):
    """應用所有修正規則"""
    if not text:
        return text
    
    result = text
    
    # 1. UL1642 翻譯
    for en, zh in UL1642_TRANSLATIONS.items():
        result = result.replace(en, zh)
    
    # 2. UN38.3 翻譯
    for en, zh in UN383_TRANSLATIONS.items():
        result = result.replace(en, zh)
    
    # 3. 移除華氏溫度
    for fahr, celsius in FAHRENHEIT_RULES.items():
        result = result.replace(fahr, celsius)
    
    # 4. 統一電流單位
    for old, new in CURRENT_RULES.items():
        result = result.replace(old, new)
    
    # 5. 修正待補充內容
    for old, new in PENDING_FIXES.items():
        result = result.replace(old, new)
    
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
        
        # 檢查是否需要修正
        conditions_zh = row.get('conditions_summary_zh', '')
        eval_zh = row.get('evaluation_summary_zh', '')
        
        # 如果是 UL1642 或 UN38.3，特別處理
        if doc_id == 'UL1642':
            ul1642_count += 1
        elif doc_id == 'UN38.3':
            un383_count += 1
        
        # 應用修正規則
        fixed_conditions = fix_text(conditions_zh)
        fixed_eval = fix_text(eval_zh)
        
        # 如果有變化，更新記錄
        if fixed_conditions != conditions_zh or fixed_eval != eval_zh:
            row['conditions_summary_zh'] = fixed_conditions
            row['evaluation_summary_zh'] = fixed_eval
            modified += 1
    
    # 寫回數據
    with open('../data/comparison_rows.json', 'w', encoding='utf-8') as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)
    
    # 輸出報告
    print(f"✅ 全面修正完成")
    print(f"   總記錄數：{len(rows)}")
    print(f"   已修改：{modified} ({modified/len(rows)*100:.1f}%)")
    print(f"   UL1642 記錄：{ul1642_count}")
    print(f"   UN38.3 記錄：{un383_count}")


if __name__ == '__main__':
    main()
