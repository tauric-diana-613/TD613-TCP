import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const write = (file, content) => {
  const target = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
};
const remove = (file) => fs.rmSync(path.join(ROOT, file), { force: true, recursive: true });
const move = (source, destination) => {
  const from = path.join(ROOT, source);
  const to = path.join(ROOT, destination);
  if (!fs.existsSync(from)) throw new Error(`missing source for move: ${source}`);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.renameSync(from, to);
};

fs.mkdirSync(path.join(ROOT, 'server'), { recursive: true });

for (const [source, destination] of [
  ['api/hush-generate-budgeted.js', 'server/hush-generate-budgeted.js'],
  ['api/gemini-model-policy.js', 'server/gemini-model-policy.js'],
  ['api/hush-generate-quality.js', 'server/hush-generate-quality.js'],
  ['api/hush-generate-strict.js', 'server/hush-generate-strict.js'],
  ['api/hush-generate-review-map-guard.js', 'server/hush-generate-review-map-guard.js'],
  ['api/hush-strict-receipt-meta.js', 'server/hush-strict-receipt-meta.js'],
  ['api/gemini-readiness.js', 'server/gemini-readiness.js'],
  ['api/khonapolit-quality.js', 'server/khonapolit-quality.js']
]) move(source, destination);

write('api/hush-generate-quality.js', "export { default } from '../server/hush-generate-quality.js';\nexport * from '../server/hush-generate-quality.js';\n");
write('api/hush-generate-strict.js', "export { default } from '../server/hush-generate-strict.js';\nexport * from '../server/hush-generate-strict.js';\n");
write('api/gemini-readiness.js', "export { default } from '../server/gemini-readiness.js';\nexport * from '../server/gemini-readiness.js';\n");
write('api/khonapolit.js', "// Canonical Kʰonapolit boundary. Implementation lives outside /api so one route consumes one Vercel function.\nexport { default } from '../server/khonapolit-quality.js';\nexport * from '../server/khonapolit-quality.js';\n");

remove('api/hush-generate.js');
remove('api/hush-generate-strict-pr124.js');
remove('api/khonapolit-quality.js');

const vercel = JSON.parse(read('vercel.json'));
delete vercel.functions['api/hush-generate.js'];
delete vercel.functions['api/khonapolit-quality.js'];
vercel.rewrites = (vercel.rewrites || []).filter((entry) => entry.source !== '/api/khonapolit');

function insertRewriteBeforeCatchAll(source, destination) {
  if (vercel.rewrites.some((entry) => entry.source === source)) return;
  const catchAll = vercel.rewrites.findIndex((entry) => entry.source === '/api/(.*)');
  const entry = { source, destination };
  if (catchAll < 0) vercel.rewrites.push(entry);
  else vercel.rewrites.splice(catchAll, 0, entry);
}

function ensureNoStoreHeader(source) {
  vercel.headers ||= [];
  if (vercel.headers.some((entry) => entry.source === source)) return;
  vercel.headers.push({
    source,
    headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }]
  });
}

insertRewriteBeforeCatchAll('/api/hush-generate-strict-pr124', '/api/hush-generate-strict');
insertRewriteBeforeCatchAll('/api/khonapolit-quality', '/api/khonapolit');
ensureNoStoreHeader('/api/hush-generate-strict-pr124');
ensureNoStoreHeader('/api/khonapolit-quality');
write('vercel.json', `${JSON.stringify(vercel, null, 2)}\n`);

const replacements = new Map([
  ['api/hush-generate-budgeted.js', 'server/hush-generate-budgeted.js'],
  ['api/gemini-model-policy.js', 'server/gemini-model-policy.js'],
  ['api/khonapolit-quality.js', 'server/khonapolit-quality.js'],
  ['api/hush-generate-review-map-guard.js', 'server/hush-generate-review-map-guard.js'],
  ['api/hush-strict-receipt-meta.js', 'server/hush-strict-receipt-meta.js']
]);
const textExtensions = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.json', '.md', '.yml', '.yaml', '.txt']);
function rewriteReferences(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', '.github', 'node_modules', 'api', 'server'].includes(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      rewriteReferences(full);
      continue;
    }
    if (full === path.join(ROOT, 'vercel.json') || !textExtensions.has(path.extname(entry.name))) continue;
    const content = fs.readFileSync(full, 'utf8');
    let next = content;
    for (const [before, after] of replacements) next = next.split(before).join(after);
    if (next !== content) fs.writeFileSync(full, next);
  }
}
rewriteReferences(ROOT);

