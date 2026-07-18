import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';

if (!globalThis.crypto) globalThis.crypto = webcrypto;

import {
  CASE_PROFILES,
  compileCaseMap,
  compileRoomRules,
  compileRouteMemory,
  verifyCaseMap,
  verifyRoomRules,
  verifyRouteMemory
} from '../app/engine/ash-keep-core.js';
import {
  ASH_APEQ_PAIA_PROFILE_DEMOS_VERSION,
  ASH_INVESTIGATION_APEQ_PAIA_VERSION,
  buildApeqPaiaProfileFixture
} from '../app/dome-world/ash-apeq-paia-profile-demos.js';
import {
  APEQ_CONTROL_CLASSES,
  PAIA_STRATA,
  APEQ_PAIA_COUNTS
} from '../app/dome-world/ash-apeq-paia-method-kernel.js';

assert.equal(CASE_PROFILES.political_campaign, 'Campaign Map');
assert.equal(CASE_PROFILES.fundraiser, 'Fundraising Map');
assert.equal(CASE_PROFILES.investigation, 'Investigation Map');
assert.equal(ASH_APEQ_PAIA_PROFILE_DEMOS_VERSION, 'td613.ash.apeq-paia-profile-demos/v0.1');
assert.equal(ASH_INVESTIGATION_APEQ_PAIA_VERSION, 'td613.ash.investigation-demo/v0.2-apeq-paia');

const bridge = fs.readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');
const profileWrapper = fs.readFileSync('app/dome-world/ash-profile-demo-hydration.js', 'utf8');
const investigationWrapper = fs.readFileSync('app/dome-world/ash-investigation-demo-hydration.js', 'utf8');
const runtime = fs.readFileSync('app/dome-world/ash-apeq-paia-profile-demos.js', 'utf8');
const specs = fs.readFileSync('app/dome-world/ash-apeq-paia-profile-specs.js', 'utf8');

