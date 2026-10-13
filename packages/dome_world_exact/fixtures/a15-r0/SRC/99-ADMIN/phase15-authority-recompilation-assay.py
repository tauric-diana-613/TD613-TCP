from __future__ import annotations

import argparse
import hashlib
import html
import json
import math
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

from docx import Document
from pypdf import PdfReader


PATTERN_GROUPS = {
    "authority": {
        "LEGACY_STATUS": r"\blegacy(?:\s+sr|\s+paper|\s+papers)?\b|\bpre[- ]rigor\b",
        "GENEALOGICAL_RETENTION": r"\bgenealog(?:y|ical|ically)\b|\bconceptual lineage\b|\bhistorical continuity\b",
        "CANONICAL_NEGATION": r"\bno longer treated as canonical\b|\bnot treated as canonical\b|\bnot treated as canonical evidence\b",
        "EMPIRICAL_AUTHORITY": r"\bempirical authority\b|\bempirical evidence\b|\bempirically validated\b",
        "FIELD_DEFINING_AUTHORITY": r"\bfield[- ]defining\b|\bdefines? the field\b|\bcore texts?\b",
        "NOT_USED_AS_EVIDENCE": r"\bnot used as evidence\b|\bnot treated as .* evidence\b",
        "CURRENT_AUTHORITY": r"\bcurrent (?:position|formulation|authority|canon)\b|\bauthority resides in\b|\bcontrolling formulation\b",
        "SUPERSESSION_OR_DEMOTION": r"\bsupersed(?:e|es|ed|ing)\b|\bdemot(?:e|es|ed|ing)\b|\breclassif(?:y|ies|ied|ication)\b",
        "REGENERATION": r"\bregenerat(?:e|es|ed|ing|ion)\b|\brehabilitat(?:e|es|ed|ing|ion)\b",
    },
    "compiler": {
        "CONSOLIDATES": r"\bconsolidat(?:e|es|ed|ing|ion)\b",
        "COMPILES": r"\bcompil(?:e|es|ed|ing|ation)\b",
        "RETROSPECTIVELY_TYPES": r"\bretrospectiv(?:e|ely)\b|\bretyp(?:e|es|ed|ing)\b",
        "ASSIGNS_ROLE": r"\bassign(?:s|ed|ing)?\b.{0,80}\b(?:role|operator|stage|function)\b",
        "MAPS_TO": r"\bmaps?\b.{0,80}\b(?:to|into|onto|as)\b",
        "INTEGRATES": r"\bintegrat(?:e|es|ed|ing|ion)\b",
        "UNIFIES": r"\bunif(?:y|ies|ied|ication)\b",
        "CONVERTS_INTO": r"\bconvert(?:s|ed|ing)?\b.{0,80}\binto\b",
        "FORMALIZES": r"\bformali[sz](?:e|es|ed|ing|ation)\b",
        "RESOLVES_CONFLICT": r"\bresolve(?:s|d|ing)?\b.{0,80}\bconflict\b",
    },
    "empirical_brake": {
        "CANDIDATE": r"\bcandidate\b",
        "HYPOTHESIS": r"\bhypothes(?:is|es|ized|ise|ises)\b",
        "NOT_ESTABLISHED": r"\bnot established\b|\bnot yet validated\b|\bnot validated\b|\bnot already empirically validated\b",
        "COUNTEREXAMPLE": r"\bcounter[- ]?example\b",
        "COMPETING_EXPLANATION": r"\bcompeting explanation\b|\balternative explanation\b",
        "REQUIRES_TESTING": r"\brequires? (?:empirical )?(?:testing|test|validation)\b|\bmust be tested\b",
        "BOUNDARY_CONDITION": r"\bboundary condition\b",
        "FALSIFIER": r"\bfalsif(?:y|ies|ied|iable|ication|ier|iers)\b",
        "NULL_NARROWS": r"\bnegative result\b.{0,80}\bnarrow\b|\bnull results?\b.{0,80}\bnarrow\b",
        "SELF_APPLICATION": r"\bsr is not exempt\b|\bsame .* standards?.{0,80}\bsr\b|\bapply.{0,80}\bown claims?\b",
        "EVIDENCE_CLASS": r"\beviden(?:ce|tiary) (?:class|classes|ladder)\b|\bE[0-5]\s*[–-]\s*E[0-5]\b",
    },
    "declarative_ceiling": {
        "UNIVERSAL": r"\buniversal(?:ly)?\b",
        "INEVITABLE": r"\binevitab(?:le|ly)\b",
        "APEX": r"\bapex\b",
        "FIRST": r"\bfirst\b",
        "SELF_VALIDATING": r"\bself[- ]validat(?:e|es|ed|ing)\b",
        "PROVES": r"\bproves?\b|\bproof\b",
        "MUST": r"\bmust\b",
        "CANNOT": r"\bcannot\b|\bcan\s+not\b",
    },
    "operator_bone": {
        "REPRESENTATIONAL_COMPRESSION": r"\brepresentational compression\b|\bcompression\b.{0,80}\brepresentation\b",
        "OBSERVATION_REPRESENTATION_CHAIN": r"\breality\b.{0,180}\bperception\b.{0,180}\b(?:compression|representation)\b",
        "POSSIBLE_INQUIRY_SELECTION": r"\bpossible inquiry\b|\bdenominator of (?:scientific )?inquiry\b|\bvisible (?:knowledge|literature)\b.{0,100}\bselection\b",
        "SUPPORTED_VS_RETAINED_CAPACITY": r"\bAI present\b.{0,180}\bAI absent\b|\bretained independent capacity\b|\bwithdraw(?:al|n)\b.{0,120}\bcapacity\b",
        "PERSISTENCE_VS_AUTHORITY": r"\bpreserv(?:e|es|ed|ing)\b.{0,180}\b(?:not treated as canonical|not used as evidence|empirical authority)\b",
    },
}

