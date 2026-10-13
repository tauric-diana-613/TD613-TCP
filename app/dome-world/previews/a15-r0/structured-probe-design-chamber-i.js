export const CHAMBER_I_COMBINATORICS_SCHEMA = 'td613.pedagogue.structured-probe-design.chamber-i-combinatorics/v0.1';
export const BASELINE_SOURCE_PACKET = '721de28a8ef4d160e87d46bc1e9107bd249a0db0';
export const BASELINE_RELOCK_SHA = '153f0a69a23ab7e665f2386a51406821b62be01d';
export const CHAMBER_I_FIXTURE_ID = 'PEDAGOGUE_STRUCTURED_PROBE_COVERAGE_MATCHED_BUDGET_V0_1';

export const RELATIONS = Object.freeze(['r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6']);

export const CYCLIC_LOCAL_BLOCKS = Object.freeze([
  Object.freeze(['r0', 'r1', 'r2']),
  Object.freeze(['r1', 'r2', 'r3']),
  Object.freeze(['r2', 'r3', 'r4']),
  Object.freeze(['r3', 'r4', 'r5']),
  Object.freeze(['r4', 'r5', 'r6']),
  Object.freeze(['r0', 'r5', 'r6']),
  Object.freeze(['r0', 'r1', 'r6'])
]);

export const FANO_BLOCKS = Object.freeze([
  Object.freeze(['r0', 'r1', 'r2']),
  Object.freeze(['r0', 'r3', 'r4']),
  Object.freeze(['r0', 'r5', 'r6']),
  Object.freeze(['r1', 'r3', 'r5']),
  Object.freeze(['r1', 'r4', 'r6']),
  Object.freeze(['r2', 'r3', 'r6']),
  Object.freeze(['r2', 'r4', 'r5'])
]);

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function exactScienceHead(value) {
  const head = String(value ?? '').trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(head)) throw new TypeError('scienceHead must be an exact 40-character Git SHA');
  return head;
}

function pairKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function allRelationPairs(relations) {
  const pairs = [];
  for (let i = 0; i < relations.length; i += 1) {
    for (let j = i + 1; j < relations.length; j += 1) pairs.push([relations[i], relations[j]]);
  }
  return pairs;
}

function validateBlocks(blocks, relations) {
  if (!Array.isArray(blocks) || blocks.length === 0) throw new TypeError('blocks must be a non-empty array');
  const allowed = new Set(relations);
  const seen = new Set();
  for (const [index, block] of blocks.entries()) {
    if (!Array.isArray(block) || block.length !== 3) throw new TypeError(`block ${index} must contain exactly 3 relations`);
    const unique = new Set(block);
    if (unique.size !== 3) throw new TypeError(`block ${index} contains a duplicate relation`);
    for (const relation of block) {
      if (!allowed.has(relation)) throw new TypeError(`block ${index} contains unknown relation ${relation}`);
    }
    const canonical = [...block].sort().join('|');
    if (seen.has(canonical)) throw new TypeError(`duplicate block ${canonical}`);
    seen.add(canonical);
  }
}

