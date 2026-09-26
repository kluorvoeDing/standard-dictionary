#!/usr/bin/env python3
"""把標準原文 PDF 轉成可搜尋的文字，存到工作區（不進版控）。

    python3 scripts/review/extract_text.py <標準代號> <PDF 路徑>          # 讀文字層
    python3 scripts/review/extract_text.py <標準代號> <PDF 路徑> --ocr    # 文字層不可用時改用 OCR

輸出：
    .review-work/src/<標準代號>.txt       每頁前面有 `=== PAGE n ===`（n 為 PDF 頁碼，從 1 起算）
    .review-work/pages/<標準代號>/pNN.png  只有 --ocr 才產生；數值要看這些影像確認

不用 markitdown：它讀表格時會把數字弄丟（「表1和表2」變成「表 和表」）。
文字層是否可讀，以「有常見字詞的頁數比例」判斷：GB 31241、GB 40165 的文字層雖然是中文字元，
卻是字形代碼亂碼（例如「犌犅」），不會出現「的」「試驗」這類常見字；GB 43854 是掃描檔，沒有文字。
雙語的 IEC 文件有一半是法文頁，所以看比例，不看中位數。
"""
import os
import sys

import pymupdf

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
WORK = os.environ.get('REVIEW_WORK', os.path.join(ROOT, '.review-work'))
COMMON = ['的', '试验', '試驗', '电池', '電池', '样品', '樣品', ' the ', ' shall ', 'の', 'する', '試験', ' le ', ' doit ']
READABLE_SHARE = 0.3


def readable_pages(doc):
    return [sum(page.get_text().count(k) for k in COMMON) > 0 for page in doc]


def extract_layer(doc, out):
    with open(out, 'w', encoding='utf-8') as fh:
        for i, page in enumerate(doc):
            fh.write(f'\n=== PAGE {i + 1} ===\n')
            fh.write(page.get_text())


def extract_ocr(doc, out, pages_dir, dpi=170):
    from rapidocr_onnxruntime import RapidOCR  # pip install rapidocr_onnxruntime
    ocr = RapidOCR()
    os.makedirs(pages_dir, exist_ok=True)
    with open(out, 'w', encoding='utf-8') as fh:
        for i, page in enumerate(doc):
            png = os.path.join(pages_dir, f'p{i + 1:02d}.png')
            page.get_pixmap(dpi=dpi).save(png)
            result, _ = ocr(png)
            # 依文字框的位置排回閱讀順序：同一列（約 12 px 內）由左到右
            boxes = []
            for box, text, _conf in result or []:
                y = sum(p[1] for p in box) / 4
                x = min(p[0] for p in box)
                boxes.append((round(y / 12), x, text))
            boxes.sort()
            fh.write(f'\n=== PAGE {i + 1} ===\n')
            row, buf = None, []
            for r, _x, t in boxes:
                if row is not None and r != row:
                    fh.write('  '.join(buf) + '\n')
                    buf = []
                row = r
                buf.append(t)
            if buf:
                fh.write('  '.join(buf) + '\n')
            print(f'  OCR 第 {i + 1}/{len(doc)} 頁', flush=True)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) != 2:
        sys.exit(__doc__)
    std, pdf = args
    doc = pymupdf.open(pdf)
    os.makedirs(os.path.join(WORK, 'src'), exist_ok=True)
    out = os.path.join(WORK, 'src', f'{std}.txt')

    flags = readable_pages(doc)
    share = sum(flags) / max(1, len(flags))
    if '--ocr' in sys.argv:
        extract_ocr(doc, out, os.path.join(WORK, 'pages', std))
        print(f'{std}: OCR 完成，{len(doc)} 頁 → {out}')
        print('  OCR 會認錯數字與符號（±、℃、樣品編號）：數值一律對照 pages/ 的影像。')
        return
    extract_layer(doc, out)
    print(f'{std}: {len(doc)} 頁，{share:.0%} 的頁面有常見字詞 → {out}')
    if share < READABLE_SHARE:
        print('  文字層看起來不可用（亂碼或掃描檔）。請改用 --ocr，並以頁面影像核對數值。')
        sys.exit(2)


if __name__ == '__main__':
    main()
