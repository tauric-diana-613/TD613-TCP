# TD613 Giving History — Civic Intelligence Instrument

## Design thesis

Giving should feel like a next-generation civic intelligence instrument, not a spreadsheet wearing a coat of paint, not a reskin of Hush, and not theatrical science-fiction cosplay. Hush established the grammar of luminous evidence, instrument panels, explicit states, and local-review ceremony. Giving advances that grammar into a sleek, low-fatigue research surface: anisotropic depth, immediate operational clarity, and dense evidence that remains effortless on a phone.

The visual metaphor is a quiet near-future data instrument. Committee histories resolve from a restrained signal field; sources remain spatially legible; human confirmation creates an explicit seam; receipts remain the visible wake of every action. Avoid roleplay labels, ornamental jargon, faux-terminal drama, and ceremonial copy invented for appearance.

## Evolution from Hush

Retain:

- layered depth and an unmistakable operator boundary;
- evidence/status colors that never operate without labels;
- monospaced custody and receipt language;
- a modern system sans for all primary reading and numerals;
- instrument-panel composition and visible system state;
- responsive, reduced-motion-safe behavior.

Advance or retire:

- replace Hush's violet-everywhere glow with a civic aurora palette;
- replace uniform glass cards with a hierarchy of continuous shell, quiet depth planes, and recessed data bays;
- reduce pill saturation: reserve capsules for state, count, and custody only;
- move from one large hero plus stacked cards to an information-dense operational viewport;
- use light as lineage: source color enters at the record edge and persists through review, totals, and receipts;
- use rupture markers for human decisions rather than decorative dividers;
- keep texture atmospheric, never over text or dense tables.

## Core palette

All colors must meet WCAG AA in their actual text/background pairings.

| Token | Value | Role |
|---|---|---|
| --g-void | #05090d | Outer field and session boundary |
| --g-night | #08131a | Main operator shell |
| --g-bay | #0d1d25 | Recessed controls and data bays |
| --g-panel | #112832 | Primary glass/metal panel |
| --g-sheet | #152d37 | Lifted dark evidence surface |
| --g-sheet-2 | #193540 | Secondary dark evidence surface |
| --g-ink | #f3f7f5 | Primary dark-surface text |
| --g-ink-dark | #17211f | Primary sheet text |
| --g-muted | #9eb1b2 | Secondary dark-surface text |
| --g-line | rgba(158, 202, 205, .18) | Structural line |
| --g-aqua | #6fe5dc | Retrieval, active focus, source motion |
| --g-electrum | #e7be68 | Confirmed evidence and committee totals |
| --g-coral | #ef7e6b | Exclusion, refusal, error, destructive gesture |
| --g-violet | #9c88ef | Vault/encryption authority only |
| --g-sky | #72bce3 | Campaign Deputy and external bridge |
| --g-moss | #8fca9c | Completed source / safe local custody |
| --g-amber | #efb45e | Partial, drifted, provisional, unresolved |

Gradient discipline:

- Ambient field: barely visible aqua and violet diffusion over --g-void; never a spotlight.
- Active seam: aqua → muted violet, 1–2px, never a full-card rainbow.
- Vault seam: violet → sky, isolated to Vault mode.
- Blur is rare and shallow; hierarchy comes from luminance, spacing, and one-pixel seams rather than glass-card repetition.

## Typography

No external font request is permitted.

- Display / committee / money: Aptos Display, Segoe UI Variable Display, Segoe UI, system-ui, sans-serif.
- Interface: Aptos, Segoe UI Variable, Segoe UI, system-ui, sans-serif.
- Evidence / receipt: SFMono-Regular, Cascadia Mono, Consolas, Liberation Mono, monospace.
- Hero title: clamp(1.75rem, 3vw, 3.5rem), line-height 1–1.05, tracking -.035em.
- Section title: clamp(1.35rem, 2vw, 2rem), line-height 1.05.
- Body: 0.94–1rem desktop, minimum 0.94rem mobile; line-height 1.5.
- Meta/eyebrow: 0.69–0.76rem, mono, uppercase, tracking .12–.18em.
- Money: modern sans, tabular numerals, medium weight, optical emphasis without false precision.
- Never place critical copy below 12px; target 14–16px on mobile.

