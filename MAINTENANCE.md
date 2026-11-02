# 維護規則

給所有會修改這個 repo 的 agent（Antigravity、Claude Code、排程任務）與人。`AGENTS.md` 頂部的三條鐵律（版控安全、資料正規化、UI 風格）優先於本檔；本檔補充「怎麼做才不會把網站改壞」。

每條規則後面的括號說明它是從哪次事故來的，方便判斷例外。

---

## 1. 分工

| 角色 | 做什麼 | 模型 |
|---|---|---|
| 主代理 | 理解需求、拆任務、寫規格、驗收、寫入、提交、回報 | 最強模型 |
| 研究子代理（判斷） | 讀原文決定數值、審查設計、寫前端程式 | 強模型 |
| 研究子代理（掃描） | 定位條款、統計欄位、機械式盤點 | 快速模型 |

- 讀原文、判讀頁面影像、整理大量資料一律交給子代理；主代理不包辦。
- 子代理之間**不可同時修改同一個檔案**。派工時寫明每個子代理「只能改哪些檔案」。
- 子代理的結果一定要經主代理驗收才寫入：看截圖、抽查原文、跑檢查。子代理說「通過」不算數。（第一批核對抓到子代理把「合格則更換樣品」寫成「不合格」）

## 2. 分支與提交

1. 每件工作開一條分支，不直接推 main。Vercel 會從 main 自動部署正式站。
2. 使用者看過成果（截圖、數字）並同意後才合併。
3. commit 前跑：
   ```bash
   npm run normalize          # 有改 data/ 時
   npm run sync:catalog       # 有新增、刪除測試或標準時
   npm run check:all          # validate、normalize:check、check:catalog、check:search、lint:ui
   cd frontend && npx vite build
   git status                 # 確認沒有 node_modules、dist、.env、*.log、原文檔
   ```
4. 每完成一件工作，在 `AGENTS.md` 新增一則條目（日期、事件、內容、影響、後續）。

## 3. 資料

### 3.1 出處與正確性

- **不推測。** 原文沒寫的不寫；不確定的列給使用者決定。
- 新增或修改的數值要附 `source_reference`（條款號）。核對流程見 `scripts/review/README.md`。
- 標準原文（PDF、OCR 文字、頁面影像）**不可進 repo**，工作檔放 `.review-work/`（已忽略）。
- 引用外部標準的參數，只能依使用者提供的原文填寫。沒有原文就列入「需要使用者提供的原文」清單。（UL 2580 附錄 B 只寫「依 IEC 62660-2」）

### 3.2 欄位命名

- **一個物理量只佔一列。** 依條件不同的值寫在同一個鍵：「圓柱形 800 N；方形 400 N」。不要拆成 `force_cylindrical`／`force_prismatic`。（IEC 62133-2 與 IEC 62619 的截止力因此被拆成三列）
- 命名前依序查：
  1. `data/field_schema.json` 中該 `normalized_id` 的欄位
  2. `frontend/src/utils/parameterDictionary.js` 的既有鍵與 `ALIASES`
  3. 其他標準同類測試用的鍵
  
  都沒有才新增，並在字典補中文標籤。
- **同一項測試內，兩個鍵不可對應到同一個 `canonicalKey()`**，例如 `preconditioning` 與 `pre_conditioning` 並存。驗證器會報錯。（GB43854 曾同時寫「靜置 6 小時」與「觀察 1 小時」）

### 3.3 數值寫法

- `value` 寫實際參數，不寫程序代號：寫「0.2 It A 放電 → CC-CV 充電至 0.05 It A」，不寫「程序二」。條款號放 `detail` 或 `source_reference`。
- `value` 只用中文與技術符號，不中英並列。英文原文必要時放 `detail` 末尾「原文：…」，一句以內。
- `value` 約 60 字以內，細節放 `detail`。
- 內容相同的兩份標準，寫出來的文字就要相同，比對頁才會判為「相同」。

### 3.4 測試分類

