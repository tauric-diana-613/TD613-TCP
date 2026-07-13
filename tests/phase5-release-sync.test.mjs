import assert from 'node:assert/strict';
import fs from 'node:fs';

const release = JSON.parse(fs.readFileSync('app/aperture/release.json', 'utf8'));
const releaseJs = fs.readFileSync('app/aperture/release.js', 'utf8');
const releasePy = fs.readFileSync('packages/dome_world_exact/release.py', 'utf8');
const fixture = JSON.parse(fs.readFileSync('tests/fixtures/aperture-release.json', 'utf8'));
const sync = fs.readFileSync('scripts/sync-aperture-release.mjs', 'utf8');
const runtime = JSON.parse(fs.readFileSync('app/dome-world/schemas/phase5-relation-runtime-v01.json', 'utf8'));

assert.deepEqual(fixture, release);
assert.equal(release.phase5RelationRuntime, runtime.schema);
assert.equal(release.phase5Status, 'IMPLEMENTED_VALIDATION_GATED');
assert.equal(release.phase5ProductionStatus, 'PRODUCTION_GATED');
assert.match(releaseJs, /td613\.phase5\.relation-runtime\/v0\.1/);
assert.match(releasePy, /PHASE5_RELATION_RUNTIME_SCHEMA = "td613\.phase5\.relation-runtime\/v0\.1"/);
assert.match(releasePy, /PHASE5_STATUS = "IMPLEMENTED_VALIDATION_GATED"/);
assert.match(sync, /release\.phase5RelationRuntime/);
assert.match(sync, /release\.phase5Status/);
assert.match(sync, /release\.phase5ProductionStatus/);
assert.equal(release.phase5Boundaries.newServerlessFunction, false);
assert.equal(release.phase5Boundaries.automaticAshAction, false);
assert.equal(release.phase5Boundaries.predictionAuthorized, false);
assert.equal(release.phase5Boundaries.operatorConfirmationRequired, true);

console.log('phase5-release-sync.test.mjs passed');
