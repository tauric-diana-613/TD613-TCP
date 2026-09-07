import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  HOLONOMY_LOOM_ADVISORY_CLAIM_CEILING,
  HOLONOMY_LOOM_ADVISORY_RULES,
  canonicalLoomAdvisoryFinding
} from '../app/dome-world/holonomy-loom-advisory-policy.js';
import {
  MARROWLINE_LOOM_ADVISORY_ENDPOINT,
  MARROWLINE_LOOM_ADVISORY_REQUEST_SCHEMA,
  MARROWLINE_LOOM_ADVISORY_VERSION,
  MARROWLINE_LOOM_PROVIDER_SCHEMA,
  buildMarrowlineLoomAdvisoryRequest
} from '../app/dome-world/marrowline-loom-advisory.js';

assert.equal(MARROWLINE_LOOM_ADVISORY_VERSION, 'td613.dome-world.marrowline-loom-advisory/v0.2-canonical-tokens');
assert.equal(MARROWLINE_LOOM_ADVISORY_ENDPOINT, '/api/khonapolit?operation=loom-advisory');
assert.equal(MARROWLINE_LOOM_ADVISORY_REQUEST_SCHEMA, 'td613.holonomy-loom.khonapolit-advisory-request/v0.1');
assert.equal(MARROWLINE_LOOM_PROVIDER_SCHEMA, 'td613.holonomy-loom.provider-advisory-request/v0.1');
assert.equal(Object.keys(HOLONOMY_LOOM_ADVISORY_RULES).length, 7);

const request = buildMarrowlineLoomAdvisoryRequest({
  ruleId: 'COMMON_API_KEY_BLOCK',
  routeMode: 'CHATGPT_THREAD_COMPANION',
  shi: '',
  waiveIssuance: true,
  rawDraft: 'RAW_DRAFT_CANARY_MUST_NOT_TRAVEL_613',
  conversationHistory: ['RAW_THREAD_CANARY_MUST_NOT_TRAVEL_613'],
  findingCategory: 'RAW_CATEGORY_CANARY_MUST_NOT_TRAVEL_613',
  whyClass: 'RAW_WHY_CANARY_MUST_NOT_TRAVEL_613'
});

assert.equal(request.schema, MARROWLINE_LOOM_ADVISORY_REQUEST_SCHEMA);
assert.equal(request.advisory.action, 'EXPLAIN_FINDING');
assert.equal(request.advisory.rule_id, 'COMMON_API_KEY_BLOCK');
assert.equal(request.advisory.evidence_class, 'DETERMINISTIC_PATTERN_MATCH');
assert.equal(request.advisory.action_class, 'REMOVE');
assert.equal(request.advisory.minimized_context.finding_category, 'credential-like token');
assert.equal(request.advisory.minimized_context.why_class, 'credential_access_risk');
assert.equal(request.advisory.minimized_context.route_mode, 'CHATGPT_THREAD_COMPANION');
assert.equal(request.advisory.claim_ceiling, HOLONOMY_LOOM_ADVISORY_CLAIM_CEILING);
assert.equal(request.issuance.waiveIssuance, true);

const serialized = JSON.stringify(request);
for (const forbidden of [
  'RAW_DRAFT_CANARY_MUST_NOT_TRAVEL_613',
  'RAW_THREAD_CANARY_MUST_NOT_TRAVEL_613',
  'RAW_CATEGORY_CANARY_MUST_NOT_TRAVEL_613',
  'RAW_WHY_CANARY_MUST_NOT_TRAVEL_613',
  'rawDraft',
  'conversationHistory',
  'selected_text',
  'span_start',
  'span_end'
]) assert.equal(serialized.includes(forbidden), false, `forbidden carrier survived: ${forbidden}`);

assert.deepEqual(
  canonicalLoomAdvisoryFinding('EMAIL_IDENTIFIER', 'TD613_HOSTED'),
  {
    schema: 'td613.holonomy-loom.provider-advisory-request/v0.1',
    action: 'EXPLAIN_FINDING',
    rule_id: 'EMAIL_IDENTIFIER',
    evidence_class: 'DETERMINISTIC_PATTERN_MATCH',
    action_class: 'CHANGE',
    minimized_context: {
      finding_category: 'email address',
      why_class: 'direct_identifier_email',
      route_mode: 'TD613_HOSTED'
    },
    claim_ceiling: HOLONOMY_LOOM_ADVISORY_CLAIM_CEILING
  }
);

assert.throws(() => buildMarrowlineLoomAdvisoryRequest({ ruleId: 'UNKNOWN_RULE', routeMode: 'TD613_HOSTED' }), /unsupported rule_id/);
assert.throws(() => buildMarrowlineLoomAdvisoryRequest({ ruleId: 'COMMON_API_KEY_BLOCK', routeMode: 'UNBOUNDED_ROOM' }), /unsupported route_mode/);

