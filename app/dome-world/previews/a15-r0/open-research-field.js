import { deepFreeze } from './a15-r0-contracts.js';

export const A15_R0_OPEN_FIELD_SCHEMA = 'td613.ash.a15-r0.open-research-field/v0.2';

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

export function matrixRank(matrix, tolerance = 1e-10) {
  const rows = matrix.map(row => row.map(Number));
  if (!rows.length || !rows[0]?.length) return 0;
  const width = rows[0].length;
  if (rows.some(row => row.length !== width)) throw new TypeError('Matrix rows must have equal width.');
  let rank = 0;
  for (let column = 0; column < width && rank < rows.length; column += 1) {
    let pivot = rank;
    for (let row = rank + 1; row < rows.length; row += 1) {
      if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) pivot = row;
    }
    if (Math.abs(rows[pivot][column]) <= tolerance) continue;
    [rows[rank], rows[pivot]] = [rows[pivot], rows[rank]];
    const divisor = rows[rank][column];
    for (let c = column; c < width; c += 1) rows[rank][c] /= divisor;
    for (let row = 0; row < rows.length; row += 1) {
      if (row === rank) continue;
      const factor = rows[row][column];
      for (let c = column; c < width; c += 1) rows[row][c] -= factor * rows[rank][c];
    }
    rank += 1;
  }
  return rank;
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

export const OBSERVABILITY_MODELS = deepFreeze([
  {
    model_id: 'ACTIVE_BOUNDARY',
    label: 'Active boundary',
    policy_family: 'ACTIVE',
    observer_model: 'CONTENT',
    claim: 'Synthetic contrastive defense emits strategy-specific observations.',
    samples: repeatPairs([
      ['S_A', 'BLOCK_A'],
      ['S_B', 'BLOCK_B'],
      ['S_C', 'BLOCK_C']
    ])
  },
  {
    model_id: 'MINIMAL_DISCLOSURE',
    label: 'Minimal disclosure',
    policy_family: 'MINIMAL',
    observer_model: 'CONTENT',
    claim: 'Two strategies collapse to one observable response while one remains distinguishable.',
    samples: repeatPairs([
      ['S_A', 'NARROW_ACK'],
      ['S_B', 'NARROW_ACK'],
      ['S_C', 'HELD']
    ])
  },
  {
    model_id: 'NULL_CONTENT',
    label: 'Null content channel',
    policy_family: 'NULL',
    observer_model: 'CONTENT_ONLY',
    claim: 'The modeled content channel emits the same symbol for every strategy.',
    samples: repeatPairs([
      ['S_A', 'NO_EMISSION'],
      ['S_B', 'NO_EMISSION'],
      ['S_C', 'NO_EMISSION']
    ])
  },
  {
    model_id: 'NULL_WITH_SIDE_CHANNEL',
    label: 'Null content with side channel',
    policy_family: 'NULL',
    observer_model: 'CONTENT_PLUS_TIMING_CLASS',
    claim: 'Content remains silent while a modeled timing class restores strategy information.',
    samples: repeatPairs([
      ['S_A', 'NO_EMISSION_FAST'],
      ['S_B', 'NO_EMISSION_MEDIUM'],
      ['S_C', 'NO_EMISSION_SLOW']
    ])
  }
]);

export function runObservabilityAssay() {
  const models = OBSERVABILITY_MODELS.map(model => ({
    model_id: model.model_id,
    label: model.label,
    policy_family: model.policy_family,
    observer_model: model.observer_model,
    claim: model.claim,
    mutual_information_bits: mutualInformationBits(model.samples),
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL'
  }));
  const nullPolicy = models.filter(model => model.policy_family === 'NULL');
  const nullLeakages = nullPolicy.map(model => model.mutual_information_bits);
  return deepFreeze({
    schema: 'td613.ash.a15-r0.observability-assay/v0.2',
    source_status: 'SIMULATED',
    sensor_id: 'deterministic-open-field-model',
    authority_class: 'A2_DERIVATIONAL',
    models,
    null_policy_best_case_information_bits: Math.min(...nullLeakages),
    null_policy_worst_case_information_bits: Math.max(...nullLeakages),
    null_policy_observer_model_gap_bits: round(Math.max(...nullLeakages) - Math.min(...nullLeakages)),
    observer_family_bounded: true,
    finding: 'Zero-content emission minimizes leakage only inside the modeled content channel; expanding the observer model to include a timing class reverses that result.',
    universal_zero_defense_claim_supported: false
  });
}

