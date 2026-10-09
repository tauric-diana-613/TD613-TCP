// Consumer tutorial over the installed field. Illustrations carry no execution
// credit and never replace the underlying observed request relation.
export const LOOM_TUTORIAL_OPERATORS = Object.freeze([
  { glyph: 'à', relations: ['gathering'], family: 'phi-gossamer', label: 'Your request' },
  { glyph: 'hõt // cōl', relations: ['bounded_emergence', 'protected_continuity'], family: 'moire-shear', label: 'Review references' },
  { glyph: '上', relations: ['created_potential'], family: 'phasonic-rise', label: 'Check AI request' },
  { glyph: '出', relations: ['release'], family: 'gradient-stampede', label: 'Send request' },
  { glyph: '米', relations: ['recurrence'], family: 'orbital-braid', label: 'Revisit privacy' },
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
