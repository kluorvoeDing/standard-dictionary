# UL 3030 標準化測試文件 (深層強化版)

## 1. 基本資訊 (Basic Information)

| 屬性 | 內容 |
| --- | --- |
| 標準編號 | ANSI/CAN/UL 3030:2018 (R2024) |
| 標準名稱 | 無人機系統 (UAS) 安全標準 |
| 原始文件 | s3030_1.pdf |
| 語言 | 繁體中文 (Technical Traditional Chinese) |
| 狀態 | 已標準化 (深層強化版) |
| 適用範圍 | 商業用途 UAS (重量 < 25 kg, 電壓 ≤ 100 V dc) |

## 2. 測試要求與樣品矩陣 (Testing Requirements & Sample Matrix)

### 2.1 測試樣品矩陣 (Table 24.1 摘要)
樣品類型 X 代表整機 (UAS)，Y 代表電池包 (Battery Pack)。

| 測試項目 | 章節 | 樣品數量/類型 | 判定關鍵參數 |
| --- | --- | --- | --- |
| 輸入驗證 (Input Verification)| 27 | 1 (X) | 實測電流 ≤ 110% 額定電流 |
| 溫度測試 (充電與飛行) | 28 | 1 (X) | 不得超過組件 Tmax |
| 介電耐壓測試 | 29 | 1 (X) | 驗證絕緣完整性 |
| 隔離電阻測試 | 30 | 1 (X) | 驗證電路間隔離能力 |
| 過充電 (Overcharge) | 32.6 | 1 (Y) | 不爆炸、不起火 |
| 短路 (Short Circuit) | 32.7 | 1 (Y) | 不爆炸、不起火 |
| 不平衡充電 | 32.8 | 1 (Y) | 驗證單串電壓保護 |
| 衝擊測試 (Shock) | 32.9 | 1 (X) | 結構與電氣連接不鬆脫 |
| 震動測試 (Vibration) | 33 | 1 (X/Y) | 模擬飛行環境下的穩定性 |
| 跌落測試 (Drop) | 34.2 | 1 (X) | 依據高度條件執行 1 次 |

## 3. 判定標準 (Pass/Fail Criteria)

### 3.1 核心判定準則 (Table 26.1)
*   **E (Explosion)**：所有測試中均不得發生爆炸。
*   **F (Fire)**：所有測試中均不得發生持續燃燒（明火）。
*   **R (Rupture)**：除了擠壓測試外，測試過程中外殼不得破裂導致內部危險零件外露。
*   **L (Leakage)**：電解液不得洩漏至外殼外部。
*   **S (Shock)**：對於高壓電路 (Hazardous Voltage)，不得出現絕緣崩潰或隔離失效。

## 4. 豁免與特殊情況 (Exemptions and Special Cases)

*   **室內使用豁免 (Indoor Use Exemption)**：
    *   **IF**：UAS 標示為僅限室內使用。
    *   **THEN**：豁免 IPX4 防水測試及部分浸沒測試 (Section 10.4)。
*   **PCB 小零件豁免**：
    *   安裝在防火外殼內 PCB 上的小型可燃零件，無需單獨進行燃燒測試 (Section 8.4)。
*   **HB 等級材料豁免**：
    *   防火外殼外部符合 UL 94 HB 等級的聚合物材料，無需進行火焰測試 (Section 8.5)。

## 5. 操作邏輯與流程 (Operational Logic and Workflow)

### 5.1 外殼進入與工具邏輯 (Enclosure Access Logic)
*   **IF** 欲進入外殼內部區域：**THEN** 必須使用專用工具。
*   **IF** 欲進入用戶可操作區域：**THEN** 不得使用與內部區域相同的工具，以防用戶誤入危險區域。
*   **IP 等級驗證**：使用 2.5 mm 直徑測試棒以 10 N 壓力施加，不得進入危險區域 (IP3X)。

### 5.2 安全關鍵電路邏輯 (Safety Critical Analysis)
*   **IF** 依賴主動元件 (Active devices) 進行關鍵安全保護：
    *   **THEN** 必須具備以下任一條件：
        1.  備有冗餘的被動保護元件 (Passive protection)。
        2.  備有冗餘的主動保護，且在第一層保護失效時仍能運作。
        3.  被證明在失去動力時能進入「安全失效」(Fail safe) 狀態。

### 5.3 SELV 電路判定邏輯 (SELV Accessibility)
*   **IF** 電路電壓 ≤ 60 V dc (SELV) 且僅具備功能性絕緣：
    *   **THEN** 該電路被視為「可觸及」(Accessible)，必須符合觸電防護要求。
