# 電池安全標準橫向比對

把各國電池安全標準的測試條件拆成結構化資料，放在同一張表上逐項對照。

**網站：** <https://standard-dictionary.vercel.app>

收錄 **30 份標準、512 項測試**，涵蓋 GB、UL、IEC、UN、JIS、AIS、SAND 等體系，從手機電池到儲能系統。

---

## 能做什麼

| 功能 | 說明 |
|---|---|
| **橫向比對** | 選 2～5 份標準，同一參數排在同一列，例如短路電阻、擠壓力、跌落高度。數值不同的列會標出來。 |
| **只看差異** | 隱藏相同的列和完全相同的測試，只留真正不同的地方。 |
| **試驗程序** | 每項測試的樣品數量、前置處理、觀察期，全部附原文條款出處。 |
| **快速檢索** | 按 `/` 或 `⌘K`／`Ctrl+K`。數值依「數字＋單位」比對，輸入「6V」找得到「6.0 V」，輸入「1m」不會找到「1 mm」。 |
| **總覽矩陣** | 全部測試項目一覽，可匯出 CSV 或列印。 |
| **AI 小幫手** | 針對選取的標準提問；沒選標準時以全庫資料回答。 |
| **分享比對** | 比對狀態寫在網址上，複製網址就能分享同一個比對畫面。 |

---

## 收錄標準

| 應用領域 | 標準（版次年份） |
|---|---|
| 運輸安全 | UN 38.3（2015） |
| 便攜式電子 | GB 31241（2022）、GB 31241.4（2026）、GB 47372（2026）、IEC 62133-2（2021） |
| 輕型電動車 | GB 40559（2024）、GB 47741（2026）、UL 2271（2023）、AIS-156（2020） |
| 電動汽車 | GB 38031（2025）、UL 2580（2020）、IEC 62660-3（2022）、AIS-038（2020） |
| 無人機 | UL 3030（2018） |
| 儲能系統 | GB 44240（2024）、GB/T 36276（2023）、UL 1973（2022）、UL 9540A（2025）、JIS C 8715-2（2019）、SAND2017-6925（2017） |
| 工業應用 | GB 40165（2021）、IEC 62619（2022） |
| 一般應用 | GB 43854（2024）、UL 1642（2020、2022 兩版）、UL 2054（2021）、UL 2056（2024）、UL 2743（2025）、UL 9540（2023）、JIS C 8714（2007） |

標準清單與版次以 [`data/catalog.json`](./data/catalog.json) 為準。網站會標示有新版的標準，目前 UN 38.3 已有第 8 版（2023），資料仍是第 6 版。

---

## 資料品質

測試條件由 AI 子代理對照原文萃取，再由主代理看原文與頁面影像驗收。目前狀態（2026-11）：

| 項目 | 狀態 |
|---|---|
| 樣品數量、前置處理、觀察期 | 30 份全部逐項對照原文，附條款出處 |
| 其他技術參數的出處 | 37% 已附條款出處，其餘分批核對中 |
| 同義內容寫法統一 | 尚有 489 列候選待處理，CI 會擋下新增 |
| 需要原文才能補的 | IEC 62660-2（UL 2580 附錄 B 的 4 項電芯試驗）、UN 38.3 第 8 版 |

每個數值的出處可以在比對表上點開查看。尚未附出處的數值，使用前請對照原文。

---

## 本地開發

需要 Node.js 20 以上。

```bash
npm install                 # 根目錄：資料檢查工具與 API 相依套件
cd frontend && npm install
npm run dev                 # http://localhost:5173
```

Windows 上若 `frontend/public/data` 沒有被建立成符號連結，請先開啟 `git config core.symlinks true` 再重新 checkout。

`npm run dev` 只啟動前端，AI 小幫手的 API（`api/chat.js`）不會運作。要連同 API 一起測試：

```bash
cp .env.example .env        # 填入金鑰，此檔不會進版控
npx vercel dev
```

### 環境變數

| 變數 | 用途 | 必要 |
|---|---|---|
| `GEMINI_API_KEY_1` | AI 小幫手主金鑰 | 是 |
| `GEMINI_API_KEY_2` | 備援金鑰（主金鑰額度用完時切換） | 否 |
| `GEMINI_MODEL_PRIMARY`、`GEMINI_MODEL_BACKUP` | 模型名稱，未設定時用程式內預設值 | 否 |
| `UPSTASH_REDIS_REST_URL`、`UPSTASH_REDIS_REST_TOKEN` | 限制每人每分鐘提問次數；未設定或連不上時照常回答、不限流 | 否 |

正式環境的值設定在 Vercel → Project → Settings → Environment Variables。

> **這個 repo 是公開的。** 不要 commit `.env` 或任何金鑰，金鑰也不要加 `VITE_` 前綴，否則會被打包進前端。曾發生金鑰外洩後被 Google 自動停用的事故，處理方式見 [`AGENTS.md`](./AGENTS.md) 頂部。
>
> Upstash 免費資料庫連續 14 天沒有使用會被刪除；被刪除後網站仍可使用，只是不再限流，到 Upstash 重建並更新上面兩個變數即可。

### 部署

推送到 `main` 後，Vercel 會自動建置與部署（設定見 [`vercel.json`](./vercel.json)）。其他分支會產生預覽網址。

---

## 專案結構

```text
standard-dictionary/
├── data/
│   ├── catalog.json            標準清單：版次、應用領域、測試數
│   ├── taxonomy.json           測試分類代碼（normalized_id）
│   ├── field_schema.json       各類測試的標準欄位與寫法規範
│   └── <標準>.json             各標準的測試條件、判定要求、出處
├── frontend/
│   ├── public/data             指向 ../../data 的符號連結（前端由此讀取資料）
│   └── src/
│       ├── components/         首頁矩陣、比對表、檢索、總覽矩陣、AI 小幫手
│       └── utils/              比對邏輯、參數中文名稱與同義欄位、檢索
├── api/chat.js                 AI 小幫手後端（Vercel Edge Function）
├── scripts/
│   ├── validate_data.mjs       資料結構驗證
│   ├── normalize_data.mjs      單位與用語正規化
│   ├── sync_catalog.mjs        目錄與資料同步
│   ├── check_search.mjs        檢索範例驗證
│   ├── check_ui_style.mjs      介面風格檢查
│   └── review/                 對照原文核對的工具與子代理規格
├── docs/source_pdfs/           核對用原文
├── AGENTS.md                   重要事件與決策紀錄
└── MAINTENANCE.md              維護規則
```

---

## 維護

修改前先讀 [`MAINTENANCE.md`](./MAINTENANCE.md)，裡面有分工方式、資料欄位與分類規則、前端規則。改完後執行：

```bash
npm run normalize     # 有改 data/ 時
npm run sync:catalog  # 有新增或刪除測試時
npm run check:all     # 驗證、正規化、目錄、檢索範例、介面風格、寫法一致性
```

GitHub Actions 會在每次推送時檢查：

| 檢查 | 內容 |
|---|---|
| Data Integrity Check | 資料結構、正規化、目錄同步、檢索範例、同義寫法列數 |
| UI Check | 不得有 emoji、寫死的顏色、中英並列標題、小於 12px 的字級；前端可建置 |

對照原文核對資料的流程見 [`scripts/review/README.md`](./scripts/review/README.md)。重要變更記錄在 [`AGENTS.md`](./AGENTS.md)。
