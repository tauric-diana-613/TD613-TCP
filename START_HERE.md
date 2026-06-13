# START HERE

This is the shortest practical path into the current TD613 Gateway.

TD613 is a custody-aware authorship routing stack. The current gateway is intentionally small: it opens five maintained instruments and leaves older TCP chambers in the repository as experimental/lab surfaces, not as the public starting path.

## Current gateway tools

- `TD613 Hush` — local syntax transposition: message, mask, transform, review. Use it when a message needs a different surface while protected literals, claim integrity, and residual source heat remain reviewable.
- `TD613 Aperture` — counter-tool and narrowing audit. Use it when you need to see how a passage is filtered, compressed, admitted, rejected, or route-pressured without turning that audit into enforcement.
- `TD613 Safe Harbor` — provenance intake and packet custody. Use it to stage a packet, mint SHI from the triad, preserve hashes/route recommendations, and prepare seal-ready custody.
- `TD613 Flight` — SHI-gated credential flightdeck. Use it after Safe Harbor mints an SHI; it builds LLM-ready Flight Packets with authorship / rupture footers, route-readiness controls, and Safe Harbor metadata.
- `TD613 Trainer` — forge and validation lane. Use it to extract a field, shape a candidate shell, validate it, then decide whether it deserves injection or export.

## First run

1. Open `app/index.html`.
2. Complete the `Ingress Membrane`, or use `?ingress=off` during development.
3. Choose one of the maintained TD613 tools above.
4. Start with `Hush` when you are testing message transformation and review.
5. Start with `Aperture` when you are testing narrowing, admissibility pressure, or counter-tool audit behavior.
6. Start with `Safe Harbor` when you need packet custody, SHI minting, or sealed handoff.
7. Open `TD613 Flight` only after minting an SHI in Safe Harbor.
8. Use `Trainer` when you need extract / forge / validate / inject behavior rather than message masking or packet sealing.

## How the tools fit together

For a full custody route, a clean read is usually:

1. `Trainer` if a shell must be forged and validated before use.
2. `Hush` if a live message needs surface transposition and local review.
3. `Aperture` if the output needs narrowing, filtering, or route-pressure audit.
4. `Safe Harbor` when the route needs provenance, packet state, SHI, and seal-ready custody.
5. `TD613 Flight` when the sealed route needs an LLM-ready packet, credential footer, or manifest-style handoff.

That order is not mandatory. The important rule is that TD613 keeps surface, authorship pressure, route, custody, and credentialing separate instead of letting one tool pretend to settle all five.

## Legacy / lab surfaces

Older TCP chambers such as `Homebase / Personas`, `Readout`, and `Deck` still exist in the repository for experimental continuity and regression work. Do not treat them as the current public gateway or the canonical onboarding route.

If a legacy route such as `#homebase`, `#readout`, or `#deck` appears in code, read it as a lab/runtime compatibility surface unless the current tool you are working on explicitly depends on it.

## Browser flights

Use these when you want the browser to prove itself:

- `app/index.html?test-flight=1` - smoke-only
- `app/index.html?test-flight=2` - main full browser run
- `app/index.html?test-flight=transfer`
- `app/index.html?test-flight=swap`
- `app/index.html?test-flight=ingress`

## Repo test path

The maintained suite is:

```bash
npm test
```

The legacy formulas suite is separate:

```bash
npm run test:legacy:formulas
```

## Read next

- [README.md](README.md)
- [ABSTRACT.md](ABSTRACT.md)
- [docs/INDEX.md](docs/INDEX.md)
