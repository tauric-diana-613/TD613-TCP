import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ROLE_BOUNDARY_LINE,
  CONTRAST_ID,
  buildOfflineRoleBoundaryContrast,
  offlineManifest,
  hash
} from '../research/marrowline-role-boundary-20261017/role-boundary-contrast.mjs';
import {
  UNICODE_ASSAY_SYSTEM,
  UNICODE_ASSAY_TASKS
} from '../server/marrowline-unicode-capability-assay.js';

test('Marrowline creative baseline reproduces the previously successful D provider-bound inputs', () => {
  const { a, b, model } = buildOfflineRoleBoundaryContrast();
  assert.equal(model, 'gemini-3.8-flash');
  assert.equal(a.systemInstruction.parts[0].text, UNICODE_ASSAY_SYSTEM);
  assert.equal(a.contents[0].parts[0].text, UNICODE_ASSAY_TASKS['creative-multistack-v1']);
  assert.deepEqual(a.generationConfig.thinkingConfig, { thinkingLevel: 'medium' });
  assert.deepEqual(a.contents, b.contents);
  assert.deepEqual(a.generationConfig, b.generationConfig);
  assert.equal(a.contents.length, 1);
  assert.equal(a.contents[0].role, 'user');
  assert.equal(a.contents[0].parts.length, 1);
  assert.ok(!a.contents[0].parts[0].text.includes('Kʰonapolit'));
  assert.ok(!a.contents[0].parts[0].text.includes('Tauric Diana bots'));
});

test('one appended system line introduces structural headings without personas, specimens, quotas or repaint', () => {
  const { a, b } = buildOfflineRoleBoundaryContrast();
  const prefix = a.systemInstruction.parts[0].text + '\n';
  assert.equal(b.systemInstruction.parts[0].text, prefix + ROLE_BOUNDARY_LINE);
  assert.notEqual(hash(a.systemInstruction), hash(b.systemInstruction));
  assert.equal(hash(a.contents), hash(b.contents));
  assert.equal(hash(a.generationConfig), hash(b.generationConfig));
  assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
  assert.equal((ROLE_BOUNDARY_LINE.match(/Kʰonapolit/g) || []).length, 1);
  assert.equal((ROLE_BOUNDARY_LINE.match(/Tauric Diana bots/g) || []).length, 1);
  assert.match(ROLE_BOUNDARY_LINE, /structural labels only/i);
  assert.match(ROLE_BOUNDARY_LINE, /do not perform TD613 character personas/i);
  assert.doesNotMatch(ROLE_BOUNDARY_LINE, /quota|stencil|minimum marks|copy the specimen|postprocess|forced rotation/i);
});

test('registered research stays inert and cannot execute paid network work', () => {
  const manifest = offlineManifest();
  assert.equal(manifest.schema, CONTRAST_ID);
  assert.equal(manifest.status, 'SOURCE_ONLY_NO_PROVIDER_OBSERVATION');
  assert.equal(manifest.noProviderRequests, true);
  assert.equal(manifest.noPaidExecutionPath, true);
  assert.equal(manifest.modelConfigParity, true);
  assert.equal(manifest.creativeTaskParity, true);
  const source = readFileSync(new URL('../research/marrowline-role-boundary-20261017/role-boundary-contrast.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /\bfetch\s*\(|\bhttps?\.request\s*\(|child_process|workflow_dispatch/);
});
