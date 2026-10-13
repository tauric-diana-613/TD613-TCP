import { buildPhase24HushSwap } from './hush-phase24-swap.js';
import { detectHushGarble, summarizeHushGarble } from './hush-garble-gate.js';
import { mapEventShape, scoreEventShapeRetention, summarizeEventShapeRetention } from './hush-event-shape.js';
import { assessHardMaskReadiness, summarizeHardMaskReadiness } from './hush-hard-mask-proof.js';

export const HUSH_PHASE25_SWAP_VERSION = 'phase-25';

const items = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const n = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const r = (value) => Number.isFinite(value) ? Number(value.toFixed(4)) : 0;

function selectedCandidate(result = {}) {
  return items(result.candidates).find((candidate) => candidate.id === result.selectedCandidateId) || items(result.candidates)[0] || null;
}

function enhance(candidate = {}, sourceText = '', protectedLiterals = []) {
  const text = candidate.phase24Text || candidate.phase23Text || candidate.text || '';
  const garble = detectHushGarble({ sourceText, outputText: text, protectedLiterals });
  const eventShape = scoreEventShapeRetention({ sourceText, outputText: text, eventShape: mapEventShape(sourceText) });
  const base = n(candidate.phase24Score, n(candidate.phase23Score, n(candidate.finalScore, 0)));
  const score = r((base * 0.68) + (n(garble.garbleScore, 0) * 0.16) + (n(eventShape.score, 0) * 0.16));
  return { ...candidate, phase25Text: text, garble, garbleSummary: summarizeHushGarble(garble), eventShape, eventShapeSummary: summarizeEventShapeRetention(eventShape), phase25Score: score };
}

function choose(candidates = []) {
  return [...items(candidates)].sort((left, right) => {
    const leftIssues = items(left.garble?.hardFailures).length + items(left.eventShape?.hardFailures).length + (left.phase24?.issueCount || 0);
    const rightIssues = items(right.garble?.hardFailures).length + items(right.eventShape?.hardFailures).length + (right.phase24?.issueCount || 0);
    if (leftIssues !== rightIssues) return leftIssues - rightIssues;
    return n(right.phase25Score) - n(left.phase25Score);
  })[0] || null;
}

export function buildPhase25HushSwap(input = {}) {
  const phase24 = buildPhase24HushSwap(input);
  const protectedLiterals = items(phase24.lockbox?.literals).map((item) => item.literal).filter(Boolean);
  const candidates = items(phase24.candidates).map((candidate) => enhance(candidate, input.sourceText || '', protectedLiterals));
  const selected = choose(candidates);
  const selectedText = selected?.phase25Text || '';
  const garbleIssues = items(selected?.garble?.hardFailures).length;
  const shapeIssues = items(selected?.eventShape?.hardFailures).length;
  const inheritedIssues = phase24.phase24?.issueCount || 0;
  const issueCount = garbleIssues + shapeIssues + inheritedIssues;
  const canEmit = Boolean(selected && selected.releasePolicy?.mayPopulateOutput && issueCount === 0);
  const hardMask = input.assessHardMask ? assessHardMaskReadiness(input.mask || {}, input.hardMaskOptions || {}) : null;
  const hardMaskReady = hardMask ? hardMask.passed === true : true;
  return {
    ...phase24,
    version: HUSH_PHASE25_SWAP_VERSION,
    phase24Version: phase24.version,
    selectedOutput: canEmit ? selectedText : '',
    recommendedOutput: canEmit ? selectedText : '',
    reviewOutput: selected?.releasePolicy?.mayPopulateOutput ? selectedText : '',
    selectedCandidateId: selected?.id || phase24.selectedCandidateId || '',
    phase25SelectedCandidateId: selected?.id || '',
    candidates,
    garble: selected?.garble || null,
    garbleSummary: selected?.garbleSummary || null,
    eventShape: selected?.eventShape || null,
    eventShapeSummary: selected?.eventShapeSummary || null,
    hardMaskReadiness: hardMask,
    hardMaskReadinessSummary: hardMask ? summarizeHardMaskReadiness(hardMask) : null,
    phase25: { version: HUSH_PHASE25_SWAP_VERSION, usedWrapper: true, issueCount, ready: Boolean(canEmit && hardMaskReady), score: selected?.phase25Score ?? null }
  };
}
