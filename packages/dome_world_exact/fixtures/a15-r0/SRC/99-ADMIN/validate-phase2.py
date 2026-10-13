#!/usr/bin/env python3
"""Deterministic Phase 2 contract validator.

This validator is additive.  It deliberately does not import or modify either
sealed Phase 1.5 validator.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import sys
from pathlib import Path


TERMINAL = {
    "VERIFIED_CAPTURE",
    "ALREADY_CURRENT",
    "PARTIAL",
    "AUTH_REQUIRED",
    "RATE_LIMITED",
    "UNAVAILABLE",
    "RIGHTS_BLOCKED",
    "RETRYABLE_FAILURE",
    "UNKNOWN",
}

REQUIRED_INTERFACES = {
    "capture",
    "blob",
    "derivative",
    "version-observation",
    "rights-decision",
    "expected-object-observation",
    "contextual-role-assertion",
    "compilation-pass",
    "evidence-unit-fingerprint",
    "evidence-lineage-assertion",
    "compiler-conservation-observation",
    "authority-jurisdiction-assertion",
    "claim-evidence-tomography",
    "reference-assertion",
    "canon-map-speech-act",
    "publishing-regime-observation",
    "capture-repetition-observation",
    "non-collapse-audit",
}

REQUIRED_AIA_ROUTES = {"EXPERIENTIAL", "CUSTODIAL", "AUDIT", "IMPLEMENTATION"}
REQUIRED_INVARIANTS = {
    "provenance",
    "missingness",
    "contradictions",
    "causal_structure",
    "claim_ceiling",
    "station_ownership",
    "authorized_actions",
    "source_status",
    "observation_status",
}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def read_jsonl(path: Path):
    rows = []
    for number, line in enumerate(path.read_text(encoding="utf-8-sig").splitlines(), 1):
        if line.strip():
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError as exc:
                raise ValueError(f"{path}:{number}: {exc}") from exc
    return rows


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--allow-unsealed", action="store_true")
    args = parser.parse_args()
    root = args.root.resolve()
    errors: list[str] = []
    observations: list[str] = []

    def require(condition: bool, message: str) -> None:
        if not condition:
            errors.append(message)

    # All portable JSON and JSONL must parse independently of SQLite.
    for path in sorted(root.rglob("*.json")):
        if ".staging" not in path.parts:
            try:
                read_json(path)
            except Exception as exc:  # precise path matters more than exception class
                errors.append(f"invalid JSON {path.relative_to(root)}: {exc}")
    for path in sorted(root.rglob("*.jsonl")):
        if ".staging" not in path.parts:
            try:
                read_jsonl(path)
            except Exception as exc:
                errors.append(f"invalid JSONL {path.relative_to(root)}: {exc}")

    interface_path = root / "01-MANIFESTS/phase2/interface-registry.json"
    require(interface_path.is_file(), "missing interface registry")
    if interface_path.is_file():
        interface = read_json(interface_path)
        named = {item.get("name") for item in interface.get("interfaces", [])}
        require(REQUIRED_INTERFACES <= named, f"missing interfaces: {sorted(REQUIRED_INTERFACES - named)}")
        require(
            interface.get("master_invariant")
            == "work multiplicity != evidence multiplicity != representation multiplicity != authority multiplicity",
            "master non-collapse invariant changed",
        )
        for item in interface.get("interfaces", []):
            require((root / item["path"]).is_file(), f"interface target missing: {item['path']}")

    aia_path = root / "aia/surface-declaration.json"
    require(aia_path.is_file(), "missing AIA surface declaration")
    if aia_path.is_file():
        aia = read_json(aia_path)
        require(set(aia.get("routes", [])) == REQUIRED_AIA_ROUTES, "AIA routes changed or collapsed")
        require(aia.get("route_selection") == "EXPLICIT_OPERATOR_SELECTION_ONLY", "AIA route inference boundary changed")
        require(aia.get("route_inference_forbidden") is True, "AIA route inference must remain forbidden")
        require(aia.get("fabricated_decoys") is False, "fabricated AIA decoys are forbidden")
        require(set(aia.get("governed_invariants", [])) == REQUIRED_INVARIANTS, "AIA invariant family changed")
        require(aia.get("authority", {}).get("transfer") is False, "AIA authority transfer enabled")
        require(aia.get("authority", {}).get("human_closure_required") is True, "human closure removed")
        projections = aia.get("projections", {})
        require(set(projections) == REQUIRED_AIA_ROUTES, "AIA projection family does not match route family")
        projection_signatures = {(v.get("purpose"), v.get("authority")) for v in projections.values()}
        require(len(projection_signatures) == 4, "AIA projections are not pairwise non-equivalent")

    connector_path = root / "99-ADMIN/projection-overlays/CONNECTOR_ENTRY.md"
    if not connector_path.is_file():
        connector_path = root / "CONNECTOR_ENTRY.md"
    connector = connector_path.read_text(encoding="utf-8-sig")
    for token in ("atelier_snapshot_id", "seal_id", "CURRENT_CONTROLS", "SUPERSEDES_SCOPE"):
        require(token in connector, f"connector contract missing {token}")
    require("newest" in connector.lower() and "controlling" in connector.lower(), "connector lacks newest/control non-collapse rule")
    require("cross-epoch" in connector.lower(), "connector lacks explicit cross-epoch rule")

    evidence_schema = read_json(root / "01-MANIFESTS/schemas/evidence-lineage-assertion-v1.schema.json")
    evidence_properties = set(evidence_schema.get("properties", {}))
    for field in (
        "common_ancestor_evidence_unit_ids",
        "independence_basis",
        "independence_dimensions",
        "unresolved_shared_inputs",
    ):
        require(field in evidence_properties, f"evidence lineage schema missing {field}")

    db_path = root / "07-ARCHIVE-LEDGER/phase2/state.sqlite3"
    if db_path.is_file():
        db = sqlite3.connect(f"file:{db_path.as_posix()}?mode=ro", uri=True)
        db.row_factory = sqlite3.Row
        outcome_rows = db.execute("SELECT platform,state,count(*) AS n FROM targets GROUP BY platform,state").fetchall()
        outcomes = {(r["platform"], r["state"]): r["n"] for r in outcome_rows}
        nonterminal = db.execute(
            "SELECT count(*) FROM targets WHERE state NOT IN ({})".format(",".join("?" for _ in TERMINAL)),
            tuple(TERMINAL),
        ).fetchone()[0]
        require(nonterminal == 0, f"{nonterminal} acquisition targets remain nonterminal")
        require(sum(n for (platform, _), n in outcomes.items() if platform == "zenodo") == 884, "Zenodo baseline must contain 884 file/metadata targets")
        require(sum(n for (platform, _), n in outcomes.items() if platform == "academia") >= 499, "Academia baseline incomplete")
        require(sum(n for (platform, _), n in outcomes.items() if platform == "substack") >= 257, "Substack baseline incomplete")
        require(sum(n for (platform, _), n in outcomes.items() if platform == "medium") >= 210, "Medium baseline incomplete")
        require(sum(n for (platform, _), n in outcomes.items() if platform == "doi") == 442, "DOI baseline incomplete")
        orphan_captures = db.execute("SELECT count(*) FROM captures c LEFT JOIN blobs b ON b.blob_id=c.blob_id WHERE b.blob_id IS NULL").fetchone()[0]
        orphan_derivatives = db.execute("SELECT count(*) FROM derivatives d LEFT JOIN captures c ON c.capture_id=d.capture_id WHERE c.capture_id IS NULL").fetchone()[0]
        require(orphan_captures == 0, f"orphan captures: {orphan_captures}")
        require(orphan_derivatives == 0, f"orphan derivatives: {orphan_derivatives}")
        for row in db.execute("SELECT blob_id,local_path,sha256,byte_length FROM blobs"):
            path = root / row["local_path"]
            require(path.is_file(), f"missing blob {row['blob_id']}")
            if path.is_file():
                require(path.stat().st_size == row["byte_length"], f"blob size mismatch {row['blob_id']}")
                require(sha256(path) == row["sha256"], f"blob checksum mismatch {row['blob_id']}")
        for row in db.execute("SELECT derivative_id,local_path,output_sha256 FROM derivatives"):
            path = root / row["local_path"]
            require(path.is_file(), f"missing derivative {row['derivative_id']}")
            if path.is_file():
                require(sha256(path) == row["output_sha256"], f"derivative checksum mismatch {row['derivative_id']}")
        db.close()
    else:
        observations.append("SQLite absent: validating portable projection only")

    current_path = root / "04-RECEIPTS/phase2/current-seal.json"
    if current_path.is_file():
        current = read_json(current_path)
        seal_path = root / current["path"]
        require(seal_path.is_file(), "current seal target missing")
        if seal_path.is_file():
            seal = read_json(seal_path)
            require(seal.get("seal_id") == current.get("seal_id"), "current/seal ID mismatch")
            require(seal.get("atelier_snapshot_id") == current.get("atelier_snapshot_id"), "current/seal snapshot mismatch")
            for entry in seal.get("entries", []):
                path = root / entry["path"]
                require(path.is_file(), f"sealed file missing: {entry['path']}")
                if path.is_file():
                    require(path.stat().st_size == entry["bytes"], f"sealed size mismatch: {entry['path']}")
                    require(sha256(path) == entry["sha256"], f"sealed hash mismatch: {entry['path']}")
    elif not args.allow_unsealed:
        errors.append("Phase 2 current seal is missing")

    result = {
        "schema_version": "src-phase2-validation/v1",
        "status": "FAIL" if errors else "PASS",
        "errors": errors,
        "observations": observations,
    }
    print(json.dumps(result, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
