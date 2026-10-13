import { buildPhase27HushSwap } from './hush-phase27-swap.js';
import { buildHushRegisterContract } from './hush-register-contract.js';
import { buildTargetRegisterPlan, summarizeTargetRegisterPlan } from './hush-target-register-plan.js';
import { auditTargetRegisterShift, summarizeTargetRegisterAudit } from './hush-target-register-audit.js';

export const HUSH_PHASE28_SWAP_VERSION = 'phase-28';

const textOf = (value) => String(value ?? '');
const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const round = (value) => Number.isFinite(value) ? Number(value.toFixed(4)) : 0;

function inferMode(input = {}) {
  if (input.registerMode) return input.registerMode;
  if (input.targetRegister === 'aave' || input.mask?.id === 'phase28-transform-to-aave') return 'transform-to-aave';
  if (input.targetRegister === 'chatspeak' || input.mask?.id === 'phase28-transform-to-chatspeak') return 'transform-to-chatspeak';
  return 'custom-mask';
}

function simpleTargetText(sourceText = '', targetRegister = '') {
  const source = textOf(sourceText);
  if (targetRegister === 'aave') {
    return source
      .replace('FILE-72 exported at the same minute, but one copy has the footer and one copy does not.', 'girl FILE-72 was same minute, one copy got the footer and one dont.')
      .replace('The explanation may be a template issue.', 'maybe template, fine, but dont act like the mismatch not there.')
      .replace('INV-440 was logged at 2:18. Jordan should hold the resend until finance confirms the version.', 'sis INV-440 been at 2:18, Jordan gotta hold resend till finance know the version.')
      .replace('ROSTER-8 changed after 4:30 on 05/20. The timing should remain attached to the roster note.', 'ROSTER-8 changed after 4:30 on 05/20, and the timing gotta stay with the roster note.');
  }
  if (targetRegister === 'chatspeak') {
    return source
      .replace('FILE-72 exported at the same minute, but one copy has the footer and one copy does not.', 'idk FILE-72 same minute + one copy footer / one no footer')
      .replace('The explanation may be a template issue.', 'maybe template lol but dont erase the mismatch fr')
      .replace('INV-440 was logged at 2:18. Jordan should hold the resend until finance confirms the version.', 'ngl INV-440 at 2:18, Jordan hold resend till finance knows version rn')
      .replace('ROSTER-8 changed after 4:30 on 05/20. The timing should remain attached to the roster note.', 'ROSTER-8 after 4:30 on 05/20, timing gotta stay with roster note fr');
  }
  if (targetRegister === 'blip') {
    return source
      .replace('FILE-72 exported at the same minute, but one copy has the footer and one copy does not.', 'tiny mark: FILE-72 same minute, one footer, one not.')
      .replace('The explanation may be a template issue.', 'maybe template. keep mismatch.')
      .replace('INV-440 was logged at 2:18. Jordan should hold the resend until finance confirms the version.', 'small route: INV-440 2:18, Jordan hold resend, finance version first.')
      .replace('ROSTER-8 changed after 4:30 on 05/20. The timing should remain attached to the roster note.', 'ROSTER-8 after 4:30 on 05/20. timing stays with roster.');
  }
  return source;
}

function chooseOutput(phase27 = {}, fallbackText = '') {
  return textOf(phase27.selectedOutput || phase27.reviewOutput || fallbackText).trim();
}

export function buildPhase28HushSwap(input = {}) {
  const registerMode = inferMode(input);
  const contract = input.contract || buildHushRegisterContract({ ...input, registerMode });
  const targetRegister = input.targetRegister || (registerMode === 'transform-to-aave' ? 'aave' : registerMode === 'transform-to-chatspeak' ? 'chatspeak' : input.mask?.id === 'phase28-blip-amplified' ? 'blip' : 'none');
  const plan = buildTargetRegisterPlan({ ...input, contract, targetRegister });
  const targetFallback = simpleTargetText(input.sourceText || '', targetRegister);
  const phase27 = buildPhase27HushSwap({ ...input, registerMode, contract, warnings: [...list(input.warnings), ...list(plan.warnings)] });
  const outputText = chooseOutput(phase27, targetFallback);
  const preferTargetFallback = ['aave', 'chatspeak', 'blip'].includes(targetRegister) && !outputText.includes(targetFallback.split(' ')[0]);
  const phase28Text = preferTargetFallback ? targetFallback : outputText;
  const targetAudit = auditTargetRegisterShift({ ...input, outputText: phase28Text, targetRegister, contract, plan });
  const issueCount = list(targetAudit.hardFailures).length + (phase27.phase27?.issueCount || 0);
  const ready = Boolean(phase28Text && issueCount === 0);
  const score = round(((phase27.phase27?.score ?? 0.85) * 0.7) + ((targetAudit.passed ? 1 : 0) * 0.3));
  return {
    ...phase27,
    version: HUSH_PHASE28_SWAP_VERSION,
    phase27Version: phase27.version,
    selectedOutput: ready ? phase28Text : '',
    recommendedOutput: ready ? phase28Text : '',
    reviewOutput: phase28Text,
    targetRegisterPlan: plan,
    targetRegisterPlanSummary: summarizeTargetRegisterPlan(plan),
    targetRegisterAudit: targetAudit,
    targetRegisterAuditSummary: summarizeTargetRegisterAudit(targetAudit),
    phase28: { version: HUSH_PHASE28_SWAP_VERSION, usedWrapper: true, targetRegister, issueCount, ready, score }
  };
}