export function computeChamberIBlockCombinatorics(blocks, relations = RELATIONS) {
  validateBlocks(blocks, relations);
  const relationIndex = new Map(relations.map((relation, index) => [relation, index]));
  const degrees = Object.fromEntries(relations.map((relation) => [relation, 0]));
  const pairCounts = new Map(allRelationPairs(relations).map(([a, b]) => [pairKey(a, b), 0]));
  const matrix = relations.map(() => relations.map(() => 0));

  for (const block of blocks) {
    for (const relation of block) degrees[relation] += 1;
    for (let i = 0; i < block.length; i += 1) {
      for (let j = i + 1; j < block.length; j += 1) {
        const a = block[i];
        const b = block[j];
        const key = pairKey(a, b);
        pairCounts.set(key, pairCounts.get(key) + 1);
        const ai = relationIndex.get(a);
        const bi = relationIndex.get(b);
        matrix[ai][bi] += 1;
        matrix[bi][ai] += 1;
      }
    }
  }

  const pairLedger = allRelationPairs(relations).map(([a, b]) => deepFreeze({
    pair: deepFreeze([a, b]),
    multiplicity: pairCounts.get(pairKey(a, b))
  }));
  const histogram = {};
  for (const entry of pairLedger) histogram[entry.multiplicity] = (histogram[entry.multiplicity] ?? 0) + 1;
  const uncoveredPairs = pairLedger.filter((entry) => entry.multiplicity === 0).map((entry) => entry.pair);
  const duplicatedPairs = pairLedger.filter((entry) => entry.multiplicity > 1).map((entry) => entry.pair);
  const pairDuplicateExcess = pairLedger.reduce((sum, entry) => sum + Math.max(0, entry.multiplicity - 1), 0);
  const blockSizeSet = new Set(blocks.map((block) => block.length));

  return deepFreeze({
    blocks: blocks.map((block) => [...block]),
    block_count: blocks.length,
    unique_block_count: new Set(blocks.map((block) => [...block].sort().join('|'))).size,
    block_size: blockSizeSet.size === 1 ? [...blockSizeSet][0] : null,
    incidence_slots: blocks.reduce((sum, block) => sum + block.length, 0),
    relation_degrees: degrees,
    pair_incidence_matrix: matrix,
    pair_incidence_ledger: pairLedger,
    pair_incidence_histogram: histogram,
    uncovered_pairs: uncoveredPairs,
    uncovered_pair_count: uncoveredPairs.length,
    duplicated_pairs: duplicatedPairs,
    duplicate_pair_count: duplicatedPairs.length,
    pair_duplicate_excess: pairDuplicateExcess,
    maximum_pair_multiplicity: Math.max(...pairLedger.map((entry) => entry.multiplicity)),
    perfect_pair_balance: new Set(pairLedger.map((entry) => entry.multiplicity)).size === 1
  });
}

export function compileChamberICombinatorialReceipt({ scienceHead }) {
  const cyclic = computeChamberIBlockCombinatorics(CYCLIC_LOCAL_BLOCKS);
  const fano = computeChamberIBlockCombinatorics(FANO_BLOCKS);
  const degreeVector = (receipt) => RELATIONS.map((relation) => receipt.relation_degrees[relation]);

  const matched = deepFreeze({
    probe_count: cyclic.block_count === fano.block_count,
    unique_probe_count: cyclic.unique_block_count === fano.unique_block_count,
    block_size: cyclic.block_size === fano.block_size,
    incidence_slots: cyclic.incidence_slots === fano.incidence_slots,
    first_order_relation_degree: JSON.stringify(degreeVector(cyclic)) === JSON.stringify(degreeVector(fano)),
    all_required_first_order_controls_match: false
  });
  const matchedResolved = deepFreeze({
    ...matched,
    all_required_first_order_controls_match: Object.entries(matched)
      .filter(([key]) => key !== 'all_required_first_order_controls_match')
      .every(([, value]) => value === true)
  });

  return deepFreeze({
    schema: CHAMBER_I_COMBINATORICS_SCHEMA,
    stage: 'CHAMBER_I_EXACT_COMBINATORICS',
    status: 'STRUCTURAL_RECEIPT_ONLY_NO_OPERATOR_VERDICT',
    science_head: exactScienceHead(scienceHead),
    baseline_source_packet: BASELINE_SOURCE_PACKET,
    baseline_relock_sha: BASELINE_RELOCK_SHA,
    fixture_id: CHAMBER_I_FIXTURE_ID,
    relation_universe: [...RELATIONS],
    schedules: {
      CYCLIC_LOCAL_DIVERSITY: cyclic,
      FANO_CONTROLLED_INCIDENCE: fano
    },
    matched_first_order_controls: matchedResolved,
    hostile_centered_fano_block_identity: {
      blocks_identical_to_fano: true,
      operator_geometry_evaluated: false,
      nullspace_claim_evaluated: false
    },
    structural_relations_only: {
      first_order_exposure_equivalent: matchedResolved.first_order_relation_degree,
      pair_incidence_structure_equivalent: JSON.stringify(cyclic.pair_incidence_histogram) === JSON.stringify(fano.pair_incidence_histogram)
    },
    scientific_verdict: 'NOT_EVALUATED_STAGE_1',
    scalar_winner: null,
    operator_geometry_authority: false,
    promotion_authority: false,
    production_mutated: false,
    vercel_authority: false,
    human_closure_required: true
  });
}
