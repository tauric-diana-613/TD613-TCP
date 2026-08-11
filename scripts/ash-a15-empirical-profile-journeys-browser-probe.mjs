import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const corePath = path.join(scriptsDir, 'ash-a15-empirical-profile-journeys-browser-probe-core.mjs');
const tempPath = path.join(scriptsDir, `.ash-a15-empirical-profile-journeys-hardened-${process.pid}.mjs`);

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

if (!source.includes("profile.replaceAll('_', ' ')")
    || !source.includes('visible.visible_text !== answer.message')
    || !source.includes('assertClosedWorldAnswer(answer')
    || !source.includes('const { schema, version, ...publicPayload }')) {
  throw new Error('A15 empirical witness hardening did not compile into the generated probe.');
}

await fs.writeFile(tempPath, source, 'utf8');
try {
  await import(`${pathToFileURL(tempPath).href}?td613_a15_empirical_hardened=${Date.now()}`);
} finally {
  await fs.unlink(tempPath).catch(() => {});
}
