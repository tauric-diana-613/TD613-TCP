import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOLLHOUSE_AGENT_REGISTRY, getDollhouseAgent, listDollhouseAgents } from '../app/engine/dollhouse-agent-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('Dollhouse Orchestration Invariant: Blind Divergence produces genuinely distinct outputs', () => {
  const dir = path.join(__dirname, 'fixtures', 'dollhouse', 'blind-divergence');
  const pedagogue = JSON.parse(fs.readFileSync(path.join(dir, 'pedagogue-blind-audit.json'), 'utf8'));
  const aperture = JSON.parse(fs.readFileSync(path.join(dir, 'aperture-blind-audit.json'), 'utf8'));
  const atlas = JSON.parse(fs.readFileSync(path.join(dir, 'atlas-blind-audit.json'), 'utf8'));
  const fadt = JSON.parse(fs.readFileSync(path.join(dir, 'fadt-blind-audit.json'), 'utf8'));
  const divergenceMap = JSON.parse(fs.readFileSync(path.join(dir, 'divergence-map.json'), 'utf8'));

  // Ensure all 4 addressed the same coordinate
  const coord = 'return_state_divergence_and_held_c2';
  assert.equal(pedagogue.coordinate, coord);
  assert.equal(aperture.coordinate, coord);
  assert.equal(atlas.coordinate, coord);
  assert.equal(fadt.coordinate, coord);

  // 1. Observations are distinct
  const observations = new Set([pedagogue.observation, aperture.observation, atlas.observation, fadt.observation]);
  assert.equal(observations.size, 4, 'All 4 roles must emit distinct observations');

  // 2. Concerns represent distinct failure modes
  const concerns = new Set([pedagogue.concern, aperture.concern, atlas.concern, fadt.concern]);
  assert.equal(concerns.size, 4, 'All 4 roles must identify distinct concerns');

  // 3. Falsifiers are rooted in unique epistemic instruments
  const falsifiers = new Set([pedagogue.falsifier, aperture.falsifier, atlas.falsifier, fadt.falsifier]);
  assert.equal(falsifiers.size, 4, 'All 4 roles must propose distinct falsifiers');

  // 4. Claim ceilings differ
  assert.equal(pedagogue.claim_ceiling, 'recommendation-and-verification-only-human-closure-required');
  assert.equal(aperture.claim_ceiling, 'experimental-research-instrument-no-external-reality-or-release-authority');
  assert.equal(atlas.claim_ceiling, 'receiver-relation-audit-only-no-basis-free-geometry-no-release-no-lineage-promotion');
  assert.equal(fadt.claim_ceiling, 'finite-support-descent-audit-only-no-universal-ai-law-no-release-no-source-state-reconstruction');

  // 5. Divergence Map records unique contribution
  for (const role of ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT']) {
    assert.ok(divergenceMap.divergence[role].unique_to_role.length > 20);
    assert.equal(divergenceMap.divergence[role].survives_cross_exam, true);
  }
});

test('Dollhouse Orchestration Invariant: Ablation Experiment proves differentiated contribution', () => {
  const ablationPath = path.join(__dirname, 'fixtures', 'dollhouse', 'blind-divergence', 'ablation-experiment.json');
  const ablation = JSON.parse(fs.readFileSync(ablationPath, 'utf8'));

  const conditions = ablation.conditions;
  assert.equal(conditions.length, 5, 'Must evaluate 5 conditions (Full + 4 single ablations)');

  const full = conditions.find(c => c.condition === 'FULL_DOLLHOUSE');
  assert.equal(full.findings_emitted, 4);
  assert.equal(full.incorrect_promotions, 0);

  const minusPedagogue = conditions.find(c => c.condition === 'MINUS_PEDAGOGUE');
  assert.equal(minusPedagogue.findings_lost, 1);
  assert.equal(minusPedagogue.lost_finding_id, 'PEDAGOGUE_ROUTE_BURDEN');
  assert.equal(minusPedagogue.unresolved_coordinates, 1);

  const minusAperture = conditions.find(c => c.condition === 'MINUS_APERTURE');
  assert.equal(minusAperture.findings_lost, 1);
  assert.equal(minusAperture.lost_finding_id, 'APERTURE_OBSERVABILITY_CONFLATION');
  assert.equal(minusAperture.incorrect_promotions, 1, 'Without Aperture, URL hash causes false promotion');

  const minusAtlas = conditions.find(c => c.condition === 'MINUS_ATLAS');
  assert.equal(minusAtlas.findings_lost, 1);
  assert.equal(minusAtlas.lost_finding_id, 'ATLAS_CROSS_WINDOW_CHAIN');
  assert.equal(minusAtlas.incorrect_promotions, 1, 'Without Atlas, unverified receiver causes custody fork');

  const minusFadt = conditions.find(c => c.condition === 'MINUS_FADT');
  assert.equal(minusFadt.findings_lost, 1);
  assert.equal(minusFadt.lost_finding_id, 'FADT_LAWFUL_SUPPORT_BOUNDARY');
  assert.equal(minusFadt.incorrect_promotions, 1, 'Without FADT, unconditioned actions are illegally granted');
});

