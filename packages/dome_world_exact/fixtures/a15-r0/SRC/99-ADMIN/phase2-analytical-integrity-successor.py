#!/usr/bin/env python3
"""Append-only analytical-integrity successor for the SRC Phase-2 interfaces.

This module does not rewrite the sealed Phase-2 projection. It audits negative-
state preservation and can emit corrected successor previews to an explicitly
separate directory.
"""
from __future__ import annotations

import argparse
import collections
import hashlib
import json
import re
from pathlib import Path
from typing import Any, Iterable


FORBIDDEN_OUTPUT_SUFFIXES = (
    "05-OPERATIONS/phase2",
    "04-RECEIPTS/phase2",
    "04-RECEIPTS/assays/2026-08-24-phase2-kiln",
)


def rows(path: Path) -> list[dict[str, Any]]:
    if not path.is_file():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8-sig").splitlines() if line.strip()]


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_rows(path: Path, values: Iterable[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        "".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in values),
        encoding="utf-8",
    )


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def sid(prefix: str, *parts: Any) -> str:
    raw = "\x1f".join(str(part) for part in parts)
    return f"{prefix}:{hashlib.sha256(raw.encode('utf-8')).hexdigest()[:24]}"


def query_epoch(root: Path) -> dict[str, str]:
    """Resolve portable query authority rather than optional work-journal state."""
    current_path = root / "04-RECEIPTS/phase2/current-seal.json"
    if current_path.is_file():
        current = read_json(current_path)
        snapshot = current.get("atelier_snapshot_id")
        seal = current.get("seal_id")
        if snapshot and seal:
            return {
                "atelier_snapshot_id": str(snapshot),
                "seal_id": str(seal),
                "basis": "CURRENT_SEAL",
            }
    return {
        "atelier_snapshot_id": "UNSEALED_WORKING_STATE",
        "seal_id": "UNAVAILABLE",
        "basis": "NO_CURRENT_SEAL",
    }


def missing_ordinals(series: dict[str, Any]) -> list[int]:
    witnessed = sorted({
        int(stage["ordinal"])
        for stage in series.get("stages", [])
        if isinstance(stage.get("ordinal"), int)
    })
    if not witnessed:
        return []
    return [ordinal for ordinal in range(1, max(witnessed) + 1) if ordinal not in witnessed]


def successor_expected_objects(root: Path, snapshot: str) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for series in rows(root / "05-OPERATIONS/relations/ordinal-series-observations.jsonl"):
        series_observation_id = series.get("series_observation_id")
        for ordinal in missing_ordinals(series):
            namespace = series.get("series_namespace_id")
            if namespace:
                object_id = sid("src-expected-object", namespace, ordinal)
                identity_scope = "RESOLVED_NAMESPACE"
                identity_basis = {
                    "series_namespace_id": namespace,
                    "expected_ordinal": ordinal,
                }
            else:
                local_basis = series_observation_id or sid(
                    "src-series-observation-local",
                    json.dumps(series, ensure_ascii=False, sort_keys=True),
                )
                object_id = sid(
                    "src-expected-object",
                    "LOCAL_TO_SERIES_OBSERVATION",
                    local_basis,
                    ordinal,
                )
                identity_scope = "SERIES_OBSERVATION_LOCAL"
                identity_basis = {
                    "series_namespace_id": None,
                    "source_series_observation_id": series_observation_id,
                    "expected_ordinal": ordinal,
                }
            observation_id = sid(
                "src-expected-object-observation",
                series_observation_id or object_id,
                ordinal,
                *sorted(str(x) for x in series.get("evidence_ids", [])),
            )
            out.append({
                "schema_version": "expected-object-observation/v2",
                "expected_object_observation_id": observation_id,
                "expected_object_id": object_id,
                "identity_scope": identity_scope,
                "identity_basis": identity_basis,
                "source_series_observation_id": series_observation_id,
                "series_namespace_id": namespace,
                "expected_ordinal": ordinal,
                "state": "OPEN_UNRESOLVED",
                "predecessor_expected": True,
                "resolver_ids": [],
                "evidence_ids": series.get("evidence_ids", []),
                "interpretive_limit": (
                    "A gap inside a witnessed bounded ordinal range; no missing work is invented. "
                    "When the series namespace is unresolved, expected-object identity remains local "
                    "to the source series observation until an explicit namespace bridge is witnessed."
                ),
                "atelier_snapshot_id": snapshot,
                "seal_epoch_binding": "RESOLVE_MATCHED_CURRENT_SEAL",
                "source_status": str(series.get("origin", "ARCHIVE_OBSERVATION")).upper().replace("-", "_"),
                "observation_status": series.get("status") or "OBSERVED",
            })
    for unresolved in rows(root / "01-MANIFESTS/phase2/unresolved-priority-objects.jsonl"):
        label = (
            unresolved.get("unresolved_id")
            or unresolved.get("target_id")
            or unresolved.get("source_target_id")
            or unresolved.get("label")
            or json.dumps(unresolved, sort_keys=True)
        )
        object_id = sid("src-expected-object", label)
        observation_id = sid(
            "src-expected-object-observation",
            label,
            unresolved.get("priority"),
            unresolved.get("reason"),
        )
        out.append({
            "schema_version": "expected-object-observation/v2",
            "expected_object_observation_id": observation_id,
            "expected_object_id": object_id,
            "identity_scope": "EXPLICIT_UNRESOLVED_TARGET",
            "identity_basis": {"source_target_id": label},
            "source_series_observation_id": None,
            "series_namespace_id": unresolved.get("series_namespace_id"),
            "expected_ordinal": unresolved.get("ordinal"),
            "state": "OPEN_UNRESOLVED",
            "predecessor_expected": bool(unresolved.get("predecessor_expected")),
            "resolver_ids": [],
            "evidence_ids": unresolved.get("evidence_ids", []),
            "source_record": unresolved,
            "interpretive_limit": "Unresolved acquisition object; no target completion by title resemblance.",
            "atelier_snapshot_id": snapshot,
            "seal_epoch_binding": "RESOLVE_MATCHED_CURRENT_SEAL",
            "source_status": "ARCHIVE_OBSERVATION",
            "observation_status": unresolved.get("status") or "OPEN_UNRESOLVED",
        })
    return sorted(out, key=lambda x: (x["expected_object_id"], x["expected_object_observation_id"]))


