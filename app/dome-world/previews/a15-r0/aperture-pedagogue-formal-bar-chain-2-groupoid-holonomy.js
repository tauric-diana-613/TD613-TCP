import {
  transportIncrementCocycle,
} from './aperture-pedagogue-affine-transport-increment-cocycle.js';
import {
  normalizeBar2Chain,
  addBar2Chains,
  scaleBar2Chain,
  boundaryOfBar3Chain,
} from './aperture-pedagogue-bar-h2-period-return-representation.js';
import {
  boundaryOfBar2Chain,
  relationBarCycle,
  T_COORDINATE,
  Q_COORDINATE,
} from './aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.js';
import {
  boundaryFramedRelativeBar2Pairing,
  relativeBar2Rezeroing,
} from './aperture-pedagogue-boundary-framed-relative-bar-2-pairing.js';
import {
  defaultOpenCellPhi,
} from './aperture-pedagogue-open-bar-2-cell-gauge-covariance-seam-cancellation.js';
import {
  finiteBoundaryFraming,
} from './aperture-pedagogue-separately-framed-bar-2-gluing-seam-defect.js';

export const FORMAL_BAR_CHAIN_TWO_GROUPOID_HOLONOMY_SCHEMA = 'td613.a15-r0.formal-bar-chain-2-groupoid-holonomy/v0.1';
export const FORMAL_BAR_CHAIN_TWO_GROUPOID_HOLONOMY_PARENT_RECEIPT = '05fb09366ad2dcfd631013d786dd0f41083aae7b';
export const FORMAL_BAR_CHAIN_TWO_GROUPOID_HOLONOMY_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const UNIT = freeze({ t: 0, E: 0, O: 0 });
const canonicalInteger = (value) => (value === 0 ? 0 : value);

function validBase(base) {
  if (!base || typeof base !== 'object') return false;
  const keys = Object.keys(base).sort();
  if (JSON.stringify(keys) !== JSON.stringify(['E', 'O', 't'])) return false;
  return [base.t, base.E, base.O].every((n) => Number.isInteger(n) && n >= 0);
}

function sameBase(a, b) {
  return validBase(a) && validBase(b)
    && a.t === b.t && a.E === b.E && a.O === b.O;
}

function isUnit(base) {
  return sameBase(base, UNIT);
}

function baseKey(base) {
  return validBase(base) ? JSON.stringify([base.t, base.E, base.O]) : null;
}

function compareBase(a, b) {
  if (a.t !== b.t) return a.t - b.t;
  if (a.E !== b.E) return a.E - b.E;
  return a.O - b.O;
}

export function normalizeFormalBar1Chain(terms = []) {
  if (!Array.isArray(terms)) {
    return freeze({ status: 'FORMAL_BAR_1_CHAIN_NORMALIZATION_ABSTAINS' });
  }
  const grouped = new Map();
  for (const term of terms) {
    if (!term || !validBase(term.coordinate) || !Number.isInteger(term.coefficient)) {
      return freeze({ status: 'FORMAL_BAR_1_CHAIN_NORMALIZATION_ABSTAINS' });
    }
    if (isUnit(term.coordinate) && term.coefficient !== 0) {
      return freeze({ status: 'FORMAL_BAR_1_CHAIN_REJECTS_NORMALIZED_UNIT_BASIS_TERM' });
    }
    if (term.coefficient === 0 || isUnit(term.coordinate)) continue;
    const key = baseKey(term.coordinate);
    const previous = grouped.get(key) ?? { coordinate: term.coordinate, coefficient: 0 };
    previous.coefficient = canonicalInteger(previous.coefficient + term.coefficient);
    grouped.set(key, previous);
  }
  const chain = [...grouped.values()]
    .filter((term) => term.coefficient !== 0)
    .sort((a, b) => compareBase(a.coordinate, b.coordinate))
    .map((term) => freeze({
      coefficient: canonicalInteger(term.coefficient),
      coordinate: freeze({ ...term.coordinate }),
    }));
  return freeze({
    status: 'FORMAL_BAR_1_CHAIN_NORMALIZED',
    chain: freeze(chain),
    is_zero: chain.length === 0,
  });
}

export function addFormalBar1Chains(left, right) {
  const a = normalizeFormalBar1Chain(left);
  const b = normalizeFormalBar1Chain(right);
  if (a.status !== 'FORMAL_BAR_1_CHAIN_NORMALIZED'
      || b.status !== 'FORMAL_BAR_1_CHAIN_NORMALIZED') {
    return freeze({ status: 'FORMAL_BAR_1_CHAIN_ADDITION_ABSTAINS' });
  }
  return normalizeFormalBar1Chain([...a.chain, ...b.chain]);
}

export function scaleFormalBar1Chain(chain, scalar) {
  const normalized = normalizeFormalBar1Chain(chain);
  if (normalized.status !== 'FORMAL_BAR_1_CHAIN_NORMALIZED' || !Number.isInteger(scalar)) {
    return freeze({ status: 'FORMAL_BAR_1_CHAIN_SCALING_ABSTAINS' });
  }
  return normalizeFormalBar1Chain(normalized.chain.map((term) => ({
    coordinate: term.coordinate,
    coefficient: scalar * term.coefficient,
  })));
}

export function subtractFormalBar1Chains(left, right) {
  const negative = scaleFormalBar1Chain(right, -1);
  if (negative.status !== 'FORMAL_BAR_1_CHAIN_NORMALIZED') {
    return freeze({ status: 'FORMAL_BAR_1_CHAIN_SUBTRACTION_ABSTAINS' });
  }
  return addFormalBar1Chains(left, negative.chain);
}

