// 凍結的比對正規化規則（取自起始 commit 的 frontend/src/utils/compareRows.js）。
// 驗收以此判斷「標示為相同的值是否真的相同」。請勿修改。
export function normalizeForCompare(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/／/g, '/')
    .replace(/[~〜～]/g, '~')
    .replace(/->/g, '→')
    .replace(/✕/g, '×')
    .replace(/\s+/g, '')
    .toLowerCase()
    .replace(/\(依(?:saej2464|ul1642|un38\.3)[^)]*\)/g, '')
    .replace(/\([a-z\-/,.]{3,}\)/g, '')
    .replace(/(100%)?(標準充電後|充滿電後|充滿電|滿充電狀態|滿充電|滿電狀態|滿電|滿充|100%soc)/g, '滿充')
    .replace(/滿充\(?滿充\)?/g, '滿充');
}
