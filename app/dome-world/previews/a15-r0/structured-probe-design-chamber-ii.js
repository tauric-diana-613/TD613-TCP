export const CHAMBER_II_STRUCTURAL_SCHEMA = 'td613.pedagogue.structured-probe-coverage.chamber-ii-structural/v0.1';
export const CHAMBER_II_FIXTURE_ID = 'PEDAGOGUE_STRUCTURED_PROBE_COVERAGE_V0_1';
export const BASELINE_SOURCE_PACKET = '721de28a8ef4d160e87d46bc1e9107bd249a0db0';
export const BASELINE_RELOCK_SHA = '153f0a69a23ab7e665f2386a51406821b62be01d';
export const CHANNELS = Object.freeze(['A','B','C','D','E','F','G','H','I']);

export const S_BLOCKS = Object.freeze(['ABC','DEF','GHI','ADG','BEH','CFI','AEI','CDH','BFG','AFH','BDI','CEG']);
export const A_BLOCKS = Object.freeze(['CDH','BGH','AHI','BEF','ABE','ACF','EFG','CGI','DFH','ADG','BDI','DEG']);
export const H_BLOCKS = Object.freeze(['CGH','ACD','FGH','ABD','BFI','ADG','BCD','CEF','BEI','EFH','GHI','AEI']);

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

function exactHead(value) {
  const head = String(value ?? '').trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(head)) throw new TypeError('scienceHead must be an exact 40-character Git SHA');
  return head;
}

function allPairs() {
  const pairs = [];
  for (let i = 0; i < CHANNELS.length; i += 1) {
    for (let j = i + 1; j < CHANNELS.length; j += 1) pairs.push(`${CHANNELS[i]}${CHANNELS[j]}`);
  }
  return pairs;
}

function pairsOf(block) {
  const chars = [...block].sort();
  return [`${chars[0]}${chars[1]}`, `${chars[0]}${chars[2]}`, `${chars[1]}${chars[2]}`];
}

function validate(blocks) {
  if (!Array.isArray(blocks) || blocks.length !== 12) throw new TypeError('schedule must contain exactly 12 blocks');
  if (new Set(blocks).size !== 12) throw new TypeError('schedule blocks must be distinct');
  const allowed = new Set(CHANNELS);
  for (const block of blocks) {
    if (typeof block !== 'string' || block.length !== 3) throw new TypeError('each block must contain exactly 3 channels');
    const chars = [...block];
    if (new Set(chars).size !== 3) throw new TypeError(`duplicate channel inside block ${block}`);
    if (chars.some((item) => !allowed.has(item))) throw new TypeError(`unknown channel inside block ${block}`);
  }
}

function rank(matrix, tolerance = 1e-12) {
  const work = matrix.map((row) => row.map(Number));
  let pivotRow = 0;
  for (let column = 0; column < work[0].length && pivotRow < work.length; column += 1) {
    let pivot = pivotRow;
    for (let row = pivotRow + 1; row < work.length; row += 1) {
      if (Math.abs(work[row][column]) > Math.abs(work[pivot][column])) pivot = row;
    }
    if (Math.abs(work[pivot][column]) <= tolerance) continue;
    [work[pivotRow], work[pivot]] = [work[pivot], work[pivotRow]];
    const divisor = work[pivotRow][column];
    for (let c = column; c < work[pivotRow].length; c += 1) work[pivotRow][c] /= divisor;
    for (let row = 0; row < work.length; row += 1) {
      if (row === pivotRow) continue;
      const factor = work[row][column];
      if (Math.abs(factor) <= tolerance) continue;
      for (let c = column; c < work[row].length; c += 1) work[row][c] -= factor * work[pivotRow][c];
    }
    pivotRow += 1;
  }
  return pivotRow;
}

function rowGram(matrix) {
  return matrix.map((left) => matrix.map((right) => left.reduce((sum, value, index) => sum + value * right[index], 0)));
}

function jacobiEigenvalues(matrix, tolerance = 1e-14, maxSweeps = 300) {
  const a = matrix.map((row) => row.map(Number));
  const n = a.length;
  for (let sweep = 0; sweep < maxSweeps * n * n; sweep += 1) {
    let p = 0;
    let q = 1;
    let max = 0;
    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        const magnitude = Math.abs(a[i][j]);
        if (magnitude > max) { max = magnitude; p = i; q = j; }
      }
    }
    if (max <= tolerance) break;
    const app = a[p][p];
    const aqq = a[q][q];
    const apq = a[p][q];
    const theta = 0.5 * Math.atan2(2 * apq, aqq - app);
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    for (let k = 0; k < n; k += 1) {
      if (k === p || k === q) continue;
      const akp = a[k][p];
      const akq = a[k][q];
      a[k][p] = c * akp - s * akq;
      a[p][k] = a[k][p];
      a[k][q] = s * akp + c * akq;
      a[q][k] = a[k][q];
    }
    a[p][p] = c*c*app - 2*s*c*apq + s*s*aqq;
    a[q][q] = s*s*app + 2*s*c*apq + c*c*aqq;
    a[p][q] = 0;
    a[q][p] = 0;
  }
  return a.map((row, index) => row[index]).sort((x, y) => y - x);
}

function round15(value) {
  const out = Number(Number(value).toFixed(15));
  return Object.is(out, -0) ? 0 : out;
}

