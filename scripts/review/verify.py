#!/usr/bin/env python3
"""機械驗收：檢查判斷子代理的決定檔（以及主代理的覆寫檔），問題數必須為 0 才能寫入資料。

    python3 scripts/review/verify.py <標準代號>

輸入：
    .review-work/work/<標準代號>.json             工作單（make_worklist.mjs）
    .review-work/out/<標準代號>.decisions.json    判斷子代理的決定
    .review-work/out/<標準代號>.overrides.json    主代理驗收後的修正（可省略；同一測試＋欄位時取代子代理的決定）
    .review-work/src/<標準代號>.txt               原文文字（extract_text.py）

檢查項目：
    - 工作單中每個「測試 × 欄位」剛好一筆決定，沒有遺漏、沒有範圍外的
      （all-fields 工作單允許新增欄位）
    - keep／replace 要有引文或影像頁碼；delete 要有理由；replace 要有 value 與條款
    - 每段引文去掉空白後確實出現在原文中（主代理的覆寫可只附條款，因為已看過影像）
    - 單位是標準形（小時／分鐘／秒、°C）
    - value／detail 沒有簡體字：用 OpenCC s2tw 逐字比對，不用手寫清單。
      第一批曾把「充」「定」寫進清單，子代理為了通過檢查改用「滿電」「通電」這類怪詞。

需要：pip install opencc-python-reimplemented
"""
import json
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
WORK = os.environ.get('REVIEW_WORK', os.path.join(ROOT, '.review-work'))
ACTIONS = ('keep', 'replace', 'delete')
# s2tw 會轉換、但台灣用字也接受的字
TAIWAN_OK = set('台占干')
UNIT = re.compile(r'\d\s*(h|hr|min|s)\b|℃|\d\s*度')

try:
    from opencc import OpenCC
except ImportError:
    sys.exit('缺少 OpenCC：pip install opencc-python-reimplemented')
try:
    S2TW = OpenCC('s2tw')
except Exception:  # 官方 opencc 套件的設定檔名稱帶 .json
    S2TW = OpenCC('s2tw.json')


def load(name, required=True):
    path = os.path.join(WORK, name)
    if not os.path.exists(path):
        if required:
            sys.exit(f'找不到 {path}')
        return None
    return json.load(open(path, encoding='utf-8'))


def squash(s):
    return re.sub(r'\s+', '', s)


def simplified_chars(text):
    return sorted({a for a, b in zip(text, S2TW.convert(text)) if a != b and a not in TAIWAN_OK})


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    std = sys.argv[1]
    work = load(f'work/{std}.json')
    decisions = load(f'out/{std}.decisions.json')
    overrides = load(f'out/{std}.overrides.json', required=False) or []
    source = squash(open(os.path.join(WORK, 'src', f'{std}.txt'), encoding='utf-8').read())
    allow_new = work.get('allow_new_fields', False)

    expected, current = set(), {}
    for t in work['tests']:
        fields = list(t['current']) if work.get('mode') == 'all-fields' else list(work.get('fields') or [])
        for f in fields + list(t['duplicate_fields']):
            expected.add((t['id'], f))
        for f, v in {**t['current'], **t['duplicate_fields']}.items():
            current[(t['id'], f)] = v
    test_ids = {t['id'] for t in work['tests']}

    problems, notes, counts = [], [], {}
    seen = {}
    for d in decisions.get('decisions', []):
        key = (d.get('id'), d.get('field'))
        if key in seen:
            problems.append(f'{key}: 重複的決定')
        seen[key] = d
    merged = dict(seen)
    for o in overrides:
        merged[(o.get('id'), o.get('field'))] = {**o, '_override': True}

    for key, d in merged.items():
        tid, field = key
        action = d.get('action')
        counts[action] = counts.get(action, 0) + 1
        who = '覆寫' if d.get('_override') else '決定'
        if action not in ACTIONS:
            problems.append(f'{key}: 不認得的 action「{action}」')
            continue
        if tid not in test_ids:
            problems.append(f'{key}: 工作單沒有這項測試')
            continue
        if key not in expected and not (allow_new and action == 'replace'):
            problems.append(f'{key}: 不在工作單範圍內')
        if action == 'keep' and key not in current:
            problems.append(f'{key}: keep 但這個欄位不存在')
        if action in ('keep', 'replace') and not d.get('_override') and not d.get('quotes') and not d.get('image_pages'):
            problems.append(f'{key}: {action} 沒有引文也沒有影像頁碼')
        if action == 'replace':
            if not d.get('value'):
                problems.append(f'{key}: replace 沒有 value')
            if not d.get('clauses'):
                problems.append(f'{key}: replace 沒有條款（clauses），寫入後無法附 source_reference')
            text = f"{d.get('value') or ''} {d.get('detail') or ''}"
            if UNIT.search(text):
                problems.append(f'{key}: 單位不是標準形（小時／分鐘／秒、°C）：{text[:60]}')
            bad = simplified_chars(text)
            if bad:
                problems.append(f'{key}: {who}有簡體字 {bad}')
        if action == 'delete':
            if not d.get('reason') and not d.get('_override'):
                problems.append(f'{key}: delete 沒有理由')
            if key not in current:
                notes.append(f'{key}: 要刪除的欄位本來就不存在')
        for q in d.get('quotes') or []:
            if squash(q) not in source:
                problems.append(f'{key}: {who}的引文不在原文中：{q[:70]}')

    # 被覆寫的子代理決定也檢查引文：假引文代表該子代理的其他結果也要多抽查
    for key, d in seen.items():
        if merged[key] is d:
            continue
        for q in d.get('quotes') or []:
            if squash(q) not in source:
                notes.append(f'{key}: 子代理的引文不在原文中（已被覆寫）：{q[:70]}')

    for g in decisions.get('general_rules', []):
        q = g.get('quote')
        if q and squash(q) not in source:
            problems.append(f"通則 {g.get('clause')}: 引文不在原文中：{q[:70]}")

    for key in sorted(expected - set(merged)):
        problems.append(f'{key}: 沒有決定')

    print(f'{std}: 決定 {len(seen)} 筆、覆寫 {len(overrides)} 筆 {counts}；'
          f'不確定 {len(decisions.get("uncertain", []))} 筆；問題 {len(problems)} 個')
    for p in problems:
        print('  -', p)
    for n in notes:
        print('  ·', n)
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    main()
