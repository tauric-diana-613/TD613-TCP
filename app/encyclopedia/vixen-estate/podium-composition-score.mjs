/**
 * Podium computational Score and machine-only Compose STOP boundary.
 * Agent selects research and visual forms. Human Composer alone finalizes
 * editing and closure for user SUBMITTED SYNTHESIS, not developer code edits.
 *
 * Optical measurements execute actual Vixen engines; do not interpret
 * generated lights or source names as independent empirical witnesses.
 */
import {scoreUnifiedSynthesisCandidates,computeMatrixSvdUnified,computeClockVernier} from './synthesis-salon-engine.mjs';
import {buildVixenLaboratories} from './observatory-vixen-corpus.mjs';
import {buildFoldedCuirass,CUIRASS_POLICY} from './vixen-folded-cuirass.mjs';
import {measureCoutureBeats,BEAT_POLICY} from './vixen-beat-radiometry-rgi15.mjs';
import {buildLivingMesh} from './vixen-live-mesh-rgi13.mjs';
import {CARRIERS,triangular,quasiperiodic,project111} from './observatory-foundry-kernel.mjs';
import {computeSwarmComposition,SWARM_SCHEMA} from './observatory-swarm-composition.mjs';
import {buildPodiumOpticalPlan} from './podium-salon-optical-bridge.mjs';
export const COMPOSER_SCORE_SCHEMA='td613.vixen.podium.composer-score/v1';
const tidy=(x,max=500)=>typeof x==='string'?x.trim().slice(0,max):'';
const fail=(ok,error)=>{if(!ok)throw Object.assign(new TypeError(error),{code:error})};
const round=n=>Math.round(n*10000)/10000;
const clip=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(+x)?+x:a));
const forms=Object.freeze([
 {id:'PHASONIC_FOLD',family:'D3_PHI_FOLDED_CHROME',engine:'FOLDED_CUIRASS_AND_WEBGL2',lab:'LAB_RC-05',installed:true,signal:'phasonic_interference'},
 {id:'OBSERVABILITY_SPECTRUM',family:'SVD_RANK_GEOMETRY',engine:'OBSERVATORY_CANVAS2D_SVD',lab:'LAB_RC-07',installed:true,signal:'spectral_conditioning'},
 {id:'ROUTE_HOLONOMY',family:'NONCOMMUTING_ROUTE_RETURN',engine:'OBSERVATORY_CANVAS2D_HOLONOMY',lab:'LAB_RC-09',installed:true,signal:'clock_holonomy'},
 {id:'XOR_SYNERGY',family:'DISTRIBUTED_INFORMATION',engine:'OBSERVATORY_CANVAS2D_XOR',lab:'LAB_RC-10',installed:true,signal:'synergy_fadt'},
 {id:'SWARM_DYNAMICS',family:'MULTI_AGENT_PHASE_SPACE',engine:'NEW_SWARM_CANVAS2D_PAINTER',lab:'LAB_RC-09',installed:false,signal:'src_projective_tomography'},
 {id:'RELATIONAL_GRAPH',family:'TYPED_EDGE_TOPOLOGY',engine:'NEW_GRAPH_RENDERER',lab:'LAB_TCC-01',installed:false,signal:'cluster_bridge'}
]);
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
async function digest(obj){
 fail(globalThis.crypto?.subtle,'HELD_CRYPTOGRAPHIC_DIGEST_REQUIRED');
 return hex(await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(obj))));
}
function sourceChanges(corpus,proposals){
 fail(Array.isArray(proposals)&&proposals.length<=60,'HELD_CORPUS_CHANGE_BOUNDS');
 const present=new Map(corpus.works.flatMap(w=>(w.linked_sources||[]).map(s=>[s.source_file_id,{work_id:w.work_id,sha256:s.sha256||null}])));
 return proposals.map((x,i)=>{
  fail(x&&typeof x==='object'&&!Array.isArray(x),'HELD_INVALID_SOURCE_CHANGE');
  const action=tidy(x.action,40),id=tidy(x.source_file_id,150);
  fail(['EXCLUDE','ADMIT','RECLASSIFY','REPLACE'].includes(action)&&id,'HELD_UNDECLARED_CORPUS_CHANGE');
  const existing=present.get(id);
  const status=existing?'CURRENT_SOURCE_ID_MATCH':'NOT_IN_CURRENT_ACTIVE_MANIFEST';
  return {index:i+1,source_file_id:id,action,work_id:existing?.work_id||null,
   original_sha256:existing?.sha256||null,
   declared_replacement_sha256:/^[a-f0-9]{64}$/.test(x.replacement_sha256||'')?x.replacement_sha256:null,
   reason:tidy(x.reason,500),baseline_status:status,
   archival_recovery_required:!existing,
   current_state_mutated:false,
   decision:'HELD_UNTIL_HUMAN_COMPOSER_CLOSURE_AND_SEPARATE_CUSTODY_VERIFICATION'};
 });
}
function opticalDiagnostics(sourceIds,lagTicks){
 const width=360,height=300,clock=0,seed=sourceIds.join('|').split('').reduce((v,c)=>(Math.imul(v^c.charCodeAt(0),16777619)>>>0),2166136261);
 const points=[];for(let y=1;y<=10;y++)for(let x=1;x<=14;x++)points.push({x:x*width/15,y:y*height/11});
 const beat=measureCoutureBeats({width,height,seed,time:clock,devicePixelRatio:1,samplePoints:points});
 const folded=buildFoldedCuirass({width,height,time:clock,sourceIds,beatToGeometryGain:1,lag:lagTicks,integrated:false});
 const control=buildFoldedCuirass({width,height,time:clock,sourceIds,beatToGeometryGain:0,lag:lagTicks,integrated:false});
 const mesh=buildLivingMesh({width,height,time:clock,view:'observatory',sourceIds});
 const swarm=computeSwarmComposition({width,height,sourceIds,phase:clock,iterations:12});
 const delta=round(folded.metrics.seamLength-control.metrics.seamLength);
 const phaseD=triangular(13.1,11.3,{theta:.04}),phaseP=quasiperiodic(13.1,11.3,{phase:.08});
 const vector=project111([clip(Math.abs(delta)/300),clip(beat.totalEmission/BEAT_POLICY.peak_budget),.5]);
 const svd=computeMatrixSvdUnified([[1,.2],[.1,.7]]);
 const clocks=computeClockVernier(lagTicks,{route:'B_A'});
 return {
  A_distinct_D3_phi_and_fold:{D3:round(phaseD),phi:round(phaseP),different:Math.abs(phaseD-phaseP)>1e-8,
   measured_fold_seam_delta_px:delta,fold_geometry_coupled_to_beats:Math.abs(delta)>1e-8},
  B_prepaint_beat_diagnostics:{samples:beat.pointsMeasured,peak_count:beat.peakCount,
   pairs:beat.pairs.map(p=>({wavelength_px:round(p.wavelengthPx),
    beat_speed_css_px_s:round(p.beatSpeedCssPxPerSecond),phase_delta:round(p.phaseDelta)})),
   field_before_pixels:true},
  C_finite_bloom_dark_troughs:{energy:round(beat.totalEmission),budget:BEAT_POLICY.peak_budget,
   bloom_count:beat.peakCount,max_peaks:BEAT_POLICY.max_peaks,
   max_bloom_radius_css_px:BEAT_POLICY.max_bloom_css_px,
   optical_envelope_min:round(beat.envelopeMin),
   rendered_dark_trough_verified:false},
  D_viewport_DPR_sampling_clock:{viewport:[width,height],sample_dpr:1,
   nyquist_guarded:beat.nyquistGuarded,alias_ratio:round(beat.aliasRatio),
   single_host_clock_required:true,
   folded_max_dpr:CUIRASS_POLICY.max_dpr,still_policy:'STATIC_FRAME_WITHOUT_NEW_RAF'},
  additional_pipelines:{
   carrier_count:CARRIERS.length,
   carrier_partition:[CARRIERS.filter(c=>c.near).length,CARRIERS.filter(c=>c.mid).length,CARRIERS.filter(c=>!c.near&&!c.mid).length],
   cuirass_panels:CUIRASS_POLICY.panels,material_strips:folded.metalStrips.length,
   folded_lattice_nodes:folded.latticeNodes.length,folded_filaments:folded.filaments.length,
   scene_trails:mesh.scene.trails.length,room_mesh_carriers:mesh.fibers.length,
   P111_projection:vector.projection,
   SVD_rank:svd.rank,SVD_condition_number:round(svd.condition_number),
   vernier_inversions:clocks.arrival_inversions,
   swarm_model_schema:SWARM_SCHEMA,swarm_agents:swarm.agent_count,
   GPU_fallback_contract:'WEBGL2_THEN_DETERMINISTIC_CANVAS2D',
   native_computational_score:'PRESENT_CURRENT_LAB_ID_MAPPING',
   compositing:'BEAT_PREPAINT_THEN_FIELD_THEN_MATERIAL_THEN_BOUNDED_BLOOM',
   motion:'SINGLE_OWNER_HOST_CLOCK_AND_REDUCED_MOTION',
   empirical_replication_credit:0
  }
 };
}
const humanReadable=score=>[
 '# PODIUM SCORE · FOR THE HUMAN COMPOSER',
 'Decision: '+score.synthesis.selected.id+' · weighted model '+score.synthesis.selected.score,
 'Proposed architecture: '+score.visuals.selected.id+' · fitness '+score.visuals.selected.fitness,
 'Renderer: '+score.visuals.selected.renderer_state+
 ' · install readiness '+score.visuals.selected.install_readiness,
 '## All proposed changes',
 ...score.proposed_changes.map(c=>c.id+' · '+c.state+' · '+c.title+' · '+c.justification),
 '## Optical acceptance contract A / B / C / D',
 ...Object.entries(score.optical).filter(([k])=>/^[ABCD]_/.test(k)).map(([k,v])=>k+' · '+JSON.stringify(v)),
 '## Alternatives',
 ...score.visuals.alternatives.map(v=>v.id+' '+v.fitness+' '+v.renderer_state),
 '## Composer closure',
 'Read the exact digest; request final edits or authorize this exact Score. No corpus changes or publication before approval.',
 'Composing is NOT deploying, merging, source admission, scientific closure or an Experiment B flight.'
].join('\n');
export async function makePodiumScore(corpus,params={},sourceRevision='UNVERIFIED'){
 fail(corpus&&Array.isArray(corpus.works),'HELD_SOURCE_CORPUS_REQUIRED');
 fail(params&&typeof params==='object'&&!Array.isArray(params),'HELD_SCORE_PARAMETERS');
 const sourceChangesList=sourceChanges(corpus,params.source_changes||[]);
 const pending=params.pending_materials||[];
 fail(Array.isArray(pending)&&pending.length<=24,'HELD_PENDING_MATERIAL_BOUNDS');
 const pendingEntries=pending.map(x=>{
  fail(x&&typeof x==='object'&&tidy(x.title,200)&&/^[a-f0-9]{64}$/.test(x.sha256||''),'HELD_DECLARED_SOURCE_IDENTITY_REQUIRED');
  return {title:tidy(x.title,200),declared_sha256:x.sha256,actual_bytes_verified:false,source_admitted:false};
 });
 const question=tidy(params.research_question||params.operator_question,600);
 const lag=Number.isFinite(Number(params.lag_ticks))?Math.max(4,Math.min(120,Number(params.lag_ticks))):36;
 const ranked=scoreUnifiedSynthesisCandidates(corpus,{operatorQuestion:question,lagTicks:lag,candidateLimit:12});
 const winner=ranked.top_candidate;
 const rankedWorks=corpus.works.map(w=>{
  const label=(w.display_title||w.declared_title||'').toLowerCase(),key=(winner.title||'').toLowerCase().split(/[^a-z]+/).filter(t=>t.length>5);
  return {work_id:w.work_id,hits:key.filter(k=>label.includes(k)).length};
 }).sort((a,b)=>b.hits-a.hits||a.work_id.localeCompare(b.work_id));
 const sourceIds=rankedWorks.slice(0,2).map(w=>w.work_id);
 const optic=opticalDiagnostics(sourceIds,lag);
 const labs=buildVixenLaboratories(corpus);
 const textual=(question+' '+winner.title+' '+winner.subtitle).toLowerCase();
 const candidates=forms.map(form=>{
  const signal=clip(winner.breakdown[form.signal]);
  const cue=form.id==='SWARM_DYNAMICS'&&/swarm|multi.agent|flock|collective/.test(textual)?1:
   form.id==='RELATIONAL_GRAPH'&&/causal|graph|edge/.test(textual)?1:0;
  // Score architecture on its own model signal; an unverified title is a lead only.
  const evidence=round(.66*signal+.17*clip(winner.score)+.12*cue+.05*(form.installed?1:0));
  const lab=labs.find(x=>x.id===form.lab);
  return {id:form.id,family:form.family,engine:form.engine,lab_id:form.lab,
   current_optic:lab?.optic_program||null,fitness:evidence,
   signal_component:form.signal,signal_value:signal,query_cue:cue,
   renderer_state:form.installed?'EXISTING_ENGINE':'NEW_GEOMETRY_CANDIDATE',
   install_readiness:form.installed?'CURRENT_RUNTIME':'REQUIRES_COMPOSER_AND_QUALIFICATION',
   has_executable_candidate_preview:form.id==='SWARM_DYNAMICS',
   evidence_ceiling:'MODEL_AND_SOURCE_METADATA_ONLY'};
 }).sort((a,b)=>b.fitness-a.fitness||a.id.localeCompare(b.id));
 const chosen=candidates[0];
 // Native score signals now drive the real Salon render pipeline; stage only.
 const salonOptics=buildPodiumOpticalPlan({sourceIds,breakdown:winner.breakdown,
  visualFormId:chosen.id,lagTicks:lag,width:360,height:300,phase:0,dpr:1});
 const changes=[
  {id:'SCORE-01',state:'PROPOSED',area:'SYNTHESIS',title:'Select '+winner.title,
   justification:'Native eight-dimensional model score '+winner.score+' with original weights and breakdown; not an observed result'},
  {id:'SCORE-02',state:chosen.install_readiness==='CURRENT_RUNTIME'?'PROPOSED':'HELD_NEW_RENDERER',
   area:'OBSERVATORY',title:'Choose '+chosen.family+' for '+chosen.lab_id,
   justification:'Model-based visual fitness '+chosen.fitness+' vs existing '+chosen.current_optic+
    '; renders through explicitly declared optical A/B/C/D pipeline'},
  {id:'SCORE-03',state:'PROPOSED',area:'OPTICAL_ENGINE',title:'Connect four macro operators and the 39-carrier lattice to the new Score',
   justification:'Real prepaint diagnostics, fold displacement, emission bounds, pixel sampling, still/motion cadence and WebGL fallback inspected'},
  {id:'SCORE-04',state:'PROPOSED',area:'EDITORIAL',title:'Compose replacement explanation, captions and mathematical evidence limits',
   justification:'Pending human final edits, no automatic tagline overwrite'},
  {id:'SCORE-05',state:'PROPOSED',area:'SALON_COUTURE',
   title:'Bind the Score to Folded Chrome corset, room-wide mesh, Opaline, beat radiometry and lighting',
   justification:'Measured native optical controls: fold '+salonOptics.score_to_optics_controls.fold_gain+
    ', mesh '+salonOptics.score_to_optics_controls.mesh_intensity+
    ', scene '+salonOptics.selected_preview_renderer},
  {id:'SCORE-06',state:salonOptics.selected_preview_renderer==='EXISTING_OBSERVATORY_HOST_REQUIRED'?'HELD_HOST_RENDERER':'PROPOSED_PREVIEW',
   area:'ALTERNATIVE_VISUAL_FORM',title:'Stage a different computational renderer without coercion to the old chart',
   justification:'Canvas renderer selection remains a separate Composer-governed installation'}
 ];
 for(const change of sourceChangesList)changes.push({id:'SOURCE-'+String(change.index).padStart(2,'0'),
  state:'HELD_CORPUS_MUTATION',area:'SOURCE_CUSTODY',
  title:change.action+' '+change.source_file_id,
  justification:'Original '+(change.original_sha256||'UNAVAILABLE')+'; '+change.baseline_status+'; '+change.reason});
 if(pendingEntries.length)changes.push({id:'SCORE-ARCHIVE',state:'HELD_UNVERIFIED_SOURCE_BYTES',
  area:'BLIND_ARCHIVE',title:'Evaluate '+pendingEntries.length+' pending material declarations',
  justification:'Declared hashes not compared to independent source bytes; no content-based science claim'});
 changes.push({id:'SCORE-HUMAN',state:'HELD',area:'CUSTODY',
  title:'Preserve eight identity gates and all independent evidence boundaries',
  justification:'Human Composer closure required before source mutation, composed publication or canonical presentation changes'});
 const scored={
  schema:COMPOSER_SCORE_SCHEMA,score_scope:'USER_SUBMITTED_SYNTHESIS_NOT_DEVELOPER_EDIT',
  source_revision_declared:sourceRevision,external_source_verification:false,
  source_census:{works:corpus.works.length,manifestations:corpus.works.reduce((n,w)=>n+w.linked_sources.length,0),
   labs:labs.length,pending:pendingEntries,source_changes:sourceChangesList},
  synthesis:{selected:{id:winner.id,title:winner.title,score:winner.score,
   breakdown:winner.breakdown,falsifier:winner.falsifier||null},
   alternatives:ranked.candidates.slice(1,5).map(x=>({id:x.id,title:x.title,score:x.score})),
   weights:ranked.weights,work_seeds:sourceIds,operator_question:question||null},
  visuals:{selected:chosen,alternatives:candidates.slice(1),decision_owner:'PODIUM',
   runtime_scene_replacement:false},
  optical:optic,salon_optical_performance:salonOptics,
  proposed_changes:changes,changes_count:changes.length,
  complete_score_required:true,composer_closure:'RESERVED',
  original_corpus_unchanged:true,site_unchanged:true,developer_code_edits_exempt:true,
  protected_flight:'HELD',scientific_promotion:false,empirical_replication_credit:0,
  release_authority:false
 };
 const hash=await digest(scored);
 return Object.freeze({...scored,score_sha256:hash,human_readable_score:humanReadable(scored)});
}
export async function reachPodiumComposeGate(corpus,params={},sourceRevision='UNVERIFIED'){
 const score=await makePodiumScore(corpus,params,sourceRevision);
 return Object.freeze({
  schema:'td613.vixen.podium.compose-hitl/v1',
  status:'HELD_AWAITING_HUMAN_COMPOSER',
  score_sha256:score.score_sha256,score,stop:true,
  proposed_research_and_visual_decisions_made_by:'PODIUM',
  human_action:'REVIEW_COMPLETE_SCORE_AND_MAKE_FINAL_EDITS_OR_CLOSE',
  approval_of_previous_digest_invalidated_by_edits:true,
  task_json_authentication:false,agent_github_comment_independent_human_witness:false,
  trusted_human_authentication_service:'NOT_YET_CONNECTED',
  source_mutation:false,canonical_commit:false,publish:false,deploy:false
 });
}
