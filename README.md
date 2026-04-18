# Standard Dictionary | 國際標準對比資料庫

**版本：** v0.1.0
**建立日期：** 2026-04-17
**負責人：** Beta (OpenClaw Agent)

---

## 📖 專案說明

本專案旨在建立一個**互動式國際標準對比工具**，用於快速查詢和對比不同電池安全標準之間的測試要求差異。

### 核心功能

1. **多標準對比**：勾選多份標準（如 UN38.3, UL1642, IEC62619），並排顯示
2. **智能分類**：
   - 測試對象：CELL / MODULE / PACK / ESS / SYSTEM
   - 測試項目：自動歸類同義詞（如 drop = free fall = 落下 = 落摔）
3. **動態篩選**：依標準、測試對象、測試項目快速篩選
4. **可編輯內容**：用戶可編輯測試條件，並展開查看原文
5. **Guidance 相容**：研究報告/建議性文件可用 `comparison_items[]` 加入跨標準比對，但會保留 `guidance` 標記，避免誤判為正式法規要求

---

## 🏗️ 技術架構

### 第一版（MVP）
- **前端**：靜態 HTML + Vue 3 + Tailwind CSS
- **部署**：GitHub Pages
- **數據源**：預先處理的 JSON 檔案（來自 Obsidian Standards）
- **編輯**：localStorage 暫存

### 第二版（擴充）
- **編輯儲存**：GitHub API 寫回
- **VDI 內部版**：離線部署，無 API 依賴

---

## 📂 目錄結構

```
standard-dictionary/
├── README.md           # 本文件
├── PROGRESS.md         # 專案進度
├── index.html          # 網頁主體
├── data/
│   ├── batch*/content/*.json   # 各標準/Guidance 原始結構化資料
│   ├── catalog.json            # 給前端 checkbox / 文件清單使用
│   └── comparison_rows.json    # 給前端直接載入的平坦比對列
├── docs/
│   ├── guidance-comparison-schema.md  # Guidance / research 文件相容方案
│   └── web-comparison-loader-spec.md  # 前端混合讀取規格
├── scripts/
│   └── build_web_catalog.py    # 自動產生 catalog + comparison rows
└── assets/
    ├── style.css
    └── app.js
```

---

## 🚀 開發時程

| 階段 | 內容 | 預計時間 |
|------|------|----------|
| **Phase 1** | 檔案品管 + 分類規則定義 | 2026-04-17 |
| **Phase 2** | 解析 .md 檔案，產生 JSON | 2026-04-18 ~ 04-19 |
| **Phase 3** | 前端開發（MVP） | 2026-04-20 ~ 04-22 |
| **Phase 4** | GitHub Pages 部署 | 2026-04-23 |
| **Phase 5** | VDI 內部版克隆 | 待定 |

---

## 📋 分類規則（摘要）

### 測試對象（5 類）
- **CELL**：電芯/單電池
- **MODULE**：模組/電池組
- **PACK**：電池包
- **ESS**：儲能系統
- **SYSTEM**：整套裝置

### 測試項目（12+ 類）
- **ELEC-**：電氣測試（短路、過充、強制放電）
- **MECH-**：機械測試（撞擊、衝擊、擠壓、穿刺、振動、落下）
- **ENV-**：環境測試（溫度循環、低氣壓）
- **THERM-**：熱測試（熱濫用、加熱）

完整規則參見 `PROGRESS.md`。

---

## 🧩 Web 資料輸出（目前可直接接前端）

- `data/catalog.json`
  - 文件層級索引
  - 適合用來產生勾選清單、badge、文件摘要
- `data/comparison_rows.json`
  - 已正規化的 comparison rows
  - 標準 / test method / guidance 可混合載入
- `scripts/build_web_catalog.py`
  - 每次新增或修改 `batch*/content/*.json` 後重新執行
  - 指令：`python3 scripts/build_web_catalog.py`

---

## 🔗 相關連結

- Obsidian Vault：`/Users/Openclaw/Documents/Henry & Beta/Standards/`
- GitHub Repo：https://github.com/kluorvoeDing/standard-dictionary

---

**最後更新：** 2026-04-17 17:00
