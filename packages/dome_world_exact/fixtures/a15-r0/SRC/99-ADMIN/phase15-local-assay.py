from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

from docx import Document
from pypdf import PdfReader


ORDINAL_WORDS = "first second third fourth fifth sixth seventh eighth ninth tenth eleventh twelfth"
RELATION_PATTERNS = {
    "ORDINAL_OBJECT": rf"\b(?:{ORDINAL_WORDS.replace(' ', '|')})\s+(?:essay|paper|mechanism|part|stage|phase|layer|theorem|law|volume|installment|entry)\b",
    "NUMBERED_PART": r"\bpart\s+(?:[1-9]|i{1,3}|iv|v|vi{0,3}|ix|x)\b",
    "FIELD_PAPER_ORDINAL": r"\bfield\s+paper\s+(?:[1-9]|i{1,3}|iv|v|vi{0,3}|ix|x)\b",
    "NUMBERED_LAW": r"\b(?:propagation\s+)?law\s*#?\s*(?:[1-9]|i{1,3}|iv|v|vi{0,3}|ix|x)\b",
    "ARC_ORDINAL": r"\barc\s+(?:[1-9]|i{1,3}|iv|v|vi{0,3}|ix|x)\b",
    "DIAGNOSTIC_ORDINAL": r"\b(?:applied\s+)?diagnostic\s*#?\s*(?:[1-9]|i{1,3}|iv|v|vi{0,3}|ix|x)\b",
    "TRILOGY": r"\btrilog(?:y|ies)\b",
    "COMPANION_TO": r"\bcompanion(?:\s+paper|\s+essay|\s+work)?\s+to\b",
    "PREQUEL_TO": r"\bprequel\s+to\b",
    "SEQUEL_TO": r"\bsequel\s+to\b",
    "FOLLOWS": r"\bfollows?\b",
    "PRECEDES": r"\bprecedes?\b",
    "BUILDS_ON": r"\bbuilds?\s+(?:on|upon)\b",
    "EXTENDS": r"\bextends?\b",
    "FORMALIZES": r"\bformalizes?\b",
    "OPERATIONALIZES": r"\boperationalizes?\b",
    "INTRODUCES": r"\bintroduces?\b",
    "CONTINUES": r"\bcontinues?\b",
    "COMPLETES": r"\bcompletes?\b",
    "CULMINATES": r"\bculminates?\b",
    "FOUNDATION_FOR": r"\bfoundation(?:al)?\s+(?:for|to)\b",
    "ANCHORS": r"\banchors?\b",
    "SUPPORTS": r"\bsupports?\b",
    "SYNTHESIZES": r"\bsynthesi[sz]es?\b",
    "TRANSLATES": r"\btranslates?\b",
    "GOVERNS": r"\bgoverns?\b",
    "RECURS_AS": r"\brecurs?\s+as\b",
    "DEFINES": r"\bdefines?\b",
    "FORMS": r"\bforms?\b",
    "POSITIONS": r"\bpositions?|positioned\b",
    "ESTABLISHES": r"\bestablish(?:es|ed|ing)?\b",
    "IN_CODEX": r"\b(?:in|within|part of)\s+(?:the\s+)?(?:SR|SignalRupture)?\s*(?:Codex|canon|series|architecture|lineage)\b",
}

IMPLICIT_TERMS = [
    "theoretical spine", "semantic backbone", "provenance architecture",
    "supporting work", "supporting works", "supporting architecture",
    "capstone synthesis", "retrieval-ready structure", "retrieval-ready blueprint",
    "genealogical structure", "lineage map", "developmental arc", "structural map",
    "constitutional foundation", "foundational layer", "synthesis layer",
    "surface translation", "stylometric coherence", "referential density",
    "temporal recurrence", "temporal re-emergence", "redundant indexing",
    "semantic anchoring", "lineage formation", "origin gravity",
    "seven-part architecture", "twelve phases", "SR Codex", "cross-surface recurrence",
]

