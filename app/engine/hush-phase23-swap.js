import { buildHushSwap } from './hush-swap.js';
import { polishHushOutput, summarizeOutputPolish } from './hush-polish.js';
import { buildHushCoherence, summarizeHushCoherence } from './hush-coherence.js';

export const HUSH_PHASE23_SWAP_VERSION = 'phase-23';

const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

function protectedLiteralStrings(result = {}) {
  return asArray(result.lockbox?.literals).map((item) => item.literal).filter(Boolean);
}

function enhanceCandidate(candidate = {}, sourceText = '', protectedLiterals = []) {
  const polish = polishHushOutput({ text: candidate.text || '', protectedLiterals });
  const coherence = buildHushCoherence({ sourceText, outputText: polish.text, protectedLiterals });
  const score = Number.isFinite(candidate.finalScore) ? candidate.finalScore : 0;
  const phase23Score = Number(((score * 0.86) + ((coherence.score || 0) * 0.14)).toFixed(4));
  return { ...candidate, phase23Text: polish.text, outputPolish: polish, outputPolishSummary: summarizeOutputPolish(polish), witnessCoherence: coherence, witnessCoherenceSummary: summarizeHushCoherence(coherence), phase23Score, phase23Warnings: [...asArray(polish.warnings), ...asArray(coherence.notes), ...asArray(coherence.stops)] };
}

function choosePhase23(candidates = []) {
  const ordered = [...asArray(candidates)].sort((left, right) => {
    const leftBlocked = left.releasePolicy?.hardBlocked ? 1 : 0;
    const rightBlocked = right.releasePolicy?.hardBlocked ? 1 : 0;
    if (leftBlocked !== rightBlocked) return leftBlocked - rightBlocked;
    const leftStop = asArray(left.witnessCoherence?.stops).length;
    const rightStop = asArray(right.witnessCoherence?.stops).length;
    if (leftStop !== rightStop) return leftStop - rightStop;
    return (right.phase23Score || 0) - (left.phase23Score || 0);
  });
  return ordered[0] || null;
}

export function buildPhase23HushSwap(input = {}) {
  const sourceText = String(input.sourceText ?? '');
  const base = buildHushSwap(input);
  const protectedLiterals = protectedLiteralStrings(base);
  const candidates = asArray(base.candidates).map((candidate) => enhanceCandidate(candidate, sourceText, protectedLiterals));
  const selected = choosePhase23(candidates);
  const baseSelected = candidates.find((candidate) => candidate.id === base.selectedCandidateId) || null;
  const mayPopulate = Boolean(selected && selected.releasePolicy?.mayPopulateOutput && asArray(selected.witnessCoherence?.stops).length === 0);
  const selectedOutput = mayPopulate ? selected.phase23Text || selected.text || '' : '';
  const reviewOutput = selected && selected.releasePolicy?.mayPopulateOutput ? selected.phase23Text || selected.text || '' : '';
  return { ...base, version: HUSH_PHASE23_SWAP_VERSION, phase22Version: base.version, selectedOutput, recommendedOutput: selectedOutput, reviewOutput, selectedCandidateId: selected?.id || base.selectedCandidateId || '', phase23SelectedCandidateId: selected?.id || '', phase23BaseSelectedCandidateId: baseSelected?.id || base.selectedCandidateId || '', candidates, outputPolish: selected?.outputPolish || null, outputPolishSummary: selected?.outputPolishSummary || null, witnessCoherence: selected?.witnessCoherence || null, witnessCoherenceSummary: selected?.witnessCoherenceSummary || null, phase23Warnings: selected?.phase23Warnings || [], phase23: { version: HUSH_PHASE23_SWAP_VERSION, usedWrapper: true, selectedChanged: Boolean(selected && baseSelected && selected.id !== baseSelected.id), mayPopulate, reviewRecommended: Boolean(reviewOutput && !selectedOutput) } };
}
