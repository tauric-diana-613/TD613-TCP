# Phase 14 Status — Hush Simple Path

## Why Phase 14 exists

Phase 14 responds to non-Architect user testing. Users were confused by the difference between Protected Baseline / Reference Voice and Message Draft / Source Text.

That confusion was not a user failure. It was an exposed-workbench problem.

Hush should let a first-time operator start with the practical task:

1. paste the message;
2. choose or customize a mask;
3. transform the message;
4. review warnings and metrics only when needed.

## What changed

The default Hush surface now prioritizes:

- Message to Transform;
- Choose Mask;
- Transform Message;
- Transformed Message.

The old Protected Baseline field is now Advanced Reference Voice and lives inside a collapsed optional drawer.

The old Mask Reference / Custom Sample field is now Mask Reference Details and lives inside a collapsed drawer.

## Baseline fallback

Phase 14 adds `app/hush-simple-path.js`.

When the Advanced Reference Voice field is blank and the operator clicks a Hush action, the helper prepares the Message to Transform as the local reference voice.

This keeps the engine supplied with a baseline while allowing ordinary users to leave the advanced field blank.

## What did not change

Phase 14 does not change stylometry math, Hush masks, Recognition Field, Claim Ladder, residual steering, literal lockbox, or export policy.

It changes the front door.

## Operator posture

The lab remains available. It no longer stands in the doorway.

Sealed ⟐
