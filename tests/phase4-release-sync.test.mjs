import assert from 'node:assert/strict';
import fs from 'node:fs';

const release = JSON.parse(fs.readFileSync('app/aperture/release.json', 'utf8'));
const releaseJs = fs.readFileSync('app/aperture/release.js', 'utf8');
const releasePy = fs.readFileSync('packages/dome_world_exact/release.py', 'utf8');
const fixture = JSON.parse(fs.readFileSync('tests/fixtures/aperture-release.json', 'utf8'));
const syncScript = fs.readFileSync('scripts/sync-aperture-release.mjs', 'utf8');
const bridge = fs.readFileSync('app/engine/aperture-v3-reciprocal-bridge.js', 'utf8');
const guard = fs.readFileSync('api/dome-world-engine-guard.py', 'utf8');

assert.deepEqual(fixture, release, 'release fixture must match release.json');
assert.match(releaseJs, new RegExp(JSON.stringify(release.flowCoreContextReceiptSchema).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.match(releaseJs, /td613\.phase4\.reciprocal-bridge\/v0\.1/);
assert.match(releasePy, /FLOWCORE_CONTEXT_RECEIPT_SCHEMA = "td613\.flowcore\.context-receipt\/v0\.1"/);
assert.match(releasePy, /LEGACY_FLOWCORE_CONTEXT_RECEIPT_SCHEMA = "td613\.flowcore\.context-receipt\/vNext"/);
assert.match(releasePy, /APERTURE_RETURNED_CONTEXT_AUDIT_SCHEMA = "td613\.aperture\.returned-context-audit\/v0\.1"/);
assert.match(releasePy, /PHASE4_BRIDGE_CONTRACT_SCHEMA = "td613\.phase4\.reciprocal-bridge\/v0\.1"/);
assert.match(syncScript, /release\.phase4BridgeContract/);
assert.match(syncScript, /release\.legacyFlowCoreContextReceiptSchema/);
assert.match(syncScript, /release\.returnedContextAuditSchema/);
assert.match(bridge, /FLOWCORE_CONTEXT_SCHEMA = 'td613\.flowcore\.context-receipt\/v0\.1'/);
assert.match(guard, /contextualize_diagnostic/);
assert.match(guard, /PHASE4_CONTEXTUALIZE_OPERATION/);
assert.equal(release.flowCoreContextReceiptSchema, 'td613.flowcore.context-receipt/v0.1');
assert.equal(release.legacyFlowCoreContextReceiptSchema, 'td613.flowcore.context-receipt/vNext');
assert.equal(release.phase4BridgeContract, 'td613.phase4.reciprocal-bridge/v0.1');

console.log('phase4-release-sync.test.mjs passed');