def month_key_next(value: str) -> str:
    year, month = map(int, value.split("-"))
    month += 1
    if month == 13:
        year += 1
        month = 1
    return f"{year:04d}-{month:02d}"


def successor_publishing_regime(root: Path, snapshot: str) -> list[dict[str, Any]]:
    monthly: dict[str, collections.Counter[str]] = collections.defaultdict(collections.Counter)
    parseable_edge_count = 0
    unparseable_source_time_count = 0
    for edge in rows(root / "05-OPERATIONS/relations/typed-edges.jsonl"):
        date = str(edge.get("source_time") or "")[:7]
        if re.fullmatch(r"\d{4}-\d{2}", date):
            monthly[date][str(edge.get("relation") or "UNRESOLVED")] += 1
            parseable_edge_count += 1
        else:
            unparseable_source_time_count += 1
    if not monthly:
        return []
    first = min(monthly)
    last = max(monthly)
    months = []
    cursor = first
    while cursor <= last:
        months.append(cursor)
        cursor = month_key_next(cursor)
    out = []
    for month in months:
        counts = monthly.get(month, collections.Counter())
        edge_count = sum(counts.values())
        out.append({
            "schema_version": "publishing-regime-observation/v2",
            "publishing_regime_observation_id": sid("src-publishing-regime", month),
            "month": month,
            "time_axis_state": (
                "OBSERVED_TYPED_EDGES"
                if edge_count
                else "EXPLICIT_ZERO_TYPED_EDGES_WITHIN_BOUNDED_RANGE"
            ),
            "typed_edge_count": edge_count,
            "work_deduplicated": False,
            "relation_type_counts": dict(sorted(counts.items())),
            "observation_domain": {
                "first_month": first,
                "last_month": last,
                "parseable_typed_edge_count": parseable_edge_count,
                "unparseable_source_time_count": unparseable_source_time_count,
            },
            "change_point_status": "EXPLORATORY_ONLY_THRESHOLDS_NOT_RUN",
            "required_confirmatory_thresholds": {
                "resolved_works_per_segment": 20,
                "cross_surface_pairs": 10,
                "bootstrap_recurrence": "80_PERCENT_WITHIN_PLUS_MINUS_14_DAYS",
                "held_out_or_delta_bic": "HELD_OUT_IMPROVEMENT_OR_DELTA_BIC_GTE_10",
            },
            "interpretive_limit": (
                "Monthly edge counts are a coverage diagnostic, not a publishing-regime claim. "
                "Explicit zero months are preserved separately from months outside the bounded axis "
                "and from edges whose source_time is unparseable."
            ),
            "atelier_snapshot_id": snapshot,
            "seal_epoch_binding": "RESOLVE_MATCHED_CURRENT_SEAL",
            "source_status": "ARCHIVE_EDGE_OBSERVATION",
            "observation_status": "EXPLORATORY_COVERAGE_ONLY",
        })
    return out


