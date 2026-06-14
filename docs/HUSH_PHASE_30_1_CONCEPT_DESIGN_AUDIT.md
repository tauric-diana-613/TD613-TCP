# Hush Phase 30.1 Concept Design Audit

## Purpose

Phase 30.1 audits Hush after the Evidence Cockpit merge and prepares the next design leap. The patch focuses on mask persona cards, Customizer field parity, and a visual-grammar audit for desktop and mobile.

## Aperture frame

The audit uses the Aperture counter-tool frame, now canonically v2.7.0: route state, layer visibility, self-test visibility, anti-enforcement posture, and export-gate legibility. Hush should preserve play while making custody, limits, and state visible.

## Desktop UI / UX audit

### Strengths

- The Phase 30 cockpit gives the product route a stronger command surface.
- Signal bus, receipt gate, narrowing losses, and self-test panels make the product feel more instrument-like.
- The futurecore-goth direction now has richer depth, glow, and telemetry language.

### Gaps

- The product route and legacy chamber still have separate visual grammars.
- Mask cards carry strong operational guidance, but persona naming was too generic before 30.1.
- The cockpit is expressive, but the mask selector still needs more storytelling density.

## Mobile UI / UX audit

### Strengths

- The mobile-specific CSS and viewport guard are still necessary; mobile should not simply shrink the desktop cockpit.
- The legacy chamber has a usable phone route for message, mask, transform, heat, and copy.

### Gaps

- The mobile route needs a stronger card hierarchy for mask personas.
- Long persona stories can crowd small frames unless card typography and line length are controlled.
- Phase 31 should audit tap targets, drawer depth, and cockpit-to-chamber continuity on small screens.

## Visual grammar verdict

Hush now reads as a field instrument, but the next cosmetic overhaul should unify three layers:

1. cockpit telemetry
2. mask persona theater
3. Customizer forge

The guiding phrase for Phase 31 should be: fun and scary stylometry games, but with instrument-grade restraint.

## Phase 30.1 implementation choices

- Every built-in and late-phase mask now has a two-part persona name.
- Descriptions now provide a short scene or context rather than a flat voice summary.
- IDs remain stable so tests, routing, and exports do not break.
- Customizer can collect the same card-template fields used by built-in masks: family, description, intended use, risk tell, transform hints, and pressure warnings.
- Customizer metadata is added through a small enhancer module and boot file rather than a risky rewrite of the giant bench module.

## Phase 31 framing

Phase 31 should be a visual-system overhaul:

- unified desktop/mobile card hierarchy
- mask persona gallery mode
- richer mask route cards with compact story previews
- Customizer forge styling
- cockpit/chamber continuity pass
- accessibility audit for contrast, motion, line height, and touch targets
