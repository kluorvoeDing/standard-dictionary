# 專案進度追蹤 | standard-dictionary

**最後更新：** 2026-04-17 18:00
**版本：** v0.1.0
**負責人：** Beta

---

## 📌 當前階段

**階段 2：分批次解析（正確性優先）**

- [x] 確認 Obsidian Standards 資料夾位置
- [x] 列出所有 .md 檔案（共 22 檔）
- [x] 初步品質檢查（所有檔案均有有效內容）
- [x] 建立完整分類規則清單（測試對象 + 測試項目）v0.3
- [x] 用戶確認分類規則 ✅
- [ ] Batch 1 解析：UL1642, UN38.3, IEC62619（進行中）

---

## ✅ 已完成事項

### 2026-04-17
- [x] 確認用戶需求（Q1-Q5）
- [x] 確認 Standards 資料夾結構（/Users/Openclaw/Documents/Henry & Beta/Standards/）
- [x] 建立 GitHub repo：`kluorvoeDing/standard-dictionary`
- [x] 建立 PROGRESS.md（本文件）
- [x] 初步 .md 檔案品質檢查（22 檔全部有效）
- [x] 推送初始版本到 GitHub（v0.1.0）
- [x] 建立分類規則草案 v0.1（含 impact/shock 區分、thermal abuse 新增）
- [x] 更新解析策略：加入豁免條件/特例追蹤（如 UN38.3 過充電豁免）
- [x] 新增規則：鋰系適用性註記（非鋰系統標記「鋰系不適用」）
- [x] 新增規則：正確性優先，分批次解析（每批 3-5 檔，人工覆核）

---

## 🔄 進行中事項

1. **分類規則定義**
   - 測試對象：CELL, MODULE, PACK, ESS, SYSTEM ✅
   - 測試項目：v0.3 已完成（含鋰系適用性標記）
   - 熱濫用/加熱測試：已新增 ✅

2. **解析策略定義**
   - 分批次解析（每批 3-5 檔）✅
   - 鋰系適用性檢查 ✅
   - 人工覆核流程 ✅

3. **GitHub Repo 初始化**
   - 已推送 v0.2.0 ✅
   - 待建立 data/ 目錄結構（Batch 1 解析後）

---

## 📋 待處理事項

### 高優先
- [ ] Batch 1 解析：UL1642, UN38.3, IEC62619（3 檔）
- [ ] 建立測試項目同義詞對照表（如：drop = free fall = 落下 = 落摔）
- [ ] 區分 impact vs shock（用英文定義）
- [ ] 新增 thermal abuse / heating 類別

### 中優先
- [ ] Batch 2-4 解析（剩餘 17 檔）
- [ ] 建立 standards.json 架構
- [ ] 建立 tests.json 架構
- [ ] 推送 Batch 1 結果到 GitHub

### 低優先
- [ ] 設計網頁 UI 原型
- [ ] 規劃 VDI 離線版架構

---

## 📂 檔案清單（22 檔）

### 主要標準（18 檔）
| 檔名 | 大小 | 類型 | 狀態 |
|------|------|------|------|
| AIS-038_Rev.2.doc.md | 190KB | EV 標準 | ✅ 有效 |
| AIS-156.full.md | 137KB | EV 標準 | ✅ 有效 |
| GB31241-2022-1_OCR.md | 75KB | 消費級 | ✅ 有效 |
| GB38031-2025.md | 67KB | EV 標準 | ✅ 有效 |
| GB43854-2024_OCR.md | 27KB | 電動自行車 | ✅ 有效 |
| GB44240-2024.md | 67KB | 電動自行車 | ✅ 有效 |
| GBT 36276-2023.md | 138KB | 儲能 | ✅ 有效 |
| IEC 62133-2-2017 Amd 1-2021.md | 481KB | 消費級 | ✅ 有效 |
| IEC62619-2022.md | 33KB | 工業/儲能 | ✅ 有效 |
| SAND2017-6925.md | 79KB | 研究參考 | ✅ 有效 |
| UL 1642-2020.md | 45KB | 消費級 | ✅ 有效 |
| ULC-2580-2022-en.md | 173KB | EV 標準 | ✅ 有效 |
| UN38.3 sub section.md | 34KB | 運輸 | ✅ 有效 |
| s1973_3.md | 337KB | 儲能 | ✅ 有效 |
| s2054_3.md | 68KB | 消費級/儲能 | ✅ 有效 |
| s2056_1.md | 79KB | 消費級/儲能 | ✅ 有效 |
| s2271_3_20230914.md | 145KB | 儲能 | ✅ 有效 |
| s3030_1.md | 130KB | 電動自行車 | ✅ 有效 |
| s9540A_5.md | 191KB | 儲能 | ✅ 有效 |
| s9540_3.md | 258KB | 儲能 | ✅ 有效 |