## Geometry and depth

- Maximum desktop canvas: 1760px; edge padding 16–28px.
- Desktop grid: 320–380px command deck + fluid evidence viewport.
- Radius scale: 8px data rows, 14px bays, 20px primary panels, 28px session/hero shell.
- Avoid every surface floating. Use three depths:
  1. field — background and atmospheric grid;
  2. bay — inset control/data areas;
  3. instrument — elevated current task or human-decision surface.
- Shadow scale: inset hairline; 0 14px 38px rgba(0,0,0,.22); 0 32px 90px rgba(0,0,0,.38).
- Structural lines may use clipped or notched corners at decision seams, but controls retain conventional hit shapes.

## Spatial model

### Session ingress

A calm, high-impact full-screen aperture. One decisive title, a short custody statement, one password field, one action. Behind it, an abstract source constellation is built from CSS lines/dots only. Successful entry should feel like the observatory focusing: a 300–450ms depth transition, skipped under reduced motion.

### Desktop command deck

- Sticky top command bar: product title, dossier identity, session state, readiness, close.
- Left rail: dossier custody above query composer; collapsible source constellation below.
- Main viewport: mode rail and current evidence surface.
- A compact pulse strip communicates 23 source instances, active concurrency, records, confirmed amount, and provisional count without turning the page into a dashboard of vanity metrics.

### Mobile field instrument

- One column; command bar becomes a compact two-row header.
- Search/query composer appears first and may collapse after a run.
- The six modes become a sticky bottom or top segmented rail with icon-free text and counts; horizontal scrolling remains keyboard/touch accessible.
- Source cards, evidence records, and committee totals become edge-to-edge sheets with 12–14px gutters.
- Every action is at least 44×44px; destructive/CRM actions require visual separation and explicit wording.
- No hover-dependent information.

## Screen architecture

### 1. Source constellation

Replace a checkbox wall with grouped source bands: Federal, Florida, VoterFocus, EasyVote. Each family has a distinct line motif; each instance has status, jurisdiction, and coverage. Selection is still a native checkbox. During retrieval, the constellation becomes a live execution map at maximum concurrency three. Failure remains red/amber and explicit—never blank, never zero.

### 2. Evidence river

Search results arrive in chronological/source-aware lanes. The operator can pivot between source, date, and committee without losing lineage. A record's source edge color and locator follow it into identity review. Use archival light sheets inside the dark shell for high-density record reading.

### 3. Identity tribunal

This is the primary rupture surface. Suggestions stop at a visible vertical seam. On one side: deterministic reasons, similarities, and conflicts. On the other: four explicit human states. Confirmation should require a clearly labeled gesture and produce a small sigma-style receipt animation/entry. There is no bulk silent confirmation.

### 4. Committee atlas

Confirmed-only totals lead. Committees are large atlas rows with amount, date span, jurisdiction, office/cycle, record count, and provisional markers. Expand into the confirmed evidence beneath. Make comparison visually immediate while preserving transaction detail.

### 5. Vault chamber

Use violet only here to signal separate authority. Explain browser-memory decryption in one concise panel. Version ancestry should be a small branch graph/list; conflicts display parallel branches, never an overwrite metaphor.

### 6. Campaign Deputy bridge

Use sky-blue bridge lighting and a deliberate three-lane structure: Link existing / Create explicitly / Withhold. Existing-person selection dominates. Public street address remains unchecked and visually sensitive. Every mutation ends in a durable receipt; external historical contributions never masquerade as Campaign Deputy-native contributions.

### 7. Receipt wake

Receipts are a chronological wake, filterable by retrieval, identity, vault, CRM, refusal, and error. Each receipt is compact by default and expandable. Use mono data, kind label, source/custody edge, timestamp, and correlation id. Never log donor query values.