assert.match(bridge, /ash-profile-demo-hydration\.js/);
assert.match(bridge, /ash-investigation-demo-hydration\.js/);
assert.match(profileWrapper, /ash-apeq-paia-profile-demos\.js/);
assert.match(investigationWrapper, /ash-apeq-paia-profile-demos\.js/);
assert.doesNotMatch(profileWrapper + investigationWrapper + runtime, /fixtures\/ash-keep-demo-political-campaign|fixtures\/ash-keep-demo-fundraiser|ash-investigation-nodes-/);
assert.doesNotMatch(runtime, /fetch\(/, 'Method hydration must not depend on legacy fixture fetches.');
assert.match(runtime, /Select a profile…/);
assert.match(runtime, /stopImmediatePropagation/);
assert.match(runtime, /Environment Profile/);
assert.match(runtime, /Joining-key registry/);
assert.match(runtime, /Heterostratigraphic field/);
assert.match(runtime, /PA2 ceiling/);
assert.match(specs, /Harbor City Mayoral Campaign/);
assert.match(specs, /Northstar Arts Benefit/);
assert.match(specs, /Glass Meridian Vendor Integrity Inquiry/);

const contracts = {
  political_campaign: {
    title: /Harbor City Mayoral Campaign/,
    route: 'route_reporter_response',
    protected: /priority call-time queue/,
    ceiling: /NO_VOTER_INTENT_ATTRIBUTION_OR_ELECTION_PREDICTION/
  },
  fundraiser: {
    title: /Northstar Arts Benefit/,
    route: 'route_lead_host_brief',
    protected: /major prospect queue/,
    ceiling: /NO_DONOR_INTENT_PAYMENT_STATUS_OR_CONVERSION_PREDICTION/
  },
  investigation: {
    title: /Glass Meridian Vendor Integrity Inquiry/,
    route: 'route_llm_analysis',
    protected: /protected source alias/,
    ceiling: /NO_IDENTITY_INTENT_GUILT_AUTHORSHIP_SURVEILLANCE_OR_TRUTH_FINDING/
  }
};

for (const [profile, contract] of Object.entries(contracts)) {
  const fixture = buildApeqPaiaProfileFixture(profile);
  assert.equal(fixture.schema, 'td613.ash.apeq-paia-profile-demo/v0.1');
  assert.equal(fixture.profile.id, profile);
  assert.match(fixture.profile.title, contract.title);
  assert.deepEqual(fixture.counts, APEQ_PAIA_COUNTS);
  assert.equal(fixture.assay.source_status, 'CONSTRUCTED');
  assert.equal(fixture.assay.maximum_assurance, 'PA2_LOCALLY_EXECUTED');
  assert.equal(fixture.assay.promotion_authorized, false);
  assert.equal(fixture.assay.automatic_release, false);
  assert.equal(fixture.assay.human_review_required, true);
  assert.equal(fixture.assay.unknown_readers, 'UNMEASURED');
  assert.equal(fixture.assay.universal_secrecy, false);
  assert.match(fixture.assay.claim_ceiling, contract.ceiling);
  assert.deepEqual(fixture.assay.controls.map(control => control.class), [...APEQ_CONTROL_CLASSES]);
  assert.deepEqual(fixture.assay.strata, [...PAIA_STRATA]);
  assert.equal(fixture.assay.joining_keys.length, 8);
  assert(fixture.assay.joining_keys.every(key => key.local_only === true));
  assert.equal(fixture.assay.held_outs.length, 8);
  assert.equal(fixture.routes.entries.length, 6);
  assert.equal(fixture.rules.length, 8);
  assert.equal(fixture.defaults.route.id, contract.route);
  assert.equal(fixture.defaults.draft.route, contract.route);
  assert.match(fixture.defaults.protected_literals.join(' '), contract.protected);
  assert.match(fixture.defaults.research_notes, /capped at PA2/);

  const roomIds = new Set(fixture.rooms.map(room => room.id));
  const nodeIds = new Set(fixture.nodes.map(node => node.id));
  const edgeIds = new Set(fixture.relationships.map(edge => edge.id));
  assert.equal(roomIds.size, 14);
  assert.equal(nodeIds.size, 72);
  assert.equal(edgeIds.size, 112);
  for (const node of fixture.nodes) assert(roomIds.has(node.room_id), `${profile}: unknown Room for ${node.id}`);
  for (const edge of fixture.relationships) {
    assert(nodeIds.has(edge.from), `${profile}: unknown source for ${edge.id}`);
    assert(nodeIds.has(edge.to), `${profile}: unknown target for ${edge.id}`);
  }
  for (const rule of fixture.rules) {
    for (const roomId of rule.allowed_room_ids) assert(roomIds.has(roomId), `${profile}: unknown Room in ${rule.route_id}`);
    for (const edgeId of rule.local_link_keys) assert(edgeIds.has(edgeId), `${profile}: unknown local link in ${rule.route_id}`);
  }
  for (const route of fixture.routes.entries) {
    assert.match(route.draft_digest, /^sha256:[0-9a-f]{64}$/);
    for (const reference of route.disclosed_opaque_references) assert(nodeIds.has(reference), `${profile}: unknown route reference ${reference}`);
  }

  const caseMap = await compileCaseMap({
    profile,
    caseId: `case_demo_${profile}_apeq_paia`,
    title: fixture.profile.title,
    rooms: fixture.rooms,
    nodes: fixture.nodes,
    relationships: fixture.relationships,
    privateChronology: fixture.profile.chronology,
    intendedActions: fixture.profile.actions,
    sourceStatus: 'SIMULATED',
    evidenceBasis: [`synthetic ${profile} APEQ/PAIA fixture`],
    observations: fixture.profile.observations,
    missingness: fixture.profile.missingness,
    alternatives: fixture.profile.alternatives,
    openQuestions: fixture.profile.open_questions,
    operatorNotes: [`demo_profile:${profile}`, 'assurance_ceiling:PA2_LOCALLY_EXECUTED']
  });
  const roomRules = await compileRoomRules({ caseId: caseMap.case_id, rules: fixture.rules, sourceStatus: 'SIMULATED' });
  const routeMemory = await compileRouteMemory({
    caseId: caseMap.case_id,
    entries: fixture.routes.entries,
    operatorDeclaredAssumptions: fixture.routes.operator_declared_assumptions,
    unknown: fixture.routes.unknown,
    sourceStatus: 'SIMULATED'
  });
  assert.equal(await verifyCaseMap(caseMap), true);
  assert.equal(await verifyRoomRules(roomRules), true);
  assert.equal(await verifyRouteMemory(routeMemory), true);
  assert.equal(routeMemory.entries.length, 6);

  const crossRoomEdges = caseMap.relationships.filter(edge => {
    const left = caseMap.nodes.find(node => node.id === edge.from)?.room_id;
    const right = caseMap.nodes.find(node => node.id === edge.to)?.room_id;
    return left && right && left !== right;
  });
  assert(crossRoomEdges.length >= 40, `${profile}: insufficient cross-Room pressure.`);
}

console.log('ash-profile-demos.test.mjs passed');
