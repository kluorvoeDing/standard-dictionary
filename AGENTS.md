# AGENTS

> ## ⛔ 鐵律：版控安全（所有維護 / 定時 agent 務必先讀，再動手）
>
> **這個 GitHub repo 是 _公開（public）_ 的。** 任何 commit 進來的內容，全世界（含 Google、GitHub、各種掃描機器人）都看得到。曾發生 Gemini API key 與 Vercel OIDC token 外洩、key 被 Google 自動停用「不到一天就失效」的事故，已於 2026-06-06 清除歷史。請嚴守以下規則：
>
> 1. **絕對不要 commit 任何機密。** 包含但不限於：`.env`、`.env.*`（如 `.env.production.local`）、API 金鑰、`*.pem`、`*.key`、token、密碼。
>    - 金鑰一律設定在 **Vercel 環境變數**（Project → Settings → Environment Variables）或本地 `.env`（已被 `.gitignore` 忽略）。
>    - 前端會用到的金鑰也**不可**加 `VITE_` 前綴 —— 那會被打包進瀏覽器端 JS 而外洩。金鑰只能在伺服器端（`api/`）透過 `process.env` 讀取。
> 2. **絕對不要 commit 依賴或垃圾檔。** 包含 `node_modules/`（任何層級）、`dist/`、`build/`、`.DS_Store`、`*.log`。這些都已在 `.gitignore` 中。
> 3. **commit 前一定要檢查 `git status`**，確認沒有把上述檔案加進去。新增環境變數時，只更新 `.env.example`（放變數名稱、不放值）。
> 4. **若不小心提交了機密：** 立刻（a）到對應平台作廢該金鑰／token，（b）用 `git filter-repo` 從歷史中清除，（c）force-push。光是刪檔再 commit **沒有用**，舊 commit 仍讀得到。
>
> 完整的環境設定說明見 [`README.md`](./README.md)。

---

用來記錄這個專案的重要事件、決策與里程碑。

## 使用方式

- 以日期為主，持續新增新條目
- 每則紀錄盡量包含背景、變更內容、影響範圍與後續行動
- 若是臨時討論或未定案事項，可標註為 `待確認`

## 紀錄格式

```md
## YYYY-MM-DD
- 事件：
- 背景：
- 內容：
- 影響：
- 後續：
```

## 紀錄

> **[提示]** 關於 21 份標準的詳細交叉稽核與修復歷史 (破曉大隊)，已歸檔至 [`AUDIT_LOGS.md`](./AUDIT_LOGS.md) 備查。

> ## 📐 資料維護鐵律：產生資料後一定要正規化
>
> 不同 batch / agent 產出的標準 JSON 容易在格式上分歧（h vs 小時、℃ vs °C、`acceptance_criteria.details` 混入物件、孤兒判定鍵…）。**Dawn Audit / 任何會改 `data/*.json` 的維護流程，在寫入資料後務必執行：**
>
> ```bash
> npm run normalize       # = node scripts/normalize_data.mjs --write（冪等、只動格式、絕不改數值）
> npm run validate        # 結構完整性驗證
> ```
>
> CI（`data-integrity.yml`）會以 `normalize:check` 把關：只要有檔案未正規化就會 fail。正規化器預設會**略過 git-dirty 檔**以免干擾進行中的工作；要全部處理加 `--all`。標準形：時間用繁中（小時／分鐘／秒）、溫度用 `°C`。

## 2026-06-25 (Data Normalization)
- 事件：建立確定性資料格式正規化器，全面收斂橫向比對內容的格式不一致
- 背景：不同 batch / AI agent 處理的標準，在「單位、記法、結構」上各寫各的——時間混用 `h`/`小時`/`min`/`分鐘`、溫度混用 `°C`/`℃`/`度`、`acceptance_criteria.details` 陣列混入 `{id,rule_zh,rule_en}` 物件、還有 UI 從不渲染的孤兒判定鍵（`no_venting` 等），導致同一測試在不同標準間看起來格式雜亂。
- 變更：
  - 新增 `scripts/normalize_data.mjs`：以「數字緊鄰」為錨的單位正規化（標準形＝繁中時間單位＋`°C`），攤平 details 物件、把孤兒判定鍵折進 `details`。**冪等、語意安全（經 5219 條字串驗證：0 數值變動、0 動到 mAh/Wh/mm·s⁻¹/ms 等受保護單位）**。
  - 對 24 個 clean 檔套用（238 筆測試項目）；4 個 cron 進行中的 git-dirty 檔暫時略過。
  - `package.json` 加 `normalize` / `normalize:check` / `validate` scripts；CI 加 `normalize:check` 把關。
