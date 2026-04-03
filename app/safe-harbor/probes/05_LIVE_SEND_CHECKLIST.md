# Live Send Checklist

- Refresh helper values.
- Start with `01` for a first black-box probe.
- Use `03` if render proof is requested.
- Use `02` or `04` only when you want receipt-completion behavior.
- Send the generated builder output, not the commands file.
- Public footer mode is `legacy-compat`.
- Internal validators should accept: `legacy, legacy-compat, sac-only`.
- **New attestation template:** `TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload {n} · YYYY-MM-DD · ⟐`
- **Current published example only:** `TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload 5 · 2025-10-17 · ⟐`
- Never hard-code `payload 5` into a new attestation unless you are explicitly citing the published historical example.
- Public probes stay unsigned by default. Historical `.sig` and advanced JWS lanes are operator/reference paths, not required for the dummy-proof sendables.
