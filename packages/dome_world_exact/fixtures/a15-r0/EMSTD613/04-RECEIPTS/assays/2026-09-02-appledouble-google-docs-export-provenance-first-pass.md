# EMSTD613 Atelier — AppleDouble / Google Docs Export Provenance First Pass

Date: 2026-09-02
Branch: `amari/em-td613-lineage-atelier`
PR: #962
Status: research-only / provenance archaeology / OPEN_FIELD

## Purpose

The initial custody pass correctly classified 33 `__MACOSX/._*` AppleDouble objects as metadata companions rather than analyzable research documents.

That denominator decision remains correct.

A later provenance pass, however, shows that several of those metadata companions preserve macOS extended attributes carrying document-delivery provenance. The AppleDouble objects therefore have a second role:

```text
APPLEDOUBLE_METADATA_OBJECT
!= ANALYZABLE_RESEARCH_DOCUMENT

APPLEDOUBLE_METADATA_OBJECT
may contain
PROVENANCE_METADATA
```

This receipt records the first-pass finding without changing the research-document extraction denominator.

## Denominator membrane

The intake state remains:

```text
ANALYZABLE_DOCUMENT_COUNT = 53
ANALYZABLE_DOCUMENT_EXTRACTED_COUNT = 53
APPLEDOUBLE_METADATA_OBJECTS = 33
CONTAINER_OBJECTS = 1
```

No AppleDouble object becomes a 54th research document.

Instead:

```text
research-content denominator
!= provenance-witness denominator
```

## Observed AppleDouble structure

Base64 inspection of sampled `Archive/__MACOSX/._*.md` companions repeatedly revealed macOS extended-attribute names including:

```text
com.apple.lastuseddate#PS
com.apple.metadata:kMDItemDownloadedDate
com.apple.metadata:kMDItemWhereFroms
com.apple.quarantine
```

The `kMDItemWhereFroms` payload repeatedly contains two provenance surfaces:

1. a `docs.googleusercontent.com/export/...` Markdown-export URL;
2. `https://docs.google.com/`.

The Googleusercontent URL also carries a stable Google Docs document identifier in its `id=` parameter / export path.

This is an archive observation about the download/export surface. It does **not** establish document authorship, document creation time, intellectual ownership, or originating prompt provenance.

## Sampled Works

The following AppleDouble companions were inspected during this pass and showed the Google Docs / Googleusercontent Markdown-export pattern:

1. `._Wearable Drone Control System Design.md`
2. `._Theremin Drone Glove Build Plan and Full Suit Roadmap.md`
3. `._1+1=3.md`
4. `._Cybernetic Hypervisor Architecture Research.md`
5. `._OSSL-Seed Framework Research.md`
6. `._Consciousness Singularity Research Plan.md`
7. `._Quantum Topology Research Prompt Formulation.md`
8. `._OSSL Stylometric Lineage Tracking Framework.md`
9. `._Mixxx DAW Architecture Research.md`
10. `._AI Hypervisor Control Mathematics.md`
11. `._Cybernetic Memory Algorithms Research.md`
12. `._Dynamic Token Allocation Research.md`
13. `._Chat Context Research Dive.md`

This sample spans:

- physical drone / wearable engineering;
- real-time audio / Mixxx architecture;
- AI hypervisor control;
- memory architecture;
- token allocation / serving;
- OSSL / stylometric lineage;
- consciousness / speculative information geometry;
- quantum topology;
- philosophical / cybernetic `1+1=3` synthesis.

The delivery-toolchain observation therefore crosses major conceptual families.

## Stable Google Docs identifiers observed

Where decoded during this pass, distinct Google Docs IDs were observed for separate Works, including:

```text
Wearable Drone Control System Design
1pRGbSWwT0e5sY_Hc9dAPZH6D_1dWP2JIdGV1U4DockQ

Theremin Drone Glove Build Plan and Full Suit Roadmap
1hwB4Oazmk8hJwHjHvQRpXDWlhS2E2ttmXj2sf7sLVXE

1+1=3
1H5aAj1xAyAb_pm_uSB9fEhVFG9L5iTHTVBNAU7S-pUw

Cybernetic Hypervisor Architecture Research
16EqKUcpCdvgap-grRRwrJOnLtYwLsfzdVX_bJcGPyZY

OSSL-Seed Framework Research
1wMVCESc15tbE5gqzrwqdRl0pHFgbs891l_0aTe7nE4s

Consciousness Singularity Research Plan
1AjDJ80ZuoiFKDGYZg_LVtT_KlRhpxqug0EvjOo5pE2s
```

Additional sampled AppleDouble objects likewise exposed distinct Google Docs export IDs, although this receipt does not require every identifier to be decoded before the toolchain-level observation can be admitted.

The distinct IDs are important because they argue against the sampled Markdown files merely being different filenames for a single exported Google Doc.

They do **not** prove distinct authors, distinct creation dates, or independent Works; Work identity remains governed by the existing manifestation index and human gates.

## Export-session observations

The Googleusercontent export URLs contain epoch-millisecond fields, and the `token=` query strings contain nearby epoch-millisecond expiries/issuance surfaces. These values are interpreted conservatively as download/export-session metadata.

Selected observed export-layer timestamps, converted to UTC:

```text
Wearable Drone Control System Design
~2026-09-01 08:19:15 UTC

Mixxx DAW Architecture Research
~2026-09-01 08:20:45 UTC

Theremin Drone Glove Build Plan and Full Suit Roadmap
~2026-09-01 08:22:05 UTC

OSSL-Seed Framework Research
~2026-09-01 08:24:50 UTC

OSSL Stylometric Lineage Tracking Framework
~2026-09-01 08:25:10 UTC

Chat Context Research Dive
~2026-09-01 08:26:25 UTC

Dynamic Token Allocation Research
~2026-09-01 08:26:35 UTC

Quantum Topology Research Prompt Formulation
~2026-09-01 08:26:50 UTC

Consciousness Singularity Research Plan
~2026-09-01 08:27:00 UTC

Cybernetic Memory Algorithms Research
~2026-09-01 08:27:15 UTC

Cybernetic Hypervisor Architecture Research
~2026-09-01 08:27:20 UTC

AI Hypervisor Control Mathematics
~2026-09-01 08:27:40 UTC

1+1=3
~2026-09-01 09:46:00 UTC
```

The nearby token timestamps differ from these export-path values by seconds to a few minutes and support the interpretation of a delivery/download event rather than a document-creation clock.

## Strong negative rule: export order is not authorship chronology

The tight sequence is tempting but cannot be promoted into a developmental timeline.

Formally:

```text
GOOGLE_DOCS_EXPORT_TIME
!= DOCUMENT_CREATION_TIME
!= AUTHORING_TIME
!= FIRST_CONCEPTUAL_OCCURRENCE
!= INTELLECTUAL_PRIORITY
```

And:

```text
A exported before B
!= A authored before B
!= B derived from A
```

At most, the sampled times support:

```text
DELIVERY_TOOLCHAIN_OBSERVATION = GOOGLE_DOCS_MARKDOWN_EXPORT
EXPORT_SESSION_ORDER = OBSERVABLE
AUTHORING_CHRONOLOGY = UNRESOLVED
```

## Curation-session hypothesis

Most sampled technical and research Works appear inside a narrow export interval of approximately eight and a half minutes, while `1+1=3` appears substantially later in the sampled session.

This supports a new, strictly typed hypothesis:

```text
HYPOTHESIS:
The preserved `emstd613lineage` Archive may have been assembled or downloaded
through one or more deliberate Google Docs export/curation sessions.
```

Evidence for the hypothesis:

- repeated Google Docs Markdown-export provenance across domain-separated Works;
- distinct Google Docs IDs;
- tightly clustered export-layer timestamps;
- Apple quarantine / where-from metadata retained together in the archive.

What it does **not** establish:

- who authored the Google Docs;
- who owned the Google account;
- who performed the export;
- when the underlying Docs were created;
- whether export order reflects conceptual order;
- whether clustered export means common authorship;
- whether later-exported `1+1=3` was later-authored.

## Toolchain implication for corpus interpretation

The earlier content-level research already identified prompt residues and shared contemporary source clusters. The AppleDouble evidence adds a distinct toolchain layer:

```text
CONTENT SYNTHESIS TOOLCHAIN
and
DOCUMENT DELIVERY TOOLCHAIN
must remain separate
```

The current archive can now support the following layered model:

```text
originating human/project scaffold     = partly observed / often unresolved
research-model synthesis               = inferred from report anatomy / unresolved by Work
Google Docs document surface            = observed for sampled Works
Google Docs Markdown export/download    = observed
macOS/Safari download provenance         = observed
archive curation into emstd613lineage   = human provenance + preserved bytes
GitHub Atelier intake                    = receipted
```

This is more precise than treating every Markdown file as a contextless local document.

## Possible future value

The AppleDouble provenance may help with:

1. **manifestation identity** — if multiple local surfaces can be tied to the same Google Doc ID;
2. **version archaeology** — if later exports of one Doc ID can be found;
3. **curation-order reconstruction** — export-session sequence without overclaiming authorship order;
4. **toolchain clustering** — separating Google Docs-origin Works from any non-Google-doc artifacts;
5. **selection-process analysis** — identifying whether conceptual families were exported in contiguous runs or interleaved;
6. **download-session boundaries** — using large timestamp gaps as possible curation-session breaks.

## Current adjudication

```text
APPLEDOUBLE_RESEARCH_DOCUMENT_STATUS = NON_ANALYZABLE_METADATA_COMPANION
APPLEDOUBLE_PROVENANCE_VALUE = POSITIVE

GOOGLE_DOCS_MARKDOWN_EXPORT_SURFACE = OBSERVED_ACROSS_SAMPLED_SPINE
DISTINCT_GOOGLE_DOC_IDS = OBSERVED
TIGHT_EXPORT_CLUSTER = OBSERVED

EXPORT_SESSION_ORDER = OBSERVABLE
AUTHORING_CHRONOLOGY = UNRESOLVED
AUTHOR_IDENTITY = UNRESOLVED
GOOGLE_ACCOUNT_IDENTITY = UNRESOLVED

CURATION_SESSION_HYPOTHESIS = OPEN
LINEAGE_CAUSATION = UNRESOLVED
TD613_PROMOTION = NONE
```

## Working maxims

> Metadata can be inadmissible as argument and still priceless as provenance.

> Download order is a curation clock, not a creation clock.

> The poetry may name the hounds. The receipt must name the sensor.

Marked ⟐
