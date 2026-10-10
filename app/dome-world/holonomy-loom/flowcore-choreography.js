// Presentation-only Flow-Core scores for the Loom tutorial.
//
// These scores never create request events, provider claims, custody changes or
// new Flow-Core semantics. They sequence existing canonical relations into
// coherent illustrative messages and select a Dome-Art-derived motion family
// for Loom's existing 39-carrier field.
// Shared with the API dependency graph: keep this filesystem specifier
// traceable. Browser cache versioning belongs on the workspace entry module.
import { computeHeterostratigraphicMotionSample } from './dome-art-lattice.js';
export const FLOWCORE_CHOREOGRAPHY_SCHEMA = 'td613.loom.flowcore-choreography/v0.1';

export const FLOWCORE_MOTION_FAMILIES = Object.freeze({
  'phi-gossamer': Object.freeze({rate:.041,x:34,y:22,roll:7,scale:.075,moire:.42,quasi:1,torsion:.18,shear:.12,rise:.08,phase:.13}),
  'orbital-braid': Object.freeze({rate:.034,x:42,y:29,roll:11,scale:.09,moire:.28,quasi:.62,torsion:.48,shear:.08,rise:.04,phase:.31}),
  'torsion-bloom': Object.freeze({rate:.046,x:38,y:36,roll:18,scale:.12,moire:.22,quasi:.48,torsion:1,shear:.18,rise:.12,phase:.47}),
  'moire-shear': Object.freeze({rate:.038,x:58,y:24,roll:13,scale:.08,moire:1,quasi:.35,torsion:.22,shear:1,rise:.02,phase:.59}),
  'threnodic-gossamer': Object.freeze({rate:.026,x:31,y:28,roll:9,scale:.065,moire:.36,quasi:.86,torsion:.12,shear:.16,rise:-.14,phase:.71}),
  'phasonic-rise': Object.freeze({rate:.044,x:33,y:48,roll:10,scale:.105,moire:.31,quasi:.92,torsion:.26,shear:.14,rise:1,phase:.83}),
  'gradient-stampede': Object.freeze({rate:.055,x:64,y:34,roll:16,scale:.13,moire:.54,quasi:.38,torsion:.42,shear:.72,rise:.38,phase:.97}),
  'quiet-recurrence': Object.freeze({rate:.017,x:20,y:15,roll:4,scale:.045,moire:.24,quasi:.7,torsion:.08,shear:.06,rise:.01,phase:.07}),
  'revisit-lemniscate': Object.freeze({rate:.038,x:38,y:23,roll:6,scale:.048,moire:.26,quasi:.69,torsion:.09,shear:.08,rise:0,phase:.11})
});

