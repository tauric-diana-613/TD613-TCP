import assert from 'node:assert/strict';
import {test} from 'node:test';
import {buildPodiumOpticalPlan,paintPodiumOpticalPreview,OPTICAL_BRIDGE_SCHEMA}
 from '../app/encyclopedia/vixen-estate/podium-salon-optical-bridge.mjs';
const sources=['emwork_085223e721130117f5510975','emwork_0885af7e4851a2e81618b37a'];
const inputs={phasonic_interference:.8,spectral_conditioning:.7,
 clock_holonomy:.6,cluster_bridge:.7,synergy_fadt:.8,mirror_nullspace:.7};
test('Computed Podium Score drives Salon corset strain, Opaline, shared mesh and four optical operators',()=>{
 const a=buildPodiumOpticalPlan({sourceIds:sources,breakdown:inputs});
 const b=buildPodiumOpticalPlan({sourceIds:sources,breakdown:{...inputs,phasonic_interference:.03}});
 assert.equal(a.schema,OPTICAL_BRIDGE_SCHEMA);
 assert.equal(a.selected_preview_renderer,'FOLDED_CHROME_CANVAS2D');
 assert.notEqual(a.score_to_optics_controls.fold_gain,b.score_to_optics_controls.fold_gain);
 assert.notEqual(a.four_macro_operators.A_distinct_D3_phi_fold.seam_delta_px,
   b.four_macro_operators.A_distinct_D3_phi_fold.seam_delta_px);
 assert.equal(a.four_macro_operators.B_beat_prepaint.pairs.length,3);
 assert.ok(a.four_macro_operators.C_finite_bloom.emission<=a.four_macro_operators.C_finite_bloom.budget);
 assert.equal(a.four_macro_operators.D_viewport_clock.own_raf_created,false);
 assert.equal(a.coupled_pipeline_evidence.RGI14_opaline_ribs,39);
 assert.equal(a.coupled_pipeline_evidence.RGI13_room_mesh_carriers,39);
 assert.equal(a.coupled_pipeline_evidence.swarm_agents,39);
 assert.equal(a.coupled_pipeline_evidence.loom_carrier_partition.reduce((n,m)=>n+m,0),39);
 assert.equal(a.stage_preview_binding.live_site_not_changed,true);
});
test('New swarm renderer remains distinct; unsupported Observatory geometry explicitly holds',()=>{
 const swarm=buildPodiumOpticalPlan({sourceIds:sources,breakdown:inputs,visualFormId:'SWARM_DYNAMICS'});
 assert.equal(swarm.selected_preview_renderer,'SWARM_CANVAS2D_CANDIDATE');
 const legacy=buildPodiumOpticalPlan({sourceIds:sources,breakdown:inputs,visualFormId:'ROUTE_HOLONOMY'});
 assert.equal(legacy.selected_preview_renderer,'EXISTING_OBSERVATORY_HOST_REQUIRED');
 assert.throws(()=>paintPodiumOpticalPreview(null,legacy),/HELD_PREVIEW_CANVAS_AND_PLAN_REQUIRED/);
});