## Component specification

- CommandBar: product/dossier title, status pulse, readiness, session close.
- ModeRail: six modes, active seam, counts, keyboard roving focus.
- MetricPulse: source progress, records, confirmations, confirmed cents, provisional state.
- QueryComposer: name, aliases, hints, dates, source families, run/cancel.
- SourceBand / SourceNode: family grouping, selected/available/running/complete/partial/failed.
- EvidenceCard: contributor, committee, amount, date, geography, employer/occupation, lineage.
- DecisionSeam: deterministic reasons + explicit CANDIDATE/CONFIRMED/EXCLUDED/UNREVIEWED actions.
- CommitteeAtlasRow: committee-first aggregate with provisional status and expandable records.
- CustodyBadge: LOCAL/HOSTED/HYBRID with plain-language storage consequence.
- VaultBranch: version, digest, ancestry, conflict action.
- PersonMatchRow: exact Campaign Deputy person candidate and selection state.
- MutationDock: Link / Create / Withhold separated as materially different choices.
- ReceiptWakeItem: operation label, custody/source, timestamp, id, details.
- Toast: supplemental only; never the sole persistence of critical information.

## State language

- OBSERVED: neutral aqua edge.
- DERIVED: sky edge + “derived” label.
- MISSING: dashed amber edge.
- NULL_RESULT: neutral dashed edge, only when the source itself proved a valid null response.
- WITHHELD: electrum/amber lock mark and explicit reason.
- CONFIRMED: electrum + moss; human gesture receipt.
- CANDIDATE: amber.
- EXCLUDED: coral.
- UNREVIEWED: muted slate.
- COMPLETE: moss; PARTIAL/DRIFTED: amber; FAILED/UNAVAILABLE: coral.

## Motion and atmosphere

- Use motion to explain state transition: source pulse while queued/running, evidence arrival, decision seam closure, vault branch addition.
- Durations: 120–180ms controls, 240–360ms panels, max 450ms ingress.
- No perpetual scanline over text. Ambient constellation drift may be extremely slow and low-opacity outside content.
- Respect prefers-reduced-motion; preserve all state information with static edges/labels.
- Avoid parallax on mobile and anything that impairs scrolling or battery.

## Accessibility requirements

- WCAG AA contrast; AAA where reasonable for dense evidence text.
- Semantic headings and landmarks remain intact.
- Native form controls or equivalent accessible names/states.
- Keyboard access to tabs, source selection, decision actions, disclosure rows, and vault versions.
- Focus is a high-contrast 3px aqua ring with 2px offset; never remove it.
- Status always has text plus shape/edge; never color-only.
- aria-live is polite for source progress and toasts; critical errors use an anchored inline message.
- Record density must not force horizontal page scrolling at 320px.
- Mobile zoom remains enabled.

## Content rules

- Plain language first; poetic system language may frame but never obscure an action.
- “Suggested” never becomes “matched.”
- “Confirmed” always means operator-confirmed identity membership.
- Failed source is not “0 records.”
- Provisional totals state exactly why they are provisional.
- CRM actions name the external mutation before the button is pressed.
- Keep the route unlinked, noindex, and absent from the public sitemap/navigation.

## Implementation constraints for the redesign

- Static semantic HTML, vanilla CSS, and existing ES modules only.
- No Next.js, React, Tailwind, webfont request, analytics addition, image CDN, or external UI asset.
- CSS gradients, pseudo-elements, inline SVG, and existing repository assets are allowed.
- Preserve all current ids and data attributes relied on by giving-app.js unless controller code is intentionally updated with corresponding tests.
- Preserve signed-session membrane, no-store/noindex posture, maximum source concurrency three, human identity closure, local/hosted/hybrid custody, and all Campaign Deputy safeguards.
- Design must work at 320px, 390px, 768px, 1024px, 1440px, and wide desktop.
- The visual upgrade must not weaken data density, source lineage, or operator receipts.
