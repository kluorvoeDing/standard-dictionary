# Guidance Comparison Schema

## Goal

Allow non-normative documents, such as research reports or recommended-practice manuals, to be selected in the future web UI and compared alongside formal standards without pretending they are pass/fail regulatory standards.

## Design

Use a **dual-layer model** for guidance documents:

1. **Native guidance layer**
   - Preserves the real meaning of the source document
   - Uses `recommendations[]`
   - Does not force fake pass/fail requirements

2. **Comparison adapter layer**
   - Uses `comparison_items[]`
   - Gives the web UI a normalized list it can compare with standard `tests[]`
   - Marks each item as `document_strength: "guidance"`

## Standard document rule

Existing formal standards keep the current schema:

- `document_type: "standard"`
- `tests[]`

Web adapter rule:
- If `comparison_items[]` exists, use it directly.
- Else if `tests[]` exists, map `tests[] -> comparison_items` at load time.

## Guidance document rule

Guidance / research files use:

- `document_type: "guidance"`
- `normativity: "recommended_practice" | "research_guidance"`
- `recommendations[]`
- `comparison_items[]`

## Minimum fields for `comparison_items[]`

```json
{
  "item_id": "MECH-03",
  "item_name_zh": "受控擠壓建議",
  "item_name_en": "Controlled Crush",
  "section": "3.1.1",
  "test_objects": ["CELL", "MODULE", "PACK"],
  "conditions_summary": "1 mm/min crush to force/displacement/failure end point",
  "evaluation_summary": "No fixed pass/fail. Report HSL at force/displacement milestones.",
  "document_strength": "guidance",
  "comparison_ready": true
}
```

## Web rendering guidance

### For standards
Render as:
- Standard name
- Test name
- Conditions
- Criteria / pass-fail
- Exemptions

### For guidance
Render as:
- Document name
- Recommendation name
- Suggested conditions
- Suggested measurements
- Evaluation basis
- Explicit badge: `Guidance / 建議性文件`

## Sorting / filtering

The web UI should allow guidance documents in the same picker as standards, but clearly label them.

Recommended top-level badges:
- `Standard`
- `Guidance`
- `Test Method`

## Why this is safer

This approach prevents three problems:

1. Treating research recommendations as mandatory legal criteria
2. Breaking the web UI by forcing incompatible source material into `tests[]`
3. Losing comparison capability for important guidance documents like SAND2017-6925
