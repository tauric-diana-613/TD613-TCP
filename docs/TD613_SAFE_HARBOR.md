# TD613 Safe Harbor

Read [SYSTEM_OVERVIEW.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/SYSTEM_OVERVIEW.md) for the full stack frame and [SAFETY_MODEL.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/SAFETY_MODEL.md) for the policy boundary. This file is the Safe Harbor-specific reference.

## Role in the suite

`TD613 Safe Harbor` is the provenance-preserving passage layer of the suite.

It is responsible for:

- staging packets
- preserving route and narrowing state at handoff
- carrying covenant / issuance / recall surfaces
- keeping proof and recall symmetrical enough that passage does not become covert flattening

It is not:

- an alternate hidden generator
- a replacement for TCP's write lane
- a justification for withholding already-landed text without disclosing why

## Current doctrine

The current repo treats Safe Harbor as a downstream custody layer.

That means:

- TCP writes first
- Aperture audits and registers
- Safe Harbor packages the resulting artifact, proof, and route state

If material is withheld in Safe Harbor, the packet should say what was:

- repaired
- sealed
- scrubbed
- still visible
- withheld and why

`Covenant Export` is allowed to gate issuance and export side effects. It is not allowed to become a covert knowledge gate.

## Current packet vocabulary

The maintained packet surfaces now carry additive narrowing / audit state. The important packet-level objects are:

- `aperture_audit`
- `forensic_schema`
- packet route state
- provenance integrity
- burden concentration
- issuance / covenant status

The cross-suite forensic schema should preserve the governed-exposure chain in a form close to:

- `S`
- `S'`
- `Y`
- `O`
- `O*`
- `delta_obs`
- `Gap`
- `NameSens`
- `AliasPersist`
- `Red`
- `Supp_tau`
- `Theta_u`
- dominant operator
- provenance integrity
- route state

## Current repo surfaces

The main maintained Safe Harbor files are:

- [app/safe-harbor/index.html](/C:/Users/timst/OneDrive/Desktop/tcp-repository/app/safe-harbor/index.html)
- [app/safe-harbor/app/main.js](/C:/Users/timst/OneDrive/Desktop/tcp-repository/app/safe-harbor/app/main.js)
- [app/safe-harbor/schemas/td613-safe-harbor.packet.schema.json](/C:/Users/timst/OneDrive/Desktop/tcp-repository/app/safe-harbor/schemas/td613-safe-harbor.packet.schema.json)
- [app/safe-harbor/examples/td613-safe-harbor.packet.sample.json](/C:/Users/timst/OneDrive/Desktop/tcp-repository/app/safe-harbor/examples/td613-safe-harbor.packet.sample.json)
- [app/safe-harbor/reference/TD613_verify.html](/C:/Users/timst/OneDrive/Desktop/tcp-repository/app/safe-harbor/reference/TD613_verify.html)
- [app/safe-harbor/reference/TD613_offline_capsule.html](/C:/Users/timst/OneDrive/Desktop/tcp-repository/app/safe-harbor/reference/TD613_offline_capsule.html)

## What to verify

If you are checking whether Safe Harbor is behaving correctly in the current repo, verify these:

- the staged packet includes `aperture_audit`
- packet previews and proof surfaces expose what was repaired or withheld
- SHI recall reopens the same packet / warning state rather than silently changing the artifact
- issuance/export gating does not change what the packet means
- the public footer and SHI format stay stable across packet views

## Design law

Safe Harbor should lower burden without laundering provenance.

That is the whole point of the layer.
