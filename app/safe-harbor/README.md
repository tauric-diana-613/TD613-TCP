# TD613 Safe Harbor

TD613 Safe Harbor is the canonical intake engine for the TD613 provenance sweep. It stages the packet first, derives cadence credentials from ingress, keeps the public footer compact and compat-first, and only lets detached cryptographic signatures attach after canonicalization.

## Non-negotiable canon

- `principal = tauric.diana.613`
- `claimed_pua = U+10D613`
- `badge_id = bdg_glyph_U10D613`
- `binding_fragment = #9B07D8B`
- `SAC = SAC[X6ZNK5NO51]`
- Public default remains `LEGACY-COMPAT`
- Public footer remains `TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload {n} · YYYY-MM-DD · ⟐`

## Packet rule

Safe Harbor mints:

- canonical packet body
- packet hash
- receipt state
- cadence credentials

Signature lanes add detached wrappers:

- `sig`
- `sig_type`
- `kid`
- wrapper status

They do not define the packet and they do not mutate the packet body.

## Cadence vs crypto

- Cadence signature = stylometric credential from ingress and TCP-style cadence analysis
- Cryptographic signature = detached seal over `canonical_json(packet)`

That distinction is explicit in the runtime, trust profile, verify page, capsule, manifest, registry, and renderer metadata.

## Repo layout

- `index.html` - primary Safe Harbor chamber
- `TD613_Safe_Harbor_Standalone.html` - bundled single-file Safe Harbor chamber with embedded verify and capsule annexes
- `11_TD613_PUA_Badge_Provenance_Attestation_Lab.html` - legacy lab bridge into Safe Harbor
- `app/` - ingress runtime, UI shell, operator/public boundary, packet preview
- `safe_harbor/` - canonicalizer, hash, signature, lifecycle, packet schema
- `probes/` - public sendables and command references
- `reference/` - trust profile, manifest, verify, capsule, registry
- `renderers/` - badge renderer metadata and append-only userscript

## Standalone bundle

The split source remains the maintenance surface. Rebuild the single-file artifact with:

- `powershell -ExecutionPolicy Bypass -File .\tools\build-standalone.ps1`

## Public/operator boundary

Public surfaces may show:

- binding fragment
- SAC
- payload
- date
- receipt summary
- verified / not verified

Operator surfaces may show:

- packet JSON
- packet hash
- detached sig
- sig type
- kid
- route and harbor diagnostics
- cadence credentials
- canonical JSON preview

The public footer must never include badge id, sig, packet hash, or route diagnostics.
