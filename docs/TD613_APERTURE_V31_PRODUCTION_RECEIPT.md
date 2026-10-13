# TD613 Aperture v3.1-alpha Production Receipt

Status: `IMPLEMENTED_PRODUCTION_DEMONSTRATED`

Commit: `e655c2a9`

Production routes:

- `https://td613.com/aperture/index.html`
- `https://td613.com/dome-world`
- `https://td613.com/dome-world/admissibility-tomography.html`

## Identity And Runtime

- The stable Aperture route loaded `tool.html?v=202607131806`.
- The instrument held `v3.1-alpha` and `td613-aperture/v3.1-alpha` through desktop and mobile first paint.
- Desktop and 390 by 844 mobile Propagate runs held identity for 10 seconds.
- Main, Moire, and trace canvas backing dimensions remained stable while running.
- Desktop and mobile horizontal overflow measured zero.
- The compact Admissibility Tomography drawer was present in the standalone instrument.

## Observatory Run

The deployed controlled demo returned:

```text
status: TOMOGRAPHY_READY
assurance: AT3
coverage: BOUNDED_COMPLETE
missing observation: preserved
null result: preserved
visible canvases: 1
```

Ash VI-A returned:

```text
ELIGIBLE_FOR_OPERATOR_DERIVATIVE_REVIEW
```

This is a recommendation for human review. It grants no derivative, export, Cinder, transport, or automatic Ash authority.

The deployed replay returned `REPLAY_VERIFIED`. The deployed replay module matched the locally tested module byte-for-byte at SHA-256 `b32165420d8f08b682ddea5f1ef5a283079264843a735db9f39ba6c147affbb0`; the tamper regression holds a modified receipt as `REPLAY_HELD`.

## Compatibility And Boundaries

- Phase IV and Phase V receipt schemas remain frozen at `v3.0-alpha` for compatibility.
- The v3.1 producer identity does not rewrite those deployed receipt contracts.
- Scope, non-claims, promotion conditions, abstention, and operator closure remain receipt-local.
- No new global claim-ceiling governor was installed.
- Flow-Core context remains artifact-blind and recommendation-not-command.
- Missing observations remain events; they are not erased by a gate.
- Phase VI-B derivative construction remains held.
- Phase VI-C destination-bound transport remains deferred.

## Validation

- Full Hush manifest: passed.
- Aperture v3.1 focused suite: passed.
- Dome-World art, integration, bridge, and Phase III focus: passed.
- Safe Harbor and release-tail contracts: passed.
- Generated sync, Aperture sync, smoke diagnostics, and focused diagnostics: passed.
- The standalone `deck-browser` Playwright check was environment-blocked because the matching local Playwright Chromium binary was unavailable; in-app desktop and mobile flights passed instead.

Operator closure: `PRODUCTION_DEMONSTRATED`

