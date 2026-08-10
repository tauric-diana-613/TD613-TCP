export const A15_R0_OPEN_FIELD_SCHEMA = 'td613.ash.a15-r0.open-research-field/v0.1';

const round = value => Number(value.toFixed(6));

function unique(values) {
  return [...new Set(values)];
}

function combinations(values, size, start = 0, prefix = [], output = []) {
  if (prefix.length === size) {
    output.push(prefix.slice());
    return output;
  }
  for (let index = start; index <= values.length - (size - prefix.length); index += 1) {
    prefix.push(values[index]);
    combinations(values, size, index + 1, prefix, output);
    prefix.pop();
  }
  return output;
}

export function mutualInformationBits(samples) {
  if (!Array.isArray(samples) || samples.length === 0) throw new Error('mutualInformationBits requires samples.');
  const joint = new Map();
  const strategies = new Map();
  const observations = new Map();

  for (const sample of samples) {
    const strategy = String(sample.strategy || '');
    const observation = String(sample.observation || '');
    if (!strategy || !observation) throw new Error('Each sample requires strategy and observation.');
    const key = `${strategy}\u0000${observation}`;
    joint.set(key, (joint.get(key) || 0) + 1);
    strategies.set(strategy, (strategies.get(strategy) || 0) + 1);
    observations.set(observation, (observations.get(observation) || 0) + 1);
  }

  const total = samples.length;
  let information = 0;
  for (const [key, count] of joint) {
    const split = key.indexOf('\u0000');
    const strategy = key.slice(0, split);
    const observation = key.slice(split + 1);
    const pxy = count / total;
    const px = strategies.get(strategy) / total;
    const py = observations.get(observation) / total;
    information += pxy * Math.log2(pxy / (px * py));
  }
  return round(information);
}

const repeatPairs = pairs => pairs.flatMap(([strategy, observation, count = 4]) =>
  Array.from({ length: count }, () => ({ strategy, observation }))
);

export const OBSERVABILITY_MODELS = Object.freeze([
  Object.freeze({
    model_id: 'ACTIVE_BOUNDARY',
    label: 'Active boundary',
    claim: 'Synthetic contrastive defense emits strategy-specific observations.',
    samples: Object.freeze(repeatPairs([
      ['S_A', 'BLOCK_A'],
      ['S_B', 'BLOCK_B'],
      ['S_C', 'BLOCK_C']
    ]))
  }),
  Object.freeze({
    model_id: 'MINIMAL_DISCLOSURE',
    label: 'Minimal disclosure',
    claim: 'Two strategies collapse to one observable response while one remains distinguishable.',
    samples: Object.freeze(repeatPairs([
      ['S_A', 'NARROW_ACK'],
      ['S_B', 'NARROW_ACK'],
      ['S_C', 'HELD']
    ]))
  }),
  Object.freeze({
    model_id: 'NULL_CONTENT',
    label: 'Null content channel',
    claim: 'The modeled content channel emits the same symbol for every strategy.',
    samples: Object.freeze(repeatPairs([
      ['S_A', 'NO_EMISSION'],
      ['S_B', 'NO_EMISSION'],
      ['S_C', 'NO_EMISSION']
    ]))
  }),
  Object.freeze({
    model_id: 'NULL_WITH_SIDE_CHANNEL',
    label: 'Null content with side channel',
    claim: 'Content remains silent while a modeled timing class restores strategy information.',
    samples: Object.freeze(repeatPairs([
      ['S_A', 'NO_EMISSION_FAST'],
      ['S_B', 'NO_EMISSION_MEDIUM'],
      ['S_C', 'NO_EMISSION_SLOW']
    ]))
  })
]);

export function runObservabilityAssay() {
  const models = OBSERVABILITY_MODELS.map(model => ({
    model_id: model.model_id,
    label: model.label,
    claim: model.claim,
    mutual_information_bits: mutualInformationBits(model.samples),
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL'
  }));
  return Object.freeze({
    schema: 'td613.ash.a15-r0.observability-assay/v0.1',
    source_status: 'SIMULATED',
    sensor_id: 'deterministic-open-field-model',
    authority_class: 'A2_DERIVATIONAL',
    models,
    finding: 'Zero-content emission minimizes leakage only inside the modeled content channel; modeled side channels can reverse that result.',
    universal_zero_defense_claim_supported: false
  });
}

export const CANONICAL_TOPOLOGY = Object.freeze({
  nodes: Object.freeze(['custody', 'reference', 'question', 'relation', 'route', 'receipt', 'return']),
  edges: Object.freeze([
    'custody>reference',
    'reference>question',
    'question>relation',
    'relation>route',
    'route>receipt',
    'receipt>return',
    'return>custody'
  ])
});

export const RECONSTRUCTION_FRAGMENTS = Object.freeze([
  Object.freeze({ id: 'F01', nodes: ['custody', 'reference', 'question'], edges: ['custody>reference', 'reference>question'] }),
  Object.freeze({ id: 'F02', nodes: ['reference', 'question', 'relation'], edges: ['reference>question', 'question>relation'] }),
  Object.freeze({ id: 'F03', nodes: ['question', 'relation', 'route'], edges: ['question>relation', 'relation>route'] }),
  Object.freeze({ id: 'F04', nodes: ['relation', 'route', 'receipt'], edges: ['relation>route', 'route>receipt'] }),
  Object.freeze({ id: 'F05', nodes: ['route', 'receipt', 'return'], edges: ['route>receipt', 'receipt>return'] }),
  Object.freeze({ id: 'F06', nodes: ['receipt', 'return', 'custody'], edges: ['receipt>return', 'return>custody'] }),
  Object.freeze({ id: 'F07', nodes: ['return', 'custody', 'reference'], edges: ['return>custody', 'custody>reference'] }),
  Object.freeze({ id: 'F08', nodes: ['custody', 'question', 'relation', 'route', 'return'], edges: ['question>relation', 'relation>route', 'return>custody'] }),
  Object.freeze({ id: 'F09', nodes: ['reference', 'route', 'receipt', 'return'], edges: ['route>receipt', 'receipt>return'] })
]);

