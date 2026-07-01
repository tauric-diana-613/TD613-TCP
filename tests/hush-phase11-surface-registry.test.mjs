import assert from 'node:assert/strict';
import { HUSH_PHASE11_ACTIONS } from '../app/engine/hush-phase11-action-gates.js';
import {
  HUSH_PHASE11_AUTHORITY_CLASSES,
  getHushPhase11Surface,
  listHushPhase11Surfaces,
  validateHushPhase11SurfaceRegistry
} from '../app/engine/hush-phase11-surface-registry.js';

const surfaces = listHushPhase11Surfaces();
assert.ok(surfaces.length >= 8);
assert.equal(validateHushPhase11SurfaceRegistry(surfaces).ok, true);
assert.ok(HUSH_PHASE11_AUTHORITY_CLASSES.includes('display-only'));
assert.ok(HUSH_PHASE11_AUTHORITY_CLASSES.includes('export-port'));

const registeredActions = new Set(HUSH_PHASE11_ACTIONS);
for (const surface of surfaces) {
  for (const action of surface.allowed_actions) {
    assert.ok(registeredActions.has(action), `${surface.surface_id} exposes unregistered action: ${action}`);
  }
}

const releaseTribunal = getHushPhase11Surface('release-tribunal');
assert.equal(releaseTribunal.authority, 'gate-evaluated');
assert.ok(releaseTribunal.forbidden_actions.includes('manual-status-promotion'));

const boundaryPosture = getHushPhase11Surface('boundary-posture');
assert.ok(boundaryPosture.allowed_actions.includes('open-boundary-review'));
assert.ok(registeredActions.has('open-boundary-review'));

const exportConsole = getHushPhase11Surface('export-console');
assert.equal(exportConsole.authority, 'export-port');
assert.ok(exportConsole.forbidden_actions.includes('copy-raw-through-redacted-export'));

const maskSurface = getHushPhase11Surface('mask-surface');
assert.ok(maskSurface.forbidden_actions.includes('treat-mask-as-skin'));
assert.ok(maskSurface.forbidden_actions.includes('use-shi-as-hush-mask-id'));

console.log('hush-phase11-surface-registry: ok');
