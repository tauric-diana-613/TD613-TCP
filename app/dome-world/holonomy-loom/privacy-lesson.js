import { getLoomDemoInput, compileLoomDemoScene } from './semantic-field.js';
import { analyzeHolonomyLoomMessage, makeHolonomyLoomSaferCopy } from './engine.js';
import { HOLONOMY_LOOM_MOTION_DESCRIPTORS } from './flowcore-aia-motion.js';

const freeze = value => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

function segments(text, spans) {
  const parts = [];
  let cursor = 0;
  for (const span of spans) {
    if (span.start > cursor) parts.push({ text: text.slice(cursor, span.start), changed: false });
    parts.push({ text: text.slice(span.start, span.end), changed: true, rule_id: span.rule_id });
    cursor = span.end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), changed: false });
  return parts;
}

function outputSpans(before, after) {
  if (before === after) return [];
  let start = 0, suffix = 0;
  while (start < before.length && start < after.length && before[start] === after[start]) start++;
  while (suffix < before.length - start && suffix < after.length - start && before[before.length - suffix - 1] === after[after.length - suffix - 1]) suffix++;
  return [{ start, end: after.length - suffix, rule_id: 'REAL_ENGINE_TRANSFORMATION' }];
}

/** Display-only lesson: accepts a canonical fictional scene index, never message text.
 * Call after an explicit practice-scene selection. No I/O, clock, send, or custody write.
 * The candidate preview does not replace the canonical scene's current analysis.
 */
export function compileLoomPrivacyLesson(index) {
  const input = getLoomDemoInput(index);
  const packet = compileLoomDemoScene(index);
  const before = analyzeHolonomyLoomMessage(input);
  const safer = makeHolonomyLoomSaferCopy(input);
  // Match the engine's recheck contract: exact protected spans were replaced;
  // generated placeholder words are rechecked against built-in rules only.
  const after = analyzeHolonomyLoomMessage({ text: safer.text, journeyMarkers: input.journeyMarkers });
  const changed = safer.text !== input.text;
  const applied = packet.scene.id === 'recovery';
  const blocked = !packet.analysis.release_boundary.raw_release_allowed;
  const matches = before.findings.map(finding => ({
    rule_id: finding.rule_id, action: finding.action,
    text: input.text.slice(finding.start, finding.end),
    start: finding.start, end: finding.end,
    appears_in_candidate: safer.text.includes(input.text.slice(finding.start, finding.end)),
    evidence_class: finding.evidence_class
  }));
  const routeCount = before.journey_relations.reduce((sum, relation) => sum + relation.occurrence_count, 0);
  const relations = [
    ['gathering', 'Read this practice note', 'COMPLETE', 'The fictional note and its declared rules meet here.'],
    ['recurrence', 'Compare the words', 'COMPLETE', `${before.findings.length} enabled rule match(es); ${routeCount} exact declared journey-marker occurrence(s).`],
    ['bounded_emergence', 'Make a safer copy', applied ? 'COMPLETE' : changed ? 'PREVIEW' : 'NOT_NEEDED', changed ? 'The real transformation changes the marked words in a separate copy.' : 'No words changed under the enabled rules.'],
    ['release', blocked ? 'Original stays here' : 'Copy gate checked', blocked ? 'BLOCKED' : 'CHECKED_ONLY', blocked ? 'The current scene blocks the original. The preview does not open that gate.' : 'The enabled rules allow this text through Loom’s copy gate. Nothing has been copied or sent.'],
    ['protected_continuity', 'Keep the original in view', 'AVAILABLE', 'The fictional original remains inspectable beside the copy; it was not erased.'],
    ['structural_rest', 'Stop and look', packet.geometry.rest ? 'ACTIVE' : 'AVAILABLE', 'Motion can stop while both versions and the reason remain visible.']
  ].map(([key, label, state, cause]) => {
    const canonical = HOLONOMY_LOOM_MOTION_DESCRIPTORS[key];
    return { key, glyph: canonical.glyph, label, state, cause,
      semantic_relation: canonical.semantic_relation,
      motion_grammar: [...canonical.motion_grammar],
      static_equivalent: [...canonical.static_equivalent],
      active_in_scene: packet.flow_core.glyph_relations.includes(key) };
  });
  return freeze({
    schema: 'td613.loom.privacy-lesson/v0.1', scene_id: packet.scene.id, scene_index: index,
    fictional: true, contains_user_data: false, sent: false,
    before: { label: 'BEFORE · fictional original', text: input.text, status: before.status, segments: segments(input.text, before.findings) },
    after: { label: applied ? 'AFTER · safer copy checked' : changed ? 'AFTER · safer-copy preview' : 'AFTER · no change needed by these rules',
      text: safer.text, status: after.status, segments: segments(safer.text, outputSpans(input.text, safer.text)),
      preview_only: !applied, replaces_current_scene: applied },
    disclosure: { changed, matches, original_match_count: before.findings.length, remaining_builtin_match_count: after.findings.length,
      original_gate_blocked: !before.release_boundary.raw_release_allowed,
      current_scene_gate_blocked: blocked,
      explanation: changed ? 'The marked words would be absent or changed if you chose this copy. The original still exists.' : 'The checked rules made no changes. Other details can still travel with this note.',
      guarantee: 'Only these exact checks and this fictional text difference are shown. This is not a measurement of privacy after sharing.' },
    relations,
    geometry: { driver: packet.alert.observed_vs_modeled, pressure: packet.geometry.pressure,
      scale: 'DECLARED_ILLUSTRATION_NOT_MEASUREMENT',
      explanation: 'Direction and narrowing illustrate the declared route and rule state. They do not measure hidden information.' },
    claim_ceiling: { decoded_data: 'Known fictional text, exact rule matches, generated copy, and local recheck only.',
      empirical_geometry: 'No physical tomography, geometric holonomy, provider reconstruction, or hidden-state access is established.',
      authority: 'Preview only. No send, release, external retrieval, or custody action.' }
  });
}
