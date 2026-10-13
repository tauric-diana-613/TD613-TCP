import assert from 'assert';
import { detectForbiddenClaims } from '../app/engine/claim-ladder.js';
import { loadFixtureManifest, runFixtureSuite, runStylometryFixture } from '../app/engine/fixture-runner.js';

const { manifest, fixtures } = await loadFixtureManifest('./fixtures/stylometry/manifest.json');

assert.equal(manifest.version, 'phase-8');
assert(fixtures.length >= 12, `expected at least 12 fixtures, got ${fixtures.length}`);

const byId = Object.fromEntries(fixtures.map((fixture) => [fixture.id, fixture]));
const requiredIds = [
  'same-author-basic',
  'different-author-basic',
  'topic-matched-different-author',
  'same-author-topic-shift',
  'paraphrase-near',
  'ai-smoothed-author-drift',
  'glyph-normalization-stress',
  'zwnj-khona-lit-po-integrity',
  'persona-history-stable',
  'persona-history-overfit',
  'short-sample-insufficient',
  'semantic-preservation-literals',
  'hostile-pipeline-compression',
  'belonging-without-collapse',
  'ingestion-friction-heavy',
  'controller-hold-conflict'
];
for (const id of requiredIds) assert(byId[id], `missing required fixture ${id}`);

for (const fixture of fixtures) {
  assert(fixture.id, 'fixture id missing');
  assert(fixture.title, `title missing for ${fixture.id}`);
  assert(fixture.fixtureClass, `fixtureClass missing for ${fixture.id}`);
  assert(fixture.riskMode, `riskMode missing for ${fixture.id}`);
  assert(fixture.description, `description missing for ${fixture.id}`);
  assert(fixture.inputs?.protectedBaseline !== undefined, `protectedBaseline missing for ${fixture.id}`);
  assert(fixture.inputs?.maskReference !== undefined, `maskReference missing for ${fixture.id}`);
  assert(fixture.inputs?.messageDraft !== undefined, `messageDraft missing for ${fixture.id}`);
  assert(fixture.inputs?.protectedOutput !== undefined, `protectedOutput missing for ${fixture.id}`);
  assert(fixture.expectations?.escapeVector, `escapeVector expectations missing for ${fixture.id}`);
  assert(fixture.expectations?.claimCeiling, `claim ceiling expectations missing for ${fixture.id}`);
  assert(fixture.expectations?.report?.mustAvoidForbiddenClaims, `forbidden claim expectation missing for ${fixture.id}`);
  const expectationText = JSON.stringify(fixture.expectations);
  assert(!/identity proof|anonymity proof|platform proof|same author truth|not same author truth/i.test(expectationText), `fixture ${fixture.id} contains prohibited proof expectation`);
}

const requiredClasses = new Set(manifest.requiredClasses || []);
for (const klass of requiredClasses) assert(fixtures.some((fixture) => fixture.fixtureClass === klass), `required class ${klass} not represented`);

const same = byId['same-author-basic'];
const different = byId['different-author-basic'];
assert(same.expectations.escapeVector.sourceResidualRisk.min >= different.expectations.escapeVector.sourceResidualRisk.min, 'same-author source-risk floor should not be lower than different-author floor');
assert(same.expectations.claimCeiling.maxLevel <= 6, 'same-author basic must not become an identity proof fixture');
assert(different.expectations.claimCeiling.maxLevel <= 6, 'different-author basic must not become an identity proof fixture');

const topicMatched = byId['topic-matched-different-author'];
assert(topicMatched.calibrationNotes.join(' ').toLowerCase().includes('topic'), 'topic-matched fixture must document the topic trap');
assert(topicMatched.expectations.claimCeiling.maxLevel <= 6, 'topic-matched fixture must keep claims bounded');

const aiSmoothed = byId['ai-smoothed-author-drift'];
assert(aiSmoothed.calibrationNotes.join(' ').toLowerCase().includes('smoothness is not safety'), 'AI-smoothed fixture must preserve smoothness warning');
assert(aiSmoothed.expectations.claimCeiling.maxLevel <= 6, 'AI-smoothed fixture must not inflate claim ceiling');

const short = byId['short-sample-insufficient'];
assert(short.expectations.claimCeiling.maxLevel <= 3, 'short sample fixture must cap claim ceiling');

const conflict = byId['controller-hold-conflict'];
assert(conflict.expectations.controller.allowedStates.includes('hold'), 'controller conflict must allow hold state');
assert(conflict.expectations.claimCeiling.maxLevel <= 5, 'controller conflict must cap claim ceiling');

const glyph = byId['glyph-normalization-stress'];
const zwnj = byId['zwnj-khona-lit-po-integrity'];
assert(glyph.protectedLiterals.includes('𝌋') && glyph.protectedLiterals.includes('⟐'), 'glyph fixture must preserve lane/seal glyphs');
assert(JSON.stringify(zwnj).includes('\\u200C') || JSON.stringify(zwnj).includes('‌'), 'ZWNJ fixture must preserve U+200C boundary representation');

const results = fixtures.map((fixture) => runStylometryFixture(fixture));
assert.equal(results.length, fixtures.length);
for (const result of results) {
  assert(['pass', 'warn', 'fail', 'invalid'].includes(result.status), `bad result status for ${result.fixtureId}`);
  assert(result.reportPayload, `report payload missing for ${result.fixtureId}`);
  assert.equal(result.reportPayload.reproducibility.sourceTextIncluded, false, `source text exported for ${result.fixtureId}`);
  assert.equal(result.reportPayload.reproducibility.outputTextIncluded, false, `output text exported for ${result.fixtureId}`);
  assert.equal(detectForbiddenClaims(JSON.stringify(result.reportPayload)).hasForbiddenClaim, false, `forbidden positive claim in report for ${result.fixtureId}`);
}

const suite = runFixtureSuite(fixtures);
assert.equal(suite.results.length, fixtures.length);
assert.equal(suite.summary.total, fixtures.length);
assert(suite.summary.counts.pass + suite.summary.counts.warn + suite.summary.counts.fail + suite.summary.counts.invalid === fixtures.length);

console.log('stylometry-regression tests passed');
