#!/usr/bin/env node

export function inspectPhase5RelationLab(html = '') {
  const source = String(html || '');
  const checks = Object.freeze({
    document_present: /<!doctype html>/i.test(source),
    viewport_declared: /name="viewport"/i.test(source),
    relation_surface_named: /The Third Object/.test(source),
    no_relation_on_load: /No relation exists\./.test(source),
    proposal_action_present: /id="propose"/.test(source),
    explicit_confirmation_present: /id="confirm"[^>]*disabled/.test(source),
    intact_replay_present: /value="replay">Replay confirmed envelope/.test(source),
    phason_fork_assay_present: /value="phason">Fork the Phason relation chain/.test(source),
    explicit_local_save_present: /id="save"[^>]*disabled/.test(source),
    explicit_export_present: /id="export"[^>]*disabled/.test(source),
    lifecycle_visible: /id="state"/.test(source) && /id="phasonState"/.test(source),
    mobile_breakpoints_present: /@media\(max-width:880px\)/.test(source) && /@media\(max-width:560px\)/.test(source),
    overflow_guards_present: /min-width:0/.test(source) && /overflow-wrap:anywhere/.test(source),
    no_phase5_network_endpoint: !/\/api\/phase5|fetch\(|XMLHttpRequest|WebSocket/.test(source),
    carrier_boundary_visible: /Marrowline carrier ≠ creator/.test(source),
    nonclaims_visible: /relation ≠ identity/.test(source) && /relation ≠ causation/.test(source),
    production_claim_withheld: !/IMPLEMENTED_PRODUCTION_DEMONSTRATED/.test(source)
  });
  const failed = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
  return Object.freeze({
    schema: 'td613.phase5.browser-probe/v0.1',
    outcome: failed.length ? 'HOLD_PHASE5_BROWSER_CONTRACT' : 'PHASE5_BROWSER_CONTRACT_VERIFIED',
    checks,
    failed: Object.freeze(failed),
    production_demonstrated: false,
    seal: '⟐'
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fs = await import('node:fs');
  const path = process.argv[2] || 'app/dome-world/relation-envelope.html';
  const result = inspectPhase5RelationLab(fs.readFileSync(path, 'utf8'));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.failed.length) process.exitCode = 1;
}
