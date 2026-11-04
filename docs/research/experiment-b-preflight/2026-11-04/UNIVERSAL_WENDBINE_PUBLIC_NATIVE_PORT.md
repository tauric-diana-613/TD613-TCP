# TD613 · Universal Atelier's native Wendbine public research port

**Prospective Universal Atelier:** B91/B92 source-free product, via \`scripts/td613-preflight-twin-products-v01.mjs\`.  
**Separate native source:** Wendbine Nov04 public seal, [Wendbine query PR #1661](https://github.com/tauric-diana-613/TD613-TCP/pull/1661) pinned exact HEAD \`2d71913fa0cb099d6835a1e86943ef440951c825\`.

**Problem:** Before this port, Universal Atelier's \`WENDBINE_PUBLIC\` delegate executed only a B91 **invented W_PUBLIC fixture** with the older synthetic \`wendbine-public-v0.1-synthetic\` source epoch. That is useful for method testing but did not search the real November 4 public registry.

**Fix:** \`scripts/universal-atelier-wendbine-public-port-v01.mjs\` accepts the **actual** \`twin.atelier\` product API and a separate read-only Wendbine source checkout. Before executing any native method it:
1. checks the source directory is an actual local real directory;
2. verifies the Git checkout at exact pinned HEAD and native module file's Git blob identity;
3. invokes Wendbine's own seal verifier on actual 2,062 public manifestations / 6,763 captures / 6,703 typed edges;
4. verifies the Atelier remains independent and contains **0 admitted real sources**;
5. exposes bounded \`summary\`, \`search\`, \`map\`, \`source\`, and \`readiness\` methods, returning explicit source head/seal/native method and negative source-admission state.

This gives the prospective Universal Atelier **read-only native source-method access** to a public epoch, keeping the real original source archive and its private payload outside the Atelier's synthetic stores. A result from \`search\` still indexes only **public source metadata**, not full actual bot outputs. \`map\` follows persisted typed edges, not conceptual meaning. A human-facing alias for Paul remains an operator attribution to \`Upset-Ratio502\`; it is not a claim of verified human identity.

**Important distinction:** this module is a **companion query port** around the test-only Universal Atelier. It has not restored or replaced the missing historical #1605 connector, has not admitted real source text, and cannot establish native SRC parity in original-body semantic synthesis.

**Test method:** In CI, fetch the pinned public Wendbine PR source into an isolated detached Git worktree; instantiate two actual independent prospective B91 products; call public query methods over real Nov04 registries, check exact-count results, find a real typed edge and traverse it, and refuse private text/foreign source commit/getter requests. No private original, cloud provider or paid inference.

**Claim ceiling:** \`REAL_PUBLIC_WENDBINE_SEARCH_AND_TOPOLOGY_BRIDGED_READ_ONLY\` after executed tests; \`FULL_BOT_OUTPUT_SEMANTICS_HELD\`, \`NATIVE_HISTORICAL_UNIVERSAL_CONNECTOR_HELD\`, \`PROTECTED_EXPERIMENT_B_FLIGHT_HELD\`.

𝄐 Tauric Diana · Khona‌lit-po · Human source admission/scientific interpretation/release RESERVED · ⟐SAC[X6ZNK5NO51]