export function sameFormalBar1Chain(left, right) {
  const a = normalizeFormalBar1Chain(left);
  const b = normalizeFormalBar1Chain(right);
  if (a.status !== 'FORMAL_BAR_1_CHAIN_NORMALIZED'
      || b.status !== 'FORMAL_BAR_1_CHAIN_NORMALIZED') return false;
  return JSON.stringify(a.chain) === JSON.stringify(b.chain);
}

function boundaryAsBar1Chain(boundary) {
  if (boundary?.status !== 'NORMALIZED_BAR_2_BOUNDARY_DERIVED') {
    return freeze({ status: 'FORMAL_BAR_1_CHAIN_FROM_BOUNDARY_ABSTAINS' });
  }
  return normalizeFormalBar1Chain(boundary.terms.map((term) => ({
    coordinate: term.coordinate,
    coefficient: term.coefficient,
  })));
}

function sameNormalizedBar2Chain(left, right) {
  const a = normalizeBar2Chain(left);
  const b = normalizeBar2Chain(right);
  if (a.status !== 'BAR_2_CHAIN_NORMALIZED' || b.status !== 'BAR_2_CHAIN_NORMALIZED') return false;
  const core = (chain) => chain.map((term) => ({
    coefficient: canonicalInteger(term.coefficient),
    left: [term.left.t, term.left.E, term.left.O],
    right: [term.right.t, term.right.E, term.right.O],
  }));
  return JSON.stringify(core(a.chain)) === JSON.stringify(core(b.chain));
}

function oneBar1Term(coordinate, coefficient = 1) {
  return freeze([freeze({ coordinate, coefficient })]);
}

function oneBar2Term(left, right, coefficient = 1, label = null) {
  return freeze([freeze({ left, right, coefficient, label })]);
}

export function formalBar2Cell({ chain, source, target } = {}) {
  const normalizedChain = normalizeBar2Chain(chain);
  const normalizedSource = normalizeFormalBar1Chain(source);
  const normalizedTarget = normalizeFormalBar1Chain(target);
  if (normalizedChain.status !== 'BAR_2_CHAIN_NORMALIZED'
      || normalizedSource.status !== 'FORMAL_BAR_1_CHAIN_NORMALIZED'
      || normalizedTarget.status !== 'FORMAL_BAR_1_CHAIN_NORMALIZED') {
    return freeze({ status: 'FORMAL_BAR_TWO_CELL_ABSTAINS' });
  }
  const boundary = boundaryOfBar2Chain(normalizedChain.chain);
  const boundaryChain = boundaryAsBar1Chain(boundary);
  const declaredDifference = subtractFormalBar1Chains(normalizedSource.chain, normalizedTarget.chain);
  if (boundaryChain.status !== 'FORMAL_BAR_1_CHAIN_NORMALIZED'
      || declaredDifference.status !== 'FORMAL_BAR_1_CHAIN_NORMALIZED') {
    return freeze({ status: 'FORMAL_BAR_TWO_CELL_ABSTAINS' });
  }
  if (!sameFormalBar1Chain(boundaryChain.chain, declaredDifference.chain)) {
    return freeze({
      status: 'FORMAL_BAR_TWO_CELL_REJECTS_SOURCE_TARGET_BOUNDARY_MISMATCH',
      chain: normalizedChain.chain,
      source: normalizedSource.chain,
      target: normalizedTarget.chain,
      derived_boundary: boundaryChain.chain,
      declared_source_minus_target: declaredDifference.chain,
    });
  }
  return freeze({
    status: 'FORMAL_BAR_TWO_CELL_DERIVED',
    chain: normalizedChain.chain,
    source: normalizedSource.chain,
    target: normalizedTarget.chain,
    boundary: boundaryChain.chain,
    closed: sameFormalBar1Chain(normalizedSource.chain, normalizedTarget.chain),
    jurisdiction: 'FORMAL_LINEARIZED_BAR_CHAIN_ONLY',
    operational_path_authority: false,
  });
}

export function formalBar2CellFromSource(chain, source) {
  const normalizedChain = normalizeBar2Chain(chain);
  const normalizedSource = normalizeFormalBar1Chain(source);
  if (normalizedChain.status !== 'BAR_2_CHAIN_NORMALIZED'
      || normalizedSource.status !== 'FORMAL_BAR_1_CHAIN_NORMALIZED') {
    return freeze({ status: 'FORMAL_BAR_TWO_CELL_FROM_SOURCE_ABSTAINS' });
  }
  const boundary = boundaryOfBar2Chain(normalizedChain.chain);
  const boundaryChain = boundaryAsBar1Chain(boundary);
  if (boundaryChain.status !== 'FORMAL_BAR_1_CHAIN_NORMALIZED') {
    return freeze({ status: 'FORMAL_BAR_TWO_CELL_FROM_SOURCE_ABSTAINS' });
  }
  const target = subtractFormalBar1Chains(normalizedSource.chain, boundaryChain.chain);
  if (target.status !== 'FORMAL_BAR_1_CHAIN_NORMALIZED') {
    return freeze({ status: 'FORMAL_BAR_TWO_CELL_FROM_SOURCE_ABSTAINS' });
  }
  return formalBar2Cell({
    chain: normalizedChain.chain,
    source: normalizedSource.chain,
    target: target.chain,
  });
}

export function identityFormalBar2Cell(oneCell = []) {
  const normalized = normalizeFormalBar1Chain(oneCell);
  if (normalized.status !== 'FORMAL_BAR_1_CHAIN_NORMALIZED') {
    return freeze({ status: 'FORMAL_BAR_TWO_IDENTITY_ABSTAINS' });
  }
  return formalBar2Cell({ chain: [], source: normalized.chain, target: normalized.chain });
}

