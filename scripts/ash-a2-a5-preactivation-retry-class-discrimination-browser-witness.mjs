import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const baseAdapterPath = path.join(scriptsDir, 'ash-a2-a5-browser-probe.mjs');
const browserName = process.env.TD613_BROWSER || 'chromium';
const artifactRoot = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/a2-a5-preactivation-retry-class-${browserName}`);
const FORCED_ROUTE = 'CUSTODIAL';
const FORBIDDEN_SETTER_LITERAL = '__td613AshLiveAIA.setRoute(';
const INHERITED_FAIL_CLOSED_GUARD = [
  "if (source.includes('__td613AshLiveAIA.setRoute(')) {",
  "  throw new Error('A15 A2-A6 route witness may not bypass the native route control owner.');",
  '}'
].join('\n');
const CASES = Object.freeze([
  Object.freeze({
    id:'CONNECTED_SEMANTIC_DRIFT',
    expected_error:'A15 A2-A6 acquired route control changed semantic identity before focus.',
    expected_stale_route:'AUDIT',
    expected_direct_onclick:true
  }),
  Object.freeze({
    id:'CONNECTED_NATIVE_OWNER_LOSS',
    expected_error:'A15 A2-A6 connected route control lost native action authority before focus.',
    expected_stale_route:FORCED_ROUTE,
    expected_direct_onclick:false
  })
]);

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
const baseAdapterBytes = Buffer.byteLength(baseAdapterSource, 'utf8');

for (const marker of [
  'const maxRouteActivationAttempts = 4',
  'const handle = await canonicalButton.elementHandle()',
  'await handle.focus()',
  "await handle.press('Enter')",
  'replacement_retry_observed:routeActivationAttempts.length > 1',
  'canonical_control_same_instance_after'
]) {
  if (!baseAdapterSource.includes(marker)) {
    throw new Error(`Inherited A2–A5 retry-class parent marker unavailable: ${marker}`);
  }
}
if (!baseAdapterSource.includes('timeout:4_000')) {
  throw new Error('Inherited A2–A5 four-second settlement ceiling marker unavailable.');
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

const classifierInjection = [
  '      try {',
  '        let forcedRetryClassReceipt = null;',
  "        const retryClassCase = String(process.env.TD613_A2_A5_RETRY_CLASS_CASE || '');",
  "        if (retryClassCase",
  "            && route === String(process.env.TD613_A2_A5_RETRY_CLASS_ROUTE || 'CUSTODIAL')",
  '            && activationAttempt === 1) {',
  '          forcedRetryClassReceipt = await page.evaluate(payload => {',
  "            const canonicalVisible = [...document.querySelectorAll('#ashAiaMembrane [data-aia-route]')]",
  '              .filter(node => node.dataset.aiaRoute === payload.expected && node.getClientRects().length > 0);',
  "            if (canonicalVisible.length !== 1 || typeof canonicalVisible[0].onclick !== 'function') {",
  "              throw new Error('A2–A5 retry-class control could not acquire one canonical native owner.');",
  '            }',
  '            const oldControl = canonicalVisible[0];',
  '            const nativeOnclick = oldControl.onclick;',
  '            const replacement = oldControl.cloneNode(true);',
  '            replacement.dataset.aiaRoute = payload.expected;',
  '            replacement.onclick = nativeOnclick;',
  '            oldControl.insertAdjacentElement(\'afterend\', replacement);',
  "            if (payload.case_id === 'CONNECTED_SEMANTIC_DRIFT') {",
  "              oldControl.dataset.aiaRoute = 'AUDIT';",
  "            } else if (payload.case_id === 'CONNECTED_NATIVE_OWNER_LOSS') {",
  '              oldControl.onclick = null;',
  '            } else {',
  "              throw new Error('Unsupported A2–A5 retry-class hostile case: ' + payload.case_id);",
  '            }',
  '            oldControl.hidden = true;',
  "            const afterVisible = [...document.querySelectorAll('#ashAiaMembrane [data-aia-route]')]",
  '              .filter(node => node.dataset.aiaRoute === payload.expected && node.getClientRects().length > 0);',
  '            window.__td613A2A5RetryClassNegative = {',
  '              old_control:oldControl,',
  '              replacement_control:replacement,',
  '              native_events:[]',
  '            };',
  '            return {',
  '              performed:true,',
  '              case_id:payload.case_id,',
  '              expected_route:payload.expected,',
  '              old_connected_after:oldControl.isConnected === true,',
  '              old_route_after:oldControl.dataset.aiaRoute || null,',
  "              old_direct_onclick_after:typeof oldControl.onclick === 'function',",
  '              old_visible_after:oldControl.getClientRects().length > 0,',
  '              replacement_connected:replacement.isConnected === true,',
  '              replacement_route:replacement.dataset.aiaRoute || null,',
  "              replacement_has_native_onclick:typeof replacement.onclick === 'function',",
  '              canonical_visible_count:afterVisible.length,',
  '              canonical_is_replacement:afterVisible.length === 1 && afterVisible[0] === replacement,',
  '              same_dom_instance:false,',
  "              route_surface_at_classifier:document.querySelector('#ashAiaMembrane [data-ash-route-surface]')?.dataset.route || null,",
  '              native_event_count_before_rejection:0,',
  '              direct_route_api_bypass:false',
  '            };',
  '          }, { expected:route, case_id:retryClassCase });',
  '        }',
  '',
  '        const preactivationState = await handle.evaluate(control => ({',
  '          connected:control?.isConnected === true,',
  '          route:control?.dataset?.aiaRoute || null,',
  "          direct_onclick:typeof control?.onclick === 'function'",
  '        }));',
  '        if (forcedRetryClassReceipt) {',
  '          report.observations.preactivation_retry_class_negative = {',
  '            case_id:retryClassCase,',
  '            expected_route:route,',
  '            attempt:activationAttempt,',
  '            hostile:forcedRetryClassReceipt,',
  '            classifier_state:preactivationState,',
  '            retry_classification_observed:false,',
  '            second_attempt_observed:false,',
  '            classifier_rejection_precedes_focus:true,',
  '            classifier_rejection_precedes_trace:true,',
  '            classifier_rejection_precedes_native_activation:true',
  '          };',
  '        }',
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
  '            forced_retry_class_negative:forcedRetryClassReceipt',
  '          });',
  '          continue;',
  '        }',
  '        if (preactivationState.direct_onclick !== true) {',
  "          throw new Error('A15 A2-A6 connected route control lost native action authority before focus.');",
  '        }',
  '        await handle.focus();',
  '        await handle.evaluate((control, payload) => {'
].join('\n');

const hostileAdapterSource = replaceExactly(
  baseAdapterSource,
  pretraceMarker,
  classifierInjection,
  'preactivation retry-class classifier and connected negative controls'
);

const hostileForbiddenSetterOccurrences = hostileAdapterSource.split(FORBIDDEN_SETTER_LITERAL).length - 1;
if (hostileForbiddenSetterOccurrences !== 1 || !hostileAdapterSource.includes(INHERITED_FAIL_CLOSED_GUARD)) {
  throw new Error(`Retry-class descendant introduced direct-setter drift; observed ${hostileForbiddenSetterOccurrences} setter-shaped literals.`);
}
if (!hostileAdapterSource.includes('const maxRouteActivationAttempts = 4')
    || !hostileAdapterSource.includes('timeout:4_000')) {
  throw new Error('Retry-class descendant widened attempt or settlement ceilings.');
}

await fs.mkdir(artifactRoot, { recursive:true });
const caseReceipts = [];
const originalEnv = Object.freeze({
  case_id:process.env.TD613_A2_A5_RETRY_CLASS_CASE,
  route:process.env.TD613_A2_A5_RETRY_CLASS_ROUTE,
  artifact_dir:process.env.TD613_ARTIFACT_DIR
});

try {
  for (const negative of CASES) {
    const caseSlug = negative.id.toLowerCase().replaceAll('_', '-');
    const caseDir = path.join(artifactRoot, caseSlug);
    const tempAdapterPath = path.join(scriptsDir, `.ash-a2-a5-retry-class-${caseSlug}-${process.pid}.mjs`);
    await fs.mkdir(caseDir, { recursive:true });
    process.env.TD613_A2_A5_RETRY_CLASS_CASE = negative.id;
    process.env.TD613_A2_A5_RETRY_CLASS_ROUTE = FORCED_ROUTE;
    process.env.TD613_ARTIFACT_DIR = caseDir;

    let caught = null;
    try {
      await fs.writeFile(tempAdapterPath, hostileAdapterSource, 'utf8');
      await import(`${pathToFileURL(tempAdapterPath).href}?td613_a2_a5_retry_class=${negative.id}_${Date.now()}`);
    } catch (error) {
      caught = error;
    } finally {
      await fs.rm(tempAdapterPath, { force:true });
    }

    if (!caught) throw new Error(`${negative.id} unexpectedly completed without the preregistered hard rejection.`);
    if (caught.message !== negative.expected_error) {
      throw new Error(`${negative.id} produced the wrong classifier error: ${caught.message}`);
    }

    const reportPath = path.join(caseDir, 'ash-a2-a6-browser-observation.json');
    const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
    if (report.status === 'PASS') throw new Error(`${negative.id} converted an expected negative control into product PASS.`);
    if (report.error?.message !== negative.expected_error) {
      throw new Error(`${negative.id} report did not preserve the exact classifier rejection.`);
    }

    const observed = report.observations?.preactivation_retry_class_negative;
    const hostile = observed?.hostile;
    const classifier = observed?.classifier_state;
    if (!observed || observed.case_id !== negative.id || observed.expected_route !== FORCED_ROUTE || observed.attempt !== 1) {
      throw new Error(`${negative.id} hostile episode was not recorded at attempt 1.`);
    }
    if (hostile?.performed !== true || hostile.old_connected_after !== true
        || hostile.old_visible_after !== false || hostile.replacement_connected !== true
        || hostile.replacement_route !== FORCED_ROUTE || hostile.replacement_has_native_onclick !== true
        || hostile.canonical_visible_count !== 1 || hostile.canonical_is_replacement !== true
        || hostile.same_dom_instance !== false || hostile.direct_route_api_bypass !== false) {
      throw new Error(`${negative.id} failed canonical connected-stale/replacement ownership geometry: ${JSON.stringify(hostile)}`);
    }
    if (hostile.old_route_after !== negative.expected_stale_route
        || hostile.old_direct_onclick_after !== negative.expected_direct_onclick) {
      throw new Error(`${negative.id} failed its exact stale-owner invalid dimension: ${JSON.stringify(hostile)}`);
    }
    if (classifier?.connected !== true || classifier?.route !== negative.expected_stale_route
        || classifier?.direct_onclick !== negative.expected_direct_onclick) {
      throw new Error(`${negative.id} classifier state drifted: ${JSON.stringify(classifier)}`);
    }
    if (observed.retry_classification_observed !== false || observed.second_attempt_observed !== false
        || observed.classifier_rejection_precedes_focus !== true
        || observed.classifier_rejection_precedes_trace !== true
        || observed.classifier_rejection_precedes_native_activation !== true
        || hostile.native_event_count_before_rejection !== 0) {
      throw new Error(`${negative.id} widened the preactivation rejection boundary.`);
    }
    if (hostile.route_surface_at_classifier === FORCED_ROUTE) {
      throw new Error(`${negative.id} unexpectedly settled ${FORCED_ROUTE} before classifier rejection.`);
    }
    if (report.observations?.semantic_route_activation?.[FORCED_ROUTE]) {
      throw new Error(`${negative.id} minted a completed ${FORCED_ROUTE} activation ledger after hard rejection.`);
    }

    caseReceipts.push(Object.freeze({
      case_id:negative.id,
      expected_error:negative.expected_error,
      exact_error_observed:true,
      hostile_episode_performed:true,
      stale_connected:true,
      stale_route:classifier.route,
      stale_direct_onclick:classifier.direct_onclick,
      replacement_connected:true,
      replacement_is_sole_visible_canonical_owner:true,
      replacement_has_native_onclick:true,
      same_dom_instance:false,
      retry_classification_observed:false,
      second_attempt_observed:false,
      native_event_count_before_rejection:0,
      forced_route_settled:false,
      direct_route_api_bypass:false
    }));
  }
} finally {
  if (originalEnv.case_id === undefined) delete process.env.TD613_A2_A5_RETRY_CLASS_CASE;
  else process.env.TD613_A2_A5_RETRY_CLASS_CASE = originalEnv.case_id;
  if (originalEnv.route === undefined) delete process.env.TD613_A2_A5_RETRY_CLASS_ROUTE;
  else process.env.TD613_A2_A5_RETRY_CLASS_ROUTE = originalEnv.route;
  if (originalEnv.artifact_dir === undefined) delete process.env.TD613_ARTIFACT_DIR;
  else process.env.TD613_ARTIFACT_DIR = originalEnv.artifact_dir;
}

const baseAdapterAfter = await fs.readFile(baseAdapterPath, 'utf8');
if (sha256Utf8(baseAdapterAfter) !== baseAdapterSha256 || baseAdapterAfter !== baseAdapterSource) {
  throw new Error('Inherited A2–A5 observer bytes moved during retry-class discrimination witness.');
}

const receipt = Object.freeze({
  schema:'td613.ash.a2-a5-preactivation-retry-class-discrimination/v0.1-local-only',
  status:'PASS',
  browser:browserName,
  forced_route:FORCED_ROUTE,
  base_adapter_sha256:baseAdapterSha256,
  base_adapter_bytes:baseAdapterBytes,
  inherited_observer_bytes_mutated:false,
  observer_scope:'WITNESS_ONLY_TEMPORARY_DESCENDANT_ADAPTERS',
  product_runtime_mutation:false,
  positive_anchor:'#1067_PRETRACE_CONTROL_DISCONNECTED_REMAINS_INHERITED_A15_AUTHORITY',
  negative_cases:Object.freeze(caseReceipts),
  disconnected_positive_is_retryable:true,
  connected_semantic_drift_is_retryable:false,
  connected_native_owner_loss_is_retryable:false,
  preactivation_exception_swallowing:false,
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

await fs.writeFile(
  path.join(artifactRoot, 'a2-a5-preactivation-retry-class-discrimination-receipt.json'),
  `${JSON.stringify(receipt, null, 2)}\n`,
  'utf8'
);
console.log(`A2-A5 preactivation retry-class discrimination browser witness (${browserName}): PASS`);