STOPWORDS = set("a an and are as at be by for from has have how in into is it its of on or that the their this through to under when where which while with without".split())
FEED_CUES = ["why", "when", "how", "what", "who", "where", "they", "you", "we", "our"]
ARCHIVAL_CUES = ["theory", "theorem", "framework", "model", "diagnostic", "synthesis", "canonical", "primitive", "meta-research", "system-level"]
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
    value = html.unescape(value)
    value = value.replace("\u00a0", " ")
    return re.sub(r"[ \t]+", " ", value).strip()


def sentence_units(text: str):
    chunks = re.split(r"(?<=[.!?])\s+|\n+", text or "")
    return [re.sub(r"\s+", " ", chunk).strip() for chunk in chunks if chunk and chunk.strip()]


def norm_tokens(text: str):
    folded = unicodedata.normalize("NFKD", text.casefold())
    folded = "".join(ch for ch in folded if not unicodedata.combining(ch))
    return re.findall(r"[a-z0-9]+", folded)


def core_tokens(text: str):
    return [t for t in norm_tokens(text) if t not in STOPWORDS and len(t) > 1]


def norm_title(text: str):
    return " ".join(norm_tokens(text))


def marker_counts(text: str):
    normalized = text.casefold().translate(DASH_TRANSLATION)
    feed = sum(len(re.findall(rf"\b{re.escape(cue)}\b", normalized)) for cue in FEED_CUES)
    feed += normalized.count("the week")
    formal = sum(len(re.findall(rf"\b{re.escape(cue)}\b", normalized)) for cue in ARCHIVAL_CUES)
    return feed, formal


def evidence_id(record: dict, field: str, locator: dict, sentence: str) -> str:
    basis = json.dumps([record["manifestation_id"], field, locator, sentence], ensure_ascii=False, sort_keys=True)
    return "sr-local-evidence-" + hashlib.sha256(basis.encode("utf-8")).hexdigest()[:16]


def evidence_fingerprint(sentence: str):
    words = sentence.split()
    return {
        "text_sha256": hashlib.sha256(sentence.encode("utf-8")).hexdigest(),
        "word_count": len(words),
        "short_excerpt": " ".join(words[:12]) + (" …" if len(words) > 12 else ""),
    }


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

    platform_specs = [
        ("substack.jsonl", "Substack"),
        ("medium.jsonl", "Medium"),
        ("academia.jsonl", "Academia.edu"),
    ]
    for filename, platform in platform_specs:
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


