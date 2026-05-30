---
name: dawn-audit
description: 啟動「破曉大隊」雙盲交叉稽核流程 (Dawn Audit Fleet)，直接比對原始 PDF 與 JSON 資料庫以尋找微米級幻覺與公差遺漏。
---

# 破曉大隊稽核流程 (Dawn Audit Fleet)

這項 Skill 用於嚴格檢驗專案內生成的 JSON 資料庫，確保其與最原始的 PDF 規格書在數值、公差、邏輯上 **100% 完全一致**，徹底杜絕 AI 處理過程中產生的「微米級幻覺 (Micro-hallucinations)」與「關鍵數值遺漏」。

## 觸發時機 (When to use)
- 使用者要求「稽核 (Audit)」、「交叉比對 (Cross-audit)」或啟動「破曉大隊 (Dawn Audit Fleet)」時。
- 定期 Cron 排程任務被觸發時，要求對特定或隨機標準進行檢驗。

## 執行規範 (Execution Protocol)

### 1. 智慧路徑配對 (Path Resolution)
當接收到稽核目標（例如 `UL 1973`、`IEC 62133-2`，或是「隨機抽驗」）時，主代理人必須：
1. 掃描 `/Users/Openclaw/Documents/Standard-dictionary/data/` 尋找對應的 JSON 檔案。
2. 掃描 `/Users/Openclaw/Documents/Standard-dictionary/資料庫/01_Original_PDFs/` 尋找對應的原始 PDF 檔案。
3. 若為「隨機抽驗」，請利用 `list_dir` 隨機挑選一份 JSON 並配對其 PDF。

### 2. 派發稽核員 (Spawn Auditors)
針對每一份要稽核的標準，使用 `invoke_subagent` 工具派發一個獨立的 `research` 子代理人。

**Subagent 設定參數：**
- **TypeName**: `research`
- **Role**: `Dawn Auditor - {標準名稱}`
- **Prompt 模板**:
```text
You are a member of the 'Dawn Audit Fleet'. Your task is to perform a strict cross-audit of the JSON database against the RAW PDF standards. 
[紅線限制] 絕對禁止對照任何「已翻譯的 .md」或「中間轉換檔」！

Files to audit:
- Raw PDF: `{PDF_ABSOLUTE_PATH}`
- JSON: `{JSON_ABSOLUTE_PATH}`

Requirements:
1. Read the raw PDF file directly using `view_file`.
2. Verify every test, condition, acceptance criteria, and limit point-by-point against the JSON.
3. Focus specifically on:
   - Missing tolerances/limits (e.g., missing '±1°C', 'at least', etc.).
   - Reverse logic errors (e.g., condition inverted).
   - Translation context errors or hallucinations.

Reply to me with a markdown list of all discrepancies found along with their file and location. 
If the file has no issues, explicitly state 'Status: 100% Perfect'.
```

### 3. 產出差異報告與修復 (Ticketing & Resolution)
1. **等待回報**：主代理人發出 `invoke_subagent` 後，進入待命狀態，不須手動輪詢 (Polling)。
2. **檢視 Ticket**：當子代理人回傳結果時，主代理人負責閱讀報告。
3. **執行修復 (Human-in-the-loop / Agent-in-the-loop)**：
   - 若回報 `Status: 100% Perfect`，則通知使用者該標準完美通關。
   - 若回報有 Discrepancies，主代理人必須**親自**或撰寫 Node.js 腳本 (搭配 `run_command`) 或使用 `multi_replace_file_content` 工具，對 JSON 檔案進行精準修復。
   - 修復完成後，將變更 commit 並 push 至 GitHub。
