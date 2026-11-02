import { useEffect } from 'react';

const isEditable = (el) =>
  !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

/**
 * 開啟檢索的快捷鍵：⌘K／Ctrl+K（切換）與單鍵「/」（焦點不在輸入框時開啟）。
 * 兩者都 preventDefault，避免觸發瀏覽器自己的搜尋列。
 */
export function useSearchHotkeys(setOpen) {
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.isComposing && !isEditable(e.target)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);
}