export function inverseFormalBar2Cell(cell) {
  if (cell?.status !== 'FORMAL_BAR_TWO_CELL_DERIVED') {
    return freeze({ status: 'FORMAL_BAR_TWO_INVERSE_ABSTAINS' });
  }
  const negative = scaleBar2Chain(cell.chain, -1);
  if (negative.status !== 'BAR_2_CHAIN_NORMALIZED') {
    return freeze({ status: 'FORMAL_BAR_TWO_INVERSE_ABSTAINS' });
  }
  return formalBar2Cell({
    chain: negative.chain,
    source: cell.target,
    target: cell.source,
  });
}

export function verticalComposeFormalBar2Cells(first, second) {
  if (first?.status !== 'FORMAL_BAR_TWO_CELL_DERIVED'
      || second?.status !== 'FORMAL_BAR_TWO_CELL_DERIVED') {
    return freeze({ status: 'FORMAL_BAR_TWO_VERTICAL_COMPOSITION_ABSTAINS' });
  }
  if (!sameFormalBar1Chain(first.target, second.source)) {
    return freeze({
      status: 'FORMAL_BAR_TWO_VERTICAL_COMPOSITION_REJECTS_MIDDLE_ONE_CELL_MISMATCH',
      first_target: first.target,
      second_source: second.source,
    });
  }
  const sum = addBar2Chains(first.chain, second.chain);
  if (sum.status !== 'BAR_2_CHAIN_NORMALIZED') {
    return freeze({ status: 'FORMAL_BAR_TWO_VERTICAL_COMPOSITION_ABSTAINS' });
  }
  const composed = formalBar2Cell({
    chain: sum.chain,
    source: first.source,
    target: second.target,
  });
  if (composed.status !== 'FORMAL_BAR_TWO_CELL_DERIVED') return composed;
  return freeze({
    ...composed,
    status: 'FORMAL_BAR_TWO_VERTICAL_COMPOSITION_DERIVED',
    first,
    second,
  });
}

export function horizontalComposeFormalBar2Cells(left, right) {
  if (left?.status !== 'FORMAL_BAR_TWO_CELL_DERIVED'
      || right?.status !== 'FORMAL_BAR_TWO_CELL_DERIVED') {
    return freeze({ status: 'FORMAL_BAR_TWO_HORIZONTAL_COMPOSITION_ABSTAINS' });
  }
  const sum = addBar2Chains(left.chain, right.chain);
  const source = addFormalBar1Chains(left.source, right.source);
  const target = addFormalBar1Chains(left.target, right.target);
  if (sum.status !== 'BAR_2_CHAIN_NORMALIZED'
      || source.status !== 'FORMAL_BAR_1_CHAIN_NORMALIZED'
      || target.status !== 'FORMAL_BAR_1_CHAIN_NORMALIZED') {
    return freeze({ status: 'FORMAL_BAR_TWO_HORIZONTAL_COMPOSITION_ABSTAINS' });
  }
  const composed = formalBar2Cell({ chain: sum.chain, source: source.chain, target: target.chain });
  if (composed.status !== 'FORMAL_BAR_TWO_CELL_DERIVED') return composed;
  return freeze({
    ...composed,
    status: 'FORMAL_BAR_TWO_HORIZONTAL_COMPOSITION_DERIVED',
    left,
    right,
  });
}

function asDerivedCell(result) {
  if (!result || typeof result !== 'object') return null;
  if (result.status === 'FORMAL_BAR_TWO_CELL_DERIVED') return result;
  if (result.status === 'FORMAL_BAR_TWO_VERTICAL_COMPOSITION_DERIVED'
      || result.status === 'FORMAL_BAR_TWO_HORIZONTAL_COMPOSITION_DERIVED') {
    return freeze({
      status: 'FORMAL_BAR_TWO_CELL_DERIVED',
      chain: result.chain,
      source: result.source,
      target: result.target,
      boundary: result.boundary,
      closed: result.closed,
      jurisdiction: result.jurisdiction,
      operational_path_authority: false,
    });
  }
  return null;
}

export function bar3RepresentativeShift(cell, bar3Chain) {
  const baseCell = asDerivedCell(cell);
  if (!baseCell) return freeze({ status: 'FORMAL_BAR_TWO_REPRESENTATIVE_SHIFT_ABSTAINS' });
  const b3Boundary = boundaryOfBar3Chain(bar3Chain);
  if (b3Boundary.status !== 'NORMALIZED_BAR_3_BOUNDARY_DERIVED') {
    return freeze({ status: 'FORMAL_BAR_TWO_REPRESENTATIVE_SHIFT_ABSTAINS' });
  }
  const shifted = addBar2Chains(baseCell.chain, b3Boundary.chain);
  if (shifted.status !== 'BAR_2_CHAIN_NORMALIZED') {
    return freeze({ status: 'FORMAL_BAR_TWO_REPRESENTATIVE_SHIFT_ABSTAINS' });
  }
  const shiftedCell = formalBar2Cell({
    chain: shifted.chain,
    source: baseCell.source,
    target: baseCell.target,
  });
  return freeze({
    status: shiftedCell.status === 'FORMAL_BAR_TWO_CELL_DERIVED'
      ? 'FORMAL_BAR_TWO_REPRESENTATIVE_SHIFT_DERIVED'
      : 'FORMAL_BAR_TWO_REPRESENTATIVE_SHIFT_FAILED',
    original: baseCell,
    bar3_boundary: b3Boundary,
    shifted: shiftedCell,
    source_preserved: shiftedCell.status === 'FORMAL_BAR_TWO_CELL_DERIVED'
      && sameFormalBar1Chain(baseCell.source, shiftedCell.source),
    target_preserved: shiftedCell.status === 'FORMAL_BAR_TWO_CELL_DERIVED'
      && sameFormalBar1Chain(baseCell.target, shiftedCell.target),
  });
}

