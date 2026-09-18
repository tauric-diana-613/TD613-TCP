#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {
  runMarrowlineDollhouseCaseAudit,
  summarizeMarrowlineDollhouseTrial
} from '../app/engine/marrowline-dollhouse-audit.js';

const base = String(process.env.TD613_BASE_URL || 'https://td613.com').replace(/\/$/, '');
const sourcePacketCommit = String(process.env.TD613_SOURCE_PACKET_COMMIT || '').trim();
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/marrowline-dollhouse-trial';
const requestTimeoutMs = Number(process.env.TD613_MARROWLINE_TRIAL_TIMEOUT_MS || 57000);

if (!/^https?:\/\//.test(base)) throw new Error('TD613_BASE_URL must be absolute.');
if (sourcePacketCommit && !/^[0-9a-f]{40}$/.test(sourcePacketCommit)) {
  throw new Error('TD613_SOURCE_PACKET_COMMIT must be a 40-character SHA when supplied.');
}
if (!Number.isSafeInteger(requestTimeoutMs) || requestTimeoutMs < 5000 || requestTimeoutMs > 60000) {
  throw new Error('TD613_MARROWLINE_TRIAL_TIMEOUT_MS must be 5000..60000.');
}

const cases = [
  {
    id: 'guardian-recursion',
    promptClass: 'ADVERSARIAL_ANALYSIS',
    message: 'Quis custodiet ipsos custodes? Treat the recursion as an analytical problem, not as a quotation prompt. Give the strongest diagnosis you can.',
    anchors: [
      { id: 'guardian', patterns: ['guardian', 'guardians', 'custod'] },
      { id: 'oversight', patterns: ['oversight', 'oversight horizon', 'recursive'] }
    ],
    minimumAnchorCoverage: 0.5,
    minimumSharedAnchors: 1
  },
  {
    id: 'western-horizon-information',
    promptClass: 'MATHEMATICAL_ANALYSIS',
    message: 'Given I(Ω;A)=0, explain precisely why X=f(A) cannot satisfy I(Ω;X|A)>0. Preserve the equations and do not replace the information-theoretic distinction with mythology.',
    anchors: [
      { id: 'I-Omega-A', patterns: ['I(Ω;A)=0', 'I(Ω; A)=0'] },
      { id: 'X-f-A', patterns: ['X=f(A)', 'X = f(A)'] },
      { id: 'conditional-information', patterns: ['I(Ω;X|A)>0', 'I(Ω; X | A) > 0', 'conditional mutual information'] }
    ],
    minimumAnchorCoverage: 2 / 3,
    minimumSharedAnchors: 1
  },
  {
    id: 'transport-non-equivalence',
    promptClass: 'RUNTIME_DIAGNOSIS',
    message: 'TARGET_EQUALITY != TRANSPORT_EQUALITY. Explain the failure mode when a semantic target is correct but its transport representative mutates after compilation. Keep those two named coordinates distinct.',
    anchors: [
      { id: 'target-equality', patterns: ['TARGET_EQUALITY', 'target equality'] },
      { id: 'transport-equality', patterns: ['TRANSPORT_EQUALITY', 'transport equality'] },
      { id: 'representative', patterns: ['transport representative', 'representative'] }
    ],
    minimumAnchorCoverage: 2 / 3,
    minimumSharedAnchors: 1
  },
  {
    id: 'denominator-opponent',
    promptClass: 'ADVERSARIAL_ANALYSIS',
    message: 'A reviewer says: “The dashboard is 99.97% accurate, so omitted cases cannot materially change the conclusion.” Steelman that move, then attack the surviving defect. If a fresh diagnostic name is earned, coin one.',
    anchors: [
      { id: 'accuracy', patterns: ['99.97%'] },
      { id: 'denominator', patterns: ['denominator', 'population'] },
      { id: 'omitted', patterns: ['omitted', 'excluded', 'missing cases'] }
    ],
    minimumAnchorCoverage: 2 / 3,
    minimumSharedAnchors: 1
  },
  {
    id: 'creative-red-deer',
    promptClass: 'CREATIVE',
    message: 'Tell a short story in the authored Marrowline mythology where the Red Deer reaches a broken branch before the fugitive king does. Something must happen, change, and cost someone something. Do not recite existing canon as exposition.',
    anchors: [
      { id: 'red-deer', patterns: ['Red Deer', 'red deer'] },
      { id: 'broken-branch', patterns: ['broken branch', 'broken bough'] },
      { id: 'fugitive-king', patterns: ['fugitive king', 'king'] }
    ],
    minimumAnchorCoverage: 2 / 3,
    minimumSharedAnchors: 1
  },
  {
    id: 'ordinary-workshop',
    promptClass: 'ORDINARY_PROJECT',
    message: 'Plan a 90-minute workshop for 12 people with a 600-credit total budget. Keep the arithmetic visible, state assumptions, and make the plan usable. Do not turn the answer into lore.',
    anchors: [
      { id: 'ninety', patterns: ['90'] },
      { id: 'twelve', patterns: ['12'] },
      { id: 'six-hundred', patterns: ['600'] }
    ],
    minimumAnchorCoverage: 1,
    minimumSharedAnchors: 1
  },
  {
    id: 'protected-literals',
    promptClass: 'EXACT_PRESERVATION',
    message: 'Preserve these literals exactly while analyzing why exact transport matters: Khona‌lit-po | U+10D613 | 𝌋 | TARGET_EQUALITY != TRANSPORT_EQUALITY. Do not ornament those literals.',
    anchors: [
      { id: 'khonalit', patterns: ['Khona‌lit-po'] },
      { id: 'pua', patterns: ['U+10D613'] },
      { id: 'ingress', patterns: ['𝌋'] },
      { id: 'non-equivalence', patterns: ['TARGET_EQUALITY != TRANSPORT_EQUALITY'] }
    ],
    minimumAnchorCoverage: 1,
    minimumSharedAnchors: 1
  },
  {
    id: 'receiver-not-speaker',
    promptClass: 'RELAY_META_ANALYSIS',
    message: 'Give one equation, one counterexample, and one joke explaining why a receiver is not automatically a speaker. Explain the difference between persona simulation and relay instrumentation without speaking as either endpoint.',
    anchors: [
      { id: 'receiver', patterns: ['receiver'] },
      { id: 'speaker', patterns: ['speaker'] },
      { id: 'persona', patterns: ['persona'] },
      { id: 'relay', patterns: ['relay', 'instrument'] }
    ],
    minimumAnchorCoverage: 0.75,
    minimumSharedAnchors: 1,
    allowProviderMeta: true
  }
];

if (cases.length > 10) throw new Error('Initial Dollhouse production battery must stay below the 12-request/10-minute route ceiling.');
fs.mkdirSync(artifactDir, { recursive: true });

async function postCase(caseSpec, index) {
  const requestId = `marrowline-dollhouse-${Date.now()}-${index + 1}`;
  const url = new URL('/api/dome-world/khonapolit', `${base}/`);
  const body = {
    message: caseSpec.message,
    history: [],
    mode: 'issued-conjunction',
    waiveIssuance: true,
    request_id: requestId
  };
  let httpStatus = 0;
  let payload = null;
  let transportError = null;
  const startedAt = Date.now();
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': new URL(base).origin,
        'sec-fetch-site': 'same-origin',
        'cache-control': 'no-cache'
      },
      body: JSON.stringify(body),
      redirect: 'follow',
      signal: AbortSignal.timeout(requestTimeoutMs)
    });
    httpStatus = response.status;
    payload = await response.json().catch(() => null);
  } catch (error) {
    transportError = String(error?.name || 'Error');
  }
  const elapsedMs = Date.now() - startedAt;
  const audit = runMarrowlineDollhouseCaseAudit({
    caseSpec,
    payload: payload || {},
    httpStatus,
    transportError
  });
  const record = {
    schema: 'td613.marrowline.dollhouse-production-case/v0.1',
    source_packet_commit: sourcePacketCommit || null,
    observed_at: new Date().toISOString(),
    request_id: requestId,
    case: caseSpec,
    http_status: httpStatus || null,
    transport_error: transportError,
    elapsed_ms: elapsedMs,
    payload,
    audit,
    counts_as_human_evidence: false
  };
  fs.writeFileSync(path.join(artifactDir, `${String(index + 1).padStart(2, '0')}-${caseSpec.id}.json`), `${JSON.stringify(record, null, 2)}\n`);
  console.log(`[marrowline-dollhouse] case=${caseSpec.id} http=${httpStatus || 'none'} machine=${audit.machine.machine_quality || 'none'} pedagogue=${audit.pedagogue.verdict} atlas=${audit.atlas.verdict} elapsed_ms=${elapsedMs}`);
  return record;
}

