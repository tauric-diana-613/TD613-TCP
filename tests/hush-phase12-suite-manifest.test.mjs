import assert from 'node:assert/strict';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import {
  HUSH_PHASE12_MANIFEST_PATH,
  HUSH_PHASE12_RECEIPT_SCHEMA,
  readHushPhase12Manifest,
  validateHushPhase12Manifest
} from '../scripts/run-hush-packet-integration.mjs';

assert.ok(fs.existsSync(HUSH_PHASE12_MANIFEST_PATH));

const manifest = readHushPhase12Manifest();
assert.ok(manifest.tests.length >= 30);
assert.ok(manifest.phase_comments.includes(1));
assert.ok(manifest.phase_comments.includes(12));

const validation = validateHushPhase12Manifest();
assert.equal(validation.ok, true, validation.errors.join('\n'));
assert.equal(new Set(manifest.tests).size, manifest.tests.length);
for (const testFile of manifest.tests) assert.ok(fs.existsSync(path.join('tests', testFile)), `missing manifest test ${testFile}`);

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
assert.equal(packageJson.scripts['test:hush:packets'], 'node scripts/run-hush-packet-integration.mjs');
assert.equal(packageJson.scripts['test:hush:packets:check'], 'node scripts/run-hush-packet-integration.mjs --check');

const receipt = JSON.parse(execFileSync(process.execPath, ['scripts/run-hush-packet-integration.mjs', '--check'], { encoding: 'utf8' }));
assert.equal(receipt.schema, HUSH_PHASE12_RECEIPT_SCHEMA);
assert.equal(receipt.status, 'pass');
assert.equal(receipt.live_provider_required, false);
assert.equal(receipt.runtime_deploy_required, false);
assert.equal(receipt.public_export_permitted, false);
assert.equal(receipt.sealed_status_created, false);

console.log('hush-phase12-suite-manifest: ok');
