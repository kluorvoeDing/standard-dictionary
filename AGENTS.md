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
>
> **動手前也要讀 [`MAINTENANCE.md`](./MAINTENANCE.md)**：分工、提交前檢查（`npm run check:all`）、資料欄位與分類規則、前端規則、腳本規則。


---

## 目前進行中的工作：介面改版

**請先完整閱讀 [`EXPERIMENT_BRIEF.md`](./EXPERIMENT_BRIEF.md)。它是這次工作的唯一需求來源。**

- 前端、介面、設計相關的規則，一律以 `EXPERIMENT_BRIEF.md` 為準。`MAINTENANCE.md` 與 `docs/AGENTS_HISTORY.md` 中關於 UI 風格、元件、版面的舊規定只是歷史參考，不是限制。
- `data/` 在這次工作中凍結，不得修改任何檔案。
- 不得 `git push`、不得部署、不得修改 `main`。
- 專案過去的事件與決策紀錄在 [`docs/AGENTS_HISTORY.md`](./docs/AGENTS_HISTORY.md)，需要了解歷史時再查閱。