### 處理報告（2 檔）
| 檔名 | 大小 | 用途 | 狀態 |
|------|------|------|------|
| Processing_Report_20260305.md | 892B | 轉換報告 | ✅ 保留 |
| Processing_Report_20260308.md | 3KB | 轉換報告 | ✅ 保留 |

---

## 🏷️ 分類規則（草案 v0.3）

### 測試對象（5 類）
| 代號 | 名稱 | 英文關鍵字 | 中文關鍵字 |
|------|------|------------|------------|
| CELL | 電芯/單電池 | cell, single cell | 電芯，單電池 |
| MODULE | 模組/電池組 | module, battery block, cell block | 模組，電池組 |
| PACK | 電池包 | pack, battery pack | 電池包 |
| ESS | 儲能系統 | ESS, energy storage system | 儲能系統 |
| SYSTEM | 整套裝置 | system, complete device | 整套裝置，系統 |

### 測試項目（v0.2，含豁免追蹤）
| 代號 | 名稱 | 英文關鍵字 | 中文關鍵字 | 已知豁免 |
|------|------|------------|------------|------------|
| ELEC-01 | 外部短路 | external short, short circuit | 外部短路，短路 | - |
| ELEC-02 | 過度充電 | overcharge, abnormal charge | 過度充電，異常充電 | UN38.3（某些 cell 豁免） |
| ELEC-03 | 強制放電 | forced discharge | 強制放電 | - |
| MECH-01 | 撞擊 | impact | 撞擊 | - |
| MECH-02 | 衝擊 | shock | 衝擊 | - |
| MECH-03 | 擠壓 | crush | 擠壓 | - |
| MECH-04 | 穿刺 | nail penetration, internal short | 穿刺，內部短路 | - |
| MECH-05 | 振動 | vibration | 振動 | - |
| MECH-06 | 落下 | drop, free fall | 落下，落摔，自由落下 | - |
| ENV-01 | 溫度循環 | temperature cycling, thermal cycling | 溫度循環 | - |
| ENV-02 | 低氣壓 | low pressure, altitude | 低氣壓，海拔 | - |
| THERM-01 | 熱濫用/加熱 | thermal abuse, heating, heat | 熱濫用，加熱，高溫 | - |

**註：** impact 與 shock 為不同測試，需分開。

**註：** impact 與 shock 為不同測試，需分開。

---

## 📝 更新記錄

| 日期 | 版本 | 更新內容 |
|------|------|----------|
| 2026-04-17 17:00 | v0.1.0 | 初始建立，記錄檔案清單與分類規則草案 |
| 2026-04-17 17:45 | v0.2.0 | 加入豁免條件/特例追蹤，更新解析策略 |
| 2026-04-17 18:00 | v0.3.0 | 新增鋰系適用性註記，改為分批次解析（正確性優先） |
| 2026-04-17 17:45 | v0.2.0 | 加入豁免條件/特例追蹤，更新解析策略 |
| 2026-04-17 18:00 | v0.3.0 | 新增鋰系適用性註記，改為分批次解析（正確性優先） |

---

## 🔗 相關連結

- GitHub Repo: https://github.com/kluorvoeDing/standard-dictionary
- Obsidian Vault: `/Users/Openclaw/Documents/Henry & Beta/Standards/`
