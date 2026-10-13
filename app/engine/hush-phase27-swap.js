import { buildPhase25HushSwap } from './hush-phase25-swap.js';
import { loadHushRegisterRegistry, summarizeHushRegisterRegistry } from './hush-register-registry.js';
import { buildHushRegisterContract, summarizeHushRegisterContract } from './hush-register-contract.js';
import { classifyHushRegister } from './hush-register-classifier.js';
import { evaluateDialectCustody, summarizeDialectCustody } from './hush-dialect-custody.js';
import { evaluateChatspeakCustody, summarizeChatspeakCustody } from './hush-chatspeak-custody.js';
import { evaluateCodeSwitchBoundaries, summarizeCodeSwitchBoundaries } from './hush-code-switch-boundary.js';

export const HUSH_PHASE27_SWAP_VERSION = 'phase-27';

const arr = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const num = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const round = (value) => Number.isFinite(value) ? Number(value.toFixed(4)) : 0;

function selectedCandidate(result = {}) {
  return arr(result.candidates).find((candidate) => candidate.id === result.selectedCandidateId) || arr(result.candidates)[0] || null;
}

function scoreRegister({ phase25Score = 0, dialect, chatspeak, codeSwitch }) {
  const dialectPass = dialect?.passed === false ? 0 : 1;
  const chatPass = chatspeak?.passed === false ? 0 : 1;
  const switchPass = codeSwitch?.passed === false ? 0 : 1;
  return round((num(phase25Score, 0) * 0.7) + (dialectPass * 0.1) + (chatPass * 0.1) + (switchPass * 0.1));
}

export function buildPhase27HushSwap(input = {}) {
  const registry = input.registry || loadHushRegisterRegistry(input.registryInput || {});
  const contract = input.contract || buildHushRegisterContract(input.registerContract || input);
  const phase25 = buildPhase25HushSwap(input);
  const candidate = selectedCandidate(phase25);
  const outputText = phase25.selectedOutput || phase25.reviewOutput || candidate?.phase25Text || '';
  const register = classifyHushRegister({ sourceText: input.sourceText || '', outputText, registry });
  const dialect = evaluateDialectCustody({ sourceText: input.sourceText || '', outputText, registry, contract, warnings: input.warnings || [] });
  const chatspeak = evaluateChatspeakCustody({ sourceText: input.sourceText || '', outputText, registry, contract, warnings: input.warnings || [] });
  const codeSwitch = evaluateCodeSwitchBoundaries({ sourceText: input.sourceText || '', outputText, contract, warnings: input.warnings || [] });
  const issues = arr(dialect.hardFailures).length + arr(chatspeak.hardFailures).length + arr(codeSwitch.hardFailures).length + (phase25.phase25?.issueCount || 0);
  const phase27Score = scoreRegister({ phase25Score: candidate?.phase25Score ?? phase25.phase25?.score, dialect, chatspeak, codeSwitch });
  const canEmit = Boolean(outputText && issues === 0 && phase25.phase25?.ready !== false);
  return {
    ...phase25,
    version: HUSH_PHASE27_SWAP_VERSION,
    phase25Version: phase25.version,
    selectedOutput: canEmit ? outputText : '',
    recommendedOutput: canEmit ? outputText : '',
    reviewOutput: outputText,
    registerRegistry: registry,
    registerRegistrySummary: summarizeHushRegisterRegistry(registry),
    registerContract: contract,
    registerContractSummary: summarizeHushRegisterContract(contract),
    registerClassification: register,
    dialectCustody: dialect,
    dialectCustodySummary: summarizeDialectCustody(dialect),
    chatspeakCustody: chatspeak,
    chatspeakCustodySummary: summarizeChatspeakCustody(chatspeak),
    codeSwitchBoundary: codeSwitch,
    codeSwitchBoundarySummary: summarizeCodeSwitchBoundaries(codeSwitch),
    phase27: { version: HUSH_PHASE27_SWAP_VERSION, usedWrapper: true, issueCount: issues, ready: Boolean(canEmit), score: phase27Score }
  };
}
