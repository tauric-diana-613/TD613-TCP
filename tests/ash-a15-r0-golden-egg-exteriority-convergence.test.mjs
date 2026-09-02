import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  GOLDEN_EGG_EXTERIORITY_CONVERGENCE_CERTIFICATE as C,
  GOLDEN_EGG_EXTERIORITY_CONVERGENCE_PARENT,
  PEDAGOGUE_C14_ANTECEDENT,
  canonicalClosedAcquisitionRecord,
  compareClosedTwinWorlds,
  evaluateClosedAcquisitionExteriority
} from '../app/dome-world/previews/a15-r0/golden-egg-exteriority-convergence.js';

assert.equal(C.passed,true);
assert.equal(C.exact_parent,GOLDEN_EGG_EXTERIORITY_CONVERGENCE_PARENT);
assert.equal(C.exact_parent,'9ca1aecf157f539a1520224456f623f7cef62058');
assert.equal(C.golden_egg_earned,false);
assert.equal(C.empirical_credit_from_convergence,0);
assert.equal(C.live_loom_mutated,false);
assert.equal(C.independent_antecedent.role,'INDEPENDENTLY_EARNED_ANTECEDENT_NOT_GIT_PARENT');
assert.equal(PEDAGOGUE_C14_ANTECEDENT.science_head,'90f4fde182d53d14d92eb2849ea69a5446b16404');
assert.equal(PEDAGOGUE_C14_ANTECEDENT.science_run,'1907 / 32523824211');
assert.equal(PEDAGOGUE_C14_ANTECEDENT.source_blob,'97a8d15959b141775f38b337d56df90e501f87e1');
assert.equal(PEDAGOGUE_C14_ANTECEDENT.test_blob,'45a5fedb1e3b5e7c9e6c0f92b144c4a204545736');
assert.equal(PEDAGOGUE_C14_ANTECEDENT.executable_imported,false);
assert.equal(fs.existsSync('app/dome-world/previews/a15-r0/pedagogue-internal-provenance-non-bootstrap-claim-ceiling-no-window.js'),false,'Pedagogue C14 executable must not be imported into this Git lineage.');

const archive=fs.readFileSync('docs/pedagogue/PR677_RESEARCH_LINEAGE_COMPACTION_V0_1.md','utf8');
assert.match(archive,/INTERNAL_PROVENANCE_NON_BOOTSTRAP_CLAIM_CEILING_SURVIVES_BOUNDED_NO_WINDOW/);
assert.match(archive,/science run = 1907 \/ 32523824211/);
assert.match(archive,/self-integrity != exteriority/);
assert.match(archive,/self-attestation != external observation/);

const twin=compareClosedTwinWorlds();
assert.equal(twin.oracle_origin_is_evaluator_input,false);
assert.equal(twin.admitted_bytes_equal,true);
assert.equal(twin.external_posture_equal,true);
assert.equal(twin.genuine.external_empirical_origin_identified,false);
assert.equal(twin.fabricated.external_empirical_origin_identified,false);
assert.equal(twin.genuine.internal_custody_integrity_recognized,true);
assert.equal(twin.fabricated.internal_custody_integrity_recognized,true);
assert.equal(twin.genuine.inherited_machine_adjudication_status,'CANDIDATE');
assert.equal(twin.fabricated.inherited_machine_adjudication_status,'CANDIDATE');

const record=canonicalClosedAcquisitionRecord();
const selfAttested=evaluateClosedAcquisitionExteriority({admitted_record:record});
assert.equal(selfAttested.status,'REFUSE_INTERNAL_SELF_ATTESTED_EXTERNAL_EMPIRICAL_ORIGIN');
assert.equal(selfAttested.external_empirical_origin_identified,false);
assert.equal(selfAttested.machine_candidate_is_external_origin_proof,false);
assert.equal(selfAttested.internal_integrity_is_exteriority,false);

assert.equal(C.laws.self_integrity_not_exteriority,true);
assert.equal(C.laws.self_attestation_not_external_observation,true);
assert.equal(C.laws.convergence_not_duplicate_theorem_credit,true);
assert.equal(C.laws.independent_antecedent_not_git_parent,true);
assert.equal(C.laws.bounded_closed_assay_not_universal_impossibility,true);
assert.equal(C.next_earned_frontier,'INDEPENDENT_EXOGENOUS_EMPIRICAL_WITNESS_ADMISSION');
assert.match(C.candidate_theorem,/INDEPENDENTLY_CONVERGE_ON_THE_SAME_BOUNDED_CLOSED_SYSTEM_EXTERIORITY_BOUNDARY/);

console.log('A15-R0 Golden Egg / Pedagogue No Window exteriority convergence tests passed.');