let hushRouterTest = read('tests/hush-gemini-quality-router.test.mjs');
hushRouterTest = hushRouterTest.replace(
  "const source = fs.readFileSync('api/hush-generate-quality.js', 'utf8');",
  "const source = fs.readFileSync('server/hush-generate-quality.js', 'utf8');"
);
write('tests/hush-gemini-quality-router.test.mjs', hushRouterTest);

let expressiveTest = read('tests/hush-phase34-expressive-generation.test.mjs');
expressiveTest = expressiveTest.replace(
  "const proxy = fs.readFileSync('api/hush-generate.js', 'utf8');",
  "const proxy = fs.readFileSync('server/hush-generate-quality.js', 'utf8');"
);
write('tests/hush-phase34-expressive-generation.test.mjs', expressiveTest);

let hygiene = read('tests/vercel-deploy-hygiene.test.mjs');
hygiene = hygiene.replace(
  "const configuredFunctions = Object.keys(vercel.functions || {}).sort();",
  `const configuredFunctions = Object.keys(vercel.functions || {}).sort();\nconst deployedApiFiles = [];\nfunction collectApiFiles(directory, prefix = '') {\n  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {\n    const relative = prefix ? \`${'${prefix}'}/${'${entry.name}'}\` : entry.name;\n    const full = \`${'${directory}'}/${'${entry.name}'}\`;\n    if (entry.isDirectory()) collectApiFiles(full, relative);\n    else if (!entry.name.startsWith('_') && !entry.name.startsWith('.') && !entry.name.endsWith('.d.ts')) deployedApiFiles.push(relative);\n  }\n}\ncollectApiFiles('api');\ndeployedApiFiles.sort();`
);
hygiene = hygiene.replace(
  "assert.ok(configuredFunctions.length <= 12, `configured Vercel function budget exceeded: ${configuredFunctions.length}/12 — ${configuredFunctions.join(', ')}`);",
  "assert.ok(configuredFunctions.length <= 11, `configured Vercel function operating budget exceeded: ${configuredFunctions.length}/11 — ${configuredFunctions.join(', ')}`);\nassert.equal(deployedApiFiles.length, 11, `deployed Vercel function operating budget must remain 11 active + 1 reserved: ${deployedApiFiles.length}/11 — ${deployedApiFiles.join(', ')}`);\nassert.ok(!deployedApiFiles.includes('hush-generate-strict-pr124.js'), 'retired PR124 function must remain absent');\nassert.ok(!deployedApiFiles.includes('hush-generate.js'), 'rewritten Hush alias must not allocate a function');\nassert.ok(!deployedApiFiles.includes('hush-generate-budgeted.js'), 'budgeted Hush implementation must remain outside /api');\nassert.ok(!deployedApiFiles.includes('hush-generate-review-map-guard.js'), 'review-map helper must remain outside /api');\nassert.ok(!deployedApiFiles.includes('hush-strict-receipt-meta.js'), 'strict receipt helper must remain outside /api');\nassert.ok(!deployedApiFiles.includes('khonapolit-quality.js'), 'Kʰonapolit quality implementation must remain outside /api');"
);
hygiene = hygiene.replace("assert.equal(vercel.functions?.['api/hush-generate.js']?.maxDuration, 60);\n", '');
hygiene = hygiene.replace(
  "assertRewrite('/api/dome-world-engine', '/api/dome-world-engine-guard');",
  "assertRewrite('/api/dome-world-engine', '/api/dome-world-engine-guard');\nassertRewrite('/api/hush-generate-strict-pr124', '/api/hush-generate-strict');\nassertRewrite('/api/khonapolit-quality', '/api/khonapolit');"
);
hygiene = hygiene.replace(
  "assertRewriteBefore('/api/dome-world-engine', '/api/(.*)');",
  "assertRewriteBefore('/api/dome-world-engine', '/api/(.*)');\nassertRewriteBefore('/api/hush-generate-strict-pr124', '/api/(.*)');\nassertRewriteBefore('/api/khonapolit-quality', '/api/(.*)');"
);
hygiene = hygiene.replace(
  "console.log(`vercel-deploy-hygiene.test.mjs passed with ${configuredFunctions.length}/12 configured functions`);",
  "console.log(`vercel-deploy-hygiene.test.mjs passed with ${deployedApiFiles.length}/11 deployed functions and ${configuredFunctions.length} configured overrides`);"
);
write('tests/vercel-deploy-hygiene.test.mjs', hygiene);

