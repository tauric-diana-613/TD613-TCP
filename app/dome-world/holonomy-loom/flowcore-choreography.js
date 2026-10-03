// Presentation-only Flow-Core scores for the First Crossing ingress.
//
// These scores never create request events, provider claims, custody changes or
// new Flow-Core semantics. They sequence existing canonical relations into
// coherent illustrative messages and select a Dome-Art-derived motion family
// for Loom's existing 39-carrier field.
export const FLOWCORE_CHOREOGRAPHY_SCHEMA = 'td613.loom.flowcore-choreography/v0.1';

export const FLOWCORE_CHOREOGRAPHIES = Object.freeze([
  Object.freeze({
    id:'pattern-to-rest',
    relations:Object.freeze(['recurrence','gathering','protected_continuity','created_potential','release','released_tendency','bounded_emergence','structural_rest']),
    glyphs:'米 → à → cōl → 上 → 出 → 下 → hõt → 𝄐',
    message:'Pattern returns; useful context gathers; private context stays protected; readiness rises; release moves outward; returned work comes back; review emerges; the field rests.',
    family:'phi-gossamer'
  }),
  Object.freeze({
    id:'protected-route',
    relations:Object.freeze(['protected_continuity','recurrence','gathering','created_potential','release','released_tendency','bounded_emergence','structural_rest']),
    glyphs:'cōl → 米 → à → 上 → 出 → 下 → hõt → 𝄐',
    message:'Protection holds while context recurs and gathers; readiness is created before release; returned work descends into review; the route settles at rest.',
    family:'orbital-braid'
  }),
  Object.freeze({
    id:'emergent-route',
    relations:Object.freeze(['recurrence','bounded_emergence','gathering','protected_continuity','created_potential','release','released_tendency','structural_rest']),
    glyphs:'米 → hõt → à → cōl → 上 → 出 → 下 → 𝄐',
    message:'A recurring pattern opens a bounded possibility; relevant context gathers while private context stays protected; readiness forms; release and return remain separate; the field rests.',
    family:'torsion-bloom'
  }),
  Object.freeze({
    id:'gather-and-return',
    relations:Object.freeze(['gathering','protected_continuity','created_potential','release','released_tendency','recurrence','bounded_emergence','structural_rest']),
    glyphs:'à → cōl → 上 → 出 → 下 → 米 → hõt → 𝄐',
    message:'Context gathers without absorbing what stays private; readiness rises; a chosen release leaves; returned work comes back; recurrence reveals what changed; review emerges; rest remains available.',
    family:'moire-shear'
  }),
  Object.freeze({
    id:'return-first-memory',
    relations:Object.freeze(['released_tendency','recurrence','gathering','protected_continuity','bounded_emergence','created_potential','release','structural_rest']),
    glyphs:'下 → 米 → à → cōl → hõt → 上 → 出 → 𝄐',
    message:'Returned work can re-enter memory without becoming authority; context gathers under protection; bounded review creates new readiness; only a later gesture releases; the route rests.',
    family:'threnodic-gossamer'
  }),
  Object.freeze({
    id:'release-with-memory',
    relations:Object.freeze(['recurrence','gathering','created_potential','release','protected_continuity','released_tendency','bounded_emergence','structural_rest']),
    glyphs:'米 → à → 上 → 出 → cōl → 下 → hõt → 𝄐',
    message:'Memory gathers context and creates readiness; release is explicit; protection continues beside the route; returned work comes back for bounded review; the field rests.',
    family:'phasonic-rise'
  }),
  Object.freeze({
    id:'braided-custody',
    relations:Object.freeze(['protected_continuity','gathering','recurrence','bounded_emergence','created_potential','release','released_tendency','structural_rest']),
    glyphs:'cōl → à → 米 → hõt → 上 → 出 → 下 → 𝄐',
    message:'Protection is continuous while context gathers and recurrence becomes visible; review can emerge without forcing release; readiness and sending remain separate; returned work settles into rest.',
    family:'gradient-stampede'
  }),
  Object.freeze({
    id:'quiet-cycle',
    relations:Object.freeze(['structural_rest','recurrence','gathering','protected_continuity','created_potential','release','released_tendency','bounded_emergence']),
    glyphs:'𝄐 → 米 → à → cōl → 上 → 出 → 下 → hõt',
    message:'Rest is a valid starting state; pattern can recur, context can gather, privacy can hold, readiness can form, release can occur, return can arrive, and review can emerge without collapsing those steps.',
    family:'quiet-recurrence'
  })
]);

export function selectFlowcoreChoreography(index=0){
  if(!Number.isInteger(index)) throw new TypeError('Flow-Core choreography index must be an integer.');
  const normalized=((index%FLOWCORE_CHOREOGRAPHIES.length)+FLOWCORE_CHOREOGRAPHIES.length)%FLOWCORE_CHOREOGRAPHIES.length;
  return FLOWCORE_CHOREOGRAPHIES[normalized];
}

export function nextFlowcoreChoreography(previousId=null, randomValue=Math.random()){
  if(typeof randomValue!=='number'||!Number.isFinite(randomValue)) throw new TypeError('Flow-Core choreography random value must be finite.');
  const pool=FLOWCORE_CHOREOGRAPHIES.filter(item=>item.id!==previousId);
  const unit=Math.max(0,Math.min(.999999999,randomValue));
  return pool[Math.floor(unit*pool.length)]??FLOWCORE_CHOREOGRAPHIES[0];
}