def successor_noncollapse(root: Path, snapshot: str, expected_rows: list[dict[str, Any]]) -> dict[str, Any]:
    entity_rows = rows(root / "01-MANIFESTS/entity-index.jsonl")
    work_ids = {
        row.get("entity_id")
        for row in entity_rows
        if str(row.get("entity_kind") or "").upper() == "WORK" and row.get("entity_id")
    }
    evidence_ids = {
        row.get("evidence_unit_id")
        for row in rows(root / "05-OPERATIONS/phase2/evidence-unit-fingerprints.jsonl")
        if row.get("evidence_unit_id")
    }
    representation_ids = {
        row.get("family_id") or row.get("representation_family_id")
        for row in rows(root / "05-OPERATIONS/relations/representation-families.jsonl")
        if row.get("family_id") or row.get("representation_family_id")
    }
    authority_ids = {
        row.get("authority_jurisdiction_assertion_id")
        for row in rows(root / "05-OPERATIONS/phase2/authority-jurisdiction-assertions.jsonl")
        if row.get("authority_jurisdiction_assertion_id")
    }
    id_fields = {
        "work": work_ids,
        "evidence": evidence_ids,
        "representation": representation_ids,
        "authority": authority_ids,
    }
    domain_status = {
        name: ("TESTED_NONEMPTY" if values else "UNTESTED_EMPTY_DOMAIN")
        for name, values in id_fields.items()
    }
    overlaps = []
    names = list(id_fields)
    for index, left in enumerate(names):
        for right in names[index + 1:]:
            if not id_fields[left] or not id_fields[right]:
                continue
            intersection = sorted(id_fields[left] & id_fields[right])
            if intersection:
                overlaps.append({"left": left, "right": right, "ids": intersection})

    observation_ids = [row["expected_object_observation_id"] for row in expected_rows]
    duplicate_observation_ids = sorted({
        value for value, count in collections.Counter(observation_ids).items() if count > 1
    })
    object_basis: dict[str, set[str]] = collections.defaultdict(set)
    for row in expected_rows:
        object_basis[row["expected_object_id"]].add(json.dumps(row.get("identity_basis"), sort_keys=True))
    incompatible_object_aliases = [
        {"expected_object_id": object_id, "identity_bases": sorted(bases)}
        for object_id, bases in sorted(object_basis.items())
        if len(bases) > 1
    ]

    if overlaps or duplicate_observation_ids or incompatible_object_aliases:
        result = "FAIL_ANALYTICAL_IDENTITY_COLLISION"
    elif any(status != "TESTED_NONEMPTY" for status in domain_status.values()):
        result = "PARTIAL_UNTESTED_DIMENSION"
    else:
        result = "PASS"

    return {
        "schema_version": "analytical-non-collapse-audit/v2",
        "atelier_snapshot_id": snapshot,
        "seal_epoch_binding": "RESOLVE_MATCHED_CURRENT_SEAL",
        "invariant": (
            "object identity != observation identity; null != unresolved identity; "
            "zero != missing row; untested domain != passed domain"
        ),
        "registry_counts": {name: len(values) for name, values in id_fields.items()},
        "domain_status": domain_status,
        "cross_namespace_collisions": overlaps,
        "duplicate_expected_object_observation_ids": duplicate_observation_ids,
        "incompatible_expected_object_aliases": incompatible_object_aliases,
        "result": result,
        "claim_ceiling": (
            "This audit tests analytical identity and negative-state preservation. "
            "An empty required domain is reported as untested rather than treated as evidence of separation."
        ),
    }


