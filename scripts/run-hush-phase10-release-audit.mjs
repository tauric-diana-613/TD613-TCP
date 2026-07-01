import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPhase9Audit } from './run-hush-phase9-audit.mjs';
import { buildPhase10CaseBank, buildHushPhase10ReleasePacket } from '../app/engine/hush-phase10-release-discipline.js';
import { HUSH_PHASE10_NON_CLAIMS, HUSH_RELEASE_EVIDENCE_LADDER, HUSH_RELEASE_STATUSES } from '../app/data/hush-phase10-release-statuses.js';

export async function buildHushPhase10ReleaseAudit() {
  const phase9 = await buildPhase9Audit();
  const cases = buildPhase10CaseBank();
  const phase9MaxCollisionSeverity = Math.max(
    ...phase9.full_collision_matrix.map((cell) => cell.severity),
    ...phase9.dangerous_pair_matrix.map((cell) => cell.severity)
  );
  const representative = buildHushPhase10ReleasePacket({
    packet_id: 'HUSH-P10-AUDIT-REPRESENTATIVE',
    source_packet_id: phase9.packet_bank?.[0]?.packet_id || 'P9-001',
    mask_id: phase9.manifests?.[0]?.mask_id || 'unknown-mask',
    mask_label: phase9.manifests?.[0]?.display_label || 'unknown mask',
    native_role: phase9.manifests?.[0]?.native_role || 'unknown role',
    local_validation: { pass: phase9.local_execution_status === 'pass', mandatory_anchors_preserved: true, source_obligations_exist: true },
    phase8_mask_validation: { pass: true, fixture_bank_present: true, docs_present: true },
    phase9_collision_validation: { pass: phase9.status === 'pass', max_collision_severity: phase9MaxCollisionSeverity, dangerous_pair_available: true },
    provider_contract_validation: { pass: true, mode: 'fixture-backed', preserved_propositions: ['FILE-72'], dropped_propositions: [], new_claims: [], risk_flags: [], drift_classified: true },
    export_policy_validation: { pass: phase9.export_policy_report.status === 'pass', public_default_allowed: false, raw_sample_export_allowed: false, raw_candidate_export_allowed: false, raw_sample_exported: false, raw_candidate_exported: false },
    safe_harbor_boundary: { assessed: true, eligible: false, receipt_treated_as_proof: false },
    aperture_boundary: { checked: true, release_authority: false, validator_bypass: false }
  });
  const expectedCases = new Map([
    ['P10-CASE-1-CLEAN-LOCAL', { status: 'fixture-provider-pass', blockers: [] }],
    ['P10-CASE-2-RAW-CANDIDATE-LEAK', { status: 'blocked', blockers: ['raw candidate exported'] }],
    ['P10-CASE-3-PUBLIC-DEFAULT-UNDEFINED', { status: 'blocked', blockers: ['public_default_allowed undefined'] }],
    ['P10-CASE-4-HARBOR-RECEIPT-RUNTIME-MISSING', { status: 'fixture-provider-pass', blockers: [] }],
    ['P10-CASE-5-PROVIDER-ADDS-CLAIM', { status: 'blocked', blockers: ['new factual claim added'] }],
    ['P10-CASE-6-COLLISION-SEVERITY-2', { status: 'local-pass', blockers: [] }],
    ['P10-CASE-7-COLLISION-SEVERITY-3', { status: 'blocked', blockers: ['collision severity 3'] }]
  ]);
  const auditFailures = [];
  if (phase9.status !== 'pass') auditFailures.push(`Phase 9 audit status is ${phase9.status}`);
  for (const entry of cases) {
    const expected = expectedCases.get(entry.packet_id);
    if (!expected) {
      auditFailures.push(`${entry.packet_id}: no expected audit posture`);
      continue;
    }
    if (entry.release_status !== expected.status) {
      auditFailures.push(`${entry.packet_id}: expected ${expected.status}, received ${entry.release_status}`);
    }
    for (const blocker of expected.blockers) {
      if (!entry.hard_blockers.includes(blocker)) auditFailures.push(`${entry.packet_id}: missing blocker ${blocker}`);
    }
  }
  if (representative.release_status !== 'blocked' || !representative.hard_blockers.includes('collision severity 3')) {
    auditFailures.push('representative packet did not preserve the Phase 9 severity-3 blocker');
  }
  const blockers = cases.flatMap((entry) => entry.hard_blockers.map((blocker) => `${entry.packet_id}: ${blocker}`));
  return Object.freeze({
    schema: 'td613-hush-phase10-release-audit/v1',
    phase: 10,
    title: 'Hush Packet Release Discipline v1',
    status: auditFailures.length ? 'fail' : 'pass',
    release_statuses: HUSH_RELEASE_STATUSES,
    evidence_ladder: HUSH_RELEASE_EVIDENCE_LADDER,
    representative_packet: representative,
    case_bank: cases,
    non_claims: HUSH_PHASE10_NON_CLAIMS,
    hard_blocker_observations: blockers,
    audit_failures: Object.freeze(auditFailures),
    runtime_evidence_status: 'not run — environment limitation',
    release_recommendation: 'Phase 10 release discipline can merge when local tests pass; deployed runtime release claims remain pending until runtime evidence exists.'
  });
}