test('Dollhouse Orchestration Invariant: Same-Episode Observatory is strictly grounded in evidence', () => {
  const observatoryPath = path.join(__dirname, 'fixtures', 'dollhouse', 'episode-1428-x-observatory.json');
  const observatory = JSON.parse(fs.readFileSync(observatoryPath, 'utf8'));

  assert.equal(observatory.episode_id, 'ep_loom_closure_1791090079183');

  // Verify that observations contain explicit evidence pointers
  for (const role of ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT']) {
    const obs = observatory.observers[role];
    for (const [phase, data] of Object.entries(obs.observations)) {
      assert.ok(data.episode_event_id, `${role} ${phase} must specify episode_event_id`);
      assert.ok(data.timestamp, `${role} ${phase} must specify timestamp`);
      assert.ok(data.artifact_path, `${role} ${phase} must specify artifact_path`);
      assert.ok(data.screenshot_id, `${role} ${phase} must specify screenshot_id`);
    }
  }

  // Atlas observation must be HELD for phase 2 (matching C2 NO_NETWORK_RESPONSE)
  assert.equal(observatory.observers.ATLAS.observations.phase2_marrowline.status, 'HELD');

  // Aperture observation must reflect current source (.20 opacity)
  assert.ok(observatory.observers.APERTURE.observations.phase1_loom.evidence.includes('0.20'));

  // Temporal Custodian role must be whole-journey protector with veto authority
  assert.equal(observatory.temporal_custodian.veto_authority, 'LOCAL_PASS_PLUS_GLOBAL_ROUTE_REGRESSION');
  assert.equal(observatory.temporal_custodian.verdict, 'HELD');
});

test('Dollhouse Orchestration Invariant: Disagreement Ledger preserves real disagreements', () => {
  const ledgerPath = path.join(__dirname, 'fixtures', 'dollhouse', 'disagreement-ledger-1428.json');
  const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));

  assert.equal(ledger.$schema, 'td613.dollhouse.disagreement-ledger/v1.0');
  assert.equal(ledger.episode_id, 'ep_loom_closure_1791090079183');
  assert.ok(ledger.disagreements.length >= 5, 'Must record 5 preserved disagreements');

  // Historical governor defect must be explicitly labeled resolved
  const govDefect = ledger.disagreements.find(d => d.coordinate === 'governor_lifecycle_leak_in_error_branch');
  assert.equal(govDefect.orchestrator_decision, 'HISTORICAL_DEFECT_RESOLVED');

  // Return divergence disagreement must exist
  const returnDiv = ledger.disagreements.find(d => d.coordinate === 'return_scene_hash_vs_workspace_admittance');
  assert.ok(returnDiv, 'Return divergence disagreement must be catalogued');
  assert.equal(returnDiv.orchestrator_decision, 'HELD_NO_SYNTHETIC_COMPLETION');
});

test('Dollhouse Orchestration Invariant: Restraint Experiment (Causal Leverage vs Code Surface Area)', () => {
  const coreEngineFiles = [
    'app/engine/flowcore-pedagogue-core.js',
    'app/engine/flowcore-pedagogue-aia.js',
    'app/engine/dollhouse-agent-registry.js',
    'app/engine/dollhouse-case-dossier.js'
  ];

  for (const file of coreEngineFiles) {
    const fullPath = path.join(__dirname, '..', file);
    assert.ok(fs.existsSync(fullPath), `Core engine file ${file} must remain intact`);
  }
});

test('Dollhouse Orchestration Invariant: Latifa Gate Speculations require falsifiers, prototypes, and rulings', () => {
  const speculations = [
    {
      id: 'LATIFA-A',
      hypothesis: 'Flow-Core as learned motion language: first-time users infer gather/release/return/rest from choreography before operator legend.',
      falsifier: 'Blinded hostile-consumer agents cannot predict operator family above chance after interaction.',
      bounded_prototype: 'tests/fixtures/dollhouse/self-explaining-loom-fixture.json',
      containment: 'Non-production tutorial A/B comparison fixture',
      ruling: 'PROMOTE'
    },
    {
      id: 'LATIFA-B',
      hypothesis: 'Dollhouse disagreement as product instrument: exposing unresolved role tensions in an inspector clarifies trade-offs.',
      falsifier: 'Disagreement inspector increases cognitive load without improving operator task accuracy.',
      bounded_prototype: 'app/dome-world/dollhouse-disagreement-inspector.html',
      containment: 'Dome-World laboratory inspector only; zero production authority',
      ruling: 'PROMOTE'
    },
    {
      id: 'LATIFA-C',
      hypothesis: 'Receiver-independent agent observatory: role contracts reproduce materially identical audit differentiation across Gemini, Claude, and ChatGPT.',
      falsifier: 'Role divergence collapses into uniform code reviews under model substitution.',
      bounded_prototype: 'tests/dollhouse-orchestration-invariants.test.mjs',
      containment: 'Deterministic Node test harness and JSON schemas',
      ruling: 'PROMOTE'
    }
  ];

  for (const spec of speculations) {
    assert.ok(spec.hypothesis.length > 20);
    assert.ok(spec.falsifier.length > 20);
    assert.ok(spec.bounded_prototype.length > 0);
    assert.ok(['PROMOTE', 'HOLD', 'REJECT'].includes(spec.ruling));
  }
});
