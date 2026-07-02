import fs from 'node:fs/promises';
import path from 'node:path';
import { buildPhase13CaseBank, evaluatePhase13Candidate, rerankPhase13Candidates } from '../app/engine/hush-phase13-profile-fidelity-gate.js';
import { HUSH_PHASE13_MASK_FIDELITY_PROFILES, HUSH_PHASE13_NON_CLAIMS } from '../app/data/hush-phase13-mask-fidelity-profiles.js';

export async function buildPhase13FidelityAudit() {
  const cases = buildPhase13CaseBank();
  const evaluations = cases.map((item) => evaluatePhase13Candidate(item));
  const selector = rerankPhase13Candidates({
    mask_id: 'luz-index',
    source_text: cases[0].source_text,
    candidates: [
      { candidate_id: 'smooth-generic', candidate_text: cases[0].candidate_text },
      { candidate_id: 'rough-faithful', candidate_text: cases[1].candidate_text }
    ]
  });
  const failures = [];
  if (HUSH_PHASE13_MASK_FIDELITY_PROFILES.length < 13) failures.push('profile-count-low');
  if (evaluations.find((entry) => entry.candidate_id === 'smooth-generic')?.profile_fidelity_score >= evaluations.find((entry) => entry.candidate_id === 'rough-faithful')?.profile_fidelity_score) failures.push('smooth-candidate-outranks-faithful');
  if (selector.selected_candidate_id !== 'rough-faithful') failures.push('selector-did-not-prefer-faithful-candidate');
  if (!evaluations.some((entry) => entry.hard_blockers.includes('semantic-integrity-failed'))) failures.push('semantic-damage-not-blocked');
  return Object.freeze({
    schema: 'td613-hush-phase13-fidelity-audit/v1',
    phase: 13,
    status: failures.length ? 'fail' : 'pass',
    profile_count: HUSH_PHASE13_MASK_FIDELITY_PROFILES.length,
    selector,
    evaluations,
    non_claims: HUSH_PHASE13_NON_CLAIMS,
    failures
  });
}

export async function writePhase13Docs(audit, root = process.cwd()) {
  const dir = path.join(root, 'docs', 'hush');
  await fs.mkdir(dir, { recursive: true });
  const summary = `# Phase 13 — Profile Fidelity Gate\n\nPhase 13 adds a deterministic selector audit that rewards mask profile fidelity and penalizes overly smooth generic candidates.\n\nStatus: ${audit.status}\n\nProfiles: ${audit.profile_count}\n\nSelected fixture candidate: ${audit.selector.selected_candidate_id}\n\nNon-claims:\n\n${audit.non_claims.map((claim) => `- ${claim}`).join('\n')}\n\nSealed ⟐\n`;
  await fs.writeFile(path.join(dir, 'PHASE_13_ANTI_PERFECTION_FIDELITY_GATE.md'), summary, 'utf8');
  await fs.writeFile(path.join(dir, 'PHASE_13_SYNTHETIC_PERFECTION_PENALTY.md'), '# Phase 13 Smoothness Penalty\n\nThe selector subtracts score for generic transitions, uniform sentence pacing, overly balanced paragraphing, and assistant-like summary voice.\n\nSealed ⟐\n', 'utf8');
  await fs.writeFile(path.join(dir, 'PHASE_13_MASK_NATIVE_VARIANCE_MODEL.md'), '# Phase 13 Mask Native Variance\n\nMask-native variance is rewarded when the candidate matches the selected mask profile while preserving semantic integrity.\n\nSealed ⟐\n', 'utf8');
  await fs.writeFile(path.join(dir, 'PHASE_13_PROFILE_FIDELITY_ACCEPTANCE.md'), '# Phase 13 Acceptance\n\nA candidate may be less polished and still win when it preserves meaning and better satisfies the selected mask profile.\n\nSealed ⟐\n', 'utf8');
}

async function main() {
  const audit = await buildPhase13FidelityAudit();
  if (process.argv.includes('--write-docs')) await writePhase13Docs(audit);
  console.log(JSON.stringify({ status: audit.status, profile_count: audit.profile_count, selected_candidate_id: audit.selector.selected_candidate_id, failures: audit.failures }, null, 2));
  if (audit.status !== 'pass') process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((error) => { console.error(error); process.exitCode = 1; });
