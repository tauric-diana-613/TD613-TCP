# Live Send Checklist

- Refresh helper values.
- Start with `01` for a first black-box probe.
- Use `03` if render proof is requested.
- Use `02` or `04` only when you want receipt-completion behavior.
- Send the generated builder output, not the commands file.
- Public footer mode is `legacy-compat`.
- Internal validators should accept: `legacy, legacy-compat, sac-only`.
- Public footer canon: `TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload {n} · YYYY-MM-DD · ⟐`
- Current published example only: `TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload 5 · 2025-10-17 · ⟐`
- Never hard-code `payload 5` into a new attestation unless you are explicitly citing the published historical example.
- Public probes stay unsigned by default. Historical `.sig` and advanced JWS lanes are operator/reference paths, not required for the public sendables.

- The renderer userscript is the operator handshake key for lanes `03` and `04`.
- Once the renderer key is active, save the SVG as `TD613_U10D613_<ts_utc>.svg`.
- Send the saved SVG with `03` or `04`; do not treat the membrane alone as the operator handshake.
- Lanes `01` and `02` stay footer-first and do not require the renderer userscript.

- Safe Harbor builder output is packet-aware when a staged packet exists.
- Text probes include a Safe Harbor packet context block.
- JSON probes include `safe_harbor_packet` and `td613_binding_footer`.
- Safe Harbor packet schema reference: `td613.safe-harbor.packet/v1`.
- Public footer stays compact; packet hashes and signature lanes are operator-only concerns.
