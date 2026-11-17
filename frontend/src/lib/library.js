// 資料載入與標準目錄的共用工具。
export const baseOf = (doc) => doc.base_standard_id || doc.document_id;

async function getJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} HTTP ${res.status}`);
  return res.json();
}

// 少數資料檔仍是舊結構（test_items／document_info），統一成 tests／document。
function normalizeDoc(data) {
  if (!data || typeof data !== 'object') return data;
  const out = { ...data };
  if (!Array.isArray(out.tests) && Array.isArray(out.test_items)) out.tests = out.test_items;
  if (!out.document && out.document_info) {
    const di = out.document_info;
    out.document = {
      id: di.standard_id, short_name: di.standard_id, full_name_zh: di.title_zh, full_name: di.title_en,
      scope: di.scope, publication_date: di.release_date, publisher: di.publisher,
    };
  }
  return out;
}

export async function loadCatalog() {
  const [catalog, taxonomy] = await Promise.all([getJson('/data/catalog.json'), getJson('/data/taxonomy.json').catch(() => null)]);
  return { catalog: catalog.filter(d => d.schema_v2_json), taxonomy };
}

/** 載入全部標準。回傳 { docs: { docId: data }, failed: [docId] }。 */
export async function loadDocs(catalog) {
  const docs = {};
  const failed = [];
  await Promise.all(catalog.map(doc => getJson(`/${doc.schema_v2_json}`)
    .then(data => { docs[doc.document_id] = normalizeDoc(data); })
    .catch(() => { failed.push(doc.document_id); })));
  return { docs, failed };
}

const byNewest = (a, b) => String(b.publication_date).localeCompare(String(a.publication_date));

/** 同一標準的各版本合為一筆：[{ baseId, versions（新到舊）, latest }]。 */
export function standardsOf(catalog) {
  const map = new Map();
  catalog.forEach(doc => {
    const id = baseOf(doc);
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(doc);
  });
  return [...map.entries()].map(([baseId, versions]) => {
    versions.sort(byNewest);
    return { baseId, versions, latest: versions[0] };
  });
}

export const yearOf = (doc) => (String(doc?.publication_date || '').match(/\d{4}/) || [''])[0];

// 中文標題：去掉開頭的標準編號，沒有中文名稱時用原文名稱。
export function titleOf(doc, data) {
  const zh = data?.document?.full_name_zh;
  if (zh) {
    const i = zh.search(/[\u4e00-\u9fff]/);
    return (i > 0 ? zh.slice(i) : zh).trim();
  }
  return (data?.document?.full_name || doc?.full_name || '').trim();
}

// 應用領域只留中文（資料寫成「電動汽車 (EV)」）。
export const applicationOf = (doc) => String(doc?.application || '其他').replace(/\s*[(（].*$/, '');
export const APPLICATION_ORDER = ['運輸安全', '便攜式電子', '一般應用', '輕型電動車', '無人機', '電動汽車', '儲能系統', '工業應用'];

export const LEVEL_SHORT = { CELL: '電芯', MODULE: '模組', PACK_SYSTEM: '電池包' };

/** 以測試代號找出所屬文件。同一代號存在於多個版本時取較新的版本。 */
export function findTest(library, testId, docId) {
  const order = docId ? [docId] : [...library.catalog].sort(byNewest).map(d => d.document_id);
  for (const id of order) {
    const test = library.docs[id]?.tests?.find(t => t.id === testId);
    if (test) return { docId: id, test };
  }
  return null;
}
