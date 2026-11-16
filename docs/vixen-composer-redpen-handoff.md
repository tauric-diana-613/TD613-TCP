# Podium Composer · Redpen Score Review (RGI23)
 
**Stage #4 review interface.** Not Stage #5 execution. No automatic Compose, corpus/index writes, scientific promotion, or production release.

## Industry-standard foundations (alignment, not certification)

- **JSON Schema 2020-12**: `app/encyclopedia/reference/podium/redpen-return.schema.json` defines the portable return artifact. Podium performs additional *semantic* validation: exact Score SHA-256, Git revision, one unique disposition per listed decision, mandatory reasoning for DENY / AMEND / HOLD / REQUEST_ALTERNATIVE / REQUEST_EVIDENCE, and candidate IDs only from the ranked Score alternatives.
- **W3C Web Annotation Data Model**: each resolved item becomes an `assessing`-motivated annotation with a target JSON-Pointer-like selector and textual reasoning. This is an inspired data shape, not a claim of full JSON-LD conformance.
- **W3C PROV-O**: Score entity and source Git revision are linked in a minimal, explicit provenance descriptor. The bundle makes no third-party certification claim.
- **IETF RFC 6902**: read-only `test` preconditions communicate the digest and revision used in the review. They are **not** an executable JSON Patch; no batch mutation is performed.

## Exact human review path

1. Podium receives user-submitted synthesis and produces a **fully ranked, source-located, digest-bound Score**.
2. `podium.redpen` with `phase: "export"` returns the full packet and a blank redpen JSON return. A reader can annotate individual decisions and return that file. `phase: "chat"` returns the same controls in a machine-readable chat format so an assistant can render select/textarea controls without a file workflow.
3. Review choices: **APPROVE, DENY, AMEND, HOLD, REQUEST_ALTERNATIVE, REQUEST_EVIDENCE.** Amend, alternative selection, refusal, or an evidence request triggers new Score preparation / HOLD, never a silent replacement.
4. `podium.redpen` with `phase: "return"` validates decisions against the exact current Score. Even universal APPROVE returns `REVIEW_READY_FOR_INDEPENDENT_AUTHENTICATION`, **not a signed human authorization**.
5. Only the separately provisioned host credential with user verification can authorize `podium.compose`, tied to the entire exact Score digest and source revision.

## Conditional compact visual HTML

- If **no actual Observatory/Salon visual substitution is proposed**, no HTML file is attached.
- If any native visual artifact would be displaced, the Score marks an HTML attachment **REQUIRED** for every affected exhibit, including the existing (demoted) version and the proposed successor. Renderers must run as actual native modules and style sources, not sketches or dummy artwork.
- `podium.redpen` `phase: "visual"` can request the host **nativeReviewCaptureProvider**. The provider must prepare paired interactive **same-build** snapshot pages with hashed renderer/style/capture receipts. The compact HTML review shell links the before-and-after interactive pages and offers operator annotations. Each pair includes an exact lab and original/new form identity. Multiple affected exhibits are listed individually. Missing native pages or fidelity evidence returns **HELD**, never a fake review file.
- The small HTML shell works **with its adjacent native scene assets**; it cannot honestly promise exact dynamic fidelity as a single isolated HTML file while leaving multi-file WebGL/Canvas dependencies out.
- Mathematical/visual correspondence must be separately assayed in Stage #5 for the actual Score candidates. Stage #4's synthetic renderer test proves engineering substitution and restoration, not the scientific quality of a future proposal.

### Separation of work
Developer changes: PR review + CI. User-submitted synthesis: Podium Score + human review + separately authenticated Compose. Review filenames and chat replies are not human authentication. A machine-authored GitHub comment is not a distinct human witness.

**Stage #5 HELD · human closure RESERVED · ⟐**
