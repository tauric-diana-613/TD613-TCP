import fs from 'node:fs';

function replaceExactly(source, before, after, label) {
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one seam, observed ${count}.`);
  return source.replace(before, after);
}

const shellPath = 'api/dome-world-shell.js';
let shell = fs.readFileSync(shellPath, 'utf8');
if (!shell.includes('ash-deferred-bootstrap')) {
  shell = replaceExactly(
    shell,
    `const ASH_MASS_EVICTION_MARKER = '<meta name="ash-cache-preflight" content="aia3-mass-eviction-v2">';`,
    `const ASH_MASS_EVICTION_MARKER = '<meta name="ash-cache-preflight" content="aia3-mass-eviction-v2">';\nconst ASH_DEFERRED_BOOT_MARKER = '<meta name="ash-deferred-bootstrap" content="v0.1">';`,
    'deferred marker'
  );
  const insertion = `
function deferredAshBoot() {
  const modules = ASH_VERSIONED_MODULES.map(([, versioned]) => versioned);
  return \`${'${ASH_DEFERRED_BOOT_MARKER}'}
  <script type="module" id="td613-ash-deferred-bootstrap-script">
  const preflight=globalThis.__td613AshAia3Preflight;
  if(preflight&&typeof preflight.then==='function') await preflight;
  if(document.readyState==='loading') await new Promise(resolve=>document.addEventListener('DOMContentLoaded',resolve,{once:true}));
  const modules=${'${JSON.stringify(modules)}'};
  for(const module of modules) await import(module);
  document.documentElement.dataset.ashDeferredBoot='complete';
  </script>\`;
}

`;
  shell = replaceExactly(shell, `export function injectMarrowlineLabButton(source = '') {`, `${insertion}export function injectMarrowlineLabButton(source = '') {`, 'deferred bootstrap function');
  shell = replaceExactly(
    shell,
    `  if (!html.includes(ASH_CANONICAL_BOOT_MARKER)) additions.push(canonicalAshBoot());\n  if (additions.length) html = \`${'${html.slice(0, headClose)}'}  ${'${additions.join('\\n  ')}'}\\n${'${html.slice(headClose)}'}\`;\n\n  for (const [sourceModule, versionedModule] of ASH_VERSIONED_MODULES) {\n    const versionedTag = \`src="${'${versionedModule}'}"\`;\n    if (html.includes(versionedTag)) continue;\n    const unversionedTag = \`src="${'${sourceModule}'}"\`;\n    if (!html.includes(unversionedTag)) throw new Error(\`ash-canonical-module-source-missing:${'${sourceModule}'}\`);\n    html = html.replace(unversionedTag, versionedTag);\n  }`,
    `  if (!html.includes(ASH_CANONICAL_BOOT_MARKER)) additions.push(canonicalAshBoot());\n  if (!html.includes(ASH_DEFERRED_BOOT_MARKER)) additions.push(deferredAshBoot());\n  if (additions.length) html = \`${'${html.slice(0, headClose)}'}  ${'${additions.join('\\n  ')}'}\\n${'${html.slice(headClose)}'}\`;\n\n  for (const [sourceModule, versionedModule] of ASH_VERSIONED_MODULES) {\n    const deferredTag = \`data-ash-deferred-module="${'${versionedModule}'}"\`;\n    if (html.includes(deferredTag)) continue;\n    const sourceTag = \`<script type="module" src="${'${sourceModule}'}"></script>\`;\n    const versionedTag = \`<script type="module" src="${'${versionedModule}'}"></script>\`;\n    const replacement = \`<script type="application/x-td613-deferred-module" ${'${deferredTag}'}></script>\`;\n    if (html.includes(sourceTag)) html = html.replace(sourceTag, replacement);\n    else if (html.includes(versionedTag)) html = html.replace(versionedTag, replacement);\n    else throw new Error(\`ash-canonical-module-source-missing:${'${sourceModule}'}\`);\n  }`,
    'module deferral loop'
  );
  shell = replaceExactly(
    shell,
    `  if (!html.includes(ASH_CANONICAL_BOOT_MARKER)) throw new Error('ash-canonical-membrane-first-paint-missing');\n  let cursor = -1;`,
    `  if (!html.includes(ASH_CANONICAL_BOOT_MARKER)) throw new Error('ash-canonical-membrane-first-paint-missing');\n  if (!html.includes(ASH_DEFERRED_BOOT_MARKER)) throw new Error('ash-deferred-bootstrap-missing');\n  if (!html.includes('id="td613-ash-deferred-bootstrap-script"')) throw new Error('ash-deferred-bootstrap-script-missing');\n  let cursor = -1;`,
    'deferred bootstrap validation'
  );
  shell = replaceExactly(
    shell,
    `    if (html.includes(\`src="${'${sourceModule}'}"\`)) throw new Error(\`ash-unversioned-module-survived:${'${sourceModule}'}\`);`,
    `    if (html.includes(\`src="${'${sourceModule}'}"\`) || html.includes(\`src="${'${ASH_VERSIONED_MODULES.find(([source]) => source === sourceModule)?.[1]}'}"\`)) throw new Error(\`ash-executable-module-survived:${'${sourceModule}'}\`);`,
    'executable module rejection'
  );
  fs.writeFileSync(shellPath, shell);
}

const productionFixturePath = 'scripts/prepare-ash-premium-closure-fixture.mjs';
let productionFixture = fs.readFileSync(productionFixturePath, 'utf8');
productionFixture = productionFixture.replace(
  `  await page.waitForURL(url => url.searchParams.get('ash_epoch') === ${'${JSON.stringify(assetEpoch)}'}, { timeout: 60_000 });`,
  `  await page.waitForFunction(expected => new URL(location.href).searchParams.get('ash_epoch') === expected, ${'${JSON.stringify(assetEpoch)}'}, { timeout: 60_000 });`
);
fs.writeFileSync(productionFixturePath, productionFixture);

const witnessPath = 'scripts/ash-keep-aia3-task-journey-v3.mjs';
let witness = fs.readFileSync(witnessPath, 'utf8');
witness = replaceExactly(
  witness,
  `  page.on('console', message => { if (message.type() === 'error') report.console_errors.push({ profile, text:message.text() }); });`,
  `  page.on('console', message => {\n    if (message.type() !== 'error') return;\n    const text=message.text();\n    if(browserName==='firefox'&&/NS_BINDING_ABORTED/.test(text)&&/WorkerMain\\.js/.test(text)){report.expected_worker_aborts.push({profile,text});return;}\n    report.console_errors.push({ profile, text });\n  });`,
  'Firefox worker-abort observer'
);
witness = replaceExactly(
  witness,
  `  authority:{ counts_as_human_evidence:false, authorizes_child_study:false, authorizes_release:false, closes_program:false }`,
  `  expected_worker_aborts:[],\n  authority:{ counts_as_human_evidence:false, authorizes_child_study:false, authorizes_release:false, closes_program:false }`,
  'expected abort receipt'
);
fs.writeFileSync(witnessPath, witness);

const surfaceTestPath = 'tests/ash-keep-live-aia-surface.test.mjs';
let surfaceTest = fs.readFileSync(surfaceTestPath, 'utf8');
surfaceTest = surfaceTest.replace(
  `  assert.match(shell, /location\\.replace/);`,
  `  assert.match(shell, /location\\.replace/);\n  assert.match(shell, /ash-deferred-bootstrap/);\n  assert.match(shell, /application\\/x-td613-deferred-module/);\n  assert.match(shell, /await preflight/);\n  assert.doesNotMatch(shell, /<script type="module" src=/);`
);
fs.writeFileSync(surfaceTestPath, surfaceTest);

console.log('apply-ash-deferred-bootstrap.mjs passed');
