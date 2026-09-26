// 試驗程序欄位（Phase 2 補強寫入）→ 原始資料中的同義欄位。
// scripts/audit_enrichment.mjs 與 scripts/review/make_worklist.mjs 共用。
export const PROCEDURE_FIELDS = {
  sample_quantity: ['sample_size', 'samples'],
  pre_conditioning: ['preconditioning', 'pre_condition'],
  observation_period: ['observation', 'observation_time', 'rest_time', 'rest_period', 'post_rest'],
};