write('tests/gemini-quality-routing-vercel.test.mjs', `import assert from 'node:assert/strict';
import fs from 'node:fs';

const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const khonapolitEntry = fs.readFileSync('api/khonapolit.js', 'utf8');
const rewrites = vercel.rewrites || [];
const rewrite = (source) => rewrites.find((entry) => entry.source === source);
const before = (earlier, later) => {
  const a = rewrites.findIndex((entry) => entry.source === earlier);
  const b = rewrites.findIndex((entry) => entry.source === later);
  assert.ok(a >= 0, \`missing ${'${earlier}'}\`);
  assert.ok(b >= 0, \`missing ${'${later}'}\`);
  assert.ok(a < b, \`${'${earlier}'} must precede ${'${later}'}\`);
};

assert.equal(vercel.functions['api/hush-generate-quality.js']?.maxDuration, 60);
assert.equal(vercel.functions['api/khonapolit.js']?.maxDuration, 60);
assert.equal(vercel.functions['api/gemini-readiness.js']?.maxDuration, 20);
assert.ok(!vercel.functions['api/hush-generate.js']);
assert.ok(!vercel.functions['api/khonapolit-quality.js']);

assert.equal(rewrite('/api/hush-generate')?.destination, '/api/hush-generate-quality');
assert.equal(rewrite('/api/hush-generate-budgeted')?.destination, '/api/hush-generate-quality');
assert.equal(rewrite('/api/hush-generate-strict-pr124')?.destination, '/api/hush-generate-strict');
assert.equal(rewrite('/api/khonapolit'), undefined);
assert.equal(rewrite('/api/khonapolit-quality')?.destination, '/api/khonapolit');
assert.equal(rewrite('/api/dome-world/khonapolit')?.destination, '/api/khonapolit');
assert.match(khonapolitEntry, /server\\/khonapolit-quality\\.js/);

before('/api/hush-generate', '/api/(.*)');
before('/api/hush-generate-budgeted', '/api/(.*)');
before('/api/hush-generate-strict-pr124', '/api/(.*)');
before('/api/khonapolit-quality', '/api/(.*)');
before('/api/dome-world/khonapolit', '/api/dome-world/(.*)');

for (const source of ['/api/hush-generate', '/api/hush-generate-budgeted', '/api/hush-generate-quality', '/api/gemini-readiness', '/api/khonapolit', '/api/khonapolit-quality']) {
  const header = (vercel.headers || []).find((entry) => entry.source === source);
  const value = header?.headers?.find((item) => String(item.key).toLowerCase() === 'cache-control')?.value || '';
  assert.match(value, /no-store/);
}

console.log('gemini-quality-routing-vercel.test.mjs passed');
`);

write('docs/VERCEL_FUNCTION_BUDGET_REPAIR_2026-07-16.md', `# Vercel function-budget repair · 2026-07-16

## Failure received

The production deployment at commit \`8b42bc1\` was rejected by the Vercel Hobby-plan ceiling because the repository exposed more than twelve deployable files under the root \`api/\` directory while the deployment test counted only entries explicitly listed in \`vercel.json.functions\`.

## Repair

- Restored the TD613 operating budget to **11 deployable functions** with **1 reserved slot**.
- Moved shared Gemini/Hush/Kʰonapolit implementations, helper guards, receipt metadata, and model-policy utilities to \`server/\`.
- Preserved public routes through four thin \`api/\` boundary wrappers.
- Retired \`api/hush-generate-strict-pr124.js\` while preserving its legacy URL as a rewrite to \`/api/hush-generate-strict\`.
- Removed the redundant \`api/hush-generate.js\` function while retaining its rewrite to \`/api/hush-generate-quality\`.
- Collapsed Kʰonapolit onto the canonical \`/api/khonapolit\` function while preserving \`/api/khonapolit-quality\` as an alias rewrite.
- Strengthened deployment hygiene so CI counts actual deployable \`api/\` files rather than only configured overrides.

## Governing count

\`11 active + 1 reserved = 12 absolute ceiling\`

Marked ⟐
`);

console.log('Vercel function budget repaired to exactly 11 deployable /api files.');