def legacy_audit(root: Path) -> dict[str, Any]:
    defects = []
    expected = rows(root / "05-OPERATIONS/phase2/expected-object-observations.jsonl")
    grouped: dict[str, list[dict[str, Any]]] = collections.defaultdict(list)
    for row in expected:
        grouped[row.get("expected_object_id")].append(row)
    for object_id, members in sorted(grouped.items()):
        if object_id and len(members) > 1:
            differing_evidence = {
                tuple(sorted(str(x) for x in row.get("evidence_ids", [])))
                for row in members
            }
            defects.append({
                "class": "EXPECTED_OBJECT_OBSERVATION_IDENTITY_AMBIGUITY",
                "expected_object_id": object_id,
                "row_count": len(members),
                "distinct_evidence_sets": len(differing_evidence),
                "claim_ceiling": (
                    "Duplicate object IDs may represent repeated observations of one unresolved object "
                    "or premature aliasing; v1 lacks a separate observation ID and source series observation pointer."
                ),
            })

    regime = rows(root / "05-OPERATIONS/phase2/publishing-regime-observations.jsonl")
    emitted = {
        str(row.get("month"))
        for row in regime
        if re.fullmatch(r"\d{4}-\d{2}", str(row.get("month") or ""))
    }
    edge_months = []
    for edge in rows(root / "05-OPERATIONS/relations/typed-edges.jsonl"):
        month = str(edge.get("source_time") or "")[:7]
        if re.fullmatch(r"\d{4}-\d{2}", month):
            edge_months.append(month)
    missing_zero_months = []
    if edge_months:
        first, last = min(edge_months), max(edge_months)
        cursor = first
        while cursor <= last:
            if cursor not in emitted:
                missing_zero_months.append(cursor)
            cursor = month_key_next(cursor)
    if missing_zero_months:
        defects.append({
            "class": "ZERO_MONTH_AXIS_OMISSION",
            "months": missing_zero_months,
            "claim_ceiling": "An absent monthly row is not equivalent to an explicit zero-event observation.",
        })

    old_audit_path = root / "04-RECEIPTS/assays/2026-08-24-phase2-kiln/non-collapse-audit.json"
    if old_audit_path.is_file():
        old_audit = read_json(old_audit_path)
        work_count = int(old_audit.get("registry_counts", {}).get("work", 0))
        if work_count == 0 and old_audit.get("result") == "PASS":
            defects.append({
                "class": "VACUOUS_WORK_DOMAIN_PASS",
                "work_registry_count": 0,
                "legacy_result": "PASS",
                "claim_ceiling": "No work-domain separation claim can be established from an empty work audit domain.",
            })

    builder_path = root / "99-ADMIN/build-phase2-assays.py"
    if builder_path.is_file():
        builder = builder_path.read_text(encoding="utf-8-sig")
        if 'row.get("entity_type") == "work"' in builder:
            defects.append({
                "class": "WORK_SELECTOR_SCHEMA_MISMATCH",
                "selector": 'entity_type == "work"',
                "entity_index_field": "entity_kind",
                "claim_ceiling": "The legacy non-collapse work selector does not match the entity-index field name.",
            })
        if (
            'db_path = root / "07-ARCHIVE-LEDGER/phase2/state.sqlite3"' in builder
            and 'return "UNSEALED_WORKING_STATE"' in builder
        ):
            current = root / "04-RECEIPTS/phase2/current-seal.json"
            if current.is_file():
                defects.append({
                    "class": "OPTIONAL_JOURNAL_EPOCH_BINDING",
                    "current_seal_present": True,
                    "claim_ceiling": (
                        "The legacy analytical builder can derive epoch identity from optional SQLite availability "
                        "rather than portable current-seal authority."
                    ),
                })
    return {
        "schema_version": "src-analytical-integrity-audit/v1",
        "query_epoch": query_epoch(root),
        "result": "DEFECTS_WITNESSED" if defects else "NO_DEFECTS_WITNESSED",
        "defects": defects,
        "negative_state_invariant": (
            "NULL != UNRESOLVED_IDENTITY != ZERO != MISSING_ROW != EMPTY_TEST_DOMAIN != UNSEALED_EPOCH"
        ),
    }


def safe_output_dir(root: Path, output_dir: Path) -> Path:
    resolved_root = root.resolve()
    resolved = output_dir.resolve()
    try:
        relative = resolved.relative_to(resolved_root).as_posix()
    except ValueError:
        return resolved
    for forbidden in FORBIDDEN_OUTPUT_SUFFIXES:
        if relative == forbidden or relative.startswith(forbidden + "/"):
            raise SystemExit(f"Refusing to write successor preview into sealed/current path: {relative}")
    return resolved


def preview(root: Path, output_dir: Path) -> dict[str, Any]:
    epoch = query_epoch(root)
    snapshot = epoch["atelier_snapshot_id"]
    expected = successor_expected_objects(root, snapshot)
    regime = successor_publishing_regime(root, snapshot)
    audit = successor_noncollapse(root, snapshot, expected)
    output_dir = safe_output_dir(root, output_dir)
    write_rows(output_dir / "expected-object-observations-v2.jsonl", expected)
    write_rows(output_dir / "publishing-regime-observations-v2.jsonl", regime)
    write_json(output_dir / "analytical-non-collapse-audit-v2.json", audit)
    return {
        "query_epoch": epoch,
        "output_dir": str(output_dir),
        "expected_object_observations": len(expected),
        "publishing_regime_months": len(regime),
        "noncollapse_result": audit["result"],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("audit")
    preview_parser = sub.add_parser("preview")
    preview_parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()
    root = args.root.resolve()
    if args.command == "audit":
        result = legacy_audit(root)
        print(json.dumps(result, indent=2, sort_keys=True))
        return 1 if result["result"] == "DEFECTS_WITNESSED" else 0
    result = preview(root, args.output_dir)
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
