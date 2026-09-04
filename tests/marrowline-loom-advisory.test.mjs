import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  MARROWLINE_LOOM_ADVISORY_ENDPOINT,
  MARROWLINE_LOOM_ADVISORY_REQUEST_SCHEMA,
  MARROWLINE_LOOM_ADVISORY_VERSION,
  MARROWLINE_LOOM_PROVIDER_SCHEMA,
  buildMarrowlineLoomAdvisoryRequest
} from '../app/dome-world/marrowline-loom-advisory.js';

assert.equal(MARROWLINE_LOOM_ADVISORY_VERSION, 'td613.dome-world.marrowline-loom-advisory/v0.1');
assert.equal(MARROWLINE_LOOM_ADVISORY_ENDPOINT, '/api/khonapolit?operation=loom-advisory');
assert.equal(MARROWLINE_LOOM_ADVISORY_REQUEST_SCHEMA, 'td613.holonomy-loom.khonapolit-advisory-request/v0.1');
assert.equal(MARROWLINE_LOOM_PROVIDER_SCHEMA, 'td613.holonomy-loom.provider-advisory-request/v0.1');

const request = buildMarrowlineLoomAdvisoryRequest({
  ruleId: 'COMMON_API_KEY_BLOCK',
  evidenceClass: 'DETERMINISTIC_PATTERN_MATCH',
  actionClass: 'REMOVE',
  findingCategory: 'credential-like token',
  whyClass: 'credential_access_risk',
  routeMode: 'CHATGPT_THREAD_COMPANION',
  shi: '',
  waiveIssuance: true,
  rawDraft: 'RAW_DRAFT_CANARY_MUST_NOT_TRAVEL_613',
  conversationHistory: ['RAW_THREAD_CANARY_MUST_NOT_TRAVEL_613']
});

assert.equal(request.schema, MARROWLINE_LOOM_ADVISORY_REQUEST_SCHEMA);
assert.equal(request.advisory.action, 'EXPLAIN_FINDING');
assert.equal(request.advisory.rule_id, 'COMMON_API_KEY_BLOCK');
assert.equal(request.advisory.evidence_class, 'DETERMINISTIC_PATTERN_MATCH');
assert.equal(request.advisory.action_class, 'REMOVE');
assert.equal(request.advisory.minimized_context.finding_category, 'credential-like token');
assert.equal(request.advisory.minimized_context.why_class, 'credential_access_risk');
assert.equal(request.advisory.minimized_context.route_mode, 'CHATGPT_THREAD_COMPANION');
assert.equal(request.issuance.waiveIssuance, true);

const serialized = JSON.stringify(request);
assert.equal(serialized.includes('RAW_DRAFT_CANARY_MUST_NOT_TRAVEL_613'), false);
assert.equal(serialized.includes('RAW_THREAD_CANARY_MUST_NOT_TRAVEL_613'), false);
assert.equal(serialized.includes('rawDraft'), false);
assert.equal(serialized.includes('conversationHistory'), false);
assert.equal(serialized.includes('selected_text'), false);
assert.equal(serialized.includes('span_start'), false);
assert.equal(serialized.includes('span_end'), false);

assert.throws(() => buildMarrowlineLoomAdvisoryRequest({
  ruleId: 'x', evidenceClass: 'UNKNOWN', actionClass: 'REMOVE',
  findingCategory: 'x', whyClass: 'x', routeMode: 'TD613_HOSTED'
}), /unsupported evidenceClass/);
assert.throws(() => buildMarrowlineLoomAdvisoryRequest({
  ruleId: 'x', evidenceClass: 'DETERMINISTIC_PATTERN_MATCH', actionClass: 'SEND_ANYWAY',
  findingCategory: 'x', whyClass: 'x', routeMode: 'TD613_HOSTED'
}), /unsupported actionClass/);
assert.throws(() => buildMarrowlineLoomAdvisoryRequest({
  ruleId: 'x', evidenceClass: 'DETERMINISTIC_PATTERN_MATCH', actionClass: 'REMOVE',
  findingCategory: 'x', whyClass: 'x', routeMode: 'UNBOUNDED_ROOM'
}), /unsupported routeMode/);

const source = fs.readFileSync('app/dome-world/marrowline-loom-advisory.js', 'utf8');
const boot = fs.readFileSync('app/dome-world/marrowline-egress-boot.js', 'utf8');
assert.match(source, /ASK KʰONAPOLIT FOR HELP/);
assert.match(source, /This will send: rule ID, evidence class, action class, finding category, why-class, and route mode\./);
assert.match(source, /This will not send: your raw draft, matched text, selected text, source spans, or prior Marrowline\/ChatGPT conversation history\./);
assert.match(source, /providerResultHasReleaseAuthority: false/);
assert.match(source, /conversationHistoryAccepted: false/);
assert.match(source, /rawDraftAccepted: false/);
assert.match(boot, /marrowline-loom-advisory\.js/);
assert.match(boot, /loomAdvisory: Boolean\(root\.__TD613_MARROWLINE_LOOM_ADVISORY__\)/);
assert.match(boot, /providerDisclosureRequired: true/);
assert.match(boot, /rawDraftAccepted: false/);
assert.match(boot, /conversationHistoryAccepted: false/);
assert.match(boot, /providerResultHasReleaseAuthority: false/);

console.log('Marrowline Loom advisory: disclosed minimized Kʰonapolit surface and no-raw-thread request builder ok');
