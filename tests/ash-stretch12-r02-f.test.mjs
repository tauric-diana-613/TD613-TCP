import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  compileClaimPromotionProposal,
  compileClaimPromotionReceipt,
  compileGovernanceEvent,
  compileQualificationReceipt,
  compileStretch12ClosureReceipt,
  deriveQualificationState,
  lintClaimLanguage,
  verifyEventChain
} from '../app/engine/ash-stretch12-r02-governance.js';
import { compilePortableAssuranceState } from '../app/engine/ash-stretch12-r02-reconstruction.js';

const now = () => new Date('2026-07-17T12:00:00.000Z');
const sequence = [
  'STRETCH12_SPEC_AUTHORED','ENVIRONMENT_PROFILE_COMPILED','ORIGIN_MANIFEST_VERIFIED',
  'CUSTODY_ROOT_VERIFIED','KEY_TOPOLOGY_COMPILED','PROJECTION_COMPILED',
  'READER_CALIBRATED','CONTROL_ASSAY_RUN','RECONSTRUCTION_ASSAY_RUN',
  'JOINING_KEY_ASSAY_RUN','HETEROSTRATIGRAPHIC_TOMOGRAPHY_COMPILED',
  'FLOWCORE_WEATHER_COMPILED','ASH_COURT_REVIEW_ELIGIBLE','RETURN_QUARANTINED'
];
const events = [];
for (let index=0; index<sequence.length; index+=1) {
  events.push(await compileGovernanceEvent({
    event_type:sequence[index], case_id:'case_f', environment_id:'env_f',
    monotonic_local_index:index, prior_event_digest:index ? events[index-1].event_digest : null,
    created_at:now().toISOString()
  }, { now }));
}
assert.equal(await verifyEventChain(events), true);
assert.equal(deriveQualificationState(events).automatic_release, false);

const qualification = await compileQualificationReceipt({
  case_id:'case_f', exact_commit:'exact-head',
  environment_profile_reference:'env:1', environment_profile_digest:'sha256:env',
  projection_reference:'projection:1', projection_digest:'sha256:projection',
  origin_reference:'origin:1', custody_reference:'custody:1', key_topology_reference:'key:1',
  reader_calibration_reference:'reader:1', assay_references:['semantic:1','metadata:1','joining:1'],
  tomography_reference:'tomography:1', flowcore_weather_reference:'weather:1',
  events, created_at:now().toISOString()
}, { now });
assert.equal(qualification.method_requirements_satisfied, true);
assert.equal(qualification.eligible_for_human_claim_review, true);
assert.equal(qualification.automatic_release, false);
assert.equal(qualification.cinder_authority, false);

const assurance = await compilePortableAssuranceState({
  case_id:'case_f', spec_authored:true, static_verified:true, locally_executed:true,
  adversarially_observed:true, environment_specific_demonstration:true, bounded_assurance:true,
  artifact_scope:'sha256:projection', environment_scope:'sha256:env', reader_scope:['reader:1'],
  cryptographic_posture:'VERIFIED', semantic_coverage:'BOUNDED_COMPLETE',
  environment_coverage:'BOUNDED_COMPLETE', flowcore_weather_state:'REVIEW_ELIGIBLE',
  unresolved_surfaces:['unknown external joining corpora'], operator_closure:'OPEN',
  created_at:now().toISOString()
}, { now });
assert.equal(assurance.assurance_class, 'PA5_BOUNDED_ASSURANCE');

const allowedClaim = 'No tested Reader exceeded the declared recovery threshold for the named dimensions under the declared environment.';
assert.equal(lintClaimLanguage(allowedClaim).allowed, true);
assert.equal(lintClaimLanguage('This file is unleakable and safe everywhere.').allowed, false);

const proposal = await compileClaimPromotionProposal({
  qualification_receipt:qualification, assurance_state:assurance,
  proposed_claim:allowedClaim, created_at:now().toISOString()
}, { now });
assert.equal(proposal.status, 'ELIGIBLE_FOR_HUMAN_APPROVAL');
assert.equal(proposal.automatic_approval, false);

await assert.rejects(() => compileClaimPromotionReceipt({
  proposal, operator_gesture:'tiny', created_at:now().toISOString()
}), /Exact human operator gesture/);
const claimReceipt = await compileClaimPromotionReceipt({
  proposal, operator_gesture:'I approve this exact bounded claim.', created_at:now().toISOString()
}, { now });
assert.equal(claimReceipt.approved_by_human, true);
assert.equal(claimReceipt.external_deletion_verified, false);
assert.equal(claimReceipt.universal_secrecy, false);

await assert.rejects(() => compileGovernanceEvent({
  event_type:'OPERATOR_APPROVAL_APPLIED', case_id:'case_f', environment_id:'env_f',
  monotonic_local_index:0, created_at:now().toISOString()
}), /explicit human gesture/);

const openClosure = await compileStretch12ClosureReceipt({
  exact_commit:'exact-head',
  completion_criteria:{
    environment_receipts:true, flowcore_weather:true, tomography:true, derived_rank:true,
    calibrated_readers:true, adapters:true, exact_demonstrations:false,
    serverless_covenant:true, cinder_authority_absent:true
  },
  operator_closure:'OPEN', created_at:now().toISOString()
}, { now });
assert.equal(openClosure.status, 'STRETCH12_OPEN');
assert.ok(openClosure.missing_criteria.includes('exact_demonstrations'));
assert.ok(openClosure.missing_criteria.includes('human_closure'));
assert.equal(openClosure.no_stretch13_constituted, true);

const html = fs.readFileSync('app/dome-world/ash-stretch12-r02-qualification.html','utf8');
const js = fs.readFileSync('app/dome-world/ash-stretch12-r02-qualification.js','utf8');
assert.match(html, /connect-src 'none'/);
assert.match(html, /Constructed preview cannot promote beyond PA2/);
assert.match(js, /CONSTRUCTED_DETERMINISTIC_READER/);
assert.doesNotMatch(js, /fetch\(|indexedDB|localStorage/);

console.log('ash-stretch12-r02-f.test.mjs passed');
