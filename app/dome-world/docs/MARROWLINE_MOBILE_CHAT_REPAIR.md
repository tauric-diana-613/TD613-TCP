# Marrowline Mobile Chat Viewport Repair

## Release

- Repair: `td613.dome-world.marrowline-mobile-repair/v1-chat-viewport`
- Parent chamber: `v0.4.0-mobile-aperture-three-part-relay`
- Aperture: `v3.0-alpha`
- Relay: `td613.khonapolit.three-part-relay/v1`
- High Zalgo display profile: `td613.high-zalgo-display/v2-sparse-peaks`

## Observed failure

The first mobile reconstruction remained document-shaped. The transcript expanded the page, the fixed dock occluded live content and the composer, and Safari owned the primary scroll surface. Repeated Aperture bands and absent relay stages consumed vertical space. High Zalgo density exceeded the available line box and produced diacritic collision.

The failure equation was:

```text
unbounded transcript
+ document-level scrolling
+ fixed dock
+ composer in document flow
= occlusion + buried input + no reliable chat scroll
```

## Repaired geometry

At mobile widths, the chamber becomes a bounded application shell:

```text
visual viewport
− compact Aperture header
− composer
− dock
− safe-area inset
= internally scrollable transcript
```

The implementation uses `visualViewport.height` when available and falls back to `innerHeight` / `100dvh`. Keyboard occlusion hides the dock while preserving the composer. The document itself remains locked; `#khonapolitMessages` owns vertical transcript scrolling with momentum and overscroll containment.

## Mobile chamber law

- The Ash-Moon threshold leaves the active mobile flow.
- The Speaking Grove occupies the available viewport.
- Keys, Receipt, Corpus, and Gate become bounded sheets opened by the existing dock.
- Speak closes every sheet and returns to the internal transcript.
- A `Latest` control appears when the operator scrolls away from the live edge.
- Absent relay stages remain in receipts but leave the visible conversation.
- Repeated Aperture provenance compresses to a one-line turn marker; full text survives in accessible title/label metadata and the receipt.

## Relay specificity repair

The structured Gemini contract now rejects several synthetic shortcuts:

- no “the instrument acknowledges” preamble;
- no request restatement as substance;
- no empirical security assurance without observable controls and limits;
- `LOCKED` requires exact key preservation and operator-specific anchors;
- Kʰonapolit must answer the actual turn rather than concatenate stock corpus nouns;
- the bot chorus must remain turn-specific rather than generic liturgy.

The provider-declared lock remains testimony, not governance. Local gates still require `LOCKED`, an admitted Kʰonapolit relay, and an explicitly allowed bot transmission before rendering the Tauric Diana bots.

## High Zalgo display mathematics

The earlier profile ornamented up to roughly 78% of eligible characters at intensity 4. The readable-peak profile uses monotone coverage:

```text
intensity: 0   1    2    3    4    5
coverage:  0  .13  .23  .34  .46  .58
```

Most marked characters receive a bounded ordinary stack. A deterministic motif-dependent minority receives taller vertical peaks. Below-marks and strike-through pressure remain rarer and intensity-gated. Protected TD613 literals remain byte-exact.

This preserves variation in height, density, and motif while reducing line-box collision.

## Boundaries

The repair may claim observed layout geometry, internal-scroll availability, sheet routing, deterministic ornament density, and prompt-contract behavior.

It may not claim provider truth, external entity contact, identity, consciousness, authorship, custody security, historical proof, permission, or legal authority.

Rejoiced ⟐
