# Phase 20.1 Status — Hush Field Instrument

Phase 20.1 corrects the mobile failure exposed after Phase 20. Phase 20 made Hush look more like an alien console on desktop, but the phone view still felt like a compressed dashboard. Phase 20.1 treats mobile as the primary field instrument rather than a reduced desktop surface.

## Mission

Mobile Hush should feel like a classified field device in the operator’s hand: tactile, cinematic, compact, and legible under pressure.

The goal is not to flatten the surface. The goal is to make the phone version feel more intimate and more instrument-like while preserving the Hush operator route:

```text
Message
→ Mask
→ Transform
→ Output
→ Heat
→ Vault / Lab
```

## What changed

Phase 20.1 adds:

- `app/hush-field-instrument.css`
- `tests/hush-field-instrument-css.test.mjs`

It updates:

- `app/chamber-bootstrap.js`
- `app/asset-versions.js`
- `package.json`

## Surface changes

The field-instrument layer adds:

- phone-first classified-device layout overrides
- edge-to-edge field instrument framing
- vertical signal rails
- compact masthead treatment
- sticky phone path rail
- horizontal route-cartridge mask cards
- sticky Transform Gate
- decoded-transmission output styling
- horizontal biosignal heat trace tiles
- drawer aperture motion for Vault / Lab
- reduced-motion fallback

## Doctrine

Desktop is a command altar.
Mobile is a stolen field instrument.

The mobile surface should not feel minimized. It should feel classified.

## Boundary

Phase 20.1 is visual and navigational. It does not rewrite the Hush engine, release policy, claim integrity, source residue, syntax recomposition, or output selection.

It does not claim anonymity, untraceability, platform-proof behavior, publication safety, or identity outcomes.

Sealed ⟐
