import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const baseAdapterPath = path.join(scriptsDir, 'ash-a2-a5-browser-probe.mjs');
const tempAdapterPath = path.join(scriptsDir, `.ash-a2-a5-replacement-triggered-${process.pid}.mjs`);
const browserName = process.env.TD613_BROWSER || 'chromium';
const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/a2-a5-replacement-triggered-${browserName}`);
const baseObservationPath = path.join(artifactDir, 'ash-a2-a6-browser-observation.json');
const successorReceiptPath = path.join(artifactDir, 'a2-a5-replacement-triggered-native-reacquisition-receipt.json');
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

if (!baseAdapterSource.includes('const maxRouteActivationAttempts = 4')
    || !baseAdapterSource.includes('const handle = await canonicalButton.elementHandle()')
    || !baseAdapterSource.includes("await handle.press('Enter')")
    || !baseAdapterSource.includes('replacement_retry_observed:routeActivationAttempts.length > 1')
    || !baseAdapterSource.includes('canonical_control_same_instance_after')) {
  throw new Error('Inherited #1046 replaceable-native-route observer law unavailable.');
}
const baseForbiddenSetterOccurrences = baseAdapterSource.split(FORBIDDEN_SETTER_LITERAL).length - 1;
if (!baseAdapterSource.includes('__td613AshLiveAIA.setRoute(')
    || baseForbiddenSetterOccurrences !== 1
    || !baseAdapterSource.includes(INHERITED_FAIL_CLOSED_GUARD)) {
  throw new Error(`Inherited A2–A5 observer direct-setter guard drifted or a bypass appeared; observed ${baseForbiddenSetterOccurrences} setter-shaped literals.`);
}

const injection = [
  '        let forcedReplacementReceipt = null;',
  "        if (process.env.TD613_A2_A5_FORCE_REPLACEMENT === '1'",
  "            && route === String(process.env.TD613_A2_A5_FORCE_REPLACEMENT_ROUTE || 'CUSTODIAL')",
  '            && activationAttempt === 1) {',
  '          forcedReplacementReceipt = await page.evaluate(expected => {',
  '            const tracedControl = window.__td613A2A5SemanticRouteControl || null;',
  "            if (!tracedControl || tracedControl.dataset?.aiaRoute !== expected || !tracedControl.isConnected || typeof tracedControl.onclick !== 'function') {",
  "              throw new Error('A2–A5 forced replacement could not acquire the traced canonical native owner.');",
  '            }',
  '            const nativeOnclick = tracedControl.onclick;',
  '            const replacement = tracedControl.cloneNode(true);',
  '            replacement.onclick = nativeOnclick;',
  '            tracedControl.onclick = null;',
  '            tracedControl.replaceWith(replacement);',
  "            const canonicalVisible = [...document.querySelectorAll('#ashAiaMembrane [data-aia-route]')]",
  '              .filter(node => node.dataset.aiaRoute === expected && node.getClientRects().length > 0);',
  '            window.__td613A2A5ReplacementInjection = { old_control:tracedControl, replacement_control:replacement };',
  '            return {',
  '              performed:true,',
  '              route:expected,',
  '              old_connected_after:tracedControl.isConnected === true,',
  '              old_native_onclick_after:typeof tracedControl.onclick === \'function\',',
  '              replacement_connected:replacement.isConnected === true,',
  '              replacement_has_native_onclick:typeof replacement.onclick === \'function\',',
  '              canonical_visible_count:canonicalVisible.length,',
  '              canonical_is_replacement:canonicalVisible.length === 1 && canonicalVisible[0] === replacement,',
  '              same_dom_instance:false,',
  '              direct_route_api_bypass:false',
  '            };',
  '          }, route);',
  '        }',
  '',
  '        let pressError = null;'
].join('\n');

let hostileAdapterSource = replaceExactly(
  baseAdapterSource,
  '        let pressError = null;',
  injection,
  'witness-only stale-handle replacement injection'
);
hostileAdapterSource = replaceExactly(
  hostileAdapterSource,
  '        activationAfterDispatch.press_error = pressError;',
  '        activationAfterDispatch.press_error = pressError;\n        activationAfterDispatch.forced_replacement = forcedReplacementReceipt;',
  'forced-replacement receipt attachment'
);

const hostileForbiddenSetterOccurrences = hostileAdapterSource.split(FORBIDDEN_SETTER_LITERAL).length - 1;
if (!hostileAdapterSource.includes('__td613AshLiveAIA.setRoute(')
    || hostileForbiddenSetterOccurrences !== 1
    || !hostileAdapterSource.includes(INHERITED_FAIL_CLOSED_GUARD)) {
  throw new Error(`Hostile witness direct-setter guard drifted or a bypass appeared; observed ${hostileForbiddenSetterOccurrences} setter-shaped literals.`);
}

await fs.mkdir(artifactDir, { recursive:true });
const previousForce = process.env.TD613_A2_A5_FORCE_REPLACEMENT;
const previousRoute = process.env.TD613_A2_A5_FORCE_REPLACEMENT_ROUTE;
try {
  process.env.TD613_A2_A5_FORCE_REPLACEMENT = '1';
  process.env.TD613_A2_A5_FORCE_REPLACEMENT_ROUTE = FORCED_ROUTE;
  await fs.writeFile(tempAdapterPath, hostileAdapterSource, 'utf8');
  await import(`${pathToFileURL(tempAdapterPath).href}?td613_a2_a5_replacement_triggered=${Date.now()}`);
} finally {
  if (previousForce === undefined) delete process.env.TD613_A2_A5_FORCE_REPLACEMENT;
  else process.env.TD613_A2_A5_FORCE_REPLACEMENT = previousForce;
  if (previousRoute === undefined) delete process.env.TD613_A2_A5_FORCE_REPLACEMENT_ROUTE;
  else process.env.TD613_A2_A5_FORCE_REPLACEMENT_ROUTE = previousRoute;
  await fs.rm(tempAdapterPath, { force:true });
}

const baseAdapterAfter = await fs.readFile(baseAdapterPath, 'utf8');
if (sha256Utf8(baseAdapterAfter) !== baseAdapterSha256 || baseAdapterAfter !== baseAdapterSource) {
  throw new Error('Inherited A2–A5 observer bytes moved during replacement-triggered witness.');
}

const report = JSON.parse(await fs.readFile(baseObservationPath, 'utf8'));
if (report.status !== 'PASS') throw new Error(`Inherited A2–A5 observation did not close PASS: ${report.status}`);

const activation = report.observations?.semantic_route_activation?.[FORCED_ROUTE];
if (!activation) throw new Error(`Missing ${FORCED_ROUTE} semantic route activation receipt.`);
if (activation.attempt_count !== 2) throw new Error(`Expected exactly two ${FORCED_ROUTE} attempts; observed ${activation.attempt_count}`);
if (activation.replacement_retry_observed !== true) throw new Error('Replacement-triggered retry was not observed.');
if (activation.native_enter_required !== true || activation.direct_route_api_bypass !== false) {
  throw new Error('Replacement recovery widened native-route authority.');
}
if (activation.canonical_route_settled !== true || activation.settled_route !== FORCED_ROUTE) {
  throw new Error(`Replacement recovery did not settle canonical ${FORCED_ROUTE} route.`);
}

const [first, second] = activation.attempts || [];
if (!first || !second) throw new Error('Two-attempt replacement ledger incomplete.');
const forced = first.forced_replacement;
if (first.attempt !== 1 || forced?.performed !== true || forced.route !== FORCED_ROUTE) {
  throw new Error('Attempt 1 did not preserve the forced replacement receipt.');
}
if (forced.old_connected_after !== false || forced.old_native_onclick_after !== false) {
  throw new Error('Attempt-1 stale control retained connectivity or native action authority after replacement.');
}
if (forced.replacement_connected !== true || forced.replacement_has_native_onclick !== true
    || forced.canonical_visible_count !== 1 || forced.canonical_is_replacement !== true
    || forced.same_dom_instance !== false || forced.direct_route_api_bypass !== false) {
  throw new Error(`Replacement failed canonical native ownership transfer: ${JSON.stringify(forced)}`);
}
if (first.traced_control_connected_after !== false || first.canonical_control_same_instance_after !== false) {
  throw new Error('Attempt-1 diagnostics did not observe a stale traced control.');
}
if (first.after_dispatch_route === FORCED_ROUTE) {
  throw new Error('Stale attempt 1 unexpectedly settled the forced route.');
}
if (first.forced_replacement?.direct_route_api_bypass !== false) {
  throw new Error('Attempt 1 used a direct route API bypass.');
}

if (second.attempt !== 2 || second.control_connected !== true || second.direct_onclick !== true
    || second.active_before !== true || second.traced_control_connected_after !== true
    || second.canonical_control_same_instance_after !== true) {
  throw new Error(`Attempt 2 did not reacquire the live canonical native owner: ${JSON.stringify(second)}`);
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
    throw new Error(`Non-injected route ${route} drifted under the frozen hostile episode.`);
  }
}

if (report.observations?.entry_exact_case_reconcile?.source_bytes_moved !== false
    || report.observations?.entry_exact_case_reconcile?.authority_changed !== false
    || report.observations?.entry_exact_case_reconcile?.human_closure_required !== true) {
  throw new Error('Inherited exact-case convergence widened source or authority under replacement witness.');
}

const receipt = Object.freeze({
  schema:'td613.ash.a2-a5-replacement-triggered-native-reacquisition/v0.1-local-only',
  status:'PASS',
  browser:browserName,
  forced_route:FORCED_ROUTE,
  base_adapter_sha256:baseAdapterSha256,
  base_adapter_bytes:Buffer.byteLength(baseAdapterSource, 'utf8'),
  inherited_observer_bytes_mutated:false,
  product_runtime_mutation:false,
  replacement_injection_scope:'WITNESS_ONLY_TEMPORARY_ADAPTER',
  attempt_1:Object.freeze({
    attempt:first.attempt,
    press_error:first.press_error || null,
    after_dispatch_route:first.after_dispatch_route || null,
    traced_control_connected_after:first.traced_control_connected_after,
    canonical_control_same_instance_after:first.canonical_control_same_instance_after,
    forced_replacement:forced
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
console.log(`A2-A5 replacement-triggered native reacquisition browser witness (${browserName}): PASS`);
