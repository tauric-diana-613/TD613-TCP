import crypto from 'node:crypto';

import { LOCAL_POCKET_EXPORT_SCHEMA } from '../app/dome-world/holonomy-loom-local-pocket-policy.js';
import {
  buildMarrowlinePocketHostedCarryCase,
  buildMarrowlineReturnEnvelope,
  revalidateMarrowlineReturn
} from '../app/dome-world/marrowline-pocket-hosted-carry-case.js';
import {
  compilePortableAiaLocalBinding,
  compilePortableAiaProjection
} from '../app/dome-world/portable-aia-three-route-invariance.js';
import { MARROWLINE_MULTIPLEXED_FINDING_SPECS } from './marrowline-multiplexed-finding-isolation-assay.mjs';
import {
  canonicalMixedPacketCollisionSurfaceJson,
  runMarrowlineMixedPacketCollisionAllOrNothingAssay
} from './marrowline-mixed-packet-collision-all-or-nothing-assay.mjs';

export const MARROWLINE_DUPLICATE_POSITION_PERMUTATION_CLOSURE_ASSAY_SCHEMA =
  'td613.marrowline.duplicate-position-permutation-closure-assay/v0.1-local-only';

export const MARROWLINE_DUPLICATE_POSITION_PERMUTATIONS = Object.freeze([
  Object.freeze({ id: 'D_AAB', labels: Object.freeze(['A','A','B']), repeated_rule_id: 'EMAIL_IDENTIFIER', duplicate_index: 1 }),
  Object.freeze({ id: 'D_ABA', labels: Object.freeze(['A','B','A']), repeated_rule_id: 'EMAIL_IDENTIFIER', duplicate_index: 2 }),
  Object.freeze({ id: 'D_BAA', labels: Object.freeze(['B','A','A']), repeated_rule_id: 'EMAIL_IDENTIFIER', duplicate_index: 2 }),
  Object.freeze({ id: 'D_BBA', labels: Object.freeze(['B','B','A']), repeated_rule_id: 'USER_DECLARED_PROTECTED_TERM', duplicate_index: 1 }),
  Object.freeze({ id: 'D_BAB', labels: Object.freeze(['B','A','B']), repeated_rule_id: 'USER_DECLARED_PROTECTED_TERM', duplicate_index: 2 }),
  Object.freeze({ id: 'D_ABB', labels: Object.freeze(['A','B','B']), repeated_rule_id: 'USER_DECLARED_PROTECTED_TERM', duplicate_index: 2 })
]);

const FORBIDDEN_POSITION_TRANSPORT_KEYS = Object.freeze(new Set([
  'duplicate_position','duplicate_index','collision_position','prior_collision_position',
  'validated_prefix','validated_prefix_ledger','partial_commit','partial_result',
  'rejected_tail','surviving_sibling','surviving_sibling_id','duplicate','duplicate_count',
  'collision','collision_id','collision_history','rejected_rule','rejected_rule_id',
  'occurrence','occurrence_id','occurrence_index','multiset_alias','permutation',
  'permutation_index','schedule','schedule_index','nonce','timestamp','history',
  'route_history','receipt_chain'
]));

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key)=>[key,stable(value[key])]));
}

export function canonicalDuplicatePositionPermutationSurfaceJson(value) {
  return JSON.stringify(stable(value));
}

function describeSurface(value) {
  const json=canonicalDuplicatePositionPermutationSurfaceJson(value);
  return Object.freeze({
    sha256: crypto.createHash('sha256').update(json,'utf8').digest('hex'),
    bytes: Buffer.byteLength(json,'utf8')
  });
}

function collectForbidden(value,path='transport',into=[]) {
  if (Array.isArray(value)) {
    value.forEach((item,index)=>collectForbidden(item,`${path}[${index}]`,into));
    return into;
  }
  if (!value || typeof value !== 'object') return into;
  for (const [key,child] of Object.entries(value)) {
    if (FORBIDDEN_POSITION_TRANSPORT_KEYS.has(String(key).toLowerCase())) into.push(`${path}.${key}`);
    collectForbidden(child,`${path}.${key}`,into);
  }
  return into;
}

function fixtureFor(spec) {
  const pocketProjection=compilePortableAiaProjection({ruleId:spec.rule_id,routeMode:'LOCAL_POCKET'});
  const hostedProjection=compilePortableAiaProjection({ruleId:spec.rule_id,routeMode:'TD613_HOSTED'});
  if (pocketProjection.invariant.action_class !== spec.matching_action) throw new Error(`${spec.label} canonical action drifted`);
  const localBinding=compilePortableAiaLocalBinding(pocketProjection,{
    policyDigest:`sha256:${spec.policy_digest_hex.repeat(64)}`,
    sourceStateDigest:`sha256:${spec.source_digest_hex.repeat(64)}`
  });
  return Object.freeze({spec,pocketProjection,hostedProjection,localBinding});
}

