import assert from 'node:assert/strict';
import {
  ATLAS_HOLONOMY_HISTORY_PARITY_QUOTIENT_SCHEMA,
  atlasHolonomyHistoryParityQuotientCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-holonomy-history-parity-quotient.js';

const cert=atlasHolonomyHistoryParityQuotientCertificate();
assert.equal(ATLAS_HOLONOMY_HISTORY_PARITY_QUOTIENT_SCHEMA,'td613.dome-world.atlas-holonomy-history-parity-quotient/v0.1');
assert.equal(cert.parent_exact,true);
assert.equal(cert.passed,true);
assert.equal(cert.representations.visible.image_size,1);
assert.equal(cert.representations.visible.kernel,'Z');
assert.equal(cert.representations.apparatus.generator_order,2);
assert.equal(cert.representations.apparatus.image_size,2);
assert.equal(cert.representations.apparatus.kernel,'2Z');
assert.equal(cert.representations.apparatus.quotient,'Z/2Z');
assert.equal(cert.window.size,17);
assert.equal(cert.window.even,9);
assert.equal(cert.window.odd,8);
assert.equal(cert.window.unordered_distinct_pairs,136);
assert.equal(cert.window.same_parity_pairs,64);
assert.equal(cert.window.opposite_parity_pairs,72);
assert.equal(cert.execution_ledger.winding_fiber_evaluations,68);
assert.equal(cert.continuation.same_parity_future_transport_marker_comparisons,2048);
assert.equal(cert.continuation.same_parity_future_readout_mismatches,0);
assert.equal(cert.continuation.opposite_parity_immediate_marker_comparisons,288);
assert.equal(cert.continuation.opposite_parity_immediate_marker_failures,0);
assert.equal(cert.laws.loop_power_holonomy_representation_factors_through_parity,true);
assert.equal(cert.laws.apparatus_history_equivalence_iff_winding_parity,true);
assert.equal(cert.laws.visible_history_quotient_strictly_coarser,true);
assert.equal(cert.laws.same_parity_future_continuation_equivalent,true);
assert.equal(cert.laws.opposite_parity_immediately_distinguishable,true);
assert.equal(cert.laws.holonomy_class_forgets_winding_magnitude_and_sign,true);
assert.equal(cert.witnesses.exact_winding_decoder_available,false);
for(const row of cert.witnesses.representative_pairs) assert.equal(row.expected,row.observed);
console.log('Ash A15-R0 Atlas holonomy-history parity quotient canonical tests passed.');