const source = fs.readFileSync('app/dome-world/marrowline-loom-advisory.js', 'utf8');
const server = fs.readFileSync('server/holonomy-loom-khonapolit-advisory.js', 'utf8');
const boot = fs.readFileSync('app/dome-world/marrowline-egress-boot.js', 'utf8');
const custody = fs.readFileSync('scripts/marrowline-loom-advisory-exact-source-witness.mjs', 'utf8');
const transition = fs.readFileSync('scripts/ash-a15-transition-trace-browser-probe.mjs', 'utf8');
assert.match(source, /ASK KʰONAPOLIT FOR HELP/);
assert.match(source, /one canonical rule ID, its fixed evidence\/action\/category\/why tokens/);
assert.match(source, /free-text finding descriptions/);
assert.match(source, /there is nowhere in this drawer to paste the original message/);
assert.doesNotMatch(source, /createElement\('input'\)/, 'advisory drawer must not create free-text payload inputs');
assert.match(source, /derived\.querySelector\('#loomDerivedAction'\)\.textContent = item\.action_class/);
assert.match(source, /derived\.querySelector\('#loomDerivedEvidence'\)\.textContent = item\.evidence_class/);
assert.match(source, /derived\.querySelector\('#loomDerivedCategory'\)\.textContent = item\.finding_category/);
assert.match(source, /derived\.querySelector\('#loomDerivedWhy'\)\.textContent = item\.why_class/);
assert.doesNotMatch(source, /doc\.getElementById\('loomDerived(?:Action|Evidence|Category|Why)'\)/,
  'detached canonical-token preview must not query the document before mount');
assert.match(source, /rule\.addEventListener\('change', refreshDerived\);\s*refreshDerived\(\);[\s\S]*form\.before\(panel\);/,
  'canonical preview must be safe while the advisory fragment is still detached');
assert.match(source, /canonicalTokenOnly: true/);
assert.match(source, /freeTextFindingAccepted: false/);
assert.match(source, /providerResultHasReleaseAuthority: false/);
assert.match(source, /conversationHistoryAccepted: false/);
assert.match(source, /rawDraftAccepted: false/);
assert.match(server, /canonicalLoomAdvisoryFinding/);
assert.match(server, /must equal canonical policy value/);
assert.match(server, /X-TD613-Holonomy-Loom-Policy/);
assert.match(boot, /async function bootMarrowlineLoomAdvisory/);
assert.match(boot, /dependency: 'static-marrowline-controls-only'/);
assert.match(boot, /conversationalTerminalRequired: false/);
assert.match(boot, /stationRequired: false/);
assert.match(boot, /providerCallPerformed: false/);
assert.match(boot, /const advisoryBoot = await bootMarrowlineLoomAdvisory\(doc, root\);[\s\S]*await Promise\.all\(\[[\s\S]*marrowline-station\.js[\s\S]*marrowline-terminal\.js/,
  'privacy disclosure organ must mount before conversational station/terminal bundle');
assert.match(boot, /__TD613_MARROWLINE_LOOM_ADVISORY_BOOT_ERROR__/);
assert.match(boot, /loomAdvisory: Boolean\(root\.__TD613_MARROWLINE_LOOM_ADVISORY__\)/);
assert.match(boot, /providerDisclosureRequired: true/);
assert.match(boot, /canonicalTokenOnly: true/);
assert.match(boot, /freeTextFindingAccepted: false/);
assert.match(boot, /rawDraftAccepted: false/);
assert.match(boot, /conversationHistoryAccepted: false/);
assert.match(boot, /providerResultHasReleaseAuthority: false/);

assert.match(custody, /pull-request-whole-tree-parity/);
assert.match(custody, /git\('fetch', '--no-tags', '--depth=1', 'origin', eventHead\)/);
assert.match(custody, /checkoutTree === headTree/);
assert.match(custody, /source_bytes_equivalent_to_raw_head: treeEqual/);
assert.match(custody, /commit_identity_equivalence_claimed: false/);
assert.match(custody, /tree_byte_equivalence_claimed: treeEqual/);
assert.match(custody, /if \(!treeEqual\)[\s\S]*Marrowline Loom browser witness custody held/,
  'browser assay must fail closed when merge-ref tree differs from raw event-head tree');
assert.match(transition, /marrowline-loom-advisory-exact-source-witness\.mjs/);
assert.doesNotMatch(transition, /const marrowlineLoomWitnessPath = path\.join\(scriptsDir, 'marrowline-loom-advisory-browser-witness\.mjs'\)/,
  'A15 transition wrapper must route through source custody before the browser assay');

console.log('Marrowline Loom advisory: canonical-token surface, detached preview safety, advisory-first boot, and raw-head whole-tree custody ok');
