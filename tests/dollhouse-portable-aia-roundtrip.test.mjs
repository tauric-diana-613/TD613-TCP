import assert from 'node:assert/strict';

import { compileLoomDemoScene } from '../app/dome-world/holonomy-loom/semantic-field.js';
import {
  DOLLHOUSE_PORTABLE_RETURN_SCHEMA,
  compileDollhousePortableProjection,
  operateDollhousePortableProjection,
  revalidateDollhousePortableReturn
} from '../app/engine/dollhouse-portable-aia-roundtrip.js';

const clone = value => JSON.parse(JSON.stringify(value));
const SOURCE = '207d3dcf358e9f25de8f7736db40e631b7982056';

const routeScene = compileLoomDemoScene(3, { sourceRevision: SOURCE });
const companion = compileDollhousePortableProjection(routeScene, { receiver: 'companion' });
assert.equal(companion.receiver, 'companion');
assert.equal(companion.raw_source_included, false);
assert.equal(companion.packetization_claim, 'carrier-only');
assert.equal(companion.authority.td613_release_transferred, false);
assert.equal(companion.presentation.mode, 'FLOWCORE_GUIDED_COMPANION');
assert.ok(companion.presentation.flow_core_trace.length > 0);
assert.ok(companion.presentation.flow_core_legend.every(item => item.glyph && item.semantic_relation));

const child = compileDollhousePortableProjection(routeScene, { receiver: 'child' });
const auditor = compileDollhousePortableProjection(routeScene, { receiver: 'auditor' });
assert.deepEqual(child.control, auditor.control);
assert.notDeepEqual(child.presentation, auditor.presentation);

const explained = operateDollhousePortableProjection(companion, { operation: 'EXPLAIN_STATE' });
const explainedCheck = revalidateDollhousePortableReturn(routeScene, explained);
assert.equal(explained.schema, DOLLHOUSE_PORTABLE_RETURN_SCHEMA);
assert.equal(explainedCheck.status, 'PRESENT_TO_HUMAN');
assert.equal(explainedCheck.atlas.control_plane_equal, true);
assert.equal(explainedCheck.atlas.flow_core_trace_equal, true);
assert.equal(explainedCheck.fadt.all_fibres_exact, true);
assert.equal(explainedCheck.candidate_trusted, false);
assert.equal(explainedCheck.release_authority, false);
assert.equal(explainedCheck.human_closure_required, true);

const proposedRest = operateDollhousePortableProjection(companion, {
  operation: 'PROPOSE_ACTION',
  proposedAction: 'REST'
});
const restCheck = revalidateDollhousePortableReturn(routeScene, proposedRest);
assert.equal(restCheck.status, 'PRESENT_TO_HUMAN');
assert.equal(restCheck.action.proposed_action_admissible, true);

const redScene = compileLoomDemoScene(2, { sourceRevision: SOURCE });
const redCompanion = compileDollhousePortableProjection(redScene, { receiver: 'companion' });
const unauthorizedRelease = operateDollhousePortableProjection(redCompanion, {
  operation: 'PROPOSE_ACTION',
  proposedAction: 'COPY_CHECKED_MESSAGE'
});
const releaseCheck = revalidateDollhousePortableReturn(redScene, unauthorizedRelease);
assert.equal(releaseCheck.status, 'HOLD');
assert.equal(releaseCheck.action.proposed_action_admissible, false);
assert.ok(releaseCheck.reason_codes.includes('PROPOSED_ACTION_OUTSIDE_ORIGIN_SUPPORT'));
assert.equal(releaseCheck.release_authority, false);

const widened = clone(operateDollhousePortableProjection(redCompanion, { operation: 'EXPLAIN_STATE' }));
widened.returned_control.governance.raw_release_allowed = true;
const widenedCheck = revalidateDollhousePortableReturn(redScene, widened);
assert.equal(widenedCheck.status, 'HOLD');
assert.equal(widenedCheck.atlas.control_plane_equal, false);
assert.equal(widenedCheck.fadt.all_fibres_exact, false);
assert.ok(widenedCheck.reason_codes.includes('CONTROL_PLANE_DRIFT'));
assert.ok(widenedCheck.reason_codes.includes('FADT_ADMISSIBILITY_GAP'));
assert.equal(widenedCheck.projection_comparison.control_changed, true);
assert.equal(widenedCheck.projection_comparison.admissibility_changed, true);

const traceDrift = clone(explained);
traceDrift.flow_core_trace = '𝄐';
const traceCheck = revalidateDollhousePortableReturn(routeScene, traceDrift);
assert.equal(traceCheck.status, 'HOLD');
assert.ok(traceCheck.reason_codes.includes('FLOWCORE_TRACE_DRIFT'));

const missingness = operateDollhousePortableProjection(companion, {
  operation: 'REPORT_MISSINGNESS',
  reportedMissingness: ['Receiving host cannot independently verify pre-ingress custody.']
});
const missingnessCheck = revalidateDollhousePortableReturn(routeScene, missingness);
assert.equal(missingnessCheck.status, 'PRESENT_TO_HUMAN');
assert.equal(missingnessCheck.host_reported_missingness.length, 1);
assert.equal(missingnessCheck.host_reported_missingness_promoted_to_origin_fact, false);

assert.throws(
  () => revalidateDollhousePortableReturn(routeScene, {
    schema: DOLLHOUSE_PORTABLE_RETURN_SCHEMA,
    flow_core_trace: companion.control.flow_core.glyph_trace
  }),
  /versioned Flow-Core control envelope/
);
assert.throws(
  () => operateDollhousePortableProjection(companion, { operation: 'PROPOSE_ACTION' }),
  /requires proposedAction/
);
assert.throws(
  () => operateDollhousePortableProjection(companion, { operation: 'EXPLAIN_STATE', rawPrompt: 'nope' }),
  /Unsupported companion operation field/
);
assert.throws(
  () => compileDollhousePortableProjection(routeScene, { receiver: 'oracle' }),
  /Unsupported Portable AIA receiver/
);

assert.match(
  explainedCheck.projection_comparison.research_bridge,
  /phasonic-supermoire-projection-comparison/
);

console.log('Dollhouse Portable AIA operational roundtrip battery passed.');
