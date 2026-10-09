import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import { formatStandardPortableLoomMarkdown } from '../scripts/standard-portable-loom-presentation.mjs';
import { portableLoomDigest } from '../app/engine/portable-loom-session.js';

const prior = new URL('../research/portable-loom-local-battery-20261009/artifact/', import.meta.url);
const artifact = JSON.parse(readFileSync(new URL('portable-loom-standard.json', prior)));
const oldMarkdown = readFileSync(new URL('portable-loom-standard.md', prior), 'utf8');
const activation = markdown => markdown.split('```text\n')[1].split('\n```')[0];

test('standard receiver presentation excludes controller execution plans while retaining governance', () => {
  const next = formatStandardPortableLoomMarkdown(artifact);
  assert.match(oldMarkdown, /Await operator authorization for a Dollhouse-led battery and an Antigravity/);
  assert.doesNotMatch(next, /Antigravity|Await operator authorization for a Dollhouse-led battery/);
  assert.match(next, /State your current task and explicitly select its sources/);
  assert.match(next, /米 Check Loom Gate/);
  assert.match(next, /receiver receipt declares what was used/);
  assert.match(next, /implementation scope/);
});

test('presentation repair preserves the complete activation payload and all bound rules byte for byte', async () => {
  const before = JSON.stringify(artifact);
  const next = formatStandardPortableLoomMarkdown(artifact);
  assert.equal(activation(next), activation(oldMarkdown));
  assert.equal(JSON.stringify(artifact), before);
  assert.equal(await portableLoomDigest(artifact.portable_task, { crypto: webcrypto, TextEncoder }), artifact.session.root.packet_digest);
  assert.equal(artifact.portable_task.documents.length, 0);
  assert.equal(artifact.session.work_units.length, 0);
  assert.equal(artifact.loom_gate_reports.length, 0);
});