DECLARATIVE_MARKERS = {
    "inevitable": r"\binevitab(?:le|ly)\b",
    "universal": r"\buniversal(?:ly)?\b",
    "cannot": r"\bcannot\b|\bcan\s+not\b",
    "must": r"\bmust\b",
    "first": r"\bfirst\b",
    "apex": r"\bapex\b",
    "self_validating": r"\bself[- ]validat(?:e|es|ed|ing)\b",
    "proves": r"\bproves?\b|\bproof\b",
}

BRAKE_MARKERS = {
    "candidate": r"\bcandidate\b",
    "hypothesis": r"\bhypothes(?:is|es|ized|ise|ises)\b",
    "not_established": r"\bnot established\b|\bnot yet validated\b|\bnot validated\b|\bnot already empirically validated\b",
    "counterexample": r"\bcounter[- ]?example\b",
    "competing_explanation": r"\bcompeting explanation\b|\balternative explanation\b",
    "requires_testing": r"\brequires? (?:empirical )?(?:testing|test|validation)\b|\bmust be tested\b",
    "boundary_condition": r"\bboundary condition\b",
    "rejected_universal": r"\breject(?:s|ed|ing)?\b.{0,80}\buniversal\b",
    "falsifier": r"\bfalsif(?:y|ies|ied|iable|ication|ier|iers)\b",
}

LINEAGES = {
    "canon-map-snapshot-candidates": ["18737235", "20534171", "22019218"],
    "governance-version-lineage": ["18882883", "18892333", "19212519", "19356453", "19434800", "21970690"],
    "detestable-series-and-field-compilation": [
        "18776985", "18777067", "18777144", "18777222", "18777380", "18777439", "21939955"
    ],
}

DASH_TRANSLATION = str.maketrans({"‐": "-", "‑": "-", "‒": "-", "–": "-", "—": "-", "―": "-"})


def read_jsonl(path: Path):
    with path.open("r", encoding="utf-8-sig") as stream:
        for line_no, line in enumerate(stream, 1):
            if line.strip():
                yield line_no, json.loads(line)


def strip_html(value: str) -> str:
    value = re.sub(r"(?i)<br\s*/?>", "\n", value or "")
    value = re.sub(r"(?i)</(?:p|li|h[1-6]|blockquote|div)>", "\n", value)
    value = re.sub(r"<[^>]+>", " ", value)
    value = html.unescape(value).replace("\u00a0", " ")
    return re.sub(r"[ \t]+", " ", value).strip()


def sentence_units(text: str):
    chunks = re.split(r"(?<=[.!?])\s+|\n+", text or "")
    return [re.sub(r"\s+", " ", chunk).strip() for chunk in chunks if chunk and chunk.strip()]


def normalized_text(text: str) -> str:
    folded = unicodedata.normalize("NFKD", text.casefold().translate(DASH_TRANSLATION))
    return "".join(ch for ch in folded if not unicodedata.combining(ch))


