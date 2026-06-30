# Phase 9 Release Recommendation

Recommendation: local Phase 9 instrumentation may remain merged after local tests pass. Deployed/provider release claims remain deferred until runtime evidence exists.

## Local layer

Run `npm run test:hush:phase9:local`.

This layer covers local registry behavior, source packet bank integrity, dangerous pair matrix generation, full matrix staging, mask distinctness, and source obligation preservation.

## Provider layer

Run `npm run test:hush:phase9:contracts`.

This layer is fixture-backed until live provider logs are available. Fixture-backed drift proves the comparison machinery can classify provider behavior. It does not prove live provider behavior.

## Export discipline

Run `npm run test:hush:phase9:exports`.

This layer must keep public-default false, raw sample excluded, raw candidate excluded, and non-claims present across all completed masks.

## Runtime flight

not run — environment limitation / awaiting deployed TD613.com packet evidence.

Runtime flight requires URL, build/commit identity, console/network notes, outbound contract artifact, inbound provider log, export artifact, mask selector state, public-default state, and raw exposure state.

## Non-claims

Phase 9 records observed local behavior, observed provider fixture drift, and observed export discipline. It does not grant public-release authority, override Safe Harbor, override Aperture, override EO-RFD/ACEDIT policy, prove authorship, prove identity, or bypass validators.

Sealed ⟐
