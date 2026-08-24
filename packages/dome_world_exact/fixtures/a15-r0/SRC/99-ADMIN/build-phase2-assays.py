#!/usr/bin/env python3
"""Build conservative Phase 2 analytical interfaces from witnessed records.

The builder is intentionally allergic to completion-by-inference.  It converts
existing source assertions and archive observations into queryable interfaces;
model- or researcher-proposed ideas remain candidates until a source span and
human disposition exist.
"""

from __future__ import annotations

import argparse
import collections
import hashlib
import json
import re
import sqlite3
from pathlib import Path
from typing import Any, Iterable


def rows(path: Path) -> list[dict[str, Any]]:
    if not path.is_file():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8-sig").splitlines() if line.strip()]


def write_rows(path: Path, values: Iterable[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    materialized = list(values)
    path.write_text(
        "".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in materialized),
        encoding="utf-8",
    )


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def sid(prefix: str, *parts: Any) -> str:
    raw = "\x1f".join(str(part) for part in parts)
    return f"{prefix}:{hashlib.sha256(raw.encode()).hexdigest()[:24]}"


def snapshot_id(root: Path) -> str:
    db_path = root / "07-ARCHIVE-LEDGER/phase2/state.sqlite3"
    if db_path.is_file():
        db = sqlite3.connect(db_path)
        row = db.execute("SELECT value FROM meta WHERE key='atelier_snapshot_id'").fetchone()
        db.close()
        if row:
            return row[0]
    return "UNSEALED_WORKING_STATE"


def common(row: dict[str, Any], snapshot: str) -> dict[str, Any]:
    return {
        "atelier_snapshot_id": snapshot,
        "seal_epoch_binding": "RESOLVE_MATCHED_CURRENT_SEAL",
        "source_status": row.get("origin", "ARCHIVE_OBSERVATION").upper().replace("-", "_"),
        "observation_status": row.get("adjudication_status") or row.get("status") or "OBSERVED",
    }


def expected_objects(root: Path, snapshot: str) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    ordinals = rows(root / "05-OPERATIONS/relations/ordinal-series-observations.jsonl")
    for series in ordinals:
        stages = series.get("stages", [])
        witnessed = sorted({int(stage["ordinal"]) for stage in stages if isinstance(stage.get("ordinal"), int)})
        if not witnessed:
            continue
        for ordinal in range(1, max(witnessed) + 1):
            if ordinal not in witnessed:
                expected_id = sid("src-expected-object", series.get("series_namespace_id"), ordinal)
                out.append({
                    "schema_version": "expected-object-observation/v1",
                    "expected_object_id": expected_id,
                    "series_namespace_id": series.get("series_namespace_id"),
                    "expected_ordinal": ordinal,
                    "state": "OPEN_UNRESOLVED",
                    "predecessor_expected": True,
                    "resolver_ids": [],
                    "evidence_ids": series.get("evidence_ids", []),
                    "interpretive_limit": "A gap inside a witnessed bounded ordinal range; no missing work is invented.",
                    **common(series, snapshot),
                })
    for unresolved in rows(root / "01-MANIFESTS/phase2/unresolved-priority-objects.jsonl"):
        label = unresolved.get("unresolved_id") or unresolved.get("target_id") or unresolved.get("label") or json.dumps(unresolved, sort_keys=True)
        out.append({
            "schema_version": "expected-object-observation/v1",
            "expected_object_id": sid("src-expected-object", label),
            "series_namespace_id": unresolved.get("series_namespace_id"),
            "expected_ordinal": unresolved.get("ordinal"),
            "state": "OPEN_UNRESOLVED",
            "predecessor_expected": bool(unresolved.get("predecessor_expected")),
            "resolver_ids": [],
            "evidence_ids": unresolved.get("evidence_ids", []),
            "source_record": unresolved,
            "interpretive_limit": "Unresolved Phase 1.5 acquisition object; no target completion by title resemblance.",
            **common(unresolved, snapshot),
        })
    return sorted(out, key=lambda x: x["expected_object_id"])


def contextual_roles_and_compilers(root: Path, snapshot: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    roles: list[dict[str, Any]] = []
    by_compiler: dict[str, list[dict[str, Any]]] = collections.defaultdict(list)
    source_rows = rows(root / "05-OPERATIONS/relations/recompilation-edges.jsonl")
    for edge in source_rows:
        compiler = edge.get("compiled_into_id") or edge.get("declared_by_id")
        subject = edge.get("from_id")
        if not compiler or not subject:
            continue
        role = edge.get("relation") or "UNRESOLVED_ROLE"
        item = {
            "schema_version": "contextual-role-assertion/v1",
            "contextual_role_assertion_id": sid("src-contextual-role", subject, compiler, role, edge.get("edge_id")),
            "subject_id": subject,
            "architecture_id": compiler,
            "scope": edge.get("scope", {}),
            "asserted_at": edge.get("source_time"),
            "role_raw": edge.get("source_predicate_raw"),
            "role_normalized": role,
            "relation_provenance_mode": edge.get("relation_provenance_mode"),
            "evidence_ids": edge.get("evidence_ids", []),
            "adjudication_status": edge.get("adjudication_status", "UNRESOLVED"),
            "interpretive_limit": "Role belongs to this compiler/scope/time context; it is not intrinsic to the work.",
            **common(edge, snapshot),
        }
        roles.append(item)
        by_compiler[compiler].append(item)
    for candidate in rows(root / "05-OPERATIONS/relations/compiler-input-candidates.jsonl"):
        compiler = candidate.get("compiler_id")
        if not compiler:
            # The source candidate remains in its canonical registry as an
            # unresolved compiler target; an analytical hyperedge cannot be
            # keyed until that target is witnessed.
            continue
        for slot in candidate.get("input_slots", []):
            for subject in slot.get("candidate_ids", []):
                item = {
                    "schema_version": "contextual-role-assertion/v1",
                    "contextual_role_assertion_id": sid("src-contextual-role", subject, compiler, slot.get("slot"), candidate.get("compiler_candidate_id")),
                    "subject_id": subject,
                    "architecture_id": compiler,
                    "scope": {"slot": slot.get("slot")},
                    "asserted_at": None,
                    "role_raw": candidate.get("source_predicate_raw"),
                    "role_normalized": "CANDIDATE_INPUT",
                    "relation_provenance_mode": candidate.get("relation_provenance_mode"),
                    "evidence_ids": candidate.get("evidence_ids", []),
                    "adjudication_status": slot.get("resolution", "UNRESOLVED"),
                    "interpretive_limit": candidate.get("interpretive_limit"),
                    **common(candidate, snapshot),
                }
                roles.append(item)
                by_compiler[compiler].append(item)
    passes = []
    for compiler, inputs in sorted(by_compiler.items()):
        passes.append({
            "schema_version": "compilation-pass/v1",
            "compilation_pass_id": sid("src-compilation-pass", compiler, *(sorted(x["contextual_role_assertion_id"] for x in inputs))),
            "compiler_id": compiler,
            "build_target_id": compiler,
            "input_role_assertion_ids": sorted(x["contextual_role_assertion_id"] for x in inputs),
            "input_ids": sorted({x["subject_id"] for x in inputs}),
            "contextual_role_count": len(inputs),
            "compiler_status": "WITNESSED_OR_CANDIDATE_AS_RECORDED_PER_INPUT",
            "interpretive_limit": "A compiler grouping preserves each input's own provenance and adjudication state.",
            "atelier_snapshot_id": snapshot,
            "seal_epoch_binding": "RESOLVE_MATCHED_CURRENT_SEAL",
            "source_status": "MIXED_SOURCE_AND_ARCHIVE_OBSERVATION",
            "observation_status": "BOUNDED_COMPILATION_VIEW",
        })
    return sorted(roles, key=lambda x: x["contextual_role_assertion_id"]), passes


def evidence_interfaces(root: Path, snapshot: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    derivative_rows = rows(root / "01-MANIFESTS/phase2/derivative-v1.jsonl")
    units = []
    grouped: dict[str, list[dict[str, Any]]] = collections.defaultdict(list)
    for derivative in derivative_rows:
        parameters = derivative.get("parameters") or {}
        body_hash = parameters.get("body_text_sha256") or derivative.get("output_sha256")
        unit_id = sid("src-evidence-unit", body_hash, derivative.get("derivative_id"))
        item = {
            "schema_version": "evidence-unit-fingerprint/v1",
            "evidence_unit_id": unit_id,
            "derivative_id": derivative.get("derivative_id"),
            "capture_id": derivative.get("capture_id"),
            "body_text_sha256": body_hash,
            "fingerprints": {
                "dataset": "UNRESOLVED",
                "method": "UNRESOLVED",
                "cases": "UNRESOLVED",
                "metrics": "UNRESOLVED",
                "sample": "UNRESOLVED",
                "results": "UNRESOLVED",
                "figures": "UNRESOLVED",
                "code": "UNRESOLVED",
            },
            "evidence_claim_ceiling": "A normalized-body fingerprint is not a dataset, method, case, or result-independence determination.",
            "atelier_snapshot_id": snapshot,
            "seal_epoch_binding": "RESOLVE_MATCHED_CURRENT_SEAL",
            "source_status": "ARCHIVE_DERIVATIVE_OBSERVATION",
            "observation_status": "BODY_FINGERPRINTED_DIMENSIONS_UNRESOLVED",
        }
        units.append(item)
        grouped[str(body_hash)].append(item)
    lineage = []
    for body_hash, members in sorted(grouped.items()):
        if len(members) < 2:
            continue
        member_ids = sorted(member["evidence_unit_id"] for member in members)
        lineage.append({
            "schema_version": "evidence-lineage-assertion/v1",
            "evidence_lineage_assertion_id": sid("src-evidence-lineage", body_hash, *member_ids),
            "left_evidence_unit_id": member_ids[0],
            "right_evidence_unit_ids": member_ids[1:],
            "relationship": "IDENTICAL",
            "common_ancestor_evidence_unit_ids": [],
            "independence_basis": ["IDENTICAL_NORMALIZED_BODY_SHA256"],
            "independence_dimensions": {
                "data": "NOT_INDEPENDENT_OR_UNRESOLVED",
                "method": "NOT_INDEPENDENT_OR_UNRESOLVED",
                "cases": "NOT_INDEPENDENT_OR_UNRESOLVED",
                "result_generation": "NOT_INDEPENDENT_OR_UNRESOLVED",
            },
            "unresolved_shared_inputs": ["dataset", "method", "coded_events", "case_set", "upstream_computation"],
            "evidence_ids": [],
            "interpretive_limit": "Identical normalized text prevents an independence claim; it does not prove which manifestation is ancestral.",
            "atelier_snapshot_id": snapshot,
            "seal_epoch_binding": "RESOLVE_MATCHED_CURRENT_SEAL",
            "source_status": "ARCHIVE_DERIVATIVE_OBSERVATION",
            "observation_status": "IDENTICAL_BODY_INDEPENDENCE_NOT_ESTABLISHED",
        })
    return units, lineage


def conservation_and_tomography(root: Path, snapshot: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    conservation = []
    tomography = []
    for lift in rows(root / "05-OPERATIONS/relations/representation-lift-candidates.jsonl"):
        effects = lift.get("claim_effects", {})
        scope = effects.get("scope", "UNKNOWN")
        if scope == "NARROWED":
            outcome = "NARROWED"
        elif scope in {"BROADENED", "EXPANDED"}:
            outcome = "EXPANDED"
        elif effects.get("semantic_core") == "PRESERVED":
            outcome = "PRESERVED"
        else:
            outcome = "UNKNOWN"
        conservation.append({
            "schema_version": "compiler-conservation-observation/v1",
            "compiler_conservation_observation_id": sid("src-conservation", lift.get("transformation_id")),
            "compiler_or_transform_id": lift.get("transformation_id"),
            "input_id": lift.get("from_id"),
            "output_id": lift.get("to_id"),
            "outcome": outcome,
            "dimensions": effects,
            "evidence_ids": lift.get("evidence_ids", []),
            "adjudication_status": lift.get("adjudication_status"),
            "interpretive_limit": lift.get("interpretive_limit"),
            **common(lift, snapshot),
        })
        tomography.append({
            "schema_version": "claim-evidence-tomography/v1",
            "claim_evidence_tomography_id": sid("src-claim-evidence", lift.get("transformation_id")),
            "transformation_id": lift.get("transformation_id"),
            "from_id": lift.get("from_id"),
            "to_id": lift.get("to_id"),
            "delta_evidence": "UNKNOWN",
            "delta_scope": scope,
            "delta_falsifier_granularity": effects.get("falsifiers", "UNKNOWN"),
            "delta_asserted_authority": "UNKNOWN",
            "other_observed_effects": effects,
            "composite_score": None,
            "evidence_ids": lift.get("evidence_ids", []),
            "interpretive_limit": "Dimensions remain separate; formalization is not assumed to increase rigor or restraint.",
            **common(lift, snapshot),
        })
    return conservation, tomography


def authority_jurisdiction(root: Path, snapshot: str) -> list[dict[str, Any]]:
    out = []
    for authority in rows(root / "05-OPERATIONS/authority/authority-assertions.jsonl"):
        dimensions = authority.get("authority", {})
        out.append({
            "schema_version": "authority-jurisdiction-assertion/v1",
            "authority_jurisdiction_assertion_id": sid("src-authority-jurisdiction", authority.get("authority_assertion_id")),
            "source_authority_assertion_id": authority.get("authority_assertion_id"),
            "declarer": authority.get("declared_by"),
            "subject": authority.get("subject"),
            "scope": authority.get("scope"),
            "asserted_at": authority.get("source_asserted_at"),
            "effective_from": authority.get("effective_from"),
            "G_genealogical": dimensions.get("G_genealogical"),
            "C_canonical": dimensions.get("C_canonical"),
            "E_empirical": dimensions.get("E_empirical"),
            "F_field_defining": dimensions.get("F_field_defining"),
            "K_controlling": dimensions.get("K_controlling"),
            "control_resolution_rule": "CURRENT_CONTROLS_OR_SUPERSEDES_SCOPE_REQUIRED",
            "evidence_ids": authority.get("evidence_ids", []),
            "interpretive_limit": authority.get("interpretive_limit"),
            **common(authority, snapshot),
        })
    return sorted(out, key=lambda x: x["authority_jurisdiction_assertion_id"])


def references(root: Path, snapshot: str) -> list[dict[str, Any]]:
    derivative_rows = rows(root / "01-MANIFESTS/phase2/derivative-v1.jsonl")
    found = []
    doi_pattern = re.compile(r"\b10\.\d{4,9}/[-._;()/:A-Z0-9]+", re.I)
    for derivative in derivative_rows:
        path = root / str(derivative.get("local_path", ""))
        if not path.is_file() or path.suffix.lower() not in {".md", ".txt", ".json"}:
            continue
        for paragraph, text in enumerate(path.read_text(encoding="utf-8", errors="replace").split("\n\n"), 1):
            for match in doi_pattern.finditer(text):
                doi = match.group(0).rstrip(".,;:)")
                found.append({
                    "schema_version": "reference-assertion/v1",
                    "reference_assertion_id": sid("src-reference", derivative.get("derivative_id"), paragraph, doi),
                    "source_derivative_id": derivative.get("derivative_id"),
                    "source_capture_id": derivative.get("capture_id"),
                    "source_span": {"paragraph": paragraph, "start_character": match.start(), "end_character": match.end()},
                    "cited_doi_raw": doi,
                    "source_bibliography_graph_status": "WITNESSED_LITERAL_DOI",
                    "semantic_body_graph_status": "UNRESOLVED",
                    "archive_reconstructed_graph_status": "UNRESOLVED",
                    "repair_applied": False,
                    "interpretive_limit": "A literal DOI occurrence is preserved; title, target identity, and semantic lineage remain unresolved.",
                    "atelier_snapshot_id": snapshot,
                    "seal_epoch_binding": "RESOLVE_MATCHED_CURRENT_SEAL",
                    "source_status": "DERIVATIVE_SOURCE_SPAN",
                    "observation_status": "REFERENCE_LITERAL_WITNESSED_TARGET_UNRESOLVED",
                })
    return sorted(found, key=lambda x: x["reference_assertion_id"])


def map_speech_acts(root: Path, snapshot: str) -> list[dict[str, Any]]:
    authority = rows(root / "05-OPERATIONS/authority/authority-assertions.jsonl")
    by_subject = collections.defaultdict(list)
    for item in authority:
        by_subject[item.get("subject", {}).get("id")].append(item)
    out = []
    for map_row in rows(root / "05-OPERATIONS/maps/canon-map-snapshots.jsonl"):
        manifestation = map_row.get("map_manifestation_id")
        linked = by_subject.get(manifestation, [])
        prescriptive = any(
            item.get("authority", {}).get("K_controlling", {}).get("state") == "CONTROLLING"
            and item.get("authority", {}).get("K_controlling", {}).get("source_status_raw")
            for item in linked
        )
        out.append({
            "schema_version": "canon-map-speech-act/v1",
            "canon_map_speech_act_id": sid("src-canon-map-speech-act", map_row.get("snapshot_id")),
            "canon_map_snapshot_id": map_row.get("snapshot_id"),
            "manifestation_id": manifestation,
            "classification": "HYBRID" if prescriptive else "UNRESOLVED",
            "clause_level_body_review": "PENDING" if map_row.get("enumeration_completeness") != "FULL_BODY" else "AVAILABLE",
            "authority_assertion_ids": [item.get("authority_assertion_id") for item in linked],
            "evidence_ids": map_row.get("evidence_ids", []),
            "interpretive_limit": "A constitution is not tested as a census; descriptive and prescriptive clauses remain separable.",
            "atelier_snapshot_id": snapshot,
            "seal_epoch_binding": "RESOLVE_MATCHED_CURRENT_SEAL",
            "source_status": "SOURCE_SELF_MODEL_PLUS_AUTHORITY_OBSERVATION",
            "observation_status": "BOUNDED_SPEECH_ACT_CLASSIFICATION",
        })
    return out


def publishing_regime(root: Path, snapshot: str) -> list[dict[str, Any]]:
    monthly: dict[str, collections.Counter[str]] = collections.defaultdict(collections.Counter)
    for edge in rows(root / "05-OPERATIONS/relations/typed-edges.jsonl"):
        date = str(edge.get("source_time") or "")[:7]
        if re.fullmatch(r"\d{4}-\d{2}", date):
            monthly[date][str(edge.get("relation") or "UNRESOLVED")] += 1
    return [{
        "schema_version": "publishing-regime-observation/v1",
        "publishing_regime_observation_id": sid("src-publishing-regime", month),
        "month": month,
        "work_deduplicated": False,
        "relation_type_counts": dict(sorted(counts.items())),
        "change_point_status": "EXPLORATORY_ONLY_THRESHOLDS_NOT_RUN",
        "required_confirmatory_thresholds": {
            "resolved_works_per_segment": 20,
            "cross_surface_pairs": 10,
            "bootstrap_recurrence": "80_PERCENT_WITHIN_PLUS_MINUS_14_DAYS",
            "held_out_or_delta_bic": "HELD_OUT_IMPROVEMENT_OR_DELTA_BIC_GTE_10",
        },
        "interpretive_limit": "Monthly edge counts are a coverage diagnostic, not a publishing-regime claim.",
        "atelier_snapshot_id": snapshot,
        "seal_epoch_binding": "RESOLVE_MATCHED_CURRENT_SEAL",
        "source_status": "ARCHIVE_EDGE_OBSERVATION",
        "observation_status": "EXPLORATORY_COVERAGE_ONLY",
    } for month, counts in sorted(monthly.items())]


def capture_repetitions(root: Path, snapshot: str) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Preserve repeated contextual observations without inventing source mutation.

    A bounded runner-recovery event briefly produced overlapping resolver workers.
    The blob store remained content-addressed and the target table retained one
    current capture pointer.  All capture events remain evidence, so this
    registry makes repetition explicit instead of deleting or silently merging
    observations.
    """
    db_path = root / "07-ARCHIVE-LEDGER/phase2/state.sqlite3"
    if not db_path.is_file():
        return [], {
            "schema_version": "src-concurrency-recovery-receipt/v1",
            "atelier_snapshot_id": snapshot,
            "status": "SQLITE_WORK_JOURNAL_UNAVAILABLE_IN_PROJECTION",
            "repeated_target_count": 0,
            "interpretive_limit": "Portable projections retain the exported registry; SQLite is not a query authority.",
        }
    db = sqlite3.connect(f"file:{db_path.as_posix()}?mode=ro", uri=True)
    db.row_factory = sqlite3.Row
    current = {
        row["target_id"]: row["capture_id"]
        for row in db.execute("SELECT target_id,capture_id FROM targets WHERE capture_id IS NOT NULL")
    }
    repeated = db.execute(
        """SELECT target_id FROM captures GROUP BY target_id HAVING count(*) > 1 ORDER BY target_id"""
    ).fetchall()
    observations: list[dict[str, Any]] = []
    for repeated_row in repeated:
        target_id = repeated_row["target_id"]
        members = []
        blob_hashes: set[str] = set()
        methods: set[str] = set()
        for row in db.execute(
            """SELECT c.capture_id,c.captured_at,c.request_url,c.final_url,c.status_code,
                      c.headers_json,c.redirects_json,c.byte_length,c.contextual_sha256,
                      b.blob_id,b.sha256 AS blob_sha256
                 FROM captures c JOIN blobs b ON b.blob_id=c.blob_id
                WHERE c.target_id=? ORDER BY c.captured_at,c.capture_id""",
            (target_id,),
        ):
            headers = json.loads(row["headers_json"])
            method = headers.get("x-src-request-method") or "UNRECORDED_LEGACY_METHOD"
            blob_hashes.add(row["blob_sha256"])
            methods.add(method)
            members.append({
                "capture_id": row["capture_id"],
                "captured_at": row["captured_at"],
                "request_method": method,
                "request_url": row["request_url"],
                "final_url": row["final_url"],
                "status_code": row["status_code"],
                "redirect_chain": json.loads(row["redirects_json"]),
                "blob_id": row["blob_id"],
                "blob_sha256": row["blob_sha256"],
                "byte_length": row["byte_length"],
                "contextual_sha256": row["contextual_sha256"],
                "is_current_target_pointer": row["capture_id"] == current.get(target_id),
            })
        if len(blob_hashes) == 1:
            classification = "SAME_BYTES_REPEATED_OBSERVATION"
        else:
            classification = "METHOD_CHANGE_OR_SOURCE_STATE_DIFFERENCE_REQUIRES_ADJUDICATION"
        observations.append({
            "schema_version": "capture-repetition-observation/v1",
            "capture_repetition_observation_id": sid("src-capture-repetition", target_id, *(m["capture_id"] for m in members)),
            "target_id": target_id,
            "current_capture_id": current.get(target_id),
            "capture_count": len(members),
            "distinct_blob_sha256_count": len(blob_hashes),
            "request_methods": sorted(methods),
            "classification": classification,
            "captures": members,
            "cause_context": "A bounded runner-recovery event briefly overlapped resolver workers; repetition is preserved as contextual observation evidence.",
            "source_mutation_established": False,
            "interpretive_limit": "Repeated observations do not establish source mutation. Different hashes require method/body/source-state adjudication; no event is deleted or repaired.",
            "atelier_snapshot_id": snapshot,
            "seal_epoch_binding": "RESOLVE_MATCHED_CURRENT_SEAL",
            "source_status": "ARCHIVE_RUNNER_OBSERVATION",
            "observation_status": "RECOVERY_REPETITION_EXPLICITLY_PRESERVED",
        })
    db.close()
    counts = collections.Counter(item["classification"] for item in observations)
    receipt = {
        "schema_version": "src-concurrency-recovery-receipt/v1",
        "atelier_snapshot_id": snapshot,
        "status": "RECOVERED_WITHOUT_EVENT_DELETION",
        "repeated_target_count": len(observations),
        "classification_counts": dict(sorted(counts.items())),
        "current_pointer_rule": "targets.capture_id identifies the current target observation; every contextual capture remains append-only evidence",
        "source_mutation_established": False,
        "registry_path": "05-OPERATIONS/phase2/capture-repetition-observations.jsonl",
        "interpretive_limit": "Concurrency recovery explains why repetition was inspected; it does not explain any source-byte difference. Those remain unresolved for adjudication.",
    }
    return observations, receipt


def noncollapse(root: Path, snapshot: str, outputs: dict[str, list[dict[str, Any]]]) -> dict[str, Any]:
    id_fields = {
        "work": {row.get("entity_id") for row in rows(root / "01-MANIFESTS/entity-index.jsonl") if row.get("entity_type") == "work"},
        "evidence": {row.get("evidence_unit_id") for row in outputs["evidence-unit-fingerprints"]},
        "representation": {row.get("family_id") or row.get("representation_family_id") for row in rows(root / "05-OPERATIONS/relations/representation-families.jsonl")},
        "authority": {row.get("authority_jurisdiction_assertion_id") for row in outputs["authority-jurisdiction-assertions"]},
    }
    id_fields = {name: {value for value in values if value} for name, values in id_fields.items()}
    overlaps = []
    keys = list(id_fields)
    for index, left in enumerate(keys):
        for right in keys[index + 1:]:
            intersection = sorted(id_fields[left] & id_fields[right])
            if intersection:
                overlaps.append({"left": left, "right": right, "ids": intersection})
    return {
        "schema_version": "non-collapse-audit/v1",
        "atelier_snapshot_id": snapshot,
        "seal_epoch_binding": "RESOLVE_MATCHED_CURRENT_SEAL",
        "invariant": "work multiplicity != evidence multiplicity != representation multiplicity != authority multiplicity",
        "registry_counts": {name: len(values) for name, values in id_fields.items()},
        "namespace_collisions": overlaps,
        "latest_wins_rule_present": False,
        "cross_graph_join_default": False,
        "result": "PASS" if not overlaps else "FAIL_NAMESPACE_COLLISION",
        "claim_ceiling": "Registry separation prevents silent identity collapse; numeric counts may coincidentally match without implying equivalence.",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.root.resolve()
    snapshot = snapshot_id(root)
    roles, compilers = contextual_roles_and_compilers(root, snapshot)
    evidence_units, evidence_lineage = evidence_interfaces(root, snapshot)
    conservation, tomography = conservation_and_tomography(root, snapshot)
    repetition_observations, recovery_receipt = capture_repetitions(root, snapshot)
    outputs = {
        "expected-object-observations": expected_objects(root, snapshot),
        "contextual-role-assertions": roles,
        "compilation-passes": compilers,
        "evidence-unit-fingerprints": evidence_units,
        "evidence-lineage-assertions": evidence_lineage,
        "compiler-conservation-observations": conservation,
        "authority-jurisdiction-assertions": authority_jurisdiction(root, snapshot),
        "claim-evidence-tomography": tomography,
        "reference-assertions": references(root, snapshot),
        "canon-map-speech-acts": map_speech_acts(root, snapshot),
        "publishing-regime-observations": publishing_regime(root, snapshot),
        "capture-repetition-observations": repetition_observations,
    }
    operation_root = root / "05-OPERATIONS/phase2"
    for name, values in outputs.items():
        write_rows(operation_root / f"{name}.jsonl", values)
    audit = noncollapse(root, snapshot, outputs)
    write_json(root / "04-RECEIPTS/assays/2026-08-24-phase2-kiln/non-collapse-audit.json", audit)
    write_json(root / "04-RECEIPTS/phase2/concurrency-recovery.json", recovery_receipt)
    print(json.dumps({name: len(values) for name, values in outputs.items()}, indent=2, sort_keys=True))
    return 0 if audit["result"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
