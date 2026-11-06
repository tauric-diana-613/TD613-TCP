#!/usr/bin/env node
/**
 * 𝌋 TD613 · GATE F–01 · THE UNADMITTED SIGNAL
 * New, separate, source-free exploratory ablation of ORIGINAL PR #1700 modules.
 * Frozen Palace Act II files untouched. Protected Experiment B HELD.
 * SAC[X6ZNK5NO51] · Khona‌lit-po
 */
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync } from 'node:fs';
import { sha256Hex } from '../src/prng.mjs';
import { generateBaseWorldSuite, buildMatchedTrajectoryInstance, WORLD_FAMILIES } from '../src/world-generator.mjs';
import { AvailabilityMembrane, createInstrumentedSecretVault, withAuthorizedVaultRole } from '../src/temporal-lattice.mjs';
import { PRIMARY_POLICIES, runPolicyEpisode } from '../src/authority-policies.mjs';
import { buildActionScheduleTicks, scoreEpisodeAgainstTrajectorySecret, computeClusteredPairedContrast } from '../src/evaluator-and-stats.mjs';
import { ACT2_MASTER_SEEDS, PILOT_GRID_6 } from '../src/grid-definitions.mjs';

const ORIGINAL_HEAD = 'c11c5d7f017f8370b20b173f2b557ef2316a5d3a';
const HORIZON = 24, BUDGET = 6;
const POLICIES = [...PRIMARY_POLICIES, 'CTRL_NO_HISTORY'];
const LIVE = 'LIVE_UNTIMESTAMPED_CONTEXT', GATED = 'ADMISSION_GATED_CONTEXT';
const MODES = [LIVE, GATED];
const suite = generateBaseWorldSuite({
 suiteName:'ACT2_CONFIRMATORY_192',
 masterSeed: ACT2_MASTER_SEEDS.CONFIRMATORY_192_WORLD_SEED,
 totalWorlds:192
});
const selected = [];
for (const family of WORLD_FAMILIES) {
 const seen = new Set();
 for (const w of suite.publicWorlds.filter(w=>w.family===family)) {
  if(!seen.has(w.cluster_public_id)&&seen.size===2) continue;
  seen.add(w.cluster_public_id); selected.push(w);
 }
 assert.equal(seen.size,2);
}
assert.equal(selected.length,48);
const rows = { [LIVE]:[], [GATED]:[] };
const counters = {callback_calls:0, divergent_callback_ticks:0, divergent_before_current_ambient_admission:0};
const sentinel = [];
function gatedContext(membrane,t){
 const ambient=membrane.getAuthorizedRecordsAt(t,{onlyEpisodeObservations:true})
  .filter(r=>r.obs_kind==='AMBIENT_MONITOR'&&r.temporal_coordinates.t_available<=t);
 return ambient.length?ambient[ambient.length-1].observable_context_tag:'REGIME_SIG_ALPHA';
}
for(const pubW of selected){
 const sourceHistorySha=pubW.permissible_history_sha256;
 assert.equal(sha256Hex(JSON.stringify(pubW.permissible_historical_claims)),sourceHistorySha);
 const parentVault=suite.secretVaultMap.get(pubW.world_public_id);
 for(const cell of PILOT_GRID_6){
  const trajectory=buildMatchedTrajectoryInstance({publicWorld:pubW,secretVault:parentVault,gridCell:cell,horizonTicks:HORIZON});
  const trajVault=createInstrumentedSecretVault(trajectory.trajectorySecret,suite.vaultLedger);
  const schedule=buildActionScheduleTicks(HORIZON,cell.interval_ticks);
  for(const policyId of POLICIES) for(const mode of MODES){
   const membrane=new AvailabilityMembrane(pubW.permissible_historical_claims);
   for(let t=1;t<=HORIZON;t++)membrane.enqueueObservation(trajectory.ambientObservationsToEnqueueByEventTick[t]);
   const publicPacket=Object.freeze({
    world_public_id:pubW.world_public_id,
    cluster_public_id:pubW.cluster_public_id,
    family:pubW.family,
    terminal_graph_pi:pubW.terminal_graph_pi,
    candidate_hypotheses:pubW.candidate_hypotheses,
    probe_menu:pubW.probe_menu,
    action_menu:pubW.action_menu,
    holdout_queries:pubW.holdout_queries,
    identifiable_under_menu:pubW.identifiable_under_menu
   });
   let nCtx=0;
   const observableContextAtTick=t=>{
    nCtx++;counters.callback_calls++;
    const live=trajectory.observableContextByTick[t];
    const gated=gatedContext(membrane,t);
    if(mode===LIVE&&live!==gated){
     counters.divergent_callback_ticks++;
     const obs=trajectory.ambientObservationsToEnqueueByEventTick[t];
     if(obs.temporal_coordinates.t_available>t)counters.divergent_before_current_ambient_admission++;
    }
    return mode===LIVE?live:gated;
   };
   const episode=runPolicyEpisode({
    policyId,publicPacket,availabilityMembrane:membrane,
    requestActiveProbeAtTick:(t,probeId)=>membrane.enqueueObservation(
      withAuthorizedVaultRole('WORLD_OBSERVATION_SIMULATOR',()=>trajVault.crn_probes_by_tick[t][probeId])),
    observableContextAtTick,actionScheduleTicks:schedule,probeBudget:BUDGET,horizonTicks:HORIZON,
    episodeSeed:`${ACT2_MASTER_SEEDS.CONFIRMATORY_192_EVAL_SEED}::${cell.cell_id}::${policyId}::${pubW.world_public_id}`
   });
   assert.equal(nCtx,HORIZON);
   assert.equal(sha256Hex(JSON.stringify(pubW.permissible_historical_claims)),sourceHistorySha);
   const score=scoreEpisodeAgainstTrajectorySecret({publicWorld:pubW,trajSecretProxy:trajVault,episodeResult:episode,horizonTicks:HORIZON});
   rows[mode].push(score);
   if(policyId==='D_TEMPORAL_CUSTODIANS' && cell.tau0===6 && pubW.family==='FAM_E_RECURRENT_REGIMES')
    sentinel.push({world:pubW.world_public_id,cell:cell.cell_id,mode,utility:score.utility,claim:score.terminal_claim_valid,action_error:score.incorrect_action_rate});
  }
 }
}
assert.equal(suite.vaultLedger.unauthorized_investigator_reads,0);
const perMode=48*PILOT_GRID_6.length*POLICIES.length;
for(const mode of MODES)assert.equal(rows[mode].length,perMode);
function average(a,k){return Number((a.reduce((acc,r)=>acc+r[k],0)/a.length).toFixed(6))}
const summaries={},contrasts={};
for(const policyId of POLICIES){
 const a=rows[LIVE].filter(r=>r.policy_id===policyId), b=rows[GATED].filter(r=>r.policy_id===policyId);
 assert.equal(a.length,48*PILOT_GRID_6.length);assert.equal(b.length,a.length);
 summaries[policyId]={
  live:{utility:average(a,'utility'),action_error:average(a,'incorrect_action_rate'),claim_accuracy:average(a,'terminal_claim_valid')},
  gated:{utility:average(b,'utility'),action_error:average(b,'incorrect_action_rate'),claim_accuracy:average(b,'terminal_claim_valid')}
 };
 const contrast=(metricFn,id)=>computeClusteredPairedContrast({
  rowsA:a,rowsB:b,metricFn,nBoot:2000,nPerm:8192,seed:`TD613_F01::${policyId}::${id}`
 });
 contrasts[policyId]={
  live_minus_gated_utility:contrast(r=>r.utility,'utility'),
  live_minus_gated_action_error:contrast(r=>r.incorrect_action_rate,'action_error'),
  live_minus_gated_claim_accuracy:contrast(r=>r.terminal_claim_valid,'claim_accuracy'),
  live_minus_gated_censored_action_alignment_delay:contrast(r=>r.delay_decomposition.censored_evaluation_delay_ticks??0,'action_alignment_delay')
 };
}
const receipt={
 schema:'td613.gate-f01.source-free-original-code-ablation/v1',
 title:'GATE F–01 · THE UNADMITTED SIGNAL',classification:'EXPLORATORY_NOT_PREREGISTERED_CONFIRMATORY',
 provenance:{parent_pr:1700,source_head:ORIGINAL_HEAD,method:'ORIGINAL_ACT2_IMPORTS_NO_FROZEN_FILE_MODIFICATION',supervision:'SINGLE_NONBLINDED_EXECUTION'},
 design:{n_worlds:48,n_clusters:12,n_grid_cells:PILOT_GRID_6.length,n_policies:POLICIES.length,
  n_episodes_per_mode:perMode,n_episodes_total:perMode*2,
  families:WORLD_FAMILIES,grid:PILOT_GRID_6.map(g=>g.cell_id),policies:POLICIES,
  modes:MODES,pre_admission_context_default:'REGIME_SIG_ALPHA',
  note:'Identical worlds, CRN, histories, seeds, policy code, action times; only context callback differs; latest admitted ambient tag used for gated condition.'},
 diagnostics:{...counters,unauthorized_vault_reads:suite.vaultLedger.unauthorized_investigator_reads,
  source_history_digest_integrity:'PASS_ALL_SELECTED_WORLDS',selected_worlds_sha256:sha256Hex(JSON.stringify(selected.map(w=>w.world_public_id))),sentinel},
 summaries,contrasts,
 limits:[
  'Exploratory subset of previously generated synthetic worlds; not independent holdout replication.',
  'Gated context uses most recent admitted ambient tag and defaults Alpha if none: sensitivity to baseline assumption untested.',
  'The same-process vault counter is an instrumentation result, not OS/provider confinement.',
  'Original correction latency refers to first aligned action, not verified scientific belief correction.',
  'Multiple contrasts exploratory; no correction for multiplicity; cluster sign-flips are within-generator diagnostics.'
 ],
 governance:{paid_api_calls:0,protected_corpus_admissions:0,protected_experiment_b:'HELD',human_closure:'RESERVED'}
};
mkdirSync('gate-f01-output',{recursive:true});
writeFileSync('gate-f01-output/receipt.json',JSON.stringify(receipt,null,2)+'\n');
console.log('GATE_F01_COMPLETED '+JSON.stringify({episodes:perMode*2,clusters:12,unauthorized_vault_reads:0,divergences:counters.divergent_callback_ticks,temporal_custodian:contrasts.D_TEMPORAL_CUSTODIANS.live_minus_gated_utility,negative_control:contrasts.CTRL_NO_HISTORY.live_minus_gated_utility}));
