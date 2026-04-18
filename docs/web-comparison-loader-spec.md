# Web Comparison Loader Spec

## Purpose

Define how the future web UI should load both formal standards and guidance documents into one comparison experience.

## Generated data files

Current build output:
- `data/catalog.json`: document-level manifest for selection UI
- `data/comparison_rows.json`: normalized rows for direct comparison rendering
- `scripts/build_web_catalog.py`: rebuild script after any source JSON change

## Loader order

Preferred runtime order:

1. Load `data/catalog.json` to build the selectable document list.
2. Load `data/comparison_rows.json` for the comparison grid.
3. Only fall back to per-document source JSON when debugging or rebuilding.

Source-level rebuild order:

1. If `comparison_items[]` exists, use it directly.
2. Else if `tests[]` exists, map `tests[]` into comparison rows.
3. Else mark document as unsupported.

## Standard mapping

Input:
- `document_type` absent or `standard`
- `tests[]`

Map each `tests[]` item into:

```json
{
  "item_id": "ELEC-01",
  "item_name_zh": "外部短路",
  "item_name_en": "External Short Circuit",
  "section": "6.1",
  "test_objects": ["CELL"],
  "conditions_summary": "generated from conditions",
  "evaluation_summary": "generated from criteria.description",
  "document_strength": "standard",
  "comparison_ready": true
}
```

## Guidance mapping

Input:
- `document_type: "guidance"`
- `comparison_items[]`

Use `comparison_items[]` as-is.

## UI requirements

Each selected document should display a badge:
- `Standard`
- `Guidance`
- `Test Method`

Each comparison row should show:
- item name
- section
- object scope
- conditions summary
- evaluation summary
- source strength badge

## Filtering behavior

Filtering should work on normalized row fields only:
- `item_id`
- `test_objects[]`
- `item_name_zh`
- `item_name_en`
- `document_strength`

## Safety rule

The UI must never render guidance rows as pass/fail requirements unless the source explicitly includes normative pass/fail language.
