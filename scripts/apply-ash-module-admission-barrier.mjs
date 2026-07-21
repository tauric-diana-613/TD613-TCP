import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = path => fs.readFileSync(path, 'utf8');
const write = (path, value) => fs.writeFileSync(path, value);

function replaceOne(source, from, to, label) {
  if (source.includes(to)) return source;
  const count = source.split(from).length - 1;
  assert.equal(count, 1, `${label}: expected one seam, observed ${count}`);
  return source.replace(from, to);
}

function replacePattern(source, pattern, replacement, label) {
  if (typeof replacement === 'string' && source.includes(replacement)) return source;
  const matches = source.match(pattern) || [];
  assert.equal(matches.length, 1, `${label}: expected one structural seam, observed ${matches.length}`);
  return source.replace(pattern, replacement);
}

const shellPath = 'api/dome-world-shell.js';
let shell = read(shellPath);
if (!shell.includes('td613-ash-module-admission')) {
  shell = replaceOne(
    shell,
    `const ASH_MASS_EVICTION_MARKER = '<meta name="ash-cache-preflight" content="aia3-mass-eviction-v2">';`,
    `const ASH_MASS_EVICTION_MARKER = '<meta name="ash-cache-preflight" content="aia3-mass-eviction-v2">';\nconst ASH_MODULE_ADMISSION_MARKER = 'td613-ash-module-admission';`,
    'admission marker'
  );
  shell = replaceOne(
    shell,
    `export function injectMarrowlineLabButton(source = '') {`,
    `function ashModuleAdmissionLoader() {\n  const modules = ASH_VERSIONED_MODULES.map(([, versioned]) => versioned);\n  return \`<script type="module" id="\${ASH_MODULE_ADMISSION_MARKER}">\n  await (window.__td613AshAia3Preflight || Promise.resolve());\n  for (const module of \${JSON.stringify(modules)}) await import(module);\n  document.documentElement.dataset.ashModuleAdmission='complete';\n  </script>\`;\n}\n\nexport function injectMarrowlineLabButton(source = '') {`,
    'admission helper'
  );
  shell = replacePattern(
    shell,
    /  for \(const \[sourceModule, versionedModule\] of ASH_VERSIONED_MODULES\) \{[\s\S]*?\n  \}\n\n  const ordered = ASH_VERSIONED_MODULES\.map\(\(\[, versioned\]\) => versioned\);/,
    `  const admissionPresent = html.includes(\`id="\${ASH_MODULE_ADMISSION_MARKER}"\`);\n  for (const [sourceModule, versionedModule] of ASH_VERSIONED_MODULES) {\n    if (admissionPresent && html.includes(versionedModule)) continue;\n    const versionedTag = \`src="\${versionedModule}"\`;\n    if (html.includes(versionedTag)) continue;\n    const unversionedTag = \`src="\${sourceModule}"\`;\n    if (!html.includes(unversionedTag)) throw new Error(\`ash-canonical-module-source-missing:\${sourceModule}\`);\n    html = html.replace(unversionedTag, versionedTag);\n  }\n\n  const ordered = ASH_VERSIONED_MODULES.map(([, versioned]) => versioned);\n  if (!admissionPresent) {\n    for (const module of ordered) {\n      const tag = \`<script type="module" src="\${module}"></script>\`;\n      if (!html.includes(tag)) throw new Error(\`ash-static-entry-module-tag-missing:\${module}\`);\n      html = html.replace(tag, '');\n    }\n    const bodyClose = html.lastIndexOf('</body>');\n    if (bodyClose < 0) throw new Error('ash-keep-body-marker-missing');\n    html = \`\${html.slice(0, bodyClose)}  \${ashModuleAdmissionLoader()}\\n\${html.slice(bodyClose)}\`;\n  }`,
    'module admission loop'
  );
  shell = replaceOne(
    shell,
    `  if (!html.includes(ASH_CANONICAL_BOOT_MARKER)) throw new Error('ash-canonical-membrane-first-paint-missing');`,
    `  if (!html.includes(ASH_CANONICAL_BOOT_MARKER)) throw new Error('ash-canonical-membrane-first-paint-missing');\n  if (!html.includes(\`id="\${ASH_MODULE_ADMISSION_MARKER}"\`)) throw new Error('ash-module-admission-barrier-missing');`,
    'admission validation'
  );
  write(shellPath, shell);
}

const shellTestPath = 'tests/product-architecture/shell.test.mjs';
let shellTest = read(shellTestPath);
shellTest = shellTest.replace(
  `  assert.match(renderedKeep, new RegExp(\`src="\${module.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')}"\`));`,
  `  assert.match(renderedKeep, new RegExp(module.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')));`
);
if (!shellTest.includes('td613-ash-module-admission')) {
  shellTest = shellTest.replace(
    `assert.match(renderedKeep, /name="ash-cache-preflight" content="aia3-mass-eviction-v2"/);`,
    `assert.match(renderedKeep, /id="td613-ash-module-admission"/);\nassert.match(renderedKeep, /await \\(window\\.__td613AshAia3Preflight \\|\\| Promise\\.resolve\\(\\)\\)/);\nfor (const module of versionedModules) assert.doesNotMatch(renderedKeep, new RegExp(\`<script[^>]+src="\${module.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')}"\`));\nassert.match(renderedKeep, /name="ash-cache-preflight" content="aia3-mass-eviction-v2"/);`
  );
}
write(shellTestPath, shellTest);

