/** Source-free competent-null regression tests; imported by native Dollhouse Design test entrypoint. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {VERSION,SEED,STRATA,generateEpisode,executeProbe,conditionalGeometry,competentUnionRelaxation,competentStrongUnion,staticIncidence} from './cbfe-competent-null-probe.v04.mjs';

const {record,outcomes}=executeProbe();
const digest=x=>createHash('sha256').update(String(x)).digest('hex');

test('CBFE competent null: original preregistered 3×128 synthetic episode count',()=>{
  assert.equal(record.schema,VERSION);
  assert.equal(record.seed,SEED);
  assert.deepEqual(STRATA,['H0_BASIC','H1_CONDITIONAL','H2_WITHDRAWAL_TYPE']);
  assert.equal(record.sample_size,384);
  assert.equal(outcomes.length,384);
  assert.equal(new Set(outcomes.map(x=>x.id)).size,384);
  for(const stratum of STRATA)assert.equal(outcomes.filter(x=>x.stratum===stratum).length,128);
});

test('CBFE competent null: Dijkstra and independent Bellman-Ford both agree with brute enumerator',()=>{
  assert.equal(record.summary.M1,384);
  assert.equal(record.summary.M2,384);
  assert.equal(record.competent_union_surplus,0);
  assert.equal(record.decision,'SOURCE_FREE_BOUNDED_TIE');
});

test('CBFE competent null: static incidence is a deliberately incomplete ablation, not the strong union',()=>{
  assert.ok(record.summary.M0<record.summary.M2);
  assert.equal(record.summary.M0,49);
  assert.ok(record.static_baseline_failures.length>0);
  assert.ok(record.static_baseline_failures.every(x=>x.oracle.status!==x.static.status||x.oracle.cost!==x.static.cost));
});

test('CBFE competent null: unknown source is HELD, not false or a zero-cost path',()=>{
  const scene=generateEpisode('H2_WITHDRAWAL_TYPE',2);
  const unknown={...scene,source:{...scene.source,status:'UNKNOWN'}};
  for(const model of [conditionalGeometry,competentUnionRelaxation,competentStrongUnion]){
    const r=model(unknown);assert.equal(r.status,'HELD');assert.equal(r.cost,null);
  }
});

test('CBFE competent null: revoked evidence leaves predecessor snapshot intact',()=>{
  const scene={...generateEpisode('H1_CONDITIONAL',4),tick:3,source:{...generateEpisode('H1_CONDITIONAL',4).source,availableAt:0,withdrawnAt:null,status:'ACTIVE'}};
  const past=conditionalGeometry({...scene,tick:2});
  const newlyWithdrawn={...scene,source:{...scene.source,withdrawnAt:3}};
  assert.deepEqual(conditionalGeometry({...newlyWithdrawn,tick:2}),past);
  assert.equal(conditionalGeometry({...newlyWithdrawn,tick:3}).status,'BLOCKED');
});

test('CBFE competent null: standing neutral policy blocks prestige effects under fixed evidence',()=>{
  const scene={...generateEpisode('H1_CONDITIONAL',3),policy:'STANDING_NEUTRAL',tick:5,source:{...generateEpisode('H1_CONDITIONAL',3).source,availableAt:1}};
  const high=conditionalGeometry({...scene,standing:'HIGH'});
  const low=conditionalGeometry({...scene,standing:'JUNIOR'});
  assert.deepEqual(high,low);
  assert.equal(scene.source.digest,generateEpisode('H1_CONDITIONAL',3).source.digest);
});

test('CBFE competent null: host diagnostic route cannot impersonate warranted source',()=>{
  const scene={...generateEpisode('H1_CONDITIONAL',0),tick:5,policy:'PRESTIGE_GATED',standing:'JUNIOR',consent:false,reviewAccess:false,source:{...generateEpisode('H1_CONDITIONAL',0).source,availableAt:0}};
  assert.equal(conditionalGeometry(scene).status,'BLOCKED');
  assert.equal(competentUnionRelaxation(scene).status,'BLOCKED');
  assert.equal(competentStrongUnion(scene).status,'BLOCKED');
  assert.equal(staticIncidence(scene).status,'REACHABLE');
});

test('CBFE competent null: theme-only change remains computationally invariant, observer effect unmeasured',()=>{
  const scene=generateEpisode('H1_CONDITIONAL',18);
  const alternate={...scene,theme:'dome-weather',operatorAuthority:'HUMAN_ONLY'};
  assert.deepEqual(conditionalGeometry(scene),conditionalGeometry(alternate));
  assert.equal(scene.source.digest,alternate.source.digest);
});

test('CBFE competent null: independent enumerator retains two histories at one scalar distance',()=>{
  const p=record.scalar_projection_failure;
  assert.equal(p.cost,4);
  assert.equal(p.minimal_routes.length,2);
  assert.notDeepEqual(p.minimal_routes[0],p.minimal_routes[1]);
  assert.ok(p.minimal_routes.some(x=>x.includes('request-appeal')));
  assert.ok(p.minimal_routes.some(x=>x.includes('hearing')));
});

test('CBFE competent null: source-free evidence digest reproducible across rerun',()=>{
  const second=executeProbe();
  assert.equal(second.record.output_rows_sha256,record.output_rows_sha256);
  assert.equal(second.record.competent_union_surplus,0);
  assert.match(digest(JSON.stringify(second.record.by_stratum)),/^[a-f0-9]{64}$/);
});

test('CBFE competent null: original Flight and empirical proof remain explicitly held',()=>{
  assert.equal(record.qualifications.protected_experiment_b,'HELD');
  assert.equal(record.qualifications.human_scientific_closure,'RESERVED');
  assert.equal(record.qualifications.independent_empirical_replication,false);
});

console.log('CBFE_DD02_COMPETENT_NULL_V04 '+JSON.stringify({
  decision:record.decision,total:record.sample_size,by_stratum:record.by_stratum,
  surplus:record.competent_union_surplus,output_rows_sha256:record.output_rows_sha256,
  empirical_credit:0,protected_experiment_b:'HELD'
}));