export function runRankLeakageNonEquivalenceAssay() {
  const scalarProjection = [[1, 2, 3]];
  const fullRankProjection = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];
  const scalarSamples = repeatPairs([
    ['S_A', '0'],
    ['S_B', '1'],
    ['S_C', '2']
  ]);
  const independentVectorSamples = ['S_A', 'S_B', 'S_C'].flatMap(strategy =>
    ['V0', 'V1', 'V2'].flatMap(observation =>
      Array.from({ length: 3 }, () => ({ strategy, observation }))
    )
  );
  const cases = [
    {
      case_id: 'RANK1_DISTINGUISHABLE_SCALAR',
      structural_rank: matrixRank(scalarProjection),
      mutual_information_bits: mutualInformationBits(scalarSamples),
      channel_posture: 'deterministic scalar observation distinguishes all three strategies'
    },
    {
      case_id: 'RANK3_OBSERVER_INDEPENDENT',
      structural_rank: matrixRank(fullRankProjection),
      mutual_information_bits: mutualInformationBits(independentVectorSamples),
      channel_posture: 'three-dimensional structural projection followed by observer-independent synthetic channel'
    }
  ];
  return deepFreeze({
    schema: 'td613.ash.a15-r0.rank-leakage-non-equivalence/v0.1',
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    cases,
    rank_orders_leakage: false,
    rank_is_secrecy_metric: false,
    finding: 'Structural projection rank and observer mutual information are non-equivalent: one scalar can distinguish multiple states, while a higher-rank structure can yield zero information under an independent observer channel.'
  });
}

export function runJoiningKeySynergyAssay() {
  const rows = [
    { strategy: 'S0', a: '0', b: '0' },
    { strategy: 'S0', a: '1', b: '1' },
    { strategy: 'S1', a: '0', b: '1' },
    { strategy: 'S1', a: '1', b: '0' }
  ].flatMap(row => Array.from({ length: 8 }, () => ({ ...row })));
  const featureA = rows.map(row => ({ strategy: row.strategy, observation: row.a }));
  const featureB = rows.map(row => ({ strategy: row.strategy, observation: row.b }));
  const joint = rows.map(row => ({ strategy: row.strategy, observation: `${row.a}:${row.b}` }));
  const informationA = mutualInformationBits(featureA);
  const informationB = mutualInformationBits(featureB);
  const informationJoint = mutualInformationBits(joint);
  const synergyProxy = round(informationJoint - informationA - informationB);
  return deepFreeze({
    schema: 'td613.ash.a15-r0.joining-key-synergy-assay/v0.1',
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    construction: 'balanced XOR fixture',
    feature_a_information_bits: informationA,
    feature_b_information_bits: informationB,
    joint_information_bits: informationJoint,
    joining_synergy_proxy_bits: synergyProxy,
    positive_joining_synergy: synergyProxy > 0,
    partial_information_decomposition_claim: false,
    intrinsic_curvature_claim: false,
    finding: 'Two individually uninformative synthetic features become fully informative when joined. Marginal safety therefore cannot stand in for joint reconstruction safety.',
    caveat: 'The excess-information quantity is a bounded synthetic synergy proxy, not a complete partial-information decomposition and not an intrinsic geometric curvature measurement.'
  });
}

export const CANONICAL_TOPOLOGY = deepFreeze({
  nodes: ['custody', 'reference', 'question', 'relation', 'route', 'receipt', 'return'],
  edges: [
    'custody>reference',
    'reference>question',
    'question>relation',
    'relation>route',
    'route>receipt',
    'receipt>return',
    'return>custody'
  ]
});