function translation(offset) {
  if (!Number.isInteger(offset)) return null;
  return freeze({
    offset: canonicalInteger(offset),
    apply: (n) => (Number.isInteger(n) ? canonicalInteger(n + offset) : null),
  });
}

function normalizedFraming(lambda) {
  return typeof lambda === 'function' && Number.isInteger(lambda(UNIT)) && lambda(UNIT) === 0;
}

export function formalBar2Transport(
  cell,
  lambda = finiteBoundaryFraming([]),
  cochain = transportIncrementCocycle,
) {
  const baseCell = asDerivedCell(cell);
  if (!baseCell || !normalizedFraming(lambda) || typeof cochain !== 'function') {
    return freeze({ status: 'FORMAL_BAR_TWO_TRANSPORT_ABSTAINS' });
  }
  const relative = boundaryFramedRelativeBar2Pairing(baseCell.chain, lambda, cochain);
  if (relative.status !== 'BOUNDARY_FRAMED_RELATIVE_BAR_2_PAIRING_DERIVED') {
    return freeze({ status: 'FORMAL_BAR_TWO_TRANSPORT_ABSTAINS' });
  }
  const tau = translation(relative.value);
  return freeze({
    status: 'FORMAL_BAR_TWO_TRANSPORT_DERIVED',
    cell: baseCell,
    relative,
    value: relative.value,
    target_two_morphism: canonicalInteger(relative.value),
    translation: tau,
    target: 'B^2Z',
    degree_one_target_collapsed_to_identity: true,
    geometric_parallel_transport_authority: false,
  });
}

export function formalBar2Holonomy(
  cell,
  lambda = finiteBoundaryFraming([]),
  cochain = transportIncrementCocycle,
) {
  const transport = formalBar2Transport(cell, lambda, cochain);
  if (transport.status !== 'FORMAL_BAR_TWO_TRANSPORT_DERIVED') {
    return freeze({ status: 'FORMAL_BAR_TWO_HOLONOMY_ABSTAINS' });
  }
  if (!sameFormalBar1Chain(transport.cell.source, transport.cell.target)) {
    return freeze({
      status: 'FORMAL_BAR_TWO_HOLONOMY_REJECTS_OPEN_TWO_CELL',
      transport,
      closed: false,
    });
  }
  return freeze({
    status: 'FORMAL_BAR_COMPLEX_TWO_HOLONOMY_DERIVED',
    transport,
    closed: true,
    value: transport.value,
    translation: transport.translation,
    naming_jurisdiction: 'FORMAL_BAR_COMPLEX_TWO_HOLONOMY_ONLY',
    geometric_two_holonomy_authority: false,
    connection_authority: false,
  });
}

function cellTransportValue(cell, lambda) {
  const transport = formalBar2Transport(cell, lambda);
  return transport.status === 'FORMAL_BAR_TWO_TRANSPORT_DERIVED' ? transport.value : null;
}

function canonicalOpenCell() {
  const chain = oneBar2Term(T_COORDINATE, Q_COORDINATE, 1, '[T|Q]');
  const source = normalizeFormalBar1Chain([
    { coordinate: T_COORDINATE, coefficient: 1 },
    { coordinate: Q_COORDINATE, coefficient: 1 },
  ]);
  if (source.status !== 'FORMAL_BAR_1_CHAIN_NORMALIZED') return null;
  return formalBar2CellFromSource(chain, source.chain);
}

function sourceTargetCertificate() {
  const open = canonicalOpenCell();
  const counterfeit = formalBar2Cell({ chain: oneBar2Term(T_COORDINATE, Q_COORDINATE), source: [], target: [] });
  const transport = formalBar2Transport(open);
  const holonomyRejected = formalBar2Holonomy(open);
  return freeze({
    passed: open?.status === 'FORMAL_BAR_TWO_CELL_DERIVED'
      && !open.closed
      && counterfeit.status === 'FORMAL_BAR_TWO_CELL_REJECTS_SOURCE_TARGET_BOUNDARY_MISMATCH'
      && transport.status === 'FORMAL_BAR_TWO_TRANSPORT_DERIVED'
      && holonomyRejected.status === 'FORMAL_BAR_TWO_HOLONOMY_REJECTS_OPEN_TWO_CELL',
    open,
    counterfeit,
    transport,
    holonomy_rejected: holonomyRejected,
  });
}

