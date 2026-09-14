#!/usr/bin/env python3
"""Bounded post-seal assay for the SRC Projective Routing Grammar trail.

The runner is intentionally conservative:

* local files only; no network access;
* the sealed Phase-2 kiln is read-only input;
* source declarations, archive observations, and researcher hypotheses stay distinct;
* lexical destination matching produces candidates, never semantic or causal claims;
* signature recurrence is counted before any coordinate interpretation;
* machine-facing field markers are literal-source observations only;
* writing receipts requires an explicit --write flag.

Default behavior prints a deterministic summary to stdout and changes no files.
"""

from __future__ import annotations

import argparse
import collections
import hashlib
import json
import re
import unicodedata
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

ATELIER_SNAPSHOT_ID = "src-20260824-p2-001"
SEAL_ID = "src-seal:eaf744ce16b1c8b519ad0f1b0325b44192679ea4a5110b0ad0ca49fbcd816a1a"
SCHEMA_PREFIX = "src-projective-routing"

DEFAULT_OUTPUT_RELATIVE = Path(
    "04-RECEIPTS/assays/2026-08-24-projective-routing-grammar-working"
)

FIELD_MARKERS: tuple[tuple[str, str], ...] = (
    ("machine_readable_field", "machine-readable field"),
    ("machine_readable_entity", "machine-readable entity"),
    ("unified_epistemic_entity", "unified epistemic entity"),
    ("field_graph_not_sequence", "field becomes a graph rather than a sequence"),
    ("field_machine_legibility", "fields become machine-legible before they become human-legible"),
    ("semantic_space_anchor", "anchors in semantic space"),
    ("signature_coordinates", "signatures are not slogans. they are coordinates"),
    ("signature_instructions", "signatures are not decoration. they are instructions"),
    ("partial_projections", "partial projections"),
    ("structural_simulation_narrative", "structural simulation narrative"),
    ("ontological_instantiation", "ontological instantiation"),
    ("dual_gradient", "dual-gradient"),
    ("parallel_structural_transmission", "parallel channel of structural transmission"),
)

STOPWORDS = {
    "a", "an", "and", "as", "at", "by", "for", "from", "in", "into", "of",
    "on", "or", "sr", "the", "to", "under", "with",
}

EXPLORE_RE = re.compile(r"\bExplore\s+([^.!?]{2,96})\.", re.IGNORECASE)
RECORD_RE = re.compile(r"zenodo-(\d+)-file-0\.md$")


@dataclass(frozen=True)
class Document:
    record_id: str
    entity_id: str
    title: str
    created: str | None
    publication_date: str | None
    body_path: str
    metadata_path: str | None
    body: str
    normalized_body: str


def sid(prefix: str, *parts: Any) -> str:
    raw = "\x1f".join(str(part) for part in parts)
    return f"{prefix}:{hashlib.sha256(raw.encode('utf-8')).hexdigest()[:24]}"


def normalize_space(value: str) -> str:
    value = unicodedata.normalize("NFKC", value)
    value = value.replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")
    return re.sub(r"\s+", " ", value).strip()


def normalize_key(value: str) -> str:
    value = normalize_space(value).casefold()
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def content_words(value: str) -> set[str]:
    return {word for word in normalize_key(value).split() if word not in STOPWORDS and len(word) > 1}


