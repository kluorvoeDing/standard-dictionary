# AIS-156 標準化繁體中文整理 (FINAL DEEP-DIVE ENHANCED)

## 1. 文件資訊

| 欄位 | 內容 |
|---|---|
| standard_id | AIS-156 |
| standard_name_original | Specific Requirements for L Category Electric Power Train Vehicles |
| standard_name_zh_tw | L 類電動動力系統車輛特定要求 |
| issuing_body | Automotive Industry Standards Committee (AISC), India |
| version | Finalized Draft |
| publication_year | 2020 |
| source_language | English |
| translated_language | 繁體中文 |
| document_type | Automotive Industry Standard |
| application_scope | L 類機動車輛 (二輪、三輪車等) 之電力驅動系統與 REESS 安全要求 |
| processing_status | complete (Final Deep-Dive Enhanced) |

## 2. 處理說明

- 本文件根據 `AIS-156.pdf` 進行深度校對與結構增強。
- **針對性優化**：特別強化 L 類車輛特有的「可拆卸 REESS」(Removable REESS) 測試邏輯。
- **邏輯增強**：導入「If-Then」強制性邏輯，區分具備乘員艙與無乘員艙車輛的防護差異。
- **條文補完**：增補 Annex 9 關於車載充電器 (On-board Charger) 的專項耐壓與耐水測試。
- **精度校準**：核對洗車 (IPX5)、涉水 (10cm 深)、暴雨 (IPX3) 的技術參數與判定限值。

## 3. 術語與縮寫 (核心參數)

| 縮寫 / 符號 | 完整名稱 | 說明 |
|---|---|---|
| REESS | 可充電電能儲存系統 | 為電力推進提供能量之系統。 |
| Removable REESS | 可拆卸 REESS | 設計上可由使用者取下進行離車充電的 REESS。 |
| Voltage Class B | B 類電壓元件 | 工作電壓介於 60V~1500V DC 或 30V~1000V AC rms 之間。 |
| $R_i$ | 絕緣電阻 | 判定門檻通常為 $100\ \Omega/\text{V}$ (DC) 或 $500\ \Omega/\text{V}$ (AC)。 |
| IPXXB / IPXXD | 試驗指 / 試驗線 | 用於驗證直接接觸防護等級的標準探棒。 |

## 4. 試驗總則與適用性 (Part I & II)

### 4.1 豁免與適用性邏輯 (Mandatory Logic)

- **防護等級差異化 (Clause 5.1.1)**：
    - **IF** 車輛具備乘員艙/行李艙，**THEN** 艙內帶電部須達 IPXXD，艙外須達 IPXXB。
    - **IF** 車輛無乘員艙，**THEN** 所有人可觸及之帶電部均須達 IPXXD。
- **可拆卸 REESS 專項 (Annex 8C)**：
    - **IF** REESS 屬於「可拆卸」類型，**THEN** 必須執行「1.0m 跌落測試」。
    - **ELSE** 豁免跌落測試。
- **車載充電器專項 (Annex 9)**：
    - **IF** 車輛具備車載充電器，**THEN** 必須執行 Annex 9A (耐壓) 與 9B (耐水) 測試。
- **暴雨測試豁免 (Clause 5.5.3)**：
    - **IF** B 類電壓設備受車體結構屏蔽，確信不會暴露於水中，**THEN** 豁免暴雨實測。
- **連接器安全 (Clause 5.1.1.3)**：
    - **IF** 連接器具備鎖定機構 **OR** 具備 1s 內洩壓功能，**THEN** 允許不使用工具拆卸。

### 4.2 樣品分配與測試分類

| 測試層級 | 測試項目 | 樣品需求 (Tested-Device) | 說明 |
|---|---|---|---|
| 車輛 (Part I) | 絕緣電阻 / 功能安全 | 1 輛整車 | 含主動行駛模式驗證。 |
| 車輛 (Part I) | 水影響 (洗車/涉水/暴雨) | 1 輛整車 | 測後須在「濕潤狀態」量測絕緣電阻。 |
| REESS (Part II) | 振動 / 熱衝擊 / 機械衝擊 | 1 套 REESS | 測後需符合共通安全標準 (不漏液/不起火等)。 |
| REESS (Part II) | 跌落測試 (Drop) | 1 套 | 僅適用於可拆卸式 REESS。 |
| REESS (Part II) | 耐火 / 短路 / 過充 / 過放 | 各 1 套 | 驗證各項濫用情況下的安全性。 |

## 5. 核心要求與測試項目

### 5.1 水影響防護判定 (Clause 5.5)
- **測試後即時判定**：車輛暴露於洗車 (IPX5)、涉水 (10cm 深)、或暴雨 (IPX3) 後，且在車輛仍濕的情況下：
    - **判定**：絕緣電阻應 $\ge 100\ \Omega/\text{V}$。

### 5.2 電氣安全共通標準
- **耐電壓 (Withstand Voltage)**：於充電器輸入端施加 $2 \times (U_n + 1200)\ \text{V rms}$ 持續 1 分鐘。
    - **判定**：絕緣電阻應 $\ge 7\ \text{M}\Omega$。
- **絕緣電阻 (Standard)**：
    - DC 系統：$\ge 100\ \Omega/\text{V}$。
    - AC 系統：$\ge 500\ \Omega/\text{V}$。

### 5.3 REESS 安全性失效判定
- 測試過程中及後續觀察期 (通常為 1 小時) 內，不得出現：
    1. 電解液洩漏 (Electrolyte Leakage)。
    2. 破裂 (Rupture，僅限高壓 REESS)。
    3. 起火 (Fire) 或 爆炸 (Explosion)。
- **熱擴散 (Thermal Propagation)**：對於含可燃電解液之 REESS，若發生單芯熱失控，必須在乘員艙發生危害前 5 分鐘發出警告。