function verticalCompositionCertificate() {
  const first = canonicalOpenCell();
  if (!first || first.status !== 'FORMAL_BAR_TWO_CELL_DERIVED') return freeze({ passed: false, first });
  const second = formalBar2CellFromSource(
    oneBar2Term(Q_COORDINATE, T_COORDINATE, 1, '[Q|T]'),
    first.target,
  );
  const composed = verticalComposeFormalBar2Cells(first, second);
  const wrongSource = addFormalBar1Chains(second.source, oneBar1Term(T_COORDINATE, 1));
  const mismatchedSecond = formalBar2CellFromSource(second.chain, wrongSource.chain);
  const rejected = verticalComposeFormalBar2Cells(first, mismatchedSecond);
  const idAtSource = identityFormalBar2Cell(first.source);
  const idAtMiddle = identityFormalBar2Cell(first.target);
  const leftUnit = verticalComposeFormalBar2Cells(idAtSource, first);
  const rightUnit = verticalComposeFormalBar2Cells(first, idAtMiddle);
  const inverse = inverseFormalBar2Cell(first);
  const roundTrip = verticalComposeFormalBar2Cells(first, inverse);
  return freeze({
    passed: second.status === 'FORMAL_BAR_TWO_CELL_DERIVED'
      && composed.status === 'FORMAL_BAR_TWO_VERTICAL_COMPOSITION_DERIVED'
      && sameFormalBar1Chain(composed.source, first.source)
      && sameFormalBar1Chain(composed.target, second.target)
      && rejected.status === 'FORMAL_BAR_TWO_VERTICAL_COMPOSITION_REJECTS_MIDDLE_ONE_CELL_MISMATCH'
      && leftUnit.status === 'FORMAL_BAR_TWO_VERTICAL_COMPOSITION_DERIVED'
      && rightUnit.status === 'FORMAL_BAR_TWO_VERTICAL_COMPOSITION_DERIVED'
      && sameNormalizedBar2Chain(leftUnit.chain, first.chain)
      && sameNormalizedBar2Chain(rightUnit.chain, first.chain)
      && inverse.status === 'FORMAL_BAR_TWO_CELL_DERIVED'
      && roundTrip.status === 'FORMAL_BAR_TWO_VERTICAL_COMPOSITION_DERIVED'
      && roundTrip.chain.length === 0
      && sameFormalBar1Chain(roundTrip.source, roundTrip.target),
    first,
    second,
    composed,
    rejected,
    left_unit: leftUnit,
    right_unit: rightUnit,
    inverse,
    round_trip: roundTrip,
  });
}

function horizontalCompositionCertificate() {
  const left = canonicalOpenCell();
  const rightSource = normalizeFormalBar1Chain([
    { coordinate: Q_COORDINATE, coefficient: 1 },
    { coordinate: T_COORDINATE, coefficient: 1 },
  ]);
  const right = formalBar2CellFromSource(oneBar2Term(Q_COORDINATE, T_COORDINATE), rightSource.chain);
  const thirdSource = normalizeFormalBar1Chain([
    { coordinate: T_COORDINATE, coefficient: 2 },
  ]);
  const third = formalBar2CellFromSource(oneBar2Term(T_COORDINATE, T_COORDINATE), thirdSource.chain);
  const horizontal = horizontalComposeFormalBar2Cells(left, right);
  const leftAssocA = horizontalComposeFormalBar2Cells(left, right);
  const leftAssoc = horizontalComposeFormalBar2Cells(asDerivedCell(leftAssocA), third);
  const rightAssocB = horizontalComposeFormalBar2Cells(right, third);
  const rightAssoc = horizontalComposeFormalBar2Cells(left, asDerivedCell(rightAssocB));
  const zero = identityFormalBar2Cell([]);
  const leftUnit = horizontalComposeFormalBar2Cells(zero, left);
  const rightUnit = horizontalComposeFormalBar2Cells(left, zero);
  return freeze({
    passed: left?.status === 'FORMAL_BAR_TWO_CELL_DERIVED'
      && right.status === 'FORMAL_BAR_TWO_CELL_DERIVED'
      && third.status === 'FORMAL_BAR_TWO_CELL_DERIVED'
      && horizontal.status === 'FORMAL_BAR_TWO_HORIZONTAL_COMPOSITION_DERIVED'
      && leftAssoc.status === 'FORMAL_BAR_TWO_HORIZONTAL_COMPOSITION_DERIVED'
      && rightAssoc.status === 'FORMAL_BAR_TWO_HORIZONTAL_COMPOSITION_DERIVED'
      && sameNormalizedBar2Chain(leftAssoc.chain, rightAssoc.chain)
      && sameFormalBar1Chain(leftAssoc.source, rightAssoc.source)
      && sameFormalBar1Chain(leftAssoc.target, rightAssoc.target)
      && leftUnit.status === 'FORMAL_BAR_TWO_HORIZONTAL_COMPOSITION_DERIVED'
      && rightUnit.status === 'FORMAL_BAR_TWO_HORIZONTAL_COMPOSITION_DERIVED'
      && sameNormalizedBar2Chain(leftUnit.chain, left.chain)
      && sameNormalizedBar2Chain(rightUnit.chain, left.chain),
    left,
    right,
    third,
    horizontal,
    left_associated: leftAssoc,
    right_associated: rightAssoc,
    left_unit: leftUnit,
    right_unit: rightUnit,
  });
}

function makeGridColumn(firstChain, secondChain, startSource) {
  const first = formalBar2CellFromSource(firstChain, startSource);
  if (first.status !== 'FORMAL_BAR_TWO_CELL_DERIVED') return { first, second: null };
  const second = formalBar2CellFromSource(secondChain, first.target);
  return { first, second };
}

