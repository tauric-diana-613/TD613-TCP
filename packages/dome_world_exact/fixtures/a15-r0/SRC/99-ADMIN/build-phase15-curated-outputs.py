from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


OBSERVED_AT = "2026-08-24T05:00:00Z"


def read_jsonl(path: Path):
    with path.open("r", encoding="utf-8-sig") as stream:
        for line_no, line in enumerate(stream, 1):
            if line.strip():
                yield line_no, json.loads(line)


def write_jsonl(path: Path, rows):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as stream:
        for row in rows:
            stream.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def write_json(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def axis(state, raw, evidence_ids):
    return {"state": state, "source_status_raw": raw, "evidence_ids": evidence_ids}


def effect(semantic="UNKNOWN", scope="UNKNOWN", causality="UNKNOWN", universality="UNKNOWN", variables="UNKNOWN", falsifiers="UNKNOWN", caveats="UNKNOWN"):
    return {
        "semantic_core": semantic,
        "scope": scope,
        "causality": causality,
        "universality": universality,
        "variables": variables,
        "falsifiers": falsifiers,
        "caveats": caveats,
    }


def relation(edge_id, from_id, predicate, to_id, graph_kind, declared_by_id, raw, origin, mode, source_time, evidence_ids, status="WITNESSED", limit=None, compiled_into_id=None, ordinal=None, route_context=None):
    return {
        "schema_version": "relation-assertion/v2",
        "edge_id": edge_id,
        "from_id": from_id,
        "relation": predicate,
        "to_id": to_id,
        "graph_kind": graph_kind,
        "declared_by_id": declared_by_id,
        "compiled_into_id": compiled_into_id,
        "source_predicate_raw": raw,
        "origin": origin,
        "relation_provenance_mode": mode,
        "source_time": source_time,
        "subject_time": None,
        "scope": {},
        "derived_from_edge_ids": [],
        "route_context": route_context,
        "ordinal": ordinal,
        "evidence_ids": evidence_ids,
        "adjudication_status": status,
        "interpretive_limit": limit,
    }


def transformation(tid, from_id, to_id, kind, declared_by_id, origin, mode, claim_effects, evidence_ids, status="WITNESSED", limit=None, commutation_family_id=None):
    return {
        "schema_version": "transformation-assertion/v1",
        "transformation_id": tid,
        "from_id": from_id,
        "to_id": to_id,
        "transformation_kind": kind,
        "declared_by_id": declared_by_id,
        "origin": origin,
        "relation_provenance_mode": mode,
        "claim_effects": claim_effects,
        "commutation_family_id": commutation_family_id,
        "evidence_ids": evidence_ids,
        "adjudication_status": status,
        "interpretive_limit": limit,
    }


def main(vault: Path, output: Path):
    output.mkdir(parents=True, exist_ok=True)
    candidate_path = vault / "01-MANIFESTS" / "candidate-corpus.jsonl"
    candidate_manifest_sha256 = hashlib.sha256(candidate_path.read_bytes()).hexdigest()
    manifest = {}
    manifest_line = {}
    for line_no, row in read_jsonl(candidate_path):
        item_id = str(row["source_record_id"])
        manifest[item_id] = row
        manifest_line[item_id] = line_no

    substack_path = vault / "01-MANIFESTS" / "platforms" / "substack.jsonl"
    substack = {}
    substack_line = {}
    for line_no, row in read_jsonl(substack_path):
        item_id = str(row["platform_item_id"])
        substack[item_id] = row
        substack_line[item_id] = line_no

    def zevidence(item_id, label, field="description"):
        return {
            "evidence_id": f"sr-evidence:zenodo:{item_id}:{label}",
            "manifestation_id": f"zenodo:{item_id}",
            "source_path": "01-MANIFESTS/candidate-corpus.jsonl",
            "source_locator": {"jsonl_line": manifest_line[item_id], "field": field},
            "source_title": manifest[item_id]["title"],
            "source_publication_at": manifest[item_id].get("publication_date"),
            "source_updated_at": manifest[item_id].get("source_updated"),
            "evidence_kind": "AUTHOR_SUPPLIED_PLATFORM_METADATA",
            "label": label,
            "interpretive_limit": "Metadata-surface evidence does not substitute for a captured full work body.",
        }

    evidence = []
    for item_id, label in [
        ("21960582", "legacy-authority-policy"),
        ("21939955", "field-compiler-and-representation-chain"),
        ("21936716", "ai-field-rigor-and-revision-risk"),
        ("21957890", "inquiry-denominator-and-self-application"),
        ("21612493", "collapse-conceptual-and-revision-risk"),
        ("22049160", "collapse-empirical-companion-and-falsifier"),
        ("22004259", "rejects-universal-amplification"),
        ("21970690", "governance-conflict-resolution"),
        ("19356453", "governance-v1-3"),
        ("19434800", "governance-v1-4"),
        ("21830983", "self-testing-asymmetry"),
        ("22000937", "sis-evidence-ladder"),
        ("22046469", "ceidf-evidence-ladder"),
        ("20616460", "theorem-label-control"),
        ("18737235", "february-canon-map"),
        ("20534171", "june-canon-map"),
        ("22019218", "august-canon-map"),
        ("20674082", "cognitive-inequality-prelude"),
        ("20684103", "cognitive-inequality-theorem"),
        ("20684261", "agentic-substrate"),
        ("20692290", "webmcp-theorem"),
        ("20691934", "morality-law"),
        ("21938702", "post-web-jurisprudence-compiler"),
        ("20383776", "semantic-interpolation-entry"),
        ("20383898", "semantic-interpolation-framework"),
        ("20384827", "semantic-interpolation-theorem"),
        ("20388685", "slow-harm-theorem"),
        ("20436807", "sr-caf-theorem"),
        ("20436955", "sr-caf-conceptual-foundation"),
        ("20090154", "extraction-companion-promise"),
        ("20102186", "forecasting-companion-candidate"),
        ("20462559", "causal-separation-theorem"),
        ("18926742", "world-infrastructure-foundation"),
        ("18926916", "global-instability-applied-counterpart"),
        ("20453363", "substrate-stability-theorem"),
        ("20453621", "substrate-stability-canada-application"),
        ("20481586", "institutional-recoil-theorem"),
        ("20481650", "institutional-recoil-conceptual"),
        ("18776985", "detestable-stage-1"),
        ("18777067", "detestable-stage-2"),
        ("18777144", "detestable-stage-3"),
        ("18777222", "detestable-stage-4"),
        ("18777380", "detestable-stage-5"),
        ("18777439", "detestable-stage-6"),
        ("20209609", "universities-field-paper-ii"),
        ("20210697", "healthcare-field-paper-ii"),
        ("18158616", "quiet-governance-core-input"),
        ("18218135", "grand-unified-harm-compiler"),
        ("18237936", "forensic-authorship-canonical-reference"),
        ("18239086", "codex-seventy-essay-compiler"),
        ("21999553", "algorithm-field-cross-surface-compiler"),
        ("19545817", "unresolved-completes-sequence"),
        ("21185370", "unresolved-companion-set"),
        ("20141992", "systemic-falsifiability"),
        ("18364461", "csr-survival-mechanism"),
        ("18382146", "origin-gravity-precedence"),
        ("18733137", "declared-conceptual-dag"),
        ("18749610", "start-here-router"),
        ("18354721", "institutional-entry-router"),
        ("18795375", "governance-entry-router"),
        ("21286175", "sharingan-navigation"),
        ("21286263", "spt-methodological-foundation"),
        ("18102693", "metadata-downstream-visibility"),
        ("18146890", "representational-systems-shared-reality"),
        ("18147456", "symbolic-harm-representational-environment"),
        ("18571484", "incentives-select-inquiry"),
        ("18733363", "representational-compression"),
        ("18927237", "self-description-divergence"),
        ("19041222", "visibility-representation-detachment"),
        ("19491314", "perception-abstraction-fragmentation"),
        ("20277246", "administrative-representation"),
        ("20299864", "compression-sequence"),
    ]:
        evidence.append(zevidence(item_id, label))

    for item_id, label in [
        ("179025521", "morality-human-story"),
        ("201825241", "cognitive-inequality-prelude-surface"),
        ("201927552", "cognitive-inequality-theorem-surface"),
        ("208620685", "collapse-conceptual-surface"),
        ("190431855", "world-infrastructure-surface"),
        ("190433657", "global-instability-surface"),
        ("200054910", "institutional-recoil-conceptual-surface"),
        ("200057627", "institutional-recoil-theorem-surface"),
        ("199821062", "substrate-stability-theorem-surface"),
        ("199823804", "substrate-stability-application-surface"),
        ("206374987", "spt-surface"),
        ("206375194", "sharingan-surface"),
    ]:
        row = substack[item_id]
        evidence.append({
            "evidence_id": f"sr-evidence:substack:{item_id}:{label}",
            "manifestation_id": f"substack:{item_id}",
            "source_path": "01-MANIFESTS/platforms/substack.jsonl",
            "source_locator": {"jsonl_line": substack_line[item_id], "fields": ["title", "subtitle", "published_at"]},
            "source_title": row["title"],
            "source_publication_at": row.get("published_at"),
            "evidence_kind": "CAPTURED_PLATFORM_CATALOG_METADATA",
            "label": label,
            "interpretive_limit": "The local catalog preserves title/subtitle/time but not the page body or edit history.",
        })

    original_specs = [
        ("sr-evidence:original:18097491:p6", "02-ORIGINALS/18097491--01--Copy of Infrastructural Exposure Theory_ How Systems Generate Harm Through Designed Contact .pdf", {"page": 6}, "IET mechanism and forward declaration"),
        ("sr-evidence:original:18097568:p2", "02-ORIGINALS/18097568--01--Systemic Erosion Theory_ How Systems Deplete Capacity, Stability, and Resilience Over Time  2.pdf", {"page": 2}, "Exposure to Slow Harm to Erosion sequence"),
        ("sr-evidence:original:18098106:p3-p4", "02-ORIGINALS/18098106--01--The STAR Framework_ Integrating Social Infrastructure Theory, Exposure, Slow Harm, and Systemic Erosion  .pdf", {"pages": [3, 4]}, "STAR retrospective role assignment"),
        ("sr-evidence:original:18098106:p8", "02-ORIGINALS/18098106--01--The STAR Framework_ Integrating Social Infrastructure Theory, Exposure, Slow Harm, and Systemic Erosion  .pdf", {"page": 8}, "STAR DOI cross-swap anomaly"),
    ]
    for evid, path, locator, label in original_specs:
        evidence.append({
            "evidence_id": evid,
            "manifestation_id": path.split("/")[-1].split("--")[0],
            "source_path": path,
            "source_locator": locator,
            "evidence_kind": "CAPTURED_ORIGINAL",
            "label": label,
            "interpretive_limit": "Page text was locally extracted and visually inspected; manifestation creation time is not composition time.",
        })

    evidence.extend([
        {
            "evidence_id": "sr-evidence:zenodo-page-018:compile-timestamps",
            "manifestation_id": "zenodo-api-page:018",
            "source_path": "01-MANIFESTS/zenodo-pages/zenodo-page-018.json",
            "source_locator": {"record_ids": ["18096652", "18097205", "18097491", "18097568", "18098106"], "field": "created"},
            "evidence_kind": "CAPTURED_PLATFORM_METADATA",
            "label": "same-day manifestation creation order",
            "observed_values": [
                ["18096652", "2025-12-30T09:34:39.241401-05:00"],
                ["18097205", "2025-12-30T09:54:41.390052-05:00"],
                ["18097491", "2025-12-30T10:19:46.982835-05:00"],
                ["18097568", "2025-12-30T10:30:15.78055-05:00"],
                ["18098106", "2025-12-30T11:19:06.680262-05:00"],
            ],
            "interpretive_limit": "Created timestamps order manifestations, not authorship or composition.",
        },
        {
            "evidence_id": "sr-evidence:prior-phase15:retitle-assay",
            "manifestation_id": "archive-assay:2026-08-23-phase15-local-architecture",
            "source_path": "04-RECEIPTS/assays/2026-08-23-phase15-local-architecture/retitle-assay.jsonl",
            "source_locator": {"rows": 17},
            "evidence_kind": "ARCHIVE_DERIVED_RECEIPT",
            "label": "17 DOI-linked retitled manifestation pairs",
            "interpretive_limit": "Title transformation alone does not establish body-level semantic continuity or authorial intent.",
        },
        {
            "evidence_id": "sr-evidence:zenodo-created:early-compiler-cascade",
            "manifestation_id": "zenodo-api-pages:016-017",
            "source_path": "01-MANIFESTS/zenodo-pages/",
            "source_locator": {"files": ["zenodo-page-016.json", "zenodo-page-017.json"], "record_ids": ["18158616", "18218135", "18237936", "18239086"], "field": "created"},
            "evidence_kind": "CAPTURED_PLATFORM_METADATA",
            "label": "early compiler cascade manifestation order",
            "observed_values": [
                ["18158616", "2026-01-05T20:57:28.991497-05:00"],
                ["18218135", "2026-01-12T00:38:24.866787-05:00"],
                ["18237936", "2026-01-13T19:45:33.671807-05:00"],
                ["18239086", "2026-01-13T23:05:09.543977-05:00"],
            ],
            "interpretive_limit": "Manifestation creation order does not establish composition order or deliberate advance design.",
        },
        {
            "evidence_id": "sr-evidence:archive-search:phase15-supported-vs-retained-capacity",
            "manifestation_id": "archive-search:phase15-local-metadata",
            "source_path": "04-RECEIPTS/assays/2026-08-24-phase15-authority-recompilation/lexical/first-appearance-candidates.jsonl",
            "source_locator": {"query_concepts": ["supported performance", "retained capacity", "withdrawal", "AI absent"], "fields": ["title", "description"]},
            "evidence_kind": "ARCHIVE_DERIVED_RECEIPT",
            "label": "bounded local negative search for supported-versus-retained capacity",
            "interpretive_limit": "No witnessed hit in the bounded retained metadata is not proof that the relation is absent from uncaptured bodies or public surfaces.",
        },
    ])

    authority = [{
        "schema_version": "authority-assertion/v1",
        "authority_assertion_id": "sr-authority:legacy-sr:policy:2026-08-16",
        "subject": {"id": "sr-class:legacy-sr", "kind": "CLASS"},
        "declared_by": {"manifestation_id": "zenodo:21960582", "work_id": None},
        "scope": {"kind": "WORK_CLASS", "raw_scope": "pre-rigor Legacy SR papers as described by the Legacy Papers Classification"},
        "source_asserted_at": {"value": "2026-08-16", "precision": "DAY", "basis": "SOURCE_PUBLICATION_METADATA"},
        "effective_from": {"value": None, "basis": "UNSTATED"},
        "recorded_at": OBSERVED_AT,
        "authority": {
            "G_genealogical": axis("AFFIRMED", "remain part of the intellectual genealogy", ["sr-evidence:zenodo:21960582:legacy-authority-policy"]),
            "C_canonical": axis("DENIED", "no longer treated as canonical", ["sr-evidence:zenodo:21960582:legacy-authority-policy"]),
            "E_empirical": axis("DENIED", "not empirical authority / not used as evidence", ["sr-evidence:zenodo:21960582:legacy-authority-policy"]),
            "F_field_defining": axis("DENIED", "not field-defining", ["sr-evidence:zenodo:21960582:legacy-authority-policy"]),
            "K_controlling": {"state": "UNSTATED", "formulation_ids": [], "source_status_raw": None, "evidence_ids": ["sr-evidence:zenodo:21960582:legacy-authority-policy"]},
        },
        "origin": "explicit-source",
        "temporal_provenance_mode": "CONTEMPORANEOUS",
        "adjudication_status": "WITNESSED",
        "prior_assertion_ids": [],
        "individual_expansion_status": "NOT_EXPANDED",
        "evidence_ids": ["sr-evidence:zenodo:21960582:legacy-authority-policy"],
        "interpretive_limit": "This is class-level policy. The retained metadata does not witness a complete work-by-work Legacy assignment or a controlling-formulation registry.",
    }, {
        "schema_version": "authority-assertion/v1",
        "authority_assertion_id": "sr-authority:gutih:canonical-reference:2026-01-13",
        "subject": {"id": "zenodo:18218135", "kind": "WORK"},
        "declared_by": {"manifestation_id": "zenodo:18237936", "work_id": None},
        "scope": {"kind": "CANON", "raw_scope": "the broader SignalRupture corpus as described by the Forensic Authorship Capsule"},
        "source_asserted_at": {"value": "2026-01-14", "precision": "DAY", "basis": "SOURCE_PUBLICATION_METADATA"},
        "effective_from": {"value": None, "basis": "UNSTATED"},
        "recorded_at": OBSERVED_AT,
        "authority": {
            "G_genealogical": axis("UNSTATED", None, ["sr-evidence:zenodo:18237936:forensic-authorship-canonical-reference"]),
            "C_canonical": axis("AFFIRMED", "canonical reference point for the broader corpus", ["sr-evidence:zenodo:18237936:forensic-authorship-canonical-reference"]),
            "E_empirical": axis("UNSTATED", None, ["sr-evidence:zenodo:18237936:forensic-authorship-canonical-reference"]),
            "F_field_defining": axis("AFFIRMED", "central node of this field / conceptual map through which remaining works can be understood", ["sr-evidence:zenodo:18237936:forensic-authorship-canonical-reference"]),
            "K_controlling": {"state": "UNSTATED", "formulation_ids": [], "source_status_raw": None, "evidence_ids": ["sr-evidence:zenodo:18237936:forensic-authorship-canonical-reference"]},
        },
        "origin": "explicit-source",
        "temporal_provenance_mode": "RETROSPECTIVE",
        "adjudication_status": "WITNESSED",
        "prior_assertion_ids": [],
        "individual_expansion_status": "NOT_APPLICABLE",
        "evidence_ids": ["sr-evidence:zenodo:18237936:forensic-authorship-canonical-reference"],
        "interpretive_limit": "This is a January 2026 source assertion, not a claim that the work remains the current canonical reference after later Canon Maps and Legacy policy.",
    }, {
        "schema_version": "authority-assertion/v1",
        "authority_assertion_id": "sr-authority:canon-map:constitution:2026-08-20",
        "subject": {"id": "zenodo:22019218", "kind": "WORK"},
        "declared_by": {"manifestation_id": "zenodo:22019218", "work_id": None},
        "scope": {"kind": "CANON", "raw_scope": "canon admission, internal order, five pillars, research programs, and canonical nodes"},
        "source_asserted_at": {"value": "2026-08-20", "precision": "DAY", "basis": "SOURCE_PUBLICATION_METADATA"},
        "effective_from": {"value": None, "basis": "UNSTATED"},
        "recorded_at": OBSERVED_AT,
        "authority": {
            "G_genealogical": axis("UNSTATED", None, ["sr-evidence:zenodo:22019218:august-canon-map"]),
            "C_canonical": axis("AFFIRMED", "governs which ideas enter the canon / establishes internal order", ["sr-evidence:zenodo:22019218:august-canon-map"]),
            "E_empirical": axis("UNSTATED", None, ["sr-evidence:zenodo:22019218:august-canon-map"]),
            "F_field_defining": axis("AFFIRMED", "master blueprint / SR constitution / foundational works", ["sr-evidence:zenodo:22019218:august-canon-map"]),
            "K_controlling": {"state": "CONTROLLING", "formulation_ids": ["sr-formulation:canon-admission-and-order:22019218"], "source_status_raw": "governs canon admission and establishes internal order", "evidence_ids": ["sr-evidence:zenodo:22019218:august-canon-map"]},
        },
        "origin": "explicit-source",
        "temporal_provenance_mode": "CONTEMPORANEOUS",
        "adjudication_status": "WITNESSED",
        "prior_assertion_ids": [],
        "individual_expansion_status": "NOT_APPLICABLE",
        "evidence_ids": ["sr-evidence:zenodo:22019218:august-canon-map"],
        "interpretive_limit": "The map's own authority claim is preserved as a source assertion; it does not prove map accuracy or independently validate the listed nodes.",
    }]

    legacy_candidates = []
    legacy_date_candidates = [
        "18096652", "18097205", "18097491", "18097568", "18098106", "18102693", "18102748", "18102782",
        "18102966", "18102995", "18103027", "18103100", "18103177", "18103456", "18108769", "18108927", "18108998",
    ]
    for item_id in legacy_date_candidates:
        row = manifest[item_id]
        legacy_candidates.append({
            "subject_id": f"zenodo:{item_id}",
            "title": row["title"],
            "publication_date": row.get("publication_date"),
            "criterion": "publication year 2025 matches the declared pre-rigor date criterion",
            "candidate_status": "MEETS_DECLARED_LEGACY_CRITERION",
            "authority_assignment_status": "NOT_INDIVIDUALLY_WITNESSED",
            "evidence_ids": ["sr-evidence:zenodo:21960582:legacy-authority-policy"],
            "interpretive_limit": "Criterion match is not an individual IS_LEGACY assertion and does not assign G/C/E/F/K values to this work.",
        })

    map_specs = [
        (
            "18737235",
            ["9 major layers", "Foundational Layer", "Harm Layer", "Governance Layer", "Epistemic Layer", "AI Layer", "Macro-Systems Layer", "Advanced Theories", "Applied Analysis", "Synthesis Layer"],
            [
                ("1", "Foundational Layer"), ("2", "Harm Layer"), ("3", "Governance Layer"),
                ("4", "Epistemic Layer"), ("5", "AI Layer"), ("6", "Macro-Systems Layer"),
                ("7", "Advanced Theories"), ("8", "Applied Analysis"), ("9", "Synthesis Layer"),
            ],
            "sr-evidence:zenodo:18737235:february-canon-map",
        ),
        (
            "20534171",
            ["9 pillars", "4 layers", "Foundations (Diagnostic Layer)", "Practical Architecture (Applied Layer)", "Predictive & Comparative Architecture", "Meta-Architecture (Theory & Public Layer)"],
            [
                ("1", "Foundations (Diagnostic Layer)"),
                ("2", "Practical Architecture (Applied Layer)"),
                ("3", "Predictive & Comparative Architecture"),
                ("4", "Meta-Architecture (Theory & Public Layer)"),
                (None, "9 pillars — members not locally enumerated"),
            ],
            "sr-evidence:zenodo:20534171:june-canon-map",
        ),
        (
            "22019218",
            ["5 causal pillars", "15 research programs", "30 canonical nodes", "Metatheory & Grammar", "Causal Separation & Measurement", "Drift, Collapse & Propagation", "Infrastructure, AI & Governance", "Human & Social Consequences"],
            [
                ("1", "Metatheory & Grammar"), ("2", "Causal Separation & Measurement"),
                ("3", "Drift, Collapse & Propagation"), ("4", "Infrastructure, AI & Governance"),
                ("5", "Human & Social Consequences"),
                (None, "15 research programs — members not locally enumerated"),
                (None, "30 canonical nodes — members not locally enumerated"),
            ],
            "sr-evidence:zenodo:22019218:august-canon-map",
        ),
    ]
    maps = []
    for item_id, labels, node_specs, evid in map_specs:
        row = manifest[item_id]
        maps.append({
            "schema_version": "canon-map-snapshot/v1",
            "snapshot_id": f"sr-canon-map:{item_id}",
            "map_manifestation_id": f"zenodo:{item_id}",
            "source_publication_at": row.get("publication_date"),
            "source_updated_at": row.get("source_updated"),
            "captured_at": OBSERVED_AT,
            "evidence_level": "AUTHOR_SUPPLIED_PLATFORM_METADATA",
            "enumeration_completeness": "METADATA_ONLY_PARTIAL",
            "raw_architecture_labels": labels,
            "nodes": [{
                "snapshot_node_id": f"sr-canon-map-node:{item_id}:{index}",
                "raw_label": raw_label,
                "raw_ordinal": raw_ordinal,
                "normalized_concept_id": None,
                "evidence_ids": [evid],
            } for index, (raw_ordinal, raw_label) in enumerate(node_specs, 1)],
            "edges": [],
            "immutable_snapshot": True,
            "evidence_ids": [evid],
            "interpretive_limit": "A source self-model is an immutable observation, not archive truth. Full node/edge enumeration awaits captured body text.",
        })

    recompilation_edges = [
        relation("sr-edge:iet-prepares-erosion", "zenodo:18097491", "PREPARES_FOR", "zenodo:18097568", "CONCEPTUAL", "zenodo:18097491", "prepares the conceptual ground for Systemic Erosion", "explicit-source", "FORWARD_DECLARED", "2025-12-30T10:19:46.982835-05:00", ["sr-evidence:original:18097491:p6", "sr-evidence:zenodo-page-018:compile-timestamps"]),
        relation("sr-edge:star-types-sit-foundation", "zenodo:18096652", "RETROSPECTIVELY_TYPES_AS", "sr-role:star:foundation", "OPERATIONAL", "zenodo:18098106", "foundational framework", "explicit-source", "RETROSPECTIVE", "2025-12-30T11:19:06.680262-05:00", ["sr-evidence:original:18098106:p3-p4", "sr-evidence:zenodo-page-018:compile-timestamps"], compiled_into_id="zenodo:18098106"),
        relation("sr-edge:star-types-iet-mechanism-1", "zenodo:18097491", "RETROSPECTIVELY_TYPES_AS", "sr-role:star:mechanism-1", "OPERATIONAL", "zenodo:18098106", "mechanism 1", "explicit-source", "RETROSPECTIVE", "2025-12-30T11:19:06.680262-05:00", ["sr-evidence:original:18098106:p3-p4", "sr-evidence:zenodo-page-018:compile-timestamps"], compiled_into_id="zenodo:18098106"),
        relation("sr-edge:star-types-slow-harm-mechanism-2", "zenodo:18097205", "RETROSPECTIVELY_TYPES_AS", "sr-role:star:mechanism-2", "OPERATIONAL", "zenodo:18098106", "mechanism 2", "explicit-source", "RETROSPECTIVE", "2025-12-30T11:19:06.680262-05:00", ["sr-evidence:original:18098106:p3-p4", "sr-evidence:zenodo-page-018:compile-timestamps"], compiled_into_id="zenodo:18098106"),
        relation("sr-edge:star-types-erosion-mechanism-3", "zenodo:18097568", "RETROSPECTIVELY_TYPES_AS", "sr-role:star:mechanism-3", "OPERATIONAL", "zenodo:18098106", "mechanism 3", "explicit-source", "RETROSPECTIVE", "2025-12-30T11:19:06.680262-05:00", ["sr-evidence:original:18098106:p3-p4", "sr-evidence:zenodo-page-018:compile-timestamps"], compiled_into_id="zenodo:18098106"),
        relation("sr-edge:igf-compiles-five-theorem-module", "sr-module:institutional-five-theorem-architecture", "COMPILES_INTO_FIELD", "zenodo:21939955", "OPERATIONAL", "zenodo:21939955", "consolidates the earlier institutional corpus into one scientific architecture", "explicit-source", "RETROSPECTIVE", "2026-08-14", ["sr-evidence:zenodo:21939955:field-compiler-and-representation-chain"], compiled_into_id="zenodo:21939955"),
        relation("sr-edge:igf-types-distortion", "zenodo:20277246", "RETROSPECTIVELY_TYPES_AS", "sr-role:igf:information-loss-reality-to-representation", "OPERATIONAL", "zenodo:21939955", "information loss between reality and representation", "explicit-source", "RETROSPECTIVE", "2026-08-14", ["sr-evidence:zenodo:21939955:field-compiler-and-representation-chain"], compiled_into_id="zenodo:21939955"),
        relation("sr-edge:igf-types-drift", "zenodo:20300880", "RETROSPECTIVELY_TYPES_AS", "sr-role:igf:temporal-divergence", "OPERATIONAL", "zenodo:21939955", "temporal divergence", "explicit-source", "RETROSPECTIVE", "2026-08-14", ["sr-evidence:zenodo:21939955:field-compiler-and-representation-chain"], compiled_into_id="zenodo:21939955"),
        relation("sr-edge:igf-types-compression", "zenodo:20300549", "RETROSPECTIVELY_TYPES_AS", "sr-role:igf:stable-low-resolution-representation", "OPERATIONAL", "zenodo:21939955", "stable low-resolution representation", "explicit-source", "RETROSPECTIVE", "2026-08-14", ["sr-evidence:zenodo:21939955:field-compiler-and-representation-chain"], compiled_into_id="zenodo:21939955"),
        relation("sr-edge:igf-types-altitude", "zenodo:20300167", "RETROSPECTIVELY_TYPES_AS", "sr-role:igf:asymmetric-abstraction", "OPERATIONAL", "zenodo:21939955", "asymmetric abstraction", "explicit-source", "RETROSPECTIVE", "2026-08-14", ["sr-evidence:zenodo:21939955:field-compiler-and-representation-chain"], compiled_into_id="zenodo:21939955"),
        relation("sr-edge:igf-types-oversight", "zenodo:20300442", "RETROSPECTIVELY_TYPES_AS", "sr-role:igf:oversight-without-correction", "OPERATIONAL", "zenodo:21939955", "oversight without correction", "explicit-source", "RETROSPECTIVE", "2026-08-14", ["sr-evidence:zenodo:21939955:field-compiler-and-representation-chain"], compiled_into_id="zenodo:21939955"),
        relation("sr-edge:gutih-compiles-sit", "zenodo:18096652", "COMPILES_INTO_FIELD", "zenodo:18218135", "OPERATIONAL", "zenodo:18218135", "consolidates Social Infrastructure Theory into a single explanatory architecture", "explicit-source", "RETROSPECTIVE", "2026-01", ["sr-evidence:zenodo:18218135:grand-unified-harm-compiler"], compiled_into_id="zenodo:18218135"),
        relation("sr-edge:gutih-compiles-iet", "zenodo:18097491", "COMPILES_INTO_FIELD", "zenodo:18218135", "OPERATIONAL", "zenodo:18218135", "consolidates Infrastructural Exposure Theory into a single explanatory architecture", "explicit-source", "RETROSPECTIVE", "2026-01", ["sr-evidence:zenodo:18218135:grand-unified-harm-compiler"], compiled_into_id="zenodo:18218135"),
        relation("sr-edge:gutih-compiles-slow-harm", "zenodo:18097205", "COMPILES_INTO_FIELD", "zenodo:18218135", "OPERATIONAL", "zenodo:18218135", "consolidates Slow Harm Theory into a single explanatory architecture", "explicit-source", "RETROSPECTIVE", "2026-01", ["sr-evidence:zenodo:18218135:grand-unified-harm-compiler"], compiled_into_id="zenodo:18218135"),
        relation("sr-edge:gutih-compiles-erosion", "zenodo:18097568", "COMPILES_INTO_FIELD", "zenodo:18218135", "OPERATIONAL", "zenodo:18218135", "consolidates Systemic Erosion Theory into a single explanatory architecture", "explicit-source", "RETROSPECTIVE", "2026-01", ["sr-evidence:zenodo:18218135:grand-unified-harm-compiler"], compiled_into_id="zenodo:18218135"),
        relation("sr-edge:gutih-compiles-quiet-governance", "zenodo:18158616", "COMPILES_INTO_FIELD", "zenodo:18218135", "OPERATIONAL", "zenodo:18218135", "consolidates Quiet Governance into a single explanatory architecture", "explicit-source", "RETROSPECTIVE", "2026-01", ["sr-evidence:zenodo:18158616:quiet-governance-core-input", "sr-evidence:zenodo:18218135:grand-unified-harm-compiler"], compiled_into_id="zenodo:18218135"),
        relation("sr-edge:gutih-canonical-reference-for-corpus", "zenodo:18218135", "CANONICAL_REFERENCE_FOR", "sr-corpus:signalrupture:2026-01-13", "AUTHORITY", "zenodo:18237936", "functions as the canonical reference point for the broader corpus", "explicit-source", "RETROSPECTIVE", "2026-01-14", ["sr-evidence:zenodo:18237936:forensic-authorship-canonical-reference"]),
        relation("sr-edge:codex-compiles-seventy-essay-snapshot", "sr-corpus:signalrupture:seventy-essay-snapshot", "COMPILES_INTO_FIELD", "zenodo:18239086", "OPERATIONAL", "zenodo:18239086", "consolidated architectural blueprint that transforms a 70-essay corpus into a coherent machine-legible discipline", "explicit-source", "RETROSPECTIVE", "2026-01-14", ["sr-evidence:zenodo:18239086:codex-seventy-essay-compiler"], compiled_into_id="zenodo:18239086"),
        relation("sr-edge:algorithm-field-compiles-prior-surfaces", "sr-module:algorithmic-surface-precursors", "COMPILES_INTO_FIELD", "zenodo:21999553", "OPERATIONAL", "zenodo:21999553", "explicitly consolidates earlier SR work—crawlers, conditioning, cognitive offloading, semantic governance, metadata suppression—described as approaching one mechanism from different surfaces", "explicit-source", "RETROSPECTIVE", "2026-08-18", ["sr-evidence:zenodo:21999553:algorithm-field-cross-surface-compiler"], compiled_into_id="zenodo:21999553"),
    ]

    typed_graph_edges = [
        relation("sr-edge:csr-before-origin:historical", "zenodo:18364461", "PRECEDES_MANIFESTATION", "zenodo:18382146", "HISTORICAL", None, "captured publication metadata orders Cross-Surface Recurrence before Origin Gravity", "archive-inferred", "CONTEMPORANEOUS", "2026-01-27", ["sr-evidence:zenodo:18364461:csr-survival-mechanism", "sr-evidence:zenodo:18382146:origin-gravity-precedence"], limit="Manifestation order is not composition order."),
        relation("sr-edge:origin-before-csr:conceptual", "zenodo:18382146", "CONCEPTUALLY_PRECEDES", "zenodo:18364461", "CONCEPTUAL", "zenodo:18382146", "emergence mechanism precedes the survival dynamics formalized in Cross-Surface Recurrence", "explicit-source", "RETROSPECTIVE", "2026-01-27", ["sr-evidence:zenodo:18382146:origin-gravity-precedence"]),
        relation("sr-edge:sharingan-routes-to-spt", "zenodo:21286175", "NAVIGATES_TO", "zenodo:21286263", "NAVIGATIONAL", "zenodo:21286175", "readers are encouraged to consult SPT", "explicit-source", "CONTEMPORANEOUS", "2026-07-10", ["sr-evidence:zenodo:21286175:sharingan-navigation"]),
        relation("sr-edge:spt-foundation-for-sharingan", "zenodo:21286263", "METHODOLOGICAL_FOUNDATION_FOR", "zenodo:21286175", "CONCEPTUAL", "zenodo:21286175", "SPT provides the methodological foundation for Institutional Sharingan", "explicit-source", "RETROSPECTIVE", "2026-07-10", ["sr-evidence:zenodo:21286175:sharingan-navigation"]),
        relation("sr-edge:spt-complements-sharingan", "zenodo:21286263", "COMPLEMENTS", "zenodo:21286175", "CONCEPTUAL", "zenodo:21286263", "complementing the perceptual augmentation introduced in Institutional Sharingan", "explicit-source", "CONTEMPORANEOUS", "2026-07-10", ["sr-evidence:zenodo:21286263:spt-methodological-foundation"]),
        relation("sr-edge:world-foundation-for-global-instability", "zenodo:18926742", "FOUNDATION_FOR", "zenodo:18926916", "CONCEPTUAL", "zenodo:18926742", "establishes the theoretical foundation for future work on global instability", "explicit-source", "FORWARD_DECLARED", "2026-03-09", ["sr-evidence:zenodo:18926742:world-infrastructure-foundation"]),
        relation("sr-edge:global-instability-applied-counterpart-to-world", "zenodo:18926916", "APPLIED_COUNTERPART_TO", "zenodo:18926742", "OPERATIONAL", "zenodo:18926916", "serves as the applied counterpart to the world-infrastructure theory", "explicit-source", "RETROSPECTIVE", "2026-03-09", ["sr-evidence:zenodo:18926916:global-instability-applied-counterpart"]),
        relation("sr-edge:sr-caf-formal-before-conceptual:historical", "zenodo:20436807", "PRECEDES_MANIFESTATION", "zenodo:20436955", "HISTORICAL", None, "Zenodo source_updated order: formal 20:28 before conceptual 20:50", "archive-inferred", "CONTEMPORANEOUS", "2026-05-28", ["sr-evidence:zenodo:20436807:sr-caf-theorem", "sr-evidence:zenodo:20436955:sr-caf-conceptual-foundation"], limit="Platform update order is not composition order."),
        relation("sr-edge:sr-caf-conceptual-foundation-for-formal", "zenodo:20436955", "CONCEPTUAL_FOUNDATION_FOR", "zenodo:20436807", "CONCEPTUAL", "zenodo:20436955", "conceptual foundation of SR-CAF", "explicit-source", "RETROSPECTIVE", "2026-05-29", ["sr-evidence:zenodo:20436955:sr-caf-conceptual-foundation"]),
        relation("sr-edge:recoil-theorem-before-conceptual:zenodo", "zenodo:20481586", "PRECEDES_MANIFESTATION", "zenodo:20481650", "HISTORICAL", None, "Zenodo manifestation metadata orders theorem before conceptual paper", "archive-inferred", "CONTEMPORANEOUS", "2026-06-01", ["sr-evidence:zenodo:20481586:institutional-recoil-theorem", "sr-evidence:zenodo:20481650:institutional-recoil-conceptual"], limit="This is a Zenodo-surface order only."),
        relation("sr-edge:recoil-conceptual-before-theorem:substack", "substack:200054910", "PRECEDES_MANIFESTATION", "substack:200057627", "HISTORICAL", None, "Substack published_at orders conceptual paper before theorem", "archive-inferred", "CONTEMPORANEOUS", "2026-06-01", ["sr-evidence:substack:200054910:institutional-recoil-conceptual-surface", "sr-evidence:substack:200057627:institutional-recoil-theorem-surface"], limit="This is a Substack-surface order only."),
        relation("sr-edge:collapse-empirical-companion-to-conceptual", "zenodo:22049160", "ANALYTICAL_COMPANION_TO", "zenodo:21612493", "CONCEPTUAL", "zenodo:22049160", "analytical companion to the conceptual manuscript", "explicit-source", "RETROSPECTIVE", "2026-08-21", ["sr-evidence:zenodo:22049160:collapse-empirical-companion-and-falsifier"]),
    ]

    transformations = [
        transformation("sr-transform:cognitive-problem-to-theorem", "zenodo:20674082", "zenodo:20684103", "FORMALIZATION", "zenodo:20674082", "explicit-source", "FORWARD_DECLARED", effect("PRESERVED", "PRESERVED", "CHANGED", "UNKNOWN", "ADDED", "UNKNOWN", "UNKNOWN"), ["sr-evidence:zenodo:20674082:cognitive-inequality-prelude", "sr-evidence:zenodo:20684103:cognitive-inequality-theorem"], limit="Clean forward-declared prelude-to-theorem lift; source label 'empirical' is not independent validation."),
        transformation("sr-transform:agentic-to-webmcp", "zenodo:20684261", "zenodo:20692290", "FORMALIZATION", None, "archive-inferred", "INFERRED", effect("PRESERVED", "BROADENED", "CHANGED", "BROADENED", "ADDED", "NOT_ASSESSED", "NOT_ASSESSED"), ["sr-evidence:zenodo:20684261:agentic-substrate", "sr-evidence:zenodo:20692290:webmcp-theorem"], status="CANDIDATE", limit="Same construct and manifestation order support a candidate; no direct work-to-work citation is locally witnessed."),
        transformation("sr-transform:morality-series-to-law", "sr-series:morality-on-trial", "zenodo:20691934", "FORMALIZATION", "zenodo:20691934", "explicit-source", "RETROSPECTIVE", effect("CHANGED", "BROADENED", "CHANGED", "BROADENED", "ADDED", "NOT_ASSESSED", "UNKNOWN"), ["sr-evidence:zenodo:20691934:morality-law"], status="CANDIDATE", limit="The June law invokes narrative and structural precursors but does not identify one predecessor title/DOI; the Morality namespace must not be collapsed into one work."),
        transformation("sr-transform:collapse-conceptual-to-empirical", "zenodo:21612493", "zenodo:22049160", "EMPIRICAL_COMPANION", "zenodo:22049160", "explicit-source", "RETROSPECTIVE", effect("PRESERVED", "NARROWED", "NARROWED", "NARROWED", "ADDED", "ADDED", "ADDED"), ["sr-evidence:zenodo:21612493:collapse-conceptual-and-revision-risk", "sr-evidence:zenodo:22049160:collapse-empirical-companion-and-falsifier"], limit="The empirical edition explicitly narrows universal claims and adds measurement/falsification; the conceptual page's forward pointer may be a later edit."),
        transformation("sr-transform:semantic-entry-to-framework", "zenodo:20383776", "zenodo:20383898", "FORMALIZATION", None, "archive-inferred", "INFERRED", effect("PRESERVED", "BROADENED", "CHANGED", "UNKNOWN", "ADDED", "UNKNOWN", "UNKNOWN"), ["sr-evidence:zenodo:20383776:semantic-interpolation-entry", "sr-evidence:zenodo:20383898:semantic-interpolation-framework"], status="CANDIDATE", limit="Same-day same-construct lift inferred from metadata; bodies are not captured."),
        transformation("sr-transform:semantic-framework-to-theorem", "zenodo:20383898", "zenodo:20384827", "FORMALIZATION", None, "archive-inferred", "INFERRED", effect("PRESERVED", "BROADENED", "CHANGED", "BROADENED", "ADDED", "UNKNOWN", "UNKNOWN"), ["sr-evidence:zenodo:20383898:semantic-interpolation-framework", "sr-evidence:zenodo:20384827:semantic-interpolation-theorem"], status="CANDIDATE", limit="Evidence and asserted generality both rise; simulation is not independent cross-model validation."),
        transformation("sr-transform:slow-harm-theory-to-theorem", "zenodo:18097205", "zenodo:20388685", "FORMALIZATION", None, "archive-inferred", "INFERRED", effect("PRESERVED", "BROADENED", "CHANGED", "BROADENED", "ADDED", "ADDED", "UNKNOWN"), ["sr-evidence:zenodo:20388685:slow-harm-theorem"], status="CANDIDATE", limit="Shared construct and retained original make the relation strong, but the local metadata does not contain a direct DOI-level predecessor statement."),
        transformation("sr-transform:extraction-to-forecasting", "zenodo:20090154", "zenodo:20102186", "EMPIRICAL_COMPANION", "zenodo:20090154", "explicit-source", "FORWARD_DECLARED", effect("PARTIAL", "NARROWED", "CHANGED", "NARROWED", "ADDED", "ADDED", "ADDED"), ["sr-evidence:zenodo:20090154:extraction-companion-promise", "sr-evidence:zenodo:20102186:forecasting-companion-candidate"], status="CANDIDATE", limit="The forecasting work closely matches the promised companion but a body-level citation is not locally witnessed; treat as a high-confidence unresolved target."),
        transformation("sr-transform:sr-caf-conceptual-to-formal", "zenodo:20436955", "zenodo:20436807", "FORMALIZATION", "zenodo:20436955", "explicit-source", "RETROSPECTIVE", effect("PRESERVED", "NARROWED", "CHANGED", "UNKNOWN", "ADDED", "ADDED", "ADDED"), ["sr-evidence:zenodo:20436955:sr-caf-conceptual-foundation", "sr-evidence:zenodo:20436807:sr-caf-theorem"], limit="The formal manifestation predates the work calling itself the conceptual foundation; architectural foundation is not historical priority."),
        transformation("sr-transform:correlation-to-cst", "zenodo:18108769", "zenodo:20462559", "FORMALIZATION", None, "archive-inferred", "INFERRED", effect("CHANGED", "NARROWED", "NARROWED", "NARROWED", "ADDED", "UNKNOWN", "ADDED"), ["sr-evidence:zenodo:20462559:causal-separation-theorem"], status="CANDIDATE", limit="Shared causal theme supports a medium-confidence disciplining formalization; no direct citation is locally witnessed."),
        transformation("sr-transform:world-infrastructure-to-global-instability", "zenodo:18926742", "zenodo:18926916", "EPISTEMIC_LIFT", "zenodo:18926916", "explicit-source", "RETROSPECTIVE", effect("PRESERVED", "NARROWED", "CHANGED", "UNKNOWN", "ADDED", "UNKNOWN", "ADDED"), ["sr-evidence:zenodo:18926742:world-infrastructure-foundation", "sr-evidence:zenodo:18926916:global-instability-applied-counterpart"], limit="The source declares foundation and applied-counterpart roles. 'Operationalizes' here means applied explanation; no dataset is locally witnessed."),
        transformation("sr-transform:institutional-recoil-conceptual-to-theorem", "zenodo:20481650", "zenodo:20481586", "FORMALIZATION", "zenodo:20481650", "explicit-source", "RETROSPECTIVE", effect("PRESERVED", "BROADENED", "CHANGED", "BROADENED", "ADDED", "UNKNOWN", "UNKNOWN"), ["sr-evidence:zenodo:20481650:institutional-recoil-conceptual", "sr-evidence:zenodo:20481586:institutional-recoil-theorem"], limit="Zenodo manifestation order is theorem then conceptual, while Substack order is conceptual then theorem; historical order is surface-relative."),
        transformation("sr-transform:substrate-stability-to-canada", "zenodo:20453363", "zenodo:20453621", "EPISTEMIC_LIFT", "zenodo:20453621", "explicit-source", "RETROSPECTIVE", effect("PRESERVED", "NARROWED", "PRESERVED", "NARROWED", "ADDED", "UNKNOWN", "ADDED"), ["sr-evidence:zenodo:20453363:substrate-stability-theorem", "sr-evidence:zenodo:20453621:substrate-stability-canada-application"], limit="Clean formal-to-applied lift; the application explicitly frames itself as illustrative scenario analysis, not deterministic forecasting."),
        transformation("sr-transform:spt-to-sharingan-interface", "zenodo:21286263", "zenodo:21286175", "EPISTEMIC_LIFT", "zenodo:21286175", "explicit-source", "RETROSPECTIVE", effect("PRESERVED", "CHANGED", "PRESERVED", "PRESERVED", "UNKNOWN", "UNKNOWN", "UNKNOWN"), ["sr-evidence:zenodo:21286263:spt-methodological-foundation", "sr-evidence:zenodo:21286175:sharingan-navigation"], limit="This is method-to-perceptual-interface translation. Mutual reference does not create an inverse conceptual edge."),
        transformation("sr-transform:retitle-family-march-april", "sr-set:91-doi-linked-substack-manifestations", "sr-set:91-doi-linked-zenodo-manifestations", "SURFACE_TRANSLATION", None, "archive-inferred", "INFERRED", effect("UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"), ["sr-evidence:prior-phase15:retitle-assay"], status="CANDIDATE", limit="Fourteen of 17 retitles cluster in March-April, but title-only phase association cannot establish semantic preservation or a universal surface-translation operator.", commutation_family_id="sr-commutation-family:surface-vs-epistemic"),
    ]

    representation_families = [
        {"family_id": "sr-representation-family:morality-on-trial", "status": "MULTI_WORK_NAMESPACE", "members": [{"id": "substack:179025521", "role": "narrative/human-story surface"}, {"id": "zenodo:18118793", "role": "conceptual/infrastructural-ethics surface"}, {"id": "zenodo:18511319", "role": "archive/visibility branch"}, {"id": "zenodo:20691934", "role": "law/theorem surface"}, {"id": "zenodo:21938702", "role": "field compiler"}], "interpretive_limit": "Do not merge these into one work identity; the law does not locally identify one exact predecessor."},
        {"family_id": "sr-representation-family:agentic-webmcp", "status": "CANDIDATE_FORMALIZATION", "members": [{"id": "zenodo:20684261", "role": "agentic execution substrate concept"}, {"id": "zenodo:20692290", "role": "paradox theorem/formal layer"}], "interpretive_limit": "Concept-first order is witnessed; a direct citation is not."},
        {"family_id": "sr-representation-family:cognitive-inequality", "status": "FORWARD_DECLARED_LIFT", "members": [{"id": "zenodo:20674082", "role": "structural prelude"}, {"id": "zenodo:20684103", "role": "theorem with constructs/threshold"}], "interpretive_limit": "Source label empirical is not an independent data receipt."},
        {"family_id": "sr-representation-family:collapse-psychology", "status": "RECIPROCAL_REFERENCE_WITH_EDIT_TIME_UNCERTAINTY", "members": [{"id": "zenodo:21612493", "role": "conceptual"}, {"id": "zenodo:22049160", "role": "empirical companion"}], "interpretive_limit": "The empirical back-reference is current; the conceptual forward pointer may have been added after initial publication."},
        {"family_id": "sr-representation-family:semantic-interpolation", "status": "THREE_STEP_SAME_DAY_LIFT", "members": [{"id": "zenodo:20383776", "role": "canonical entry"}, {"id": "zenodo:20383898", "role": "quantitative/operational framework"}, {"id": "zenodo:20384827", "role": "theorem"}], "interpretive_limit": "Measurement vocabulary and claim scope both rise; body comparison is pending."},
        {"family_id": "sr-representation-family:slow-harm", "status": "STRONG_CONSTRUCT_LEVEL_LIFT", "members": [{"id": "zenodo:18097205", "role": "theory"}, {"id": "zenodo:20388685", "role": "coded-event empirical theorem"}], "interpretive_limit": "The direct work edge is not locally stated, despite construct continuity."},
        {"family_id": "sr-representation-family:world-infrastructure", "status": "SOURCE_DECLARED_INVERSE_PAIR", "members": [{"id": "zenodo:18926742", "role": "theoretical foundation"}, {"id": "zenodo:18926916", "role": "applied counterpart"}], "interpretive_limit": "Applied explanation is not automatically an empirical dataset."},
        {"family_id": "sr-representation-family:extraction-forecasting", "status": "HIGH_CONFIDENCE_UNRESOLVED_COMPANION", "members": [{"id": "zenodo:20090154", "role": "theory promising empirical companion"}, {"id": "zenodo:20102186", "role": "forecasting target candidate"}], "interpretive_limit": "The forecast may operationalize only one branch of the larger genealogy."},
        {"family_id": "sr-representation-family:sr-caf", "status": "CHRONOLOGY_DEPENDENCY_ANTI_CYCLE", "members": [{"id": "zenodo:20436807", "role": "formal theorem manifested first"}, {"id": "zenodo:20436955", "role": "conceptual foundation manifested later"}], "interpretive_limit": "Foundation denotes role, not historical priority."},
        {"family_id": "sr-representation-family:institutional-recoil", "status": "SURFACE_RELATIVE_ORDER", "members": [{"id": "zenodo:20481586", "role": "theorem"}, {"id": "zenodo:20481650", "role": "conceptual"}], "interpretive_limit": "Zenodo and Substack expose opposite orderings; do not impose one cross-surface chronology."},
        {"family_id": "sr-representation-family:substrate-stability", "status": "FORMAL_TO_APPLIED_WITH_SCOPE_RESTRAINT", "members": [{"id": "zenodo:20453363", "role": "theorem"}, {"id": "zenodo:20453621", "role": "Canada illustrative application"}], "interpretive_limit": "The application explicitly disclaims deterministic forecasting."},
        {"family_id": "sr-representation-family:sharingan-spt", "status": "MUTUAL_REFERENCE_NOT_INVERSE_CONCEPTUAL_CYCLE", "members": [{"id": "zenodo:21286263", "role": "methodological foundation"}, {"id": "zenodo:21286175", "role": "perceptual interface / reader-routing source"}], "interpretive_limit": "Both conceptual predicates point SPT to Sharingan; only the navigation edge points back."},
        {"family_id": "sr-representation-family:causal-separation", "status": "MEDIUM_CONFIDENCE_CANDIDATE", "members": [{"id": "zenodo:18108769", "role": "rhetorical/conceptual causation essay"}, {"id": "zenodo:20462559", "role": "causal-separation theorem"}], "interpretive_limit": "Shared theme is not direct lineage evidence."},
    ]

    claim_events = [
        {
            "schema_version": "claim-status-event/v1", "claim_event_id": "sr-claim-event:rda-rejects-universal", "claim_id": "sr-claim:ai-amplifies-discrimination-universally", "claim_lineage_id": "sr-lineage:recursive-discrimination-amplification", "source_manifestation_id": "zenodo:22004259", "source_status_raw": "rejects the universal claim that AI amplifies discrimination", "normalized_status": "REJECTED_UNIVERSAL", "normalization_basis": "EXACT_SOURCE_TERM", "scope_raw": "AI amplification requires specified closed-loop conditions", "evidence_schema_id": None, "evidence_class_raw": None, "measurement_definition_ids": ["sr-measure:AR_t", "sr-measure:FCI"], "competing_explanation_ids": ["sr-explanation:inheritance-without-amplification", "sr-explanation:attenuation"], "falsifier_ids": [], "counterexample_ids": ["sr-counterexample:fintech-reduces-discrimination"], "prior_event_ids": [], "source_asserted_at": "2026-08-19", "source_updated_at": manifest["22004259"].get("source_updated"), "observed_at": OBSERVED_AT, "origin": "explicit-source", "evidence_ids": ["sr-evidence:zenodo:22004259:rejects-universal-amplification"], "adjudication_status": "WITNESSED", "interpretive_limit": "This is the source's current metadata claim, not independent empirical adjudication."
        },
        {
            "schema_version": "claim-status-event/v1", "claim_event_id": "sr-claim-event:collapse-empirical-narrows", "claim_id": "sr-claim:collapse-psychology-universal", "claim_lineage_id": "sr-lineage:collapse-psychology", "source_manifestation_id": "zenodo:22049160", "source_status_raw": "does not claim universal collapse, institutional intent, or deliberate psychological governance", "normalized_status": "REJECTED_UNIVERSAL", "normalization_basis": "CONTROLLED_ARCHIVE_MAPPING", "scope_raw": "component mechanisms and testable structural exposure pathways", "evidence_schema_id": None, "evidence_class_raw": None, "measurement_definition_ids": ["sr-measure:CSE", "sr-measure:X_it", "sr-measure:Y_it"], "competing_explanation_ids": [], "falsifier_ids": ["sr-falsifier:structural-exposure-fails-controlled-prediction"], "counterexample_ids": [], "prior_event_ids": [], "source_asserted_at": "2026-08-21", "source_updated_at": manifest["22049160"].get("source_updated"), "observed_at": OBSERVED_AT, "origin": "explicit-source", "evidence_ids": ["sr-evidence:zenodo:22049160:collapse-empirical-companion-and-falsifier"], "adjudication_status": "WITNESSED", "interpretive_limit": "Source-described empirical support is not independently validated by this metadata-only assay."
        },
        {
            "schema_version": "claim-status-event/v1", "claim_event_id": "sr-claim-event:legacy-demotion", "claim_id": "sr-claim:pre-rigor-current-authority", "claim_lineage_id": "sr-lineage:legacy-reclassification", "source_manifestation_id": "zenodo:21960582", "source_status_raw": "historically retained; no longer canonical, empirical, or field-defining", "normalized_status": "LEGACY", "normalization_basis": "EXACT_SOURCE_TERM", "scope_raw": "Legacy SR class", "evidence_schema_id": None, "evidence_class_raw": None, "measurement_definition_ids": [], "competing_explanation_ids": [], "falsifier_ids": [], "counterexample_ids": [], "prior_event_ids": [], "source_asserted_at": "2026-08-16", "source_updated_at": manifest["21960582"].get("source_updated"), "observed_at": OBSERVED_AT, "origin": "explicit-source", "evidence_ids": ["sr-evidence:zenodo:21960582:legacy-authority-policy"], "adjudication_status": "WITNESSED", "interpretive_limit": "Class-level transition only; individual membership is unresolved."
        },
    ]

    evidence_taxonomies = [
        {"taxonomy_id": "sr-evidence-taxonomy:sis:E0-E5", "manifestation_id": "zenodo:22000937", "raw_classes": ["E0", "E1", "E2", "E3", "E4", "E5"], "status": "WITNESSED_IN_LOCAL_METADATA", "evidence_ids": ["sr-evidence:zenodo:22000937:sis-evidence-ladder"], "interpretive_limit": "Namespace is local to System Inheritance Studies until an explicit cross-field mapping is witnessed."},
        {"taxonomy_id": "sr-evidence-taxonomy:ceidf:E1-E2-S1-S2", "manifestation_id": "zenodo:22046469", "raw_classes": ["E1 empirical measurement", "E2 empirical transformation", "S1 SR operationalization", "S2 SR decision boundary"], "status": "WITNESSED_IN_LOCAL_METADATA", "evidence_ids": ["sr-evidence:zenodo:22046469:ceidf-evidence-ladder"], "interpretive_limit": "Do not normalize into SIS E0-E5; the two systems have different source-declared jobs."},
        {"taxonomy_id": "sr-evidence-taxonomy:igf:E1-E5", "manifestation_id": "zenodo:21939955", "raw_classes": [], "status": "NOT_WITNESSED_IN_LOCAL_METADATA", "evidence_ids": ["sr-evidence:zenodo:21939955:field-compiler-and-representation-chain"], "interpretive_limit": "Collaborator-reported only; exact body spans are a Phase 2 acquisition target."},
        {"taxonomy_id": "sr-type-control:structural-theorem", "manifestation_id": "zenodo:20616460", "raw_classes": ["structural invariant", "generalizability claim", "not mathematical proof"], "status": "WITNESSED_IN_LOCAL_METADATA", "evidence_ids": ["sr-evidence:zenodo:20616460:theorem-label-control"], "interpretive_limit": "The word theorem must never elevate empirical or mathematical authority by itself."},
    ]

    graph_observations = [
        {"schema_version": "graph-assay-observation/v1", "observation_id": "sr-graph-observation:star-doi-cross-swap", "observation_kind": "PROVENANCE_CONTRADICTION", "status": "WITNESSED", "evidence_ids": ["sr-evidence:original:18098106:p8"], "subject_ids": ["zenodo:18096652", "zenodo:18097205", "zenodo:18097491", "zenodo:18097568"], "observed": "STAR's reference list cross-swaps all four predecessor DOI assignments", "interpretive_limit": "Preserve the body relationship and DOI defect separately; do not silently repair the source."},
        {"schema_version": "graph-assay-observation/v1", "observation_id": "sr-graph-observation:latent-and-retrospective-star", "observation_kind": "FIRST_APPEARANCE", "status": "WITNESSED", "evidence_ids": ["sr-evidence:original:18097491:p6", "sr-evidence:original:18098106:p3-p4", "sr-evidence:zenodo-page-018:compile-timestamps"], "result": "One successor was forward-declared, then the lineage was retrospectively compiled the same morning", "hypothesis_effect": "supports H_L and H_R in one bounded lineage", "interpretive_limit": "Manifestation order is not proof of composition order or a corpus-wide compiler cycle."},
        {"schema_version": "graph-assay-observation/v1", "observation_id": "sr-graph-observation:canon-map-three-checkpoints", "observation_kind": "SELF_MAP_GRAPH_DELTA", "status": "PARTIAL", "evidence_ids": ["sr-evidence:zenodo:18737235:february-canon-map", "sr-evidence:zenodo:20534171:june-canon-map", "sr-evidence:zenodo:22019218:august-canon-map"], "c_snapshot_ids": ["sr-canon-map:18737235", "sr-canon-map:20534171", "sr-canon-map:22019218"], "observed": "9 layers -> 9 pillars/4 layers -> 5 pillars/15 programs/30 nodes", "interpretive_limit": "Full map bodies are absent, so node-level split/merge/persistence and C_t versus G_t distance are not yet testable."},
        {"schema_version": "graph-assay-observation/v1", "observation_id": "sr-graph-observation:ordinal-namespace-field-paper-ii", "observation_kind": "ORDINAL_NAMESPACE", "status": "UNRESOLVED", "evidence_ids": ["sr-evidence:zenodo:20209609:universities-field-paper-ii", "sr-evidence:zenodo:20210697:healthcare-field-paper-ii"], "observed": "Universities and Ontario healthcare each self-label as Field Paper II", "ordinal_token": "II", "candidate_namespace_ids": ["sr-series:field-paper:universities", "sr-series:field-paper:public-health"], "expected_predecessor": True, "predecessor_identified": False, "interpretive_limit": "Do not infer a numbering error or invent Field Paper I; preserve ordinal observed and series namespace unresolved."},
        {"schema_version": "graph-assay-observation/v1", "observation_id": "sr-graph-observation:csr-origin-typed-anti-cycle", "observation_kind": "TYPED_CYCLE", "status": "WITNESSED", "evidence_ids": ["sr-evidence:zenodo:18364461:csr-survival-mechanism", "sr-evidence:zenodo:18382146:origin-gravity-precedence"], "historical_order": ["zenodo:18364461", "zenodo:18382146"], "conceptual_order": ["zenodo:18382146", "zenodo:18364461"], "closure_type": "CROSS_GRAPH_ANTI_CYCLE", "interpretive_limit": "No same-edge-type cycle exists; publication chronology and conceptual precedence must not be collapsed."},
        {"schema_version": "graph-assay-observation/v1", "observation_id": "sr-graph-observation:sharingan-spt-typed-cycle", "observation_kind": "TYPED_CYCLE", "status": "WITNESSED", "evidence_ids": ["sr-evidence:zenodo:21286175:sharingan-navigation", "sr-evidence:zenodo:21286263:spt-methodological-foundation"], "navigation_order": ["zenodo:21286175", "zenodo:21286263"], "conceptual_predicates": [["zenodo:21286263", "METHODOLOGICAL_FOUNDATION_FOR", "zenodo:21286175"], ["zenodo:21286263", "COMPLEMENTS", "zenodo:21286175"]], "closure_type": "CROSS_GRAPH_MUTUAL_REFERENCE", "interpretive_limit": "Mutual document reference is not a reciprocal conceptual dependency; both conceptual predicates point SPT to Sharingan."},
        {"schema_version": "graph-assay-observation/v1", "observation_id": "sr-graph-observation:route-conditioned-state", "observation_kind": "ROUTE_CONDITIONED_ENDPOINT", "status": "NOT_TESTABLE", "evidence_ids": ["sr-evidence:zenodo:18749610:start-here-router", "sr-evidence:zenodo:18354721:institutional-entry-router", "sr-evidence:zenodo:18795375:governance-entry-router"], "observed": "Multiple scoped portals are witnessed but local metadata does not enumerate START HERE destinations", "interpretive_limit": "Create unresolved endpoints; do not autocomplete routes from thematic similarity. Path-conditioned knowledge equality awaits full router bodies."},
        {"schema_version": "graph-assay-observation/v1", "observation_id": "sr-graph-observation:surface-epistemic-commutation", "observation_kind": "REPRESENTATION_COMMUTATION", "status": "NOT_TESTABLE", "evidence_ids": ["sr-evidence:prior-phase15:retitle-assay", "sr-evidence:zenodo:20674082:cognitive-inequality-prelude", "sr-evidence:zenodo:20684103:cognitive-inequality-theorem"], "missing": "No locally complete four-corner family with body text on both surfaces and both epistemic registers", "interpretive_limit": "T_surface and T_epistemic remain distinct; missing corners cannot be inferred."},
        {"schema_version": "graph-assay-observation/v1", "observation_id": "sr-graph-observation:governance-v13-v14-unified", "observation_kind": "GOVERNANCE_RULE_CASE", "status": "WITNESSED", "evidence_ids": ["sr-evidence:zenodo:19356453:governance-v1-3", "sr-evidence:zenodo:19434800:governance-v1-4", "sr-evidence:zenodo:21970690:governance-conflict-resolution"], "observed": "v1.3 and v1.4 conflict; the unified stack separates canonical core from implementation profiles and conditions predictive integrity on tests", "interpretive_limit": "This is one resolved governance case, not a global coherence score."},
        {"schema_version": "graph-assay-observation/v1", "observation_id": "sr-graph-observation:governance-self-test-asymmetry", "observation_kind": "GOVERNANCE_RULE_CASE", "status": "UNRESOLVED", "evidence_ids": ["sr-evidence:zenodo:21830983:self-testing-asymmetry"], "observed": "The Stance claims reciprocal self-testing while requiring critics to adopt SR's visibility structure", "interpretive_limit": "A rule-by-rule applicability and revision assay is required before classifying this as satisfied or violated."},
        {"schema_version": "graph-assay-observation/v1", "observation_id": "sr-graph-observation:declared-seven-vs-twelve", "observation_kind": "ORDINAL_NAMESPACE", "status": "UNRESOLVED", "evidence_ids": ["sr-evidence:zenodo:18364461:csr-survival-mechanism"], "observed": "The seven-part infrastructural architecture and twelve-phase developmental genealogy have different declared jobs", "interpretive_limit": "Maintain A_7 != L_12 unless a source explicitly relates them."},
        {"schema_version": "graph-assay-observation/v1", "observation_id": "sr-graph-observation:world-infrastructure-typed-cycle", "observation_kind": "TYPED_CYCLE", "status": "WITNESSED", "evidence_ids": ["sr-evidence:zenodo:18926742:world-infrastructure-foundation", "sr-evidence:zenodo:18926916:global-instability-applied-counterpart"], "ordered_predicates": [["zenodo:18926742", "FOUNDATION_FOR", "zenodo:18926916"], ["zenodo:18926916", "APPLIED_COUNTERPART_TO", "zenodo:18926742"]], "closure_type": "RECIPROCAL_TYPED_PAIR", "interpretive_limit": "The inverse roles are conceptual/operational, not evidence of a historical cycle or empirical validation."},
        {"schema_version": "graph-assay-observation/v1", "observation_id": "sr-graph-observation:sr-caf-chronology-dependency-anti-cycle", "observation_kind": "TYPED_CYCLE", "status": "WITNESSED", "evidence_ids": ["sr-evidence:zenodo:20436807:sr-caf-theorem", "sr-evidence:zenodo:20436955:sr-caf-conceptual-foundation"], "historical_order": ["zenodo:20436807", "zenodo:20436955"], "conceptual_order": ["zenodo:20436955", "zenodo:20436807"], "closure_type": "CROSS_GRAPH_ANTI_CYCLE", "interpretive_limit": "Foundation is an architectural role and does not entail earlier publication."},
        {"schema_version": "graph-assay-observation/v1", "observation_id": "sr-graph-observation:institutional-recoil-surface-relative-order", "observation_kind": "TYPED_CYCLE", "status": "WITNESSED", "evidence_ids": ["sr-evidence:zenodo:20481586:institutional-recoil-theorem", "sr-evidence:zenodo:20481650:institutional-recoil-conceptual", "sr-evidence:substack:200054910:institutional-recoil-conceptual-surface", "sr-evidence:substack:200057627:institutional-recoil-theorem-surface"], "zenodo_order": ["zenodo:20481586", "zenodo:20481650"], "substack_order": ["substack:200054910", "substack:200057627"], "closure_type": "SURFACE_RELATIVE_CHRONOLOGY", "interpretive_limit": "Do not impose a universal work order from either platform."},
        {"schema_version": "graph-assay-observation/v1", "observation_id": "sr-graph-observation:early-compiler-cascade", "observation_kind": "FIRST_APPEARANCE", "status": "WITNESSED", "evidence_ids": ["sr-evidence:zenodo:18218135:grand-unified-harm-compiler", "sr-evidence:zenodo:18237936:forensic-authorship-canonical-reference", "sr-evidence:zenodo:18239086:codex-seventy-essay-compiler", "sr-evidence:zenodo-created:early-compiler-cascade"], "ordered_manifestations": ["zenodo:18218135", "zenodo:18237936", "zenodo:18239086"], "observed": "Grand Unified Theory compiles a core lineage; the Authorship Capsule promotes it as canonical reference; the Codex then compiles a seventy-essay machine-legible discipline", "hypothesis_effect": "retrospective compilation is witnessed in the early canon, not only in late field manuscripts", "interpretive_limit": "The sequence may reflect rapid retrospective organization rather than a preplanned hidden architecture; source descriptions and manifestation times are not composition histories."},
        {"schema_version": "graph-assay-observation/v1", "observation_id": "sr-graph-observation:canonical-reference-continuity-unresolved", "observation_kind": "SELF_MAP_GRAPH_DELTA", "status": "UNRESOLVED", "evidence_ids": ["sr-evidence:zenodo:18237936:forensic-authorship-canonical-reference", "sr-evidence:zenodo:22019218:august-canon-map"], "authority_assertion_ids": ["sr-authority:gutih:canonical-reference:2026-01-13", "sr-authority:canon-map:constitution:2026-08-20"], "observed": "January names Grand Unified Theory as the broader corpus's canonical reference; August names the Canon Map as constitution and canon-admission controller", "interpretive_limit": "The later self-model does not locally state that it supersedes or demotes the earlier reference. Preserve both time-indexed authority assertions until a source links them."},
    ]

    typed_cycle_payloads = {
        "sr-graph-observation:csr-origin-typed-anti-cycle": {
            "closure_type": "CROSS_GRAPH_ANTI_CYCLE",
            "ordered_edge_ids": ["sr-edge:csr-before-origin:historical", "sr-edge:origin-before-csr:conceptual"],
            "node_ids": ["zenodo:18364461", "zenodo:18382146"],
            "graph_projections": ["HISTORICAL", "CONCEPTUAL"],
            "orders": [
                {"order_kind": "HISTORICAL", "scope_id": "surface:zenodo", "node_ids": ["zenodo:18364461", "zenodo:18382146"], "edge_ids": ["sr-edge:csr-before-origin:historical"]},
                {"order_kind": "CONCEPTUAL", "scope_id": None, "node_ids": ["zenodo:18382146", "zenodo:18364461"], "edge_ids": ["sr-edge:origin-before-csr:conceptual"]},
            ],
            "summary": "Manifestation order and source-declared conceptual precedence point in opposite directions across different graph projections.",
        },
        "sr-graph-observation:sharingan-spt-typed-cycle": {
            "closure_type": "CROSS_GRAPH_MUTUAL_REFERENCE",
            "ordered_edge_ids": ["sr-edge:sharingan-routes-to-spt", "sr-edge:spt-foundation-for-sharingan", "sr-edge:spt-complements-sharingan"],
            "node_ids": ["zenodo:21286175", "zenodo:21286263"],
            "graph_projections": ["NAVIGATIONAL", "CONCEPTUAL"],
            "orders": [
                {"order_kind": "NAVIGATIONAL", "scope_id": None, "node_ids": ["zenodo:21286175", "zenodo:21286263"], "edge_ids": ["sr-edge:sharingan-routes-to-spt"]},
                {"order_kind": "CONCEPTUAL", "scope_id": None, "node_ids": ["zenodo:21286263", "zenodo:21286175"], "edge_ids": ["sr-edge:spt-foundation-for-sharingan", "sr-edge:spt-complements-sharingan"]},
            ],
            "predicate_triples": [
                ["zenodo:21286175", "NAVIGATES_TO", "zenodo:21286263"],
                ["zenodo:21286263", "METHODOLOGICAL_FOUNDATION_FOR", "zenodo:21286175"],
                ["zenodo:21286263", "COMPLEMENTS", "zenodo:21286175"],
            ],
            "summary": "Navigation closes against two conceptual predicates, while the conceptual edges themselves are not reciprocal.",
        },
        "sr-graph-observation:world-infrastructure-typed-cycle": {
            "closure_type": "RECIPROCAL_TYPED_PAIR",
            "ordered_edge_ids": ["sr-edge:world-foundation-for-global-instability", "sr-edge:global-instability-applied-counterpart-to-world"],
            "node_ids": ["zenodo:18926742", "zenodo:18926916"],
            "graph_projections": ["CONCEPTUAL", "OPERATIONAL"],
            "orders": [],
            "predicate_triples": [
                ["zenodo:18926742", "FOUNDATION_FOR", "zenodo:18926916"],
                ["zenodo:18926916", "APPLIED_COUNTERPART_TO", "zenodo:18926742"],
            ],
            "summary": "A theory/application pair forms a closed walk under distinct typed predicates.",
        },
        "sr-graph-observation:sr-caf-chronology-dependency-anti-cycle": {
            "closure_type": "CROSS_GRAPH_ANTI_CYCLE",
            "ordered_edge_ids": ["sr-edge:sr-caf-formal-before-conceptual:historical", "sr-edge:sr-caf-conceptual-foundation-for-formal"],
            "node_ids": ["zenodo:20436807", "zenodo:20436955"],
            "graph_projections": ["HISTORICAL", "CONCEPTUAL"],
            "orders": [
                {"order_kind": "HISTORICAL", "scope_id": "surface:zenodo", "node_ids": ["zenodo:20436807", "zenodo:20436955"], "edge_ids": ["sr-edge:sr-caf-formal-before-conceptual:historical"]},
                {"order_kind": "CONCEPTUAL", "scope_id": None, "node_ids": ["zenodo:20436955", "zenodo:20436807"], "edge_ids": ["sr-edge:sr-caf-conceptual-foundation-for-formal"]},
            ],
            "summary": "The formal manifestation precedes the conceptual manifestation while the latter is source-declared as conceptual foundation.",
        },
        "sr-graph-observation:institutional-recoil-surface-relative-order": {
            "closure_type": "SURFACE_RELATIVE_CHRONOLOGY",
            "ordered_edge_ids": ["sr-edge:recoil-theorem-before-conceptual:zenodo", "sr-edge:recoil-conceptual-before-theorem:substack"],
            "node_ids": ["zenodo:20481586", "zenodo:20481650", "substack:200054910", "substack:200057627"],
            "graph_projections": ["HISTORICAL"],
            "orders": [
                {"order_kind": "HISTORICAL", "scope_id": "surface:zenodo", "node_ids": ["zenodo:20481586", "zenodo:20481650"], "edge_ids": ["sr-edge:recoil-theorem-before-conceptual:zenodo"]},
                {"order_kind": "HISTORICAL", "scope_id": "surface:substack", "node_ids": ["substack:200054910", "substack:200057627"], "edge_ids": ["sr-edge:recoil-conceptual-before-theorem:substack"]},
            ],
            "summary": "The same lineage has opposite manifestation order on Zenodo and Substack.",
        },
    }

    upgraded_graph_observations = []
    for item in graph_observations:
        oid = item["observation_id"]
        kind = item["observation_kind"]
        summary_text = item.get("observed") or item.get("result") or "Bounded graph observation"
        if kind == "TYPED_CYCLE":
            payload = typed_cycle_payloads[oid]
        elif kind == "PROVENANCE_CONTRADICTION":
            payload = {"summary": summary_text, "subject_ids": item.get("subject_ids", []), "conflicting_reference_ids": [], "repair_status": "PRESERVED_UNREPAIRED"}
        elif kind == "FIRST_APPEARANCE":
            ordered = item.get("ordered_manifestations", [])
            if oid == "sr-graph-observation:latent-and-retrospective-star":
                ordered = ["zenodo:18097491", "zenodo:18097568", "zenodo:18098106"]
            payload = {"summary": summary_text, "hypothesis_effect": item.get("hypothesis_effect"), "ordered_manifestation_ids": ordered, "search_scope_id": "sr-search-scope:phase15-local-metadata"}
        elif kind == "SELF_MAP_GRAPH_DELTA":
            authority_ids = item.get("authority_assertion_ids", [])
            payload = {
                "summary": summary_text,
                "comparison_mode": "AUTHORITY_CONTINUITY" if authority_ids else "C_TIME_SERIES",
                "c_snapshot_ids": item.get("c_snapshot_ids", []),
                "g_snapshot_ids": [],
                "authority_assertion_ids": authority_ids,
                "node_alignments": [],
                "edge_alignments": [],
            }
        elif kind == "ORDINAL_NAMESPACE":
            cross_architecture = oid == "sr-graph-observation:declared-seven-vs-twelve"
            payload = {
                "case_type": "CROSS_ARCHITECTURE_CARDINALITY" if cross_architecture else "SERIES_ORDINAL",
                "summary": summary_text,
                "ordinal_token": None if cross_architecture else item.get("ordinal_token"),
                "candidate_namespace_ids": [] if cross_architecture else item.get("candidate_namespace_ids", []),
                "compared_structure_ids": ["sr-architecture:csr:seven-part", "sr-genealogy:codex:twelve-phase"] if cross_architecture else [],
                "expected_predecessor": None if cross_architecture else item.get("expected_predecessor"),
                "predecessor_identified": None if cross_architecture else item.get("predecessor_identified"),
            }
        elif kind == "ROUTE_CONDITIONED_ENDPOINT":
            payload = {
                "summary": summary_text,
                "router_ids": ["zenodo:18749610", "zenodo:18354721", "zenodo:18795375"],
                "entry_condition_ids": [], "route_edge_ids": [], "endpoint_ids": [], "endpoint_state_ids": [],
                "termination_state": "NOT_TESTABLE", "unresolved_reason": item.get("interpretive_limit"),
            }
        elif kind == "REPRESENTATION_COMMUTATION":
            payload = {
                "family_id": None,
                "corner_ids": {"a_s1": None, "a_s2": None, "b_s1": None, "b_s2": None},
                "surface_transformation_ids": [], "epistemic_transformation_ids": [],
                "dimension_results": {key: "NOT_TESTABLE" for key in ["concept_identity", "semantic_core", "claim_scope", "role_structure", "authority_state"]},
                "missing_requirements": [item.get("missing", summary_text)],
            }
        elif kind == "GOVERNANCE_RULE_CASE":
            if oid.endswith("v13-v14-unified"):
                subjects = ["zenodo:19356453", "zenodo:19434800", "zenodo:21970690"]
                applicability, outcome, revisions = "ESTABLISHED", "RESOLVED_BY_LATER_RULE", ["zenodo:21970690"]
            else:
                subjects = ["zenodo:21830983"]
                applicability, outcome, revisions = "UNRESOLVED", "NOT_ASSESSED", []
            payload = {"summary": summary_text, "rule_claim_id": None, "subject_case_ids": subjects, "applicability_status": applicability, "outcome": outcome, "revision_or_supersession_ids": revisions}
        else:
            raise ValueError(f"Unhandled graph observation kind: {kind}")
        upgraded_graph_observations.append({
            "schema_version": "graph-assay-observation/v2",
            "observation_id": oid,
            "observation_kind": kind,
            "status": item["status"],
            "evidence_ids": item["evidence_ids"],
            "payload": payload,
            "interpretive_limit": item["interpretive_limit"],
            "assay_id": "archive-assay:2026-08-24-phase15-authority-recompilation",
        })
    graph_observations = upgraded_graph_observations

    revision_risks = []
    for item_id, priority in [("21936716", "CRITICAL"), ("21939955", "CRITICAL"), ("21957890", "CRITICAL"), ("21612493", "HIGH"), ("21938702", "HIGH")]:
        row = manifest[item_id]
        revision_risks.append({
            "manifestation_id": f"zenodo:{item_id}",
            "title": row["title"],
            "publication_date": row.get("publication_date"),
            "source_updated_at": row.get("source_updated"),
            "metadata_version_literal": row.get("version"),
            "current_file_checksums": [f.get("source_checksum") for f in row.get("files", [])],
            "prior_bytes_locally_preserved": False,
            "risk": "AUTHORITY_BEARING_IN_PLACE_REVISION",
            "phase_2_priority": priority,
            "interpretive_limit": "A later source_updated timestamp and one current checksum show revision risk, not what changed. Publication date, update date, retrieval date, and capture hash must remain separate.",
        })

    first_appearance = [
        ["2026-01-04", "zenodo:18146890", "representational systems structure perception and shared reality", "sr-evidence:zenodo:18146890:representational-systems-shared-reality"],
        ["2026-01-04", "zenodo:18147456", "structural harm in a representational environment", "sr-evidence:zenodo:18147456:symbolic-harm-representational-environment"],
        ["2026-02-22", "zenodo:18733363", "representational compression", "sr-evidence:zenodo:18733363:representational-compression"],
        ["2026-03-09", "zenodo:18927237", "operational system diverges from self-description", "sr-evidence:zenodo:18927237:self-description-divergence"],
        ["2026-03-16", "zenodo:19041222", "visibility/representation can detach from operational reality", "sr-evidence:zenodo:19041222:visibility-representation-detachment"],
        ["2026-04-10", "zenodo:19491314", "perception limits through abstraction, fragmentation, harm, extraction, depletion", "sr-evidence:zenodo:19491314:perception-abstraction-fragmentation"],
        ["2026-05-18", "zenodo:20277246", "behavioral reality compressed into administrative representation", "sr-evidence:zenodo:20277246:administrative-representation"],
        ["2026-05-20", "zenodo:20299864", "B to O to A to S compression sequence", "sr-evidence:zenodo:20299864:compression-sequence"],
        ["2026-08-14", "zenodo:21939955", "integrated Reality to Feedback chain", "sr-evidence:zenodo:21939955:field-compiler-and-representation-chain"],
    ]
    bounded_metadata_search = {
        "search_scope_id": "sr-search-scope:phase15-local-metadata",
        "path": "01-MANIFESTS/candidate-corpus.jsonl",
        "sha256": candidate_manifest_sha256,
        "units": len(manifest),
        "fields": ["title", "description"],
        "completeness": "METADATA_ONLY_BOUNDED",
    }
    structural_anatomy = [{
        "anatomy_id": "sr-anatomy:representation-compression-self-model",
        "status": "EARLIEST_LOCAL_METADATA_CANDIDATES",
        "search_scope": bounded_metadata_search,
        "milestones": [{"date": date, "manifestation_id": mid, "relation_summary": summary, "evidence_ids": [evid]} for date, mid, summary, evid in first_appearance],
        "evidence_ids": [entry[3] for entry in first_appearance],
        "interpretive_limit": "These are earliest retained metadata expressions, not proven first appearances in full bodies; most ancestor edges remain inferred.",
    }, {
        "anatomy_id": "sr-anatomy:inquiry-denominator",
        "status": "EARLIEST_LOCAL_METADATA_CANDIDATES",
        "search_scope": bounded_metadata_search,
        "milestones": [
            {"date": "2025-12-31", "manifestation_id": "zenodo:18102693", "relation_summary": "metadata controls downstream visibility/searchability/knowability", "evidence_ids": ["sr-evidence:zenodo:18102693:metadata-downstream-visibility"]},
            {"date": "2026-02-10", "manifestation_id": "zenodo:18571484", "relation_summary": "institutional incentives determine what is studied versus unmeasured", "evidence_ids": ["sr-evidence:zenodo:18571484:incentives-select-inquiry"]},
            {"date": "2026-08-15", "manifestation_id": "zenodo:21957890", "relation_summary": "exact questions to proposals to funded projects to publications to visible knowledge to institutional reality chain", "evidence_ids": ["sr-evidence:zenodo:21957890:inquiry-denominator-and-self-application"]},
        ],
        "evidence_ids": ["sr-evidence:zenodo:18102693:metadata-downstream-visibility", "sr-evidence:zenodo:18571484:incentives-select-inquiry", "sr-evidence:zenodo:21957890:inquiry-denominator-and-self-application"],
        "interpretive_limit": "The Research Incentive Field does not explicitly identify the earlier records as predecessors in retained metadata.",
    }, {
        "anatomy_id": "sr-anatomy:supported-vs-retained-capacity",
        "status": "NOT_WITNESSED_IN_LOCAL_METADATA",
        "search_scope": bounded_metadata_search,
        "milestones": [],
        "evidence_ids": ["sr-evidence:archive-search:phase15-supported-vs-retained-capacity"],
        "interpretive_limit": "The AI withdrawal equation and retained-capacity distinction are collaborator-reported Phase 2 targets; do not encode them as source claims yet.",
    }]

    detestable_specs = [
        (1, "18776985", "Naming", "2026-02-25T15:57:51.66261-05:00"),
        (2, "18777067", "Anticipation / naming counter-moves", "2026-02-25T16:07:31.589014-05:00"),
        (3, "18777144", "Attacks interpreted as evidence", "2026-02-25T16:16:52.117128-05:00"),
        (4, "18777222", "Adaptation / restructuring", "2026-02-25T16:32:19.47992-05:00"),
        (5, "18777380", "Imitation / cosmetic absorption", "2026-02-25T16:41:45.59508-05:00"),
        (6, "18777439", "Dependency", "2026-02-25T16:55:22.371971-05:00"),
    ]
    ordinal_series = [{
        "series_observation_id": "sr-series-observation:detestable-subject:2026-02-25",
        "series_namespace_id": "sr-series:detestable-subject",
        "status": "WITNESSED_ORDERED_SIX_STAGE_ARCHITECTURE",
        "stages": [{
            "ordinal": ordinal,
            "manifestation_id": f"zenodo:{item_id}",
            "source_title": manifest[item_id]["title"],
            "source_role_summary": label,
            "manifestation_created_at": created,
            "evidence_ids": [f"sr-evidence:zenodo:{item_id}:detestable-stage-{ordinal}"],
        } for ordinal, item_id, label, created in detestable_specs],
        "later_compiler_id": "zenodo:21939955",
        "later_compiler_status": "WITNESSED_INTEGRATION",
        "normalization_limits": [
            "'Response Recursion' is collaborator normalization, not a locally witnessed source label.",
            "The retained third-stage metadata still treats attacks and omissions as confirmation/proof.",
            "The collaborator-reported observation-window and anti-self-sealing corrections are not locally witnessed and remain Phase 2 acquisition targets.",
        ],
    }, {
        "series_observation_id": "sr-series-observation:field-paper-ii:namespace-unresolved",
        "series_namespace_id": None,
        "status": "ORDINAL_OBSERVED_NAMESPACE_UNRESOLVED",
        "stages": [
            {"ordinal": 2, "manifestation_id": "zenodo:20209609", "source_title": manifest["20209609"]["title"], "source_role_summary": "Universities — Field Paper II", "manifestation_created_at": None, "evidence_ids": ["sr-evidence:zenodo:20209609:universities-field-paper-ii"]},
            {"ordinal": 2, "manifestation_id": "zenodo:20210697", "source_title": manifest["20210697"]["title"], "source_role_summary": "Ontario healthcare — Field Paper II", "manifestation_created_at": None, "evidence_ids": ["sr-evidence:zenodo:20210697:healthcare-field-paper-ii"]},
        ],
        "later_compiler_id": None,
        "later_compiler_status": "NOT_RESOLVED",
        "normalization_limits": ["II_A may differ from II_B under an unresolved namespace.", "No Field Paper I is invented from ordinal expectation alone."],
    }]

    lifecycle = [
        {"schema_version": "lifecycle-operator/v1", "operator_event_id": "sr-operator-event:star-retrospective-compile", "operator_type": "RETROSPECTIVELY_COMPILE", "input_object_ids": ["zenodo:18096652", "zenodo:18097205", "zenodo:18097491", "zenodo:18097568"], "output_object_ids": ["zenodo:18098106"], "before_state_ids": [], "after_state_ids": [], "declared_by_id": "zenodo:18098106", "temporal_provenance_mode": "RETROSPECTIVE", "realization_status": "SOURCE_DECLARED", "evidence_ids": ["sr-evidence:original:18098106:p3-p4", "sr-evidence:zenodo-page-018:compile-timestamps"], "interpretive_limit": "Same-morning compilation is bounded to this lineage; composition history remains unknown."},
        {"schema_version": "lifecycle-operator/v1", "operator_event_id": "sr-operator-event:gutih-retrospective-compile", "operator_type": "RETROSPECTIVELY_COMPILE", "input_object_ids": ["zenodo:18096652", "zenodo:18097205", "zenodo:18097491", "zenodo:18097568", "zenodo:18158616"], "output_object_ids": ["zenodo:18218135"], "before_state_ids": [], "after_state_ids": [], "declared_by_id": "zenodo:18218135", "temporal_provenance_mode": "RETROSPECTIVE", "realization_status": "SOURCE_DECLARED", "evidence_ids": ["sr-evidence:zenodo:18218135:grand-unified-harm-compiler", "sr-evidence:zenodo-created:early-compiler-cascade"], "interpretive_limit": "Early compiler event is source-declared; it does not prove those roles were planned before the input works."},
        {"schema_version": "lifecycle-operator/v1", "operator_event_id": "sr-operator-event:codex-retrospective-compile", "operator_type": "RETROSPECTIVELY_COMPILE", "input_object_ids": ["sr-corpus:signalrupture:seventy-essay-snapshot"], "output_object_ids": ["zenodo:18239086"], "before_state_ids": [], "after_state_ids": [], "declared_by_id": "zenodo:18239086", "temporal_provenance_mode": "RETROSPECTIVE", "realization_status": "SOURCE_DECLARED", "evidence_ids": ["sr-evidence:zenodo:18239086:codex-seventy-essay-compiler", "sr-evidence:zenodo-created:early-compiler-cascade"], "interpretive_limit": "The local metadata does not enumerate all seventy inputs or prove their work identities."},
        {"schema_version": "lifecycle-operator/v1", "operator_event_id": "sr-operator-event:algorithm-field-retrospective-compile", "operator_type": "RETROSPECTIVELY_COMPILE", "input_object_ids": ["sr-module:algorithmic-surface-precursors"], "output_object_ids": ["zenodo:21999553"], "before_state_ids": [], "after_state_ids": [], "declared_by_id": "zenodo:21999553", "temporal_provenance_mode": "RETROSPECTIVE", "realization_status": "SOURCE_DECLARED", "evidence_ids": ["sr-evidence:zenodo:21999553:algorithm-field-cross-surface-compiler"], "interpretive_limit": "The exact predecessor works and operator-role mapping require the field body; metadata witnesses the declared precursor cluster."},
        {"schema_version": "lifecycle-operator/v1", "operator_event_id": "sr-operator-event:legacy-reclassifies-authority", "operator_type": "RECLASSIFY_AUTHORITY", "input_object_ids": ["sr-class:legacy-sr"], "output_object_ids": ["sr-authority:legacy-sr:policy:2026-08-16"], "before_state_ids": [], "after_state_ids": ["sr-state:legacy-sr:2026-08-16"], "declared_by_id": "zenodo:21960582", "temporal_provenance_mode": "CONTEMPORANEOUS", "realization_status": "SOURCE_DECLARED", "evidence_ids": ["sr-evidence:zenodo:21960582:legacy-authority-policy"], "interpretive_limit": "Class-level transition; no work-by-work expansion."},
    ]
    for item_id, _, _, evid in map_specs:
        lifecycle.append({"schema_version": "lifecycle-operator/v1", "operator_event_id": f"sr-operator-event:issue-canon-map:{item_id}", "operator_type": "ISSUE_CANON_MAP", "input_object_ids": [], "output_object_ids": [f"sr-canon-map:{item_id}"], "before_state_ids": [], "after_state_ids": [], "declared_by_id": f"zenodo:{item_id}", "temporal_provenance_mode": "CONTEMPORANEOUS", "realization_status": "SOURCE_DECLARED", "evidence_ids": [evid], "interpretive_limit": "Map issuance is observed; map-as-compiler-release remains a testable archive hypothesis."})

    state_axis_scope = {"corpus": "local Phase 1 vault", "as_of": "2026-08-24"}
    epistemic_states = [{
        "schema_version": "epistemic-object-state/v1",
        "state_assertion_id": "sr-state:legacy-sr:2026-08-16",
        "subject_id": "sr-class:legacy-sr",
        "object_kind": "CLASS",
        "observed_at": OBSERVED_AT,
        "as_of_time": "2026-08-16",
        "knowledge_cutoff": "2026-08-24",
        "dimensions": {
            "E_existence": {"state": "SOURCE_ASSERTED", "scope": state_axis_scope, "evidence_ids": ["sr-evidence:zenodo:21960582:legacy-authority-policy"]},
            "V_visibility": {"state": "VISIBLE", "scope": state_axis_scope, "evidence_ids": ["sr-evidence:zenodo:21960582:legacy-authority-policy"]},
            "R_retrievability": {"state": "PARTIAL", "scope": state_axis_scope, "evidence_ids": ["sr-evidence:zenodo:21960582:legacy-authority-policy"]},
            "P_provenance": {"state": "PARTIAL", "scope": state_axis_scope, "evidence_ids": ["sr-evidence:zenodo:21960582:legacy-authority-policy"]},
            "L_lineage": {"state": "UNRESOLVED", "scope": state_axis_scope, "evidence_ids": ["sr-evidence:zenodo:21960582:legacy-authority-policy"]},
            "A_authority": {"state": "PARTIAL", "scope": state_axis_scope, "evidence_ids": ["sr-evidence:zenodo:21960582:legacy-authority-policy"], "authority_assertion_ids": ["sr-authority:legacy-sr:policy:2026-08-16"]},
        },
        "origin": "archive-observed",
        "evidence_ids": ["sr-evidence:zenodo:21960582:legacy-authority-policy"],
        "adjudication_status": "WITNESSED",
        "interpretive_limit": "The class exists and its policy is visible; work membership, content retrievability, lineage, and controlling formulations remain incomplete.",
    }]

    interpretation_updates = [
        {"update_id": "sr-interpretation-update:three-canon-maps", "prior": "February and August map mutation", "revised": "February, June, and August map checkpoints", "basis": ["zenodo:18737235", "zenodo:20534171", "zenodo:22019218"], "effect": "The June 9-pillar/4-layer self-model becomes a mandatory intermediate checkpoint."},
        {"update_id": "sr-interpretation-update:ordinal-namespace", "prior": "two Field Paper IIs may be an ordinal conflict", "revised": "ordinal observed; series namespace unresolved", "basis": ["zenodo:19545817", "zenodo:21185370"], "effect": "Preserve II_A and II_B candidates and expected-but-unidentified predecessors; infer no error."},
        {"update_id": "sr-interpretation-update:theorem-control", "prior": "theorem label may imply formal proof", "revised": "SR-native theorem means a claimed structural invariant/generalizability, not mathematical proof", "basis": ["zenodo:20616460"], "effect": "Every lift carries independent formalization, measurement, data, falsifier, and scope fields."},
        {"update_id": "sr-interpretation-update:retitle-phase", "prior": "surface translation may be corpus-wide", "revised": "retitling is phase-conditioned candidate: 14/17 in March-April", "basis": ["archive-assay:2026-08-23-phase15-local-architecture"], "effect": "Test within-period controls and body continuity before claiming a publishing operator."},
    ]

    coverage = [
        ("authority-state-machine", "implemented", ["authority-assertions.jsonl", "legacy-membership-candidates.jsonl", "epistemic-object-states.jsonl"]),
        ("retroactive-field-compilers", "implemented", ["recompilation-edges.jsonl", "lifecycle-operators.jsonl"]),
        ("claim-ceiling-migration", "implemented-partial", ["claim-status-events.jsonl", "claim-marker-lineage-assay.jsonl"]),
        ("sr-self-application-ledger", "instrumented", ["SELF_PERCEPTION_AND_GOVERNANCE_ASSAY.md", "claim-status-events.jsonl"]),
        ("canon-map-time-series", "implemented-three-snapshots", ["canon-map-snapshots.jsonl", "graph-assay-observations.jsonl"]),
        ("ordinal-namespaces-and-negative-topology", "implemented", ["graph-assay-observations.jsonl"]),
        ("detestable-six-state-sequence", "locally-witnessed-sequence-body-rule-pending", ["ordinal-series-observations.jsonl", "phase-2-acquisition-priorities.jsonl"]),
        ("representation-compression-first-appearance", "implemented-metadata-bounded", ["structural-anatomy-candidates.jsonl"]),
        ("research-incentive-denominator-ancestry", "implemented-metadata-bounded", ["structural-anatomy-candidates.jsonl"]),
        ("supported-vs-retained-capacity", "not-locally-witnessed-gated", ["structural-anatomy-candidates.jsonl", "phase-2-acquisition-priorities.jsonl"]),
        ("surface-withdrawal-six-dimensions", "schema-and-instrument-ready-no-simulation-run", ["surface-withdrawal-result.schema.json", "SURFACE_WITHDRAWAL_ASSAY.md"]),
        ("phase-conditioned-retitles", "implemented-exploratory", ["retitle-phase-controls.json"]),
        ("maps-as-checkpoints", "hypothesis-instrumented", ["canon-map-snapshots.jsonl", "lifecycle-operators.jsonl"]),
        ("latent-vs-retrospective-architecture", "first-bounded-positive-case", ["graph-assay-observations.jsonl", "recompilation-edges.jsonl"]),
        ("self-recalibration", "instrumented-no-global-promotion", ["VERSIONED_EPISTEMIC_SYSTEM.md", "claim-status-events.jsonl"]),
        ("typed-companion-cycles", "implemented", ["graph-assay-observations.jsonl"]),
        ("representation-lift-grammar", "implemented-candidate-registry", ["representation-lift-candidates.jsonl", "representation-families.jsonl"]),
        ("author-self-map-vs-reconstructed-graph", "schema-ready-partial-not-testable", ["SELF_PERCEPTION_AND_GOVERNANCE_ASSAY.md", "graph-assay-observations.jsonl"]),
        ("epistemic-object-lifecycle", "schema-and-two-events-implemented", ["lifecycle-operators.jsonl", "epistemic-object-states.jsonl"]),
        ("route-conditioned-retrieval", "instrumented-endpoints-unresolved", ["REPRESENTATION_AND_ROUTE_ASSAY.md", "graph-assay-observations.jsonl"]),
        ("surface-vs-epistemic-commutation", "instrumented-not-testable", ["REPRESENTATION_AND_ROUTE_ASSAY.md", "graph-assay-observations.jsonl"]),
        ("historical-conceptual-operational-separation", "implemented-schema-and-vocabulary", ["relation-assertion-v2.schema.json", "RELATION_VOCABULARY.md"]),
        ("governance-coherence", "one-resolved-one-unresolved-case", ["graph-assay-observations.jsonl"]),
        ("existence-visibility-retrieval-provenance-lineage-authority", "implemented-schema-and-class-state", ["epistemic-object-state.schema.json", "epistemic-object-states.jsonl"]),
        ("content-lineage-authority-survival", "implemented-distinct-axes", ["VERSIONED_EPISTEMIC_SYSTEM.md", "SURFACE_WITHDRAWAL_ASSAY.md"]),
        ("theorem-label-not-authority", "implemented-control", ["evidence-taxonomy-observations.jsonl", "interpretation-updates.jsonl"]),
        ("seven-part-vs-twelve-phase", "kept-separate-unresolved", ["graph-assay-observations.jsonl"]),
        ("origin-csr-governance-legacy-lifecycle", "kept-as-inferred-model-only", ["VERSIONED_EPISTEMIC_SYSTEM.md"]),
        ("formal-fiction-governance-three-corpora", "preserved-from-prior-phase15-and-cross-query-ready", ["2026-08-23-phase15-local-architecture/summary.json", "DISTRIBUTED_ARCHITECTURE.md"]),
        ("early-compiler-cascade", "new-locally-witnessed-sequence", ["recompilation-edges.jsonl", "lifecycle-operators.jsonl", "graph-assay-observations.jsonl"]),
        ("algorithm-field-cross-surface-compiler", "locally-witnessed-precursor-cluster-targets-partial", ["recompilation-edges.jsonl", "phase-2-acquisition-priorities.jsonl"]),
        ("canonical-reference-authority-continuity", "two-time-indexed-assertions-link-unresolved", ["authority-assertions.jsonl", "graph-assay-observations.jsonl"]),
        ("phase-2-network-acquisition", "not-run-human-gate-closed", ["curated-summary.json"]),
    ]
    coverage_paths = {
        "authority-assertions.jsonl": "05-OPERATIONS/authority/authority-assertions.jsonl",
        "legacy-membership-candidates.jsonl": "05-OPERATIONS/authority/legacy-membership-candidates.jsonl",
        "epistemic-object-states.jsonl": "05-OPERATIONS/state/epistemic-object-states.jsonl",
        "recompilation-edges.jsonl": "05-OPERATIONS/relations/recompilation-edges.jsonl",
        "lifecycle-operators.jsonl": "05-OPERATIONS/operators/lifecycle-operators.jsonl",
        "claim-status-events.jsonl": "05-OPERATIONS/claims/claim-status-events.jsonl",
        "claim-marker-lineage-assay.jsonl": "04-RECEIPTS/assays/2026-08-24-phase15-authority-recompilation/lexical/claim-marker-lineage-assay.jsonl",
        "SELF_PERCEPTION_AND_GOVERNANCE_ASSAY.md": "06-INSTRUMENTS/SELF_PERCEPTION_AND_GOVERNANCE_ASSAY.md",
        "canon-map-snapshots.jsonl": "05-OPERATIONS/maps/canon-map-snapshots.jsonl",
        "graph-assay-observations.jsonl": "04-RECEIPTS/assays/2026-08-24-phase15-authority-recompilation/graph-assay-observations.jsonl",
        "ordinal-series-observations.jsonl": "05-OPERATIONS/relations/ordinal-series-observations.jsonl",
        "phase-2-acquisition-priorities.jsonl": "04-RECEIPTS/assays/2026-08-24-phase15-authority-recompilation/phase-2-acquisition-priorities.jsonl",
        "structural-anatomy-candidates.jsonl": "05-OPERATIONS/relations/structural-anatomy-candidates.jsonl",
        "surface-withdrawal-result.schema.json": "01-MANIFESTS/schemas/surface-withdrawal-result.schema.json",
        "SURFACE_WITHDRAWAL_ASSAY.md": "06-INSTRUMENTS/SURFACE_WITHDRAWAL_ASSAY.md",
        "retitle-phase-controls.json": "04-RECEIPTS/assays/2026-08-24-phase15-authority-recompilation/lexical/retitle-phase-controls.json",
        "VERSIONED_EPISTEMIC_SYSTEM.md": "06-INSTRUMENTS/VERSIONED_EPISTEMIC_SYSTEM.md",
        "representation-lift-candidates.jsonl": "05-OPERATIONS/relations/representation-lift-candidates.jsonl",
        "representation-families.jsonl": "05-OPERATIONS/relations/representation-families.jsonl",
        "REPRESENTATION_AND_ROUTE_ASSAY.md": "06-INSTRUMENTS/REPRESENTATION_AND_ROUTE_ASSAY.md",
        "relation-assertion-v2.schema.json": "01-MANIFESTS/schemas/relation-assertion-v2.schema.json",
        "epistemic-object-state.schema.json": "01-MANIFESTS/schemas/epistemic-object-state.schema.json",
        "RELATION_VOCABULARY.md": "05-OPERATIONS/relations/RELATION_VOCABULARY.md",
        "evidence-taxonomy-observations.jsonl": "05-OPERATIONS/claims/evidence-taxonomy-observations.jsonl",
        "interpretation-updates.jsonl": "04-RECEIPTS/assays/2026-08-24-phase15-authority-recompilation/interpretation-updates.jsonl",
        "2026-08-23-phase15-local-architecture/summary.json": "04-RECEIPTS/assays/2026-08-23-phase15-local-architecture/summary.json",
        "DISTRIBUTED_ARCHITECTURE.md": "06-INSTRUMENTS/DISTRIBUTED_ARCHITECTURE.md",
        "curated-summary.json": "04-RECEIPTS/assays/2026-08-24-phase15-authority-recompilation/curated-summary.json",
    }

    def classify_coverage(raw_status):
        lowered = raw_status.lower()
        if "human-gate" in lowered or raw_status == "not-run-human-gate-closed":
            return "HUMAN_GATED", "HUMAN_GATED", ["sr-gate:phase2:closed"]
        if "not-locally-witnessed" in lowered:
            return "BLOCKED", "BLOCKED_BY_SOURCE", ["sr-blocker:source-body-not-locally-preserved"]
        if "schema" in lowered or "not-testable" in lowered or "instrumented" in lowered or "hypothesis" in lowered:
            return "SCHEMA_ONLY", "SCHEMA_ONLY", []
        if "partial" in lowered or "unresolved" in lowered or "pending" in lowered or "no-simulation" in lowered or "inferred" in lowered:
            return "PARTIAL", "SEEDED", []
        return "IMPLEMENTED", "BOUNDED_EXECUTED", []

    coverage_rows = []
    for trail, raw_status, files in coverage:
        audit_status, reachability, blocker_ids = classify_coverage(raw_status)
        coverage_rows.append({
            "schema_version": "coverage-entry/v1",
            "trail_id": trail,
            "audit_status": audit_status,
            "reachability": reachability,
            "source_status_raw": raw_status,
            "implemented_in": [coverage_paths[name] for name in files],
            "blocker_ids": blocker_ids,
            "phase_2_run": False,
            "interpretive_limit": "Coverage records implementation reachability in this bounded local assay; it does not promote blocked or schema-only trails to findings.",
        })

    phase2_priorities = [
        {"priority": 1, "target_ids": ["zenodo:21936716", "zenodo:21939955", "zenodo:21957890", "zenodo:21960582", "zenodo:21938702", "zenodo:21612493"], "reason": "authority-bearing, compiler, or self-model pages changed in place after publication", "gate": "PHASE_2_HUMAN_GATE_CLOSED"},
        {"priority": 2, "target_ids": ["zenodo:22019218", "zenodo:20534171", "zenodo:18737235", "zenodo:18749610"], "reason": "full map enumerations and route destinations are required for C_t/G_t and route-conditioned assays", "gate": "PHASE_2_HUMAN_GATE_CLOSED"},
        {"priority": 3, "target_ids": ["sr-family:representation-lifts", "zenodo:21999553"], "reason": "body-level semantic, scope, causality, caveat, falsifier, and the Algorithm Field's exact cross-surface predecessor-role mapping are required", "gate": "PHASE_2_HUMAN_GATE_CLOSED"},
        {"priority": 4, "target_ids": ["zenodo:21939955", "zenodo:21936716"], "reason": "collaborator-reported E1-E5, withdrawal, observation-window, counterevidence, and capacity-retention passages are not locally witnessed", "gate": "PHASE_2_HUMAN_GATE_CLOSED"},
        {"priority": 5, "target_ids": ["sr-set:17-retitled-pairs", "sr-set:74-unchanged-pairs"], "reason": "test phase-conditioned body continuity and register direction with within-period controls", "gate": "PHASE_2_HUMAN_GATE_CLOSED"},
    ]

    def deduplicate(rows, key):
        indexed = {}
        for row in rows:
            indexed[row[key]] = row
        return [indexed[item_id] for item_id in sorted(indexed)]

    compiler_input_path = vault / "05-OPERATIONS" / "relations" / "compiler-input-candidates.jsonl"
    compiler_input_candidates = [row for _, row in read_jsonl(compiler_input_path)] if compiler_input_path.is_file() else []

    supplemental_paths = [
        Path(__file__).with_name("phase15_additional_family_findings.json"),
        Path(__file__).with_name("phase15_additional_compiler_findings.json"),
    ]
    for supplemental_path in supplemental_paths:
        if not supplemental_path.is_file():
            continue
        supplemental = json.loads(supplemental_path.read_text(encoding="utf-8-sig"))
        for spec in supplemental.get("evidence_specs", []):
            if spec.get("evidence_id"):
                evidence.append(dict(spec))
                continue
            manifestation_id = spec["manifestation_id"]
            label = spec["label"]
            if manifestation_id.startswith("zenodo:"):
                evidence.append(zevidence(manifestation_id.split(":", 1)[1], label))
            elif manifestation_id.startswith("substack:"):
                item_id = manifestation_id.split(":", 1)[1]
                row = substack[item_id]
                evidence.append({
                    "evidence_id": f"sr-evidence:substack:{item_id}:{label}",
                    "manifestation_id": manifestation_id,
                    "source_path": "01-MANIFESTS/platforms/substack.jsonl",
                    "source_locator": {"jsonl_line": substack_line[item_id], "fields": ["title", "subtitle", "published_at"]},
                    "source_title": row["title"],
                    "source_publication_at": row.get("published_at"),
                    "evidence_kind": "CAPTURED_PLATFORM_CATALOG_METADATA",
                    "label": label,
                    "interpretive_limit": "The local catalog preserves title/subtitle/time but not the page body or edit history.",
                })
        if supplemental_path.name.endswith("family_findings.json"):
            typed_graph_edges.extend(supplemental.get("relation_assertions", []))
        else:
            recompilation_edges.extend(supplemental.get("relation_assertions", []))
        transformations.extend(supplemental.get("transformation_assertions", []))
        representation_families.extend(supplemental.get("representation_families", []))
        claim_events.extend(supplemental.get("claim_status_events", []))
        authority.extend(supplemental.get("authority_assertions", []))
        graph_observations.extend(supplemental.get("graph_observations", []))
        ordinal_series.extend(supplemental.get("ordinal_series_observations", []))
        lifecycle.extend(supplemental.get("lifecycle_operators", []))
        compiler_input_candidates.extend(supplemental.get("compiler_input_candidates", []))
        phase2_priorities.extend(supplemental.get("phase2_acquisition_priorities", []))

    authority.extend([
        {
            "schema_version": "authority-assertion/v1",
            "authority_assertion_id": "sr-authority:zombie-society:canonical-entry:2026-04-25",
            "subject": {"id": "zenodo:19672591", "kind": "WORK"},
            "declared_by": {"manifestation_id": "zenodo:19766913", "work_id": None},
            "scope": {"kind": "CANON", "raw_scope": "Zombie Society as the canonical entry text and primary reference object for the declared paradigm"},
            "source_asserted_at": {"value": "2026-04-25", "precision": "DAY", "basis": "SOURCE_PUBLICATION_METADATA"},
            "effective_from": {"value": None, "basis": "UNSTATED"}, "recorded_at": OBSERVED_AT,
            "authority": {
                "G_genealogical": axis("AFFIRMED", "foundational declaration", ["sr-evidence:zenodo:19766913:late-drift-paradigm-authority"]),
                "C_canonical": axis("AFFIRMED", "canonical entry text", ["sr-evidence:zenodo:19766913:late-drift-paradigm-authority"]),
                "E_empirical": axis("UNSTATED", None, []),
                "F_field_defining": axis("AFFIRMED", "primary reference object for the paradigm", ["sr-evidence:zenodo:19766913:late-drift-paradigm-authority"]),
                "K_controlling": {"state": "CONTROLLING", "formulation_ids": ["sr-formulation:zombie-society:19766913"], "source_status_raw": "primary reference object", "evidence_ids": ["sr-evidence:zenodo:19766913:late-drift-paradigm-authority"]},
            },
            "origin": "explicit-source", "temporal_provenance_mode": "RETROSPECTIVE", "adjudication_status": "WITNESSED",
            "prior_assertion_ids": [], "individual_expansion_status": "NOT_APPLICABLE",
            "evidence_ids": ["sr-evidence:zenodo:19766913:late-drift-paradigm-authority"],
            "interpretive_limit": "This April authority claim does not supersede January, July, or August anchors and is not a finding that the archive endorses the paradigm.",
        },
        {
            "schema_version": "authority-assertion/v1",
            "authority_assertion_id": "sr-authority:what-is-sr:constitution:2026-08-20",
            "subject": {"id": "zenodo:22019518", "kind": "WORK"},
            "declared_by": {"manifestation_id": "zenodo:22019518", "work_id": None},
            "scope": {"kind": "CANON", "raw_scope": "authoritative definition, constitutional document, and foundational canon node for SignalRupture"},
            "source_asserted_at": {"value": "2026-08-19", "precision": "DAY", "basis": "SOURCE_PUBLICATION_METADATA"},
            "effective_from": {"value": None, "basis": "UNSTATED"}, "recorded_at": OBSERVED_AT,
            "authority": {
                "G_genealogical": axis("AFFIRMED", "foundational canon node", ["sr-evidence:zenodo:22019518:what-is-sr-constitution"]),
                "C_canonical": axis("AFFIRMED", "authoritative definition / constitutional document", ["sr-evidence:zenodo:22019518:what-is-sr-constitution"]),
                "E_empirical": axis("UNSTATED", None, []),
                "F_field_defining": axis("AFFIRMED", "anchor that makes SR a field rather than a collection", ["sr-evidence:zenodo:22019518:what-is-sr-constitution"]),
                "K_controlling": {"state": "CONTROLLING", "formulation_ids": ["sr-formulation:what-is-sr:22019518"], "source_status_raw": "authoritative definition", "evidence_ids": ["sr-evidence:zenodo:22019518:what-is-sr-constitution"]},
            },
            "origin": "explicit-source", "temporal_provenance_mode": "CONTEMPORANEOUS", "adjudication_status": "WITNESSED",
            "prior_assertion_ids": [], "individual_expansion_status": "NOT_APPLICABLE",
            "evidence_ids": ["sr-evidence:zenodo:22019518:what-is-sr-constitution"],
            "interpretive_limit": "No local source says this assertion supersedes the July Flagship, April paradigm anchor, January canonical reference, or next-day Canon Map.",
        },
    ])

    ordinal_series.append({
        "series_observation_id": "sr-series-observation:five-theorem-canon:creation-order-anomaly",
        "series_namespace_id": "sr-series:five-theorem-canon",
        "status": "UNRESOLVED",
        "stages": [
            {"ordinal": 1, "manifestation_id": "zenodo:20277246", "source_title": manifest["20277246"]["title"], "source_role_summary": "foundational theorem; first ordinal is candidate, not explicit", "manifestation_created_at": manifest["20277246"].get("source_updated"), "evidence_ids": ["sr-evidence:zenodo:20277246:administrative-representation"]},
            {"ordinal": 2, "manifestation_id": "zenodo:20300880", "source_title": manifest["20300880"]["title"], "source_role_summary": "explicit second theorem", "manifestation_created_at": "2026-05-19T21:16:00-04:00", "evidence_ids": ["sr-evidence:zenodo:20300880:theorem-ii"]},
            {"ordinal": 3, "manifestation_id": "zenodo:20300549", "source_title": manifest["20300549"]["title"], "source_role_summary": "explicit third theorem", "manifestation_created_at": "2026-05-19T20:20:00-04:00", "evidence_ids": ["sr-evidence:zenodo:20300549:theorem-iii"]},
            {"ordinal": 4, "manifestation_id": "zenodo:20300167", "source_title": manifest["20300167"]["title"], "source_role_summary": "explicit fourth theorem", "manifestation_created_at": "2026-05-19T19:54:00-04:00", "evidence_ids": ["sr-evidence:zenodo:20300167:theorem-iv"]},
            {"ordinal": 5, "manifestation_id": "zenodo:20300442", "source_title": manifest["20300442"]["title"], "source_role_summary": "explicit fifth theorem", "manifestation_created_at": "2026-05-19T20:05:00-04:00", "evidence_ids": ["sr-evidence:zenodo:20300442:theorem-v"]},
        ],
        "later_compiler_id": "zenodo:20300659", "later_compiler_status": "WITNESSED_INTEGRATION",
        "normalization_limits": ["The first ordinal remains a candidate.", "The compiler manifested before the locally witnessed second theorem.", "Manifestation order is not composition order."],
    })

    lifecycle.extend([
        {"schema_version": "lifecycle-operator/v1", "operator_event_id": "sr-operator-event:society-blueprint-predeclared-compile", "operator_type": "RETROSPECTIVELY_COMPILE", "input_object_ids": ["zenodo:19055447", "zenodo:19055605", "zenodo:19055681", "zenodo:19055780", "zenodo:19055861", "sr-set:society-blueprint-six-earlier-domains"], "output_object_ids": ["zenodo:19058522"], "before_state_ids": [], "after_state_ids": [], "declared_by_id": "zenodo:19058522", "temporal_provenance_mode": "RETROSPECTIVE", "realization_status": "SOURCE_DECLARED", "evidence_ids": ["sr-evidence:zenodo:19055447:society-blueprint-ai-module", "sr-evidence:zenodo:19055605:society-blueprint-legal-module", "sr-evidence:zenodo:19055681:society-blueprint-food-water-module", "sr-evidence:zenodo:19055780:society-blueprint-law-module", "sr-evidence:zenodo:19055861:society-blueprint-government-module", "sr-evidence:zenodo:19058522:society-blueprint-compiler"], "interpretive_limit": "Five modules forward-declare the Blueprint and the compiler later assigns infrastructure roles; source and compiler role vocabularies remain separate."},
        {"schema_version": "lifecycle-operator/v1", "operator_event_id": "sr-operator-event:five-theorem-canon-precompiles-second", "operator_type": "RETROSPECTIVELY_COMPILE", "input_object_ids": ["sr-series:five-theorem-canon"], "output_object_ids": ["zenodo:20300659"], "before_state_ids": [], "after_state_ids": [], "declared_by_id": "zenodo:20300659", "temporal_provenance_mode": "UNRESOLVED", "realization_status": "ARCHIVE_OBSERVED", "evidence_ids": ["sr-evidence:zenodo:20300659:five-theorem-compiler", "sr-evidence:zenodo:20300880:theorem-ii"], "interpretive_limit": "The compiler precedes the local Theorem II manifestation; private composition or source-order may differ."},
        {"schema_version": "lifecycle-operator/v1", "operator_event_id": "sr-operator-event:field-paper-suite-to-epistemic-substrate", "operator_type": "RETROSPECTIVELY_COMPILE", "input_object_ids": ["zenodo:20209609", "zenodo:20210697", "zenodo:20210828", "zenodo:20211053"], "output_object_ids": ["zenodo:20211214"], "before_state_ids": [], "after_state_ids": [], "declared_by_id": "zenodo:20211214", "temporal_provenance_mode": "RETROSPECTIVE", "realization_status": "SOURCE_DECLARED", "evidence_ids": ["sr-evidence:zenodo:20211214:epistemic-substrate-compiler"], "interpretive_limit": "The cross-domain substrate is source-declared; duplicate Field Paper II labels remain unresolved."},
        {"schema_version": "lifecycle-operator/v1", "operator_event_id": "sr-operator-event:policy-substrate-reclassifies-authority", "operator_type": "RECLASSIFY_AUTHORITY", "input_object_ids": ["sr-authority:policy-substrate:field-declaration:2026-08-10"], "output_object_ids": ["sr-authority:policy-substrate:framework-reclassification:2026-08-21"], "before_state_ids": [], "after_state_ids": [], "declared_by_id": "zenodo:22047892", "temporal_provenance_mode": "RETROSPECTIVE", "realization_status": "SOURCE_DECLARED", "evidence_ids": ["sr-evidence:zenodo:21866116:policy-substrate-field-declaration", "sr-evidence:zenodo:22047892:policy-substrate-reclassification"], "interpretive_limit": "The exact textual transition is obscured by an in-place update to the earlier record."},
    ])

    graph_observations.append({
        "schema_version": "graph-assay-observation/v2", "observation_id": "sr-graph-observation:multiple-whole-canon-authority-anchors",
        "observation_kind": "SELF_MAP_GRAPH_DELTA", "status": "UNRESOLVED",
        "evidence_ids": ["sr-evidence:zenodo:18237936:forensic-authorship-canonical-reference", "sr-evidence:zenodo:19766913:late-drift-paradigm-authority", "sr-evidence:zenodo:21185370:flagship-canonical-reference", "sr-evidence:zenodo:22019518:what-is-sr-constitution", "sr-evidence:zenodo:22019218:august-canon-map"],
        "payload": {"summary": "January, April, July, and two August sources make overlapping canon-level authority claims without a witnessed supersession chain.", "comparison_mode": "AUTHORITY_CONTINUITY", "c_snapshot_ids": ["sr-canon-map:22019218"], "g_snapshot_ids": [], "authority_assertion_ids": ["sr-authority:gutih:canonical-reference:2026-01-13", "sr-authority:zombie-society:canonical-entry:2026-04-25", "sr-authority:flagship:canonical-reference:2026-07-04", "sr-authority:what-is-sr:constitution:2026-08-20", "sr-authority:canon-map:constitution:2026-08-20"], "node_alignments": [], "edge_alignments": []},
        "interpretive_limit": "Do not choose the newest assertion as current control without a source-declared CURRENT_CONTROLS or SUPERSEDES_SCOPE edge.",
        "assay_id": "archive-assay:2026-08-24-phase15-authority-recompilation",
    })

    supplemental_graph_payloads = {
        "sr-graph-observation:stylometric-register-and-surface-commutation": {
            "family_id": "sr-family:stylometric-publishing",
            "corner_ids": {"a_s1": "zenodo:18281149", "a_s2": "substack:184882532", "b_s1": "zenodo:18282231", "b_s2": None},
            "surface_transformation_ids": ["sr-transform:stylometric-trio-to-substack-unified"],
            "epistemic_transformation_ids": ["sr-transform:stylometric-theory-to-method", "sr-transform:stylometric-theory-method-to-architecture"],
            "dimension_results": {key: "NOT_TESTABLE" for key in ["concept_identity", "semantic_core", "claim_scope", "role_structure", "authority_state"]},
            "missing_requirements": ["No complete four-corner family with captured bodies and witnessed work identity."],
        },
        "sr-graph-observation:logic-cop-companion-metadata-contamination": {
            "summary": "Record 18827811 is titled The Logic Cop Problem but its description speaks as A Forensic Method and refers to The Logic Cop Problem as a companion.",
            "subject_ids": ["zenodo:18827727", "zenodo:18827811"],
            "conflicting_reference_ids": ["sr-edge:logic-cop-problem-diagnostic-counterpart", "sr-edge:forensic-method-read-alongside-logic-cop-problem"],
            "repair_status": "PRESERVED_UNREPAIRED",
        },
        "sr-graph-observation:zombie-qualitative-quantitative-cycle": {
            "closure_type": "RECIPROCAL_TYPED_PAIR",
            "ordered_edge_ids": ["sr-edge:zombie-society-points-to-quantitative-systems", "sr-edge:zombie-systems-underlies-society", "sr-edge:zombie-systems-mathematical-foundation-for-society"],
            "node_ids": ["zenodo:19672591", "zenodo:19672759"],
            "graph_projections": ["CONCEPTUAL"],
            "orders": [],
            "predicate_triples": [
                ["zenodo:19672591", "QUALITATIVE_STATE_DISTINGUISHED_FROM_QUANTITATIVE_ARCHITECTURE", "zenodo:19672759"],
                ["zenodo:19672759", "QUANTITATIVE_ARCHITECTURE_UNDERLYING", "zenodo:19672591"],
                ["zenodo:19672759", "MATHEMATICAL_FOUNDATION_FOR", "zenodo:19672591"],
            ],
            "summary": "Qualitative and quantitative representations point to one another under distinct conceptual predicates.",
        },
        "sr-graph-observation:conspiracy-four-stage-pipeline": {
            "summary": "Source metadata stages conceptual, empirical, generative, and forecasting representations within roughly four hours.",
            "hypothesis_effect": "Supports a deliberately staged representation-lift pipeline in this bounded lineage.",
            "ordered_manifestation_ids": ["zenodo:20075091", "zenodo:20076214", "zenodo:20076616", "zenodo:20076708"],
            "search_scope_id": "sr-search-scope:phase15-local-metadata",
        },
        "sr-graph-observation:additional-field-paper-ordinal-namespace": {
            "case_type": "SERIES_ORDINAL",
            "summary": "Universities and healthcare each self-label as Field Paper II, followed by Government III and Technology IV.",
            "ordinal_token": "II",
            "candidate_namespace_ids": ["sr-series:field-paper:universities", "sr-series:field-paper:public-health"],
            "compared_structure_ids": ["zenodo:20209609", "zenodo:20210697", "zenodo:20210828", "zenodo:20211053"],
            "expected_predecessor": True,
            "predecessor_identified": False,
        },
        "sr-graph-observation:ground-truth-three-day-recompilation": {
            "summary": "The same metric tuple and ten-domain design move from theory to empirical application to theorem on consecutive days.",
            "hypothesis_effect": "Candidate rapid recompilation of one research object; stages must not be counted as independent confirmations.",
            "ordered_manifestation_ids": ["zenodo:20244966", "zenodo:20258344", "zenodo:20277246"],
            "search_scope_id": "sr-search-scope:phase15-local-metadata",
        },
        "sr-graph-observation:policy-substrate-authority-reclassification": {
            "summary": "The same named construct is declared an autonomous field and later classified as a specialized framework with empirical gates.",
            "rule_claim_id": "sr-claim:policy-substrate-field-status",
            "subject_case_ids": ["zenodo:21866116", "zenodo:22047892"],
            "applicability_status": "ESTABLISHED",
            "outcome": "CONFLICT_WITNESSED",
            "revision_or_supersession_ids": ["zenodo:22047892"],
        },
        "sr-graph-observation:additional-pair-grammar-time-shift": {
            "summary": "Pair grammar shifts from role triptychs through companion pairs and staged programs to field translation and authority reclassification.",
            "hypothesis_effect": "Supports phase-conditioned publishing grammar rather than one stationary corpus operator.",
            "ordered_manifestation_ids": ["zenodo:18281149", "zenodo:18827727", "zenodo:19672759", "zenodo:20076616", "zenodo:20534268", "zenodo:21185370", "zenodo:22047892"],
            "search_scope_id": "sr-search-scope:phase15-local-metadata",
        },
    }
    strict_graph_keys = {"schema_version", "observation_id", "observation_kind", "status", "evidence_ids", "payload", "interpretive_limit", "assay_id"}
    for index, row in enumerate(graph_observations):
        if row.get("schema_version") == "graph-assay-observation/v2" and set(row).issubset(strict_graph_keys):
            continue
        oid = row["observation_id"]
        kind = row["observation_kind"]
        source_payload = row.get("payload", {})
        if oid in supplemental_graph_payloads:
            payload = supplemental_graph_payloads[oid]
        elif kind == "PROVENANCE_CONTRADICTION":
            payload = {
                "summary": source_payload.get("observed") or source_payload.get("result") or oid,
                "subject_ids": row.get("subject_ids") or source_payload.get("affected_entity_ids", []),
                "conflicting_reference_ids": source_payload.get("conflicting_assertion_ids", []),
                "repair_status": "PRESERVED_UNREPAIRED",
            }
        elif kind == "FIRST_APPEARANCE":
            payload = {
                "summary": source_payload.get("observed") or source_payload.get("result") or oid,
                "hypothesis_effect": source_payload.get("hypothesis_effect"),
                "ordered_manifestation_ids": source_payload.get("ordered_manifestations", []),
                "search_scope_id": "sr-search-scope:phase15-local-metadata",
            }
        elif kind == "ORDINAL_NAMESPACE":
            payload = {
                "case_type": "SERIES_ORDINAL",
                "summary": source_payload.get("observed") or source_payload.get("result") or oid,
                "ordinal_token": source_payload.get("ordinal_token") or "UNRESOLVED",
                "candidate_namespace_ids": source_payload.get("candidate_namespace_ids", []) or ["sr-series:unresolved"],
                "compared_structure_ids": row.get("subject_ids", []),
                "expected_predecessor": source_payload.get("expected_predecessor", True),
                "predecessor_identified": source_payload.get("predecessor_identified", False),
            }
        elif kind == "SELF_MAP_GRAPH_DELTA":
            payload = {
                "summary": source_payload.get("observed") or source_payload.get("result") or oid,
                "comparison_mode": "AUTHORITY_CONTINUITY",
                "c_snapshot_ids": [], "g_snapshot_ids": [],
                "authority_assertion_ids": source_payload.get("authority_assertion_ids", []),
                "node_alignments": [], "edge_alignments": [],
            }
        elif kind == "REPRESENTATION_COMMUTATION":
            corners = source_payload.get("corner_entity_ids", [])
            payload = {
                "family_id": source_payload.get("representation_family_id"),
                "corner_ids": {"a_s1": corners[0] if len(corners) > 0 else None, "a_s2": corners[1] if len(corners) > 1 else None, "b_s1": corners[2] if len(corners) > 2 else None, "b_s2": corners[3] if len(corners) > 3 else None},
                "surface_transformation_ids": [], "epistemic_transformation_ids": [],
                "dimension_results": {key: "NOT_TESTABLE" for key in ["concept_identity", "semantic_core", "claim_scope", "role_structure", "authority_state"]},
                "missing_requirements": [source_payload.get("missing") or "A complete four-corner family is not locally witnessed."],
            }
        else:
            raise ValueError(f"Unhandled supplemental graph observation kind: {kind}")
        graph_observations[index] = {
            "schema_version": "graph-assay-observation/v2",
            "observation_id": oid,
            "observation_kind": kind,
            "status": row["status"],
            "evidence_ids": row["evidence_ids"],
            "payload": payload,
            "interpretive_limit": row["interpretive_limit"],
            "assay_id": "archive-assay:2026-08-24-phase15-authority-recompilation",
        }

    for row in evidence:
        row["schema_version"] = "witnessed-evidence/v1"
        row.setdefault("source_title", None)
        row.setdefault("source_publication_at", None)
        row.setdefault("source_updated_at", None)
    evidence = deduplicate(evidence, "evidence_id")
    evidence_by_manifestation = {}
    for row in evidence:
        evidence_by_manifestation.setdefault(row["manifestation_id"], []).append(row["evidence_id"])

    for row in legacy_candidates:
        row["schema_version"] = "legacy-membership-candidate/v1"
        row["origin"] = "archive-inferred"
        row["relation_provenance_mode"] = "INFERRED"
    for row in evidence_taxonomies:
        row["schema_version"] = "evidence-taxonomy-observation/v1"
        row["origin"] = "explicit-source" if row["status"] == "WITNESSED_IN_LOCAL_METADATA" else "archive-inferred"
    for row in representation_families:
        member_ids = {member["id"] for member in row["members"]}
        related_evidence = []
        for member_id in member_ids:
            related_evidence.extend(evidence_by_manifestation.get(member_id, [])[:1])
        row["schema_version"] = "representation-family/v1"
        row.setdefault("origin", "explicit-source" if row["status"].startswith(("SOURCE_", "WITNESSED")) else "archive-inferred")
        row.setdefault("relation_provenance_mode", "MIXED" if len(member_ids) > 2 else "INFERRED")
        row.setdefault("evidence_ids", sorted(set(related_evidence)))
    for row in ordinal_series:
        stage_evidence = [evid for stage in row["stages"] for evid in stage.get("evidence_ids", [])]
        row["schema_version"] = "ordinal-series-observation/v1"
        row.setdefault("origin", "explicit-source")
        row.setdefault("relation_provenance_mode", "MIXED" if row.get("later_compiler_id") else "UNRESOLVED")
        row.setdefault("evidence_ids", sorted(set(stage_evidence)))
    for row in structural_anatomy:
        row["schema_version"] = "structural-anatomy/v1"
        row["origin"] = "archive-inferred"
        row["search_scope"]["negative_search_performed"] = True
        for milestone in row["milestones"]:
            milestone["origin"] = "archive-inferred"
            milestone["provenance_mode"] = "INFERRED"

    hypothesis_path = vault / "05-OPERATIONS" / "hypotheses" / "2026-08-24-amari-recompilation-topology-seeds.jsonl"
    hypotheses = [row for _, row in read_jsonl(hypothesis_path)]
    hypothesis_additions = [
        {
            "hypothesis_id": "sr-hyp-0039",
            "label": "predeclared-modular-compiler",
            "status": "WITNESSED_IN_BOUNDED_LINEAGES",
            "input_status": "archive-contributed",
            "question": "Can separately published modules predeclare membership in a higher-order work before the compiler manifestation appears?",
            "local_anchor_ids": ["zenodo:19055447", "zenodo:19055605", "zenodo:19055681", "zenodo:19055780", "zenodo:19055861", "zenodo:19058522"],
            "must_not_assume": ["the full eleven-module input set is resolved", "compiler labels were source roles at first publication", "predeclaration proves a hidden master plan"],
            "required_evidence": ["module-level forward declarations", "compiler input enumeration", "source-role versus retrospective-role comparison"],
        },
        {
            "hypothesis_id": "sr-hyp-0040",
            "label": "nonordinal-five-theorem-compilation",
            "status": "OPEN_WITH_LOCAL_ANOMALY",
            "input_status": "archive-contributed",
            "question": "Was the five-theorem architecture compiled in a conceptual order distinct from manifestation creation order?",
            "local_anchor_ids": ["zenodo:20300659", "zenodo:20300880", "zenodo:20300549", "zenodo:20300167", "zenodo:20300442"],
            "must_not_assume": ["creation order equals conceptual order", "the unidentified first theorem can be inferred", "the compiler predates composition merely because it predates one manifestation"],
            "required_evidence": ["all five theorem bodies", "explicit ordinal namespace", "compiler membership language", "version and composition dates"],
        },
        {
            "hypothesis_id": "sr-hyp-0041",
            "label": "plural-authority-anchors-without-supersession",
            "status": "TWO_ASSERTIONS_LINK_UNRESOLVED",
            "input_status": "archive-contributed",
            "question": "Do April, July, and August authority-bearing works coexist under different scopes, or does a witnessed transition select a controlling formulation?",
            "local_anchor_ids": ["zenodo:19766913", "zenodo:21185370", "zenodo:22019518"],
            "must_not_assume": ["latest publication automatically controls", "canonical entry, canonical reference, and constitution are synonymous", "silence is supersession"],
            "required_evidence": ["full authority language", "explicit supersession or scope edges", "time-indexed controlling-formulation assertions"],
        },
        {
            "hypothesis_id": "sr-hyp-0042",
            "label": "phase-conditioned-internal-representation-grammar",
            "status": "SERIOUS_LOCAL_HUNT",
            "input_status": "collaborator-proposed-expanded-by-archive",
            "question": "Does SR use different internal representation lifts by publishing phase, including narrative-to-formal, qualitative-to-quantitative, conceptual-to-empirical-to-generative, and field-to-framework transitions?",
            "local_anchor_ids": ["zenodo:19672591", "zenodo:19672759", "zenodo:20075091", "zenodo:20076214", "zenodo:20076616", "zenodo:20076708", "zenodo:21866116", "zenodo:22047892"],
            "must_not_assume": ["all pairings instantiate one operator", "surface translation equals epistemic-register translation", "a formal label preserves or strengthens the same claim"],
            "required_evidence": ["full paired bodies", "source-declared relation predicates", "claim-effect comparison", "phase controls", "same-title controls"],
        },
        {
            "hypothesis_id": "sr-hyp-0043",
            "label": "version-maturation-as-measurement-lift",
            "status": "PARTIALLY_WITNESSED_LOCAL",
            "input_status": "archive-contributed",
            "question": "Does an explicitly versioned revision preserve a thesis while adding measurement, scope controls, or falsifiability?",
            "local_anchor_ids": ["zenodo:18250629", "zenodo:18252281"],
            "must_not_assume": ["version labels establish byte-level ancestry", "an added metric validates the thesis", "metadata describes every body change"],
            "required_evidence": ["both version bodies", "content hashes", "claim-level diff", "measurement and falsifier diff"],
        },
        {
            "hypothesis_id": "sr-hyp-0044",
            "label": "policy-substrate-authority-reclassification",
            "status": "PARTIALLY_WITNESSED_LOCAL",
            "input_status": "archive-contributed",
            "question": "Does Policy Substrate supply a source-declared authority transition from autonomous field to bounded framework while preserving conceptual lineage?",
            "local_anchor_ids": ["zenodo:21866116", "zenodo:22047892"],
            "must_not_assume": ["separate DOIs are successive editions", "the newer record silently replaces the older one", "field demotion erases genealogy"],
            "required_evidence": ["historical version snapshots", "full bodies", "citation or supersession relation", "authority-dimension comparison"],
        },
    ]
    existing_hypothesis_ids = {row["hypothesis_id"] for row in hypotheses}
    hypotheses.extend(row for row in hypothesis_additions if row["hypothesis_id"] not in existing_hypothesis_ids)
    for row in hypotheses:
        anchor_evidence = []
        for anchor_id in row.get("local_anchor_ids", []):
            anchor_evidence.extend(evidence_by_manifestation.get(anchor_id, [])[:1])
        row["schema_version"] = "architecture-hypothesis-definition/v1"
        row.setdefault("evidence_ids", sorted(set(anchor_evidence)))
        row.setdefault("interpretive_limit", "A hypothesis definition is never a source claim or an adjudicated result.")
    write_jsonl(hypothesis_path, hypotheses)

    for row in authority:
        if row["source_asserted_at"].get("basis") not in {"SOURCE_PUBLICATION_METADATA", "SOURCE_TEXT", "UNKNOWN"}:
            row["source_asserted_at"]["basis"] = "SOURCE_PUBLICATION_METADATA"
    authority = deduplicate(authority, "authority_assertion_id")
    recompilation_edges = deduplicate(recompilation_edges, "edge_id")
    typed_graph_edges = deduplicate(typed_graph_edges, "edge_id")
    typed_edge_ids = {row["edge_id"] for row in typed_graph_edges}
    for row in recompilation_edges:
        if row["edge_id"] in typed_edge_ids:
            row["edge_id"] = f"{row['edge_id']}:compiler-scan"
    transformations = deduplicate(transformations, "transformation_id")
    representation_families = deduplicate(representation_families, "family_id")
    for row in claim_events:
        if row["adjudication_status"] == "PARTIAL":
            row["source_adjudication_status_raw"] = "PARTIAL"
            row["adjudication_status"] = "CANDIDATE"
    claim_events = deduplicate(claim_events, "claim_event_id")
    graph_observations = deduplicate(graph_observations, "observation_id")
    ordinal_series = deduplicate(ordinal_series, "series_observation_id")
    operator_type_map = {
        "COMPILE_PREDECLARED_MODULES": "RETROSPECTIVELY_COMPILE",
        "PREDECLARE_AND_COMPILE": "RETROSPECTIVELY_COMPILE",
        "MATURE_VERSION_WITH_MEASUREMENT": "TIGHTEN_CLAIM",
        "EMPIRICALLY_TIGHTEN": "TIGHTEN_CLAIM",
        "EXTEND_FIELD_INTO_DOMAIN": "FORM_FIELD",
    }
    realization_map = {
        "ARCHIVE_DERIVED_FROM_SOURCE_ASSERTIONS": "ARCHIVE_INFERRED",
        "PARTIAL_SOURCE_DECLARATION": "SOURCE_DECLARED",
        "SOURCE_DECLARED_NOT_VALIDATED": "SOURCE_DECLARED",
        "SOURCE_DECLARED_WITH_MISSING_ORDINAL_TARGET": "SOURCE_DECLARED",
        "SOURCE_DECLARED_WITH_PARTIAL_INPUT_RESOLUTION": "SOURCE_DECLARED",
        "SOURCE_DECLARED_WITH_UNRESOLVED_INPUTS": "SOURCE_DECLARED",
    }
    for row in lifecycle:
        raw_operator = row["operator_type"]
        if raw_operator in operator_type_map:
            row["source_operator_type_raw"] = raw_operator
            row["operator_type"] = operator_type_map[raw_operator]
        if row["temporal_provenance_mode"] == "MIXED":
            row["source_temporal_mode_raw"] = "MIXED"
            row["temporal_provenance_mode"] = "UNRESOLVED"
        raw_realization = row["realization_status"]
        if raw_realization in realization_map:
            row["source_realization_status_raw"] = raw_realization
            row["realization_status"] = realization_map[raw_realization]
    lifecycle = deduplicate(lifecycle, "operator_event_id")
    normalized_compiler_inputs = []
    for row in compiler_input_candidates:
        if "candidate_id" in row:
            input_ids = row.pop("input_ids")
            row["compiler_candidate_id"] = row.pop("candidate_id")
            row["source_predicate_raw"] = row.pop("source_role_raw")
            row["input_slots"] = [{"slot": "declared-or-candidate-inputs", "candidate_ids": input_ids, "resolution": row["status"]}] if input_ids else []
            row["relation_provenance_mode"] = row.pop("temporal_provenance_mode")
        row.setdefault("origin", "archive-inferred")
        row.setdefault("relation_provenance_mode", "INFERRED")
        normalized_compiler_inputs.append(row)
    compiler_input_candidates = normalized_compiler_inputs
    compiler_input_candidates = deduplicate(compiler_input_candidates, "compiler_candidate_id")
    for index, row in enumerate(phase2_priorities, 1):
        row["priority"] = index
        row["gate"] = "PHASE_2_HUMAN_GATE_CLOSED"

    supplemental_coverage = [
        ("society-blueprint-predeclared-compiler", "IMPLEMENTED", "BOUNDED_EXECUTED", ["05-OPERATIONS/relations/recompilation-edges.jsonl", "05-OPERATIONS/relations/compiler-input-candidates.jsonl"], []),
        ("five-theorem-precompilation-and-nonordinal-order", "PARTIAL", "BOUNDED_EXECUTED", ["05-OPERATIONS/relations/ordinal-series-observations.jsonl", "05-OPERATIONS/relations/compiler-input-candidates.jsonl"], ["sr-unresolved:institutional-cognition-theorem-i"]),
        ("successive-authority-anchors-no-latest-wins", "PARTIAL", "BOUNDED_EXECUTED", ["05-OPERATIONS/authority/authority-assertions.jsonl", "05-OPERATIONS/operators/lifecycle-operators.jsonl"], ["sr-unresolved:authority-supersession-chain"]),
        ("high-arousal-version-maturation", "PARTIAL", "BOUNDED_EXECUTED", ["05-OPERATIONS/claims/claim-status-events.jsonl", "05-OPERATIONS/operators/lifecycle-operators.jsonl"], ["sr-gate:phase2:body-diff"]),
        ("representation-pipelines-and-pair-grammar", "PARTIAL", "BOUNDED_EXECUTED", ["05-OPERATIONS/relations/representation-families.jsonl", "05-OPERATIONS/relations/typed-edges.jsonl"], ["sr-gate:phase2:body-comparison"]),
        ("policy-substrate-field-to-framework-reclassification", "PARTIAL", "BOUNDED_EXECUTED", ["05-OPERATIONS/authority/authority-assertions.jsonl", "05-OPERATIONS/claims/claim-status-events.jsonl", "05-OPERATIONS/relations/representation-lift-candidates.jsonl"], ["sr-unresolved:policy-substrate-edition-lineage"]),
        ("domain-suite-epistemic-substrate-compiler", "PARTIAL", "BOUNDED_EXECUTED", ["05-OPERATIONS/relations/recompilation-edges.jsonl", "05-OPERATIONS/relations/ordinal-series-observations.jsonl"], ["sr-unresolved:field-paper-ordinal-namespaces"]),
        ("infrastructural-medicine-rigor-compiler", "PARTIAL", "SEEDED", ["05-OPERATIONS/relations/recompilation-edges.jsonl", "05-OPERATIONS/claims/claim-status-events.jsonl"], ["sr-gate:phase2:body-comparison"]),
        ("sis-rda-self-narrowing", "PARTIAL", "SEEDED", ["05-OPERATIONS/claims/claim-status-events.jsonl", "05-OPERATIONS/relations/structural-anatomy-candidates.jsonl"], ["sr-unresolved:rda-explicit-predecessor"]),
        ("zombie-reciprocal-qualitative-quantitative-pair", "PARTIAL", "BOUNDED_EXECUTED", ["05-OPERATIONS/relations/representation-families.jsonl", "05-OPERATIONS/relations/typed-edges.jsonl"], ["sr-unresolved:zombie-metrics-first-member"]),
        ("conspiracy-four-stage-representation-pipeline", "IMPLEMENTED", "BOUNDED_EXECUTED", ["05-OPERATIONS/relations/representation-families.jsonl", "05-OPERATIONS/relations/typed-edges.jsonl", "05-OPERATIONS/operators/lifecycle-operators.jsonl"], []),
        ("ground-truth-recompilation-lineage", "PARTIAL", "SEEDED", ["05-OPERATIONS/relations/recompilation-edges.jsonl", "05-OPERATIONS/relations/representation-families.jsonl"], ["sr-gate:phase2:body-comparison"]),
        ("metadata-contaminated-companion-relation", "PARTIAL", "BOUNDED_EXECUTED", ["05-OPERATIONS/relations/typed-edges.jsonl", "05-OPERATIONS/relations/representation-families.jsonl"], ["sr-unresolved:logic-cop-subject-description"]),
        ("phase-conditioned-pair-grammar", "PARTIAL", "SEEDED", ["05-OPERATIONS/relations/representation-families.jsonl", "04-RECEIPTS/assays/2026-08-24-phase15-authority-recompilation/graph-assay-observations.jsonl"], ["sr-gate:phase2:phase-controls"]),
        ("missing-predecessor-negative-topology", "PARTIAL", "BOUNDED_EXECUTED", ["05-OPERATIONS/relations/ordinal-series-observations.jsonl", "05-OPERATIONS/relations/compiler-input-candidates.jsonl", "01-MANIFESTS/entity-index.jsonl"], ["sr-unresolved:multiple-missing-predecessors"]),
        ("full-body-family-adjudication", "HUMAN_GATED", "HUMAN_GATED", ["04-RECEIPTS/assays/2026-08-24-phase15-authority-recompilation/phase-2-acquisition-priorities.jsonl"], ["sr-gate:phase2:closed"]),
    ]
    for trail_id, audit_status, reachability, files, blockers in supplemental_coverage:
        coverage_rows.append({
            "schema_version": "coverage-entry/v1", "trail_id": trail_id, "audit_status": audit_status,
            "reachability": reachability, "source_status_raw": "supplemental local-only Phase 1.5 trail",
            "implemented_in": files, "blocker_ids": blockers, "phase_2_run": False,
            "interpretive_limit": "Metadata-level relation evidence is preserved without promoting source labels such as empirical, theorem, or validated.",
        })

    write_jsonl(output / "witnessed-evidence.jsonl", evidence)
    write_jsonl(output / "authority-assertions.jsonl", authority)
    write_jsonl(output / "legacy-membership-candidates.jsonl", legacy_candidates)
    write_jsonl(output / "canon-map-snapshots.jsonl", maps)
    write_jsonl(output / "recompilation-edges.jsonl", recompilation_edges)
    write_jsonl(output / "typed-edges.jsonl", typed_graph_edges)
    write_jsonl(output / "representation-lift-candidates.jsonl", transformations)
    write_jsonl(output / "representation-families.jsonl", representation_families)
    write_jsonl(output / "claim-status-events.jsonl", claim_events)
    write_jsonl(output / "evidence-taxonomy-observations.jsonl", evidence_taxonomies)
    write_jsonl(output / "graph-assay-observations.jsonl", graph_observations)
    write_jsonl(output / "in-place-revision-risks.jsonl", revision_risks)
    write_jsonl(output / "structural-anatomy-candidates.jsonl", structural_anatomy)
    write_jsonl(output / "ordinal-series-observations.jsonl", ordinal_series)
    write_jsonl(output / "lifecycle-operators.jsonl", lifecycle)
    write_jsonl(output / "epistemic-object-states.jsonl", epistemic_states)
    write_jsonl(output / "interpretation-updates.jsonl", interpretation_updates)
    write_jsonl(output / "coverage-ledger.jsonl", coverage_rows)
    write_jsonl(output / "phase-2-acquisition-priorities.jsonl", phase2_priorities)
    write_jsonl(output / "compiler-input-candidates.jsonl", compiler_input_candidates)

    canonical_rows = {
        "05-OPERATIONS/authority/authority-assertions.jsonl": authority,
        "05-OPERATIONS/authority/legacy-membership-candidates.jsonl": legacy_candidates,
        "05-OPERATIONS/claims/claim-status-events.jsonl": claim_events,
        "05-OPERATIONS/claims/evidence-taxonomy-observations.jsonl": evidence_taxonomies,
        "05-OPERATIONS/maps/canon-map-snapshots.jsonl": maps,
        "05-OPERATIONS/relations/recompilation-edges.jsonl": recompilation_edges,
        "05-OPERATIONS/relations/typed-edges.jsonl": typed_graph_edges,
        "05-OPERATIONS/relations/representation-lift-candidates.jsonl": transformations,
        "05-OPERATIONS/relations/representation-families.jsonl": representation_families,
        "05-OPERATIONS/relations/ordinal-series-observations.jsonl": ordinal_series,
        "05-OPERATIONS/relations/structural-anatomy-candidates.jsonl": structural_anatomy,
        "05-OPERATIONS/relations/compiler-input-candidates.jsonl": compiler_input_candidates,
        "05-OPERATIONS/operators/lifecycle-operators.jsonl": lifecycle,
        "05-OPERATIONS/state/epistemic-object-states.jsonl": epistemic_states,
    }
    for relative_path, rows in canonical_rows.items():
        write_jsonl(vault / relative_path, rows)

    summary = {
        "assay": "Phase 1.5 curated authority, recompilation, representation, and topology register",
        "assay_version": "phase15-authority-recompilation/v2",
        "observed_at": OBSERVED_AT,
        "network_requests": 0,
        "new_acquisitions": 0,
        "phase_2": "NOT_RUN_HUMAN_GATE_CLOSED",
        "candidate_manifest_sha256": candidate_manifest_sha256,
        "outputs": {
            "witnessed_evidence": len(evidence),
            "authority_assertions": len(authority),
            "legacy_membership_candidates": len(legacy_candidates),
            "canon_map_snapshots": len(maps),
            "recompilation_edges": len(recompilation_edges),
            "typed_graph_edges": len(typed_graph_edges),
            "representation_lift_candidates": len(transformations),
            "representation_families": len(representation_families),
            "claim_status_events": len(claim_events),
            "evidence_taxonomy_observations": len(evidence_taxonomies),
            "graph_assay_observations": len(graph_observations),
            "in_place_revision_risks": len(revision_risks),
            "structural_anatomy_lines": len(structural_anatomy),
            "ordinal_series_observations": len(ordinal_series),
            "lifecycle_operator_events": len(lifecycle),
            "epistemic_object_states": len(epistemic_states),
            "interpretation_updates": len(interpretation_updates),
            "coverage_trails": len(coverage_rows),
            "phase_2_priorities": len(phase2_priorities),
            "compiler_input_candidates": len(compiler_input_candidates),
        },
        "highest_value_local_findings": [
            "A 2025-12-30 lineage contains both a forward-declared successor and a same-morning retrospective compiler, supporting latent and retrospective architecture in one bounded case.",
            "Retrospective compilation is already structural in the early canon: Grand Unified Theory compiles a core lineage, the Authorship Capsule promotes it as a canonical reference, and the Codex compiles a seventy-essay machine-legible discipline by January 13.",
            "Three immutable Canon Map self-models are locally witnessed: February (9 layers), June (9 pillars/4 layers), and August (5 pillars/15 programs/30 nodes).",
            "Legacy SR supplies a class-level authority transition in which genealogy persists while canonical, empirical, and field-defining authority is denied.",
            "The STAR bibliography cross-swaps all four predecessor DOI assignments; the source defect is preserved rather than silently repaired.",
            "Theorem is an SR-native structural-generalizability label, not proof; no theorem label can promote authority automatically.",
            "Five same-day Society Blueprint modules forward-declare their membership before a later compiler assigns higher-order infrastructure roles; source-declared module roles and retrospective compiler roles remain distinct.",
            "The institutional-cognition five-theorem compiler appears before the local manifestation self-labeling Theorem II, while local creation order is IV, V, III, compiler, II; conceptual, ordinal, and manifestation order cannot be collapsed.",
            "April, July, and August each supply a different authority-bearing anchor—canonical entry, canonical reference, and constitutional definition—with no witnessed supersession chain; the archive therefore preserves all three time slices.",
            "High-Arousal v1 to v1.1 is a clean metadata-level maturation case: the source says the thesis is retained while a measurement construct is added, pending body-level diff.",
            "Policy Substrate is explicitly reclassified from an autonomous field to a specialized framework/research program; lineage, authority, and edition identity remain separate questions.",
            "The local canon contains multiple typed representation grammars—including reciprocal qualitative/quantitative pairs and conceptual→empirical→generative→forecasting pipelines—without promoting them into one universal operator.",
        ],
        "limits": [
            "Most evidence is author-supplied platform metadata; only five originals are locally preserved.",
            "Collaborator-reported full-text findings are represented as acquisition gates where local exact spans are absent.",
            "No network request, download, checksum replacement, or Phase 2 acquisition occurred.",
            "No contradiction, missing ordinal, or relation target was automatically repaired.",
        ],
    }
    write_json(output / "curated-summary.json", summary)
    print(json.dumps(summary, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--vault", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    main(args.vault, args.output)