def normalized_title(text: str) -> str:
    return " ".join(re.findall(r"[a-z0-9]+", normalized_text(text)))


def fingerprint(text: str, include_excerpt: bool = False):
    words = text.split()
    result = {
        "text_sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
        "word_count": len(words),
    }
    if include_excerpt:
        result["short_excerpt"] = " ".join(words[:12]) + (" …" if len(words) > 12 else "")
    return result


def source_records(vault: Path):
    manifest = vault / "01-MANIFESTS" / "candidate-corpus.jsonl"
    for line_no, row in read_jsonl(manifest):
        base = {
            "manifestation_id": f"zenodo:{row['source_record_id']}",
            "platform": "Zenodo",
            "platform_item_id": str(row["source_record_id"]),
            "title": row.get("title", ""),
            "doi": row.get("doi"),
            "url": row.get("record_url"),
            "published_at": row.get("publication_date"),
            "source_path": "01-MANIFESTS/candidate-corpus.jsonl",
        }
        yield base, "title", {"jsonl_line": line_no, "field": "title"}, row.get("title", "")
        yield base, "description", {"jsonl_line": line_no, "field": "description"}, strip_html(row.get("description", ""))

    for filename, platform in [
        ("substack.jsonl", "Substack"),
        ("medium.jsonl", "Medium"),
        ("academia.jsonl", "Academia.edu"),
    ]:
        path = vault / "01-MANIFESTS" / "platforms" / filename
        for line_no, row in read_jsonl(path):
            item_id = str(row["platform_item_id"])
            base = {
                "manifestation_id": f"{platform.casefold().replace('.edu', '').replace(' ', '-')}:{item_id}",
                "platform": platform,
                "platform_item_id": item_id,
                "title": row.get("title", ""),
                "doi": None,
                "url": row.get("url"),
                "published_at": row.get("published_at") or row.get("published_label"),
                "source_path": f"01-MANIFESTS/platforms/{filename}",
            }
            for field in ("title", "subtitle"):
                if row.get(field):
                    yield base, field, {"jsonl_line": line_no, "field": field}, row[field]

    ledger = vault / "01-MANIFESTS" / "integrity-ledger.jsonl"
    for ledger_line, entry in read_jsonl(ledger):
        path = vault / entry["local_path"]
        base = {
            "manifestation_id": entry.get("manifestation_id") or f"zenodo:{entry['source_record_id']}:captured-file",
            "platform": entry.get("source_platform", "Zenodo"),
            "platform_item_id": str(entry["source_record_id"]),
            "title": entry.get("title", ""),
            "doi": entry.get("doi"),
            "url": entry.get("canonical_url"),
            "published_at": entry.get("published_at"),
            "source_path": entry["local_path"],
            "capture_sha256": entry.get("local_sha256"),
            "ledger_line": ledger_line,
        }
        if path.suffix.casefold() == ".pdf":
            reader = PdfReader(str(path))
            for page_no, page in enumerate(reader.pages, 1):
                yield base, "captured_full_text", {"page": page_no}, page.extract_text() or ""
        elif path.suffix.casefold() == ".docx":
            doc = Document(str(path))
            for paragraph_no, paragraph in enumerate(doc.paragraphs, 1):
                if paragraph.text.strip():
                    yield base, "captured_full_text", {"paragraph": paragraph_no}, paragraph.text


def marker_counts(text: str, markers: dict[str, str]):
    return {name: len(re.findall(pattern, text, re.I | re.S)) for name, pattern in markers.items()}


def fisher_exact_two_sided(a: int, b: int, c: int, d: int):
    row_1 = a + b
    row_2 = c + d
    col_1 = a + c
    total = row_1 + row_2

    def probability(x: int):
        return math.comb(col_1, x) * math.comb(total - col_1, row_1 - x) / math.comb(total, row_1)

    low = max(0, row_1 - (total - col_1))
    high = min(row_1, col_1)
    observed = probability(a)
    two_sided = sum(probability(x) for x in range(low, high + 1) if probability(x) <= observed + 1e-15)
    greater = sum(probability(x) for x in range(a, high + 1))
    odds_ratio = None if b * c == 0 else (a * d) / (b * c)
    return {"odds_ratio": odds_ratio, "one_sided_greater_p": greater, "two_sided_p": two_sided}


