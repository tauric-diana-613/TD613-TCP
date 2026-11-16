/**
 * TD613 Vixen: machine Score --> executable Salon optical model.
 * Uses real RGI15 beat radiometry, RGI14 Opaline ribs, RGI13 room mesh,
 * DD02 folded chrome cuirass, Loom carriers, and new distinct swarm painter.
 * No autonomous clock, source mutation, composer approval, or site install.
 */
import {buildFoldedCuirass,paintFoldedCuirass,CUIRASS_POLICY,SALON_COMPOSITOR} from './vixen-folded-cuirass.mjs';
import {coutureGeometry,paintOpalineCouture,OPAL_COUTURE_CONTRACT} from './vixen-opaline-couture-rgi14.mjs';
import {buildLivingMesh,paintLivingMesh,MESH_CONTRACT} from './vixen-live-mesh-rgi13.mjs';
import {measureCoutureBeats,BEAT_POLICY} from './vixen-beat-radiometry-rgi15.mjs';
import {computeSwarmComposition,paintSwarmComposition,SWARM_SCHEMA} from './observatory-swarm-composition.mjs';
import {CARRIERS,project111,triangular,quasiperiodic} from './observatory-foundry-kernel.mjs';
import {SALON_FIELD_POLICY} from './vixen-salon-ambient-field.mjs';
import {VEIL_CONTRACT} from './vixen-salon-light.mjs';
import {RENDERER_CONTRACT} from './observatory-foundry-renderer.mjs';
import {SCORE_CONTRACT} from './observatory-computational-score.mjs';
export const OPTICAL_BRIDGE_SCHEMA='td613.vixen.podium.salon-optical-performance/v1';
const b=(n,a=0,c=1)=>Math.max(a,Math.min(c,Number.isFinite(+n)?+n:a));
const r=n=>Math.round(n*1e6)/1e6;
function controls(score){
 const phasonic=b(score.phasonic_interference),spectral=b(score.spectral_conditioning);
 const holonomy=b(score.clock_holonomy),bridge=b(score.cluster_bridge);
 const synergy=b(score.synergy_fadt),nullspace=b(score.mirror_nullspace);
 return {phasonic,spectral,holonomy,bridge,synergy,nullspace,
  fold_gain:r(b(.10+.38*phasonic+.22*holonomy+.20*nullspace+.10*synergy)),
  mesh_intensity:r(b(.12+.41*bridge+.34*synergy+.13*phasonic)),
  opaline_intensity:r(b(.10+.43*phasonic+.31*nullspace+.16*spectral)),
  optic_exposure:r(b(.16+.40*spectral+.26*phasonic+.18*bridge)),
  route:holonomy>.52?'B_A':'A_B',
  projection:project111([spectral,holonomy,phasonic]).projection.map(r)};
}
export function buildPodiumOpticalPlan({sourceIds=[],breakdown={},visualFormId='PHASONIC_FOLD',
 lagTicks=36,width=360,height=300,phase=0,dpr=1}={}){
 if(!Array.isArray(sourceIds)||sourceIds.length>2||sourceIds.some(x=>typeof x!=='string'))
  throw new TypeError('HELD_SOURCE_ID_PAIR');
 if(![width,height,phase,dpr,lagTicks].every(Number.isFinite)||width<200||width>1920||height<150||height>1200||phase<0||phase>240)
  throw new RangeError('HELD_BOUNDED_OPTICAL_VIEWPORT');
 const ctl=controls(breakdown),D=b(dpr,.5,CUIRASS_POLICY.max_dpr),lag=b(lagTicks,4,120);
 const seed=sourceIds.join('|').split('').reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);
 const samples=[];for(let y=1;y<=10;y++)for(let x=1;x<=14;x++)samples.push({x:width*x/15,y:height*y/11});
 const beat=measureCoutureBeats({width,height,time:phase,seed,devicePixelRatio:D,samplePoints:samples});
 const buildFold=gain=>buildFoldedCuirass({width,height,time:phase,sourceIds,beatToGeometryGain:gain,
  route:ctl.route,lag,integrated:false});
 const model=buildFold(ctl.fold_gain),baseline=buildFold(0);
 const opaline=coutureGeometry({width,height,time:phase,sourceIds,devicePixelRatio:D});
 const mesh=buildLivingMesh({width,height,time:phase,view:'observatory',sourceIds});
 const swarm=computeSwarmComposition({width,height,phase,sourceIds,iterations:16,
  alignment:b(.22+.70*ctl.synergy),cohesion:b(.14+.70*ctl.holonomy),
  separation:b(.12+.62*ctl.nullspace)});
 const render=visualFormId==='SWARM_DYNAMICS'?'SWARM_CANVAS2D_CANDIDATE':
  visualFormId==='PHASONIC_FOLD'?'FOLDED_CHROME_CANVAS2D':'EXISTING_OBSERVATORY_HOST_REQUIRED';
 return {
  schema:OPTICAL_BRIDGE_SCHEMA,visual_form_id:visualFormId,
  selected_preview_renderer:render,score_to_optics_controls:ctl,
  source_ids:sourceIds,source_ids_are_seeds_not_custody_claims:true,
  viewport:{width,height,dpr:D,phase,lag,route:ctl.route},
  four_macro_operators:{
   A_distinct_D3_phi_fold:{d3:r(triangular(21,13)),phi:r(quasiperiodic(21,13)),
    corset_panels:CUIRASS_POLICY.panels,
    seam_delta_px:r(model.metrics.seamLength-baseline.metrics.seamLength),
    filament_delta_px:r(model.metrics.filamentLength-baseline.metrics.filamentLength)},
   B_beat_prepaint:{pairs:beat.pairs.map(p=>({wavelength_px:r(p.wavelengthPx),
    speed_px_per_s:r(p.beatSpeedCssPxPerSecond),phase_delta:r(p.phaseDelta)})),
    measured_samples:beat.pointsMeasured,computed_before_paint:true},
   C_finite_bloom:{emission:r(beat.totalEmission),budget:BEAT_POLICY.peak_budget,
    peak_count:beat.peakCount,max_peaks:BEAT_POLICY.max_peaks,
    bloom_max_css_px:BEAT_POLICY.max_bloom_css_px,
    displayed_dark_troughs_not_yet_verified:true},
   D_viewport_clock:{nyquist_guarded:beat.nyquistGuarded,alias_ratio:r(beat.aliasRatio),
    max_dpr:CUIRASS_POLICY.max_dpr,max_pixels:CUIRASS_POLICY.max_backing_pixels,
    still_respects_external_host:true,own_raf_created:false}
  },
  coupled_pipeline_evidence:{
   DD02_chrome_compositor:SALON_COMPOSITOR,
   DD02_chrome_strips:model.metalStrips.length,
   DD02_lattice_nodes:model.latticeNodes.length,
   DD02_filaments:model.filaments.length,
   RGI14_opaline_contract:OPAL_COUTURE_CONTRACT.schema,
   RGI14_opaline_ribs:opaline.ribs.length,
   RGI14_opaline_hoops:opaline.hoops.length,
   RGI14_opaline_beats:opaline.optics.pointsMeasured,
   RGI13_room_mesh_contract:MESH_CONTRACT.schema,
   RGI13_room_mesh_carriers:mesh.fibers.length,
   RGI13_room_mesh_trails:mesh.scene.trails.length,
   DD02_shared_cloth_policy:SALON_FIELD_POLICY.schema,
   RGI11_veil_contract:VEIL_CONTRACT.schema,
   observatory_shader_contract:RENDERER_CONTRACT.schema,
   observatory_mathematical_score_contract:SCORE_CONTRACT.schema,
   loom_carrier_partition:[CARRIERS.filter(c=>c.near).length,CARRIERS.filter(c=>c.mid).length,
    CARRIERS.filter(c=>!c.near&&!c.mid).length],
   swarm_model:SWARM_SCHEMA,swarm_agents:swarm.agent_count,
   GPU_CPU_backend_parity_not_verified:true
  },
  stage_preview_binding:{
   main:'folded chrome OR independently computed agent swarm',
   shared_lighting:'score mesh_intensity -> buildLivingMesh/paintLivingMesh',
   opaline:'score opaline_intensity -> coutureGeometry/paintOpalineCouture',
   source_and_phase:'single source pair and phase shared across renderers',
   separate_canvas_layering_required:true,
   no_fallback_to_previous_chart_for_unsupported_form:true,
   external_canvas_required:true,live_site_not_changed:true
  },
  experimental_only:true,empirical_credit:0,human_closure:'RESERVED'
 };
}
export function paintPodiumOpticalPreview(canvas,plan,{meshCanvas=null,opalineCanvas=null}={}){
 if(!canvas?.getContext||plan?.schema!==OPTICAL_BRIDGE_SCHEMA)
  throw new TypeError('HELD_PREVIEW_CANVAS_AND_PLAN_REQUIRED');
 const {width,height,phase,lag,route}=plan.viewport;
 if(canvas.width!==width||canvas.height!==height)throw new RangeError('HELD_CANVAS_DIMENSION_MISMATCH');
 const ctx=canvas.getContext('2d');
 if(!ctx)throw new TypeError('HELD_CANVAS2D_UNAVAILABLE');
 const ids=plan.source_ids,c=plan.score_to_optics_controls;
 let result=null;
 if(plan.selected_preview_renderer==='FOLDED_CHROME_CANVAS2D')
  result=paintFoldedCuirass(ctx,buildFoldedCuirass({width,height,time:phase,sourceIds:ids,
   beatToGeometryGain:c.fold_gain,route,lag,integrated:false}));
 else if(plan.selected_preview_renderer==='SWARM_CANVAS2D_CANDIDATE')
  result=paintSwarmComposition(ctx,computeSwarmComposition({width,height,sourceIds:ids,phase,iterations:16,
   alignment:b(.22+.70*c.synergy),cohesion:b(.14+.70*c.holonomy),
   separation:b(.12+.62*c.nullspace)}));
 else throw new TypeError('HELD_UNBOUND_OBSERVATORY_VISUAL_RENDERER');
 const layers={primary:result};
 if(meshCanvas){
  if(!meshCanvas.getContext||meshCanvas.width!==width||meshCanvas.height!==height)throw new TypeError('HELD_MESH_CANVAS');
  layers.room_mesh=paintLivingMesh(meshCanvas.getContext('2d'),buildLivingMesh({
   width,height,time:phase,view:'observatory',sourceIds:ids
  }),{intensity:c.mesh_intensity});
 }
 if(opalineCanvas){
  if(!opalineCanvas.getContext||opalineCanvas.width!==width||opalineCanvas.height!==height)
   throw new TypeError('HELD_OPALINE_CANVAS');
  layers.opaline=paintOpalineCouture(opalineCanvas.getContext('2d'),
    coutureGeometry({width,height,time:phase,sourceIds:ids}));
 }
 return {schema:OPTICAL_BRIDGE_SCHEMA,preview_rendered:true,layers,
  canonical_salon_unchanged:true,composition_not_committed:true,
  host_clock_only:true,empirical_credit:0};
}