def scan(vault: Path, output: Path):
    output.mkdir(parents=True, exist_ok=True)
    evidences = []
    term_occurrences = []
    term_counts = Counter()
    source_unit_count = 0
    source_unit_fields = Counter()
    source_unit_platforms = Counter()
    captured_source_paths = set()
    excerpted_manifestations = set()

    for record, field, locator, text in source_records(vault):
        source_unit_count += 1
        source_unit_fields[field] += 1
        source_unit_platforms[record["platform"]] += 1
        if field == "captured_full_text":
            captured_source_paths.add(record["source_path"])
        for sentence_index, sentence in enumerate(sentence_units(text), 1):
            hit_relations = [name for name, pattern in RELATION_PATTERNS.items() if re.search(pattern, sentence, re.I)]
            normalized_sentence = sentence.casefold().translate(DASH_TRANSLATION)
            hit_terms = [term for term in IMPLICIT_TERMS if term.casefold().translate(DASH_TRANSLATION) in normalized_sentence]
            if hit_relations:
                loc = dict(locator)
                loc["sentence"] = sentence_index
                fingerprint = evidence_fingerprint(sentence)
                if record["manifestation_id"] in excerpted_manifestations:
                    fingerprint.pop("short_excerpt", None)
                else:
                    excerpted_manifestations.add(record["manifestation_id"])
                evidences.append({
                    "evidence_id": evidence_id(record, field, loc, sentence),
                    "manifestation": record,
                    "source_field": field,
                    "source_locator": loc,
                    "matched_relation_terms": hit_relations,
                    "evidence_fingerprint": fingerprint,
                    "edge_status": "CANDIDATE_REQUIRES_TARGET_RESOLUTION",
                    "inference": None,
                })
            if hit_terms:
                for term in hit_terms:
                    term_counts[term] += 1
                    loc = dict(locator)
                    loc["sentence"] = sentence_index
                    term_fingerprint = evidence_fingerprint(sentence)
                    term_fingerprint.pop("short_excerpt", None)
                    term_occurrences.append({
                        "term": term,
                        "manifestation_id": record["manifestation_id"],
                        "platform": record["platform"],
                        "title": record["title"],
                        "doi": record.get("doi"),
                        "published_at": record.get("published_at"),
                        "source_path": record["source_path"],
                        "source_field": field,
                        "source_locator": loc,
                        "evidence_fingerprint": term_fingerprint,
                    })

    doi_links = [row for _, row in read_jsonl(vault / "01-MANIFESTS" / "crosswalk" / "doi-links.jsonl")]
    retitles = []
    for row in doi_links:
        sub = row["substack_title"]
        zen = row["zenodo_title"]
        if norm_title(sub) == norm_title(zen):
            continue
        sub_core, zen_core = core_tokens(sub), core_tokens(zen)
        sub_set, zen_set = set(sub_core), set(zen_core)
        union = sub_set | zen_set
        jaccard = len(sub_set & zen_set) / len(union) if union else 1.0
        sub_feed, sub_arch = marker_counts(sub)
        zen_feed, zen_arch = marker_counts(zen)
        sub_words, zen_words = norm_tokens(sub), norm_tokens(zen)
        if len(zen_words) < len(sub_words):
            direction = "ZENODO_SHORTER"
        elif len(zen_words) > len(sub_words):
            direction = "ZENODO_LONGER"
        else:
            direction = "EQUAL_WORD_COUNT"
        normalized_sub, normalized_zen = norm_title(sub), norm_title(zen)
        if normalized_sub.startswith(normalized_zen + " "):
            classification = "CORE_LABEL_COMPRESSION"
        elif zen_arch > sub_arch:
            classification = "GENRE_FORMALIZATION_MARKER_GAINED"
        elif sub_feed > zen_feed:
            classification = "FEED_MARKER_REDUCED"
        else:
            classification = "RESIDUAL_SUBSTANTIVE_RECAST"
        directional_score = (sub_feed - zen_feed) + (zen_arch - sub_arch)
        register = "TOWARD_ARCHIVAL_FORMAL_REGISTER" if directional_score > 0 else "NEUTRAL" if directional_score == 0 else "AWAY_FROM_ARCHIVAL_FORMAL_REGISTER"
        retitles.append({
            "assay_id": "sr-retitle-" + hashlib.sha256(row["doi"].encode()).hexdigest()[:12],
            "doi": row["doi"],
            "work_identity_basis": "Substack manifestation explicitly links this Zenodo DOI",
            "substack": {"manifestation_id": f"substack:{row['substack_id']}", "title": sub, "url": row["substack_url"], "published_at": row["substack_published_at"]},
            "zenodo": {"manifestation_id": f"zenodo:{row['zenodo_record_id']}", "title": zen, "url": row["zenodo_url"], "published_at": row["zenodo_published_at"]},
            "metrics": {
                "substack_word_count": len(sub_words),
                "zenodo_word_count": len(zen_words),
                "shared_core_tokens": sorted(sub_set & zen_set),
                "core_token_jaccard": round(jaccard, 4),
                "substack_feed_cues": sub_feed,
                "zenodo_feed_cues": zen_feed,
                "substack_archival_cues": sub_arch,
                "zenodo_archival_cues": zen_arch,
                "feed_marker_delta_substack_minus_zenodo": sub_feed - zen_feed,
                "formal_marker_delta_zenodo_minus_substack": zen_arch - sub_arch,
                "combined_directional_score": directional_score,
            },
            "title_transformation": direction,
            "register_candidate": register,
            "primary_classification": classification,
            "semantic_core_test": "TITLE_LEVEL_ONLY",
            "full_text_comparison_status": "NOT_TESTABLE_FROM_CURRENT_LOCAL_SUBSTACK_CAPTURE",
            "intentional_surface_translation": "UNDETERMINED",
            "hypothesis_edge": {
                "from": "doi:" + row["doi"],
                "relation": "CANDIDATE_INSTANCE_OF",
                "to": "sr-mechanism:surface-translation",
                "status": "UNRESOLVED",
                "promotion_gate": "preserved full-text/content comparison plus predeclared controls",
            },
        })

    def write_jsonl(name, rows):
        with (output / name).open("w", encoding="utf-8", newline="\n") as stream:
            for row in rows:
                stream.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")

    write_jsonl("declared-language-candidates.jsonl", evidences)
    write_jsonl("implicit-term-occurrences.jsonl", term_occurrences)
    write_jsonl("retitle-assay.jsonl", retitles)

    strong = Counter()
    for evidence in evidences:
        strong.update(evidence["matched_relation_terms"])
    retitle_summary = Counter(r["title_transformation"] for r in retitles)
    register_summary = Counter(r["register_candidate"] for r in retitles)
    classification_summary = Counter(r["primary_classification"] for r in retitles)
    raw_title_differences = sum(1 for row in doi_links if row["substack_title"] != row["zenodo_title"])
    same_day = sum(1 for row in retitles if str(row["substack"]["published_at"])[:10] == str(row["zenodo"]["published_at"])[:10])
    month_counts = Counter(str(row["substack"]["published_at"])[5:7] for row in retitles)
    summary = {
        "assay": "Phase 1.5 local-only distributed architecture assay",
        "assay_version": "phase15-local-architecture/v1",
        "network_requests": 0,
        "new_acquisitions": 0,
        "source_units_scanned": source_unit_count,
        "source_unit_counts_by_field": dict(source_unit_fields),
        "source_unit_counts_by_platform": dict(source_unit_platforms),
        "captured_original_files_scanned": len(captured_source_paths),
        "declared_language_candidate_sentences": len(evidences),
        "relation_phrase_counts": dict(strong.most_common()),
        "implicit_term_occurrences": len(term_occurrences),
        "implicit_term_counts": dict(term_counts.most_common()),
        "doi_links_total": len(doi_links),
        "raw_title_differences": raw_title_differences,
        "retitled_pairs": len(retitles),
        "same_utc_calendar_date_pairs": same_day,
        "retitles_by_substack_month": dict(sorted(month_counts.items())),
        "retitle_direction_counts": dict(retitle_summary),
        "register_candidate_counts": dict(register_summary),
        "primary_classification_counts": dict(classification_summary),
        "retitle_method": {
            "identity_basis": "Substack-to-Zenodo DOI link already retained locally",
            "title_normalization": "Unicode-insensitive lowercase alphanumeric token sequence for retitle selection",
            "feed_markers": FEED_CUES + ["the week"],
            "formal_genre_markers": ARCHIVAL_CUES,
            "classification_priority": ["CORE_LABEL_COMPRESSION", "GENRE_FORMALIZATION_MARKER_GAINED", "FEED_MARKER_REDUCED", "RESIDUAL_SUBSTANTIVE_RECAST"],
        },
        "limits": [
            "The local Substack and Medium manifests contain titles and limited metadata, not captured full article bodies.",
            "Only five original Zenodo files are locally preserved, so corpus-wide full-text architectural claims remain untestable.",
            "Relation phrase hits are manifestation-level evidence candidates; they are not automatically resolved graph edges.",
            "Title/register heuristics are descriptive and do not establish author intent.",
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
