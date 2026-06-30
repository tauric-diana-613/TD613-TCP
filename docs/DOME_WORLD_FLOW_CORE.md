# Dome-World / Flow-Core

Current release: `v0.4.3`, coupled one-way to TD613 Aperture `v2.9.4`.

Dome-World is a post-exposure route-weather and exact-residual cockpit. It
preserves three layers without collapsing them:

1. Modeled weather describes local route pressure.
2. Exact substrate receipts decide capture, capacity, and opt-in closure over
   rational/integer inputs.
3. Aperture doctrine governs admissibility interpretation but is not executed
   by Dome-World.

Every observation remains represented as `CAPTURED`, `OPEN`,
`CONSTRUCTION_PROPOSED`, `REJECTED_CAPACITY`, `ENCODER_REQUIRED`, or
`INVALID_CLOSURE`. Routing or deferral may not silently turn an observation
into a non-event.

The route is intentionally absent from public navigation during this release.
It is reachable directly at `/dome-world` for preview and audit.
