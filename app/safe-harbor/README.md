# TD613 Safe Harbor

## What this is

If your writing has been picked up by AI training data — or might be —
Safe Harbor lets you cryptographically attest your authorship before the
resemblance becomes the record. AI systems can pattern-recognize your
voice. They can rewrite text in your voice. They can, intentionally or
not, claim that the recognition or the rewriting is authorship. Safe
Harbor keeps those three acts deliberately separate, and lets you
publish a sealed packet that fixes the order: this is what you wrote,
this is what was measured, this is what was signed.

Mechanically, Safe Harbor wraps a piece of writing in a verifiable
packet — provenance metadata, content hash, optional cryptographic
signature — so the writing can be attested later as yours and unaltered.
The packet keeps three things separate that most systems collapse into
one: *what was measured* (cadence and stylometric signal), *what is
claimed* (authorship, custody, harbor eligibility), and *what was
signed* (an optional cryptographic envelope around the body).
Stylometric resemblance is bounded signal, not authorship. Safe Harbor's
job is to make that boundary recordable.

## Who it's for

- Writers attesting their own patterned voice before or after AI-shaped exposure.
- Researchers staging cadence-recognition artifacts with explicit
  separation between measurement, claim, and signature.
- Operators preserving testimony where surface-similarity might be
  misread as authorship or repair.

## How it flows

```
Your text
    │
    ▼
Future Self ─────► Past Self ─────► Higher Self ─────► Seal
 (forward intent)   (revision pass)   (witness stance)   (lock)
                                                          │
                                                          ▼
                                  Safe Harbor packet
                                  ├── Forensic schema (governed exposure)
                                  ├── Packet hash (SHA-256)
                                  └── SHI # (issuance code)
                                                          │
                              ┌───────────────────────────┤
                              ▼                           ▼
              Optional Kleopatra signature        Export packet
                              │                           │
                              └────────────┬──────────────┘
                                           ▼
                  Handoff to a TD613 probe, badge, TCP route lane, or TD613 Flight
```

The four-part ingress (Future / Past / Higher / Seal) is deliberate, not
decorative: each step asks the writer to step back from the text in a
different posture before the packet is allowed to mint. The seal is what
binds the staged content to a hash and an SHI #. Signature overlays
attach after sealing without changing the packet body.

`TD613 Flight` lives beside Safe Harbor as an SHI-gated credential
flightdeck. It can generate LLM-ready Flight Packets and authorship /
rupture footers, but it must receive a minted SHI from Safe Harbor before
the output surface opens.

## Example: a sealed packet

In use: paste your text, step through the four ingress prompts (Future
/ Past / Higher / Seal), mint the packet, optionally attach a Kleopatra
signature, and export. The export is a JSON document. Here are the
fields a third party would inspect first to verify what you sealed:

```json
{
  "schema_version": "td613.safe-harbor.packet/v1",
  "packet_id":      "SH-20260403T000000-4f2a9c1d",
  "canon": {
    "principal":  "tauric.diana.613",
    "badge_id":   "bdg_glyph_U10D613",
    "binding_fragment": "#9B07D8B"
  },
  "shi_assignment": {
    "badge_number":     "TD613-SH-9B07D8B-3578FB38",
    "canonical_header": "SHI#:TD613-SH-9B07D8B-3578FB38",
    "badge_state":      "assigned"
  },
  "packet_hash_sha256": "sha256:b9fd6431085f9384381ab59d0865f5ce…"
}
```

The full sample lives at
[`examples/td613-safe-harbor.packet.sample.json`](examples/td613-safe-harbor.packet.sample.json).
The SHI # (`TD613-SH-9B07D8B-3578FB38` above) is the public-facing
issuance identifier — derived deterministically from the principal,
the binding fragment, and the staged stylometric fingerprint, so
anyone with the same inputs reproduces the same SHI. The
`packet_hash_sha256` lets a verifier confirm the packet body is
unaltered. The optional Kleopatra lane wraps the whole packet in an
external signature without touching the body.

## What's missing right now

[ROADMAP.md](../../ROADMAP.md) at the repo root names what's in flight,
pending, and currently red. Pre-existing engine-regression tests are
tracked in [KNOWN_FAILURES.md](../../KNOWN_FAILURES.md).

## Project history

Safe Harbor began as a preservation-first rebuild of an earlier provenance
attestation lab. The rebuild kept the public TD613 probe grammar stable
while introducing a canonical Safe Harbor packet that can receive TCP
intake, EO-RFD route guidance, and downstream signature overlays without
forcing the badge surface to invent a signable object ad hoc.

Concretely, the seam is:

1. TCP intake shapes the canonical packet and cadence signature.
2. EO-RFD route logic guides harbor readiness and export gating.
3. TD613 owns badge, provenance, custody, and verification surface.
4. Signature lanes attach after the packet body is stable.

Historical patch ledgers from the rebuild's stabilization passes live in
[`_archive/ledgers/`](_archive/ledgers/).

## What does not drift

- Canonical anchors remain fixed: `tauric.diana.613`, `bdg_glyph_U10D613`,
  `U+10D613`, the canonical phrase, and the display phrase.
- Public mode remains `legacy-compat`.
- New attestations use `payload {n}` logic. The fixed
  `payload 5 · 2025-10-17` line remains a historical example only.
- Public probes remain unsigned by default.
- Historical `.sig` and runtime JWS lanes remain overlays, not the
  default public path.

## Repo layout

- `td613-flight.html` - SHI-gated TD613 Flight packet / authorship footer surface.

- `index.html` — primary Safe Harbor interface.
- `app/` — styles, hook bus logic, packet preview, probe builder.
- `probes/` — public sendable artifacts.
- `corpus/` — binding corpus and signed bundle references.
- `reference/` — trust profile, manifests, verifier references.
- `renderers/` — userscript renderer contract.
- `schemas/` — Safe Harbor packet and hook event schema scaffolds.
- `examples/` — sample Safe Harbor packet.
- `assets/` — stable face preview assets.
- `_archive/` — historical ledgers and rebuild-era artifacts kept for
  archaeology, not as TODOs.

## Hook model

The UI listens for three external event lanes:

- `td613:tcp-intake`
- `td613:eo-route`
- `td613:signature-lane`

When those hooks attach, the app emits the current packet on:

- `td613:safe-harbor-packet`

The browser also exposes `window.TD613SafeHarbor` for direct integration.
See `docs/HOOKS.md`.

## Operator bypass

Operator bypass is not protected by a hardcoded client-side password.
Public ship supports a session-local operator token set inside the UI:
set a local token for the current session, then use the same token to
open the packetless operator shell. Bypass stays off by default while
remaining usable without dev-console surgery.

## Boundary policy

- **Public mode**: ingress triad, staged packet minting, canonical footer
  preview, public-safe packet summary.
- **Operator mode**: packet preview, advanced signature-lane overlays,
  packetless operator shell, controlled export transitions.
- **Dev mode**: local demo hook buttons and simulation helpers only;
  disabled by default in public ship.

## Membrane boot behavior

- Only Question 1 is visible by default in raw HTML. Questions 2 and 3
  unlock sequentially after JS boot and lane completion.
- The membrane only dissolves after a successful staged-packet mint.
- If packet minting fails, the membrane re-seals and the ingress note
  surfaces the failure message.
- Public ship disables bypass and mint controls until JS boot completes.