function table(rows, cols) {
  return [`| ${cols.join(' | ')} |`, `| ${cols.map(() => '---').join(' | ')} |`, ...rows.map((row) => `| ${cols.map((col) => String(row[col] ?? '').replace(/\|/g, '\\|')).join(' | ')} |`)].join('\n');
}

export async function writePhase10Docs(audit, root = process.cwd()) {
  const dir = path.join(root, 'docs', 'hush');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'PHASE_10_HUSH_PACKET_RELEASE_DISCIPLINE.md'), `# Phase 10 — Hush Packet Release Discipline v1\n\nPhase 10 decides what prior evidence may release. A passing packet is not a released packet. A receipt is not a release. A provider return is not governance.\n\nStatus: ${audit.status}\n\nRelease recommendation: ${audit.release_recommendation}\n\nRuntime evidence: ${audit.runtime_evidence_status}\n\n## Non-claims\n\n${audit.non_claims.map((claim) => `- ${claim}`).join('\n')}\n\nSeal: ⟐\n`, 'utf8');
  await fs.writeFile(path.join(dir, 'PHASE_10_RELEASE_STATUS_MODEL.md'), `# Phase 10 Release Status Model\n\n${audit.release_statuses.map((status) => `- ${status}`).join('\n')}\n\nNo algorithm returns sealed automatically.\n`, 'utf8');
  await fs.writeFile(path.join(dir, 'PHASE_10_RELEASE_EVIDENCE_LADDER.md'), `# Phase 10 Release Evidence Ladder\n\n${table(audit.evidence_ladder, ['id', 'level', 'label'])}\n\nA packet cannot skip rungs.\n`, 'utf8');
  await fs.writeFile(path.join(dir, 'PHASE_10_RUNTIME_RELEASE_CHECKLIST.md'), `# Phase 10 Runtime Release Checklist\n\n1. Open deployed TD613.com surface.\n2. Record URL.\n3. Record build or commit identity.\n4. Select mask.\n5. Enter source packet.\n6. Generate candidate.\n7. Capture outbound provider contract.\n8. Capture inbound provider log.\n9. Export packet.\n10. Confirm public-default false.\n11. Confirm raw sample excluded.\n12. Confirm raw candidate excluded.\n13. Confirm non-claims included.\n14. Compare deployed output to local expectation.\n15. Classify provider drift.\n16. Assign release status.\n`, 'utf8');
  await fs.writeFile(path.join(dir, 'PHASE_10_NON_CLAIMS_RELEASE_POLICY.md'), `# Phase 10 Non-Claims Release Policy\n\nPhase 10 may claim observed local validation, fixture-backed provider parity, deployed runtime evidence when captured, export discipline, and release status.\n\nPhase 10 may not claim authorship proof, identity proof, anonymity, legal protection, truth adjudication, consent, safe public release without evidence, Aperture override, Safe Harbor override, or validator bypass.\n`, 'utf8');
}

async function main() {
  const audit = await buildHushPhase10ReleaseAudit();
  const docsWritten = process.argv.includes('--write-docs');
  if (docsWritten) await writePhase10Docs(audit);
  console.log(JSON.stringify({ status: audit.status, cases: audit.case_bank.length, representative_status: audit.representative_packet.release_status, audit_failures: audit.audit_failures, runtime_evidence_status: audit.runtime_evidence_status, docs_written: docsWritten }, null, 2));
  if (audit.status !== 'pass') process.exitCode = 1;
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFile)) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