def write_jsonl(path: Path, rows):
    with path.open("w", encoding="utf-8", newline="\n") as stream:
        for row in rows:
            stream.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def scan(vault: Path, output: Path):
    output.mkdir(parents=True, exist_ok=True)
    evidence_rows = []
    category_counts = Counter()
    pattern_counts = Counter()
    source_units = 0
    fields = Counter()
    platforms = Counter()
    captured_paths = set()
    excerpted_manifestations = set()
    zenodo_text_by_id = defaultdict(str)
    zenodo_records = {}

    for record, field, locator, text in source_records(vault):
        source_units += 1
        fields[field] += 1
        platforms[record["platform"]] += 1
        if field == "captured_full_text":
            captured_paths.add(record["source_path"])
        if record["platform"] == "Zenodo":
            zenodo_text_by_id[record["platform_item_id"]] += "\n" + text
            zenodo_records[record["platform_item_id"]] = record

        for sentence_index, sentence in enumerate(sentence_units(text), 1):
            matches = {}
            for category, patterns in PATTERN_GROUPS.items():
                hits = [name for name, pattern in patterns.items() if re.search(pattern, sentence, re.I | re.S)]
                if hits:
                    matches[category] = hits
                    category_counts[category] += 1
                    pattern_counts.update(f"{category}:{hit}" for hit in hits)
            if not matches:
                continue
            loc = dict(locator)
            loc["sentence"] = sentence_index
            include_excerpt = record["manifestation_id"] not in excerpted_manifestations
            excerpted_manifestations.add(record["manifestation_id"])
            basis = json.dumps([record["manifestation_id"], field, loc, sentence], ensure_ascii=False, sort_keys=True)
            evidence_rows.append({
                "evidence_id": "sr-authority-evidence-" + hashlib.sha256(basis.encode("utf-8")).hexdigest()[:16],
                "manifestation": record,
                "source_field": field,
                "source_locator": loc,
                "matched_patterns": matches,
                "evidence_fingerprint": fingerprint(sentence, include_excerpt=include_excerpt),
                "status": "CANDIDATE_REQUIRES_REVIEW",
                "interpretive_limit": "A lexical hit is not an authority transition, compiler edge, or claim-status change until its source assertion and target are resolved.",
            })

    manifest_rows = {}
    manifest_line = {}
    for line_no, row in read_jsonl(vault / "01-MANIFESTS" / "candidate-corpus.jsonl"):
        item_id = str(row["source_record_id"])
        manifest_rows[item_id] = row
        manifest_line[item_id] = line_no

    map_specs = {
        "18737235": {
            "declared_dimensions": [
                {"name": "major_layers", "count": 9, "members": [
                    "Foundational Layer", "Harm Layer", "Governance Layer", "Epistemic Layer", "AI Layer",
                    "Macro-Systems Layer", "Advanced Theories", "Applied Analysis", "Synthesis Layer"
                ], "membership_completeness": "COMPLETE_IN_LOCAL_METADATA"}
            ],
            "required_phrases": ["nine major layers", "Foundational Layer", "Synthesis Layer"],
        },
        "20534171": {
            "declared_dimensions": [
                {"name": "pillars", "count": 9, "members": [], "membership_completeness": "COUNT_ONLY_IN_LOCAL_METADATA"},
                {"name": "layers", "count": 4, "members": [
                    "Foundations (Diagnostic Layer)", "Practical Architecture (Applied Layer)",
                    "Predictive & Comparative Architecture", "Meta-Architecture (Theory & Public Layer)"
                ], "membership_completeness": "COMPLETE_IN_LOCAL_METADATA"}
            ],
            "required_phrases": ["nine pillars", "four layers", "Meta-Architecture"],
        },
        "22019218": {
            "declared_dimensions": [
                {"name": "causal_pillars", "count": 5, "members": [
                    "Metatheory & Grammar", "Causal Separation & Measurement", "Drift, Collapse & Propagation",
                    "Infrastructure, AI & Governance", "Human & Social Consequences"
                ], "membership_completeness": "COMPLETE_IN_LOCAL_METADATA"},
                {"name": "research_programs", "count": 15, "members": [], "membership_completeness": "COUNT_ONLY_IN_LOCAL_METADATA"},
                {"name": "canonical_nodes", "count": 30, "members": [], "membership_completeness": "PARTIAL_EXAMPLES_ONLY_IN_LOCAL_METADATA"},
            ],
            "required_phrases": ["five causal pillars", "fifteen research programs", "thirty canonical nodes"],
        },
    }
    map_rows = []
    for item_id, spec in map_specs.items():
        row = manifest_rows[item_id]
        text = strip_html(row.get("description", ""))
        normalized_source = normalized_text(text)
        missing = [phrase for phrase in spec["required_phrases"] if normalized_text(phrase) not in normalized_source]
        if missing:
            raise RuntimeError(f"Map snapshot {item_id} is missing required phrases: {missing}")
        map_rows.append({
            "map_snapshot_id": f"sr-map-snapshot-zenodo-{item_id}",
            "manifestation_id": f"zenodo:{item_id}",
            "doi": row.get("doi"),
            "published_at": row.get("publication_date"),
            "source_title": row.get("title"),
            "source_version_literal": row.get("version"),
            "source_path": "01-MANIFESTS/candidate-corpus.jsonl",
            "source_locator": {"jsonl_line": manifest_line[item_id], "field": "description"},
            "snapshot_status": "WITNESSED_SOURCE_SELF_MODEL",
            "declared_dimensions": spec["declared_dimensions"],
            "edition_relationship_to_other_maps": "UNRESOLVED",
            "comparison_family": "CANON_MAP_TITLE_AND_FUNCTION_CANDIDATE",
            "immutable_snapshot": True,
            "interpretive_limit": "Shared title/function does not prove that these are editions of one work; each has a distinct Zenodo concept lineage and version literal 1.0.",
        })

    lineage_rows = []
    for lineage_id, member_ids in LINEAGES.items():
        for position, item_id in enumerate(member_ids, 1):
            row = manifest_rows[item_id]
            text = strip_html(row.get("description", ""))
            word_count = len(re.findall(r"\b\w+\b", normalized_text(text)))
            declarative = marker_counts(text, DECLARATIVE_MARKERS)
            brakes = marker_counts(text, BRAKE_MARKERS)
            lineage_rows.append({
                "lineage_id": lineage_id,
                "membership_status": "WITNESSED_DECLARED_LINEAGE" if lineage_id == "governance-version-lineage" else "ARCHIVE_COMPARISON_FAMILY",
                "position_for_analysis": position,
                "manifestation_id": f"zenodo:{item_id}",
                "doi": row.get("doi"),
                "published_at": row.get("publication_date"),
                "title": row.get("title"),
                "surface": "ZENODO_AUTHOR_SUPPLIED_DESCRIPTION",
                "word_count": word_count,
                "declarative_marker_counts": declarative,
                "empirical_brake_marker_counts": brakes,
                "declarative_total": sum(declarative.values()),
                "empirical_brake_total": sum(brakes.values()),
                "interpretation": "DESCRIPTIVE_MARKER_COUNTS_ONLY",
                "interpretive_limit": "Metadata-surface marker counts do not establish claim scope, rigor, or migration; content-level aligned-claim comparison is required.",
            })

    first_appearance_specs = {
        "observation-compression-representation-chain": lambda t: (
            "reality" in t and "perception" in t and "compression" in t and "representation" in t
        ),
        "possible-inquiry-to-visible-knowledge-selection": lambda t: (
            "possible inquiry" in t and "visible knowledge" in t and "selection" in t
        ),
        "artifact-persistence-vs-authority-persistence": lambda t: (
            ("preserved" in t or "genealogy" in t) and "not treated as canonical" in t
        ),
        "supported-performance-vs-retained-capacity": lambda t: (
            ("ai present" in t and "ai absent" in t) or "retained independent capacity" in t
        ),
    }
    first_rows = []
    for query_id, predicate in first_appearance_specs.items():
        hits = []
        for item_id, row in manifest_rows.items():
            text = normalized_text(strip_html(row.get("description", "")))
            if predicate(text):
                hits.append((str(row.get("publication_date") or "9999"), item_id, row, text))
        hits.sort(key=lambda item: (item[0], item[1]))
        if not hits:
            first_rows.append({
                "query_id": query_id,
                "status": "NOT_WITNESSED_IN_LOCAL_ZENODO_METADATA",
                "search_surface": "442 retained Zenodo author-supplied descriptions",
                "interpretive_limit": "Absence from local metadata is not absence from the works or public corpus.",
            })
            continue
        date, item_id, row, text = hits[0]
        first_rows.append({
            "query_id": query_id,
            "status": "EARLIEST_LOCAL_METADATA_COOCCURRENCE_CANDIDATE",
            "manifestation_id": f"zenodo:{item_id}",
            "doi": row.get("doi"),
            "published_at": date,
            "title": row.get("title"),
            "source_path": "01-MANIFESTS/candidate-corpus.jsonl",
            "source_locator": {"jsonl_line": manifest_line[item_id], "field": "description"},
            "interpretive_limit": "This is the earliest match in retained metadata descriptions, not a proven first appearance in the corpus or full text.",
        })

    doi_rows = [row for _, row in read_jsonl(vault / "01-MANIFESTS" / "crosswalk" / "doi-links.jsonl")]
    phase = defaultdict(lambda: {"total": 0, "retitled": 0, "same_title": 0})
    for row in doi_rows:
        month = str(row["substack_published_at"])[:7]
        changed = normalized_title(row["substack_title"]) != normalized_title(row["zenodo_title"])
        phase[month]["total"] += 1
        phase[month]["retitled" if changed else "same_title"] += 1
    march_april = sum(phase[m]["total"] for m in ("2026-03", "2026-04"))
    march_april_retitled = sum(phase[m]["retitled"] for m in ("2026-03", "2026-04"))
    outside = len(doi_rows) - march_april
    outside_retitled = sum(v["retitled"] for m, v in phase.items() if m not in {"2026-03", "2026-04"})
    exact = fisher_exact_two_sided(
        march_april_retitled,
        march_april - march_april_retitled,
        outside_retitled,
        outside - outside_retitled,
    )
    retitle_phase = {
        "assay": "phase-conditioned title transformation controls",
        "identity_basis": "91 retained Substack-to-Zenodo DOI links",
        "normalization": "Unicode-folded lowercase alphanumeric token sequence",
        "monthly_counts": [dict(month=month, **phase[month]) for month in sorted(phase)],
        "contrast": {
            "march_april": {"total": march_april, "retitled": march_april_retitled, "unchanged": march_april - march_april_retitled},
            "outside_march_april": {"total": outside, "retitled": outside_retitled, "unchanged": outside - outside_retitled},
            **exact,
        },
        "status": "EXPLORATORY_NON_PREREGISTERED_TITLE_LEVEL_ASSOCIATION",
        "interpretive_limits": [
            "The comparison is post hoc and does not establish a publishing regime or authorial intent.",
            "Titles are compared; manifestation bodies are not locally preserved for this test.",
            "DOI-linked pairs are a selected subset of the publication ecology.",
            "Month is a coarse proxy for publishing phase.",
        ],
    }

    write_jsonl(output / "evidence-candidates.jsonl", evidence_rows)
    write_jsonl(output / "canon-map-snapshots.jsonl", map_rows)
    write_jsonl(output / "claim-marker-lineage-assay.jsonl", lineage_rows)
    write_jsonl(output / "first-appearance-candidates.jsonl", first_rows)
    (output / "retitle-phase-controls.json").write_text(
        json.dumps(retitle_phase, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    summary = {
        "assay": "Phase 1.5 local-only authority migration and canon recompilation assay",
        "assay_version": "phase15-authority-recompilation/v1",
        "network_requests": 0,
        "new_acquisitions": 0,
        "phase_2": "NOT_RUN_HUMAN_GATE_CLOSED",
        "source_units_scanned": source_units,
        "source_unit_counts_by_field": dict(fields),
        "source_unit_counts_by_platform": dict(platforms),
        "captured_original_files_scanned": len(captured_paths),
        "evidence_candidate_sentences": len(evidence_rows),
        "category_candidate_counts": dict(category_counts),
        "pattern_candidate_counts": dict(pattern_counts.most_common()),
        "canon_map_snapshots": len(map_rows),
        "claim_marker_lineage_rows": len(lineage_rows),
        "first_appearance_queries": len(first_rows),
        "retitle_phase_contrast": retitle_phase["contrast"],
        "limits": [
            "Only five original files are locally preserved; most findings are bounded to retained platform metadata.",
            "Lexical candidates are not automatically promoted to graph edges or authority transitions.",
            "Map records with related titles are immutable observations; their edition lineage remains unresolved.",
            "Claim-marker counts are descriptive and cannot substitute for aligned-claim reading.",
            "Collaborator-reported full-text findings remain acquisition targets when their exact spans are absent locally.",
        ],
    }
    (output / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--vault", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    scan(args.vault, args.output)