const TAU=Math.PI*2,PHI=(1+Math.sqrt(5))/2;
export function projectFlowcoreMotionFamily(familyId,{index,count=39,seconds=0,phase=0,depth='flight-far',x,y}={}){
  const family=FLOWCORE_MOTION_FAMILIES[familyId];
  if(!family)throw new TypeError(`Unknown Flow-Core motion family: ${familyId}`);
  if(!Number.isInteger(index)||index<0||!Number.isInteger(count)||count<1||index>=count)throw new TypeError('Flow-Core carrier coordinate is outside the bounded family projection.');
  for(const [name,value] of Object.entries({seconds,phase}))if(typeof value!=='number'||!Number.isFinite(value))throw new TypeError(`${name} must be finite.`);
  for(const [name,value] of Object.entries({x,y}))if(value!==undefined&&(typeof value!=='number'||!Number.isFinite(value)))throw new TypeError(`${name} must be finite when supplied.`);
  const u=(index+.5)/count, t=seconds*family.rate, p=family.phase;
  const depthGain=depth==='flight-near'?1.35:depth==='flight-mid'?.82:.46;
  if(familyId==='revisit-lemniscate'){
    // 米's returning figure-eight is independent of the lattice sampling.
    // Calculate it BEFORE expensive lattice work on every one of 39 frames.
    const angle=seconds*.78 + phase*.18 + TAU*u*.13;
    return Object.freeze({
      dx:depthGain*family.x*Math.sin(angle),
      dy:depthGain*family.y*Math.sin(2*angle),
      roll:depthGain*family.roll*Math.cos(angle),
      scale:1+depthGain*family.scale*Math.cos(2*angle),
      opacity:Math.max(.82,Math.min(1, .94+depthGain*.05*Math.sin(angle)))
    });
  }
  // Canonical sample geometry and mathematical gradient, fused into one pass.
  // Identical centered finite-difference trigonometry, no new simulation clock.
  const a0=TAU*(u+t+p), a1=TAU*(u*PHI+t/PHI+p*.7);
  const sampleX=x===undefined?Math.cos(a0)*320:x-500;
  const sampleY=y===undefined?Math.sin(a1)*240:y-260;
  const lattice=computeHeterostratigraphicMotionSample(sampleX,sampleY,{phase:TAU*(p+phase+t*.37),theta:.055});
  const moire=lattice.triangular,quasi=lattice.quasiperiodic;
  const [tx,ty]=lattice.g_triangular,[qx,qy]=lattice.g_quasiperiodic;
  const torsion=Math.max(-1,Math.min(1,(tx*qy-ty*qx)*1024));
  const shear=Math.max(-1,Math.min(1,(tx-qx)*32));
  const rise=(quasi+1)/2;
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
    message:'Flow-Core is previewing a full AI route: revisit, gather context, keep private material out, prepare, send, return, review, rest.',
    family:'phi-gossamer'
  }),
  Object.freeze({
    id:'protected-route',
    relations:Object.freeze(['protected_continuity','recurrence','gathering','created_potential','release','released_tendency','bounded_emergence','structural_rest']),
    glyphs:'cōl → 米 → à → 上 → 出 → 下 → hõt → 𝄐',
    message:'Private material stays out while Loom revisits context, gathers the task and reference, prepares the handoff, sends, returns, reviews, and rests.',
    family:'orbital-braid'
  }),
  Object.freeze({
    id:'emergent-route',
    relations:Object.freeze(['recurrence','bounded_emergence','gathering','protected_continuity','created_potential','release','released_tendency','structural_rest']),
    glyphs:'米 → hõt → à → cōl → 上 → 出 → 下 → 𝄐',
    message:'This route previews review before sending: revisit, review, gather what AI needs, keep private material out, prepare, send, return, rest.',
    family:'torsion-bloom'
  }),
  Object.freeze({
    id:'gather-and-return',
    relations:Object.freeze(['gathering','protected_continuity','created_potential','release','released_tendency','recurrence','bounded_emergence','structural_rest']),
    glyphs:'à → cōl → 上 → 出 → 下 → 米 → hõt → 𝄐',
    message:'Your request and reference gather first; private material stays out; sending, return, review, and rest remain separate steps.',
    family:'moire-shear'
  }),
  Object.freeze({
    id:'return-first-memory',
    relations:Object.freeze(['released_tendency','recurrence','gathering','protected_continuity','bounded_emergence','created_potential','release','structural_rest']),
    glyphs:'下 → 米 → à → cōl → hõt → 上 → 出 → 𝄐',
    message:'Returned work can be revisited and reviewed without becoming a new instruction; another send still requires a separate action.',
    family:'threnodic-gossamer'
  }),
  Object.freeze({
    id:'release-with-memory',
    relations:Object.freeze(['recurrence','gathering','created_potential','release','protected_continuity','released_tendency','bounded_emergence','structural_rest']),
    glyphs:'米 → à → 上 → 出 → cōl → 下 → hõt → 𝄐',
    message:'Loom revisits context, gathers the handoff, marks it ready, sends only on an explicit step, then brings returned work back for review.',
    family:'phasonic-rise'
  }),
  Object.freeze({
    id:'braided-custody',
    relations:Object.freeze(['protected_continuity','gathering','recurrence','bounded_emergence','created_potential','release','released_tendency','structural_rest']),
    glyphs:'cōl → à → 米 → hõt → 上 → 出 → 下 → 𝄐',
    message:'Private material stays out while context gathers; review can happen before a later send, and returned work can settle back into rest.',
    family:'gradient-stampede'
  }),
  Object.freeze({
    id:'quiet-cycle',
    relations:Object.freeze(['structural_rest','recurrence','gathering','protected_continuity','created_potential','release','released_tendency','bounded_emergence']),
    glyphs:'𝄐 → 米 → à → cōl → 上 → 出 → 下 → hõt',
    message:'The route can begin at rest, then revisit, gather, keep private material out, prepare, send, return, and review.',
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
