import { operateDollhousePortableProjection } from '../engine/dollhouse-portable-aia-roundtrip.js';

/** Local reference practice for Marrowline's future portable companion route.
 * Only declared operations over an admitted projection; no provider transport.
 * The explanation remains advisory. The structured candidate returns separately.
 */
export function answerPortablePractice(projection, input) {
  const candidate = operateDollhousePortableProjection(projection, input);
  const control = projection.control;
  const words = {
    EXPLAIN_STATE: `${control.governance.analysis_status} under this scene's rules. ${control.governance.raw_release_allowed
      ? 'The enabled rules allow the local checked-copy path.'
      : 'The original stays behind the local checked-copy boundary.'} The companion can explain or propose; a person still decides. L remains ${control.evidentiary_coordinates.L}.`,
    TRACE_FLOWCORE: control.flow_core.legend.map(item => `${item.glyph} — ${item.semantic_relation}`).join('\n'),
    PROPOSE_ACTION: `Proposed: ${candidate.proposed_action}. Bring this candidate back to Loom to check its support. This operation executes nothing.`,
    REPORT_MISSINGNESS: `The receiving host reports: ${candidate.reported_missingness.join('; ')}. This stays an advisory report, separate from origin evidence.`
  };
  return Object.freeze({ answer: words[candidate.operation], candidate, provider_calls: 0,
    host: 'MARROWLINE_LOCAL_REFERENCE_PRACTICE', external_host_observed: false });
}
