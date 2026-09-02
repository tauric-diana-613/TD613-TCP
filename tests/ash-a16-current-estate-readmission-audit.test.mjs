import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

const manifestPath='docs/pedagogue/experiments/receipts/ASH_A16_CURRENT_ESTATE_READMISSION_AUDIT_V0_1.json';
const auditPath='docs/pedagogue/experiments/ASH_A16_CURRENT_ESTATE_READMISSION_AUDIT_V0_1.md';

for(const path of [manifestPath,auditPath])assert.equal(fs.existsSync(path),true,`${path} must remain present.`);
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const audit=fs.readFileSync(auditPath,'utf8');

function gitBlobSha(path){
  const body=fs.readFileSync(path);
  return crypto.createHash('sha1').update(Buffer.from(`blob ${body.length}\0`)).update(body).digest('hex');
}

assert.equal(manifest.schema,'td613.ash.a16-current-estate-readmission-audit/v0.1');
assert.equal(manifest.status,'AUDIT_CANDIDATE_ENTRY_HELD');
assert.equal(manifest.new_science,false);
assert.equal(manifest.a16_implementation,false);
assert.deepEqual(
  [manifest.accession_parent.pr,manifest.accession_parent.head,manifest.accession_parent.run_number,manifest.accession_parent.run_id,manifest.accession_parent.conclusion],
  [995,'5acce3d1729eb3087bc997e87288fbd91b2a2a5c',2476,33617850209,'success']
);

for(const item of Object.values(manifest.governing_sources)){
  assert.equal(fs.existsSync(item.path),true,`${item.path} governing source must exist.`);
  assert.equal(gitBlobSha(item.path),item.blob,`${item.path} governing source drifted.`);
}
for(const item of Object.values(manifest.current_estate_diagnostics)){
  assert.equal(fs.existsSync(item.path),true,`${item.path} diagnostic source must exist.`);
  assert.equal(gitBlobSha(item.path),item.blob,`${item.path} current-estate diagnostic source drifted.`);
}

const gates=Object.fromEntries(manifest.entry_gates.map(g=>[g.id,g]));
assert.equal(gates.A12_A15_DOSSIER_MERGED.satisfied,true);
assert.equal(gates.A16_A19_HANDOFF_MERGED.satisfied,true);
assert.equal(gates.OPERATOR_VISUAL_REVIEW_RECORDED_OR_WAIVED.satisfied,false);
assert.equal(gates.OPERATOR_VISUAL_REVIEW_RECORDED_OR_WAIVED.disposition,'STILL_REQUIRES_HUMAN_OBSERVATION_OR_EXPLICIT_WAIVER');
assert.equal(gates.A15_VISUAL_ERRATA_REPAIRED_OR_HELD.satisfied,false);
assert.equal(gates.A16_0_SCOPE_ACCEPTED.satisfied,false);
assert.equal(gates.SINGLE_ACTIVE_A16_BRANCH_CANDIDATE.satisfied,false);
assert.equal(gates.CI_CONFIRMATION_ARCHITECTURE_ADOPTED.satisfied,true);
assert.equal(gates.GOLDEN_EGG_REMAINS_OUTSIDE_A16_A19.satisfied,true);

const a15Release=fs.readFileSync(manifest.governing_sources.a15_release_relock.path,'utf8');
assert.match(a15Release,/operator visual review = OPEN/);
assert.match(a15Release,/A16 implementation authority = HELD/);
assert.match(a15Release,/browser evidence ≠ operator visual review/);

const handoff=fs.readFileSync(manifest.governing_sources.a16_handoff.path,'utf8');
for(const gateText of [
  'A12–A15 dossier merged = true',
  'A16–A19 handoff merged = true',
  'operator visual review recorded or explicitly waived = true',
  'A15 visual errata either repaired or explicitly held = true',
  'A16-0 scope accepted = true',
  'single active branch/candidate = true',
  'CI confirmation architecture adopted = true',
  'Golden Egg remains outside A16–A19 = true'
])assert.ok(handoff.includes(gateText),`Historical A16 entry gate must remain: ${gateText}`);
assert.match(handoff,/A16 implementation = HELD/);

const rest=fs.readFileSync(manifest.governing_sources.a15_r0_rest.path,'utf8');
assert.match(rest,/sequence_authority = false/);
assert.match(rest,/next_stage = null/);
assert.match(rest,/stage_unlocks = \[\]/);
assert.match(rest,/golden_egg_earned = false/);

const whole=fs.readFileSync(manifest.current_estate_diagnostics.whole_instrument_presentation_owner.path,'utf8');
assert.match(whole,/export function compileAshWorkspaceScene/,'Whole-instrument presentation retains a local scene compiler.');
assert.match(whole,/const WORKSPACE_SCENES = Object\.freeze/,'Whole-instrument presentation retains local workspace scene declarations.');
assert.match(whole,/claim_ceiling:/,'Whole-instrument presentation retains a local claim-ceiling declaration.');
assert.match(whole,/export function compileAshTransitionDelta/,'Whole-instrument presentation retains a local transition invariant surface.');
assert.doesNotMatch(whole,/compilePedagogicalScene/,'Whole-instrument presentation must not be falsely represented as directly calling the canonical scene compiler.');
assert.doesNotMatch(whole,/compileRouteGraph/,'Whole-instrument presentation must not be falsely represented as live route-burden compilation.');
assert.doesNotMatch(whole,/computeDeclaredBurden/,'Whole-instrument presentation must not be falsely represented as live route-burden computation.');

