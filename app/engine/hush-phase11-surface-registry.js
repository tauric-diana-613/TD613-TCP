export const HUSH_PHASE11_SURFACE_REGISTRY_SCHEMA = 'td613.hush.phase11.surface-registry/v1';

export const HUSH_PHASE11_AUTHORITY_CLASSES = Object.freeze([
  'display-only',
  'gate-evaluated',
  'export-port',
  'private-local',
  'runtime-evidence',
  'boundary-review'
]);

export const HUSH_PHASE11_SURFACES = Object.freeze([
  {
    surface_id: 'chain-spine',
    label: 'Chain Spine',
    source_phase: 'phase11',
    source_modules: ['hush-phase11-dashboard-state.js'],
    authority: 'display-only',
    allowed_actions: ['copy-dashboard-summary'],
    forbidden_actions: ['override-packet-status', 'seal-without-boundary-check'],
    raw_exposure_posture: 'redacted-summary-only',
    test_coverage: ['hush-phase11-surface-registry.test.mjs']
  },
  {
    surface_id: 'evidence-ladder',
    label: 'Evidence Ladder',
    source_phase: 'phase10',
    source_modules: ['hush-phase10-release-discipline.js'],
    authority: 'display-only',
    allowed_actions: ['copy-dashboard-summary'],
    forbidden_actions: ['skip-rung', 'promote-release-status'],
    raw_exposure_posture: 'none',
    test_coverage: ['hush-phase11-release-tribunal.test.mjs']
  },
  {
    surface_id: 'release-tribunal',
    label: 'Release Tribunal',
    source_phase: 'phase10',
    source_modules: ['hush-phase10-release-discipline.js'],
    authority: 'gate-evaluated',
    allowed_actions: ['run-phase10-release-audit', 'copy-non-claim-summary', 'mark-release-candidate', 'mark-sealed', 'revoke-release'],
    forbidden_actions: ['manual-status-promotion', 'seal-with-hard-blockers'],
    raw_exposure_posture: 'none',
    test_coverage: ['hush-phase11-action-gates.test.mjs', 'hush-phase11-release-tribunal.test.mjs']
  },
  {
    surface_id: 'boundary-posture',
    label: 'Boundary Posture',
    source_phase: 'phase10',
    source_modules: ['hush-phase10-release-discipline.js', 'hush-phase5-eorfd-interface.js'],
    authority: 'boundary-review',
    allowed_actions: ['open-boundary-review', 'attach-eorfd-signal'],
    forbidden_actions: ['treat-boundary-as-proof', 'bypass-validator'],
    raw_exposure_posture: 'none',
    test_coverage: ['hush-phase11-action-gates.test.mjs']
  },
  {
    surface_id: 'export-console',
    label: 'Export Console',
    source_phase: 'phase11',
    source_modules: ['hush-phase11-action-gates.js'],
    authority: 'export-port',
    allowed_actions: ['export-redacted', 'export-private-backup', 'copy-dashboard-summary'],
    forbidden_actions: ['copy-raw-through-redacted-export', 'public-default-flip'],
    raw_exposure_posture: 'gate-dependent',
    test_coverage: ['hush-phase11-export-console.test.mjs']
  },
  {
    surface_id: 'runtime-flight',
    label: 'Runtime Flight Evidence',
    source_phase: 'phase10',
    source_modules: ['hush-phase10-release-discipline.js'],
    authority: 'runtime-evidence',
    allowed_actions: ['attach-runtime-flight-evidence', 'copy-dashboard-summary'],
    forbidden_actions: ['treat-vercel-ready-as-runtime-pass'],
    raw_exposure_posture: 'artifact-hash-or-redacted-only',
    test_coverage: ['hush-phase11-runtime-evidence-panel.test.mjs']
  },
  {
    surface_id: 'phase9-collision-weather',
    label: 'Phase 9 Collision Weather',
    source_phase: 'phase9',
    source_modules: ['run-hush-phase9-audit.mjs'],
    authority: 'display-only',
    allowed_actions: ['run-phase9-collision-audit', 'copy-dashboard-summary'],
    forbidden_actions: ['ignore-collision-severity-3'],
    raw_exposure_posture: 'fixture-or-redacted-only',
    test_coverage: ['hush-phase11-dashboard-state.test.mjs']
  },
  {
    surface_id: 'provider-testimony',
    label: 'Provider Testimony',
    source_phase: 'phase2-phase3-phase10',
    source_modules: ['hush-provider-log-packet.js', 'hush-contract-log-pair-validator.js', 'hush-phase10-release-discipline.js'],
    authority: 'display-only',
    allowed_actions: ['attach-provider-log', 'build-contract-log-pair'],
    forbidden_actions: ['provider-self-certifies-compliance'],
    raw_exposure_posture: 'hash-or-redacted-only',
    test_coverage: ['hush-phase11-dashboard-state.test.mjs']
  },
  {
    surface_id: 'mask-surface',
    label: 'Mask Surface',
    source_phase: 'phase8',
    source_modules: ['hush-phase8-per-mask-packet.js'],
    authority: 'display-only',
    allowed_actions: ['open-mask-registry', 'copy-dashboard-summary'],
    forbidden_actions: ['treat-mask-as-skin', 'use-shi-as-hush-mask-id'],
    raw_exposure_posture: 'no-sample-text-by-default',
    test_coverage: ['hush-phase11-surface-registry.test.mjs']
  }
]);

export function listHushPhase11Surfaces() {
  return HUSH_PHASE11_SURFACES.map((surface) => Object.freeze({ ...surface }));
}

export function getHushPhase11Surface(surfaceId) {
  return HUSH_PHASE11_SURFACES.find((surface) => surface.surface_id === surfaceId) || null;
}

export function validateHushPhase11SurfaceRegistry(surfaces = HUSH_PHASE11_SURFACES) {
  const errors = [];
  const ids = new Set();
  for (const surface of surfaces) {
    if (!surface.surface_id) errors.push('surface missing id');
    if (ids.has(surface.surface_id)) errors.push(`duplicate surface id: ${surface.surface_id}`);
    ids.add(surface.surface_id);
    if (!surface.label) errors.push(`${surface.surface_id} missing label`);
    if (!surface.source_phase) errors.push(`${surface.surface_id} missing source phase`);
    if (!HUSH_PHASE11_AUTHORITY_CLASSES.includes(surface.authority)) errors.push(`${surface.surface_id} invalid authority`);
    if (!Array.isArray(surface.allowed_actions)) errors.push(`${surface.surface_id} missing allowed actions`);
    if (!Array.isArray(surface.forbidden_actions)) errors.push(`${surface.surface_id} missing forbidden actions`);
    if (!surface.raw_exposure_posture) errors.push(`${surface.surface_id} missing raw exposure posture`);
    if (!Array.isArray(surface.test_coverage) || surface.test_coverage.length === 0) errors.push(`${surface.surface_id} missing test coverage`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