- 後續行動：
  - ⚠️ `data/GB40559.json` 仍是舊 schema（`test_items`/`document_info`），validator 會報硬錯誤；前端已能容錯，但正解是重新產生為新 schema（`tests`/`document`）。
  - Phase 2：Haiku 跨標準用語稽核（24 組 normalized_id，唯讀）完成，確認 GB 用「不」、UL/IEC/AIS 用「無」的系統性分裂。**經使用者核定，判定用語統一為「無」**（無起火、無爆炸、無洩漏），已加入 normalizer 的 `HAZARD_MAP`（白名單式，功能性「不」如不超過/不能/不應一律不動）並套用於 24 個 clean 檔。
  - 顆粒度落差與中英混雜屬「內容深度」，未機械式拉平，留作日後人工補強。

## 2026-06-25 (UI Polish & Bug Fix)
- 事件：移除首頁冗餘的側邊選擇器、新增 5 份國標分類並修復繁體中文化轉換 Bug
- 背景：
  1. 使用者認為首頁的側邊欄（標準選擇器）過於冗餘，希望直接依賴「應用領域矩陣」來選取比對。
  2. 新增的 5 份國標未被歸類到對應的應用領域中（全預設為一般應用），且簡介卡片僅顯示編號。
  3. 發現所有 GB 國標的全名與新 JSON 資料仍殘留簡體字。
- 內容：
  - 完全移除 `Sidebar.jsx` 元件，將主題切換按鈕獨立移至右上方與 AI 小幫手並排。
  - 修改 `StandardMatrix.jsx` 的分類邏輯，將新國標（玩具、移動電源、平衡車、電動輪椅、固定式電子）精確歸類。
  - 在 `catalog.json` 補齊 5 份新國標的繁體中文全名。
  - 修正 `convert_gb.cjs` 中屬性指定的 Typo (`full_name_zh` 改為 `full_name`)，並重新編譯執行，將所有新舊 GB 標準的 JSON 資料與目錄標題徹底轉換為台灣繁體中文。
- 影響：大幅簡化了使用者的導覽操作流程；解決了新國標無類別可歸的問題；確保了全站文字用語的在地化（100% 繁體中文）。
- 後續：觀察完全移除側邊欄後，使用者在查找特定標準編號時是否會遇到困難。

## 2026-06-25 (Feature & Recovery)
- 事件：大量匯入 5 份新版 GB 國標並重啟背景稽核
- 背景：使用者新增了 5 份 GB 國標文件。同時，系統發現背景排程曾因伺服器重啟而中斷。
- 內容：
  - 依照 `SOP_NEW_STANDARD.md`，派遣 5 名萃取子代理人平行解析 PDF，將 `GB31241.4`, `GB40165`, `GB40559`, `GB47372`, `GB47741` 成功結構化為 Schema v2.0 JSON 格式。
  - 將這 5 份新標準註冊入 `catalog.json`，完成前端資料綁定，並將它們加入 `audit_state.json` 待查核清單。
  - 成功驗證了前端專案的建置 (Vite Build)。
  - 重新排程了每 3 小時一次的 Dawn Audit 稽核機制（接續 Iteration 46），確保背景品質監控不間斷。
- 影響：資料庫新增了大量新國標，且系統排程恢復正常運作。
- 後續：觀察新標準在前端的呈現是否正常，並讓 Dawn Audit 自動抽測新成員。

## 2026-06-06 (Security)
- 事件：清除外洩機密、重寫 git 歷史並建立版控安全防線
- 背景：AI 小幫手的 Gemini API key「不到一天就失效」，追查發現 key 曾以 `VITE_` 前綴與 `.env` 形式 commit 進 _公開_ repo，被 Google 自動停用；另發現 `.env.production.local`（含 `VERCEL_OIDC_TOKEN`）、`data/node_modules/`、多個 `.DS_Store` 也被誤上傳。
- 內容：
  - 使用者於 Google AI Studio 作廢所有舊金鑰。
  - 以 `git filter-repo` 從**整個歷史**抹除 `.env` 與 `.env.production.local`，並 redact 殘留的 `AIza` 字串；force-push 覆寫遠端（備份 bundle 已另存）。
  - 取消追蹤 `data/node_modules/` 與 `.DS_Store`（保留磁碟檔，不入版控）。
  - 重寫 `.gitignore` 為完整版（涵蓋 `.env*`、`node_modules/`、`.DS_Store`、build 產物等）。
  - 新增 `.env.example` 範本；於本檔頂部新增「版控安全鐵律」、`README.md` 新增環境變數與機密管理章節。
