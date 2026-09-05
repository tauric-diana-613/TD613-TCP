import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  HOLONOMY_LOOM_PROVIDER_ADVISORY_SCHEMA,
  HOLONOMY_LOOM_ADVISORY_RULES
} from '../app/dome-world/holonomy-loom-advisory-policy.js';
import {
  compilePortableAiaProjection,
  auditPortablePayloadVocabulary
} from '../app/dome-world/portable-aia-three-route-invariance.js';

const path = 'app/pocket/td613-local-pocket-v0-2.html';
const source = fs.readFileSync(path, 'utf8');

assert.match(source, /Mallow checks the door\./, 'Pocket must expose the child-legible front door before technical vocabulary.');
assert.ok(source.indexOf('SEE · Put the message in your pocket') < source.indexOf('CHECK · Ask the Pocket'), 'SEE must precede CHECK.');
assert.ok(source.indexOf('CHECK · Ask the Pocket') < source.indexOf('UNDERSTAND · The world answers'), 'CHECK must precede UNDERSTAND.');
assert.ok(source.indexOf('UNDERSTAND · The world answers') < source.indexOf('REST · You keep the key'), 'UNDERSTAND must precede REST.');

// Single-file local membrane.
assert.match(source, /default-src 'none'/);
assert.match(source, /connect-src 'none'/);
assert.match(source, /font-src 'none'/);
assert.match(source, /worker-src 'none'/);
assert.match(source, /form-action 'none'/);
assert.match(source, /base-uri 'none'/);
assert.doesNotMatch(source, /<script\s+[^>]*src=/i, 'Pocket may not load an external script.');
assert.doesNotMatch(source, /<link\s+[^>]*href=/i, 'Pocket may not load an external resource.');
assert.doesNotMatch(source, /https?:\/\//i, 'Pocket v0.2 may not embed a remote URL.');
assert.doesNotMatch(source, /\/api\//i, 'Pocket v0.2 may not depend on a server API route.');
assert.doesNotMatch(source, /GEMINI_API_KEY|generativelanguage\.googleapis\.com|KHONAPOLIT_TERMINAL/i, 'Layer 0 may not embed provider plumbing.');
assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB|caches\.open|document\.cookie\s*=/i, 'Pocket may not persist user state.');
for (const marker of ['window.fetch=blockedNetwork','XMLHttpRequest.prototype.open=blockedNetwork','window.WebSocket=function(){return blockedNetwork()}','window.EventSource=function(){return blockedNetwork()}','navigator.sendBeacon=blockedNetwork']) {
  assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Network fail-closed marker missing: ${marker}`);
}

// Extract the non-executable embedded canonical policy snapshot.
const policyMatch = source.match(/<script id="td613-pocket-policy" type="application\/json">\s*([\s\S]*?)\s*<\/script>/);
assert.ok(policyMatch, 'Embedded Pocket policy snapshot must exist.');
const embedded = JSON.parse(policyMatch[1]);
assert.equal(embedded.policy_schema_token, HOLONOMY_LOOM_PROVIDER_ADVISORY_SCHEMA);
assert.deepEqual(Object.keys(embedded.rules).sort(), Object.keys(HOLONOMY_LOOM_ADVISORY_RULES).sort(), 'Pocket outward rule IDs must exactly equal canonical Loom rule IDs.');
for (const [ruleId, canonical] of Object.entries(HOLONOMY_LOOM_ADVISORY_RULES)) {
  assert.deepEqual(embedded.rules[ruleId], {
    rule_id: canonical.rule_id,
    label: canonical.label,
    evidence_class: canonical.evidence_class,
    action_class: canonical.action_class
  }, `Embedded Pocket rule drifted from canonical Loom policy: ${ruleId}`);
}
assert.doesNotMatch(source, /['"](?:JWT|GITHUB_TOKEN|GOOGLE_API_KEY)['"]/, 'Historical detector subtypes may not reappear as outward rule identities.');

// Boundary tokens must come from the same inherited LOCAL_POCKET projection semantics.
const pocketProjection = compilePortableAiaProjection({ ruleId: 'EMAIL_IDENTIFIER', routeMode: 'LOCAL_POCKET' });
assert.deepEqual(embedded.route_boundary, pocketProjection.portable_payload.route_boundary);
const vocabularyAudit = auditPortablePayloadVocabulary(pocketProjection);
assert.equal(vocabularyAudit.ok, true);
assert.equal(vocabularyAudit.route_mode_present, false);
assert.equal(vocabularyAudit.presentation_host_present, false);
assert.equal(vocabularyAudit.digest_token_present, false);

// Two intentionally non-equivalent copy doors.
assert.match(source, /COPY SAFER MESSAGE/);
assert.match(source, /COPY POCKET CARD/);
assert.match(source, /USER_APPROVED_MESSAGE != PORTABLE_GOVERNANCE_PAYLOAD|This is content, not a canonical governance packet/);
assert.match(source, /CARD_SCHEMA='td613\.local-pocket\.card\/v0\.2-born-minimized'/);
assert.match(source, /CLEAR_UNDER_ENABLED_DETERMINISTIC_RULES/);
assert.match(source, /CHANGE_SUGGESTED/);
assert.match(source, /HOLD_REMOVE_REQUIRED/);
assert.match(source, /findings:Object\.freeze\(canonicalFindingRecords\(findings\)\)/, 'Door B must carry canonical records rather than raw findings.');
assert.match(source, /release_authority:false,human_closure_required:true/);
assert.match(source, /claim_ceiling_token:policy\.claim_ceiling_token/);
assert.doesNotMatch(source, /buildCard\([^)]*\)[\s\S]{0,600}(?:source_state_digest|policy_digest|start:|end:)/i, 'Born-minimized card construction may not include local binding or span fields.');

// Exact-state binding and stale-check relock.
assert.match(source, /crypto\.subtle\.digest\('SHA-256',data\)/);
assert.match(source, /source_state_digest:sourceStateDigest,policy_digest:policyDigest/);
assert.match(source, /now===lastCheck\.source_state_digest&&policyDigest===lastCheck\.policy_digest/);
assert.match(source, /draft\.addEventListener\('input',\(\)=>invalidate\(\)\)/);
assert.match(source, /protectedBox\.addEventListener\('input',\(\)=>invalidate\(\)\)/);
assert.match(source, /copyMessage\.disabled=true;copyCard\.disabled=true/);

// REMOVE holds the message door; mitigation remains local and forces recheck.
assert.match(source, /hardHold=findings\.some\(f=>rule\(f\.rule_id\)\.action_class==='REMOVE'\)/);
assert.match(source, /copyMessage\.disabled=hardHold/);
assert.match(source, /action==='REMOVE'\?'\[PROTECTED\]':'\[GENERALIZED\]'/);
assert.match(source, /Mallow changed the copy locally\. CHECK the new exact state before either door opens again\./);
assert.match(source, /nonOverlapping\(lastCheck\.findings\)/);

// Runtime receipt and authority ceiling.
for (const marker of [
  'network_required:false',
  'remote_model_required:false',
  'provider_call_performed:false',
  'persistence_performed:false',
  'release_authority:false',
  'human_closure_required:true'
]) assert.match(source, new RegExp(marker));
assert.match(source, /No enabled deterministic rule matched this exact checked state\. That is a bounded result, not zero privacy risk\./);
assert.match(source, /What happens after you paste it belongs to the next room\./);

console.log('Local Pocket v0.2 hostile source contract: PASS');
