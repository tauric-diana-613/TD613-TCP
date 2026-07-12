# Dome-World / Flow-Core

Current release: `v0.5.0`, coupled to TD613 Aperture `v3.0-alpha` through
reciprocal receipts without reciprocal authority.

The v0.5.0 cockpit adds one active-view animation scheduler, machine-facing art receipts,
mathematically constrained perspectives, and accessible Lab station navigation. Exact-engine
and API receipt contracts remain on their compatible v0.4.3 schemas.

Dome-World is a post-exposure route-weather and exact-residual cockpit. It
preserves three layers without collapsing them:

1. Modeled weather describes local route pressure.
2. Exact substrate receipts decide capture, capacity, and opt-in closure over
   rational/integer inputs.
3. Aperture doctrine governs admissibility interpretation but is not executed
   by Dome-World.

The `aperture-bridge` operation accepts declared Aperture metrics plus an
optional diagnostic-receipt reference and returns a
`td613.flowcore.context-receipt/vNext` object. The return records source status,
sensor identity, transformation history, missingness, uncertainty, and modeled
weather for Aperture audit. It cannot write Aperture doctrine, activate Ash,
establish an artifact relation, or promote modeled weather into exact proof.

Every observation remains represented as `CAPTURED`, `OPEN`,
`CONSTRUCTION_PROPOSED`, `REJECTED_CAPACITY`, `ENCODER_REQUIRED`, or
`INVALID_CLOSURE`. Routing or deferral may not silently turn an observation
into a non-event.

The route is intentionally absent from public navigation during this release.
It is reachable directly at `/dome-world` for preview and audit.