function rowSpaceGeometry(matrix) {
  const gram = rowGram(matrix);
  const eigenvalues = jacobiEigenvalues(gram).map((value) => Math.max(0, Math.abs(value) < 1e-13 ? 0 : value));
  const singular = eigenvalues.map(Math.sqrt).sort((a,b) => b-a).map(round15);
  const positive = singular.filter((value) => value > 1e-10);
  return freeze({
    row_gram_matrix: gram,
    nonzero_singular_values: positive,
    row_space_condition_number: round15(positive[0] / positive[positive.length - 1])
  });
}

export function computeChamberIIStructure(blocks) {
  validate(blocks);
  const pairs = allPairs();
  const pairIndex = new Map(pairs.map((pair, index) => [pair, index]));
  const degree = Object.fromEntries(CHANNELS.map((channel) => [channel, 0]));
  const multiplicity = Object.fromEntries(pairs.map((pair) => [pair, 0]));
  const matrix = blocks.map(() => Array(pairs.length).fill(0));

  blocks.forEach((block, row) => {
    for (const channel of block) degree[channel] += 1;
    for (const pair of pairsOf(block)) {
      multiplicity[pair] += 1;
      matrix[row][pairIndex.get(pair)] = 1;
    }
  });

  const degrees = CHANNELS.map((channel) => degree[channel]);
  const mean = degrees.reduce((sum, value) => sum + value, 0) / degrees.length;
  const variance = degrees.reduce((sum, value) => sum + (value - mean) ** 2, 0) / degrees.length;
  const uncovered = pairs.filter((pair) => multiplicity[pair] === 0);
  const duplicateExcess = pairs.reduce((sum, pair) => sum + Math.max(0, multiplicity[pair] - 1), 0);
  const signatures = Object.fromEntries(pairs.map((pair, column) => [pair, matrix.map((row) => row[column]).join('')]));
  const nonzero = pairs.filter((pair) => signatures[pair].includes('1'));
  const groups = new Map();
  for (const pair of nonzero) {
    const signature = signatures[pair];
    groups.set(signature, [...(groups.get(signature) ?? []), pair]);
  }
  const uniquePairs = nonzero.filter((pair) => groups.get(signatures[pair]).length === 1);
  const ambiguousPairs = nonzero.filter((pair) => groups.get(signatures[pair]).length > 1);
  const histogram = {};
  for (const pair of pairs) histogram[multiplicity[pair]] = (histogram[multiplicity[pair]] ?? 0) + 1;
  const geometry = rowSpaceGeometry(matrix);

  return freeze({
    blocks: [...blocks],
    unique_block_count: new Set(blocks).size,
    point_degree_vector: degrees,
    point_degree_variance: round15(variance),
    pair_multiplicity_ledger: multiplicity,
    pair_multiplicity_histogram: histogram,
    covered_pair_count: pairs.length - uncovered.length,
    uncovered_pair_count: uncovered.length,
    uncovered_pairs: uncovered,
    pair_duplicate_excess: duplicateExcess,
    maximum_pair_multiplicity: Math.max(...Object.values(multiplicity)),
    incidence_matrix: matrix,
    row_rank: rank(matrix),
    ...geometry,
    pair_signature_ledger: signatures,
    distinct_nonzero_signature_count: groups.size,
    uniquely_localizable_pair_count: uniquePairs.length,
    uniquely_localizable_pairs: uniquePairs,
    ambiguous_detected_pair_count: ambiguousPairs.length,
    ambiguous_detected_pairs: ambiguousPairs
  });
}

export function compileChamberIIStructuralReceipt({ scienceHead }) {
  const S = computeChamberIIStructure(S_BLOCKS);
  const A = computeChamberIIStructure(A_BLOCKS);
  const H = computeChamberIIStructure(H_BLOCKS);
  return freeze({
    schema: CHAMBER_II_STRUCTURAL_SCHEMA,
    stage: 'CHAMBER_II_EXACT_INCIDENCE_GEOMETRY',
    status: 'STRUCTURAL_RECEIPT_ONLY_NO_PERTURBATION_SWEEP',
    science_head: exactHead(scienceHead),
    baseline_source_packet: BASELINE_SOURCE_PACKET,
    baseline_relock_sha: BASELINE_RELOCK_SHA,
    fixture_id: CHAMBER_II_FIXTURE_ID,
    target_pair_count: 36,
    matched_budget: {
      distinct_probe_count: 12,
      probe_cardinality: 3,
      replicates_per_probe: 25,
      total_micro_observations: 300,
      all_arms_matched: true
    },
    arms: { S, A, H },
    bounded_relations: {
      controlled_incidence_covers_all_declared_pairs: S.covered_pair_count === 36,
      point_marginal_balance_is_insufficient_for_target_pair_coverage: H.point_degree_variance === 0 && H.uncovered_pair_count > 0,
      full_row_rank_is_insufficient_for_complete_target_relation_coverage: H.row_rank === 12 && H.uncovered_pair_count > 0,
      complete_coverage_does_not_yet_establish_exact_localization: S.covered_pair_count === 36 && S.uniquely_localizable_pair_count === 0
    },
    decoder_executed: false,
    scalar_winner: null,
    promotion_authority: false,
    production_mutated: false,
    vercel_authority: false,
    human_closure_required: true
  });
}
