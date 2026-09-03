import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  LIVE_LOOM_SOURCE_BLOB,
  LOOM_ROOM_COMPATIBILITY_CONTRACT,
  LOOM_ADAPTIVE_ROUTE_HOLONOMY_CERTIFICATE as C,
  runLoomAdaptiveRouteHolonomyReceipt
} from '../app/dome-world/previews/a15-r0/loom-adaptive-route-holonomy-receipt.js';

assert.equal(C.status,'LOOM_ADAPTIVE_ROUTE_HOLONOMY_COMPATIBILITY_EARNED');
assert.equal(C.rest_symbol,'𝄐');
assert.equal(C.live_loom_source_blob,LIVE_LOOM_SOURCE_BLOB);
assert.equal(LOOM_ROOM_COMPATIBILITY_CONTRACT.display,'Loom Room');
assert.deepEqual(LOOM_ROOM_COMPATIBILITY_CONTRACT.operators,['米','𝄐','cadence/provenance']);
assert.deepEqual(LOOM_ROOM_COMPATIBILITY_CONTRACT.preserves,['holonomy','pattern-flow','anti-equivalence-edge']);
assert.deepEqual(LOOM_ROOM_COMPATIBILITY_CONTRACT.emits,['motif','cloth-map','route-deformation']);
assert.deepEqual(LOOM_ROOM_COMPATIBILITY_CONTRACT.blocks,['authorship-proof-claim','identity-proof-claim']);

assert.equal(C.same_declared_target,true);
assert.equal(C.same_preregistered_policy,true);
assert.equal(C.same_terminal_state,true);
assert.equal(C.distinct_realized_route_history,true);
assert.equal(C.terminal_state_does_not_determine_route_history,true);
assert.notEqual(C.route_memories.A_SEPARATED.route_memory_digest,C.route_memories.C_SEPARATED.route_memory_digest);
assert.equal(C.route_memories.A_SEPARATED.terminal_projection_digest,C.route_memories.C_SEPARATED.terminal_projection_digest);
assert.equal(C.route_memories.A_SEPARATED.realized_unresolved_target_pairs,0);
assert.equal(C.route_memories.C_SEPARATED.realized_unresolved_target_pairs,0);
assert.equal(C.route_memories.A_SEPARATED.realized_total_cost,2);
assert.equal(C.route_memories.C_SEPARATED.realized_total_cost,2);

assert.equal(C.adaptive_route_memory_compatible_with_loom_preserves,true);
assert.equal(C.adaptive_route_memory_compatible_with_loom_emits_route_deformation,true);
assert.equal(C.loom_context_is_measurement,false);
assert.equal(C.route_memory_is_truth_proof,false);
assert.equal(C.route_memory_is_authorship_proof,false);
assert.equal(C.route_memory_is_identity_proof,false);

assert.equal(C.flowcore_route_burden_model_invoked,false);
assert.equal(C.flowcore_canonical_route_graph_compiled,false);
assert.equal(C.a16_live_route_burden_compilation_earned,false);
assert.equal(C.a16_readmission_earned,false);
assert.equal(C.a16_implementation_authority,false);
assert.equal(C.a19_whole_program_closure_earned,false);
assert.equal(C.a19_mutation_authority,false);
assert.equal(C.live_loom_mutated,false);
assert.equal(C.loom_rename_authority,false);
assert.equal(C.flowcore_public_promotion_authority,false);
assert.equal(C.empirical_target_outcome_acquired,false);
assert.equal(C.empirical_supplemental_probe_repair_earned,false);
assert.equal(C.external_empirical_exteriority_witness_acquired,false);
assert.equal(C.empirical_exteriority_information_gain_measured,false);
assert.deepEqual(C.exact_golden_egg_surfaces_added,[]);
assert.equal(C.empirical_credit_to_golden_egg,0);
assert.equal(C.golden_egg_earned,false);
assert.equal(C.sequence_authority,false);
assert.equal(C.merge_authority,false);
assert.equal(C.production_authority,false);
assert.equal(C.deployment_authority,false);
assert.equal(C.publication_authority,false);

const loomSource=fs.readFileSync('app/dome-world/index.html','utf8');
assert.match(loomSource,/display: 'Loom Room'/);
assert.match(loomSource,/operators: \['米','𝄐','cadence\/provenance'\]/);
assert.match(loomSource,/preserves: \['holonomy','pattern-flow','anti-equivalence-edge'\]/);
assert.match(loomSource,/emits: \['motif','cloth-map','route-deformation'\]/);
assert.match(loomSource,/blocks: \['authorship-proof-claim','identity-proof-claim'\]/);

const receipt=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/LOOM_ADAPTIVE_ROUTE_HOLONOMY_RECEIPT_V0_1.md','utf8');
assert.match(receipt,/SAME TERMINAL STATE != SAME ROUTE HISTORY/);
assert.match(receipt,/ADAPTIVE ROUTE-HOLONOMY MEMORY != FLOW-CORE ROUTE-BURDEN MODEL/);
assert.match(receipt,/LOOM COMPATIBILITY != LOOM MUTATION/);
assert.match(receipt,/LOOM COMPATIBILITY != A16 READMISSION/);
assert.match(receipt,/LOOM COMPATIBILITY != A19 CLOSURE/);

const rerun=runLoomAdaptiveRouteHolonomyReceipt();
assert.equal(rerun.status,'LOOM_ADAPTIVE_ROUTE_HOLONOMY_COMPATIBILITY_EARNED');

await import('./ash-a15-r0-loom-crown-eligibility-concordance.test.mjs');

console.log('Loom adaptive route-holonomy receipt tests passed.');
