#!/usr/bin/env python3
"""依定位子代理回傳的行號，從原文逐字擷取摘錄，並檢查定位結果。

    python3 scripts/review/excerpts.py <標準代號>

輸入：.review-work/out/<標準代號>.locate.json、.review-work/src/<標準代號>.txt、.review-work/work/<標準代號>.json
輸出：.review-work/out/<標準代號>.excerpts.md（給判斷子代理讀）

摘錄由程式依行號切出，不讓子代理抄寫原文，避免抄錯。問題數必須為 0 才交給判斷子代理；
常見問題是範圍指到目錄（第一批 GB47741 就發生過）：有「····」點線，或整段沒有完整句子。
"""
import json
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
WORK = os.environ.get('REVIEW_WORK', os.path.join(ROOT, '.review-work'))

if len(sys.argv) != 2:
    sys.exit(__doc__)
std = sys.argv[1]
loc = json.load(open(os.path.join(WORK, 'out', f'{std}.locate.json'), encoding='utf-8'))
work = json.load(open(os.path.join(WORK, 'work', f'{std}.json'), encoding='utf-8'))
src_path = os.path.join(WORK, 'src', f'{std}.txt')
lines = open(src_path, encoding='utf-8').read().split('\n')

problems = []


def block(a, b, label):
    if not (1 <= a <= b <= len(lines)):
        problems.append(f'{label}: 行號範圍 {a}–{b} 不合法（原文共 {len(lines)} 行）')
        return ''
    if b - a > 400:
        problems.append(f'{label}: 行號範圍 {a}–{b} 超過 400 行，可能包到其他條款')
    return '\n'.join(lines[a - 1:b])


out = [f'# {std} 原文摘錄（依定位結果逐字擷取；行號對應 {src_path}）\n', '## 通則\n']
for g in loc.get('general', []):
    label = f"通則 {g.get('topic')} {g.get('clause', '')}"
    out.append(f"### {g.get('topic')} — {g.get('clause', '')}（第 {g.get('page', '?')} 頁，行 {g['start_line']}–{g['end_line']}）")
    if g.get('note'):
        out.append(f"> 定位備註：{g['note']}")
    out.append('```\n' + block(g['start_line'], g['end_line'], label) + '\n```\n')
if not loc.get('general'):
    problems.append('沒有任何通則（樣品數量、樣品表、預處理等），定位不完整')

out.append('## 各測試條款\n')
ids = [t['id'] for t in work['tests']]
tests = loc.get('tests', {})
for tid in ids:
    t = tests.get(tid)
    if not t:
        problems.append(f'{tid}: 定位結果中沒有這項測試')
        continue
    if not t.get('found', True):
        out.append(f"### {tid} — 未找到（{t.get('note', '')}）\n")
        problems.append(f'{tid}: found=false')
        continue
    text = block(t['start_line'], t['end_line'], tid)
    if '···' in text or '…………' in text or re.search(r'\.{6,}', text):
        problems.append(f"{tid}: 行 {t['start_line']}–{t['end_line']} 看起來是目錄")
    elif not re.search(r'[。，；：,;:]|\. ', text):
        problems.append(f"{tid}: 行 {t['start_line']}–{t['end_line']} 沒有完整句子，可能是目錄或只有標題")
    elif t['end_line'] - t['start_line'] < 2:
        problems.append(f"{tid}: 行 {t['start_line']}–{t['end_line']} 只有 {t['end_line'] - t['start_line'] + 1} 行")
    # PyMuPDF 常把條款號拆成多行（「4.」「6.」「2 样品的数量」），所以只檢查數字有出現在開頭附近
    digits = re.sub(r'\D', '', t.get('clause', ''))
    head = re.sub(r'\D', '', '\n'.join(lines[max(0, t['start_line'] - 6):t['start_line'] + 5]))
    if digits and digits not in head:
        problems.append(f"{tid}: 條款 {t.get('clause')} 的號碼沒有出現在第 {t['start_line']} 行附近")
    out.append(f"### {tid} — {t.get('clause', '')}（第 {t.get('page', '?')} 頁，行 {t['start_line']}–{t['end_line']}）")
    out.append('```\n' + text + '\n```\n')

extra = sorted(set(tests) - set(ids))
if extra:
    problems.append(f'定位結果有工作單以外的測試：{extra}')

dest = os.path.join(WORK, 'out', f'{std}.excerpts.md')
open(dest, 'w', encoding='utf-8').write('\n'.join(out))
print(f'{std}: 通則 {len(loc.get("general", []))} 處、測試 {len(tests)} 項，問題 {len(problems)} 個 → {dest}')
for p in problems:
    print('  -', p)
sys.exit(1 if problems else 0)