const bridgeTestPath = 'tests/ash-custody-workspace-bridge.test.mjs';
let bridgeTest = read(bridgeTestPath);
bridgeTest = bridgeTest.replace(
  /assert\.match\(renderedHtml, new RegExp\(`src="\/dome-world\/ash-workspace-bridge\\\\\.js\\\\\?v=\$\{ASH_LIFECYCLE_ASSET_EPOCH\}"`\)\);/,
  `assert.match(renderedHtml, new RegExp(\`/dome-world/ash-workspace-bridge\\\\.js\\\\?v=\${ASH_LIFECYCLE_ASSET_EPOCH}\`));\nassert.doesNotMatch(renderedHtml, new RegExp(\`<script[^>]+src="/dome-world/ash-workspace-bridge\\\\.js\\\\?v=\${ASH_LIFECYCLE_ASSET_EPOCH}"\`));`
);
bridgeTest = bridgeTest.replace(
  `'Custody bridge must load after lifecycle injection has created the late workspace tab'`,
  `'Custody bridge must remain ordered after lifecycle inside the deferred admission list'`
);
write(bridgeTestPath, bridgeTest);

const ingressTestPath = 'tests/ash-live-ingress-demos-cache.test.mjs';
let ingressTest = read(ingressTestPath);
if (!ingressTest.includes('id="td613-ash-module-admission"')) {
  ingressTest = replacePattern(
    ingressTest,
    /for \(const source of \['ash-keep\.js', 'ash-convergence\.js', 'ash-lifecycle\.js', 'ash-workspace-bridge\.js', 'ash-case-controls\.js'\]\) \{[\s\S]*?\n\}/,
    `assert.match(renderedKeep, /id="td613-ash-module-admission"/);\nfor (const source of ['ash-keep.js', 'ash-convergence.js', 'ash-lifecycle.js', 'ash-workspace-bridge.js', 'ash-case-controls.js']) {\n  assert.match(renderedKeep, new RegExp(\`/dome-world/\${source.replace('.', '\\\\.')}\\\\?v=20260720-aia3-mass-eviction-v2\`));\n  assert.doesNotMatch(renderedKeep, new RegExp(\`<script[^>]+src="/dome-world/\${source.replace('.', '\\\\.')}\\\\?v=20260720-aia3-mass-eviction-v2"\`));\n}`,
    'ingress deferred module law'
  );
}
write(ingressTestPath, ingressTest);

const fixturePath = 'scripts/prepare-ash-premium-closure-fixture.mjs';
let fixture = read(fixturePath);
fixture = replacePattern(
  fixture,
  /const navigationReplacement = `[\s\S]*?`;\n\nconst cleanArrivalTarget/,
  `const navigationReplacement = \`  await page.goto(keepUrl, { waitUntil: 'networkidle', timeout: 60_000 });\n  // ASH_AIA3_LEGACY_BYPASS_STABLE: rollback loads exact legacy work without an AIA eviction reload.\n  await page.waitForFunction(() => window.__td613AshAia3PreflightReceipt?.legacy_bypass === true\n    && document.documentElement.dataset.ashCachePreflight === 'complete', null, { timeout: 60_000 });\`;\n\nconst cleanArrivalTarget`,
  'legacy closure navigation'
);
fixture = fixture.replace(/const maintenanceEntries = \{[\s\S]*?\n\};/, `const maintenanceEntries = {};`);
fixture = fixture.replace(`const navigationMarker = 'ASH_AIA3_MASS_EVICTION_STABLE';`, `const navigationMarker = 'ASH_AIA3_LEGACY_BYPASS_STABLE';`);
fixture = fixture.replace(`  cache_navigation_required:true,\n  active_document_replacement_allowed:'ONE_EXACT_ASH_EPOCH_REPLACEMENT',`, `  cache_navigation_required:false,\n  active_document_replacement_allowed:false,`);
write(fixturePath, fixture);

const witnessPath = 'scripts/ash-keep-aia3-task-journey-v3.mjs';
let witness = read(witnessPath);
if (!witness.includes('expected_worker_aborts')) {
  witness = replaceOne(
    witness,
    `  page.on('console', message => { if (message.type() === 'error') report.console_errors.push({ profile, text:message.text() }); });`,
    `  page.on('console', message => {\n    if (message.type() !== 'error') return;\n    const text = message.text();\n    if (browserName === 'firefox' && /NS_BINDING_ABORTED/.test(text) && /WorkerMain\\.js/.test(text)) {\n      report.expected_worker_aborts.push({ profile, text });\n      return;\n    }\n    report.console_errors.push({ profile, text });\n  });`,
    'Firefox worker-abort boundary'
  );
  witness = replaceOne(
    witness,
    `  authority:{ counts_as_human_evidence:false, authorizes_child_study:false, authorizes_release:false, closes_program:false }`,
    `  expected_worker_aborts:[],\n  authority:{ counts_as_human_evidence:false, authorizes_child_study:false, authorizes_release:false, closes_program:false }`,
    'expected worker-abort receipt'
  );
}
write(witnessPath, witness);

const surfaceTestPath = 'tests/ash-keep-live-aia-surface.test.mjs';
let surfaceTest = read(surfaceTestPath);
if (!surfaceTest.includes('module admission barrier')) {
  surfaceTest = surfaceTest.replace(
    `  assert.match(shell, /location\\.replace/);`,
    `  assert.match(shell, /location\\.replace/);\n  assert.match(shell, /td613-ash-module-admission/);\n  assert.match(shell, /await \\(window\\.__td613AshAia3Preflight \\|\\| Promise\\.resolve\\(\\)\\)/);\n  assert.doesNotMatch(shell, /<script type="module" src=/);`
  );
}
write(surfaceTestPath, surfaceTest);

console.log('apply-ash-module-admission-barrier.mjs passed');