const canonicalAdapter=fs.readFileSync('app/engine/ash-pedagogue-adapter.js','utf8');
assert.match(canonicalAdapter,/compilePedagogicalScene/,'Canonical Ash pedagogue adapter must retain the canonical Flow-Core scene compiler.');
assert.match(canonicalAdapter,/compilePedagogicalTransition/,'Canonical Ash pedagogue adapter must retain the canonical transition compiler.');
const burden=fs.readFileSync('app/engine/flowcore-route-burden.js','utf8');
assert.match(burden,/export async function compileRouteGraph/);
assert.match(burden,/export function computeDeclaredBurden/);
assert.match(burden,/export function compareBurdenModels/);
assert.match(burden,/export async function compileBurdenReceipt/);

const registry=fs.readFileSync(manifest.current_estate_diagnostics.demo_registry.path,'utf8');
const journeys=fs.readFileSync(manifest.current_estate_diagnostics.a15_profile_journeys.path,'utf8');
assert.match(registry,/\['experimental', 'custodial', 'audit', 'implementation'\]/);
assert.match(journeys,/ASH_A15_ROUTES = Object\.freeze\(\['experimental', 'custodial', 'audit', 'implementation'\]\)/);
assert.match(journeys,/EXPERIENTIAL:'experimental'/);
assert.match(journeys,/EXPERIMENTAL:'experimental'/);
assert.match(whole,/EXPERIENTIAL: Object\.freeze/);
assert.match(whole,/label: 'Learn by doing'/);

const debts=Object.fromEntries(manifest.carried_debts.map(d=>[d.id,d]));
assert.equal(debts[1].disposition,'PRESERVED_OPEN');
assert.equal(debts[2].disposition,'PRESERVED_OPEN');
assert.equal(debts[3].disposition,'PRESERVED_OPEN');
assert.equal(debts[4].disposition,'PRESERVED_OPEN');
assert.equal(debts[5].disposition,'PRESERVED_AS_NON_EQUIVALENCE');
assert.equal(debts[6].disposition,'PRESERVED_OPEN_DRIFT_EVIDENCED');
assert.equal(debts[7].disposition,'STILL_REQUIRES_HUMAN_OBSERVATION');
assert.equal(debts[8].disposition,'STILL_REQUIRES_HUMAN_OBSERVATION_OR_WAIVER');

assert.equal(manifest.sequence_reconciliation.a20_ge0_after_a19_as_sequence_authority,'SUPERSEDED');
assert.equal(manifest.sequence_reconciliation.golden_egg_outside_a16_product_authority,'PRESERVED');
assert.equal(manifest.sequence_reconciliation.phase_free_western_scientific_reopening,'PRESERVED');
assert.equal(manifest.sequence_reconciliation.a19_required_before_western_science,false);
assert.equal(manifest.sequence_reconciliation.a19_required_before_a16_product_closure,true);

assert.equal(manifest.proposed_a16_0r_scope.status,'PROPOSED_NOT_ACCEPTED');
assert.equal(manifest.proposed_a16_0r_scope.self_accepting,false);
assert.deepEqual(manifest.proposed_a16_0r_scope.pillars,[
  'CANONICAL_COMPILER_OWNERSHIP_AND_PRESENTATION_LABELING',
  'SINGLE_AIA_INVARIANT_SOURCE',
  'RENDERED_WORKSPACE_ANISOTROPY',
  'LIVE_ROUTE_BURDEN_COMPILATION',
  'TERMINOLOGY_CONCORDANCE',
  'CURRENT_ESTATE_CUSTODY_CONCORDANCE'
]);

assert.equal(manifest.decision.a16_readmission,'HELD');
assert.equal(manifest.decision.a16_mutation_authority,false);
assert.equal(manifest.decision.a16_implementation_started,false);
assert.equal(manifest.decision.human_gate_count_unsatisfied,2);
assert.equal(manifest.decision.governance_gate_count_unsatisfied,2);
assert.equal(manifest.decision.machine_repair_can_satisfy_all_remaining_gates,false);
for(const [key,value] of Object.entries(manifest.authority))assert.equal(value,false,`Audit authority ${key} must remain false.`);
for(const [key,value] of Object.entries(manifest.membranes))assert.equal(value,true,`Audit membrane ${key} must remain true.`);

const flowcore=fs.readFileSync(manifest.current_estate_diagnostics.flowcore_promotion_config.path,'utf8');
assert.match(flowcore,/default_enabled:\s*false/);
assert.match(flowcore,/route_promotion_authorized:\s*false/);
assert.match(flowcore,/human_promotion_required:\s*true/);

const landing2=JSON.parse(fs.readFileSync('docs/pedagogue/experiments/receipts/WESTERN_HORIZON_EXECUTABLE_ACCESSION_MANIFEST_V0_1.json','utf8'));
assert.equal(landing2.claims.golden_egg_earned,false);
assert.equal(landing2.claims.live_loom_mutated,false);
assert.equal(landing2.scope.a16_implementation,false);

const workflow=fs.readFileSync('.github/workflows/td613-ci.yml','utf8');
assert.match(workflow,/branches: \[main\]/);
assert.match(workflow,/types: \[opened, synchronize, reopened, ready_for_review\]/);
assert.match(workflow,/Validate Ash A15 empirical profile journeys and A15-R0 research field/);

for(const law of [
  'AUDIT_GREEN != A16_READMISSION',
  'A16_READMISSION != A16_IMPLEMENTATION',
  'MACHINE_GREEN != HUMAN_REVIEW',
  'A20_GE0_AFTER_A19_AS_SEQUENCE_AUTHORITY = SUPERSEDED',
  'GOLDEN_EGG_OUTSIDE_A16_PRODUCT_AUTHORITY = PRESERVED',
  'A16_0R_PROPOSED != A16_0R_ACCEPTED'
])assert.ok(audit.includes(law),`Audit must preserve ${law}.`);

console.log('Ash A16 current-estate re-admission audit hardening passed.');
