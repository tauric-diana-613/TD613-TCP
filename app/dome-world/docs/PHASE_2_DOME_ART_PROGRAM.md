# Dome-World Phase 2 Dome-Art Program

Status: design-prep only. No Phase 2 renderer is active in the cockpit.

## Preservation Contract

Phase 2 extends the existing Dome-World grammar; it does not replace it.

- Weather remains the exterior atmospheric Dome and keeps `#weatherCanvas`.
- Lab remains the station constellation and keeps the complete `.lab-node` grammar.
- The eight primary tabs keep their clipped rail geometry and Flow-Core glyphs.
- Every new field is mathematically driven by existing world state or a declared route receipt.
- Decorative randomness, unrelated animation loops, and hidden-room rendering are prohibited.
- Ash remains outside Phase 2 until Weather and Lab pass preservation review.

## Shared Rendering Architecture

Future views should use one coordinator:

```js
renderDomeArt(viewId, worldSnapshot, viewport, time)
```

The coordinator owns one `requestAnimationFrame` loop and renders only the active view. Each
view renderer is pure with respect to world state: it receives a snapshot and returns no route
mutation. Canvas backing stores resize only when measured CSS dimensions or device-pixel ratio
change. `IntersectionObserver` may pause an active canvas when the cockpit itself leaves the
viewport, but it may not decide route state.

Required receipt fields:

- `renderer`
- `worldRevision`
- `inputDigest`
- `operators`
- `modeled: true`
- `claimCeiling`

## View Programs

### Weather: Exterior Atmospheric Dome

Preserve the current triangular lattice, phi rosette, fold traces, room nodes, and Dome arc.
Future work may bind pressure-line amplitude to fold density, curvature visibility to route
visibility, and front velocity to declared world cadence. It may not turn weather into
prediction or replace the current composition.

### Rooms: Interior Chamber Lattice

Render rooms as local sections rather than boxes in a universal floor plan. Chamber cells use
the existing room adjacency map; corridor brightness reflects restriction compatibility; fold
arcs appear where local sections resist gluing. `cōl` and `hõt` remain a local gradient, never a
global rank.

### Lab: Station Constellation

Keep all ten `.lab-node` objects unchanged. A canvas or CSS layer may sit behind the cards to
draw station edges, hover routing pulses, and glyph-specific interference traces. The graph
must remain subordinate to the cards and stop when Lab is not active.

### Substrate: Exact Coordinate Mesh

Render rational coordinates as exact markers on a deformation mesh. Residual wells show
captured differences; unresolved observations remain visible as open markers. Float weather
values never cross into exact-gate decisions.

### Phason: Content-Invariant Seam View

Use paired layers with a fixed content anchor and a changing projection basis. Moire bands,
phase seams, and trace displacement visualize projection drift. The content digest remains
stationary and visible so motion cannot imply content mutation.

### Aperture: Boundary Membrane

Render a semi-permeable route membrane whose refraction is driven only by declared Aperture
handoff fields. The bridge remains one-way. Exposure gradients may visualize route posture;
they may not claim Aperture execution or write back into doctrine.

### Receipts: Ledger Star Map

Map receipts as scoped witness nodes. Edges represent declared lineage, replay, recall, or
revocation relationships. Node size may encode local route density, never truth or authority.
Every visual witness retains its claim ceiling.

### Ash: Deferred Cooled Field

Ash is explicitly deferred. A later phase may study cinder nodes, thermal boundaries, veil
pressure, and reconstruction contours only after its custody route receives a separate visual
and provenance review.

## Delivery Sequence

1. Freeze reference screenshots for Weather, Lab, and the mobile rail.
2. Add the single active-view scheduler with no new art.
3. Prove hidden views perform zero animation and zero canvas draws.
4. Introduce Rooms and Receipts as the first new renderers.
5. Add Substrate and Phason after exact-vs-modeled boundary tests.
6. Add Aperture after one-way bridge tests.
7. Review Weather and Lab for pixel-level preservation.
8. Scope Ash separately.

## Acceptance Gates

- No deletion or replacement of Weather or Lab selectors.
- One active animation loop across the cockpit.
- No backing-store resize when dimensions are unchanged.
- No horizontal overflow at 390 CSS pixels.
- Mobile rail and internal stepper do not cover active content.
- Each renderer exposes its operators and claim ceiling.
- Reduced-motion mode presents a stable, complete frame.
- Beauty remains evidence of constraint, never evidence of authority.
