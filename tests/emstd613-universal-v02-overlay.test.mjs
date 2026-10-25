import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { emV02Overlay } from '../packages/dome_world_exact/fixtures/a15-r0/EMSTD613/99-ADMIN/em-universal-v02-overlay.mjs';
import { METHOD,validateProfile,blankProfile } from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/atelier-core-v02.mjs';

const overlay=emV02Overlay();
assert.equal(validateProfile(overlay).valid,true);
assert.equal(overlay.atelier_id,'EMSTD613');
assert.equal(overlay.method_version,'td613.atelier-method/v0.2-candidate');
assert.equal(overlay.source_count,87);
assert.equal(overlay.work_count,32);
assert.deepEqual(overlay.identity_sensitivity.independent_work_count_interval,[32,40]);
assert.equal(overlay.identity_sensitivity.work_identity_fully_resolved,false);
assert.equal(overlay.register_states.claims.declared,'NOT_GENERATED');
assert.equal(overlay.register_states.concepts.declared,'NOT_GENERATED');
assert.equal(overlay.register_states.motifs.declared,'NOT_GENERATED');
assert.equal(overlay.register_states.mechanisms.declared,'NOT_GENERATED');
assert.equal(overlay.register_states.relations.declared,'NOT_GENERATED');
assert.equal(Object.keys(overlay.modules).length,44);
assert.deepEqual(Object.keys(overlay.modules).sort(),METHOD.required_capability_ids.slice().sort());
assert.equal(overlay.modules.STAGE_ORDER_PERMUTATION_IDENTIFIABILITY.implementation_state,'IMPLEMENTED_TESTED');
assert.equal(overlay.modules.STAGE_ORDER_PERMUTATION_IDENTIFIABILITY.corpus_execution,'NOT_TESTED');
for(const k of ['POLYCOMPILATION_CONSERVATION','QUERY_CONDITIONED_CANONICAL_SUFFICIENCY','HELD_OUT_ARCHITECTURAL_PLACEMENT','FOREIGN_DONOR_ARCHITECTURE_STYLE_FACTORIAL'])
  assert.notEqual(overlay.modules[k].corpus_execution,'IMPLEMENTED_TESTED');
assert.equal(overlay.consent_and_contact.public_recognition_route_enabled,false);
assert.equal(overlay.consent_and_contact.outbound_contact_authorized,false);
assert.equal(overlay.scientific_promotion_authority,false);
assert.equal(overlay.current_findings.length,0);
const empty=blankProfile('ATILLA_OZY',{display_name:'Atilla & Ozy'});
assert.equal(empty.source_count,0);
assert.equal(empty.modules.NOMENCLATURE_DECONTAMINATION.implementation_state,'HELD_MISSING_IMPLEMENTATION');

// Verify the overlay never updates the native registered profile or source bytes.
const native=JSON.parse(fs.readFileSync(path.resolve('packages/dome_world_exact/fixtures/a15-r0/EMSTD613/ATELIER_PROFILE.json'),'utf8'));
assert.equal(native.schema,'td613.atelier-profile/v0.1');
assert.equal(native.method_version,'td613.atelier-method/v0.1');
assert.equal(native.human_closure_required,true);
console.log('EM universal v0.2 source-bound overlay: 44 interfaces present, native v0.1 untouched, 87/32 custody interval preserved, advanced assays HELD.');
