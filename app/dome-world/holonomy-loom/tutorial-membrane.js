// Consumer tutorial over the installed field. Illustrations carry no execution
// credit and never replace the underlying observed request relation.
export const LOOM_TUTORIAL_OPERATORS = Object.freeze([
  { glyph: 'à', relations: ['gathering'], family: 'phi-gossamer', label: 'Your request' },
  { glyph: 'hõt', relations: ['bounded_emergence', 'protected_continuity'], family: 'moire-shear', label: 'Review references' },
  { glyph: '上', relations: ['created_potential'], family: 'phasonic-rise', label: 'Check AI request' },
  { glyph: '出', relations: ['release'], family: 'gradient-stampede', label: 'Send request' },
  { glyph: '米', relations: ['recurrence'], family: 'revisit-lemniscate', label: 'Revisit privacy' },
  { glyph: '下', relations: ['released_tendency'], family: 'threnodic-gossamer', label: 'Return proof' },
  { glyph: '𝄐', relations: ['structural_rest'], family: 'quiet-recurrence', label: 'Ready / Rest' }
].map(item => Object.freeze({ ...item, relations: Object.freeze(item.relations) })));

export function loomTutorialPresentation(step, remix = null) {
  const operator = LOOM_TUTORIAL_OPERATORS[step];
  if (!operator) throw new TypeError('Unknown Loom tutorial step.');
  return {
    tutorial_operator: { step, glyph: operator.glyph, relations: [...operator.relations], evidence_class: 'TUTORIAL_ILLUSTRATION_ONLY' },
    flowcore_choreography: { id: `tutorial-${step}-${remix?.id ?? 'default'}`, relations: [...operator.relations], family: remix?.family ?? operator.family }
  };
}

/**
 * First-paint overture: the eight relation families share the existing 39
 * carrier field and AnimationCoordinator clock. This is a presentation score,
 * not an observed request, authority event, provider invocation or custody act.
 * It intentionally has no tutorial_operator: binding one would reduce every
 * visible carrier to the first lesson's à relation.
 */
export function loomOpeningPresentation(score) {
  const canonical = ['recurrence','gathering','protected_continuity','created_potential',
    'release','released_tendency','bounded_emergence','structural_rest'];
  const candidate = Array.isArray(score?.relations) ? score.relations : canonical;
  const relations = [...new Set(candidate.filter(relation=>canonical.includes(relation)))];
  const complete = relations.length===canonical.length && canonical.every(relation=>relations.includes(relation));
  return {
    tutorial_operator: null,
    flowcore_choreography: {
      id: `ingress-overture-${score?.id ?? 'full-ensemble'}`,
      relations: complete ? relations : canonical,
      family: score?.family ?? 'phi-gossamer',
      evidence_class: 'TUTORIAL_ILLUSTRATION_ONLY'
    }
  };
}
