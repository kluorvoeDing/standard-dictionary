# AIS-038 Rev.2 標準化繁體中文整理 (FINAL DEEP-DIVE ENHANCED)

## 1. 文件資訊

| 欄位 | 內容 |
|---|---|
| standard_id | AIS-038 Rev.2 |
| standard_name_original | Specific Requirements for Electric Power Train of Vehicles |
| standard_name_zh_tw | 車輛電力驅動系統特定要求 |
| issuing_body | Automotive Industry Standards Committee (AISC), India |
| version | Revision 2 (Finalized Draft) |
| publication_year | 2020 |
| source_language | English |
| translated_language | 繁體中文 |
| document_type | Automotive Industry Standard |
| application_scope | M 與 N 類機動車輛之電力驅動系統安全要求 (Part I) 及 REESS 安全要求 (Part II) |
| processing_status | complete (Final Deep-Dive Enhanced) |

## 2. 處理說明

- 本文件根據 `AIS-038_Rev.2.doc.pdf` 進行深度整理，強化技術邏輯與豁免條款。
- **架構優化**：採用標準 5 部分結構，明確區分車輛層級 (Part I) 與 REESS 層級 (Part II) 的要求。
- **邏輯增強**：導入「If-Then」強制性邏輯，描述電氣隔離、水防護及熱擴散的判定路徑。
- **豁免條款**：詳細羅列關於連接器工具使用、屋頂充電裝置距離、及離地高度相關的測試豁免。
- **樣品分配**：雖原文未提供統一矩陣，已根據各測試章節之「Tested-Device」描述整理樣品需求。

## 3. 術語與縮寫 (核心參數)

| 縮寫 / 符號 | 完整名稱 | 說明 |
|---|---|---|
| REESS | 可充電電能儲存系統 | Rechargeable Electrical Energy Storage System，提供推進能量。 |
| $U_{working}$ | 工作電壓 | 製造商指定之電路最高電壓有效值 (rms)。 |
| $R_i$ | 絕緣電阻 | 高壓匯流排與電氣底盤間的隔離電阻。 |
| SOC | 荷電狀態 | State of Charge，以額定容量百分比表示。 |
| IPXXB | 試驗指防護 | 防止手指接觸危險部位的防護等級。 |
| IPXXD | 試驗線防護 | 防止線材接觸危險部位的防護等級。 |
| 標準循環 | Standard Cycle | 標準放電後接著進行標準充電的過程。 |

## 4. 試驗總則與適用性 (Part I & II)

### 4.1 豁免條款與條件觸發 (Mandatory Logic)

- **連接器拆卸豁免 (Clause 5.1.1)**：
    - **IF** 連接器具備鎖定機構（需兩次獨立動作）**OR** 斷開後 1s 內電壓降至 $\le$ 60V DC / 30V AC **OR** 斷開後仍滿足 IPXXB，**THEN** 允許在不使用工具情況下拆卸。
- **屋頂充電裝置豁免 (Clause 5.1.1)**：
    - **IF** 充電裝置位於車頂且人員無法觸及，且車內踏板至裝置之包絡距離 (Wrap-around distance) $\ge$ 3.00m，**THEN** 豁免直接接觸防護要求。
- **REESS 核准路徑 (Clause 5.2.1)**：
    - **IF** REESS 已依 Part II 獲得型式核准，**THEN** 車輛核准時僅需驗證其安裝合規性。
    - **ELSE** 必須隨整車執行第 6 章之所有安全性測試。
- **耐火測試豁免 (Clause 6.5)**：
    - **IF** REESS 安裝位置之最低表面離地高度 > 1.5m，**THEN** 豁免耐火 (Fire Resistance) 測試。
- **氣體排放豁免 (Clause 6.12.3)**：
    - **IF** 非開放式電池通過了振動、熱衝擊、短路、過充、過放、過溫與過流測試，**THEN** 視為滿足氣體管理安全要求。

### 4.2 樣品矩陣與測試分類

| 測試層級 | 測試項目 | 樣品需求 (Tested-Device) | 說明 |
|---|---|---|---|
| 車輛 (Part I) | 絕緣電阻 / 水防護 / 氫氣排放 | 1 輛整車 | 可依 Annexure VII-A 提供文件替代實測。 |
| REESS (Part II) | 振動 / 熱衝擊 / 機械衝擊 | 1 套完整 REESS 或子系統 | 測試後需進行標準循環與絕緣測試。 |
| REESS (Part II) | 機械完整性 (壓潰) | 1 套 (僅限 M1/N1 類) | 施加 100kN ~ 105kN 壓力。 |
| REESS (Part II) | 耐火測試 (Fire) | 1 套 (含可燃電解液者) | 汽油池火或 LPG 噴嘴測試。 |
| REESS (Part II) | 電氣保護 (短路/過充/過放/過溫) | 各 1 套 | 驗證保護電路 (BMS) 動作。 |
| REESS (Part II) | 熱擴散 (Thermal Propagation) | 1 套 | 驗證單芯熱失控後 5 分鐘內乘客安全。 |

## 5. 核心要求與測試項目

### 5.1 電氣安全判定基準 (Clause 5.1.3)
- **絕緣要求 (Isolation Resistance)**：
    - DC 匯流排：$\ge 100\ \Omega/\text{V}$
    - AC 匯流排：$\ge 500\ \Omega/\text{V}$
    - **IF** AC 匯流排具備兩層獨立絕緣或機械強固保護，**THEN** 可降至 $100\ \Omega/\text{V}$。

### 5.2 REESS 安全性能要求 (Chapter 6)
- **通用判定標準**：測試期間與測試後觀察期內，不得出現：
    - 電解液洩漏 (Electrolyte Leakage)。
    - 破裂 (Rupture，僅限高壓 REESS)。
    - 排氣 (Venting，開放式電池除外)。
    - 起火 (Fire) 或 爆炸 (Explosion)。
- **熱擴散要求 (Clause 6.15)**：
    - **IF** 發生單芯熱失控，**THEN** REESS 必須在危害狀況進入乘員艙前 5 分鐘發出警示。
    - **判定**：警示後 5 分鐘內，Pack 層級不得有外部火焰/爆炸；整車層級不得有煙霧進入乘員艙。

### 5.3 水影響防護 (Clause 5.1.4)
- **路徑選擇 (Mandatory Logic)**：
    - **Choice A**: 提供電氣設計文件與組件位置證明 (Annexure VII-A)。
    - **Choice B**: 執行整車涉水 (Wading) 與洗車 (Washing) 測試 (Annexure VII-B)。
    - **Choice C**: 安裝絕緣監測報警系統並驗證其功能 (Annexure VI)。
