# INTERFACE LEXICON

Use this after [START_HERE.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/START_HERE.md) and [SYSTEM_OVERVIEW.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/SYSTEM_OVERVIEW.md) if you want a compact translation table between the playful UI and the stricter model vocabulary.

TCP uses a small vocabulary that does double duty: it has interface meaning and model meaning at the same time. This file keeps those terms brief, explicit, and non-mystical.

The glyph/state language is part of that vocabulary. In TCP, surface roles such as threshold, anchor, shelf, witness, encounter, and forge are registered runtime states, not decoration.

## Core controls

| Term | In the app | In the model |
| --- | --- | --- |
| `Console` | The post-ingress station index and the default routed landing surface. | A front-door shell that changes pacing and navigation without creating a second runtime or engine. |
| `Analyze Cadences` | Runs a solo or paired scan on the current text bays and wakes the latent metric surfaces. | Recomputes stylometric features, route pressure, archive state, and harbor recommendation. |
| `Swap Cadences` | Moves the cadence shells between the two bays without moving the text. | Tests whether shell-level stylometric bias changes the readout and `Shell Duel` when content stays fixed. |
| `Save Cadence as Persona` | Captures the active bay as a reusable in-app shell. | Converts the current cadence profile into a reusable stylometric modifier. |
| `Reset bay` | Restores the seeded opening pair and default switches. | Clears local shell state and returns the demo to native cadence mode. |

## Homebase controls

| Term | In the app | In the model |
| --- | --- | --- |
| `Cadence Lockbox` | The corpus input in `Homebase` where you stage one voice across one or more samples. | The local corpus used to derive a stable cadence lock profile. |
| `Lock` | Builds a staged cadence draft from the lockbox text without writing it into the archive. | Extracts a draft lock profile and makes it available for unrevealed mask comparison. |
| `Reveal` | Opens the deep dossier and wakes the global solo Telemetry/Harbor path for the active lock. | Runs the shared one-sample readout logic on the current Homebase lock. |
| `Save` | Persists the staged lock into the local lock archive. | Commits the draft cadence lock to local storage without changing its measured profile. |
| `Bring into Homebase` | Moves the chosen shelf mask into the Homebase worn-mask stage. | Sets the current Homebase mask without changing deck shell assignment. |
| `Try on Deck A` | Sends a persona shell to the reference bay in `Deck`. | Assigns the selected shell to slot `A` for live deck analysis. |
| `Try on Deck B` | Sends a persona shell to the probe bay in `Deck`. | Assigns the selected shell to slot `B` for live deck analysis. |
| `Back to Console` | Returns from a station page to the station index without clearing state. | Navigates the routed shell back to `#console` while keeping the current shared runtime alive. |

## Contact loop

| Term | In the app | In the model |
| --- | --- | --- |
| `chosen on shelf` | A mask has been selected in `Personas`, but is not yet worn in `Homebase`. | `gallerySelectedMaskId` is set while `homebaseWornMaskId` is still empty or different. |
| `Worn mask` | The dedicated Homebase stage that shows which mask is actively steering passage. | The current `homebaseWornMaskId` plus its resolved shell/profile data. |
| `Source` | The unmasked comparison text on the Homebase passage bench. | The raw comparison passage before persona transfer. |
| `Through Mask` | The transformed passage produced by the worn mask. | The retrieval-safe output of `buildCadenceTransfer(...)` through the worn shell. |
| `Before Contact` | Raw-to-lock reading before the mask touches the text. | Similarity and traceability of the source passage against the active lock. |
| `After Contact` | Masked-to-lock reading after the passage has been transformed. | Similarity and traceability of the transformed passage against the active lock. |
| `What Clung` | The residue list that names what still reads as home after contact. | Sticky axes, held lanes, and contact summaries derived from the lock comparison. |

## State controls

| Term | In the app | In the model |
| --- | --- | --- |
| `Mirror shield` | A route gate. When armed, the deck stays exploratory; when opened, passage can resolve. | Controls whether high recognition is allowed to count as route availability. |
| `Custody badge` | A small demo-state switch that changes the deck language and harbor posture. | Encodes branch-holding / buffering posture in the current prototype logic. |
| `Containment` | A stability flag shown in the state rail. | A bounded field modifier that slightly raises or lowers field potential. |
| `Ingress dev bypass` | A URL-only development shortcut, not a visible control in the live interface. | The `?ingress=off` flag that skips the custody handshake and opens the deck directly for testing. |

## Readouts

