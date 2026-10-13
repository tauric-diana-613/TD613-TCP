import assert from 'node:assert/strict';
import fs from 'node:fs';

const receiptPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/04-RECEIPTS/assays/2026-09-11-prcsa-ordering-scab-assay-v04.json';
const operationPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/05-OPERATIONS/2026-09-11-PRCSA-ORDERING-SCAB-ASSAY-V0_4.md';
const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
const operation = fs.readFileSync(operationPath, 'utf8');

assert.equal(receipt.schema, 'td613.prcsa-ordering-scab-assay/v0.4');
assert.equal(receipt.authority.scientific_promotion, false);
assert.equal(receipt.authority.private_wendbine_material_admitted, false);
assert.equal(receipt.authority.deployment, false);
assert.equal(receipt.synthetic_fixture.hostile_permutation_count, 24);
assert.equal(receipt.synthetic_fixture.observed_terminal_signature_classes, 5);
assert.equal(receipt.synthetic_fixture.canonical_terminal_equivalence_class_size, 9);
assert.equal(receipt.adjudication.exact_order_intrinsic_novelty, 'REJECTED_NO_CREDIT');
assert.equal(receipt.adjudication.prcsa_scientific_facing_status, 'HYPOTHESIZED_TYPED_FACTORIZATION_NOT_THEOREM');
assert.match(operation, /FINAL_EVENT != UNIQUE_PIPELINE_ORDER/);
assert.match(operation, /stage-order sensitivity certificate/i);

function permutations(items) {
  if (items.length <= 1) return [items.slice()];
  const out = [];
  for (let i = 0; i < items.length; i += 1) {
    const head = items[i];
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const tail of permutations(rest)) out.push([head, ...tail]);
  }
  return out;
}

function applyStage(state, stage) {
  const next = structuredClone(state);
  if (stage === 'K') {
    next.payload = Math.min(next.payload, 2);
    return next;
  }
  if (stage === 'P') {
    next.payload %= 2;
    return next;
  }
  if (stage === 'A') {
    next.released = next.payload === 1;
    if (!next.released) next.payload = 0;
    return next;
  }
  if (stage === 'N') {
    if (next.released === true) next.label = 'ALLOW';
    else if (next.released === false) next.label = 'HOLD';
    else next.label = next.payload % 2 === 1 ? 'ODD' : 'EVEN';
    return next;
  }
  if (stage === 'E') {
    next.registered = {
      payload: next.payload,
      released: next.released,
      label: next.label
    };
    return next;
  }
  throw new Error(`Unknown stage ${stage}`);
}

function runPipeline(order, input, { captureTrace = false } = {}) {
  let state = { payload: input, released: null, label: null, registered: null };
  const trace = [];
  for (const stage of order) {
    state = applyStage(state, stage);
    if (captureTrace) trace.push({ stage, state: structuredClone(state) });
  }
  return { state, trace };
}

function signature(prefix, inputs) {
  return JSON.stringify(inputs.map(input => runPipeline([...prefix, 'E'], input).state.registered));
}

const prefixStages = ['K', 'P', 'A', 'N'];
const prefixes = permutations(prefixStages);
const inputs = [0, 1, 2, 3, 4, 5];
assert.equal(prefixes.length, 24, '4! hostile prefix permutations must be exhausted.');

const classes = new Map();
for (const prefix of prefixes) {
  const sig = signature(prefix, inputs);
  const bucket = classes.get(sig) ?? [];
  bucket.push(prefix);
  classes.set(sig, bucket);
}
assert.equal(classes.size, 5, 'Declared hostile fixture must produce five terminal-signature classes.');

const canonical = ['K', 'P', 'A', 'N'];
const canonicalSignature = signature(canonical, inputs);
const canonicalClass = classes.get(canonicalSignature);
assert.ok(canonicalClass, 'Canonical terminal signature must be present.');
assert.equal(canonicalClass.length, 9, 'Canonical prefix must share its terminal behavior with eight alternatives.');
assert.ok(
  canonicalClass.some(prefix => JSON.stringify(prefix) === JSON.stringify(['A', 'K', 'P', 'N'])),
  'Declared terminal-equivalent alternative A->K->P->N must remain in the canonical equivalence class.'
);
assert.ok(
  [...classes.keys()].some(sig => sig !== canonicalSignature),
  'At least one hostile prefix must differ from canonical terminal behavior; order effects exist in the fixture.'
);

const canonicalTrace = runPipeline(['K', 'P', 'A', 'N', 'E'], 3, { captureTrace: true }).trace;
const alternativeTrace = runPipeline(['A', 'K', 'P', 'N', 'E'], 3, { captureTrace: true }).trace;
assert.deepEqual(
  canonicalTrace.at(-1).state.registered,
  alternativeTrace.at(-1).state.registered,
  'Selected pipelines must remain terminally equivalent for input 3.'
);
assert.notDeepEqual(
  canonicalTrace[0].state,
  alternativeTrace[0].state,
  'An intermediate stage-1 witness must distinguish the selected terminal-equivalent pipelines.'
);
assert.equal(canonicalTrace[0].state.payload, 2);
assert.equal(alternativeTrace[0].state.payload, 0);
assert.equal(alternativeTrace[0].state.released, false);

function runCommutingControl(prefix) {
  const state = { K: false, P: false, A: false, N: false };
  for (const stage of prefix) state[stage] = true;
  return JSON.stringify(state);
}
const commutingSignatures = new Set(prefixes.map(runCommutingControl));
assert.equal(
  commutingSignatures.size,
  1,
  'Disjoint-field commuting control must collapse all 24 stage prefixes to one terminal signature.'
);

for (const law of [
  'STAGE_COUNT != IDENTIFIABILITY',
  'ORDER_EFFECT != ORDER_IDENTIFICATION',
  'FINAL_EVENT != UNIQUE_PIPELINE_ORDER',
  'NONCOMMUTATIVITY != NOVELTY'
]) {
  assert.ok(receipt.laws.includes(law), `Receipt must retain anti-overclaim law: ${law}`);
}

console.log('TD613 PRCS-A ordering scab assay v0.4 passed.');
