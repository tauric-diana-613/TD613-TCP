import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const artifactDir = path.resolve(process.env.TD613_PROFILE_CLOSURE_FIXTURE_RUNTIME_DIR || 'artifacts/ash-keep-probe-runtime');
const sourceUrl = new URL('./prepare-ash-profile-closure-fixture.source.txt', import.meta.url);
const runtimePath = path.join(artifactDir, 'prepare-ash-profile-closure-fixture.runtime.mjs');

const requiredMarkers = Object.freeze([
  'function isConvergencePrepared',
  "selectOption('political_campaign')",
  'profile_demo_registry_ready: true',
  'profile_selected_explicitly: true',
  "window.__td613AshProfileDemos?.profiles?.includes('political_campaign')",
  'Harbor City Mayoral Campaign',
  'source_files_mutated_in_ephemeral_ci_checkout_only: true',
  'production_product_mutated: false'
]);

const pathTarget = `const convergenceRunnerPath = path.join(here, 'run-ash-constitutional-convergence-probe.mjs');`;
const pathReplacement = `${pathTarget}\nconst convergenceSourcePath = path.join(here, 'ash-five-demo-convergence-compiler.source.txt');`;

const blockTarget = `const originalConvergenceRunner = (await fs.readFile(convergenceRunnerPath, 'utf8')).replace(/\\r\\n/g, '\\n');
let preparedConvergenceRunner = originalConvergenceRunner;
let convergencePosture = 'ALREADY_PREPARED';
if (!isConvergencePrepared(originalConvergenceRunner)) {
  convergencePosture = 'PREPARED_NOW';
  preparedConvergenceRunner = replaceExactlyOnce(originalConvergenceRunner, convergenceReplacement);
}
if (!isConvergencePrepared(preparedConvergenceRunner)) throw new Error('Convergence profile fixture did not materialize its campaign-method seam.');
if (preparedConvergenceRunner !== originalConvergenceRunner) await fs.writeFile(convergenceRunnerPath, preparedConvergenceRunner, 'utf8');`;

const blockReplacement = `const originalConvergenceRunner = (await fs.readFile(convergenceRunnerPath, 'utf8')).replace(/\\r\\n/g, '\\n');
let originalConvergenceSource = '';
try {
  originalConvergenceSource = (await fs.readFile(convergenceSourcePath, 'utf8')).replace(/\\r\\n/g, '\\n');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}
const combinedConvergenceSource = \`\${originalConvergenceRunner}\\n\${originalConvergenceSource}\`;
let preparedConvergenceRunner = originalConvergenceRunner;
let convergencePosture = originalConvergenceSource ? 'SERIALIZED_COMPILER_SOURCE_READY' : 'ALREADY_PREPARED';
if (!isConvergencePrepared(combinedConvergenceSource)) {
  convergencePosture = 'PREPARED_NOW';
  preparedConvergenceRunner = replaceExactlyOnce(originalConvergenceRunner, convergenceReplacement);
}
if (!isConvergencePrepared(\`\${preparedConvergenceRunner}\\n\${originalConvergenceSource}\`)) throw new Error('Convergence profile fixture did not materialize its campaign-method seam.');
if (preparedConvergenceRunner !== originalConvergenceRunner) await fs.writeFile(convergenceRunnerPath, preparedConvergenceRunner, 'utf8');`;

const replaceOne = (source, target, replacement, label) => {
  const count = source.split(target).length - 1;
  if (count !== 1) throw new Error(`Five-demo profile fixture expected one ${label}; observed ${count}.`);
  return source.replace(target, replacement);
};

await fs.mkdir(artifactDir, { recursive: true });
let source = await fs.readFile(sourceUrl, 'utf8');
for (const marker of requiredMarkers) {
  if (!source.includes(marker)) throw new Error(`Five-demo profile fixture source omitted ${marker}.`);
}
source = replaceOne(source, pathTarget, pathReplacement, 'serialized compiler source path');
source = replaceOne(source, blockTarget, blockReplacement, 'serialized compiler inspection block');
if (!source.includes('SERIALIZED_COMPILER_SOURCE_READY') || !source.includes('combinedConvergenceSource')) {
  throw new Error('Five-demo profile fixture failed to materialize serialized compiler inspection.');
}
await fs.writeFile(runtimePath, source, 'utf8');
await import(`${pathToFileURL(runtimePath).href}?five_demo_fixture_aftercare=${Date.now()}`);