function interchangeCertificate() {
  const sourceA = normalizeFormalBar1Chain([
    { coordinate: T_COORDINATE, coefficient: 1 },
    { coordinate: Q_COORDINATE, coefficient: 1 },
  ]);
  const sourceB = normalizeFormalBar1Chain([
    { coordinate: T_COORDINATE, coefficient: 2 },
  ]);
  const alpha = makeGridColumn(
    oneBar2Term(T_COORDINATE, Q_COORDINATE, 1, 'alpha1'),
    oneBar2Term(Q_COORDINATE, T_COORDINATE, 1, 'alpha2'),
    sourceA.chain,
  );
  const beta = makeGridColumn(
    oneBar2Term(T_COORDINATE, T_COORDINATE, 1, 'beta1'),
    oneBar2Term(Q_COORDINATE, Q_COORDINATE, 1, 'beta2'),
    sourceB.chain,
  );
  if (alpha.first?.status !== 'FORMAL_BAR_TWO_CELL_DERIVED'
      || alpha.second?.status !== 'FORMAL_BAR_TWO_CELL_DERIVED'
      || beta.first?.status !== 'FORMAL_BAR_TWO_CELL_DERIVED'
      || beta.second?.status !== 'FORMAL_BAR_TWO_CELL_DERIVED') {
    return freeze({ passed: false, alpha, beta });
  }
  const alphaVertical = verticalComposeFormalBar2Cells(alpha.first, alpha.second);
  const betaVertical = verticalComposeFormalBar2Cells(beta.first, beta.second);
  const left = horizontalComposeFormalBar2Cells(asDerivedCell(alphaVertical), asDerivedCell(betaVertical));
  const lowerHorizontal = horizontalComposeFormalBar2Cells(alpha.first, beta.first);
  const upperHorizontal = horizontalComposeFormalBar2Cells(alpha.second, beta.second);
  const right = verticalComposeFormalBar2Cells(asDerivedCell(lowerHorizontal), asDerivedCell(upperHorizontal));

  const fakeSource = addFormalBar1Chains(alpha.second.source, oneBar1Term(Q_COORDINATE, 1));
  const fakeAlpha2 = formalBar2CellFromSource(alpha.second.chain, fakeSource.chain);
  const fakeVertical = verticalComposeFormalBar2Cells(alpha.first, fakeAlpha2);

  const lambda = finiteBoundaryFraming([]);
  const leftValue = cellTransportValue(asDerivedCell(left), lambda);
  const rightValue = cellTransportValue(asDerivedCell(right), lambda);

  return freeze({
    passed: alphaVertical.status === 'FORMAL_BAR_TWO_VERTICAL_COMPOSITION_DERIVED'
      && betaVertical.status === 'FORMAL_BAR_TWO_VERTICAL_COMPOSITION_DERIVED'
      && left.status === 'FORMAL_BAR_TWO_HORIZONTAL_COMPOSITION_DERIVED'
      && lowerHorizontal.status === 'FORMAL_BAR_TWO_HORIZONTAL_COMPOSITION_DERIVED'
      && upperHorizontal.status === 'FORMAL_BAR_TWO_HORIZONTAL_COMPOSITION_DERIVED'
      && right.status === 'FORMAL_BAR_TWO_VERTICAL_COMPOSITION_DERIVED'
      && sameNormalizedBar2Chain(left.chain, right.chain)
      && sameFormalBar1Chain(left.source, right.source)
      && sameFormalBar1Chain(left.target, right.target)
      && Number.isInteger(leftValue)
      && leftValue === rightValue
      && fakeVertical.status === 'FORMAL_BAR_TWO_VERTICAL_COMPOSITION_REJECTS_MIDDLE_ONE_CELL_MISMATCH',
    alpha,
    beta,
    left_interchange: left,
    right_interchange: right,
    left_transport_value: leftValue,
    right_transport_value: rightValue,
    fake_grid_rejection: fakeVertical,
  });
}

function verticalAssociativityCertificate() {
  const first = canonicalOpenCell();
  const second = formalBar2CellFromSource(oneBar2Term(Q_COORDINATE, T_COORDINATE), first.target);
  const third = formalBar2CellFromSource(oneBar2Term(T_COORDINATE, T_COORDINATE), second.target);
  const ab = verticalComposeFormalBar2Cells(first, second);
  const left = verticalComposeFormalBar2Cells(asDerivedCell(ab), third);
  const bc = verticalComposeFormalBar2Cells(second, third);
  const right = verticalComposeFormalBar2Cells(first, asDerivedCell(bc));
  return freeze({
    passed: left.status === 'FORMAL_BAR_TWO_VERTICAL_COMPOSITION_DERIVED'
      && right.status === 'FORMAL_BAR_TWO_VERTICAL_COMPOSITION_DERIVED'
      && sameNormalizedBar2Chain(left.chain, right.chain)
      && sameFormalBar1Chain(left.source, right.source)
      && sameFormalBar1Chain(left.target, right.target),
    left,
    right,
  });
}

function representativeDescentCertificate() {
  const open = canonicalOpenCell();
  const lambda = finiteBoundaryFraming([
    { coordinate: T_COORDINATE, value: 2 },
    { coordinate: Q_COORDINATE, value: -1 },
  ]);
  const b3 = freeze([
    freeze({ coefficient: 1, x: T_COORDINATE, y: Q_COORDINATE, z: T_COORDINATE }),
  ]);
  const shifted = bar3RepresentativeShift(open, b3);
  const originalTransport = formalBar2Transport(open, lambda);
  const shiftedTransport = shifted.status === 'FORMAL_BAR_TWO_REPRESENTATIVE_SHIFT_DERIVED'
    ? formalBar2Transport(shifted.shifted, lambda)
    : freeze({ status: 'FORMAL_BAR_TWO_TRANSPORT_ABSTAINS' });
  const rezeroed = relativeBar2Rezeroing(open.chain, lambda, defaultOpenCellPhi);
  return freeze({
    passed: shifted.status === 'FORMAL_BAR_TWO_REPRESENTATIVE_SHIFT_DERIVED'
      && shifted.source_preserved
      && shifted.target_preserved
      && originalTransport.status === 'FORMAL_BAR_TWO_TRANSPORT_DERIVED'
      && shiftedTransport.status === 'FORMAL_BAR_TWO_TRANSPORT_DERIVED'
      && originalTransport.value === shiftedTransport.value
      && rezeroed.status === 'RELATIVE_BAR_2_REZEROING_DERIVED'
      && rezeroed.delta === 0
      && rezeroed.original.value === rezeroed.transformed.value,
    open,
    shifted,
    original_transport: originalTransport,
    shifted_transport: shiftedTransport,
    paired_rezeroing: rezeroed,
  });
}

