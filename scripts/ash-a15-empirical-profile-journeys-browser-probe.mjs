import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const corePath = path.join(scriptsDir, 'ash-a15-empirical-profile-journeys-browser-probe-core.mjs');
const tempPath = path.join(scriptsDir, `.ash-a15-empirical-profile-journeys-hardened-${process.pid}.mjs`);

const REQUIRED_A15_STATIC_MARKERS = Object.freeze([
  '#premiumPrimaryDock [data-premium-workspace=',
  '[data-aia-route=',
  'ashA15OrientAction',
  'real_profile_hydration:true',
  'real_workspace_navigation:true',
  'navigation_receipt_captured_at_click:true',
  'idempotent_active_workspace_gesture:true',
  'real_route_navigation:true',
  'real_world_answer_gesture:true',
  'HELD_SENSITIVE_CONTEXT',
  '__td613A15NavigationWitness',
  'td613:ash:navigation-receipt',
  'workspaceDiagnostic',
  'workspace_transitions',
  'captured_navigation_receipts',
  'minimum_workspace_transitions_per_profile:4',
  "route_landing_workspace:'work'",
  'browser_process_isolation_per_profile:true',
  'incremental_profile_checkpoints:true',
  'all_profiles_distinct:true',
  '-held.png',
  'await selectRoute(page, route);',
  'await openWorkspace(page, workspace, witness);',
  'await waitForVisibleCombination(page, workspace, route);',
  'const selector = `#premiumPrimaryDock [data-premium-workspace=',
  'if (navigation.changed) workspaceTransitions += 1',
  'captured_navigation_receipts !== result.workspace_transitions',
  "window.addEventListener('td613:ash:navigation-receipt', handler)",
  'const expectedJourneyToken = `ash-a15-empirical-journey:${profile}`',
  'entry.deterministic_test_journey !== expectedJourneyToken',
  'provider_matrix_cells_per_profile:20',
  'result.answers.length !== 20',
  'matrix_cells:snapshot.empirical_matrix_cells',
  'result.matrix_cells !== 120',
  '__td613AshA15EmpiricalJourneys?.compile?.({',
  "context:{ email:'person@example.com' }",
  "result.sensitive_status !== 'HELD_SENSITIVE_CONTEXT'",
  "sensitive_context_rejected:receipts.every(receipt => receipt.sensitive_status === 'HELD_SENSITIVE_CONTEXT')"
]);

function replaceExactly(source, marker, replacement, label) {
  const count = source.split(marker).length - 1;
  if (count !== 1) throw new Error(`${label} expected exactly one marker; observed ${count}`);
  return source.replace(marker, replacement);
}

let source = await fs.readFile(corePath, 'utf8');

source = replaceExactly(
  source,
  `async function inspectProfile(options, profile, mode) {`,
  `function assertClosedWorldAnswer(answer, witness) {
  const authority = answer?.authority;
  const falseFlags = ['custody_changed','source_bytes_moved','raw_content_transport','consequential_action','release_authority','destination_authority'];
  const trueFlags = ['human_review_required','human_closure_required'];
  const postureClosed = answer?.status === 'READY'
    && answer?.action_recognized === true
    && answer?.synthetic_fixture === true
    && answer?.context_imported === false
    && answer?.real_world_claim === false
    && answer?.ontology_exposed === false
    && authority && typeof authority === 'object'
    && falseFlags.every(key => authority[key] === false)
    && trueFlags.every(key => authority[key] === true);
  if (!postureClosed) throw new Error(\`A15 world-answer authority widened: \${JSON.stringify({ witness, answer })}\`);
}

async function inspectProfile(options, profile, mode) {`,
  'A15 closed world-answer authority helper'
);
source = replaceExactly(
  source,
  `        if (!answer || answer.profile !== profile || answer.workspace !== workspace || answer.route !== route) throw new Error(\`A15 \${profile}/\${workspace}/\${route} answer identity drifted: \${JSON.stringify(visible)}\`);
        if (visible.profile_chip !== profile || visible.workspace_chip !== workspace || visible.route_chip !== route) throw new Error(\`A15 \${profile}/\${workspace}/\${route} visible chips drifted: \${JSON.stringify(visible)}\`);
        if (forbiddenPublicLeak(answer)) throw new Error(\`A15 \${profile}/\${workspace}/\${route} leaked forbidden internal content.\`);
        answers.push(answer);`,
  `        if (!answer || answer.profile !== profile || answer.workspace !== workspace || answer.route !== route) throw new Error(\`A15 \${profile}/\${workspace}/\${route} answer identity drifted: \${JSON.stringify(visible)}\`);
        const displayProfile = profile.replaceAll('_', ' ');
        if (visible.profile_chip !== displayProfile || visible.workspace_chip !== workspace || visible.route_chip !== route) throw new Error(\`A15 \${profile}/\${workspace}/\${route} visible chips drifted: \${JSON.stringify({ ...visible, expected_profile_chip:displayProfile })}\`);
        if (visible.visible_text !== answer.message) throw new Error(\`A15 \${profile}/\${workspace}/\${route} visible answer diverged from emitted answer: \${JSON.stringify(visible)}\`);
        assertClosedWorldAnswer(answer, { profile, workspace, route });
        if (forbiddenPublicLeak(answer)) throw new Error(\`A15 \${profile}/\${workspace}/\${route} leaked forbidden internal content.\`);
        answers.push(answer);`,
  'A15 visible answer and authority verification'
);
source = replaceExactly(
  source,
  `function forbiddenPublicLeak(answer) {
  const text = JSON.stringify(answer).toLowerCase();
  return FORBIDDEN.some(token => text.includes(token));
}`,
  `function forbiddenPublicLeak(answer) {
  const { schema, version, ...publicPayload } = answer || {};
  const text = JSON.stringify(publicPayload).toLowerCase();
  return FORBIDDEN.some(token => text.includes(token));
}`,
  'A15 public leak scan metadata exclusion'
);

for (const marker of REQUIRED_A15_STATIC_MARKERS) {
  if (!source.includes(marker)) throw new Error(`A15 historical witness law missing after release hardening: ${marker}`);
}
if (!source.includes("profile.replaceAll('_', ' ')") || !source.includes('visible.visible_text !== answer.message')
    || !source.includes('assertClosedWorldAnswer(answer') || !source.includes('const { schema, version, ...publicPayload }')) {
  throw new Error('A15 empirical witness hardening did not compile into the generated probe.');
}

await fs.writeFile(tempPath, source, 'utf8');
try {
  await import(`${pathToFileURL(tempPath).href}?td613_a15_empirical_hardened=${Date.now()}`);
} finally {
  await fs.unlink(tempPath).catch(() => {});
}
