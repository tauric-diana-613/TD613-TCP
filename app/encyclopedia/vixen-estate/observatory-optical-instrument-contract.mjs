/**
 * RGI22 · Observatory optical instrument contract.
 * Aperture is a separately governed reference instrument; import only Vixen
 * source modules. Clock/source/claims remain separate. This adapter measures
 * native optical outputs WITHOUT commissioning or promoting an exhibit.
 */
import {measureCoutureBeats,BEAT_POLICY} from './vixen-beat-radiometry-rgi15.mjs';
import {buildFoldedCuirass} from './vixen-folded-cuirass.mjs';
import {buildLivingMesh} from './vixen-live-mesh-rgi13.mjs';
import {coutureGeometry} from './vixen-opaline-couture-rgi14.mjs';
import {triangular,quasiperiodic,CARRIERS} from './observatory-foundry-kernel.mjs';

export const OPTICAL_INSTRUMENT_SCHEMA='td613.vixen.observatory.optical-instrument/v1';
export const OPTICAL_OPERATOR_ORDER=Object.freeze([
 'LAYERED_D3_PHI_MOIRE_INTERFERENCE',
 'SEPARATELY_MEASURED_BEAT_GEOMETRY',
 'BOUNDED_BLOOM_AND_ELECTRICAL_EMISSION',
 'VIEWPORT_AWARE_RENDERING_AND_TEMPORAL_BEHAVIOR'
]);
export const ENGINE_LINEAGE=Object.freeze([
 Object.freeze({family:'APERTURE_V32',role:'SOURCE_REFERENCE_ONLY',source:'operator-supplied v3.2-alpha',
  imported_runtime:false,role_transfer:false,governs:'D3/phi layering and temporal non-equivalence'}),
 Object.freeze({family:'DOME_ART',role:'NATIVE_VIXEN_GEOMETRIC_ADAPTATION',
  imported_runtime:false,vixen_adapter:'observatory-foundry-kernel.mjs',geometry:'D3/Phi distinct'}),
 Object.freeze({family:'HOLONOMY_LOOM',role:'NATIVE_VIXEN_39_CARRIER_ADAPTATION',
  imported_runtime:false,vixen_adapter:'vixen-live-mesh-rgi13.mjs',carrier_partition:'6/13/20'}),
 Object.freeze({family:'REFRACTIVE_COUTURE',role:'VIXEN_DERIVED_OPALINE_GEOMETRY',
  imported_runtime:false,vixen_adapter:'vixen-opaline-couture-rgi14.mjs'}),
 Object.freeze({family:'DOLLHOUSE_DESIGN',role:'DESIGN_REVIEW_ORCHESTRATION_ONLY',
  imported_runtime:false,vixen_adapter:'dollhouse-design-grammar.mjs',is_renderer:false}),
 Object.freeze({family:'VIXEN_SALON',role:'EXECUTING_NATIVE_OPTICAL_PAINTERS',
  imported_runtime:true,vixen_adapter:'vixen-folded-cuirass.mjs'}),
 Object.freeze({family:'VIXEN_OBSERVATORY',role:'EXECUTING_GPU_OR_CPU_FOUNDRY',
  imported_runtime:true,vixen_adapter:'observatory-foundry-renderer.mjs'})
]);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const r=x=>Math.round(x*1e6)/1e6;
const good=x=>typeof x==='number'&&Number.isFinite(x);
const throwHeld=code=>{throw Object.assign(new Error(code),{code})};
function boundedInputs(o){
 const {width=480,height=320,dpr=1,time=0,sourceIds=[]}=o;
 if(![width,height,dpr,time].every(good)||width<200||height<150||
  width>1920||height>1200||dpr<.5||dpr>2||time<0||time>1e6||
  width*height*dpr*dpr>2500000)throwHeld('HELD_OPTICAL_VIEWPORT_OR_TIME_BUDGET');
 if(!Array.isArray(sourceIds)||sourceIds.length>2||
  sourceIds.some(x=>typeof x!=='string'||x.length<1||x.length>200))
  throwHeld('HELD_OPTICAL_SOURCE_COORDINATES');
 return {width,height,dpr,time,sourceIds:sourceIds.slice()};
}
function maxFinite(values,ceiling){
 return values.every(good)&&values.every(n=>n<=ceiling&&n>=0);
}
export function measureObservatoryOpticalInstrument(options={}){
 const {width,height,dpr,time,sourceIds}=boundedInputs(options);
 const seed=sourceIds.join('|').split('').reduce((h,x)=>Math.imul(h^x.charCodeAt(0),16777619)>>>0,2166136261);
 const samples=[];
 for(let y=1;y<=6;y++)for(let x=1;x<=8;x++)samples.push({x:width*x/9,y:height*y/7});
 const beat=measureCoutureBeats({width,height,time,seed,devicePixelRatio:dpr,samplePoints:samples});
 const fold=buildFoldedCuirass({width,height,time,sourceIds,beatToGeometryGain:.7,integrated:false});
 const baseline=buildFoldedCuirass({width,height,time,sourceIds,beatToGeometryGain:0,integrated:false});
 const opaline=coutureGeometry({width,height,time,sourceIds,devicePixelRatio:dpr});
 const mesh=buildLivingMesh({width,height,time,view:'observatory',sourceIds});
 if(beat.pairs.length!==3||mesh.fibers.length!==39||CARRIERS.length!==39)
  throwHeld('HELD_OPTICAL_ENGINE_CARDINALITY');
 const optics=beat.pairs.map(p=>({
  wavelength_css_px:r(p.wavelengthPx),speed_css_px_per_second:r(p.beatSpeedCssPxPerSecond),
  phase_difference_radians:r(p.phaseDelta),
  delta_k_px_inverse:r(Math.hypot(p.delta.x,p.delta.y))
 }));
 if(!optics.every(o=>Object.values(o).every(good))||
    !maxFinite([beat.totalEmission],BEAT_POLICY.peak_budget)||
    beat.peakCount>BEAT_POLICY.max_peaks)
  throwHeld('HELD_OPTICAL_EMISSION_OR_BEAT_INVALID');
 const overlay={triangular:r(triangular(21,13)),quasiperiodic:r(quasiperiodic(21,13))};
 const metrics=Object.freeze({
  seam_delta_css_px:r(fold.metrics.seamLength-baseline.metrics.seamLength),
  filament_delta_css_px:r(fold.metrics.filamentLength-baseline.metrics.filamentLength),
  opaline_ribs:opaline.ribs.length,opaline_hoops:opaline.hoops.length,
  mesh_carriers:mesh.fibers.length,mesh_trails:mesh.scene.trails.length,
  measured_samples:beat.pointsMeasured,temporal_envelope_mean:r(beat.envelopeMean),
  temporal_envelope_min:r(beat.envelopeMin),temporal_envelope_max:r(beat.envelopeMax),
  total_emission:r(beat.totalEmission)
 });
 return Object.freeze({
  schema:OPTICAL_INSTRUMENT_SCHEMA,
  four_operators:Object.freeze({
   layered_D3_phi_moire:{kind:OPTICAL_OPERATOR_ORDER[0],
    independent_fields:overlay,fold_differences:{
      seam_css_px:metrics.seam_delta_css_px,filament_css_px:metrics.filament_delta_css_px},
    periodic_equals_quasiperiodic:false},
   measured_beat_geometry:{kind:OPTICAL_OPERATOR_ORDER[1],
    pairs:optics,measured_samples:beat.pointsMeasured,
    envelope_mean:metrics.temporal_envelope_mean,
    computed_before_paint:true,geometry_time_invariant:true},
   bounded_bloom_emission:{kind:OPTICAL_OPERATOR_ORDER[2],
    computed_emission:metrics.total_emission,emission_budget:BEAT_POLICY.peak_budget,
    peaks:beat.peakCount,peak_budget:BEAT_POLICY.max_peaks,
    bloom_radius_ceiling_css_px:BEAT_POLICY.max_bloom_css_px,
    displayed_dark_trough_fidelity:'HELD_NOT_YET_VISUALLY_VERIFIED'},
   viewport_temporal:{kind:OPTICAL_OPERATOR_ORDER[3],
    viewport:{width,height,dpr,backing_pixels:Math.round(width*dpr)*Math.round(height*dpr)},
    nyquist_guarded:beat.nyquistGuarded,alias_ratio:r(beat.aliasRatio),
    time_received_from_host:time,child_raf_scheduled:false}
  }),
  metrics,
  source_ids_as_render_seeds:sourceIds,
  computed_data_to_visual_channels:Object.freeze([
   {observable:'measured_beat_wavelength',unit:'css_px',channel:'moire_fringe_spacing'},
   {observable:'fold_seam_delta',unit:'css_px',channel:'folded_strip_geometry'},
   {observable:'bounded_emission',unit:'relative_energy',channel:'bounded_bloom'},
   {observable:'39_carrier_projection',unit:'carrier_count',channel:'mesh_strata'}
  ]),
  classifications:{evidence:'SYNTHETIC_MODEL_ONLY',external_empirical_credit:0,
    geometry_mapping_verified:'COMPUTED_NOT_DISPLAY_FIDELITY_ASSAY',
    human_approval:false,release_authority:false}
 });
}