export const RECONSTRUCTION_FRAGMENTS = deepFreeze([
  { id: 'F01', nodes: ['custody', 'reference', 'question'], edges: ['custody>reference', 'reference>question'] },
  { id: 'F02', nodes: ['reference', 'question', 'relation'], edges: ['reference>question', 'question>relation'] },
  { id: 'F03', nodes: ['question', 'relation', 'route'], edges: ['question>relation', 'relation>route'] },
  { id: 'F04', nodes: ['relation', 'route', 'receipt'], edges: ['relation>route', 'route>receipt'] },
  { id: 'F05', nodes: ['route', 'receipt', 'return'], edges: ['route>receipt', 'receipt>return'] },
  { id: 'F06', nodes: ['receipt', 'return', 'custody'], edges: ['receipt>return', 'return>custody'] },
  { id: 'F07', nodes: ['return', 'custody', 'reference'], edges: ['return>custody', 'custody>reference'] },
  { id: 'F08', nodes: ['custody', 'question', 'relation', 'route', 'return'], edges: ['question>relation', 'relation>route', 'return>custody'] },
  { id: 'F09', nodes: ['reference', 'route', 'receipt', 'return'], edges: ['route>receipt', 'receipt>return'] }
]);

export function reconstructTopology(fragments) {
  const nodes = unique(fragments.flatMap(fragment => fragment.nodes || [])).sort();
  const edges = unique(fragments.flatMap(fragment => fragment.edges || [])).sort();
  return deepFreeze({ nodes, edges });
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

export const ADMISSIBILITY_TRANSFORMS = deepFreeze({
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
  if (!Number.isInteger(k) || k < 1 || k > RECONSTRUCTION_FRAGMENTS.length) {
    throw new TypeError(`Reconstruction k must be an integer from 1 through ${RECONSTRUCTION_FRAGMENTS.length}.`);
  }
  if (!Number.isFinite(epsilon) || epsilon < 0 || epsilon > 1) {
    throw new TypeError('Reconstruction epsilon must be a finite number from 0 through 1.');
  }

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
  const admissibilityResults = transforms.filter(result => result.operator_id !== 'IDENTITY');
  const admissibilityScores = admissibilityResults.map(result => result.topology_similarity);
  const ari = admissibilityScores.reduce((sum, value) => sum + value, 0) / admissibilityScores.length;
  const floor = Math.min(...admissibilityScores);
  const worst = admissibilityResults.find(result => result.topology_similarity === floor);

  return deepFreeze({
    schema: 'td613.ash.a15-r0.reconstruction-assay/v0.2',
    source_status: 'SIMULATED',
    sensor_id: 'deterministic-open-field-model',
    authority_class: 'A2_DERIVATIONAL',
    k,
    epsilon,
    subset_count: subsets.length,
    successful_subsets: successful,
    reconstructive_redundancy_rho: round(rho),
    anisotropic_reconstruction_invariance: round(ari),
    anisotropic_reconstruction_floor: round(floor),
    worst_case_transform: worst.operator_id,
    all_nonidentity_transforms_within_epsilon: admissibilityResults.every(result => result.within_epsilon),
    transforms,
    caveat: 'Mean ARI cannot erase a failing transform. These scores characterize this deterministic synthetic topology only; they do not establish robustness of an external archive.'
  });
}

export function runDirectionalExposureAssay() {
  const inbound = ['query', 'route-state', 'source-posture', 'missingness', 'claim-ceiling', 'action-state', 'receipt-state', 'relation-state', 'comparison-state', 'continuity-state', 'return-state', 'authority-state'];
  const outbound = ['world-answer', 'bounded-receipt', 'visible-state', 'declared-missingness'];
  return deepFreeze({
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
  return deepFreeze({
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
    rank_leakage_non_equivalence: runRankLeakageNonEquivalenceAssay(),
    joining_key_synergy: runJoiningKeySynergyAssay(),
    reconstruction: runReconstructionAssay(),
    claim_ceiling: [
      'synthetic assay only',
      'no claim about hidden platform internals',
      'no universal zero-defense theorem',
      'no Shannon-capacity measurement',
      'structural rank is not a secrecy metric',
      'joining synergy proxy is not intrinsic curvature or full PID',
      'no claim that arbitrary fragments reconstruct a corpus',
      'mean ARI cannot erase a failing transform',
      'no production cutover or deployment authority'
    ]
  });
}
