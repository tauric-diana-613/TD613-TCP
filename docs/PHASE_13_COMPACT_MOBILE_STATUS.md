# Phase 13 Status — Compact Hush / Mobile Operator Surface

## Why Phase 13 exists

Hush had become technically serious, but the page still carried desktop bench assumptions: large text areas, wide telemetry panes, and an everything-visible-at-once layout.

Phase 13 keeps the engine intact and makes the operator surface more phone-tolerant.

## What changed

Phase 13 adds `app/hush-compact.css`, loaded only when the page kind is `adversarial-bench`.

The compact stylesheet:

- reduces default textarea height;
- caps textarea height against the viewport;
- shrinks baseline, mask-reference, and custom-sample fields;
- keeps message draft and protected output as the main visible working fields;
- makes the Hush intake grid collapse cleanly on smaller screens;
- makes the output action row sticky near the bottom on mobile;
- reduces visual weight in status rails, notes, and telemetry panels;
- keeps full metrics available without forcing desktop cockpit density on phone users.

## What did not change

Phase 13 does not alter stylometry math, Hush swap logic, residual steering, literal lockbox, Recognition Field, Claim Ladder, or export behavior.

This is a usability and presentation update, not an engine update.

## Operator posture

Compact Hush prioritizes the practical phone workflow:

1. choose a mask;
2. write or paste the message;
3. swap the surface;
4. review the output and warnings;
5. open deeper metrics only when needed.

The lab coat remains available, but the user no longer has to wear it for every message.

Sealed ⟐