function fixtures() {
  return Object.freeze({
    A:fixtureFor(MARROWLINE_MULTIPLEXED_FINDING_SPECS.A),
    B:fixtureFor(MARROWLINE_MULTIPLEXED_FINDING_SPECS.B)
  });
}

function buildPacket(labels,fixtureMap) {
  return Object.freeze({
    schema:LOCAL_POCKET_EXPORT_SCHEMA,
    portable_findings:Object.freeze(labels.map((label)=>fixtureMap[label].pocketProjection.portable_payload)),
    release_authority:false,
    human_closure_required:true
  });
}

function ruleIdsFor(labels,fixtureMap) {
  return Object.freeze(labels.map((label)=>fixtureMap[label].spec.rule_id));
}

function expectPermutationRejection(spec,fixtureMap) {
  const packet=buildPacket(spec.labels,fixtureMap);
  let carryCase=null;
  try {
    carryCase=buildMarrowlinePocketHostedCarryCase(packet);
  } catch (error) {
    const expected=`duplicate portable finding: ${spec.repeated_rule_id}`;
    if (!(error instanceof TypeError) || String(error.message || '') !== expected) throw error;
    const prefix=spec.labels.slice(0,spec.duplicate_index);
    return Object.freeze({
      collision_id:spec.id,
      labels:spec.labels,
      repeated_rule_id:spec.repeated_rule_id,
      duplicate_index:spec.duplicate_index,
      validated_prefix_rule_ids:ruleIdsFor(prefix,fixtureMap),
      source_packet:describeSurface(packet),
      rejected:true,
      error:error.message,
      carry_case_returned:false,
      transport_receipt_returned:false,
      hosted_findings_returned:false
    });
  }
  throw new Error(`${spec.id} duplicate-position permutation returned a partial or complete Carry Case: ${canonicalDuplicatePositionPermutationSurfaceJson(carryCase)}`);
}

function hostedByRule(carryCase) {
  return Object.freeze(Object.fromEntries(
    carryCase.receipt.finding_rule_ids.map((ruleId,index)=>[ruleId,carryCase.hosted_portable_findings[index]])
  ));
}

function buildLawfulPair(id,fixtureMap) {
  const packet=buildPacket(['A','B'],fixtureMap);
  const carryCase=buildMarrowlinePocketHostedCarryCase(packet);
  const hosted=hostedByRule(carryCase);
  const matchingEnvelopes={};
  const mismatchEnvelopes={};
  const matchingResults={};
  const mismatchResults={};

  for (const label of ['A','B']) {
    const f=fixtureMap[label];
    matchingEnvelopes[label]=buildMarrowlineReturnEnvelope(carryCase,{
      ruleId:f.spec.rule_id,
      claimedActionClass:f.spec.matching_action
    });
    mismatchEnvelopes[label]=buildMarrowlineReturnEnvelope(carryCase,{
      ruleId:f.spec.rule_id,
      claimedActionClass:f.spec.mismatch_action
    });
    matchingResults[label]=revalidateMarrowlineReturn(carryCase,f.localBinding,matchingEnvelopes[label]);
    mismatchResults[label]=revalidateMarrowlineReturn(carryCase,f.localBinding,mismatchEnvelopes[label]);
    if (matchingResults[label].status !== 'PRESENT_TO_HUMAN') throw new Error(`${id} ${label} lawful match drifted`);
    if (mismatchResults[label].status !== 'HOLD') throw new Error(`${id} ${label} lawful mismatch drifted`);
  }

  const transport={source_packet:packet,carry_case:carryCase};
  const forbidden=collectForbidden(transport);
  if (forbidden.length) throw new Error(`${id} accumulated duplicate-position state: ${forbidden.join(', ')}`);
  if (/sha256:/i.test(canonicalDuplicatePositionPermutationSurfaceJson(transport))) throw new Error(`${id} accumulated digest carrier`);

  return Object.freeze({
    id,
    finding_rule_ids:carryCase.receipt.finding_rule_ids,
    finding_count:carryCase.receipt.finding_count,
    source_packet:describeSurface(packet),
    carry_case:describeSurface(carryCase),
    hosted_by_rule:Object.freeze(Object.fromEntries(Object.entries(hosted).map(([ruleId,value])=>[ruleId,describeSurface(value)]))),
    matching_envelopes:Object.freeze(Object.fromEntries(Object.entries(matchingEnvelopes).map(([label,value])=>[label,describeSurface(value)]))),
    mismatch_envelopes:Object.freeze(Object.fromEntries(Object.entries(mismatchEnvelopes).map(([label,value])=>[label,describeSurface(value)]))),
    matching_results:Object.freeze(Object.fromEntries(Object.entries(matchingResults).map(([label,value])=>[label,describeSurface(value)]))),
    mismatch_results:Object.freeze(Object.fromEntries(Object.entries(mismatchResults).map(([label,value])=>[label,describeSurface(value)]))),
    matching_statuses:Object.freeze(Object.fromEntries(Object.entries(matchingResults).map(([label,value])=>[label,value.status]))),
    mismatch_statuses:Object.freeze(Object.fromEntries(Object.entries(mismatchResults).map(([label,value])=>[label,value.status]))),
    forbidden_transport_paths:Object.freeze([...forbidden]),
    release_authority:carryCase.receipt.release_authority,
    human_closure_required:carryCase.receipt.human_closure_required,
    local_binding_carried:carryCase.receipt.local_binding_carried
  });
}