- 影響：repo 不再含任何外洩機密；新金鑰只放 Vercel 環境變數，杜絕再次被自動停用。
- 後續：維護 / 定時 agent commit 前務必遵守頂部鐵律，並檢查 `git status`。

## 2026-05-26 (Bug Fix)
- 事件：將 AI 小幫手的 Gemini 預設模型升級至 `gemini-3.1-flash`
- 背景：原使用的 `gemini-1.5-flash` 在 2026 年的 API 環境中已被標示為棄用 (404 Not Found)，導致 AI 小幫手無法正常回覆。
- 內容：修改 `api/chat.js`，將 API URL 中的模型字串從 `gemini-1.5-flash` 更換為最新的 `gemini-3.1-flash`。
- 影響：成功恢復 AI 小幫手的連線，讓使用者可以繼續查詢法規細節。
- 後續：觀察 `gemini-3.1-flash` 在法規問答上的準確度是否有顯著提升。


## 2026-05-25 (UI Polish & Bug Fix)
- 事件：修復 AI 小幫手連線錯誤並優化領域導覽矩陣
- 背景：
  1. AI 小幫手在正式環境回傳 404 與 504 錯誤，因為模型名稱錯誤且未妥善攔截錯誤狀態碼。
  2. 矩陣視圖的膠囊寬度不均，且部分標準（如 UL2271、UL1973、UL2580）的層級標籤與實際對比視圖不一致（幽靈標籤）。
  3. 缺乏一鍵清空選取清單的功能。
- 內容：
  - 更新 `api/chat.js` 模型名稱為正確的 `gemini-1.5-flash`，並解析與回傳詳細的 JSON 錯誤訊息，取代原本模糊的 500/404 狀態。
  - 將 `UL2271.json` 各測試項目補上 `MODULE` 標籤。
  - 撰寫 `sync_objects.js` 自動化腳本，將 `catalog.json` 內的 `available_objects` 陣列與各 v2 JSON 內實際存在的 `test_objects` 進行 100% 同步，消除 UL1973 與 ULC2580 不存在的 `CELL` 標籤。
  - 於 `StandardMatrix.jsx` 將矩陣的 X 軸按照應用領域電池尺寸（由小到大）重新排序。
  - 統一矩陣標準膠囊的 CSS `max-width` 讓排版整齊，並於購物車增加「✕ 清空」按鈕。
- 影響：大幅改善前端視覺一致性與直覺性，並有效解決了前端導覽與後端資料庫層級不一致的問題；同時為 AI 小幫手增加了強健的防錯機制。
- 後續：無。

## 2026-05-24 (Feature)
- 事件：實作「AI 小幫手 (AI Consultant Chat)」並升級為 Vercel 全端架構
- 背景：
  1. 使用者希望能有一個浮動視窗，可以根據當前選取的標準直接進行交叉比對與法規問答。
  2. 原先純前端架構若直接串接 Gemini API 會有金鑰外洩的嚴重資安風險。
- 內容：
  - 開發 `AiConsultantChat.jsx` 懸浮聊天視窗，實作 Context-Aware（僅讀取畫面上勾選的標準）的 Prompt 機制。
  - 將專案升級為 Serverless 架構，建立 `api/chat.js` Vercel Edge Function，將 Gemini API 的調用邏輯移至後端代理。
  - 實作雙 API 鑰匙的 Fallback 機制，當第一把鑰匙遇到 429 限制時，自動切換至第二把鑰匙。
  - 處理 SSE (Server-Sent Events) 串流斷字 bug（加入字串 Buffer 機制）。
  - 在系統指令中加入防護力場 (Prompt Injection 防禦)，嚴禁 AI 洩漏內部 Metadata 與 JSON 架構。
- 影響：成功賦予觀測站強大的 AI 諮詢能力，同時確保 100% 的金鑰安全與對話品質。
- 後續：觀察 Vercel 免費額度的使用狀況與 API 呼叫頻率。

