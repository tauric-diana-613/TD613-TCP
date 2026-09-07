import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const baseAdapterPath = path.join(scriptsDir, 'ash-a2-a5-browser-probe.mjs');
const tempAdapterPath = path.join(scriptsDir, `.ash-a2-a5-pretrace-replacement-${process.pid}.mjs`);
const browserName = process.env.TD613_BROWSER || 'chromium';
const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/a2-a5-pretrace-replacement-${browserName}`);
const baseObservationPath = path.join(artifactDir, 'ash-a2-a6-browser-observation.json');
const successorReceiptPath = path.join(artifactDir, 'a2-a5-pretrace-replacement-reacquisition-receipt.json');
const FORCED_ROUTE = 'CUSTODIAL';
const FORBIDDEN_SETTER_LITERAL = '__td613AshLiveAIA.setRoute(';
const INHERITED_FAIL_CLOSED_GUARD = [
  "if (source.includes('__td613AshLiveAIA.setRoute(')) {",
  "  throw new Error('A15 A2-A6 route witness may not bypass the native route control owner.');",
  '}'
].join('\n');

function sha256Utf8(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

function replaceExactly(source, marker, replacement, label) {
  const count = source.split(marker).length - 1;
  if (count !== 1) throw new Error(`${label} expected exactly one marker; observed ${count}`);
  return source.replace(marker, replacement);
}

const baseAdapterSource = await fs.readFile(baseAdapterPath, 'utf8');
const baseAdapterSha256 = sha256Utf8(baseAdapterSource);

for (const marker of [
  'const maxRouteActivationAttempts = 4',
  'const handle = await canonicalButton.elementHandle()',
  'await handle.focus()',
  "await handle.press('Enter')",
  'replacement_retry_observed:routeActivationAttempts.length > 1',
  'canonical_control_same_instance_after'
]) {
  if (!baseAdapterSource.includes(marker)) {
    throw new Error(`Inherited A2–A5 pre-trace parent marker unavailable: ${marker}`);
  }
}

const baseForbiddenSetterOccurrences = baseAdapterSource.split(FORBIDDEN_SETTER_LITERAL).length - 1;
if (baseForbiddenSetterOccurrences !== 1 || !baseAdapterSource.includes(INHERITED_FAIL_CLOSED_GUARD)) {
  throw new Error(`Inherited A2–A5 direct-setter guard drifted; observed ${baseForbiddenSetterOccurrences} setter-shaped literals.`);
}

const pretraceMarker = [
  '      try {',
  '        await handle.focus();',
  '        await handle.evaluate((control, payload) => {'
].join('\n');

const pretraceInjection = [
  '      try {',
  '        let forcedPretraceReplacementReceipt = null;',
  "        if (process.env.TD613_A2_A5_FORCE_PRETRACE_REPLACEMENT === '1'",
  "            && route === String(process.env.TD613_A2_A5_FORCE_PRETRACE_REPLACEMENT_ROUTE || 'CUSTODIAL')",
  '            && activationAttempt === 1) {',
  '          forcedPretraceReplacementReceipt = await page.evaluate(expected => {',
  "            const canonicalVisible = [...document.querySelectorAll('#ashAiaMembrane [data-aia-route]')]",
  '              .filter(node => node.dataset.aiaRoute === expected && node.getClientRects().length > 0);',
  "            if (canonicalVisible.length !== 1 || typeof canonicalVisible[0].onclick !== 'function') {",
  "              throw new Error('A2–A5 pre-trace replacement could not acquire one canonical native owner.');",
  '            }',
  '            const oldControl = canonicalVisible[0];',
  '            const nativeOnclick = oldControl.onclick;',
  '            const replacement = oldControl.cloneNode(true);',
  '            replacement.onclick = nativeOnclick;',
  '            oldControl.onclick = null;',
  '            oldControl.replaceWith(replacement);',
  "            const afterVisible = [...document.querySelectorAll('#ashAiaMembrane [data-aia-route]')]",
  '              .filter(node => node.dataset.aiaRoute === expected && node.getClientRects().length > 0);',
  '            window.__td613A2A5PretraceReplacementInjection = { old_control:oldControl, replacement_control:replacement };',
  '            return {',
  '              performed:true,',
  '              route:expected,',
  '              old_connected_after:oldControl.isConnected === true,',
  "              old_native_onclick_after:typeof oldControl.onclick === 'function',",
  '              replacement_connected:replacement.isConnected === true,',
  "              replacement_has_native_onclick:typeof replacement.onclick === 'function',",
  '              canonical_visible_count:afterVisible.length,',
  '              canonical_is_replacement:afterVisible.length === 1 && afterVisible[0] === replacement,',
  '              same_dom_instance:false,',
  '              direct_route_api_bypass:false',
  '            };',
  '          }, route);',
  '        }',
  '',
  '        const preactivationState = await handle.evaluate(control => ({',
  '          connected:control?.isConnected === true,',
  '          route:control?.dataset?.aiaRoute || null,',
  "          direct_onclick:typeof control?.onclick === 'function'",
  '        }));',
  '        if (preactivationState.route !== route) {',
  "          throw new Error('A15 A2-A6 acquired route control changed semantic identity before focus.');",
  '        }',
  '        if (preactivationState.connected !== true) {',
  "          const pretraceAfterRoute = await page.evaluate(() => document.querySelector('#ashAiaMembrane [data-ash-route-surface]')?.dataset.route || null);",
  '          routeActivationAttempts.push({',
  '            expected_route:route,',
  '            attempt:activationAttempt,',
  '            handle_acquired:true,',
  "            preactivation_stage:'BEFORE_FOCUS',",
  '            preactivation_error:null,',
  "            retry_reason:'PRETRACE_CONTROL_DISCONNECTED',",
  '            control_connected:false,',
  '            direct_onclick:preactivationState.direct_onclick === true,',
  '            active_before:false,',
  '            events:[],',
  '            after_dispatch_route:pretraceAfterRoute,',
  '            traced_control_connected_after:false,',
  '            canonical_control_same_instance_after:false,',
  '            forced_pretrace_replacement:forcedPretraceReplacementReceipt',
  '          });',
  '          continue;',
  '        }',
  '        if (preactivationState.direct_onclick !== true) {',
  "          throw new Error('A15 A2-A6 connected route control lost native action authority before focus.');",
  '        }',
  '        await handle.focus();',
  '        await handle.evaluate((control, payload) => {'
].join('\n');

let hostileAdapterSource = replaceExactly(
  baseAdapterSource,
  pretraceMarker,
  pretraceInjection,
  'pre-trace disconnected-owner retry classification and hostile replacement'
);

const hostileForbiddenSetterOccurrences = hostileAdapterSource.split(FORBIDDEN_SETTER_LITERAL).length - 1;
if (hostileForbiddenSetterOccurrences !== 1 || !hostileAdapterSource.includes(INHERITED_FAIL_CLOSED_GUARD)) {
  throw new Error(`Pre-trace descendant introduced direct-setter drift; observed ${hostileForbiddenSetterOccurrences} setter-shaped literals.`);
}

await fs.mkdir(artifactDir, { recursive:true });
const previousForce = process.env.TD613_A2_A5_FORCE_PRETRACE_REPLACEMENT;
const previousRoute = process.env.TD613_A2_A5_FORCE_PRETRACE_REPLACEMENT_ROUTE;
try {
  process.env.TD613_A2_A5_FORCE_PRETRACE_REPLACEMENT = '1';
  process.env.TD613_A2_A5_FORCE_PRETRACE_REPLACEMENT_ROUTE = FORCED_ROUTE;
  await fs.writeFile(tempAdapterPath, hostileAdapterSource, 'utf8');
  await import(`${pathToFileURL(tempAdapterPath).href}?td613_a2_a5_pretrace_replacement=${Date.now()}`);
} finally {
  if (previousForce === undefined) delete process.env.TD613_A2_A5_FORCE_PRETRACE_REPLACEMENT;
  else process.env.TD613_A2_A5_FORCE_PRETRACE_REPLACEMENT = previousForce;
  if (previousRoute === undefined) delete process.env.TD613_A2_A5_FORCE_PRETRACE_REPLACEMENT_ROUTE;
  else process.env.TD613_A2_A5_FORCE_PRETRACE_REPLACEMENT_ROUTE = previousRoute;
  await fs.rm(tempAdapterPath, { force:true });
}

const baseAdapterAfter = await fs.readFile(baseAdapterPath, 'utf8');
if (sha256Utf8(baseAdapterAfter) !== baseAdapterSha256 || baseAdapterAfter !== baseAdapterSource) {
  throw new Error('Inherited A2–A5 observer bytes moved during pre-trace replacement witness.');
}

const report = JSON.parse(await fs.readFile(baseObservationPath, 'utf8'));
if (report.status !== 'PASS') throw new Error(`Inherited A2–A5 observation did not close PASS: ${report.status}`);

const activation = report.observations?.semantic_route_activation?.[FORCED_ROUTE];
if (!activation) throw new Error(`Missing ${FORCED_ROUTE} semantic route activation receipt.`);
if (activation.attempt_count !== 2) throw new Error(`Expected exactly two ${FORCED_ROUTE} attempts; observed ${activation.attempt_count}`);
if (activation.replacement_retry_observed !== true) throw new Error('Pre-trace replacement retry was not observed.');
if (activation.native_enter_required !== true || activation.direct_route_api_bypass !== false) {
  throw new Error('Pre-trace recovery widened native-route authority.');
}
if (activation.canonical_route_settled !== true || activation.settled_route !== FORCED_ROUTE) {
  throw new Error(`Pre-trace recovery did not settle canonical ${FORCED_ROUTE} route.`);
}

const [first, second] = activation.attempts || [];
if (!first || !second) throw new Error('Two-attempt pre-trace replacement ledger incomplete.');
const forced = first.forced_pretrace_replacement;
if (first.attempt !== 1 || first.handle_acquired !== true
    || first.preactivation_stage !== 'BEFORE_FOCUS'
    || first.retry_reason !== 'PRETRACE_CONTROL_DISCONNECTED') {
  throw new Error(`Attempt 1 did not preserve the pre-trace disconnected-owner classification: ${JSON.stringify(first)}`);
}
if (first.preactivation_error !== null || first.control_connected !== false
    || first.traced_control_connected_after !== false
    || first.canonical_control_same_instance_after !== false) {
  throw new Error('Attempt 1 was not a clean pre-trace disconnected-owner retry.');
}
if (!Array.isArray(first.events) || first.events.length !== 0) {
  throw new Error('Pre-trace attempt 1 unexpectedly observed native events.');
}
if (first.after_dispatch_route === FORCED_ROUTE) {
  throw new Error('Pre-trace attempt 1 unexpectedly settled the forced route.');
}
if (forced?.performed !== true || forced.route !== FORCED_ROUTE
    || forced.old_connected_after !== false || forced.old_native_onclick_after !== false
    || forced.replacement_connected !== true || forced.replacement_has_native_onclick !== true
    || forced.canonical_visible_count !== 1 || forced.canonical_is_replacement !== true
    || forced.same_dom_instance !== false || forced.direct_route_api_bypass !== false) {
  throw new Error(`Pre-trace replacement failed canonical native ownership transfer: ${JSON.stringify(forced)}`);
}

if (second.attempt !== 2 || second.control_connected !== true || second.direct_onclick !== true
    || second.active_before !== true || second.traced_control_connected_after !== true
    || second.canonical_control_same_instance_after !== true) {
  throw new Error(`Attempt 2 did not reacquire the live replacement owner: ${JSON.stringify(second)}`);
}
if (second.press_error) throw new Error(`Attempt-2 native Enter failed: ${second.press_error}`);
if (!Array.isArray(second.events) || !second.events.some(event => event.type === 'keydown')
    || !second.events.some(event => event.type === 'click')) {
  throw new Error('Attempt-2 native Enter event path was not observed.');
}
if (second.after_dispatch_route !== FORCED_ROUTE) {
  throw new Error(`Attempt-2 dispatch failed to move the route surface to ${FORCED_ROUTE}.`);
}

for (const [route, routeActivation] of Object.entries(report.observations?.semantic_route_activation || {})) {
  if (route === FORCED_ROUTE) continue;
  if (routeActivation.replacement_retry_observed !== false || routeActivation.attempt_count !== 1
      || routeActivation.canonical_route_settled !== true || routeActivation.direct_route_api_bypass !== false) {
    throw new Error(`Non-injected route ${route} drifted under the pre-trace hostile episode.`);
  }
}

if (report.observations?.entry_exact_case_reconcile?.source_bytes_moved !== false
    || report.observations?.entry_exact_case_reconcile?.authority_changed !== false
    || report.observations?.entry_exact_case_reconcile?.human_closure_required !== true) {
  throw new Error('Inherited exact-case convergence widened source or authority under pre-trace replacement witness.');
}

const receipt = Object.freeze({
  schema:'td613.ash.a2-a5-pretrace-replacement-reacquisition/v0.1-local-only',
  status:'PASS',
  browser:browserName,
  forced_route:FORCED_ROUTE,
  base_adapter_sha256:baseAdapterSha256,
  base_adapter_bytes:Buffer.byteLength(baseAdapterSource, 'utf8'),
  inherited_observer_bytes_mutated:false,
  observer_repair_scope:'WITNESS_ONLY_TEMPORARY_DESCENDANT_ADAPTER',
  product_runtime_mutation:false,
  attempt_1:Object.freeze({
    attempt:first.attempt,
    handle_acquired:first.handle_acquired,
    preactivation_stage:first.preactivation_stage,
    preactivation_error:first.preactivation_error,
    retry_reason:first.retry_reason,
    after_dispatch_route:first.after_dispatch_route || null,
    event_count:first.events.length,
    traced_control_connected_after:first.traced_control_connected_after,
    canonical_control_same_instance_after:first.canonical_control_same_instance_after,
    forced_pretrace_replacement:forced
  }),
  attempt_2:Object.freeze({
    attempt:second.attempt,
    after_dispatch_route:second.after_dispatch_route || null,
    traced_control_connected_after:second.traced_control_connected_after,
    canonical_control_same_instance_after:second.canonical_control_same_instance_after,
    native_keydown_observed:second.events.some(event => event.type === 'keydown'),
    native_click_observed:second.events.some(event => event.type === 'click')
  }),
  attempt_count:activation.attempt_count,
  replacement_retry_observed:activation.replacement_retry_observed,
  canonical_route_settled:activation.canonical_route_settled,
  settled_route:activation.settled_route,
  native_enter_required:true,
  direct_route_api_bypass:false,
  max_attempts_changed:false,
  timeout_budget_widened:false,
  release_authority:false,
  provider_call_performed:false,
  production_mutation:false,
  human_closure_required:true,
  counts_as_human_evidence:false,
  counts_as_exogenous_witness:false,
  golden_egg_credit:0
});

await fs.writeFile(successorReceiptPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
console.log(`A2-A5 pre-trace replacement reacquisition browser witness (${browserName}): PASS`);