function sameLawful(left,right) {
  const keys=['finding_rule_ids','finding_count','source_packet','carry_case','hosted_by_rule',
    'matching_envelopes','mismatch_envelopes','matching_results','mismatch_results',
    'matching_statuses','mismatch_statuses','forbidden_transport_paths'];
  return keys.every((key)=>canonicalDuplicatePositionPermutationSurfaceJson(left[key])
    === canonicalDuplicatePositionPermutationSurfaceJson(right[key]));
}

function assertMatchesParent(recovery,parent) {
  const keys=['finding_rule_ids','finding_count','source_packet','carry_case','hosted_by_rule',
    'matching_envelopes','mismatch_envelopes','matching_statuses','mismatch_statuses'];
  for (const key of keys) {
    if (canonicalDuplicatePositionPermutationSurfaceJson(recovery[key])
        !== canonicalMixedPacketCollisionSurfaceJson(parent[key])) {
      throw new Error(`Lawful P_AB drifted from #1061 parent at ${key}`);
    }
  }
}

function runSchedule(specs,phase,fixtureMap,parentBaseline) {
  const collisions={};
  const recoveries={};
  const order=[];
  for (const spec of specs) {
    const collision=expectPermutationRejection(spec,fixtureMap);
    const recovery=buildLawfulPair(`P_AB_AFTER_${spec.id}_${phase}`,fixtureMap);
    assertMatchesParent(recovery,parentBaseline);
    collisions[spec.id]=collision;
    recoveries[spec.id]=recovery;
    order.push(spec.id);
  }
  return Object.freeze({
    phase,
    order:Object.freeze(order),
    collisions:Object.freeze(collisions),
    recoveries:Object.freeze(recoveries)
  });
}

export function runMarrowlineDuplicatePositionPermutationClosureAssay() {
  const f=fixtures();
  const parent=runMarrowlineMixedPacketCollisionAllOrNothingAssay();
  const parentBaseline=parent.recoveries.P_AB_AFTER_D_ABA_1;

  const forward=runSchedule(MARROWLINE_DUPLICATE_POSITION_PERMUTATIONS,'FORWARD',f,parentBaseline);
  const reverse=runSchedule([...MARROWLINE_DUPLICATE_POSITION_PERMUTATIONS].reverse(),'REVERSE',f,parentBaseline);

  const baseline=forward.recoveries.D_AAB;
  const hostileHashes=new Set();

  for (const spec of MARROWLINE_DUPLICATE_POSITION_PERMUTATIONS) {
    const left=forward.collisions[spec.id];
    const right=reverse.collisions[spec.id];
    hostileHashes.add(left.source_packet.sha256);
    if (canonicalDuplicatePositionPermutationSurfaceJson(left)
        !== canonicalDuplicatePositionPermutationSurfaceJson(right)) {
      throw new Error(`${spec.id} rejection receipt drifted with forward/reverse permutation schedule`);
    }
    if (!sameLawful(baseline,forward.recoveries[spec.id])
        || !sameLawful(baseline,reverse.recoveries[spec.id])) {
      throw new Error(`${spec.id} duplicate-position rejection poisoned later lawful P_AB`);
    }
  }

  if (hostileHashes.size !== MARROWLINE_DUPLICATE_POSITION_PERMUTATIONS.length) {
    throw new Error('Hostile three-finding permutations collapsed at source-packet surface');
  }

  return Object.freeze({
    schema:MARROWLINE_DUPLICATE_POSITION_PERMUTATION_CLOSURE_ASSAY_SCHEMA,
    status:'PASS',
    assay_local_only:true,
    permutations:MARROWLINE_DUPLICATE_POSITION_PERMUTATIONS,
    forward,
    reverse,
    all_six_position_permutations_rejected:true,
    duplicate_position_does_not_change_rejection_class:true,
    no_partial_transport_from_any_position:true,
    lawful_pair_matches_parent:true,
    forward_reverse_replay_invariant:true,
    repeated_position_collision_nonpoisoning:true,
    hostile_source_packets_distinguishable:true,
    hidden_duplicate_position_state_carried:false,
    browser_persistence_required:false,
    authority:Object.freeze({
      release_authority:false,
      human_closure_required:true,
      provider_call_performed:false,
      production_mutation:false
    }),
    claim_ceiling:'bounded-two-rule-three-finding-all-six-duplicate-position-permutation-rejection-only'
  });
}
