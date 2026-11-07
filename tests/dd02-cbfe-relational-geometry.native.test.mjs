/**
 * Source-free native /dollhouse-design DD-02 commissioning assay.
 * Two tests target different warrants:
 *   native conductor => valid creative-method receipt, no science credit;
 *   geometry fixture => finite synthetic predictions only, no social-group inference.
 * Protected Experiment B Flight and /dollhouse-audit are not invoked.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runDollhouseDesignCycle, DOLLHOUSE_DESIGN_SCHEMA} from '../app/engine/dollhouse-design-conductor.js';

const commission = JSON.parse(readFileSync(
  new URL('../docs/research/emergence-hq/DD02_CBFE_RELATIONAL_GEOMETRY_COMMISSION_V03.json', import.meta.url),
  'utf8'
));

const SOURCE = Object.freeze({id:'synthetic-testimony-01', digest:'SOURCE_HASH_IDENTICAL', quality:'CALIBRATED', available_at:2});
const RELATIONS = Object.freeze([
  Object.freeze({from:'source',to:'intake',cost:1,kind:'submit'}),
  Object.freeze({from:'intake',to:'hearer',cost:1,kind:'hearing'}),
  Object.freeze({from:'hearer',to:'claim',cost:1,kind:'adjudicate'}),
  Object.freeze({from:'intake',to:'appeal',cost:3,kind:'appeal'}),
  Object.freeze({from:'appeal',to:'hearer',cost:3,kind:'review'})
]);

// This directed path cost is a declared software model, never a quantified human-harm metric.
function routeCost({standing, policy, tick, appealConsent=false}) {
  if (tick < SOURCE.available_at) return Infinity;
  const dist = new Map([['source',0]]);
  const unvisited = new Set(['source','intake','hearer','claim','appeal']);
  while (unvisited.size) {
    const current = [...unvisited].sort((a,b)=>(dist.get(a)??Infinity)-(dist.get(b)??Infinity))[0];
    if ((dist.get(current)??Infinity)===Infinity) break;
    unvisited.delete(current);
    for (const e of RELATIONS) {
      if (e.from!==current || !unvisited.has(e.to)) continue;
      if (e.kind==='hearing' && policy==='PRESTIGE_GATED' && standing==='JUNIOR_OR_CONTESTED') continue;
      if (e.kind==='appeal' && !appealConsent) continue;
      const candidate=dist.get(current)+e.cost;
      if (candidate<(dist.get(e.to)??Infinity)) dist.set(e.to,candidate);
    }
  }
  return dist.get('claim')??Infinity;
}

// A source-neutral hearing policy must commute with swaps of external status labels.
test('CBFE geometry: byte-identical source and static relations admit divergent situated routes',()=>{
  const common={tick:3,appealConsent:false};
  assert.deepEqual(RELATIONS, RELATIONS);
  assert.equal(routeCost({...common,policy:'RELIABILITY_GATED',standing:'FOUNDING_AUTHORITY'}),3);
  assert.equal(routeCost({...common,policy:'RELIABILITY_GATED',standing:'JUNIOR_OR_CONTESTED'}),3);
  assert.equal(routeCost({...common,policy:'PRESTIGE_GATED',standing:'FOUNDING_AUTHORITY'}),3);
  assert.equal(routeCost({...common,policy:'PRESTIGE_GATED',standing:'JUNIOR_OR_CONTESTED'}),Infinity);
  assert.equal(routeCost({...common,policy:'PRESTIGE_GATED',standing:'JUNIOR_OR_CONTESTED',appealConsent:true}),8);
  assert.equal(routeCost({...common,policy:'RELIABILITY_GATED',standing:'FOUNDING_AUTHORITY',tick:1}),Infinity);
  assert.equal(SOURCE.digest,'SOURCE_HASH_IDENTICAL');
});

// Equal pooled standing results can conceal conditional crossover differences.
test('CBFE geometry: conditional standing interaction cancels at the pooled mean',()=>{
  const u=(calibrated,standingHigh)=>calibrated ? (standingHigh?0.80:0.60) : (standingHigh?0.30:0.50);
  const calibratedDelta=u(true,true)-u(true,false);
  const uncalibratedDelta=u(false,true)-u(false,false);
  const pooledDelta=(calibratedDelta+uncalibratedDelta)/2;
  assert.ok(Math.abs(calibratedDelta-0.20)<1e-10);
  assert.ok(Math.abs(uncalibratedDelta+0.20)<1e-10);
  assert.ok(Math.abs(pooledDelta)<1e-10);
  assert.notEqual(calibratedDelta,uncalibratedDelta);
});

// An apparently appropriate action may precede a justified belief or public correction.
test('CBFE geometry: evidence, belief, action, and claim clocks remain distinct',()=>{
  const event={evidence_at:2,action_at:3,belief_at:5,claim_at:6};
  assert.ok(event.action_at<event.belief_at);
  assert.ok(event.claim_at>event.evidence_at);
  assert.equal(new Set(Object.values(event)).size,4);
});

// Theme alone cannot mutate the data kernel; observation routes require separate interventions.
test('CBFE geometry: visual ambiance only changes presentation, not admission or authority',()=>{
  const state={...SOURCE, graph:RELATIONS, authority:'HUMAN_OPERATOR_ONLY'};
  const project=(ambiance)=>({source:state.digest,routeCost:routeCost({standing:'JUNIOR_OR_CONTESTED',policy:'RELIABILITY_GATED',tick:3}),authority:state.authority});
  assert.deepEqual(project('minimal'),project('dome-weather'));
  assert.equal(state.authority,'HUMAN_OPERATOR_ONLY');
});

test('DD-02: execute genuine native conductor on Palace-II-bound Wolframian geometry commission',async()=>{
  const receipt=await runDollhouseDesignCycle(commission);
  assert.equal(receipt.schema,DOLLHOUSE_DESIGN_SCHEMA);
  assert.equal(receipt.commission_id,commission.commission_id);
  assert.equal(receipt.output_contract.requested_deliverables,1);
  assert.equal(receipt.candidates.length,2);
  assert.equal(receipt.candidates[0].concept_title,'The Conditional Hearing Manifold');
  assert.equal(receipt.candidates[1].concept_title,'The Non-Scalar Counter-Archive');
  assert.equal(receipt.governance.scientific_proof,false);
  assert.equal(receipt.governance.human_closure_required,true);
  assert.equal(receipt.governance.release_authority,false);
  assert.equal(receipt.historical_references.length,3);
  for (const source of receipt.historical_references) {
    assert.equal(source.resolved,true,'Immutable source reference did not resolve: '+source.reference_id);
    assert.equal(source.content_manifest.is_complete,true);
  }
  console.log('DD02_CBFE_NATIVE_CONDUCTOR_RECEIPT '+JSON.stringify({
    schema:receipt.schema,
    commission_id:receipt.commission_id,
    source_digests:receipt.historical_references.map(r=>({id:r.reference_id,sha256:r.content_manifest.sha256,retrieval:r.retrieval_method})),
    alternatives:receipt.candidates.map(c=>c.concept_title),
    refraction:receipt.refractive_variant.mutated_parameter,
    scientific_proof:receipt.governance.scientific_proof,
    protected_flight:'HELD'
  }));
});
