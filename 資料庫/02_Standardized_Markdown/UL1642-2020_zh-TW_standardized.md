# 規範名稱與版本
UL 1642:2020 (Standard for Safety for Lithium Batteries) - 第六版

## 1. 適用範圍與電池分類

### 1.1 適用範圍
本標準涵蓋用作產品電源的一次（非充電）和二次（可充電）鋰電池。這些電池含有金屬鋰、鋰合金或鋰離子，可能由單一電芯或多個電芯組成。其目的是降低鋰電池在產品使用及使用者更換（針對使用者可更換電池）時的著火或爆炸風險。

### 1.2 組件 (Component) 與最終產品 (End-product) 邏輯
UL 1642 將鋰電池視為「組件」。
- **組件安全性**：標準透過各種極限濫用測試（電氣、機械、環境）來評估電芯或電池組本身的結構安全性。
- **最終產品關聯性**：電池在最終產品中的可接受性，取決於其在符合相關產品標準的完整設備中的使用情況。例如，最終產品必須提供適當的保護電路（如防止異常充電的二極體或保險絲）以及物理外殼保護。

### 1.3 電池類別定義與限制
本標準將電池分為兩大類，並根據鋰含量設定限制：
- **技術人員可更換電池 (Technician-Replaceable)**：
    - 定義：預計安裝在設備內部，且僅由受過培訓的專業技術人員進行維修與更換的電池。
    - 鋰含量限制：金屬鋰含量需在 5.0 g 或以下。
- **使用者可更換電池 (User-Replaceable)**：
    - 定義：預計由使用者自行更換的電池。
    - 鋰含量限制：總金屬鋰含量需在 4.0 g 或以下，且每個電芯的鋰含量不得超過 1.0 g。
    - **限制**：二次鋰電芯（可充電）不被視為「使用者可更換」之類別。

## 2. 測試項目與條件

### 2.1 電氣測試 (Electrical Tests)
- **短路測試 (Short-Circuit)**：外接電阻 ≤0.1Ω。分別於 20±5°C 與 55±5°C 進行。
- **異常充電測試 (Abnormal Charging)**：施加 3 倍的最大連續充電電流 (Ic)。
- **強制放電測試 (Forced-Discharge)**：適用於多電芯串聯應用。將 1 顆完全放電的電芯與 (N-1) 顆滿充電芯串聯，以最大放電電流強制放電。

### 2.2 機械測試 (Mechanical Tests)
- **擠壓測試 (Crush)**：施加 13 ±1 kN (3000 lbs) 的壓力。
- **衝擊測試 (Impact)**：9.1 kg 重物從 610 mm 高度落下砸擊於 15.8 mm 鋼棒。
- **機械衝擊 (Shock)**：加速度峰值 125~175 g。
- **振動測試 (Vibration)**：振幅 0.8 mm，10~55 Hz。

### 2.3 環境與火燒測試 (Environmental & Fire Tests)
- **加熱測試 (Heating)**：以 5°C/min 升溫至 130°C，維持 10 分鐘（特定大型電池為 30 分鐘）。
- **溫度循環 (Temp Cycling)**：70°C ↔ -40°C，共 10 次循環。
- **低壓測試 (Low Pressure)**：11.6 kPa (模擬 15,240 公尺高空) 維持 6 小時。
- **拋射體測試 (Projectile)**：使用燃燒器火焰加熱至電池爆炸或銷毀。

## 3. 安全判定標準

### 3.1 通用準則
在所有測試中，電池必須符合以下核心準則：
- **不起火 (No Fire)**
- **不爆炸 (No Explosion)**
- **無排氣或漏液 (No Venting or Leakage)**：僅針對衝擊、振動、溫度循環與低壓測試。

### 3.2 類別特徵判定差異
- **技術人員可更換類別**：若在「擠壓」或「衝擊」測試中發生起火或爆炸，或在「拋射體」測試中穿透篩網，則該電池的使用必須受到限制（僅限於受保護且不暴露於危險條件的應用）。
- **使用者可更換類別**：在執行「擠壓」與「衝擊」測試時，絕對**不得發生起火或爆炸**。

## 4. 強制性標示與警語

### 4.1 一般標示
所有電池必須具備永久性且清晰的標示：
- 製造商名稱、商標或識別標記。
- 獨特的型號 (Model Number) 或目錄編號。
- 製造日期（週期不得超過連續三個月）。

### 4.2 警語要求 (Markings)
- **一次電池 (Primary Batteries)**：
    - 必須標示 **"WARNING"** 與 **"Risk of fire and burns. Do not recharge, open, crush, heat above [額定溫度], or incinerate."** (鋰含量極小者或特定鈕扣電池可豁免於電池主體標示，但須標示於包裝)。
- **使用者可更換電池包裝**：
    - 必須標示 **"CAUTION"** 及 **"Risk of fire and burns. Do not recharge, disassemble, heat above [額定溫度], or incinerate. Keep battery out of reach of children and in original package until ready to use. Dispose of used batteries promptly."**
- **鋰一次鈕扣電池 (Coin Cells)**：
    - 包裝必須額外包含針對誤食的警告：**"WARNING – Never put batteries in mouth. Swallowing may lead to serious injury or death. If ingested, immediately seek medical attention..."**

## 5. 結構化測試數據與樣品矩陣

### 5.1 一次電池 (Primary Batteries) 樣品矩陣 (Table 6.1)
| 測試項目 | 滿充樣品 (Fully Charged) | 半放電樣品 (One half discharged) | 完放樣品 (Complete discharged) |
| :--- | :---: | :---: | :---: |
| 短路 (室溫) | 5 | 5 | - |
| 短路 (55°C) | 5 | 5 | - |
| 異常充電 | 5 | 5 | 5 |
| 強制放電 | 5 | 5 | - |
| 擠壓 (Crush) | 5 | 5 | - |
| 衝擊 (Impact) | 5 | 5 | - |
| 機械衝擊 (Shock) | 5 | 5 | 5 |
| 振動 (Vibration) | 5 | 5 | 5 |
| 加熱 (Heating) | 5 | 5 | - |
| 溫度循環 | 5 | 5 | 5 |
| 低壓 (低氣壓) | 5 | 5 | 5 |
| 拋射體 (Projectile) | 5 (10) | - | - |

### 5.2 二次電池 (Secondary Batteries) 樣品矩陣 (Table 6.2)
| 測試項目 | 滿充樣品 (Fully Charged) | 循環後樣品 (Conditioned by cycling) |
| :--- | :---: | :---: |
| 短路 (室溫) | 5 | 5 |
| 短路 (55°C) | 5 | 5 |
| 異常充電 | 5 | 5 |
| 強制放電 | 5 | 5 |
| 擠壓 (Crush) | 5 (10)* | 5 (10)* |
| 衝擊 (Impact) | 5 (10)* | 5 (10)* |
| 機械衝擊 (Shock) | 5 | 5 |
| 振動 (Vibration) | 5 | 5 |
| 加熱 (Heating) | 5 (10)** | 5 (10)** |
| 溫度循環 | 5 | 5 |
| 低壓 (低氣壓) | 5 | 5 |
| 拋射體 (Projectile) | 5 (10) | - |

註解：
\* 對於方型 (Prismatic) 電池，因需測試兩個方向，故需 10 顆樣品。
\** 鋰離子電芯需在操作區域的溫度邊界進行預處理，故加熱測試可能需 10 顆樣品。
\() 括弧內數字表示若初次測試有單一樣品不符時，需追加測試的樣品總數。