import assert from 'node:assert/strict';
import fs from 'node:fs';

const receiptPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/04-RECEIPTS/assays/2026-09-11-eclipse-omega-retrieval-observability-semantic-redundancy-v06.json';
const operationPath = 'packages/dome_world_exact/fixtures/a15-r0/WENDBINE/05-OPERATIONS/2026-09-11-ECLIPSE-OMEGA-RETRIEVAL-OBSERVABILITY-SEMANTIC-REDUNDANCY-V0_6.md';

const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
const operation = fs.readFileSync(operationPath, 'utf8');

assert.equal(receipt.schema, 'td613.eclipse-omega-retrieval-observability-semantic-redundancy-assay/v0.6');
assert.equal(receipt.authority.scientific_promotion, false);
assert.equal(receipt.authority.external_empirical_claim, false);
assert.equal(receipt.authority.deployed_llm_inference, false);
assert.equal(receipt.authority.copying_or_plagiarism_adjudication, false);
assert.equal(receipt.authority.private_wendbine_material_admitted, false);

const corpus = receipt.corpus;

function dot(a, b) {
  return a.reduce((sum, value, index) => sum + value * b[index], 0);
}

function norm(a) {
  return Math.sqrt(dot(a, a));
}

function cosine(a, b) {
  const denominator = norm(a) * norm(b);
  if (denominator === 0) throw new Error('zero vector is not admissible in this fixture');
  return dot(a, b) / denominator;
}

function semRed(items) {
  if (items.length < 2) return 0;
  let sum = 0;
  let pairs = 0;
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      sum += cosine(items[i].vector, items[j].vector);
      pairs += 1;
    }
  }
  return sum / pairs;
}

function deficit(items) {
  const supportClasses = new Set(items.map(item => item.support_class));
  return 1 - supportClasses.size / receipt.operationalization.eligible_support_classes.length;
}

function relevanceOnly(items, k) {
  return [...items]
    .sort((a, b) => (b.relevance - a.relevance) || a.id.localeCompare(b.id))
    .slice(0, k);
}

function diversityAware(items, k, lambda) {
  const remaining = [...items];
  const selected = [];
  while (selected.length < k && remaining.length > 0) {
    remaining.sort((a, b) => {
      const score = candidate => {
        const maxSimilarity = selected.length === 0
          ? 0
          : Math.max(...selected.map(chosen => cosine(candidate.vector, chosen.vector)));
        return candidate.relevance - lambda * maxSimilarity;
      };
      return (score(b) - score(a)) || a.id.localeCompare(b.id);
    });
    selected.push(remaining.shift());
  }
  return selected;
}

function ids(items) {
  return items.map(item => item.id);
}

function approx(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 1e-12, `${message}: expected ${expected}, got ${actual}`);
}

const relevanceK4 = relevanceOnly(corpus, 4);
const relevanceK2 = relevanceOnly(corpus, 2);
assert.deepEqual(ids(relevanceK4), receipt.expected.relevance_only.k4.ids);
assert.deepEqual(ids(relevanceK2), receipt.expected.relevance_only.k2.ids);
approx(deficit(relevanceK4), 0, 'relevance k4 deficit');
approx(semRed(relevanceK4), 1 / 6, 'relevance k4 SemRed');
approx(deficit(relevanceK2), 2 / 3, 'relevance k2 deficit');
approx(semRed(relevanceK2), 1, 'relevance k2 SemRed');
assert.ok(deficit(relevanceK2) > deficit(relevanceK4), 'Relevance-only budget reduction must increase declared support deficit.');
assert.ok(semRed(relevanceK2) > semRed(relevanceK4), 'Relevance-only budget reduction must increase semantic redundancy in this fixture.');

const lambda = receipt.expected.diversity_aware.lambda;
const diverseK4 = diversityAware(corpus, 4, lambda);
const diverseK2 = diversityAware(corpus, 2, lambda);
assert.deepEqual(ids(diverseK4), receipt.expected.diversity_aware.k4.ids);
assert.deepEqual(ids(diverseK2), receipt.expected.diversity_aware.k2.ids);
approx(deficit(diverseK4), 0, 'diversity k4 deficit');
approx(semRed(diverseK4), 1 / 6, 'diversity k4 SemRed');
approx(deficit(diverseK2), 1 / 3, 'diversity k2 deficit');
approx(semRed(diverseK2), 0, 'diversity k2 SemRed');
assert.ok(deficit(diverseK2) > deficit(diverseK4), 'Diversity-aware budget reduction must still increase declared support deficit.');
assert.ok(semRed(diverseK2) < semRed(diverseK4), 'Hostile control must lower redundancy while deficit increases.');

assert.ok(receipt.verdicts.includes('FOUNDATIONAL_MONOTONICITY_REJECTED_AS_UNIVERSAL'));
for (const law of [
  'PROJECT_LABEL != FIELD_NOVELTY',
  'SEMANTIC_REDUNDANCY != INDEPENDENT_CONFIRMATION',
  'CAPACITY_PRESSURE != REDUNDANCY_CAUSATION',
  'RETRIEVAL_OBSERVABILITY_DEFICIT_UP != SEMANTIC_REDUNDANCY_UP_AS_UNIVERSAL_LAW',
  'REDUNDANCY_SIGNAL != HIDDEN_CAUSE',
  'TERMINAL_SIMILARITY != STAGE_LOCALIZATION',
  'SYNTHETIC_POLICY_COUNTEREXAMPLE != DEPLOYED_LLM_MEASUREMENT'
]) {
  assert.ok(receipt.laws.includes(law), `Receipt must preserve law: ${law}`);
}

assert.match(operation, /RETRIEVAL_OBSERVABILITY_DEFICIT_UP != SEMANTIC_REDUNDANCY_UP_AS_UNIVERSAL_LAW/);
assert.match(operation, /REDUNDANCY_INFLATION_CAN_OCCUR_UNDER_RELEVANCE_ONLY_CAPACITY_TRUNCATION/);
assert.match(operation, /DIVERSITY_AWARE_SELECTION_CAN_BREAK_OR_REVERSE_THAT_RELATION/);
assert.match(operation, /REDUNDANCY_SIGNAL != HIDDEN_CAUSE/);

console.log('TD613 Eclipse–Omega retrieval-observability / semantic-redundancy assay v0.6 passed.');
