import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const write = (relative, content) => fs.writeFileSync(path.join(root, relative), content);

function replaceOnce(content, search, replacement, label) {
  if (!content.includes(search)) throw new Error(`Ash lifecycle transform could not find ${label}.`);
  return content.replace(search, replacement);
}

function patchIndex() {
  const file = 'app/dome-world/index.html';
  let html = read(file);
  const oldTab = '<button class="tab" data-view="ash" data-sigil="下"><small>04</small><span>Ash</span></button>';
  const newTab = '<a class="tab" href="/dome-world/ash-threshold.html" data-view="ash" data-sigil="下" style="text-decoration:none"><small>04</small><span>Ash</span></a>';
  if (html.includes(oldTab)) html = html.replace(oldTab, newTab);
  if (!html.includes('href="/dome-world/ash-threshold.html" data-view="ash"')) throw new Error('Ash threshold navigation was not installed.');

  const compatibilitySection = `<section id="ash" class="view primary-view" data-glyph="下"><div class="view-intro"><div><div class="view-overline">下 / custody begins after the threshold</div><h2>Ash Threshold</h2><p>Clear arrival, boundary, and custody as distinct laws, then enter Ash Keep. Quick Scan remains a readiness operation inside the Keep; custody becomes the case root.</p></div><div class="view-telemetry"><span><b>0</b>raw text</span><span><b>SESSION</b>readiness</span><span><b>KEEP</b>primary</span></div></div><div class="grid"><div class="panel"><h3>Enter the Ash lifecycle</h3><p class="sub">The threshold performs no custody registration. Ash Keep binds a verified root into the Case Map and carries it through Rebuild, Draft, Release, Save Point, and Capsule.</p><div class="actions"><a class="btn primary" href="/dome-world/ash-threshold.html">Enter Ash</a><a class="btn" href="/dome-world/ash-keep.html">Open existing Keep</a></div><p class="claim">Arrival ≠ consent; readiness ≠ custody; custody ≠ authenticity; continuity ≠ transport.</p></div><aside class="panel rel"><canvas id="ashCanvas" aria-label="Ash custody threshold field"></canvas><div class="legend"><span style="color:var(--cyan)">△ arrival boundary</span><br><span style="color:var(--gold)">◇ custody root</span><br><span style="color:var(--rose)">● held transition</span><br><span style="color:var(--violet)">∙ Quick Scan compatibility</span></div></aside></div><div hidden aria-hidden="true"><input id="ashArtifactId"><select id="ashClass"><option>sensitive-document</option></select><input id="ashMediaType" value="application/octet-stream"><input id="ashByteLength"><button id="runAsh"></button><button id="copyAsh"></button><button id="downloadAsh"></button></div><pre id="ashPre" hidden></pre></section>`;
  const ashSection = /<section id="ash" class="view primary-view" data-glyph="下">.*?<\/section>/s;
  if (ashSection.test(html)) html = html.replace(ashSection, compatibilitySection);
  if (!html.includes('<h2>Ash Threshold</h2>')) throw new Error('Visible Ash threshold compatibility section was not installed.');
  html = html.replace("ash:'Ash / readiness membrane'", "ash:'Ash / custody threshold'");
  write(file, html);
}

function patchKeep() {
  const file = 'app/dome-world/ash-keep.html';
  let html = read(file);
  if (!html.includes('name="ash-lifecycle"')) {
    html = replaceOnce(html, '<meta name="theme-color" content="#04130f">', '<meta name="theme-color" content="#04130f">\n  <meta name="ash-lifecycle" content="v0.1">', 'Ash Keep theme meta');
  }
  if (!html.includes('/dome-world/ash-lifecycle.js')) {
    html = replaceOnce(html, '<script type="module" src="/dome-world/ash-keep.js"></script>', '<script type="module" src="/dome-world/ash-keep.js"></script>\n  <script type="module" src="/dome-world/ash-lifecycle.js"></script>', 'Ash Keep core script');
  }
  write(file, html);
}

