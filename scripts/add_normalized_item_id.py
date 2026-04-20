#!/usr/bin/env python3
"""
為 comparison_rows.json 添加 normalized_item_id 欄位
根據 2026-04-19 凌晨定義的 26 個核心測試項目群組
"""

import json
import re

# 26 個核心群組 ID 對照表（根據截圖）
GROUP_MAPPING = {
    # 電氣 (ELEC)
    "外部短路測試": "ELEC-01",
    "外部短路保护测试": "ELEC-01",
    "外部短路测试": "ELEC-01",
    "外部短路保護測試": "ELEC-01",
    "外部短路建議": "ELEC-01",
    "高溫外部短路測試": "ELEC-01",
    "短路測試": "ELEC-01",
    "短路性能试验": "ELEC-01",
    "輸出端口短路測試": "ELEC-01",
    "過充電測試": "ELEC-02",
    "过充电测试": "ELEC-02",
    "過充電保護測試": "ELEC-02-PROT",
    "過充電建議": "ELEC-02",
    "過度充電測試": "ELEC-02",
    "过充电性能试验": "ELEC-02",
    "電池濫用過充電測試": "ELEC-02",
    "濫用過充電測試": "ELEC-02",
    "異常充電測試": "ELEC-02",
    "電池異常充電測試": "ELEC-02",
    "過充電壓控制測試": "ELEC-02-PROT",
    "過充電流控制測試": "ELEC-02-PROT",
    "過壓充電控制測試": "ELEC-02-PROT",
    "强制放電測試": "ELEC-03",
    "強制放電測試": "ELEC-03",
    "電池強制放電測試": "ELEC-03",
    "过放电性能试验": "ELEC-03",
    "过放电测试": "ELEC-03",
    "內部短路測試": "ELEC-04",
    "強制內部短路測試": "ELEC-04",
    "過電流保護測試": "ELEC-05",
    "過流保護測試": "ELEC-05",
    "過流充電控制測試": "ELEC-05",
    "過放電測試": "ELEC-03",
    "過放電保護測試": "ELEC-03-PROT",
    "過放電建議": "ELEC-03",
    "放電過載測試": "ELEC-03",
    "过流放电测试": "ELEC-03",
    "欠壓放電控制測試": "ELEC-03",
    
    # 機械 (MECH)
    "衝擊測試": "MECH-01",
    "冲击测试": "MECH-01",
    "加速度衝擊測試": "MECH-01",
    "加速度冲击测试": "MECH-01",
    "機械衝擊測試": "MECH-01",
    "撞擊測試": "MECH-01",
    "撞擊/擠壓測試": "MECH-01",
    "模擬碰撞測試": "MECH-01",
    "底部撞擊測試": "MECH-01",
    "重物衝擊測試": "MECH-01",
    "擠壓測試": "MECH-02",
    "挤压测试": "MECH-02",
    "擠壓性能试验": "MECH-02",
    "穿刺測試": "MECH-03",
    "淺刺（模擬內部短路）測試": "MECH-03",
    "穿刺建議": "MECH-03",
    "振動測試": "MECH-04",
    "振动测试": "MECH-04",
    "振動性能试验": "MECH-04",
    "振動耐久性測試": "MECH-04",
    "跌落測試": "MECH-05",
    "自由跌落測試": "MECH-05",
    "自由跌落测试": "MECH-05",
    "落下測試": "MECH-05",
    "跌落性能试验": "MECH-05",
    "跌落衝擊測試": "MECH-05",
    "可拆卸 REESS 跌落測試": "MECH-05",
    "鹽霧測試": "ENV-04",
    "盐雾测试": "ENV-04",
    "盐雾性能试验": "ENV-04",
    
    # 環境 (ENV)
    "溫度循環測試": "ENV-01",
    "温度循环测试": "ENV-01",
    "熱循環測試": "ENV-01",
    "低氣壓測試": "ENV-02",
    "低气压测试": "ENV-02",
    "高度模擬測試": "ENV-02",
    "水暴露測試": "ENV-03",
    "浸水測試": "ENV-03",
    "浸水测试": "ENV-03",
    "耐水測試": "ENV-03",
    "水暴露測試 - IPX4": "ENV-03",
    "水暴露測試 - 臨時浸水": "ENV-03",
    "洗滌測試": "ENV-03",
    "濕熱循環測試": "ENV-01",
    "湿热循环测试": "ENV-01",
    "交变湿热性能试验": "ENV-01",
    "溫度衝擊測試": "ENV-01",
    "溫度測試": "ENV-01",
    "高海拔測試": "ENV-02",
    "高海拔绝缘性能试验": "ENV-02",
    "高海拔耐压性能试验": "ENV-02",
    "高海拔初始充放电性能试验": "ENV-02",
    "高温适应性试验": "ENV-01",
    "低温适应性试验": "ENV-01",
    
    # 熱管理 (THERM)
    "熱濫用測試": "THERM-01",
    "热滥用测试": "THERM-01",
    "過溫保護測試": "THERM-02",
    "过温保护测试": "THERM-02",
    "過溫度保護測試": "THERM-02",
    "温度保护测试": "THERM-02",
    "過熱控制測試": "THERM-02",
    "熱擴散測試": "THERM-03",
    "热扩散测试": "THERM-03",
    "熱穩定性測試": "THERM-04",
    "加熱測試": "THERM-04",
    "電池熱失控測試": "THERM-04",
    "熱失控傳播測試": "THERM-04",
    "熱衝擊和循環測試": "THERM-04",
    "熱衝擊與循環測試": "THERM-04",
    "熱循環測試": "THERM-04",
    "電池組系統熱擴散測試": "THERM-03",
    "模組級熱傳播測試": "THERM-03",
    "單元級火災傳播測試": "THERM-03",
    
    # 火災 (FIRE)
    "火災暴露測試": "FIRE-01",
    "外部火災暴露測試": "FIRE-01",
    "大型火災測試": "FIRE-01",
    "防火測試": "FIRE-01",
    "耐火測試": "FIRE-01",
    "模擬燃油火災建議": "FIRE-01",
    "燃油火災建議": "FIRE-01",
    "拋射物測試": "FIRE-02",
    "彈射測試": "FIRE-02",
    "可燃性測試": "FIRE-03",
    "燃燒噴射測試": "FIRE-03",
    "阻燃性测试": "FIRE-03",
    "阻燃要求": "FIRE-03",
    "光伏電池可燃性測試": "FIRE-03",
    "電池排氣可燃性建議": "FIRE-03",
}

