import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {
  analyzeHolonomyLoomMessage,
  makeHolonomyLoomSaferCopy,
  HOLONOMY_LOOM_SCHEMA
} from '../app/dome-world/holonomy-loom/engine.js';

const hostedPath = 'app/dome-world/holonomy-loom.html';
const enginePath = 'app/dome-world/holonomy-loom/engine.js';
const hosted = fs.readFileSync(hostedPath, 'utf8');
const engine = fs.readFileSync(enginePath);

function gitBlobSha(buffer) {
  const prefix = Buffer.from(`blob ${buffer.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(prefix).update(buffer).digest('hex');
}

assert.equal(
  gitBlobSha(engine),
  '3686d8caa958c53caa485b2ef810cca13534ce10',
  'Hosted integration must reuse the exact earned #1034 Loom engine blob rather than reimplementing the rule ontology.'
);
assert.equal(HOLONOMY_LOOM_SCHEMA, 'td613.holonomy-loom.child-legible-preflight/v0.1');

assert.match(hosted, /<h1>Holonomy Loom<\/h1>/);
assert.match(hosted, /Before you send it, check what this message carries\./);
assert.match(hosted, /SEE → CHECK → UNDERSTAND → REST/);
assert.match(hosted, /data-route-mode="TD613_HOSTED"/);
assert.match(hosted, /data-provider-release-authority="false"/);
assert.match(hosted, /data-production-release="false"/);
assert.match(hosted, /CHECK THIS MESSAGE/);
assert.match(hosted, /KEEP/);
assert.match(hosted, /CHANGE/);
assert.match(hosted, /REMOVE/);
assert.match(hosted, /MAKE A SAFER COPY/);
assert.match(hosted, /COPY CHECKED MESSAGE/);
assert.match(hosted, /Show me why/);
assert.match(hosted, /Ask for model help \(optional\)/);
assert.match(hosted, /No model is called by this pre-release integration\./);
assert.match(hosted, /Provider advice remains advisory and receives no Loom release authority\./);
assert.match(hosted, /GREEN means only that no enabled Loom rule fired\./);
assert.match(hosted, /Resemblance alone does not establish provenance\./);
assert.match(hosted, /REST/);
assert.match(hosted, /RETURN/);
assert.match(hosted, /EXIT/);
assert.match(hosted, /href="\/dome-world\/ash-keep\.html"/);
assert.match(hosted, /from '\.\/holonomy-loom\/engine\.js'/);

for (const forbidden of [
  'fetch(',
  'XMLHttpRequest',
  'sendBeacon(',
  'new WebSocket(',
  'new EventSource(',
  'GEMINI_API_KEY',
  '/api/khonapolit',
  'release_authority = true',
  'data-provider-release-authority="true"',
  'data-production-release="true"'
]) {
  assert.ok(!hosted.includes(forbidden), `Hosted default check must not introduce forbidden route/authority surface: ${forbidden}`);
}

const protectedTerm = 'PRIVATE_TD613_HOSTED_613';
const journeyMarker = 'JOURNEY_TD613_HOSTED_613';
const red = analyzeHolonomyLoomMessage({
  text: `ordinary ${protectedTerm} ${journeyMarker}`,
  protectedTerms: [{ value: protectedTerm, label: 'protected fixture' }],
  journeyMarkers: [{ value: journeyMarker, label: 'journey fixture' }]
});
assert.equal(red.status, 'RED');
assert.equal(red.release_boundary.raw_release_allowed, false);
assert.equal(red.release_boundary.safer_copy_available, true);
assert.equal(red.journey_relations.length, 1);
assert.equal(red.journey_relations[0].relation_id, 'DECLARED_JOURNEY_MARKER_MATCH');
assert.match(red.journey_relations[0].claim_ceiling, /not claiming the connection proves truth/i);

const safer = makeHolonomyLoomSaferCopy({
  text: `ordinary ${protectedTerm}`,
  protectedTerms: [{ value: protectedTerm, label: 'protected fixture' }],
  journeyMarkers: []
});
assert.equal(safer.release_allowed, true);
assert.ok(!safer.text.includes(protectedTerm));

const warning = analyzeHolonomyLoomMessage({
  text: 'contact lab@example.org at 2026-09-07T13:35:00-04:00',
  protectedTerms: [],
  journeyMarkers: []
});
assert.equal(warning.status, 'YELLOW');
assert.deepEqual(new Set(warning.findings.map(item => item.rule_id)), new Set(['EMAIL_IDENTIFIER', 'EXACT_TIMESTAMP']));

const green = analyzeHolonomyLoomMessage({ text: 'ordinary bounded message', protectedTerms: [], journeyMarkers: [] });
assert.equal(green.status, 'GREEN');
assert.equal(green.summary, 'Nothing matched the protection rules you turned on.');
assert.equal(green.release_boundary.raw_release_allowed, true);
assert.equal(green.release_boundary.downstream_platform_governed, false);

const resemblanceOnly = analyzeHolonomyLoomMessage({ text: `ordinary ${journeyMarker}`, protectedTerms: [], journeyMarkers: [] });
assert.equal(resemblanceOnly.journey_relations.length, 0, 'Undeclared resemblance must not become provenance.');

console.log('Holonomy Loom hosted product integration static contract: PASS');
