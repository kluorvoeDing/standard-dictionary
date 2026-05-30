# Standard Dictionary | 國際標準對比資料庫

**版本：** v2.0.0
**更新日期：** 2026-05-30

---

## 📖 專案說明

本專案旨在建立一個**互動式國際標準對比工具**，用於快速查詢和對比不同電池安全標準之間的測試要求差異。本系統已經升級至 **Schema v2.0**，全面優化了資料結構的精確度與前端操作體驗。

### 核心功能

1. **多標準對比**：支援同時勾選多份標準（如 UN38.3, UL1642, GB31241），並在精美的橫向網格中並排對比。
2. **標準應用領域導覽矩陣**：首頁提供直覺的「購物車」式選單，依照應用領域（如電動汽車、儲能系統、便攜式電子）與樣品層級進行交互選取，並支援點擊即時預覽標準資訊。
3. **智能分類 (Taxonomy)**：
   - 涵蓋 4 大層級：CELL / MODULE / PACK / SYSTEM
   - 統整 3 大測試領域：ELEC (電氣)、MECH (機械)、THERM (熱測試)
4. **版本控制與警示**：前端能動態標示標準版本新舊，並警示過期版本，確保合規性參考的正確性。
5. **AI 小幫手 (AI Consultant)**：內建 Context-Aware 聊天視窗，透過 Vercel Edge Function 串接 Gemini 3.1 Flash API，支援基於當前選取之標準進行即時法規問答與交叉比對。

---

## 🏗️ 技術架構

### 前端 (Frontend)
- **核心框架**：React 18 + Vite
- **UI 樣式**：純 CSS (採用 CSS Variables 主題切換，支援 Dark Mode)
- **部署環境**：Vercel (自動整合 GitHub CI/CD)

### 後端代理 (Serverless API)
- **環境**：Vercel Edge Functions (`api/chat.js`)
- **功能**：隱藏金鑰並作為 Gemini API 的代理伺服器，具備防護力場與 Fallback 機制。

### 資料庫 (Data)
- **儲存格式**：純靜態 JSON (Schema v2.0)
- **資料產生**：透過 Agent 流程與 Cron 排程 (Dawn Audit) 將原始 PDF 結構化萃取與持續自我修正。
- **架構優勢**：前端直接透過 `fetch` 載入所需標準資料，極致輕量化。

---

## 📂 目錄結構

```text
standard-dictionary/
├── README.md                 # 本文件
├── AGENTS.md                 # 專案重大事件、決策與里程碑紀錄
├── data/                     # Schema v2.0 資料庫
│   ├── taxonomy.json         # 測試項目分類體系定義
│   ├── catalog.json          # 全域標準清單 (供前端選單使用)
│   └── [Standard].json       # 各標準的獨立測試細節
├── docs/                     # 文件歸檔與原始資料
│   ├── management/           # 專案管理與 SOP (包含 PROGRESS.md)
│   ├── audit/                # 除錯與稽核日誌
│   └── source_pdfs/          # 原始 PDF 檔案
├── scripts/                  # 自動化與維護腳本
│   ├── audit/                # 稽核專用腳本
│   ├── data_tools/           # JSON 轉換與維護工具
│   └── system/               # 系統執行檔
├── api/                      # Vercel Serverless Functions
│   └── chat.js               # AI 小幫手後端代理
└── frontend/                 # React 原始碼
    ├── src/
    │   ├── components/       # UI 元件 (Sidebar, Matrix, Grid, AiConsultantChat)
    │   ├── App.jsx           # 主程式進入點
    │   └── index.css         # 全域樣式與主題變數
    └── vercel.json           # Vercel 部署設定
```

---

## 🚀 開發時程里程碑

- **v1.0 (2026-04)**：完成基礎 OCR 轉換與 Vue 3 靜態 MVP。
- **v2.0 (2026-05)**：
  - 捨棄舊版批次處理，導入 Agent 自動化處理 SOP。
  - 完成 21 份標準的 v2.0 Schema 重構。
  - 前端升級至 React + Vite 架構。
  - 實作「應用領域導覽矩陣」與「橫向比較視圖」。
  - 改善標準測試缺失時的 UI 提示，加入直覺的依賴前提標準標籤。
  - 完成 Vercel 線上部署。

---

## 🛠️ 本地開發與部署

### 本地執行 (Local Development)

```bash
cd frontend
npm install
npm run dev
```

### 部署至 Vercel (Deployment)

專案已設定 `vercel.json`。若有 Vercel CLI：
```bash
npx vercel --prod
```
或直接推送到 GitHub `main` 分支，由 Vercel 自動觸發建置。
