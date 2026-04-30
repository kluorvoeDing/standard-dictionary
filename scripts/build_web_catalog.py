#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
CONTENT_GLOB = "batch*/content/*.json"
CATALOG_PATH = DATA_DIR / "catalog.json"
ROWS_PATH = DATA_DIR / "comparison_rows.json"


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def infer_document_type(doc: dict[str, Any]) -> str:
    if doc.get("document_type"):
        return str(doc["document_type"])
    test_type = str(doc.get("test_type", "")).lower()
    if "test method" in test_type or "測試方法" in test_type:
        return "test_method"
    return "standard"


def infer_document_strength(document_type: str) -> str:
    return {
        "guidance": "guidance",
        "test_method": "test_method",
        "standard": "standard",
    }.get(document_type, "standard")


def normalize_value(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        return ", ".join(normalize_value(v) for v in value if normalize_value(v))
    if isinstance(value, dict):
        parts: list[str] = []
        for k, v in value.items():
            rendered = normalize_value(v)
            if rendered:
                parts.append(f"{k}: {rendered}")
        return "; ".join(parts)
    return str(value).strip()


def summarize_conditions(conditions: Any, limit: int = 4) -> str:
    if not isinstance(conditions, dict):
        return normalize_value(conditions)
    parts: list[str] = []
    for idx, (key, value) in enumerate(conditions.items()):
        if idx >= limit:
            break
        rendered = normalize_value(value)
        if rendered:
            pretty_key = key.replace("_", " ")
            parts.append(f"{pretty_key}: {rendered}")
    return " | ".join(parts)


def summarize_evaluation(item: dict[str, Any], document_type: str) -> str:
    if document_type == "guidance":
        return normalize_value(item.get("evaluation_basis"))
    criteria = item.get("criteria", {}) or {}
    description = normalize_value(criteria.get("description"))
    if description:
        return description
    pass_conditions = criteria.get("pass_conditions")
    if pass_conditions:
        return normalize_value(pass_conditions)
    return ""


def build_row(doc: dict[str, Any], item: dict[str, Any], document_type: str, source_path: Path) -> dict[str, Any]:
    if document_type == "guidance":
        item_id = item.get("item_id") or item.get("recommendation_id")
        item_name_zh = item.get("item_name_zh", "")
        item_name_en = item.get("item_name_en", "")
        test_objects = item.get("test_objects") or item.get("target_assembly_level") or []
        conditions = item.get("conditions_summary") or summarize_conditions(item.get("suggested_conditions"))
    else:
        item_id = item.get("item_id") or item.get("test_id")
        item_name_zh = item.get("item_name_zh") or item.get("test_name_zh", "")
        item_name_en = item.get("item_name_en") or item.get("test_name_en", "")
        test_objects = item.get("test_objects") or []
        conditions = item.get("conditions_summary") or summarize_conditions(item.get("conditions"))

    return {
        "document_id": doc.get("standard_id"),
        "document_name": doc.get("full_name"),
        "document_short_name": doc.get("standard_id"),
        "document_type": document_type,
        "document_strength": infer_document_strength(document_type),
        "publisher": doc.get("publisher"),
        "publication_date": doc.get("publication_date"),
        "batch": source_path.parts[-3],
        "source_file": doc.get("filename"),
        "source_json": str(source_path.relative_to(ROOT)),
        "item_id": item_id,
        "item_name_zh": item_name_zh,
        "item_name_en": item_name_en,
        "section": item.get("section", ""),
        "test_objects": test_objects,
        "conditions_summary": conditions,
        "evaluation_summary": summarize_evaluation(item, document_type),
        "comparison_ready": True,
        "normativity": doc.get("normativity", "normative" if document_type != "guidance" else "recommended_practice"),
    }


def build_catalog_entry(doc: dict[str, Any], rows: list[dict[str, Any]], source_path: Path) -> dict[str, Any]:
    document_type = infer_document_type(doc)
    available_objects = sorted({obj for row in rows for obj in row.get("test_objects", [])})
    return {
        "document_id": doc.get("standard_id"),
        "document_type": document_type,
        "document_strength": infer_document_strength(document_type),
        "comparison_ready": True,
        "display_name": doc.get("standard_id"),
        "full_name": doc.get("full_name"),
        "publisher": doc.get("publisher"),
        "publication_date": doc.get("publication_date"),
        "filename": doc.get("filename"),
        "source_json": str(source_path.relative_to(ROOT)),
        "batch": source_path.parts[-3],
        "li_applicable": doc.get("li_applicable"),
        "item_count": len(rows),
        "available_objects": available_objects,
        "test_type": doc.get("test_type"),
        "normativity": doc.get("normativity", "normative" if document_type != "guidance" else "recommended_practice"),
        "important_note": doc.get("important_note"),
    }


def main() -> None:
    content_files = sorted(DATA_DIR.glob(CONTENT_GLOB))
    catalog: list[dict[str, Any]] = []
    rows: list[dict[str, Any]] = []

    for path in content_files:
        doc = load_json(path)
        document_type = infer_document_type(doc)
        source_items = doc.get("comparison_items") if doc.get("comparison_items") else doc.get("tests", [])
        doc_rows = [build_row(doc, item, document_type, path) for item in source_items]
        rows.extend(doc_rows)
        catalog.append(build_catalog_entry(doc, doc_rows, path))

    catalog.sort(key=lambda x: (x["document_type"], x["display_name"]))
    rows.sort(key=lambda x: (x["document_id"], x["item_id"] or ""))

    CATALOG_PATH.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    ROWS_PATH.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Built {len(catalog)} catalog entries -> {CATALOG_PATH}")
    print(f"Built {len(rows)} comparison rows -> {ROWS_PATH}")


if __name__ == "__main__":
    main()
