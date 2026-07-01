import assert from 'node:assert/strict';
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

const releaseTribunal = getHushPhase11Surface('release-tribunal');
assert.equal(releaseTribunal.authority, 'gate-evaluated');
assert.ok(releaseTribunal.forbidden_actions.includes('manual-status-promotion'));

const exportConsole = getHushPhase11Surface('export-console');
assert.equal(exportConsole.authority, 'export-port');
assert.ok(exportConsole.forbidden_actions.includes('copy-raw-through-redacted-export'));

const maskSurface = getHushPhase11Surface('mask-surface');
assert.ok(maskSurface.forbidden_actions.includes('treat-mask-as-skin'));
assert.ok(maskSurface.forbidden_actions.includes('use-shi-as-hush-mask-id'));

console.log('hush-phase11-surface-registry: ok');
