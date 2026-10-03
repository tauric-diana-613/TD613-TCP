// Presentation-only Flow-Core scores for the First Crossing ingress.
//
// These scores never create request events, provider claims, custody changes or
// new Flow-Core semantics. They sequence existing canonical relations into
// coherent illustrative messages and select a Dome-Art-derived motion family
// for Loom's existing 39-carrier field.
export const FLOWCORE_CHOREOGRAPHY_SCHEMA = 'td613.loom.flowcore-choreography/v0.1';

export const FLOWCORE_MOTION_FAMILIES = Object.freeze({
  'phi-gossamer': Object.freeze({rate:.041,x:34,y:22,roll:7,scale:.075,moire:.42,quasi:1,torsion:.18,shear:.12,rise:.08,phase:.13}),
  'orbital-braid': Object.freeze({rate:.034,x:42,y:29,roll:11,scale:.09,moire:.28,quasi:.62,torsion:.48,shear:.08,rise:.04,phase:.31}),
  'torsion-bloom': Object.freeze({rate:.046,x:38,y:36,roll:18,scale:.12,moire:.22,quasi:.48,torsion:1,shear:.18,rise:.12,phase:.47}),
  'moire-shear': Object.freeze({rate:.038,x:58,y:24,roll:13,scale:.08,moire:1,quasi:.35,torsion:.22,shear:1,rise:.02,phase:.59}),
  'threnodic-gossamer': Object.freeze({rate:.026,x:31,y:28,roll:9,scale:.065,moire:.36,quasi:.86,torsion:.12,shear:.16,rise:-.14,phase:.71}),
  'phasonic-rise': Object.freeze({rate:.044,x:33,y:48,roll:10,scale:.105,moire:.31,quasi:.92,torsion:.26,shear:.14,rise:1,phase:.83}),
  'gradient-stampede': Object.freeze({rate:.055,x:64,y:34,roll:16,scale:.13,moire:.54,quasi:.38,torsion:.42,shear:.72,rise:.38,phase:.97}),
  'quiet-recurrence': Object.freeze({rate:.017,x:20,y:15,roll:4,scale:.045,moire:.24,quasi:.7,torsion:.08,shear:.06,rise:.01,phase:.07})
});

const TAU=Math.PI*2,PHI=(1+Math.sqrt(5))/2;
export function projectFlowcoreMotionFamily(familyId,{index,count=39,seconds=0,phase=0,depth='flight-far'}={}){
  const family=FLOWCORE_MOTION_FAMILIES[familyId];
  if(!family)throw new TypeError(`Unknown Flow-Core motion family: ${familyId}`);
  if(!Number.isInteger(index)||index<0||!Number.isInteger(count)||count<1||index>=count)throw new TypeError('Flow-Core carrier coordinate is outside the bounded family projection.');
  for(const [name,value] of Object.entries({seconds,phase}))if(typeof value!=='number'||!Number.isFinite(value))throw new TypeError(`${name} must be finite.`);
  const u=(index+.5)/count, t=seconds*family.rate, p=family.phase;
  // Six coupled phases borrow Dome-Art's triangular Moiré + φ/quasiperiodic
  // visual vocabulary. This is modeled presentation only: no exact substrate,
  // empirical geometry, provider route, or exteriority claim is made here.
  const a0=TAU*(u+t+p), a1=TAU*(u*PHI+t/PHI+p*.7), a2=TAU*(u*Math.sqrt(3)-t*.73+p*.3);
  const a3=TAU*(u*Math.SQRT2+t*.51-p*.4), a4=TAU*(u*PHI*PHI-t*.37+p*.9), a5=TAU*(u*(2+Math.sqrt(5))+t*.29-p*.2);
  const moire=(Math.sin(a0)+Math.sin(a2)-Math.cos(a3))/3;
  const quasi=(Math.sin(a1)+Math.cos(a4)+Math.sin(a5))/3;
  const torsion=Math.sin(a0-a4)*Math.cos(a2+a5);
  const shear=Math.sin(a2-a3);
  const rise=Math.sin(a1+a4)*.5+.5;
  const depthGain=depth==='flight-near'?1.35:depth==='flight-mid'?.82:.46;
  const dx=depthGain*family.x*(family.moire*moire+family.quasi*quasi+family.shear*shear*.55);
  const dy=depthGain*family.y*(family.moire*moire-family.quasi*quasi+family.torsion*torsion*.7)+family.rise*(rise-.5)*52;
  return Object.freeze({
    dx,dy,
    roll:depthGain*family.roll*(torsion+family.shear*shear*.45),
    scale:1+depthGain*family.scale*(quasi+family.torsion*torsion*.5),
    opacity:Math.max(.72,Math.min(1.08,1+depthGain*.08*(moire+quasi)))
  });
}

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
