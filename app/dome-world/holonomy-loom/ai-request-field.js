/** Geometry for the existing single-clock AI request field.
 * Client events establish route posture; structured model fields remain reported claims.
 * Pixels encode document selection and named missingness, never hidden-state leakage.
 */
export const LOOM_AI_FIELD_SCHEMA = 'td613.loom.ai-request-field/v0.1';
const PHASES = new Set(['prepared', 'checking', 'pending', 'received', 'completed', 'held']);
function count(value, name) {
  if (!Number.isInteger(value) || value < 0 || value > 8) throw new TypeError(`Invalid ${name} document count`);
  return value;
}
function stringList(value, limit, name) {
  if (!Array.isArray(value) || value.length > limit || Object.keys(value).length !== value.length
    || value.some(item => typeof item !== 'string' || !item.trim() || item.length > 1000)) throw new TypeError(`Invalid ${name}`);
  return value;
}
const round = n => Math.round(n * 100) / 100;
const point = t => ({ x: round((1 - t) ** 2 * 331 + 2 * (1 - t) * t * 230 + t ** 2 * 139),
  y: round((1 - t) ** 2 * 153 + 2 * (1 - t) * t * 235 + t ** 2 * 153) });
function lineBetween(start, end) {
  const segments = Math.max(2, Math.ceil((end - start) * 40));
  return Array.from({ length: segments + 1 }, (_, index) => {
    const p = point(start + (end - start) * index / segments);
    return `${index ? 'L' : 'M'}${p.x} ${p.y}`;
  }).join(' ');
}

export function projectLoomRequestField(event, progress = 1) {
  if (!event || !PHASES.has(event.phase)) throw new TypeError('Unknown request field phase');
  if (!Number.isFinite(progress) || progress < 0 || progress > 1) throw new TypeError('Invalid render progress');
  const shared = count(event.shared ?? 0, 'selected'), local = count(event.local ?? 0, 'local');
  const selected = event.selected_document_ids === undefined ? null : stringList(event.selected_document_ids, 8, 'selected document identities');
  if (selected && (selected.length !== shared || new Set(selected).size !== selected.length)) throw new TypeError('Selected identities must match the declared count');
  const used = event.used_document_ids === undefined ? null : stringList(event.used_document_ids, 8, 'reported source references');
  if (used && (!selected || new Set(used).size !== used.length || used.some(id => !selected.includes(id)))) throw new TypeError('Reported source references need selected identities');
  const missing = event.missing_information === undefined ? null : stringList(event.missing_information, 32, 'reported missingness');
  const responseObserved = ['received', 'completed'].includes(event.phase) || (event.phase === 'held' && event.response_received === true);
  const submitted = responseObserved || event.phase === 'pending' || event.outbound_submitted === true;
  const settled = ['prepared', 'completed', 'held'].includes(event.phase);
  // This bounded pulse changes curvature only; the final/static frame conserves every strand and gap.
  const pulse = settled ? 0 : Math.sin(Math.PI * progress) * 6;
  const selectedStrands = Array.from({ length: shared }, (_, index) => {
    const y = 105 + (index - (shared - 1) / 2) * 7;
    const curve = 67 - index * 3 - pulse;
    return { id: selected?.[index] ?? null, path: `M139 ${round(y)} C203 ${round(curve)} 270 ${round(curve)} 329 ${round(y)}`,
      posture: submitted ? 'SUBMITTED_ROUTE' : 'SELECTED_LOCAL', dash: submitted ? null : '3 5',
      source_reference: used === null ? 'NOT_REPORTED' : used.includes(selected?.[index]) ? 'MODEL_REPORTED' : 'NOT_REFERENCED_BY_MODEL' };
  });
  const retainedPockets = Array.from({ length: local }, (_, index) => {
    const x = 77 + index * 8;
    return { path: `M${x} 174 L${x} 188 L${x + 5} 188 L${x + 5} 174`, posture: 'KEPT_LOCAL' };
  });
  // Missingness creates genuine gaps. More than eight questions share an explicitly counted seam.
  const gaps = responseObserved && missing ? Array.from({ length: Math.min(8, missing.length) }, (_, index) => {
    const t = 0.2 + 0.6 * (index + 1) / (Math.min(8, missing.length) + 1);
    return { ...point(t), t, label: missing[index], evidence: 'MODEL_REPORTED_MISSING_INFORMATION' };
  }) : [];
  const intervals = [];
  let cursor = 0;
  for (const gap of gaps) { intervals.push([cursor, gap.t - 0.016]); cursor = gap.t + 0.016; }
  intervals.push([cursor, 1]);
  const returnPath = responseObserved ? intervals.map(([start, end]) => lineBetween(start, end)).join(' ') : '';
  return {
    schema: LOOM_AI_FIELD_SCHEMA, phase: event.phase, settled,
    cause: { client_event: event.phase, selected_document_count: shared, local_document_count: local,
      response_observed: responseObserved, source_references: used === null ? null : used.length,
      reported_missingness_count: missing === null ? null : missing.length },
    outgoing: { visible: shared > 0, state: submitted ? 'SUBMISSION_ROUTE' : 'AWAITING_OPERATOR', strands: selectedStrands },
    retained: { visible: local > 0, glyph: 'cōl', pockets: retainedPockets },
    returning: { visible: responseObserved, state: event.phase === 'completed' ? 'ADMITTED_FOR_REVIEW' : responseObserved ? 'RESPONSE_UNDER_REVIEW' : 'UNOBSERVED',
      path: returnPath, gaps, additional_gap_count: Math.max(0, (missing?.length ?? 0) - gaps.length) },
    gate: { blocked: event.phase === 'held', path: event.phase === 'held' ? 'M220 77 L240 97 M240 77 L220 97' : '' },
    relations: [shared ? 'gathering' : null, local ? 'protected_continuity' : null, responseObserved ? 'released_tendency' : null,
      settled ? 'structural_rest' : null].filter(Boolean),
    observation_basis: 'CLIENT_ROUTE_EVENTS_AND_MODEL_REPORTED_FIELDS',
    geometry_units: 'DISPLAY_PIXELS', measurement_of_hidden_state: false
  };
}
