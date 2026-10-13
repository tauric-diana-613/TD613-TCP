import { buildPhase23HushSwap } from './hush-phase23-swap.js';
import { repairProtectedLiteralCase, summarizeCaseStability } from './hush-case-stability.js';
import { detectHushFlattening, summarizeFlattening } from './hush-anti-flattening.js';
import { resolveHushDirection, summarizeHushDirection } from './hush-direction.js';

export const HUSH_PHASE24_SWAP_VERSION = 'phase-24';

const items = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const n = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const r = (value) => Number.isFinite(value) ? Number(value.toFixed(4)) : 0;

function literals(result = {}) {
  return items(result.lockbox?.literals).map((item) => item.literal).filter(Boolean);
}

function baseMovement(candidate = {}, direction = 'mask-to-mask') {
  if (direction === 'jagged-to-coherent') return n(candidate.witnessCoherence?.score, 0.7);
  return n(candidate.syntaxShift?.metrics?.syntaxShiftScore ?? candidate.scoreBreakdown?.syntaxShiftScore, 0.7);
}

function score(candidate = {}, direction = {}) {
  const w = direction.weights || {};
  const base = n(candidate.phase23Score, n(candidate.finalScore, 0));
  const casePart = candidate.caseStability?.failed ? 0 : 1;
  const flatPart = items(candidate.flattening?.hardFailures).length ? 0 : n(candidate.flattening?.flatteningScore, 1);
  return r((base * n(w.phase23, 0.4)) + (casePart * n(w.caseStability, 0.2)) + (flatPart * n(w.antiFlattening, 0.2)) + (n(candidate.witnessCoherence?.score, 0.7) * n(w.coherence, 0.1)) + (baseMovement(candidate, direction.direction) * n(w.movement, 0.1)));
}

function enhance(candidate = {}, sourceText = '', protectedLiterals = []) {
  const original = candidate.phase23Text || candidate.text || '';
  const caseStability = repairProtectedLiteralCase({ sourceText, outputText: original, protectedLiterals });
  const flattening = detectHushFlattening({ sourceText, outputText: caseStability.text, protectedLiterals });
  return { ...candidate, phase24Text: caseStability.text, caseStability, caseStabilitySummary: summarizeCaseStability(caseStability), flattening, flatteningSummary: summarizeFlattening(flattening) };
}

function choose(candidates = []) {
  return [...items(candidates)].sort((a, b) => {
    const blockA = a.releasePolicy?.hardBlocked ? 1 : 0;
    const blockB = b.releasePolicy?.hardBlocked ? 1 : 0;
    if (blockA !== blockB) return blockA - blockB;
    const issueA = (a.caseStability?.failed ? 1 : 0) + items(a.flattening?.hardFailures).length;
    const issueB = (b.caseStability?.failed ? 1 : 0) + items(b.flattening?.hardFailures).length;
    if (issueA !== issueB) return issueA - issueB;
    return n(b.phase24Score) - n(a.phase24Score);
  })[0] || null;
}

export function buildPhase24HushSwap(input = {}) {
  const phase23 = buildPhase23HushSwap(input);
  const direction = resolveHushDirection(input);
  const protectedLiterals = literals(phase23);
  const candidates = items(phase23.candidates).map((candidate) => {
    const next = enhance(candidate, input.sourceText || '', protectedLiterals);
    return { ...next, phase24Score: score(next, direction) };
  });
  const selected = choose(candidates);
  const issueCount = (selected?.caseStability?.failed ? 1 : 0) + items(selected?.flattening?.hardFailures).length + (selected?.releasePolicy?.hardBlocked ? 1 : 0);
  const mayShow = Boolean(selected && issueCount === 0 && selected.releasePolicy?.mayPopulateOutput);
  const text = selected?.phase24Text || selected?.phase23Text || selected?.text || '';
  return { ...phase23, version: HUSH_PHASE24_SWAP_VERSION, phase23Version: phase23.version, selectedOutput: mayShow ? text : '', recommendedOutput: mayShow ? text : '', reviewOutput: selected?.releasePolicy?.mayPopulateOutput ? text : '', selectedCandidateId: selected?.id || phase23.selectedCandidateId || '', phase24SelectedCandidateId: selected?.id || '', candidates, direction, directionSummary: summarizeHushDirection(direction), caseStability: selected?.caseStability || null, caseStabilitySummary: selected?.caseStabilitySummary || null, flattening: selected?.flattening || null, flatteningSummary: selected?.flatteningSummary || null, phase24: { version: HUSH_PHASE24_SWAP_VERSION, usedWrapper: true, issueCount, ready: Boolean(mayShow), score: selected?.phase24Score ?? null } };
}