function twoFunctorCertificate() {
  const lambda = finiteBoundaryFraming([
    { coordinate: T_COORDINATE, value: 1 },
    { coordinate: Q_COORDINATE, value: -2 },
  ]);
  const first = canonicalOpenCell();
  const second = formalBar2CellFromSource(oneBar2Term(Q_COORDINATE, T_COORDINATE), first.target);
  const vertical = verticalComposeFormalBar2Cells(first, second);
  const horizontalOtherSource = normalizeFormalBar1Chain([
    { coordinate: T_COORDINATE, coefficient: 2 },
  ]);
  const horizontalOther = formalBar2CellFromSource(
    oneBar2Term(T_COORDINATE, T_COORDINATE),
    horizontalOtherSource.chain,
  );
  const horizontal = horizontalComposeFormalBar2Cells(first, horizontalOther);
  const identity = identityFormalBar2Cell(first.source);
  const inverse = inverseFormalBar2Cell(first);

  const fFirst = formalBar2Transport(first, lambda);
  const fSecond = formalBar2Transport(second, lambda);
  const fVertical = formalBar2Transport(asDerivedCell(vertical), lambda);
  const fOther = formalBar2Transport(horizontalOther, lambda);
  const fHorizontal = formalBar2Transport(asDerivedCell(horizontal), lambda);
  const fIdentity = formalBar2Transport(identity, lambda);
  const fInverse = formalBar2Transport(inverse, lambda);

  return freeze({
    passed: [fFirst, fSecond, fVertical, fOther, fHorizontal, fIdentity, fInverse]
      .every((x) => x.status === 'FORMAL_BAR_TWO_TRANSPORT_DERIVED')
      && fVertical.value === fFirst.value + fSecond.value
      && fHorizontal.value === fFirst.value + fOther.value
      && fIdentity.value === 0
      && fInverse.value === -fFirst.value,
    first: fFirst,
    second: fSecond,
    vertical: fVertical,
    horizontal_other: fOther,
    horizontal: fHorizontal,
    identity: fIdentity,
    inverse: fInverse,
    target: 'B^2Z',
    target_one_cell: 'id_*Z',
  });
}

function closedHolonomyCertificate() {
  const z = relationBarCycle();
  if (!z.passed) return freeze({ passed: false, z });
  const zero = [];
  const cell = formalBar2Cell({ chain: z.chain, source: zero, target: zero });
  const hol = formalBar2Holonomy(cell);
  const negativeChain = scaleBar2Chain(z.chain, -1);
  const negativeCell = formalBar2Cell({ chain: negativeChain.chain, source: zero, target: zero });
  const negativeHol = formalBar2Holonomy(negativeCell);
  const zeroCell = identityFormalBar2Cell([]);
  const zeroHol = formalBar2Holonomy(zeroCell);
  const probes = [-2, -1, 0, 1, 2].map((n) => {
    const scaled = scaleBar2Chain(z.chain, n);
    const scaledCell = formalBar2Cell({ chain: scaled.chain, source: zero, target: zero });
    const scaledHol = formalBar2Holonomy(scaledCell);
    return freeze({
      n,
      status: scaledHol.status,
      value: scaledHol.status === 'FORMAL_BAR_COMPLEX_TWO_HOLONOMY_DERIVED' ? scaledHol.value : null,
      expected: 2 * n,
      passed: scaledHol.status === 'FORMAL_BAR_COMPLEX_TWO_HOLONOMY_DERIVED'
        && scaledHol.value === 2 * n,
    });
  });
  const b3 = freeze([
    freeze({ coefficient: 1, x: T_COORDINATE, y: Q_COORDINATE, z: T_COORDINATE }),
  ]);
  const shifted = bar3RepresentativeShift(cell, b3);
  const shiftedHol = shifted.status === 'FORMAL_BAR_TWO_REPRESENTATIVE_SHIFT_DERIVED'
    ? formalBar2Holonomy(shifted.shifted)
    : freeze({ status: 'FORMAL_BAR_TWO_HOLONOMY_ABSTAINS' });
  const paired = relativeBar2Rezeroing(z.chain, finiteBoundaryFraming([]), defaultOpenCellPhi);
  const probe = 13;
  return freeze({
    passed: cell.status === 'FORMAL_BAR_TWO_CELL_DERIVED'
      && cell.closed
      && hol.status === 'FORMAL_BAR_COMPLEX_TWO_HOLONOMY_DERIVED'
      && hol.value === 2
      && hol.translation.apply(probe) === probe + 2
      && negativeHol.status === 'FORMAL_BAR_COMPLEX_TWO_HOLONOMY_DERIVED'
      && negativeHol.value === -2
      && negativeHol.translation.apply(hol.translation.apply(probe)) === probe
      && zeroHol.status === 'FORMAL_BAR_COMPLEX_TWO_HOLONOMY_DERIVED'
      && zeroHol.value === 0
      && zeroHol.translation.apply(probe) === probe
      && probes.every((entry) => entry.passed)
      && shifted.status === 'FORMAL_BAR_TWO_REPRESENTATIVE_SHIFT_DERIVED'
      && shiftedHol.status === 'FORMAL_BAR_COMPLEX_TWO_HOLONOMY_DERIVED'
      && shiftedHol.value === hol.value
      && paired.status === 'RELATIVE_BAR_2_REZEROING_DERIVED'
      && paired.delta === 0
      && paired.original.value === 2
      && paired.transformed.value === 2,
    cell,
    holonomy: hol,
    negative_holonomy: negativeHol,
    zero_holonomy: zeroHol,
    finite_integer_probes: freeze(probes),
    representative_shift: shifted,
    shifted_holonomy: shiftedHol,
    paired_rezeroing: paired,
  });
}