## 2026-05-23 (UI Polish)
- 事件：升級標準矩陣表互動體驗，實作預選與比對流程分離
- 背景：原先選取滿 2 份標準會強制進入橫向比對，導致使用者在矩陣中探索與選取時缺乏緩衝與掌控感。且矩陣在未選取時視覺色彩較為單調。
- 內容：
  - 在 `App.jsx` 導入 `isComparing` 狀態，終止強制跳轉。
  - 為矩陣中未選取的膠囊加入各體系的低透明度色彩，豐富視覺層次。
  - 在矩陣畫面正下方實作「底部動作條 (Bottom Action Bar)」，當選取滿 2 份時滑出，並具備「確認比對」按鈕。
  - 恢復點擊膠囊時於右下角顯示詳細資訊簡介卡片。
  - 於橫向比對視圖 (`SplitScreenGrid`) 左上角加入「← 返回標準矩陣」按鈕，允許無縫退回探索模式。
- 影響：大幅改善操作的流暢度與心理預期，使系統兼具「購物車預覽」與「主動結帳比對」的專業感。
- 後續：無。

## 2026-05-23 (Feature)
- 事件：實作首頁空狀態的「應用領域矩陣對照表」
- 背景：
  1. 使用者認為原本的網路關聯圖雖然酷炫，但缺乏尋找特定應用標準的直覺性。
  2. 系統首頁的空狀態應更傾向於「實用的導航面板」。
- 內容：
  - 移除 `react-force-graph-2d` 套件與 `NetworkGraph.jsx`。
  - 新增 `StandardMatrix.jsx` 元件，動態生成 X 軸為「應用領域 (EV, ESS...)」、Y 軸為「樣品層級 (Cell, Pack...)」的交叉比對表格。
  - 將標準渲染為可點擊的徽章 (Badge) 按鈕，點選後能即時將標準加入比對佇列。
  - 同一標準若支援多層級，會在所屬應用的不同列儲存格中重複顯示，方便檢索。
- 影響：拋棄華而不實的視覺特效，大幅提升系統導航直覺性與找資料的效率；並使專案依賴輕量化。
- 後續：觀察矩陣表格在未來標準大量增加時的橫向與直向擴展體驗。


## 2026-05-23 (UI Polish)
- 事件：優化標準選擇器膠囊排版與大小寫格式轉換
- 背景：
  1. 使用者發現 `UN38.3` 的膠囊包含過長的文字（如 `SINGLE_CELL_BATTERY`），導致在標準選擇器中換行到第三行，破壞卡片高度的一致性。
  2. 原有從資料庫讀取的層級標籤皆為全大寫（如 `CELL`, `INSTALLATION`），視覺上略顯剛硬且有壓迫感。
- 內容：
  - 加寬 `Sidebar.jsx` 選擇器 Modal 視窗（`width: 95vw`, `maxWidth: 1500px`），給予卡片更多水平伸展空間。
  - 建立字眼縮寫對應表，將 `SINGLE_CELL_BATTERY` 縮寫為 `Single Cell`，`COMPONENT_CELL` 縮寫為 `Comp. Cell` 等。
  - 實作正規化邏輯（Title Case 轉換），將所有層級標籤的首字母自動大寫（如 `INSTALLATION` 轉為 `Installation`）。
  - 將樣品篩選按鈕（Filter Buttons）與比對網格卡片內的標籤同步更新。
- 影響：卡片高度統一不再參差不齊；全面改善了介面元素的現代感與易讀性。
- 後續：無。

## 2026-05-23 (Update)
- 事件：優化前端網格排版與實作標準版本追蹤功能
- 背景：
  1. 使用者反映前端橫向對比視圖的卡片寬度過度拉伸，且版面利用率不佳。
  2. 需要明確提示使用者所閱讀的標準是否為最新版本，避免參考過時的測試條件。
  3. 建立未來匯入新標準的標準作業流程。
- 內容：
  - 重構 `SplitScreenGrid.jsx` 的 CSS Grid 佈局，改用 `minmax(280px, 1fr)` 搭配自動換行，解決長文字無限撐開版面的問題。
  - 盤點 21 份標準最新發布年份，並透過腳本更新 `catalog.json`，加入 `is_latest`, `latest_version` 與 `versions_behind` 欄位。
  - 於前端 `InfoModal` 實作動態版本警示列（綠色最新標章 / 橘黃色過時警告）。
  - 建立並制定 `SOP_NEW_STANDARD.md`，明文規範未來新標準匯入的處理流程與 UI 分頁呈現原則。
- 影響：大幅改善前端閱讀體驗；提升系統的合規性提示能力；確保未來的資料擴充有明確的架構依循。
- 後續：待使用者實際匯入新版標準後，驗證同卡片內切換新舊版分頁的 UI 實作。