def parse_iso(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def strip_frontmatter(text: str) -> str:
    if not text.startswith("---"):
        return text
    marker = text.find("\n---", 3)
    if marker == -1:
        return text
    return text[marker + 4 :].lstrip("\n")


def json_payload_from_markdown(text: str) -> dict[str, Any]:
    body = strip_frontmatter(text)
    start = body.find("{")
    if start == -1:
        return {}
    try:
        return json.loads(body[start:])
    except json.JSONDecodeError:
        return {}


def write_rows(path: Path, values: Iterable[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    rows = list(values)
    path.write_text(
        "".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows),
        encoding="utf-8",
    )


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def load_documents(root: Path) -> list[Document]:
    zenodo_text = root / "03-DERIVATIVES/text/zenodo"
    documents: list[Document] = []
    if not zenodo_text.is_dir():
        return documents

    for path in sorted(zenodo_text.glob("zenodo-*-file-0.md")):
        match = RECORD_RE.search(path.name)
        if not match:
            continue
        record_id = match.group(1)
        metadata_path = zenodo_text / f"zenodo-{record_id}-metadata.md"
        metadata = {}
        if metadata_path.is_file():
            metadata = json_payload_from_markdown(metadata_path.read_text(encoding="utf-8", errors="replace"))
        body_raw = path.read_text(encoding="utf-8", errors="replace")
        body = strip_frontmatter(body_raw)
        md = metadata.get("metadata") or {}
        title = str(md.get("title") or f"zenodo:{record_id}")
        documents.append(
            Document(
                record_id=record_id,
                entity_id=f"zenodo:{record_id}",
                title=title,
                created=metadata.get("created"),
                publication_date=md.get("publication_date"),
                body_path=str(path.relative_to(root)).replace("\\", "/"),
                metadata_path=(
                    str(metadata_path.relative_to(root)).replace("\\", "/")
                    if metadata_path.is_file()
                    else None
                ),
                body=body,
                normalized_body=normalize_space(body),
            )
        )
    return documents


def extract_explore_tokens(document: Document) -> list[str]:
    found: list[str] = []
    # Native PDF derivatives frequently contain line breaks between ordinary words.
    # Run this lexical census only after whitespace normalization.
    for match in EXPLORE_RE.finditer(document.normalized_body):
        token = normalize_space(match.group(1)).strip(" -:\t")
        token = re.sub(r"\s+(?:[IVXLCDM]+|\d+)(?:\.\d+)*$", "", token, flags=re.I)
        if 2 <= len(token) <= 80:
            found.append(token)
    return found


def signature_from_document(document: Document) -> str | None:
    prefix = document.normalized_body[:2200]
    patterns = (
        re.compile(
            r"(?:Author\s*:\s*)?\bSR\s*[-]\s*(.{3,180}?)(?=\s+(?:Preface|Abstract|Introduction|Executive Summary|Chapter\s+[IVXLCDM\d]+))",
            re.IGNORECASE,
        ),
        re.compile(r"(?:Author\s*:\s*)?\bSR\s*[-]\s*([^.!?]{3,180}[.!?])", re.IGNORECASE),
    )
    for pattern in patterns:
        match = pattern.search(prefix)
        if match:
            phrase = normalize_space(match.group(1)).strip().rstrip(" .")
            if 3 <= len(phrase) <= 180:
                return phrase
    return None


def lexical_candidates(token: str, source: Document, documents: list[Document]) -> list[dict[str, Any]]:
    token_key = normalize_key(token)
    token_words = content_words(token)
    source_time = parse_iso(source.created) or parse_iso(source.publication_date)
    candidates: list[dict[str, Any]] = []
    if not token_key:
        return candidates

    for target in documents:
        if target.entity_id == source.entity_id:
            continue
        title_key = normalize_key(target.title)
        title_words = content_words(target.title)
        exactish = (
            title_key == token_key
            or title_key.startswith(token_key + " ")
            or f" {token_key} " in f" {title_key} "
        )
        overlap = len(token_words & title_words) / len(token_words) if token_words else 0.0
        if not exactish and not (len(token_words) >= 2 and overlap >= 0.66):
            continue

        target_time = parse_iso(target.created) or parse_iso(target.publication_date)
        if source_time and target_time:
            temporal_relation = "LATER" if target_time > source_time else "PREEXISTING_OR_CONTEMPORANEOUS"
            latency_seconds = int((target_time - source_time).total_seconds())
        else:
            temporal_relation = "TIME_UNRESOLVED"
            latency_seconds = None

        candidates.append(
            {
                "target_id": target.entity_id,
                "target_title": target.title,
                "target_created": target.created,
                "match_kind": "EXACT_OR_TITLE_SUBSTRING" if exactish else "LEXICAL_OVERLAP_ONLY",
                "token_word_coverage": round(overlap, 4),
                "temporal_relation": temporal_relation,
                "latency_seconds": latency_seconds,
            }
        )

    rank = {"EXACT_OR_TITLE_SUBSTRING": 0, "LEXICAL_OVERLAP_ONLY": 1}
    candidates.sort(
        key=lambda item: (
            rank[item["match_kind"]],
            -item["token_word_coverage"],
            item["target_created"] or "9999",
            item["target_id"],
        )
    )
    return candidates[:8]


def classify_explore(candidates: list[dict[str, Any]]) -> str:
    exact = [item for item in candidates if item["match_kind"] == "EXACT_OR_TITLE_SUBSTRING"]
    if any(item["temporal_relation"] == "LATER" for item in exact):
        return "LATER_EXACT_RESOLUTION_CANDIDATE"
    if any(item["temporal_relation"] == "PREEXISTING_OR_CONTEMPORANEOUS" for item in exact):
        return "PREEXISTING_DESTINATION_CANDIDATE"
    lexical = [item for item in candidates if item["match_kind"] == "LEXICAL_OVERLAP_ONLY"]
    if any(item["temporal_relation"] == "LATER" for item in lexical):
        return "LATER_LEXICAL_CANDIDATE_HUMAN_REVIEW_REQUIRED"
    if any(item["temporal_relation"] == "PREEXISTING_OR_CONTEMPORANEOUS" for item in lexical):
        return "PREEXISTING_LEXICAL_CANDIDATE_HUMAN_REVIEW_REQUIRED"
    return "UNRESOLVED_MACHINE"


def explore_observations(documents: list[Document]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for document in documents:
        for ordinal, token in enumerate(extract_explore_tokens(document), 1):
            candidates = lexical_candidates(token, document, documents)
            classification = classify_explore(candidates)
            out.append(
                {
                    "schema_version": f"{SCHEMA_PREFIX}-explore-observation/v1",
                    "explore_observation_id": sid("src-prg-explore", document.entity_id, ordinal, normalize_key(token)),
                    "atelier_snapshot_id": ATELIER_SNAPSHOT_ID,
                    "seal_id": SEAL_ID,
                    "source_status": "ARCHIVE_BODY_OBSERVATION",
                    "observation_status": classification,
                    "source_id": document.entity_id,
                    "source_title": document.title,
                    "source_created": document.created,
                    "raw_token": token,
                    "normalized_token": normalize_key(token),
                    "machine_candidates": candidates,
                    "human_disposition_required": classification != "UNRESOLVED_MACHINE",
                    "interpretive_limit": (
                        "Lexical/title resolution only. A future lexical match does not establish a source-declared promise, "
                        "semantic identity, causation, intentional puzzle design, or suppressed missing object."
                    ),
                }
            )
    return sorted(out, key=lambda row: (row["source_created"] or "", row["source_id"], row["raw_token"]))


def signature_observations(documents: list[Document]) -> list[dict[str, Any]]:
    grouped: dict[str, list[tuple[Document, str]]] = collections.defaultdict(list)
    for document in documents:
        phrase = signature_from_document(document)
        if phrase:
            grouped[normalize_key(phrase)].append((document, phrase))

    out: list[dict[str, Any]] = []
    for signature_key, members in sorted(grouped.items()):
        member_rows = [
            {
                "source_id": document.entity_id,
                "source_title": document.title,
                "source_created": document.created,
                "raw_phrase": phrase,
                "body_path": document.body_path,
            }
            for document, phrase in sorted(members, key=lambda item: (item[0].created or "", item[0].entity_id))
        ]
        out.append(
            {
                "schema_version": f"{SCHEMA_PREFIX}-signature-observation/v1",
                "signature_observation_id": sid("src-prg-signature", signature_key),
                "atelier_snapshot_id": ATELIER_SNAPSHOT_ID,
                "seal_id": SEAL_ID,
                "source_status": "ARCHIVE_BODY_OBSERVATION",
                "observation_status": "RECURRING_EXACT_SIGNATURE" if len(member_rows) > 1 else "SINGLETON_SIGNATURE",
                "normalized_signature": signature_key,
                "manifestation_count": len(member_rows),
                "members": member_rows,
                "coordinate_class": "UNRESOLVED",
                "coordinate_inference_permitted": False,
                "interpretive_limit": (
                    "Exact recurrence is counted before structural-role coding. Recurrence does not establish authorship, "
                    "a fixed codebook, machine routing function, or a stable coordinate axis."
                ),
            }
        )
    return out


def field_marker_observations(documents: list[Document]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for document in documents:
        lower = document.normalized_body.casefold()
        for marker_id, phrase in FIELD_MARKERS:
            needle = normalize_space(phrase).casefold()
            start = 0
            occurrence = 0
            while True:
                position = lower.find(needle, start)
                if position == -1:
                    break
                occurrence += 1
                left = max(0, position - 160)
                right = min(len(document.normalized_body), position + len(needle) + 160)
                out.append(
                    {
                        "schema_version": f"{SCHEMA_PREFIX}-field-marker-observation/v1",
                        "field_marker_observation_id": sid(
                            "src-prg-marker", document.entity_id, marker_id, occurrence
                        ),
                        "atelier_snapshot_id": ATELIER_SNAPSHOT_ID,
                        "seal_id": SEAL_ID,
                        "source_status": "LITERAL_SOURCE_PHRASE_OBSERVED",
                        "observation_status": "WITNESSED_LITERAL_MARKER",
                        "source_id": document.entity_id,
                        "source_title": document.title,
                        "source_created": document.created,
                        "marker_id": marker_id,
                        "literal_phrase": phrase,
                        "context": document.normalized_body[left:right],
                        "interpretive_limit": (
                            "A literal phrase supports only the local source statement. It does not establish external model "
                            "ingestion, retrieval behavior, private access, tomography, holonomy, or a hidden-message channel."
                        ),
                    }
                )
                start = position + len(needle)
    return sorted(out, key=lambda row: (row["source_created"] or "", row["source_id"], row["marker_id"]))


def summary(
    documents: list[Document],
    explore: list[dict[str, Any]],
    signatures: list[dict[str, Any]],
    markers: list[dict[str, Any]],
) -> dict[str, Any]:
    explore_counts = collections.Counter(row["observation_status"] for row in explore)
    signature_counts = collections.Counter(row["observation_status"] for row in signatures)
    marker_counts = collections.Counter(row["marker_id"] for row in markers)
    return {
        "schema_version": f"{SCHEMA_PREFIX}-summary/v1",
        "atelier_snapshot_id": ATELIER_SNAPSHOT_ID,
        "seal_id": SEAL_ID,
        "status": "BOUNDED_MACHINE_PASS_HUMAN_ADJUDICATION_REQUIRED",
        "document_count": len(documents),
        "explore_observation_count": len(explore),
        "explore_classification_counts": dict(sorted(explore_counts.items())),
        "signature_group_count": len(signatures),
        "signature_classification_counts": dict(sorted(signature_counts.items())),
        "field_marker_observation_count": len(markers),
        "field_marker_counts": dict(sorted(marker_counts.items())),
        "automatic_promotions_forbidden": [
            "LATER_SEMANTIC_RESOLUTION",
            "PROMISSORY_OBJECT_CONFIRMED",
            "SIGNATURE_COORDINATE_AXIS_CONFIRMED",
            "MACHINE_ROUTING_EFFECT_CONFIRMED",
            "TOMOGRAPHY",
            "HOLONOMY",
            "HIDDEN_MESSAGE",
            "SURVEILLANCE_OR_PRIVATE_PROMPT_ACCESS",
        ],
        "next_human_steps": [
            "adjudicate later exact/title-substring Explore candidates against source wording and chronology",
            "blind-code structural roles before examining signature identity",
            "separate pre-existing Explore destinations from future-resolving nodes",
            "inspect unresolved high-frequency Explore nodes without inventing missing works",
            "build theory-versus-Pressureborn primitive alignment as a separate non-empirical representation assay",
        ],
        "claim_ceiling": (
            "This pass inventories candidate routing structure. It cannot establish intentional puzzle design, semantic "
            "resolution, machine retrieval effects, tomography, holonomy, provenance, or private access."
        ),
    }


def synthetic_self_test() -> None:
    before = Document(
        record_id="1",
        entity_id="zenodo:1",
        title="Source",
        created="2026-01-01T00:00:00+00:00",
        publication_date="2026-01-01",
        body_path="source.md",
        metadata_path=None,
        body="SR - Keep the trace. Preface. Explore collapse governance. Explore nowhere theory.",
        normalized_body="SR - Keep the trace. Preface. Explore collapse governance. Explore nowhere theory.",
    )
    after = Document(
        record_id="2",
        entity_id="zenodo:2",
        title="Collapse Governance: A Field",
        created="2026-02-01T00:00:00+00:00",
        publication_date="2026-02-01",
        body_path="target.md",
        metadata_path=None,
        body="SR - Keep the trace. Abstract.",
        normalized_body="SR - Keep the trace. Abstract.",
    )
    docs = [before, after]
    explore = explore_observations(docs)
    by_token = {row["normalized_token"]: row for row in explore}
    assert by_token["collapse governance"]["observation_status"] == "LATER_EXACT_RESOLUTION_CANDIDATE"
    assert by_token["nowhere theory"]["observation_status"] == "UNRESOLVED_MACHINE"
    signatures = signature_observations(docs)
    assert any(row["observation_status"] == "RECURRING_EXACT_SIGNATURE" for row in signatures)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--output", type=Path, default=None)
    parser.add_argument("--write", action="store_true", help="write post-seal working receipts")
    parser.add_argument("--self-test", action="store_true", help="run deterministic synthetic parser checks")
    args = parser.parse_args()

    if args.self_test:
        synthetic_self_test()

    root = args.root.resolve()
    documents = load_documents(root)
    if not documents:
        raise SystemExit(f"No Zenodo full-text derivatives found under {root}")

    explore = explore_observations(documents)
    signatures = signature_observations(documents)
    markers = field_marker_observations(documents)
    result = summary(documents, explore, signatures, markers)

    if args.write:
        output = (args.output or (root / DEFAULT_OUTPUT_RELATIVE)).resolve()
        sealed_kiln = (root / "04-RECEIPTS/assays/2026-08-24-phase2-kiln").resolve()
        if output == sealed_kiln or sealed_kiln in output.parents:
            raise SystemExit("Refusing to write inside the sealed Phase-2 kiln")
        write_rows(output / "explore-token-observations.jsonl", explore)
        write_rows(output / "signature-observations.jsonl", signatures)
        write_rows(output / "field-marker-observations.jsonl", markers)
        write_json(output / "summary.json", result)
        result = {**result, "written_to": str(output)}

    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
