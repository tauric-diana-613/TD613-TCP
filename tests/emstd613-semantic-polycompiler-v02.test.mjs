import assert from 'node:assert/strict';
import { emContextualLineage,emContextualWorkCounterfactual }
 from '../packages/dome_world_exact/fixtures/a15-r0/EMSTD613/99-ADMIN/em-semantic-polycompiler-v02.mjs';
import { traceTypedCompilations,roleAblation }
 from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/atelier-semantic-polycompiler-v02.mjs';

const {model,claims}=emContextualLineage();
assert.equal(model.pass_count,32);
assert.equal(model.role_count,53);
assert.equal(claims.native_work_count,32);
assert.equal(claims.native_manifestation_count,53);
assert.equal(claims.manifest_identity_counts.SAME_WORK_SUPPORTED,16);
assert.equal(claims.manifest_identity_counts.SAME_WORK_CONFIRMED,26);
assert.equal(claims.manifest_identity_counts.SINGLETON_WORK_SURFACE,11);
assert.equal(claims.manifest_identity_counts.NOT_A_WORK_CANDIDATE,34);
assert.deepEqual(claims.held_identity_sensitivity,[32,40]);
assert.equal(claims.native_relation_register_state,'NOT_GENERATED');
assert.equal(claims.relation_register_rewritten,false);
assert.equal(claims.cryptographic_seal_verified,false);
const roles=model.passes.flatMap(p=>p.roles);
assert.equal(roles.filter(x=>x.adjudication_status==='PARTIAL').length,16);
assert.equal(roles.filter(x=>x.adjudication_status==='WITNESSED').length,37);
assert.equal(roles.filter(x=>x.ceiling==='EXPLICIT_SOURCE_WITNESSED_CONTEXTUAL_ROLE').length,0);
assert.ok(roles.every(x=>x.evidence_ids.length===1&&x.evidence_ids[0].startsWith('emsource-sha256:')));
assert.ok(roles.every(x=>x.architecture_id.startsWith('emwork_')));
const supported=roles.find(x=>x.raw_role==='SAME_WORK_SUPPORTED');
assert.ok(supported);
assert.equal(supported.ceiling,'PARTIAL_OR_CANDIDATE_CONTEXTUAL_ROLE');
const trace=traceTypedCompilations(model,{from:supported.subject_id,to:supported.architecture_id,max_hops:1});
assert.ok(trace.routes.some(x=>x.assertion_ids.includes(supported.role_assertion_id)));
assert.ok(trace.routes.every(x=>x.direct_relation_admitted===false));
const c=emContextualWorkCounterfactual(supported.architecture_id,supported.subject_id);
assert.ok(c.withdrawal.withdrawn_roles.includes(supported.role_assertion_id));
assert.equal(c.withdrawal.original_roles-c.withdrawal.retained_roles,1);
assert.equal(c.direct.routes[0].direct_relation_admitted,false);
const removed=roleAblation(model,{target_id:supported.architecture_id,
 withdraw_assertion_ids:[supported.role_assertion_id]});
assert.equal(removed.withdrawn_roles.length,1);
assert.match(claims.claim_ceiling,/NO_SCIENTIFIC_OR_AUTHOR_IDENTITY_PROMOTION/);
console.log('EM real manifest semantic polycompiler: 32 Work passes/53 contextual source roles; supported Work identity 16 PARTIAL, 26 confirmed + 11 singleton native OBSERVED statuses; no source-derived theory/ancestry promotion.');