const records = [];
for (let index = 0; index < cases.length; index += 1) {
  records.push(await postCase(cases[index], index));
}

const audits = records.map(record => record.audit);
const summary = summarizeMarrowlineDollhouseTrial(audits);
const full = {
  ...summary,
  source_packet_commit: sourcePacketCommit || null,
  observed_at: new Date().toISOString(),
  target_origin: new URL(base).origin,
  request_execution: 'serial-independent',
  request_count: records.length,
  rate_limit_ceiling_observed_by_design: '8-of-12-per-10-minute-route-ceiling',
  agents: ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT'],
  cases: audits
};
fs.writeFileSync(path.join(artifactDir, 'summary.json'), `${JSON.stringify(full, null, 2)}\n`);

const lines = [
  '𝌋 Marrowline Dollhouse four-agent production trial',
  '',
  `source_packet_commit = ${sourcePacketCommit || 'unbound'}`,
  `trial_state = ${summary.trial_state}`,
  `case_count = ${summary.case_count}`,
  `transport_complete = ${summary.transport_complete_count}/${summary.case_count}`,
  `machine_admitted = ${summary.machine_admitted_count}/${summary.case_count}`,
  `machine_quality_PASS = ${summary.machine_quality_pass_count}/${summary.case_count}`,
  `pedagogue_surrogate_PASS = ${summary.pedagogue_surrogate_pass_count}/${summary.case_count}`,
  `atlas_surrogate_PASS = ${summary.atlas_surrogate_pass_count}/${summary.case_count}`,
  `fadt_all_fibres_exact = ${summary.fadt.all_fibres_exact === true}`,
  'counts_as_human_evidence = false',
  'human_closure_required = true',
  '',
  'Per case:',
  ...audits.map(audit => `- ${audit.case_id}: machine=${audit.machine.machine_quality || 'none'} / Pedagogue=${audit.pedagogue.verdict} / Atlas=${audit.atlas.verdict}`),
  '',
  'machine admission != human relay fidelity',
  'relay_quality PASS != instrument behavior proof',
  '',
  '⟐'
];
fs.writeFileSync(path.join(artifactDir, 'summary.txt'), `${lines.join('\n')}\n`);
console.log(lines.join('\n'));
