#!/usr/bin/env python3
"""修正 UN38.3 的中英混雜翻譯"""

import json
import sys

def fix_un38_translations(data):
    """修正 UN38.3 的條件與判定翻譯"""
    corrections = {
        # 外部短路測試
        "57 ± 4°C": "57±4°C",
        "57±4°C": "57±4°C",
        "temperature during test: Cell/battery at 57±4°C": "測試溫度：電池/電池組在 57±4°C",
        "temperature during test: Cell/battery at 57 ± 4°C": "測試溫度：電池/電池組在 57±4°C",

        # 過充電測試
        "charge 電流： Twice the manufacturer's recommended maximum continuous charge current": "充電電流：製造商建議的最大連續充電電流的 2 倍",
        "charge 電流：Twice the manufacturer's recommended maximum continuous charge current": "充電電流：製造商建議的最大連續充電電流的 2 倍",
        "min voltage low: For recommended charge voltage ≤18V: lesser of (2 × max charge voltage) or 22V": "最低電壓（低）：對於建議充電電壓 ≤18V：(2 × 最大充電電壓) 或 22V 的較小值",
        "min voltage high: For recommended charge voltage >18V: 1.2 × max charge voltage": "最低電壓（高）：對於建議充電電壓 >18V：1.2 × 最大充電電壓",
        "溫度： Ambient temperature": "溫度：環境溫度",
        "溫度：Ambient temperature": "溫度：環境溫度",
        "No disassembly and no fire during test and within 7 days after test.": "測試中及測試後 7 天內無分解、無起火。",

        # 強制放電測試
        "power supply: 12 V D.C. power supply in series": "電源：串聯 12V 直流電源",
        "initial 電流： Equal to maximum 放電 current specified by manufacturer": "初始電流：等於製造商規定的最大放電電流",
        "initial 電流：Equal to maximum 放電 current specified by manufacturer": "初始電流：等於製造商規定的最大放電電流",
        "設備：Resistive load of appropriate size and rating in series with test cell": "設備：與測試電池串聯的適當尺寸和額定值的電阻負載",
        "溫度：Ambient temperature": "溫度：環境溫度",

        # 溫度循環測試
        "high 溫度：72 ± 2°C for at least 6 hours (12 hours for large cells/batteries)": "高溫：72±2°C 至少 6 小時（大型電池/電池組 12 小時）",
        "low 溫度：-40 ± 2°C for at least 6 hours (12 hours for large cells/batteries)": "低溫：-40±2°C 至少 6 小時（大型電池/電池組 12 小時）",
        "transition time: Maximum 30 minutes between temperature extremes": "過渡時間：極端溫度之間最多 30 分鐘",
        "循環次數：10 total cycles": "循環次數：共 10 個循環",

        # 高度模擬測試
        "壓力：11.6 kPa or less": "壓力：11.6 kPa 或更低",
        "壓力： 11.6 kPa or less": "壓力：11.6 kPa 或更低",
        "溫度：Ambient temperature (20 ± 5°C)": "溫度：環境溫度（20±5°C）",
        "持續時間：At least 6 hours": "持續時間：至少 6 小時",
        "持續時間： At least 6 hours": "持續時間：至少 6 小時",
        "sample condition: Un放電d (primary), 100% SOC (secondary)": "樣品狀態：未放電（一次電池）、100% SOC（二次電池）",
        "無洩漏, no venting, no disassembly, no rupture and no fire. Open circuit voltage after testing shall not be less than 90% of voltage prior to procedure.": "無洩漏、無排氣、無分解、無破裂、無起火。測試後開路電壓不得低於程序前電壓的 90%。",

        # 撞擊/擠壓測試
        "樣品不得爆炸或起火。（6 小時內不得分解）": "樣品不得爆炸或起火（6 小時內不得分解）",

        # 衝擊測試
        "樣品不得出現洩漏、出氣、分解、破裂或起火。測試後，開路電壓不得低於程序前電壓的 90%。": "樣品不得出現洩漏、排氣、分解、破裂或起火。測試後，開路電壓不得低於程序前電壓的 90%。",

        # 振動測試
        "樣品不得出現洩漏、出氣、分解、破裂或起火。測試後，第三個垂直安裝方向的開路電壓不得低於程序前電壓的 90%。": "樣品不得出現洩漏、排氣、分解、破裂或起火。測試後，第三個垂直安裝方向的開路電壓不得低於程序前電壓的 90%。",

        # 判定統一修正
        "No leakage, no venting, no disassembly, no rupture and no fire.": "無洩漏、無排氣、無分解、無破裂、無起火。",
        "Open circuit voltage after testing shall not be less than 90% of voltage prior to procedure.": "測試後開路電壓不得低於程序前電壓的 90%。",
    }

    for row in data:
        if row.get('document_id') == 'UN38.3':
            # 修正條件
            if 'conditions_summary_zh' in row:
                old_cond = row['conditions_summary_zh']
                for old, new in corrections.items():
                    if old in old_cond:
                        row['conditions_summary_zh'] = row['conditions_summary_zh'].replace(old, new)
                if old_cond != row['conditions_summary_zh']:
                    print(f"修正條件: {row['item_name_zh']}")

            # 修正判定
            if 'evaluation_summary_zh' in row:
                old_eval = row['evaluation_summary_zh']
                for old, new in corrections.items():
                    if old in old_eval:
                        row['evaluation_summary_zh'] = row['evaluation_summary_zh'].replace(old, new)
                if old_eval != row['evaluation_summary_zh']:
                    print(f"修正判定: {row['item_name_zh']}")

    return data

def main():
    # 讀取檔案
    input_file = '/Users/Openclaw/.openclaw/workspace/projects/standard-dictionary/data/comparison_rows.json'
    backup_file = '/Users/Openclaw/.openclaw/workspace/projects/standard-dictionary/data/comparison_rows.json.backup'

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        print(f"讀取 {len(data)} 筆記錄")

        # 備份
        import shutil
        shutil.copy2(input_file, backup_file)
        print(f"已備份至 {backup_file}")

        # 修正翻譯
        fixed_data = fix_un38_translations(data)

        # 寫入
        with open(input_file, 'w', encoding='utf-8') as f:
            json.dump(fixed_data, f, ensure_ascii=False, indent=2)

        print("✅ 翻譯修正完成")

    except Exception as e:
        print(f"❌ 錯誤: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()