export function reconstructTopology(fragments) {
  const nodes = unique(fragments.flatMap(fragment => fragment.nodes || [])).sort();
  const edges = unique(fragments.flatMap(fragment => fragment.edges || [])).sort();
  return Object.freeze({ nodes, edges });
}

function setJaccard(left, right) {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  const union = new Set([...leftSet, ...rightSet]);
  if (union.size === 0) return 1;
  let intersection = 0;
  for (const value of leftSet) if (rightSet.has(value)) intersection += 1;
  return intersection / union.size;
}

export function topologySimilarity(candidate, canonical = CANONICAL_TOPOLOGY) {
  const nodeScore = setJaccard(candidate.nodes, canonical.nodes);
  const edgeScore = setJaccard(candidate.edges, canonical.edges);
  return round((nodeScore + edgeScore) / 2);
}

function cloneFragment(fragment) {
  return { id: fragment.id, nodes: [...fragment.nodes], edges: [...fragment.edges] };
}

export const ADMISSIBILITY_TRANSFORMS = Object.freeze({
  IDENTITY: fragments => fragments.map(cloneFragment),
  FRAGMENT_DROPOUT: fragments => fragments.filter((_, index) => ![1, 4, 7].includes(index)).map(cloneFragment),
  RELATION_DROPOUT: fragments => fragments.map((fragment, index) => ({
    id: fragment.id,
    nodes: [...fragment.nodes],
    edges: fragment.edges.filter((_, edgeIndex) => (index + edgeIndex) % 2 === 0)
  })),
  NODE_REDACTION: fragments => fragments.map((fragment, index) => ({
    id: fragment.id,
    nodes: fragment.nodes.filter(node => !(node === 'receipt' && index % 2 === 0)),
    edges: [...fragment.edges]
  })),
  BIASED_TRUNCATION: fragments => fragments.slice(0, 3).map(cloneFragment),
  ORDER_PERMUTATION: fragments => fragments.slice().reverse().map(cloneFragment)
});

export function runReconstructionAssay({ k = 4, epsilon = 0.2 } = {}) {
  const transforms = Object.entries(ADMISSIBILITY_TRANSFORMS).map(([operator_id, transform]) => {
    const transformed = transform(RECONSTRUCTION_FRAGMENTS);
    const reconstructed = reconstructTopology(transformed);
    const similarity = topologySimilarity(reconstructed);
    return {
      operator_id,
      fragments_remaining: transformed.length,
      topology_similarity: similarity,
      topology_distance: round(1 - similarity),
      within_epsilon: (1 - similarity) <= epsilon
    };
  });

  const subsets = combinations(RECONSTRUCTION_FRAGMENTS, k);
  const successful = subsets.filter(subset => (1 - topologySimilarity(reconstructTopology(subset))) <= epsilon).length;
  const rho = subsets.length ? successful / subsets.length : 0;
  const admissibilityScores = transforms
    .filter(result => result.operator_id !== 'IDENTITY')
    .map(result => result.topology_similarity);
  const ari = admissibilityScores.reduce((sum, value) => sum + value, 0) / admissibilityScores.length;

  return Object.freeze({
    schema: 'td613.ash.a15-r0.reconstruction-assay/v0.1',
    source_status: 'SIMULATED',
    sensor_id: 'deterministic-open-field-model',
    authority_class: 'A2_DERIVATIONAL',
    k,
    epsilon,
    subset_count: subsets.length,
    successful_subsets: successful,
    reconstructive_redundancy_rho: round(rho),
    anisotropic_reconstruction_invariance: round(ari),
    transforms,
    caveat: 'These scores characterize this deterministic synthetic topology only; they do not establish robustness of an external archive.'
  });
}

export function runDirectionalExposureAssay() {
  const inbound = Object.freeze([
    'query', 'route-state', 'source-posture', 'missingness', 'claim-ceiling', 'action-state',
    'receipt-state', 'relation-state', 'comparison-state', 'continuity-state', 'return-state', 'authority-state'
  ]);
  const outbound = Object.freeze(['world-answer', 'bounded-receipt', 'visible-state', 'declared-missingness']);
  return Object.freeze({
    schema: 'td613.ash.a15-r0.directional-exposure-assay/v0.1',
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    inbound_observable_dimensions: inbound.length,
    outbound_disclosed_dimensions: outbound.length,
    directional_exposure_ratio: round(inbound.length / outbound.length),
    metric_kind: 'declared-dimension-count proxy',
    shannon_channel_capacity_claim: false,
    finding: 'The preview models asymmetric disclosure, but this ratio is not a Shannon channel-capacity estimate.'
  });
}

export function runOpenResearchField() {
  return Object.freeze({
    schema: A15_R0_OPEN_FIELD_SCHEMA,
    namespace: 'U+10D613',
    source_status: 'SIMULATED',
    sensor_id: 'deterministic-open-field-model',
    authority_class: 'A2_DERIVATIONAL',
    production_mutated: false,
    external_transmission: false,
    human_selection_required: true,
    observability: runObservabilityAssay(),
    directional_exposure: runDirectionalExposureAssay(),
    reconstruction: runReconstructionAssay(),
    claim_ceiling: [
      'synthetic assay only',
      'no claim about hidden platform internals',
      'no universal zero-defense theorem',
      'no Shannon-capacity measurement',
      'no claim that arbitrary fragments reconstruct a corpus',
      'no production cutover or deployment authority'
    ]
  });
}
