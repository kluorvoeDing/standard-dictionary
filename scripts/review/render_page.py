#!/usr/bin/env python3
"""把 PDF 的某一頁存成圖片，給主代理或子代理核對表格與數值。

    python3 scripts/review/render_page.py <PDF 路徑> <頁碼（從 1 起算）> [dpi]

輸出到 .review-work/pages/render/<PDF 檔名>-pNN.png，並印出路徑。
表格裡的圓圈樣品編號、上標注記（例如「1～5ᵇ」）在文字層常變亂碼，樣品表一律看圖。
"""
import os
import sys

import pymupdf

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
WORK = os.environ.get('REVIEW_WORK', os.path.join(ROOT, '.review-work'))

if len(sys.argv) < 3:
    sys.exit(__doc__)
pdf, page = sys.argv[1], int(sys.argv[2])
dpi = int(sys.argv[3]) if len(sys.argv) > 3 else 150
out_dir = os.path.join(WORK, 'pages', 'render')
os.makedirs(out_dir, exist_ok=True)
out = os.path.join(out_dir, f'{os.path.splitext(os.path.basename(pdf))[0]}-p{page:02d}.png')
pymupdf.open(pdf)[page - 1].get_pixmap(dpi=dpi).save(out)
print(out)
