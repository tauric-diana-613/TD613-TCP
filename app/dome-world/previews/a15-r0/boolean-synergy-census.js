import { mutualInformationBits } from './open-research-field.js';

export const BOOLEAN_SYNERGY_CENSUS_SCHEMA = 'td613.ash.a15-r0.boolean-synergy-census/v0.1';

const round = value => Number(value.toFixed(6));
const INPUTS = Object.freeze([[0, 0], [0, 1], [1, 0], [1, 1]]);

function functionName(mask) {
  if (mask === 6) return 'XOR';
  if (mask === 9) return 'XNOR';
  if (mask === 8) return 'AND';
  if (mask === 14) return 'OR';
  if (mask === 1) return 'NOR';
  if (mask === 7) return 'NAND';
  return `F${String(mask).padStart(2, '0')}`;
}

function outputBit(mask, index) {
  return (mask >> index) & 1;
}

function information(rows, observer) {
  return mutualInformationBits(rows.map(row => ({
    strategy: `S${row.s}`,
    observation: observer(row)
  })));
}

export function evaluateBooleanFunction(mask) {
  if (!Number.isInteger(mask) || mask < 0 || mask > 15) throw new TypeError('Boolean function mask must be an integer from 0 through 15.');
  const rows = INPUTS.map(([a, b], index) => ({ a, b, s: outputBit(mask, index) }));
  const informationA = information(rows, row => `A${row.a}`);
  const informationB = information(rows, row => `B${row.b}`);
  const informationJoint = information(rows, row => `A${row.a}:B${row.b}`);
  const excess = round(informationJoint - informationA - informationB);
  const pureSynergy = informationA === 0 && informationB === 0 && informationJoint > 0;
  return Object.freeze({
    function_id: `F${String(mask).padStart(2, '0')}_${functionName(mask)}`,
    mask,
    truth_table_00_01_10_11: Object.freeze(rows.map(row => row.s)),
    feature_a_information_bits: informationA,
    feature_b_information_bits: informationB,
    joint_information_bits: informationJoint,
    joining_synergy_proxy_bits: excess,
    pure_synergy: pureSynergy,
    positive_excess: excess > 0,
    seed_parity_family: mask === 6 || mask === 9
  });
}

export function runBooleanSynergyCensus() {
  const functions = Object.freeze(Array.from({ length: 16 }, (_, mask) => evaluateBooleanFunction(mask)));
  const pure = functions.filter(item => item.pure_synergy);
  const positive = functions.filter(item => item.positive_excess);
  const heldOut = functions.filter(item => !item.seed_parity_family);
  const heldOutPositive = heldOut.filter(item => item.positive_excess);
  const maximumHeldOut = Math.max(...heldOut.map(item => item.joining_synergy_proxy_bits));

  return Object.freeze({
    schema: BOOLEAN_SYNERGY_CENSUS_SCHEMA,
    source_status: 'SIMULATED_EXHAUSTIVE_FINITE_CENSUS',
    authority_class: 'A2_DERIVATIONAL',
    source_distribution: 'uniform over all four binary input pairs',
    function_family: 'all 16 deterministic two-input one-output Boolean functions',
    function_count: functions.length,
    complete_declared_family: functions.length === 16,
    seed_parity_function_count: functions.filter(item => item.seed_parity_family).length,
    held_out_non_parity_function_count: heldOut.length,
    pure_synergy_count: pure.length,
    positive_excess_count: positive.length,
    positive_held_out_non_parity_count: heldOutPositive.length,
    nonpositive_excess_count: functions.length - positive.length,
    maximum_held_out_non_parity_excess_bits: round(maximumHeldOut),
    pure_synergy_function_ids: Object.freeze(pure.map(item => item.function_id)),
    positive_held_out_function_ids: Object.freeze(heldOutPositive.map(item => item.function_id)),
    functions,
    partial_information_decomposition_claim: false,
    generalization_beyond_declared_boolean_family: false,
    finding: 'Positive joint-information excess survives beyond the XOR/XNOR seed pair in the complete declared Boolean family, while pure zero-marginal synergy remains confined to XOR and XNOR under the uniform binary source.',
    caveat: 'This exhaustive result is exact only for the declared uniform deterministic 2x2 Boolean family. It does not establish empirical generalization, causal interaction, or a complete partial-information decomposition.'
  });
}