function patchLifecycleEngine() {
  const file = 'app/engine/ash-lifecycle.js';
  let source = read(file);
  source = source.replace(
    "record.readiness_digest = await canonicalDigest(DIGEST_DOMAIN_READINESS, { ...record, readiness_digest: undefined }, options);",
    "const readinessSubject = { ...record };\n  delete readinessSubject.readiness_digest;\n  record.readiness_digest = await canonicalDigest(DIGEST_DOMAIN_READINESS, readinessSubject, options);"
  );
  source = source.replace(
    "record.lifecycle_digest = await canonicalDigest(DIGEST_DOMAIN_LIFECYCLE, { ...record, lifecycle_digest: undefined }, options);",
    "const lifecycleSubject = { ...record };\n  delete lifecycleSubject.lifecycle_digest;\n  record.lifecycle_digest = await canonicalDigest(DIGEST_DOMAIN_LIFECYCLE, lifecycleSubject, options);"
  );
  write(file, source);
}

function patchPackage() {
  const file = 'package.json';
  const pkg = JSON.parse(read(file));
  const additions = ['node tests/ash-lifecycle.test.mjs', 'node tests/ash-product-architecture.test.mjs'];
  let command = pkg.scripts['test:ash-keep'];
  for (const addition of additions) if (!command.includes(addition)) command += ` && ${addition}`;
  pkg.scripts['test:ash-keep'] = command;
  write(file, `${JSON.stringify(pkg, null, 2)}\n`);
}

