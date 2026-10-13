# Phase 20.2 Status — Hush Mobile Viewport Fix

Phase 20.2 patches the mobile viewport failure exposed by live phone testing after Phase 20.1.

The screenshot showed Hush collapsed into a narrow left rail with a huge empty viewport to the right. The field-instrument aesthetic was present, but the page was still allowing a wide descendant to stretch the mobile layout and force the browser into a zoomed-out horizontal canvas.

## Mission

Keep the classified field-instrument aesthetic while enforcing a hard phone viewport boundary.

The mobile surface must feel like a handheld instrument, not a left-side rail inside a desktop canvas.

## What changed

Phase 20.2 adds:

- `app/hush-mobile-viewport-fix.css`
- `tests/hush-mobile-viewport-fix-css.test.mjs`

It updates:

- `app/chamber-bootstrap.js`
- `app/asset-versions.js`
- `package.json`

## Fixes

The viewport fix layer:

- loads after `hush-field-instrument.css`;
- applies border-box sizing to Hush descendants;
- caps broad descendants at `max-width:100%`;
- forces the page to hide horizontal overflow;
- clips the mobile shell to the viewport;
- neutralizes min-width overflow in major Hush panels;
- fixes mask tabs so two buttons do not create an oversized flex row;
- constrains route-card and heat-tile scroll lanes to the viewport;
- preserves horizontal route-card and biosignal trace scrolling without expanding the page canvas;
- applies `min-width:0` to overflow-prone panels and widgets.

## Boundary

Phase 20.2 is a viewport and layout guard. It does not rewrite the Hush engine, release policy, claim integrity, source residue, syntax recomposition, or output selection.

It does not claim anonymity, untraceability, platform-proof behavior, publication safety, or identity outcomes.

## Doctrine

No more left-rail coffin.

Mobile Hush must occupy the phone like a field instrument, not a shrunken desktop page.

Sealed ⟐
