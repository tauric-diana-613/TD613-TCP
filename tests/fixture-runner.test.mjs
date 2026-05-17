import assert from 'assert';
import { detectForbiddenClaims } from '../app/engine/claim-ladder.js';
import {
  buildFixtureReport,
  filterFixtures,
  loadFixtureManifest,
  runFixtureSuite,
  runStylometryFixture
} from '../app/engine/fixture-runner.js';

const { manifest, fixtures } = await loadFixtureManifest('./fixtures/stylometry/manifest.json');
assert.equal(manifest.version, 'phase-8');
assert(fixtures.length >= 12);
assert(fixtures.every((fixture) => fixture.id && fixture.inputs && fixture.expectations));

const same = fixtures.find((fixture) => fixture.id === 'same-author-basic');
assert(same, 'same-author-basic fixture missing');
const sameResult = runStylometryFixture(same);
assert.equal(sameResult.fixtureId, 'same-author-basic');
assert(['pass', 'warn', 'fail'].includes(sameResult.status));
assert(sameResult.escapeVector?.scores);
assert(sameResult.ingestionAudit);
assert(sameResult.controllerDecision);
assert(sameResult.claimCeiling);
assert(sameResult.reportPayload);
assert.equal(sameResult.reportPayload.reproducibility.sourceTextIncluded, false);
assert.equal(sameResult.reportPayload.reproducibility.outputTextIncluded, false);
assert.equal(detectForbiddenClaims(JSON.stringify(sameResult.reportPayload)).hasForbiddenClaim, false);

const invalid = runStylometryFixture({ id: 'missing-inputs' });
assert.equal(invalid.status, 'invalid');
assert(invalid.failures.length > 0);

const suite = runFixtureSuite(fixtures.slice(0, 4));
assert.equal(suite.version, 'phase-8');
assert.equal(suite.results.length, 4);
assert.equal(suite.summary.total, 4);
assert(suite.summary.counts.pass + suite.summary.counts.warn + suite.summary.counts.fail + suite.summary.counts.invalid === 4);

const filtered = filterFixtures(fixtures, { fixtureClass: 'zwnj-integrity' });
assert.equal(filtered.length, 1);
assert.equal(filtered[0].id, 'zwnj-khona-lit-po-integrity');
const zwnjResult = runStylometryFixture(filtered[0]);
assert(zwnjResult.ingestionAudit);
assert(Number.isFinite(zwnjResult.escapeVector.scores.ingestionFriction));
assert.equal(zwnjResult.reportPayload.reproducibility.sourceTextIncluded, false);
assert.equal(detectForbiddenClaims(JSON.stringify(zwnjResult.reportPayload)).hasForbiddenClaim, false);

const short = fixtures.find((fixture) => fixture.id === 'short-sample-insufficient');
assert(short, 'short sample fixture missing');
const shortResult = runStylometryFixture(short);
assert(shortResult.claimCeiling.level <= 4, `short sample claim level should stay low, got ${shortResult.claimCeiling.level}`);
assert(['hold', 'continue', 'restore', 'seal'].includes(shortResult.controllerDecision.state));

const stable = fixtures.find((fixture) => fixture.id === 'persona-history-stable');
assert(stable, 'stable Persona fixture missing');
const stableResult = runStylometryFixture(stable);
assert(stableResult.personaSummary.acceptedCount >= 3);
assert(stableResult.claimCeiling.level <= 7);

const report = buildFixtureReport(suite.results);
assert.equal(report.payload.version, 'phase-8');
assert.equal(report.payload.summary.total, 4);
assert(report.json.includes('fixtureId'));
assert.equal(detectForbiddenClaims(report.json).hasForbiddenClaim, false);

console.log('fixture-runner tests passed');