function patchLedger() {
  const file = 'docs/ASH_KEEP_BUILDOUT_LEDGER.md';
  let doc = read(file);
  if (doc.includes('<!-- ASH_LIFECYCLE_ORCHESTRATION -->')) return;
  doc = doc.replace('Ledger generation: `v0.8 · post-matched-benign-control-bank`', 'Ledger generation: `v0.9 · Ash lifecycle orchestration candidate`');
  doc = doc.replace('Tracked program: Ash Keep / Choir Test / anisotropic disclosure research program', 'Tracked program: Ash product lifecycle / Ash Keep / Choir Test / anisotropic disclosure research program');
  doc = doc.replace('Latest scored transition: PR `#295`, merged at `378bf0f1a81b6aa7b9ebe8379ca207d6f1f36925`', 'Latest merged scored transition: PR `#295`, merged at `378bf0f1a81b6aa7b9ebe8379ca207d6f1f36925`\n\nCandidate transition: `agent/ash-threshold-custody-well` · production evidence pending');
  doc = doc.replace('| G. Destination-bound transport | 7 / 45 | **7 / 45** | **16%** | `HELD / SCAFFOLDED` |', '| G. Destination-bound transport | 7 / 45 | **7 / 45** | **16%** | `HELD / SCAFFOLDED` |\n| H. Ash product lifecycle orchestration | 0 / 35 | **21 / 35** | **60%** | Candidate `IMPLEMENTED_VALIDATION_GATED`; production gate absent |');
  doc = doc.replace('program maturity on main = 123 / 295 ≈ 42%\nproduction-demonstrated workstreams = 1 / 7', 'program maturity on main = 123 / 295 ≈ 42%\ncandidate branch including lifecycle = 144 / 330 ≈ 44%\nproduction-demonstrated workstreams = 1 / 8');
  doc = doc.replace('- v0.8 adds two points because B12 moved from 2 to 4.', '- v0.8 adds two points because B12 moved from 2 to 4.\n- v0.9 adds a distinct 35-point product-lifecycle workstream. It does not transfer Ash Keep production status to the new threshold, custody binding, or lifecycle gates.');

  const section = `<!-- ASH_LIFECYCLE_ORCHESTRATION -->
# H. Ash product lifecycle orchestration

Status: candidate \`IMPLEMENTED_VALIDATION_GATED\`

Score: \`21 / 35\`

This workstream exists because production closure of Ash Keep did not prove that arrival, readiness, custody, case work, release, and continuity formed one governed product sequence.

\`\`\`text
ARRIVAL_UNPERSISTED
→ READINESS_OBSERVED
→ CUSTODY_ROOT_PROVISIONAL / CUSTODY_ROOT_VERIFIED
→ CASE_BOUND
→ REBUILD_ELIGIBLE
→ RELEASE_ELIGIBLE
→ CONTINUITY_SEALED
\`\`\`

| ID | Buildout | Score | Status | Bring forward |
| --- | --- | ---: | --- | --- |
| H1 | Dome Ash tab routes to an art-forward threshold; arrival remains unpersisted | 4 | \`IMPLEMENTED_VALIDATION_GATED\` | Production/mobile probe required. |
| H2 | Quick Scan readiness receipt rejects raw content and preserves readiness ≠ custody | 4 | \`IMPLEMENTED_VALIDATION_GATED\` | Bind Aperture diagnostics terminology to the compatibility label. |
| H3 | v0.8 L0/L1 custody registration and browser digest verification integrated into Keep | 3 | \`PARTIAL_TESTED_COMPONENT\` | Live API and failure-path browser evidence required. |
| H4 | Verified custody receipt becomes Case Map root node and changes \`case_map_digest\` | 4 | \`IMPLEMENTED_VALIDATION_GATED\` | Probe reload, rebinding, and stale-test invalidation. |
| H5 | Rooms, Routes, Test, Draft release, and custody review use lifecycle gates | 3 | \`PARTIAL_TESTED_COMPONENT\` | Complete interaction and accessibility receipts. |
| H6 | Save Point and Capsule inherit custody through the committed Case Map | 3 | \`PARTIAL_TESTED_COMPONENT\` | Demonstrate encrypted round trip with custody-bound root. |
| H7 | Deployed production demonstration, mobile evidence, artifact digest, and promotion gate | 0 | \`UNIMPLEMENTED\` | Required before production status. |

The architecture changes downstream work:

- Safe Harbor → Ash must enter through the custody-root ingress, not a generic Ash node.
- Custodian Return must restore the lifecycle root and its provenance, not merely reopen a Capsule.
- Aperture may retain \`ash-readiness\` as a machine contract while presenting Quick Scan on human surfaces.
- Destination transport must require \`RELEASE_ELIGIBLE\`; a release receipt by itself is insufficient.

---

`;
  doc = doc.replace('# Forward completion order', `${section}# Forward completion order`);
  doc = doc.replace(/# Forward completion order\n\n```text[\s\S]*?```/, `# Forward completion order

\`\`\`text
1. Merge and production-demonstrate Ash lifecycle orchestration
2. Bind Choir calibration gates to matched-control receipt references
3. Build higher-order interference separately
4. Build ordered route-sequence recovery separately
5. Build temporal and delayed-disclosure assays separately
6. Externalize Hush discourse vocabulary
7. Build Hush intervention ensemble
8. Build Custodian Return Test around the custody-bound lifecycle root
9. Refactor Aperture wiring before Choir UI
10. Build Safe Harbor → Ash custody-root adapter
11. Add independent provenance adapters
12. Design destination-bound transport last
\`\`\``);
  doc = doc.replace(/## Immediate next packet[\s\S]*?## Final ruling/, `## Immediate next packet

Production-demonstrate the new Ash lifecycle rather than inheriting Ash Keep's prior production status:

- click Ash from Dome-World and verify threshold routing;
- prove no persistence or network activity before the clearing gesture;
- preserve reduced-motion and mobile behavior;
- carry the session Quick Scan receipt into Ash Keep;
- register both L0 and L1 custody roots;
- hold tampered, stale, failed, and offline registrations;
- bind the verified root into a new and an existing Case Map;
- prove the Case Map digest changes and a pre-binding Rebuild Test becomes stale;
- prove workspace and release gates follow lifecycle state;
- create a current Rebuild Test, Draft Review, Release Receipt, Save Point, and encrypted Capsule;
- reload and round-trip the custody-bound case;
- seal screenshots, storage/network observations, runtime artifacts, and digests;
- promote only after the deployed probe passes.

After that gate, resume Choir calibration-receipt binding.

## Final ruling`);
  doc = doc.replace('Ash Keep remains production-demonstrated. Choir is merged, adversarially hardened, provenance-bound, disagreement-aware, matched-control calibrated, and validation-gated.\n\nThe bounded program is **123 / 295 ≈ 42% implemented by ledger arithmetic**, with one production-demonstrated workstream and four validation-gated Choir instruments on `main`.', 'Ash Keep remains production-demonstrated. The new Ash product lifecycle is a distinct candidate workstream and inherits no production status by adjacency. Choir remains merged, adversarially hardened, provenance-bound, disagreement-aware, matched-control calibrated, and validation-gated.\n\nThe bounded program remains **123 / 295 ≈ 42% on `main`**. The candidate branch is **144 / 330 ≈ 44%** after adding the lifecycle workstream, with one of eight workstreams production-demonstrated.');
  write(file, doc);
}

function patchRoadmap() {
  const file = 'ROADMAP.md';
  let doc = read(file);
  if (doc.includes('<!-- ASH_PRODUCT_LIFECYCLE_REPAIR -->')) return;
  doc = doc.replace('Roadmap generation: `v0.8 · post-matched-benign-control-bank`', 'Roadmap generation: `v0.9 · Ash product lifecycle repair`');
  doc = doc.replace('- [`docs/ASH_KEEP.md`](docs/ASH_KEEP.md)', '- [`docs/ASH_KEEP.md`](docs/ASH_KEEP.md)\n- [`docs/ASH_LIFECYCLE_ORCHESTRATION.md`](docs/ASH_LIFECYCLE_ORCHESTRATION.md)');
  doc = doc.replace('full bounded program = 123 / 295 · ≈42%\nproduction-demonstrated workstreams = 1 / 7', 'full bounded program on main = 123 / 295 · ≈42%\ncandidate including Ash lifecycle = 144 / 330 · ≈44%\nproduction-demonstrated workstreams = 1 / 8');

  const intervention = `<!-- ASH_PRODUCT_LIFECYCLE_REPAIR -->
# Active intervention — Ash product lifecycle repair

The current branch corrects a product-level inversion:

- Ash Readiness had become the visible product;
- Ash Keep appeared as one small action among peers;
- Ash Custody remained a detached registration page;
- production closure of the Keep was being mistaken for proof of an integrated Ash lifecycle.

The selected architecture is now:

\`\`\`text
Dome Ash tab
→ art-forward threshold rite
→ session-scoped Quick Scan readiness
→ Ash Keep custody-root registration
→ browser digest verification
→ Case Map root binding and digest change
→ current Rebuild Test
→ exact Draft Review and release gate
→ Save Point and encrypted Capsule
\`\`\`

## Directional consequences

1. **Production-demonstrate Ash lifecycle orchestration before enlarging the Choir.** The Keep's existing production status cannot crown the new threshold or custody-root workflow.
2. **Safe Harbor → Ash adapter must target the custody-root ingress.** A verified packet becomes a bounded root/reference without copying the raw corpus by default.
3. **Custodian Return must restore lifecycle structure.** Recovery must include readiness provenance, custody root, Case Map binding, route history, and continuity state.
4. **Aperture keeps machine compatibility while changing human grammar.** \`ash-readiness\` remains a contract name; Quick Scan becomes the visible operation.
5. **Transport requires lifecycle eligibility.** Destination-bound execution remains held unless the case is \`RELEASE_ELIGIBLE\` under a current custody-bound Rebuild Test.

Candidate status: \`21 / 35 · IMPLEMENTED_VALIDATION_GATED\`. Production and mobile evidence remain absent.

---

`;
  doc = doc.replace('# Recently shipped', `${intervention}# Recently shipped`);
  write(file, doc);
}

patchIndex();
patchKeep();
patchLifecycleEngine();
patchPackage();
patchLedger();
patchRoadmap();
console.log('Ash lifecycle integration applied.');
