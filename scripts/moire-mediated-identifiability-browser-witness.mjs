import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const browserName = String(process.env.TD613_BROWSER || 'chromium').trim().toLowerCase();
const engine = { chromium, firefox, webkit }[browserName];
if (!engine) throw new Error(`Unsupported TD613_BROWSER: ${browserName}`);

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/+$/, '');
const previewUrl = `${base}/app/dome-world/previews/a15-r0/index.html`;
const artifactRoot = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/moire-mediated-identifiability-${browserName}`);
const artifactDir = path.join(artifactRoot, 'mediated-identifiability');
const receiptPath = path.join(artifactDir, `moire-mediated-identifiability-${browserName}-receipt.json`);
const sourceHead = String(process.env.TD613_SOURCE_HEAD || '').trim() || null;

await fs.mkdir(artifactDir, { recursive:true });
const receipt = {
  schema:'td613.dome-world.moire-mediated-identifiability-browser-witness/v0.1-local-only',
  browser:browserName,
  source_head:sourceHead,
  source_status:'LOCAL_EXACT_HEAD_BROWSER_OBSERVATION',
  status:'RUNNING',
  passive_cases:[],
  intervention_cases:[],
  bounded_registry_cases:[],
  hostile_out_of_window:null,
  network:{ external_requests:[], mutation_requests:[], request_failures:[] },
  storage:{ before:null, after:null, persistence_accumulated:null },
  errors:{ console:[], page:[] },
  authority:{
    physical_moire:false,
    external_causation:false,
    universal_identifiability:false,
    publication_priority:false,
    knowledge_transfer:false,
    provider_call_performed:false,
    release:false,
    production:false,
    human_closure_required:true
  },
  counts_as_exogenous_witness:false,
  golden_egg_credit:0,
  claim_ceiling:'declared-synthetic-two-process-two-global-state-thirty-bounded-registry-cases-plus-two-hostile-controls-only',
  seal:'⟐'
};

function assert(value, message) { if (!value) throw new Error(message); }
function storageState() {
  return {
    localStorageLength:localStorage.length,
    sessionStorageLength:sessionStorage.length,
    cookie:document.cookie
  };
}

let browser;
let terminalError = null;
try {
  browser = await engine.launch({ headless:true });
  const context = await browser.newContext({ viewport:{ width:1280, height:820 }, reducedMotion:'no-preference' });
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);
  const baseOrigin = new URL(base).origin;

  page.on('console', message => {
    if (message.type() === 'error') receipt.errors.console.push({ text:message.text(), location:message.location()?.url || null });
  });
  page.on('pageerror', error => receipt.errors.page.push({ text:error.message }));
  page.on('requestfailed', request => receipt.network.request_failures.push({ url:request.url(), failure:request.failure()?.errorText || 'unknown' }));
  page.on('request', request => {
    const requestUrl = new URL(request.url());
    if (requestUrl.origin !== baseOrigin) receipt.network.external_requests.push(request.url());
    if (!['GET','HEAD'].includes(request.method())) receipt.network.mutation_requests.push({ method:request.method(), url:request.url(), post_data_present:Boolean(request.postData()) });
  });

  await page.goto(previewUrl, { waitUntil:'domcontentloaded' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  receipt.storage.before = await page.evaluate(storageState);

  const observed = await page.evaluate(async () => {
    const moduleUrl = new URL('./moire-mediated-interventional-identifiability.js', window.location.href).href;
    const mod = await import(moduleUrl);
    const certificate = mod.buildMediatedIdentifiabilityCertificate();
    return {
      certificate,
      direct_overlay:mod.directOverlay(),
      bounds:[mod.BOUNDED_SIGMA_MIN, mod.BOUNDED_SIGMA_MAX],
      layer_a:mod.LAYER_A,
      layer_b:mod.LAYER_B,
      mediator_vector:mod.MEDIATOR_VECTOR,
      process_ids:mod.PROCESS_IDS,
      storage:{ localStorageLength:localStorage.length, sessionStorageLength:sessionStorage.length, cookie:document.cookie }
    };
  });

  const certificate = observed.certificate;
  assert(certificate.passed === true, 'browser certificate did not pass');
  assert(JSON.stringify(observed.direct_overlay) === JSON.stringify([1,1,2]), 'direct overlay drifted');
  assert(JSON.stringify(observed.bounds) === JSON.stringify([-7,7]), 'bounded sigma window drifted');
  assert(JSON.stringify(observed.layer_a) === JSON.stringify([2,-1,1]), 'layer A drifted');
  assert(JSON.stringify(observed.layer_b) === JSON.stringify([-1,2,1]), 'layer B drifted');
  assert(JSON.stringify(observed.mediator_vector) === JSON.stringify([1,-1,2]), 'mediator vector drifted');
  assert(observed.process_ids.OVERLAY_NUISANCE === 'H0_OVERLAY_NUISANCE' && observed.process_ids.MEDIATED === 'H1_MEDIATED', 'process identifiers drifted');

  assert(certificate.passive.length === 2, `expected 2 passive cases, got ${certificate.passive.length}`);
  for (const row of certificate.passive) {
    assert(row.observationally_equivalent === true, `passive outputs diverged for g=${row.g}`);
    assert(row.pair_residue_equivalent === true, `passive residues diverged for g=${row.g}`);
    receipt.passive_cases.push(row);
  }

  assert(certificate.interventions.length === 2, `expected 2 intervention cases, got ${certificate.interventions.length}`);
  for (const row of certificate.interventions) {
    assert(row.intervention === 'do(mediator_present=0)', `unexpected intervention for g=${row.g}`);
    assert(row.process_separated === true, `mediator ablation did not separate processes for g=${row.g}`);
    assert(JSON.stringify(row.h1_pair_residue) === JSON.stringify([0,0,0]), `mediated residue did not clear for g=${row.g}`);
    receipt.intervention_cases.push(row);
  }

  assert(certificate.bounded_registry_cases === 30, `expected 30 bounded registry cases, got ${certificate.bounded_registry_cases}`);
  assert(certificate.bounded_registry.length === 30, 'bounded registry table length drifted');
  for (const row of certificate.bounded_registry) {
    assert(row.selected_registry === row.g, `bounded relation changed for g=${row.g}, sigma=${row.sigma}`);
    assert(row.mediator_absent_state === 'AMBIGUOUS', `mediator-absent relation became identified for g=${row.g}, sigma=${row.sigma}`);
    receipt.bounded_registry_cases.push(row);
  }
  assert(certificate.bounded_registry_stable === true, 'bounded registry stability failed');
  assert(certificate.absent_mediator_registry_ambiguous === true, 'mediator-absent ambiguity failed');
  assert(certificate.morphology_changes_without_registry_change === true, 'morphology/relation separation failed');
  assert(certificate.exact_integer_arithmetic === true, 'exact integer arithmetic flag lost');

  const hostile = certificate.hostile_out_of_window;
  assert(hostile.breaks_universal_invariance === true, 'out-of-window hostile controls did not break universal invariance');
  assert(hostile.positive.selected_registry === -1, 'positive hostile did not flip relation');
  assert(hostile.negative.selected_registry === 1, 'negative hostile did not flip relation');
  receipt.hostile_out_of_window = hostile;

  for (const key of ['physical_moire','external_causation','universal_identifiability','publication_priority','knowledge_transfer','release','production']) {
    assert(certificate.authority[key] === false, `certificate authority widened at ${key}`);
  }
  for (const scar of [
    'SYNTHETIC_MEDIATOR_ABLATION != REAL_WORLD_CAUSAL_INTERVENTION',
    'PAIR_RESIDUE != MEDIATOR_CAUSATION',
    'SOURCE_A_DERIVED_REPAIR != TD613_PREPUBLICATION_POSSESSION',
    'BOUNDED_SYNTHETIC_IDENTIFIABILITY != UNIVERSAL_IDENTIFIABILITY'
  ]) assert(certificate.scars.includes(scar), `missing browser scar: ${scar}`);

  receipt.storage.after = observed.storage;
  receipt.storage.persistence_accumulated = observed.storage.localStorageLength !== 0 || observed.storage.sessionStorageLength !== 0 || observed.storage.cookie !== '';
  assert(receipt.storage.before.localStorageLength === 0 && receipt.storage.before.sessionStorageLength === 0 && receipt.storage.before.cookie === '', 'browser persistence was present before assay');
  assert(receipt.storage.persistence_accumulated === false, 'assay accumulated browser persistence');
  assert(receipt.network.external_requests.length === 0, `external requests observed: ${receipt.network.external_requests.join(',')}`);
  assert(receipt.network.mutation_requests.length === 0, `mutation requests observed: ${JSON.stringify(receipt.network.mutation_requests)}`);
  assert(receipt.network.request_failures.length === 0, `request failures observed: ${JSON.stringify(receipt.network.request_failures)}`);
  assert(receipt.errors.console.length === 0 && receipt.errors.page.length === 0, `browser errors observed: ${JSON.stringify(receipt.errors)}`);

  receipt.classification = certificate.classification;
  receipt.relation_classification = certificate.relation_classification;
  receipt.status = 'PASS';
  await context.close();
} catch (error) {
  terminalError = error;
  receipt.status = 'FAIL';
  receipt.terminal_error = { name:error.name, message:error.message, stack:error.stack };
} finally {
  if (browser) await browser.close().catch(() => {});
  await fs.writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
}

if (terminalError) throw terminalError;
console.log(`TD613 mediator-identifiability direct browser witness (${browserName}): PASS`);
