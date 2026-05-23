# Source Pipeline

This repo now treats the PDF as the canonical source and keeps the other artifacts as derived layers.

## Layers

1. **PDF source**
   - Lives in `/Users/Openclaw/Documents/Henry & Beta/Standards`
   - This is the authoritative source of truth

2. **Canonical markdown**
   - Generated into `generated/standards/*.md`
   - Starts from the source PDF / OCR markdown and adds a clean, reviewable structure

3. **Full translation markdown**
   - Generated into `generated/translations/*.md`
   - Preferred human-facing markdown for the HTML UI

4. **Web JSON**
   - `data/catalog.json`
   - `data/comparison_rows.json`
   - Consumed by `index.html`

## Pilot set

The first canonical markdown pass is limited to these higher-risk documents:

- `GBT-36276`
- `GB38031`
- `ULC-2580`
- `GB31241`
- `AIS-038`

## Build order

```bash
python3 scripts/build_source_inventory.py
python3 scripts/build_canonical_documents.py
python3 scripts/build_web_catalog.py
```

## Intended usage

- Keep editing focused on the canonical markdown, not on the PDF source.
- Keep HTML on stable JSON.
- Use the generated markdown as the human-readable bridge between source and web output.
- Prefer the full translation markdown when it passes QA; otherwise fall back to canonical markdown.
