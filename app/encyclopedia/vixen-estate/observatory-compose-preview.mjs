/**
 * TD613 Composition preview: distinct mathematical visualization forms sharing
 * the Salon's D3/phi beat, Folded Cuirass, Glinda Veil, 39-carrier room mesh,
 * and the Observatory's ONE host scheduler. No source mutation or promotion.
 */
import {buildFoldedCuirass,paintFoldedCuirass,CUIRASS_CONTRACT} from './vixen-folded-cuirass.mjs';
import {makeVeilFrame,VEIL_CONTRACT} from './vixen-salon-light.mjs';
import {MESH_CONTRACT} from './vixen-live-mesh-rgi13.mjs';
import {measureCoutureBeats,BEAT_POLICY} from './vixen-beat-radiometry-rgi15.mjs';
import {computeSwarmComposition,paintSwarmComposition,SWARM_SCHEMA} from './observatory-swarm-composition.mjs';
import {paintComputationalScore} from './observatory-computational-score.mjs';

export const COMPOSE_PREVIEW_SCHEMA='td613.vixen.observatory.composition-preview/v1';
export const VISUAL_FORMS=Object.freeze([
 'SWARM_DYNAMICS','PHASONIC_FOLD','GLINDA_VEIL','ROUTE_HOLONOMY','OBSERVABILITY_SPECTRUM','XOR_SYNERGY'
]);
export const OPTICAL_REUSE=Object.freeze({
 couture:CUIRASS_CONTRACT.schema,
 luminous_veil:VEIL_CONTRACT.schema,
 room_mesh:MESH_CONTRACT.schema,
 beat_geometry:BEAT_POLICY.schema,
 timetable:'BORROW_EXISTING_OBSERVATORY_SINGLE_HOST_CLOCK',
 source_only:true,empirical_replication_credit:0
});
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,Number.isFinite(+v)?+v:lo));
const stats=({form_id,time,sourceIds,width,height,extra={}})=>Object.freeze({
 schema:COMPOSE_PREVIEW_SCHEMA,form_id,host_time:time,source_ids:sourceIds.slice(),
 width,height,origin:'COMPOSER_PREVIEW_NOT_CORPUS_PROMOTION',optical_reuse:OPTICAL_REUSE,
 empirical_replication_credit:0,original_exhibit_preserved:true,...extra
});
/** A render-only approval envelope; caller must have checked host authorization.
 * This local visual preview is NEVER a custody or deployment authority.
 */