## 2026-05-23
- 事件：修復前端比對表格的測試覆蓋 Bug 與完成 GB 標準繁體中文化
- 背景：
  1. 使用者發現 GB38031 在選擇 Cell 層級篩選時，無任何測試項目顯示。
  2. 使用者希望閱讀全繁體中文的 GB 標準，不想看到簡體字。
- 內容：
  - 發現前端 `SplitScreenGrid.jsx` 在處理相同 `normalized_id`（如 `ELEC-SC-EXT` 外部短路）但不同層級（如 Cell 與 Pack）的測試時，直接覆寫了物件。
  - 重構前端資料綁定結構，改用陣列 (Array) 來裝載同一個格子內的所有測試項目，並升級 `StandardColumn.jsx` 支援動態疊加多張卡片。
  - 使用 `opencc-js` 撰寫自動化腳本 (`convert_gb.js`)，將 `GB31241`, `GB38031`, `GB43854`, `GB44240`, `GBT36276` 以及 `catalog.json` 中的 GB 資訊全部從簡體中文轉換為繁體中文 (Taiwan)。
- 影響：解決了同標準內測試項目層級互相覆寫的嚴重 Bug；全面提升台灣使用者的閱讀體驗。
- 後續：持續觀察多重卡片在同一個欄位疊加的排版體驗，有需要再做樣式微調。

## 2026-05-22
- 事件：完成所有 21 份標準的 Schema v2.0 結構化轉換
- 背景：原有的 Batch JSON 信心度不足，需要透過三源交叉比對（PDF OCR、Gemini MD、舊 Batch JSON）重新結構化為 v2.0 格式。
- 內容：
  - 成功執行子代理自動化批次處理（Pilot, Batch A~F）。
  - 所有 21 份標準均完成了 Schema v2.0 JSON 轉換。
  - 修正了舊版 JSON 中大量的錯誤（例如 GB31241 的短路電阻、擠壓力數值錯誤，UL9540A 的安裝層級豁免條件等）。
  - 對齊了 `taxonomy.json` 分類體系。
  - 更新了 `catalog.json` 加入 `schema_v2_json` 和 `test_count_v2` 欄位。
- 影響：大幅提升了資料庫的準確性與一致性，為後續的前端橫向比對提供穩固基礎。
- 後續：進入前端介面開發與比對功能實作階段。


## 2026-05-22
- 事件：結構化 GB31241 標準（Schema v2.0）
- 背景：依照 Schema v2.0 Pilot 的格式，進一步擴展轉換 GB 31241 (2022) 便攜式電子產品用鋰離子電池標準。
- 內容：
  - 將 GB 31241 納入 v2.0 JSON 格式。
  - 交叉驗證原有 Batch JSON、Gemini MD 以及原始 OCR markdown，修正多處 Batch JSON 中的錯誤數據（如：短路電阻從 < 0.1 Ω 修正為 80 ± 20 mΩ，擠壓力從 100 kN 修正為 13.0 ± 0.78 kN，溫度循環高溫從 70°C 修正為 72°C，明確化過充電壓判斷條件）。
  - 提取了 13 項核心測試參數與相關條件。
- 影響：完成第 4 份標準的 v2.0 JSON 轉換，產出 `data/GB31241.json`。
- 後續：繼續結構化剩下的標準檔案。

## 2026-05-21
- 事件：完成 Schema v2.0 資料庫重新結構化（Pilot 階段）
- 背景：原有 batch1-6 結構化 JSON（351 rows）由 OCR/翻譯產生，準確度存疑。使用者要求以三層交叉比對（PDF → Gemini markdown → batch JSON）重新結構化
- 內容：
  - 設計全新 JSON Schema v2.0（結構化條件物件 + 嵌入式豁免條款）
  - 建立新分類體系 `data/taxonomy.json`（ELEC/MECH/THERM 三大類 27 子類別）
  - 完成 3 份 pilot 標準：`UN38.3.json`(9測試/38KB)、`UL1642.json`(11測試/37KB)、`IEC62133-2.json`(12測試/54KB)
  - 所有參數均經三源交叉驗證，發現並修正 6 處差異
- 影響：`data/` 目錄新增 4 個 JSON 檔案，為前端橫向比對提供準確的結構化資料基礎
- 後續：用戶審核 pilot 品質後，擴展至剩餘 18 份標準

## 2026-05-04
- 事件：建立專案事件紀錄文件
- 背景：需要一份固定位置的檔案，方便後續追蹤重要變更
- 內容：新增 `AGENTS.md` 作為專案時間線與決策記錄入口
- 影響：提供後續維護與回顧的統一格式
- 後續：依重要事件持續補充
