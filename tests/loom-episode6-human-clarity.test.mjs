import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
import { compilePedagogueDesignReview } from '../app/engine/pedagogue-design-gate.js';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const fixture = JSON.parse(read('tests/fixtures/pedagogue/loom-episode6-human-clarity-design.json'));

const workspace = () => read('app/dome-world/holonomy-loom/ai-workspace.js');
const resultView = () => read('app/dome-world/holonomy-loom/ai-result-view.js');
const workspaceCss = () => read('app/dome-world/holonomy-loom/ai-workspace.css');
const marrowBase = () => read('app/dome-world/marrowline-loom-import-base.js');
const marrowContinuation = () => read('app/dome-world/marrowline-loom-import.js');

const canonicalSupport = (burden, minimum = 0) => Math.max(minimum, 1000 - Math.min(1000, burden));
const normalizeArchivedBurdenSteps = steps => steps.map(step => ({
  ...step,
  legibility_millipoints: canonicalSupport(step.legibility_millipoints),
  affordance_millipoints: canonicalSupport(step.affordance_millipoints, 1)
}));

const ARCHIVED_LINEAGE_SIGNAL_MAP = Object.freeze({
  INTERPRETIVE_LABOR: 'ENVIRONMENT_REQUIRES_EXTRA_COMMAND_FOR_LEGIBLE_ACTION',
  TEMPORAL_ORDERING: 'TRANSFER_ROUTE_FRAGMENTED',
  ROUTE_BURDEN: null
});
const normalizeArchivedLineageSignals = signals => [...new Set(signals.flatMap(signal => {
  if (!Object.prototype.hasOwnProperty.call(ARCHIVED_LINEAGE_SIGNAL_MAP, signal)) throw new Error(`Unmapped archived Episode 6 lineage signal: ${signal}`);
  const canonical = ARCHIVED_LINEAGE_SIGNAL_MAP[signal];
  return canonical ? [canonical] : [];
}))];

test('Pedagogue receives Episode 6 as a human-observed baseline rather than a synthetic success', async () => {
  // The archival fixture keeps its human-specific red label, local-offset clock,
  // structural-burden millipoints, and descriptive lineage labels exactly as
  // observed/authored. Normalize only at the Pedagogue compiler boundary: its
  // route graph consumes support coordinates and its second pass consumes typed
  // system-event signals. ROUTE_BURDEN already enters through burden_comparison.
  // None of these adapters upgrades the human observation or rewrites Episode 6.
  const reviewFixture = {
    ...fixture,
    scene_input: {
      ...fixture.scene_input,
      observation_status: 'OBSERVED',
      route_topology: {
        ...fixture.scene_input.route_topology,
        steps: normalizeArchivedBurdenSteps(fixture.scene_input.route_topology.steps)
      }
    },
    baseline_route_steps: normalizeArchivedBurdenSteps(fixture.baseline_route_steps),
    lineage_second_pass_signals: normalizeArchivedLineageSignals(fixture.lineage_second_pass_signals)
  };
  const determinism = { ...fixture.determinism, frozenClock: new Date(fixture.determinism.frozenClock).toISOString(), cryptoImpl: webcrypto };
  const review = await compilePedagogueDesignReview(reviewFixture, determinism);
  assert.equal(review.design_gate.human_closure_required, true);
  assert.equal(review.design_gate.route_burden_non_worsening, true);
  assert.equal(review.burden_comparison.all_models_non_worsening, true);
  assert.equal(review.interface_diagnosis.authority.product_mutation_authorized, false);
  const findings = new Set(review.interface_diagnosis.findings.map(item => item.code));
  assert.equal(findings.has('TYPOGRAPHIC_ROLE_UNDECLARED'), true);
  assert.equal(findings.has('TEXTAREA_VISUAL_MASS'), true);
  assert.equal(findings.has('MOBILE_SIZE_IS_PROTECTIVE'), true);
  const continuation = review.interface_diagnosis.action_routing.find(item => item.action_id === 'continue_marrowline');
  assert.equal(continuation.recommended_route, 'NAVIGATE_AFTER_WORLD_ANSWER');
  assert.equal(continuation.human_gesture_remains_origin, true);
});

test('Loom human-facing task surface is provider-neutral and unmistakably editable', () => {
  const source = workspace();
  const css = workspaceCss();
  assert.doesNotMatch(source, /Provider for this route:\s*Google Gemini\./);
  assert.doesNotMatch(source, /Share \$\{doc\.name\} with Gemini/);
  assert.doesNotMatch(source, /Select only the files Gemini should receive/);
  assert.match(source, /id="aiProjectBrief" class="ai-project-brief/);
  assert.match(source, /id="aiTaskCue"/);
  assert.match(source, /exact instruction the AI will receive/i);
  assert.match(css, /\.ai-task-surface/);
  assert.match(css, /#loomAiWorkspace textarea#aiTask/);
  assert.match(css, /@media\(max-width:560px\)[\s\S]*ai-project-brief/);
});

test('returned Loom answer visibly binds itself to the submitted task and keeps one primary reading path', () => {
  const source = workspace();
  const result = resultView();
  assert.match(source, /id="aiSubmittedTask"/);
  assert.match(source, /You asked the AI to/);
  assert.doesNotMatch(result, /className\)\s*;?\s*full\.append|ai-result-full/);
  assert.match(result, /Possible next action[^'"`]*optional/i);
  assert.match(result, /ai-result-disclosure/);
  assert.match(result, /Sources named by the AI[^'"`]*not independently verified/i);
  assert.match(result, /Technical[^'"`]*exact AI response/i);
});

test('result disclosure grammar advertises plus/minus state instead of native triangle-only affordance', () => {
  const css = workspaceCss();
  assert.match(css, /\.ai-result-disclosure>summary::after\s*\{[^}]*content:\s*['"]\+['"]/);
  assert.match(css, /\.ai-result-disclosure\[open\]>summary::after\s*\{[^}]*content:\s*['"]−['"]/);
  assert.match(css, /\.ai-result-disclosure>summary::?-webkit-details-marker|summary::-webkit-details-marker/);
});

test('Loom continuation lands inside current Marrowline rather than replacing the living chat', () => {
  const base = marrowBase();
  const continuation = marrowContinuation();
  assert.doesNotMatch(base, /\.ritual-shell>:not\(\[data-loom-import-workspace\]\)\{display:none!important\}/);
  assert.match(base, /querySelector\(['"]\.living-workspace['"]\)/);
  assert.match(base, /Close imported context/);
  assert.match(base, /Return to Loom/);
  assert.match(base, /loom-import-context-card/);
  assert.doesNotMatch(base, /through Dome-World to Google Gemini/);
  assert.doesNotMatch(continuation, /through Dome-World to Google Gemini/);
  assert.match(continuation, /What should Marrowline do next\?/);
});
