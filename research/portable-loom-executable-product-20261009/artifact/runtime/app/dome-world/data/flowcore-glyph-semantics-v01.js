/**
 * Canonical Flow-Core glyph semantics registry.
 *
 * Glyphs compress relations already experienced in a governed scene. They do
 * not prove truth, confer station authority, or replace static/textual meaning.
 * Protected scalar sequences are preserved exactly; no Unicode normalization
 * is performed or authorized by this module.
 */

export const FLOWCORE_GLYPH_REGISTRY_SCHEMA = 'td613.flowcore.glyph-semantics/v0.1';
export const TD613_NAMESPACE_SCALAR = '\u{10D613}';
export const TD613_NAMESPACE_UTF16 = '\uDBF5\uDE13';
export const WRITERLY_LANE = '𝌋‌';
export const ZWNJ = '\u200C';

if (TD613_NAMESPACE_SCALAR !== TD613_NAMESPACE_UTF16) {
  throw new Error('U+10D613 scalar and canonical UTF-16 surrogate pair diverged.');
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const item of Object.values(value)) deepFreeze(item);
  return Object.freeze(value);
}

const registry = {
  schema: FLOWCORE_GLYPH_REGISTRY_SCHEMA,
  namespace: TD613_NAMESPACE_SCALAR,
  namespace_display: 'U+10D613 — Tauric Diana 613',
  covenant_display: 'Blood Rite 613',
  normalization_policy: 'PRESERVE_EXACT_UNICODE_SCALAR_SEQUENCE',
  authority_ceiling: [
    'glyph does not prove truth',
    'glyph does not confer station authority',
    'glyph does not replace static or textual meaning',
    'glyph does not authorize Ash action',
    'glyph does not close the operator'
  ],
  entries: {
    recurrence: {
      glyph: '米',
      semantic_relation: 'recurrence-and-authored-structure',
      questions: ['What repeats?', 'Why is it structured this way?'],
      state_trigger: ['pattern-comparison', 'governance-exposure', 'alternative-model-inspection'],
      graphic_grammar: ['separable repeated nodes or rays', 'divergence remains visible'],
      motion_grammar: ['recurrence pulse', 'pause at divergence'],
      static_equivalent: ['numbered recurrence marks', 'side-by-side comparison', 'divergence annotation'],
      inspection_grammar: ['source status', 'design constraints', 'alteration authority', 'claim ceiling']
    },
    gathering: {
      glyph: 'à',
      semantic_relation: 'gathering-and-accumulated-obligation',
      questions: ['What gathers?', 'Who or what bears the accumulated obligation?'],
      state_trigger: ['accumulation', 'capacity-approach', 'route-obligation'],
      graphic_grammar: ['converging paths', 'visible bounded capacity'],
      motion_grammar: ['state-scaled inward flow', 'slow near declared capacity'],
      static_equivalent: ['inflow arrows', 'capacity boundary', 'overflow and blockage labels'],
      inspection_grammar: ['held material', 'remaining capacity', 'release condition', 'delay risk', 'burden bearer']
    },
    release: {
      glyph: '出',
      semantic_relation: 'release-and-transformation',
      questions: ['What changed form?', 'What moved downstream?'],
      state_trigger: ['release', 'branching-transfer', 'transformation'],
      graphic_grammar: ['bounded opening', 'origin and destination retained', 'residue marked'],
      motion_grammar: ['routed outward movement', 'loss branch remains visible'],
      static_equivalent: ['origin-route-destination diagram', 'residue label', 'reversibility marker'],
      inspection_grammar: ['conserved fields', 'losses', 'destination', 'reversibility', 'authority boundary']
    },
    created_potential: {
      glyph: '上',
      semantic_relation: 'created-potential',
      questions: ['What work created readiness or height?', 'Which input paid for the rise?'],
      state_trigger: ['lift', 'pressure-creation', 'readiness-creation'],
      graphic_grammar: ['rising contour', 'source of input visible', 'ceiling visible'],
      motion_grammar: ['bounded rise tied to declared input', 'no free lift'],
      static_equivalent: ['before-after height', 'input arrow', 'loss ledger'],
      inspection_grammar: ['input work', 'efficiency', 'capacity ceiling', 'losses']
    },
    released_tendency: {
      glyph: '下',
      semantic_relation: 'released-tendency',
      questions: ['Where does the stored tendency go?', 'What resistance alters delivery?'],
      state_trigger: ['descent', 'delivery', 'settling', 'return'],
      graphic_grammar: ['downstream route', 'destination and dissipation visible'],
      motion_grammar: ['state-cadenced descent', 'friction and delay preserved'],
      static_equivalent: ['route arrows', 'delivered amount', 'resistance markers'],
      inspection_grammar: ['delivery', 'friction', 'delay', 'partial capture', 'destination']
    },
    protected_continuity: {
      glyph: 'cōl',
      semantic_relation: 'protected-low-energy-continuity',
      questions: ['What remains protected while demand falls?', 'How can return occur?'],
      state_trigger: ['stabilization', 'storage', 'reduced-demand-continuity'],
      graphic_grammar: ['contracted living boundary', 'content remains inspectable'],
      motion_grammar: ['reduced cadence and amplitude', 'never silent disappearance'],
      static_equivalent: ['stable boundary', 'reduced-demand label', 'return route'],
      inspection_grammar: ['continuity', 'inspection access', 'return condition', 'detention prohibition']
    },
    bounded_emergence: {
      glyph: 'hõt',
      semantic_relation: 'bounded-emergence',
      questions: ['What input permits emergence?', 'Where is the capacity ceiling?'],
      state_trigger: ['activation', 'circulation', 'differentiation', 'expansion'],
      graphic_grammar: ['widening bounded field', 'source and ceiling visible'],
      motion_grammar: ['input-governed expansion', 'required subsequent rest'],
      static_equivalent: ['expanded boundary', 'input source', 'capacity/loss labels', 'rest marker'],
      inspection_grammar: ['input', 'capacity', 'losses', 'required rest', 'claim ceiling']
    },
    structural_rest: {
      glyph: '𝄐',
      semantic_relation: 'structural-rest',
      questions: ['What demand stops?', 'What remains available for return and inspection?'],
      state_trigger: ['voluntary-stop', 'settling', 'integration', 'later-return'],
      graphic_grammar: ['field retained', 'demand marks withdraw', 'content not erased'],
      motion_grammar: ['new pulses stop', 'existing movement coasts and settles'],
      static_equivalent: ['final inspectable frame', 'no-new-demand label', 'return and exit controls'],
      inspection_grammar: ['continuity', 'penalty false', 'return route', 'exit availability', 'closure open']
    }
  }
};

export const FLOWCORE_GLYPH_REGISTRY = deepFreeze(registry);

export function getFlowcoreGlyphSemantic(key) {
  return FLOWCORE_GLYPH_REGISTRY.entries[key] || null;
}

export function listFlowcoreGlyphSemantics() {
  return Object.entries(FLOWCORE_GLYPH_REGISTRY.entries).map(([key, value]) => ({ key, ...value }));
}