export function extractApprovedVisual(receipt){
 if(receipt?.schema!=='td613.vixen.podium.compose-gate/v1'||
    receipt.status!=='SUPPORTED'||receipt.state!=='COMPOSED_PREVIEW_ONLY'||
    receipt.approval?.authorization_kind!=='HOST_VERIFIED_SEPARATE_HUMAN'||
    receipt.release_authority!==false)return null;
 const candidates=receipt.approved_visual_candidates;
 if(!Array.isArray(candidates)||candidates.length!==1)return null;
 const selected=candidates[0];
 if(!VISUAL_FORMS.includes(selected.form_id))return null;
 return Object.freeze({form_id:selected.form_id,
  data_contract:selected.data_contract,
  source_ids:(receipt.composition?.changes||[])
   .filter(c=>c.type==='VISUAL_FORM_CHANGE')
   .flatMap(c=>Array.isArray(c.source_ids)?c.source_ids:[]).slice(0,2),
  score_digest:receipt.composition.score_digest,
  approval_receipt:receipt.approval.independent_receipt_id
 });
}
export function paintComposerVisualFrame(canvas,{form_id='SWARM_DYNAMICS',
 time=0,model={},pointer={x:0,y:0},sourceIds=[],labId='LAB_RC-09'}={}){
 if(!VISUAL_FORMS.includes(form_id))throw new TypeError('HELD_UNREGISTERED_VISUAL_FORM');
 if(!canvas?.getContext)throw new TypeError('HELD_VISUAL_CANVAS_REQUIRED');
 const rect=canvas.getBoundingClientRect();
 const width=clamp(rect.width||canvas.clientWidth||480,180,1400);
 const height=clamp(rect.height||canvas.clientHeight||360,140,1100);
 const dpr=clamp(canvas.ownerDocument?.defaultView?.devicePixelRatio||1,1,1.5);
 const pixW=Math.round(width*dpr),pixH=Math.round(height*dpr);
 if(canvas.width!==pixW||canvas.height!==pixH){canvas.width=pixW;canvas.height=pixH}
 const ctx=canvas.getContext('2d');
 if(!ctx)throw new Error('HELD_VISUAL_CANVAS2D_MISSING');
 ctx.setTransform(dpr,0,0,dpr,0,0);
 ctx.clearRect(0,0,width,height);
 const ids=Array.isArray(sourceIds)?sourceIds.filter(x=>typeof x==='string').slice(0,2):[];
 if(form_id==='SWARM_DYNAMICS'){
  // Independent multi-agent position-space visualization, not a restyled curve.
  const n=computeSwarmComposition({
   width,height,sourceIds:ids,phase:time,iterations:Math.max(6,Math.min(48,Math.round(10+clamp(model.gain,0,1)*28))),
   alignment:clamp(model.witness,0,1),cohesion:clamp(model.gain,0,1),separation:clamp(model.twist,0,1)
  });
  const drawn=paintSwarmComposition(ctx,n);
  return stats({form_id,time,sourceIds:ids,width,height,
   extra:{model_schema:SWARM_SCHEMA,agents:drawn.agents,mean_neighbor_displacement:n.mean_neighbor_displacement,
    beat_wavelengths:n.beat_wavelengths,geometry:'MULTI_AGENT_TAILS_AND_POSITION_SPACE'}});
 }
 if(form_id==='PHASONIC_FOLD'){
  const m=buildFoldedCuirass({width,height,time,sourceIds:ids,beatToGeometryGain:clamp(model.gain,0,1),
   lag:30,integrated:false});
  const painted=paintFoldedCuirass(ctx,m);
  return stats({form_id,time,sourceIds:ids,width,height,
   extra:{model_schema:CUIRASS_CONTRACT.schema,geometry:'FOLDED_CHROME_CUIRASS',
    painted:Boolean(painted),wavelengths:m.field.pairs.map(p=>p.wavelengthPx)}});
 }
 if(form_id==='GLINDA_VEIL'){
  // The same veil painter as Salon, with a host-supplied rather than child clock.
  const a=ids[0]||'VIXEN_NEUTRAL_A',b=ids[1]||'VIXEN_NEUTRAL_B';
  const result=makeVeilFrame({canvas,works:[a,b],route:'A_B',time,lag:30});
  return stats({form_id,time,sourceIds:ids,width,height,
   extra:{model_schema:VEIL_CONTRACT.schema,geometry:'D3_PHI_OPALINE_VEIL',painted:!!result}});
 }
 const map={'ROUTE_HOLONOMY':'LAB_RC-09','OBSERVABILITY_SPECTRUM':'LAB_RC-07','XOR_SYNERGY':'LAB_RC-10'};
 const output=paintComputationalScore(canvas,{labId:map[form_id]||labId,model,time,pointer});
 return stats({form_id,time,sourceIds:ids,width,height,
  extra:{model_schema:output.schema,geometry:'RECORDED_COMPUTATIONAL_SCORE'}});
}
export function inspectOpticalReadiness({width=480,height=360,time=0,sourceIds=[]}={}){
 const beats=measureCoutureBeats({width,height,time,seed:0,devicePixelRatio:1});
 return Object.freeze({schema:COMPOSE_PREVIEW_SCHEMA,available_forms:VISUAL_FORMS,
  optical_engines:OPTICAL_REUSE,beat_pairs:beats.pairs.length,
  nyquist_guarded:beats.nyquistGuarded,single_host_clock:true,
  no_automatic_scene_replacement:true,human_closure:'RESERVED'});
}
