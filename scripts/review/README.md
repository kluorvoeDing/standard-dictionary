# 原文核對工具

用來把 `data/*.json` 的內容逐項對照標準原文改正。2026-09-26 第一批（GB40559、GB47741、GB31241.4、GB47372、GB40165）就是用這套流程完成，做法與成果見 `AGENTS.md` 同日條目。

分工：

- **主代理**：拆解任務、跑這些腳本、看頁面影像驗收、寫覆寫檔、寫入與提交。
- **子代理**：依 [`SPEC.md`](./SPEC.md) 定位條款、判斷數值。

## 安裝

```bash
pip install -r scripts/review/requirements.txt
```

## 工作區

所有中間檔放在 `.review-work/`（已列入 `.gitignore`）。這裡有標準原文的文字與影像，**有版權，不可進版控**；要改位置可設環境變數 `REVIEW_WORK`。

```
.review-work/
  src/<標準>.txt             原文文字（extract_text.py）
  pages/<標準>/pNN.png       頁面影像（--ocr 時產生；render_page.py 另存在 pages/render/）
  work/<標準>.json           工作單（make_worklist.mjs）
  out/<標準>.locate.json     定位結果（定位子代理，任務 L）
  out/<標準>.excerpts.md     原文摘錄（excerpts.py）
  out/<標準>.decisions.json  判斷結果（判斷子代理，任務 P／R）
  out/<標準>.overrides.json  主代理驗收後的修正（格式同 decisions 的一筆；可只附 clauses、不附引文）
```

`<標準>` 就是 `data/` 下的檔名，例如 `UL2054`、`GB31241.4`。

## 流程（每份標準）

```bash
# 1. 原文轉文字。文字層不可用時會提示改用 --ocr（例如 GB31241、GB40165、GB43854）
python3 scripts/review/extract_text.py UL2054 docs/source_pdfs/s2054_3.pdf

# 2. 工作單
node scripts/review/make_worklist.mjs UL2054                                   # 試驗程序欄位（任務 P）
node scripts/review/make_worklist.mjs ULC2580 --tests ULC2580-B2-1,ULC2580-B2-2 --all-fields   # 補參數（任務 R）

# 3. 定位子代理（SPEC 任務 L）產生 locate.json，再切摘錄；問題必須為 0
python3 scripts/review/excerpts.py UL2054

# 4. 判斷子代理（SPEC 任務 P 或 R）產生 decisions.json，再做機械驗收；問題必須為 0
python3 scripts/review/verify.py UL2054

# 5. 主代理人工驗收（見下一節），有錯就寫 overrides.json，再跑一次 verify.py

# 6. 寫入（會先自動跑 verify.py，有問題就不寫）
node scripts/review/apply.mjs UL2054 --dry
node scripts/review/apply.mjs UL2054
node scripts/normalize_data.mjs --write --all
npm run validate
node scripts/audit_enrichment.mjs        # 該標準的三個欄位應顯示「已核對」
```

看某一頁的影像：

```bash
python3 scripts/review/render_page.py docs/source_pdfs/s2054_3.pdf 12
```

## 人工驗收（主代理，不可省略）

`verify.py` 只能確認格式、引文存在、沒有遺漏，**無法確認判斷對不對**。每份標準至少要做：

1. 看頁面影像，核對樣品表的每一列。
2. 至少抽查 5 個關鍵條款。
3. 對照第一批抓到的子代理錯誤逐項檢查：

| 錯誤類型 | 第一批實例 |
|---|---|
| 條件句寫反 | 「析鋰判定**合格**則更換 3 個全新樣品」被寫成「不合格」 |
| 漏掉通則的第二步 | 預處理除了充放電循環，電池組還要做靜電放電，且第 8 章樣品不做 |
| 引用條款沒展開 | 「試驗方法見 7.5」的跌落試驗，沒有沿用 7.5 的「整體跌落後擱置 1 小時」 |
| 例外的樣品數 | 表注寫共用 5 顆、「每項試驗各使用 1 個電池組」 |
| 為了過檢查亂改用詞 | 「充滿電」寫成「達到滿電狀態」、「充電」寫成「通電」 |
| 把試驗步驟當前置處理 | 前置處理只寫試驗開始前的狀態 |
| 定位指到目錄 | GB47741 第一次定位整批指到目錄頁 |

`verify.py` 列出「子代理的引文不在原文中（已被覆寫）」時，代表該子代理可能捏造引文，其他結果也要多抽查。

## 寫入後的資料長什麼樣

- `replace`：`{ "value": …, "detail": …, "source_reference": "4.6.4；4.5.1；6.1" }`
- `keep` 附條款：原值不變，補上 `source_reference`。
- `delete`：欄位移除。

比對頁「試驗程序」旁的附註依 `source_reference` 判斷：同一測試的程序欄位都有出處時，顯示「已對照原文」。
