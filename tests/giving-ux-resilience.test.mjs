import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compileCisternLawReceipt, compareCisternRouteMemory } from '../app/engine/aia-cistern-law.js';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const BROWSER_SURFACES = [
  'app/giving/history/index.html',
  'app/giving/history/giving-bootstrap.js',
  'app/giving/history/giving-ux-resilience-shell.js',
  'app/giving/history/giving-ux-resilience.css',
  'app/giving/history/giving-campaign-tools-v3.js',
  'app/giving/history/giving-campaign-tools-v3.css',
  'app/giving/history/giving-contact-queue-v2.js',
  'app/giving/history/giving-run-settled.js',
  'app/giving/history/giving-visible-language.js'
];

const INTERNAL_UI_TERMS = /\b(?:anisotrop(?:y|ic)|pedagogue|pedagogy|tomograph(?:y|ic)|holonomy|cistern law|springald|marrowline|gluing obstruction|projection crossings?|route holonomy)\b/i;

test('Giving browser surfaces do not leak internal architecture nomenclature', async () => {
  for (const path of BROWSER_SURFACES) {
    const content = await read(path);
    assert.equal(INTERNAL_UI_TERMS.test(content), false, `${path} leaked internal architecture language`);
  }
});

test('public Aperture naming remains allowed by the Giving language gate', () => {
  assert.equal(INTERNAL_UI_TERMS.test('Aperture witness available'), false);
});

test('campaign lookup uses compact multi-jurisdiction controls and independent settled routes', async () => {
  const shell = await read('app/giving/history/giving-ux-resilience-shell.js');
  const tools = await read('app/giving/history/giving-campaign-tools-v3.js');
  assert.match(shell, /value="FEDERAL"/);
  assert.match(shell, /value="STATE"/);
  assert.match(shell, /value="MUNICIPAL"/);
  assert.match(shell, /campaignDirectoryStateAll/);
  assert.match(shell, /campaignDirectoryMunicipalAll/);
  assert.match(shell, /name="campaign-directory-activity" value="CONTRIBUTIONS"/);
  assert.match(tools, /new Set\(\['FL'\]\)/);
  assert.match(tools, /new Set\(\)/);
  assert.match(tools, /Promise\.allSettled/);
  assert.match(tools, /document\.querySelector\('\[data-view="ledger"\]'\)\?\.click\(\)/);
  assert.match(tools, /facet === 'CANDIDATE'/);
  assert.match(tools, /facet === 'COMMITTEE'/);
  assert.match(tools, /include_opensecrets: index === 0/);
});

test('queue waits for canonical terminal search signal and isolates contact holds', async () => {
  const queue = await read('app/giving/history/giving-contact-queue-v2.js');
  const settled = await read('app/giving/history/giving-run-settled.js');
  assert.match(queue, /td613:giving-run-settled/);
  assert.match(queue, /for \(let index = 0; index < queue\.length; index \+= 1\)/);
  assert.match(queue, /try \{/);
  assert.match(queue, /catch \(error\)/);
  assert.match(queue, /finally \{/);
  assert.match(queue, /SOURCE HOLD/);
  assert.match(queue, /CLIENT HOLD/);
  assert.match(settled, /cardsTerminal/);
  assert.match(settled, /held_sources/);
});

test('operator-facing donor state is Match while serialized CANDIDATE compatibility remains', async () => {
  const shell = await read('app/giving/history/giving-ux-resilience-shell.js');
  const visible = await read('app/giving/history/giving-visible-language.js');
  const model = await read('app/giving/history/giving-model.js');
  assert.match(shell, /candidateLegend\.textContent = 'match'/);
  assert.match(shell, /candidateOption\.textContent = 'Match'/);
  assert.match(visible, /textContent = 'Match'/);
  assert.match(model, /CANDIDATE/);
});

test('Cistern route memory refuses endpoint equivalence when route history differs', () => {
  const expected = ['session', 'intent', 'witness', 'write'];
  const lawful = compareCisternRouteMemory(expected, expected);
  const replay = compareCisternRouteMemory(expected, ['session', 'stale-intent', 'write']);
  assert.equal(lawful.exact_route_match, true);
  assert.equal(replay.exact_route_match, false);
  assert.equal(replay.same_endpoint_not_same_history, true);

  const receipt = compileCisternLawReceipt({
    boundary: 'fixture',
    action: 'write',
    expectedRoute: expected,
    observedRoute: expected,
    witness: { human_required: true, human_observed: true, separately_confirmed: true, bounded_intent: true },
    spentIntentDigest: 'digest'
  });
  assert.equal(receipt.outcome, 'RELEASED');
  assert.match(receipt.replay_posture, /NO_DURABLE_TOMBSTONE_CLAIM/);
  assert.equal(receipt.fabricated_decoys, false);
});
