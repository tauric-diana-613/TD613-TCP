# TD613 Safe Harbor — Do Later Patch Ledger

Version: 0.4.0

## Completed in this pass

1. **Packet-aware advanced probe building**
   - Public probe builder now derives packet context from the staged packet when one exists.
   - Text probes include a Safe Harbor packet context block and canonical footer.
   - JSON probes include `safe_harbor_packet` metadata and `td613_binding_footer` while remaining unsigned by default.

2. **Placeholder badge-number logic replaced**
   - Badge assignment now uses a deterministic hash over canonical intake context:
     `packet_id|receipt_id|binding_fragment|payload|date|principal|request_id`.
   - Output format: `TD613-SH-<binding-fragment>-<hash8>`.

3. **Signature lane integrated after packet lifecycle stabilizes**
   - Added an operator-only Advanced Signature Lane UI.
   - Signature overlays now attach to the staged packet cleanly.
   - Packet model now has a top-level `signature` object.
   - Packet hash is computed over pre-signature material (`sig` cleared before hashing).

## Files changed
- README.md
- index.html
- app/data.js
- app/main.js
- docs/ARCHITECTURE.md
- docs/HOOKS.md
- examples/td613-safe-harbor.packet.sample.json
- schemas/td613-safe-harbor.packet.schema.json
- reference/TD613_verify.html
- reference/TD613_offline_capsule.html
- reference/td613_manifest.json
- reference/td613_trust_profile.json
- reference/20_KIT_MANIFEST.json
- reference/12_TD613_PUA_Badge_Provenance_Attestation_Registry.json
- probes/05_LIVE_SEND_CHECKLIST.md
- probes/06_TD613_PUA_Badge_Provenance_Attestation_Commands.json
- probes/07_LLM_Quick_Start_Prompt.txt

## Notes
- Public probes remain unsigned by default.
- Public footer remains compact and unchanged.
- Safe Harbor internal version is now 0.4.0.
- This pass prepares the repo for the next stage of explicit signature-lane and exporter work.