| Term | In the app | In the model |
| --- | --- | --- |
| `Cadence similarity` | How close the two voice samples feel in aggregate. | The bounded pairwise similarity score `S`. |
| `Traceability` | How strongly sentence-shape habits survive surface variation. | The bounded pairwise traceability score `T`. |
| `Route pressure` | Whether recognition is starting to demand a path instead of staying decorative. | The bounded route score `Pi`. |
| `Effective archive` | Which side is currently functioning as the effective archive. | The threshold result `A_I` or `A_W` from the custody delta rule; `A_I` means institutional custody remains the effective archive, and `A_W` means witness custody is carrying the archive. |
| `Harbor` | The recommended structured response once the field needs handling. | A provenance-constrained passage function selected from the harbor library. |
| `Receipt stream` | The demo ledger preview in the UI. | A sample row showing how event, archive, burden, and harbor are recorded. |
| `Shell Duel` | The side-by-side instrument on the `Deck` tab that stages the reference bay under its shell and the probe bay under its shell. | A direct view of shell transfer using each bay's transformed sample, heatmaps, signatures, and a pairwise delta strip. |
| `Ingress Membrane` | The full-screen ritual that appears before the deck unlocks on normal visits. | A custody-handshake layer that resolves containment, mirror posture, and badge state before the live shell opens. |
| `Deep dossier` | The revealed Homebase panel that shows cadence metrics, risk interpretation, and archive character for the active lock. | A rich summary layer built from the lock profile and solo readout quantities. |
| `Mask bench` | The Homebase comparison area that stages source passage, through-mask passage, before/after readings, and residue. | A local counterstyle test surface that compares transformed text against the active lock profile. |
| `Cast report` | The pre-analysis Deck strip that names contrast, branch heat, and swap promise before the duel wakes. | A lightweight pre-scan summary derived from the current pair state before route law is computed. |

## Shell language

| Term | In the app | In the model |
| --- | --- | --- |
| `Cadence shell` | The stylometric wrapper currently applied to a bay. | A deterministic cadence-transfer layer that rewrites sentence shape, connector/stance texture, contraction posture, and punctuation finish while preserving protected literals and raw source text. |
| `Persona shell` | A named, reusable cadence shell. | A saved transfer profile that can be reassigned to any bay. |
| `Native cadence` | The unmodified text as written. | The raw extracted stylometric profile before any shell bias is applied. |
| `Borrowed cadence` | A shell captured from the other bay during swap. | A derived modifier built from the effective profile of the opposite bay. |
| `Source sample` | The unchanged raw textarea text in each bay, as staged by `Shell Duel`. | The reference-side input and the probe-side input, each bent by its currently attached shell for visual comparison. |

## Decision states

| Term | In the app | In the model |
| --- | --- | --- |
| `weak-signal` | The deck stays exploratory. | Recognition has not crossed the current routing threshold. |
| `hold-branch` | The deck preserves the branch without escalating. | Recognition is present, but route is not yet open. |
| `criticality` | The deck warns that recognition is outrunning route. | Dense recognition has formed while passage is still blocked. |
| `passage` | The deck can name a harbor and safe-passage state. | Recognition is dense enough and the route gate is open. |

## Structural terms

| Term | In the app | In the model |
| --- | --- | --- |
| `Console` | The routed front door with one card per station and live status summaries. | A navigation shell over the same runtime state used by every station. |
| `Deck` | The encounter station with bays, controls, cast report, and `Shell Duel`. | The public membrane where cadence play and route-state education happen first. |
| `Homebase` | The cadence home for lock, reveal, save, archive, dossier, and mask work. | The private lock-and-compare surface that stages one voice before or alongside deck play. |
| `Readout` | The witness/law station that exposes scores, formulas, and ledger preview. | The explicit metric layer where similarity, route, and archive state are made legible. |
| `Personas` | The compact mask shelf and preview station. | The reusable shell gallery that feeds Homebase and Deck without owning the lock workflow itself. |
| `Station route` | The hash-routed room selector such as `#console`, `#homebase`, `#personas`, `#readout`, `#deck`, or `#trainer`. | A public navigation alias over one browser runtime; the route changes shell identity, not engine truth. |
| `Branch` | The branch formula shown in the readout/debug layer. | The rule that unwanted surplus is preserved until it can be interpreted or dismissed responsibly. |
| `Field` | The whole comparison environment shown on the deck. | The bounded environment in which similarity, recurrence, and route pressure interact. |
| `Harbor deck` | The panel that recommends structured passage. | The safe-harbor layer that lowers witness burden without destroying provenance. |

## One-line translation

If a label sounds ceremonial, the plain reading is usually this:

- `mirror` = route gate
- `badge` = posture switch
- `shell` = stylometric wrapper
- `lock` = staged cadence base
- `harbor` = structured passage
- `archive` = who is carrying continuity
