import fs from 'node:fs/promises';
import path from 'node:path';
import { buildPhase14CaseBank, evaluatePhase14Candidate, rerankPhase14Candidates } from '../app/engine/hush-phase14-cognitive-authorship-gate.js';
import { HUSH_PHASE14_COGNITIVE_PROCESS_PROFILES, HUSH_PHASE14_DETECTOR_NON_CLAIMS } from '../app/data/hush-phase14-cognitive-process-profiles.js';

const QUEENIE_TIME_BEARING_FIXTURE = 'Memory before proof: the receipt has to warm up before it speaks.\n\nFILE-72 still stays attached. The footer mismatch is not resolved; hold that as the aside.\n\nBack to the receipt: that part matters later because this is a receipt return with evidence with attitude.';

export async function buildPhase14CognitiveAudit() {
  const cases = buildPhase14CaseBank().map((item) => item.case_id === 'time-bearing-faithful' ? { ...item, candidate_text: QUEENIE_TIME_BEARING_FIXTURE } : item);
  const evaluations = cases.map((item) => evaluatePhase14Candidate(item));
  const selector = rerankPhase14Candidates({
    mask_id: 'grandma-receipts',
    source_text: cases[0].source_text,
    phase13_profile_fidelity_score: 0.78,
    candidates: [
      { candidate_id: 'polished-completion', candidate_text: cases[0].candidate_text },
      { candidate_id: 'time-bearing-faithful', candidate_text: cases[1].candidate_text }
    ]
  });
  const failures = [];
  if (HUSH_PHASE14_COGNITIVE_PROCESS_PROFILES.length < 13) failures.push('profile-count-low');
  const polished = evaluations.find((entry) => entry.candidate_id === 'polished-completion');
  const faithful = evaluations.find((entry) => entry.candidate_id === 'time-bearing-faithful');
  const fakeMess = evaluations.find((entry) => entry.candidate_id === 'fake-mess-damage');
  const detectorMisuse = evaluations.find((entry) => entry.candidate_id === 'detector-misuse');
  if (!polished || !faithful || !fakeMess || !detectorMisuse) failures.push('case-bank-incomplete');
  if (faithful?.process_fidelity_score <= polished?.process_fidelity_score) failures.push('time-bearing-fidelity-not-higher');
  if (faithful?.completion_prior_score >= polished?.completion_prior_score) failures.push('completion-prior-not-penalized');
  if (selector.selected_candidate_id !== 'time-bearing-faithful') failures.push('selector-did-not-prefer-time-bearing-candidate');
  if (!fakeMess?.hard_blockers.includes('semantic-integrity-failed')) failures.push('fake-mess-not-blocked');
  if (!detectorMisuse?.hard_blockers.includes('detector-authority-misuse')) failures.push('detector-misuse-not-blocked');
  return Object.freeze({
    schema: 'td613-hush-phase14-cognitive-audit/v1',
    phase: 14,
    status: failures.length ? 'fail' : 'pass',
    profile_count: HUSH_PHASE14_COGNITIVE_PROCESS_PROFILES.length,
    selector,
    evaluations,
    detector_non_claims: HUSH_PHASE14_DETECTOR_NON_CLAIMS,
    failures
  });
}

export async function writePhase14Docs(audit, root = process.cwd()) {
  const dir = path.join(root, 'docs', 'hush');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'PHASE_14_COGNITIVE_AUTHORSHIP_GATE.md'), `# Phase 14 — Cognitive Authorship Gate\n\nPhase 14 scores process-level mask fidelity: memory return, delayed clarification, revision pressure, interruption topology, closure asymmetry, and completion-prior discipline.\n\nStatus: ${audit.status}\n\nProfiles: ${audit.profile_count}\n\nSelected fixture candidate: ${audit.selector.selected_candidate_id}\n\nSealed ⟐\n`, 'utf8');
  await fs.writeFile(path.join(dir, 'PHASE_14_COMPLETION_PRIOR_PENALTY.md'), '# Phase 14 — Completion Prior Penalty\n\nCandidates are penalized when they resolve every idea in a clean thesis-explanation-conclusion path with no temporal residue, memory return, or asymmetric closure.\n\nSealed ⟐\n', 'utf8');
  await fs.writeFile(path.join(dir, 'PHASE_14_TEMPORAL_DRAFTING_SIGNATURES.md'), '# Phase 14 — Temporal Drafting Signatures\n\nTemporal drafting signatures approximate process traces such as delayed clarification, recursive return, local revision pressure, interruption topology, and uneven closure.\n\nSealed ⟐\n', 'utf8');
  await fs.writeFile(path.join(dir, 'PHASE_14_PROCESS_FIDELITY_ACCEPTANCE.md'), '# Phase 14 — Process Fidelity Acceptance\n\nA candidate may beat a polished competitor when it preserves meaning, keeps Phase 13 fidelity, and better satisfies the selected mask process profile. Fake mess remains blocked.\n\nSealed ⟐\n', 'utf8');
  await fs.writeFile(path.join(dir, 'PHASE_14_DETECTOR_NONCLAIMS.md'), `# Phase 14 — Detector Non-Claims\n\nDetector observations are low-authority only. They never prove authorship, AI generation, identity, intent, or release fitness.\n\n${audit.detector_non_claims.map((claim) => `- ${claim}`).join('\n')}\n\nSealed ⟐\n`, 'utf8');
}

async function main() {
  const audit = await buildPhase14CognitiveAudit();
  if (process.argv.includes('--write-docs')) await writePhase14Docs(audit);
  console.log(JSON.stringify({ status: audit.status, profile_count: audit.profile_count, selected_candidate_id: audit.selector.selected_candidate_id, failures: audit.failures }, null, 2));
  if (audit.status !== 'pass') process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((error) => { console.error(error); process.exitCode = 1; });