- 每項測試都要有 `normalized_id`，而且必須登記在 `data/taxonomy.json`。
- 新增代碼前，先找能不能併入既有代碼。試驗目的與方法實質相同就用同一個代碼；只有一份標準使用的代碼無法橫向比較。

### 3.5 目錄（catalog.json）

- `test_count_v2`、`item_count`、`available_objects` 由 `npm run sync:catalog` 依資料計算，不要手改。CI 會檢查。（GB40559 曾登記 0 項，實際 30 項）
- `publication_date` 只寫資料所依版次的日期（`YYYY`、`YYYY-MM` 或 `YYYY-MM-DD`）；版次沿革寫在 `edition_history`。（UL 1973 曾因日期欄寫了沿革，網站把 2022 版顯示成 2013）

### 3.6 新增標準或改版

1. 原文放 `docs/source_pdfs/`。轉文字、定位、判斷照 `scripts/review/` 流程，每個數值附出處。
2. 欄位依 3.2～3.4，測試分類先對照既有代碼。
3. 在 `catalog.json` 新增一筆（`application`、`base_standard_id`、`publication_date`），再跑 `npm run sync:catalog`。
4. 同一標準的新舊版是兩個資料檔，`base_standard_id` 相同；不要互相複製後不改內容。（JIS C 8715-2 曾直接複製 IEC 62619 的測試 id）

## 4. 前端

除了 `AGENTS.md` 的 UI 風格鐵律，另外遵守：

1. **不顯示內部資訊**：不顯示 `normalized_id`、欄位鍵名、`CELL`／`PACK_SYSTEM` 等列舉值、英文副標，也不顯示「尚未核對原文」這類維護狀態。
2. **少寫說明文字**：介面看得懂就不加說明；同一件事只說一次；不寫「建議：…」「支援…」。placeholder 在手機寬度不能被截斷。
3. **範例要有效**：搜尋範例、AI 建議問題、文件中的範例查詢，都要用腳本確認真的有結果。搜尋範例由 `scripts/check_search.mjs` 驗證，新增範例要一併加進去。（快速檢索的「過充 6V」在全庫搜不到任何東西）
4. **快捷鍵**：只用 ⌘K／Ctrl+K 與「/」開搜尋、Esc 關閉、方向鍵與 Enter 操作清單。不搶占瀏覽器常用組合，手機上不顯示快捷鍵提示。
5. **彈窗**：一律用 `.modal-backdrop`／`.modal-panel`。Esc 可關閉，開啟時焦點進入、關閉時回到原按鈕。不用 `alert()`／`confirm()`。
6. **狀態可還原**：比對中的標準、篩選放在網址上，重新整理和上一頁都要正常。
7. **每次前端改動都要截圖驗收**：桌機 1440 與手機 390、淺色與深色，至少包含改動的畫面。截圖給使用者看，不進 repo。
8. 送進 AI 的資料要控制大小：全庫模式 8 萬字以內（2026-11 約 7.1 萬字），不要把整份 JSON 原樣送出。

## 5. 腳本

- 只有**可重複使用**的工具才進 repo（`scripts/`、`scripts/review/`），並在檔頭寫用途與用法。
- 一次性的修改腳本（例如「把某幾項測試改成某些值」）放 `.review-work/` 或暫存區，用完不提交。改了什麼記在 `AGENTS.md`。
- 不可寫死本機路徑，例如 `/Users/...`。路徑一律以 repo 根目錄計算。

## 6. 定期檢查（每月一次，或使用者要求時）

- `node scripts/audit_enrichment.mjs`：還有多少樣板值、重複欄位。
- `npm run check:all`。
- Vercel 的執行錯誤：AI 小幫手 `/api/chat`。
  - Upstash 免費資料庫 14 天沒使用會被刪除。程式已改成限流失效時照常服務，但要提醒使用者重建。
- `catalog.json` 中 `is_latest: false` 的標準：列給使用者，請他提供新版原文。

## 7. 回報給使用者

- 第一句寫結果：完成了什麼、還缺什麼。
- 附數字：例如改了幾筆、「N 項不同」前後、檢查結果。
- 列出需要使用者決定或提供的東西。
- 用白話，不用自創術語。