def normalize_name(name):
    """去除括號內容並清理空白"""
    if not name:
        return ""
    # 去除括號（測試對象）
    name = re.sub(r'\s*\([^)]*\)', '', name)
    # 去除首尾空白
    name = name.strip()
    return name

def main():
    import os
    # 切換到腳本所在目錄
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # 讀取數據
    with open('../data/comparison_rows.json', 'r', encoding='utf-8') as f:
        rows = json.load(f)
    
    # 統計
    matched = 0
    unmatched = 0
    unmatched_names = set()
    
    # 處理每筆記錄
    for row in rows:
        item_name_zh = row.get('item_name_zh', '')
        normalized_name = normalize_name(item_name_zh)
        
        # 查找對應的群組 ID
        normalized_item_id = GROUP_MAPPING.get(normalized_name)
        
        if normalized_item_id:
            row['normalized_item_id'] = normalized_item_id
            matched += 1
        else:
            # 未匹配的記錄，保持 normalized_item_id 為空或不添加
            unmatched += 1
            unmatched_names.add(normalized_name)
    
    # 寫回數據
    with open('../data/comparison_rows.json', 'w', encoding='utf-8') as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)
    
    # 輸出報告
    print(f"✅ 處理完成")
    print(f"   總記錄數：{len(rows)}")
    print(f"   已匹配：{matched} ({matched/len(rows)*100:.1f}%)")
    print(f"   未匹配：{unmatched} ({unmatched/len(rows)*100:.1f}%)")
    print()
    print(f"📋 未匹配的測試名稱（共 {len(unmatched_names)} 種）：")
    for name in sorted(unmatched_names):
        print(f"   • {name}")

if __name__ == '__main__':
    main()
