# INTERFACE LEXICON

TCP uses a small vocabulary that does double duty: it has interface meaning and model meaning at the same time. This file keeps those terms brief, explicit, and non-mystical.

## Core controls

| Term | In the app | In the model |
| --- | --- | --- |
| `Analyze Cadences` | Runs a solo or paired scan on the current text bays and wakes the latent metric surfaces. | Recomputes stylometric features, route pressure, archive state, and harbor recommendation. |
| `Swap Cadences` | Moves the cadence shells between the two bays without moving the text. | Tests whether shell-level stylometric bias changes the readout and `Shell Duel` when content stays fixed. |
| `Save Cadence as Persona` | Captures the active bay as a reusable in-app shell. | Converts the current cadence profile into a reusable stylometric modifier. |
| `Reset bay` | Restores the seeded opening pair and default switches. | Clears local shell state and returns the demo to native cadence mode. |

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
| `Deck` | The main interaction surface with bays, controls, and `Shell Duel`. | The public membrane where cadence play and route-state education happen first. |
| `Readout` | The tab that exposes scores, formulas, and ledger preview. | The explicit metric layer where similarity, route, and archive state are made legible. |
| `Personas` | The tab that exposes saved and built-in shells. | The shell library used to reapply cadence bias without changing source text. |
| `Branch` | The branch formula shown in the readout/debug layer. | The rule that unwanted surplus is preserved until it can be interpreted or dismissed responsibly. |
| `Field` | The whole comparison environment shown on the deck. | The bounded environment in which similarity, recurrence, and route pressure interact. |
| `Harbor deck` | The panel that recommends structured passage. | The safe-harbor layer that lowers witness burden without destroying provenance. |

## One-line translation

If a label sounds ceremonial, the plain reading is usually this:

- `mirror` = route gate
- `badge` = posture switch
- `shell` = stylometric wrapper
- `harbor` = structured passage
- `archive` = who is carrying continuity