function invalidJurisdictionCertificate() {
  const labeledCoordinate = freeze({ ...T_COORDINATE, receipt: 'external-metadata' });
  const badOne = normalizeFormalBar1Chain([{ coordinate: labeledCoordinate, coefficient: 1 }]);
  const noninteger = normalizeFormalBar1Chain([{ coordinate: T_COORDINATE, coefficient: 0.5 }]);
  const unit = normalizeFormalBar1Chain([{ coordinate: UNIT, coefficient: 1 }]);
  return freeze({
    passed: badOne.status === 'FORMAL_BAR_1_CHAIN_NORMALIZATION_ABSTAINS'
      && noninteger.status === 'FORMAL_BAR_1_CHAIN_NORMALIZATION_ABSTAINS'
      && unit.status === 'FORMAL_BAR_1_CHAIN_REJECTS_NORMALIZED_UNIT_BASIS_TERM',
    receipt_labeled_coordinate: badOne,
    noninteger,
    normalized_unit: unit,
  });
}

export function formalBarChainTwoGroupoidHolonomyCertificate() {
  const typing = sourceTargetCertificate();
  const vertical = verticalCompositionCertificate();
  const horizontal = horizontalCompositionCertificate();
  const interchange = interchangeCertificate();
  const verticalAssociativity = verticalAssociativityCertificate();
  const descent = representativeDescentCertificate();
  const twoFunctor = twoFunctorCertificate();
  const closed = closedHolonomyCertificate();
  const invalid = invalidJurisdictionCertificate();

  const canonicalClassifications = freeze([
    'THE_DECLARED_NORMALIZED_INTEGER_BAR_CHAIN_COMPLEX_IN_DEGREES_ONE_AND_TWO_WITH_BAR_THREE_BOUNDARY_REPRESENTATIVE_IDENTIFICATION_SUPPORTS_A_ONE_OBJECT_STRICT_FORMAL_TWO_GROUPOID_WITH_EXACT_SOURCE_TARGET_TYPING_VERTICAL_COMPOSITION_HORIZONTAL_ADDITIVE_COMPOSITION_AND_INTERCHANGE',
    'THE_BOUNDARY_FRAMED_RELATIVE_PAIRING_DESCENDS_TO_A_STRICT_FORMAL_TWO_TRANSPORT_REPRESENTATION_FROM_THE_BAR_CHAIN_TWO_GROUPOID_TO_B_SQUARED_Z_AND_PRESERVES_VERTICAL_AND_HORIZONTAL_COMPOSITION_IDENTITIES_AND_INVERSES',
    'CLOSED_FORMAL_BAR_TWO_ENDOMORPHISMS_ADMIT_A_WELL_DEFINED_FORMAL_BAR_COMPLEX_TWO_HOLONOMY_TRANSLATION_REPRESENTATION_WITH_THE_INHERITED_RELATION_CLASS_[z]_MAPPING_TO_TAU_2',
  ]);

  const quarantines = freeze([
    'formal bar-chain 2-groupoid != operational T/Q path 2-groupoid',
    'formal C1 inverse != inverse operational route',
    'formal horizontal chain sum != geometric side-by-side surface composition',
    'strict additive interchange != geometric interchange theorem',
    'bar-3 representative quotient != thin homotopy or arbitrary triangulation invariance',
    'paired cohomological re-zeroing != connection gauge transformation',
    'boundary framing != 2-connection',
    'formal B^2Z target != physical gauge 2-group',
    'formal 2-functor != geometric parallel transport 2-functor',
    'formal bar-complex 2-holonomy != geometric / physical / Berry / gerbe 2-holonomy',
    'closed bar 2-cycle != operational T/Q loop',
    'formal tau_2 return != curvature integral',
  ]);

  const passed = [
    typing,
    vertical,
    horizontal,
    interchange,
    verticalAssociativity,
    descent,
    twoFunctor,
    closed,
    invalid,
  ].every((entry) => entry.passed);

  return freeze({
    status: passed
      ? 'FORMAL_BAR_CHAIN_TWO_GROUPOID_HOLONOMY_CERTIFICATE_PASSED'
      : 'FORMAL_BAR_CHAIN_TWO_GROUPOID_HOLONOMY_CERTIFICATE_FAILED',
    passed,
    source_target_typing: typing,
    vertical_composition: vertical,
    horizontal_composition: horizontal,
    interchange,
    vertical_associativity: verticalAssociativity,
    representative_and_rezeroing_descent: descent,
    strict_two_transport_representation: twoFunctor,
    closed_formal_two_holonomy: closed,
    invalid_jurisdiction_abstention: invalid,
    canonical_classifications: canonicalClassifications,
    quarantines,
    formal_bar_complex_two_holonomy_representation_promoted: passed,
    geometric_two_holonomy_promoted: false,
    connection_promoted: false,
    operational_path_two_groupoid_promoted: false,
    proto_loom_or_a16_promoted: false,
  });
}

export const FORMAL_BAR_CHAIN_TWO_GROUPOID_HOLONOMY_CERTIFICATE = formalBarChainTwoGroupoidHolonomyCertificate();
