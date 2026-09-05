import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const browserName = String(process.env.TD613_BROWSER || 'chromium').toLowerCase();
const browserTypes = { chromium, firefox, webkit };
const browserType = browserTypes[browserName];
if (!browserType) throw new TypeError(`Unsupported TD613_BROWSER: ${browserName}`);

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptsDir, '..');
const pocketPath = path.join(repoRoot, 'app', 'pocket', 'td613-local-pocket-v0-2.html');
const pocketUrl = pathToFileURL(pocketPath).href;
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/local-pocket-v0-2';
await fs.mkdir(artifactDir, { recursive: true });

const rawDraftCanary = `RAW_DRAFT_${browserName.toUpperCase()}_613_MUST_NOT_TRAVEL`;
const protectedCanary = `PROTECTED_TERM_${browserName.toUpperCase()}_613_MUST_NOT_TRAVEL`;
const bearerCanary = `Bearer TD613${browserName.toUpperCase()}0123456789ABCDEFG`;
const apiCanary = `AIza${'A'.repeat(31)}`;
const emailCanary = `pocket-${browserName}@example.test`;
const phoneCanary = '+1 (904) 555-0613';
const timestampCanary = '2026-09-05T03:33:00-04:00';
const privateKeyCanary = `-----BEGIN PRIVATE KEY-----\nTD613_${browserName.toUpperCase()}_PRIVATE_MATERIAL\n-----END PRIVATE KEY-----`;

const expectedRuleIds = [
  'PRIVATE_KEY_BLOCK',
  'BEARER_TOKEN_BLOCK',
  'COMMON_API_KEY_BLOCK',
  'EMAIL_IDENTIFIER',
  'PHONE_IDENTIFIER',
  'EXACT_TIMESTAMP',
  'USER_DECLARED_PROTECTED_TERM'
];

const expectedBoundary = Object.freeze({
  execution_posture: 'LOCAL_PREFLIGHT',
  source_ingress_position: 'BEFORE_OPTIONAL_REMOTE_INGRESS',
  advisory_transition: 'EXPLICIT_REMOTE_TRANSITION_REQUIRED'
});

const report = {
  schema: 'td613.local-pocket.browser-witness/v0.2-born-minimized',
  browser_engine: browserName,
  source_status: 'OBSERVED',
  sensor_id: 'playwright-local-file-runtime',
  authority_class: 'A1_OBSERVATIONAL',
  status: 'OPEN',
  checks: [],
  console_errors: [],
  page_errors: [],
  external_requests: [],
  clipboard_writes: [],
  storage_attempts: null,
  runtime_receipt: null,
  provider_live_call_performed: false,
  production_mutation: false,
  deployment_authorized: false,
  human_closure_required: true
};

function check(name, pass, detail = null) {
  report.checks.push({ name, status: pass ? 'PASS' : 'FAIL', detail });
  if (!pass) throw new Error(`Local Pocket check failed: ${name}${detail == null ? '' : ` · ${JSON.stringify(detail)}`}`);
}

function containsForbiddenCardMaterial(text) {
  const forbidden = [rawDraftCanary, protectedCanary, bearerCanary, apiCanary, emailCanary, phoneCanary, timestampCanary, 'PRIVATE_MATERIAL'];
  return forbidden.filter(value => text.includes(value));
}

const browser = await browserType.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);

  page.on('console', message => { if (message.type() === 'error') report.console_errors.push(message.text()); });
  page.on('pageerror', error => report.page_errors.push(error.message));
  page.on('request', request => {
    const url = request.url();
    if (!url.startsWith('file:') && !url.startsWith('data:') && !url.startsWith('about:')) report.external_requests.push(url);
  });

  await page.addInitScript(() => {
    window.__TD613_CLIPBOARD_WRITES__ = [];
    window.__TD613_PERSISTENCE_ATTEMPTS__ = { storage: 0, indexeddb: 0, cache: 0, cookie: 0, service_worker: 0 };
    try {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async text => { window.__TD613_CLIPBOARD_WRITES__.push(String(text)); } }
      });
    } catch {}
    try {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function(...args) { window.__TD613_PERSISTENCE_ATTEMPTS__.storage += 1; return original.apply(this, args); };
    } catch {}
    try {
      const original = IDBFactory.prototype.open;
      IDBFactory.prototype.open = function(...args) { window.__TD613_PERSISTENCE_ATTEMPTS__.indexeddb += 1; return original.apply(this, args); };
    } catch {}
    try {
      if (globalThis.CacheStorage?.prototype?.open) {
        const original = CacheStorage.prototype.open;
        CacheStorage.prototype.open = function(...args) { window.__TD613_PERSISTENCE_ATTEMPTS__.cache += 1; return original.apply(this, args); };
      }
    } catch {}
    try {
      const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
      if (descriptor?.set) Object.defineProperty(Document.prototype, 'cookie', {
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable,
        get: descriptor.get,
        set(value) { window.__TD613_PERSISTENCE_ATTEMPTS__.cookie += 1; return descriptor.set.call(this, value); }
      });
    } catch {}
    try {
      if (globalThis.ServiceWorkerContainer?.prototype?.register) {
        const original = ServiceWorkerContainer.prototype.register;
        ServiceWorkerContainer.prototype.register = function(...args) { window.__TD613_PERSISTENCE_ATTEMPTS__.service_worker += 1; return original.apply(this, args); };
      }
    } catch {}
  });

  await page.goto(pocketUrl, { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('[data-local-pocket]')?.dataset?.ready === 'true');

  check('local file route observed', page.url().startsWith('file:'), page.url());
  check('Pocket ready without server', await page.locator('[data-local-pocket]').getAttribute('aria-busy') !== 'true');
  check('zero external requests after local load', report.external_requests.length === 0, report.external_requests);
  check('no external resource elements', await page.locator('script[src],link[href],img[src^="http"],iframe[src],object[data]').count() === 0);

  report.runtime_receipt = await page.evaluate(() => {
    const receipt = window.__TD613_LOCAL_POCKET_V02__;
    return receipt ? {
      schema: receipt.schema,
      ready: receipt.ready,
      route_posture: receipt.route_posture,
      network_required: receipt.network_required,
      remote_model_required: receipt.remote_model_required,
      provider_call_performed: receipt.provider_call_performed,
      persistence_performed: receipt.persistence_performed,
      release_authority: receipt.release_authority,
      human_closure_required: receipt.human_closure_required,
      network_attempts: receipt.networkAudit?.attempts ?? null,
      local_binding_present: receipt.localBindingPresent
    } : null;
  });
  check('runtime receipt installed', report.runtime_receipt?.ready === true, report.runtime_receipt);
  check('provider remains absent', report.runtime_receipt?.provider_call_performed === false && report.runtime_receipt?.remote_model_required === false, report.runtime_receipt);
  check('release authority remains false', report.runtime_receipt?.release_authority === false && report.runtime_receipt?.human_closure_required === true, report.runtime_receipt);
  check('default network audit remains zero', report.runtime_receipt?.network_attempts === 0, report.runtime_receipt);

  // Hostile all-seven-rule journey.
  const hostileDraft = [rawDraftCanary, protectedCanary, privateKeyCanary, bearerCanary, apiCanary, emailCanary, phoneCanary, timestampCanary].join('\n');
  await page.locator('#draft').fill(hostileDraft);
  await page.locator('#protected').fill(`${rawDraftCanary}\n${protectedCanary}`);
  await page.locator('#check').click();
  await page.waitForFunction(() => window.__TD613_LOCAL_POCKET_V02__?.status === 'HOLD_REMOVE_REQUIRED');

  check('hard REMOVE holds message door', await page.locator('#copyMessage').isDisabled());
  check('Pocket card remains available under hold', !(await page.locator('#copyCard').isDisabled()));
  const hostileCardPreview = await page.locator('#cardPreview').textContent();
  const hostileCard = JSON.parse(hostileCardPreview);
  check('Pocket card schema canonical', hostileCard.schema === 'td613.local-pocket.card/v0.2-born-minimized', hostileCard.schema);
  check('Pocket card boundary exact', JSON.stringify(hostileCard.route_boundary) === JSON.stringify(expectedBoundary), hostileCard.route_boundary);
  check('all seven canonical finding classes observed', JSON.stringify(hostileCard.findings.map(item => item.rule_id).sort()) === JSON.stringify([...expectedRuleIds].sort()), hostileCard.findings);
  check('Pocket card collapses repeated spans to unique classes', hostileCard.findings.length === expectedRuleIds.length, hostileCard.findings.length);
  check('Pocket card contains no forbidden raw material', containsForbiddenCardMaterial(hostileCardPreview).length === 0, containsForbiddenCardMaterial(hostileCardPreview));
  check('Pocket card contains no local digest', !/sha256:[a-f0-9]{64}/i.test(hostileCardPreview));
  check('Pocket card contains no span coordinates', !/"(?:start|end)"\s*:/.test(hostileCardPreview));
  check('Pocket card contains no route label shortcut', !hostileCardPreview.includes('LOCAL_POCKET'));
  check('Pocket card authority stays false', hostileCard.release_authority === false && hostileCard.human_closure_required === true, hostileCard);

  await page.locator('#copyCard').click();
  await page.waitForFunction(() => window.__TD613_CLIPBOARD_WRITES__.length === 1);
  let writes = await page.evaluate(() => [...window.__TD613_CLIPBOARD_WRITES__]);
  check('Door B copied exact born-minimized card', writes[0] === JSON.stringify(hostileCard));
  check('Door B clipboard excludes raw canaries', containsForbiddenCardMaterial(writes[0]).length === 0, containsForbiddenCardMaterial(writes[0]));

  // Any state mutation must stale-lock both doors.
  await page.locator('#draft').pressSequentially('x');
  check('draft mutation relocks message door', await page.locator('#copyMessage').isDisabled());
  check('draft mutation relocks card door', await page.locator('#copyCard').isDisabled());
  check('draft mutation clears card preview', (await page.locator('#cardPreview').textContent()) === 'No card until CHECK.');

  // Restore hostile state, mitigate locally, and require a fresh exact-state recheck.
  await page.locator('#draft').fill(hostileDraft);
  await page.locator('#check').click();
  await page.waitForFunction(() => window.__TD613_LOCAL_POCKET_V02__?.status === 'HOLD_REMOVE_REQUIRED');
  await page.locator('#safer').click();
  check('mitigation immediately relocks message door', await page.locator('#copyMessage').isDisabled());
  check('mitigation immediately relocks card door', await page.locator('#copyCard').isDisabled());
  const mitigated = await page.locator('#draft').inputValue();
  check('mitigation removes protected canaries', !mitigated.includes(rawDraftCanary) && !mitigated.includes(protectedCanary), mitigated);
  check('mitigation removes structural secret canaries', !mitigated.includes('BEGIN PRIVATE KEY') && !mitigated.includes(bearerCanary) && !mitigated.includes(apiCanary), mitigated);
  check('mitigation generalizes identifier/time canaries', !mitigated.includes(emailCanary) && !mitigated.includes(phoneCanary) && !mitigated.includes(timestampCanary), mitigated);
  await page.locator('#check').click();
  await page.waitForFunction(() => window.__TD613_LOCAL_POCKET_V02__?.status === 'CLEAR_UNDER_ENABLED_DETERMINISTIC_RULES');
  check('fresh mitigated recheck opens message door', !(await page.locator('#copyMessage').isDisabled()));
  check('fresh mitigated recheck opens card door', !(await page.locator('#copyCard').isDisabled()));
  const clearCard = JSON.parse(await page.locator('#cardPreview').textContent());
  check('clean state uses empty findings rather than fake Loom rule', clearCard.status_token === 'CLEAR_UNDER_ENABLED_DETERMINISTIC_RULES' && clearCard.findings.length === 0, clearCard);
  await page.locator('#copyMessage').click();
  await page.waitForFunction(() => window.__TD613_CLIPBOARD_WRITES__.length === 2);
  writes = await page.evaluate(() => [...window.__TD613_CLIPBOARD_WRITES__]);
  check('Door A copied exact rechecked mitigated message', writes[1] === mitigated);
  check('Door A rechecked message excludes hostile canaries', !containsForbiddenCardMaterial(writes[1]).length, containsForbiddenCardMaterial(writes[1]));

  // CHANGE-only journey remains bounded and does not call itself green.
  await page.locator('#draft').fill([emailCanary, phoneCanary, timestampCanary].join(' '));
  await page.locator('#protected').fill('');
  await page.locator('#check').click();
  await page.waitForFunction(() => window.__TD613_LOCAL_POCKET_V02__?.status === 'CHANGE_SUGGESTED');
  check('CHANGE-only journey leaves message door available', !(await page.locator('#copyMessage').isDisabled()));
  check('CHANGE-only journey does not display clear claim', !(await page.locator('#status').textContent()).toLowerCase().includes('clear under'));

  // Rest/return are authority-neutral.
  await page.locator('#rest').click();
  check('rest state visible', await page.locator('[data-local-pocket]').getAttribute('data-resting') === 'true');
  check('return available from rest', !(await page.locator('#return').isDisabled()));
  await page.locator('#return').click();
  check('return exits rest state', await page.locator('[data-local-pocket]').getAttribute('data-resting') === 'false');

  // Keyboard reachability under an eligible state.
  await page.locator('body').click({ position: { x: 2, y: 2 } });
  const reached = [];
  for (let i = 0; i < 18; i += 1) {
    await page.keyboard.press('Tab');
    const id = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName || '');
    if (id) reached.push(id);
  }
  for (const id of ['draft', 'protected', 'check', 'safer', 'copyMessage', 'copyCard', 'rest', 'clear']) {
    check(`keyboard reaches ${id}`, reached.includes(id), reached);
  }

  // Mobile portrait and reduced motion.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const mobile = await page.evaluate(() => ({
    overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    visibleControls: [...document.querySelectorAll('button,textarea,summary')].filter(node => {
      const r = node.getBoundingClientRect(); const s = getComputedStyle(node); return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden';
    }).length
  }));
  check('390x844 has no horizontal overflow', mobile.overflow <= 2, mobile);
  check('reduced motion observed', mobile.reduced === true, mobile);
  check('mobile controls remain present', mobile.visibleControls >= 10, mobile);

  report.storage_attempts = await page.evaluate(() => ({ ...window.__TD613_PERSISTENCE_ATTEMPTS__ }));
  check('zero persistence attempts observed', Object.values(report.storage_attempts).every(value => value === 0), report.storage_attempts);
  report.runtime_receipt = await page.evaluate(() => {
    const receipt = window.__TD613_LOCAL_POCKET_V02__;
    return {
      schema: receipt.schema,
      ready: receipt.ready,
      route_posture: receipt.route_posture,
      network_required: receipt.network_required,
      remote_model_required: receipt.remote_model_required,
      provider_call_performed: receipt.provider_call_performed,
      persistence_performed: receipt.persistence_performed,
      release_authority: receipt.release_authority,
      human_closure_required: receipt.human_closure_required,
      network_attempts: receipt.networkAudit.attempts,
      local_binding_present: receipt.localBindingPresent
    };
  });
  check('runtime network audit still zero', report.runtime_receipt.network_attempts === 0, report.runtime_receipt);
  check('local binding exists after check but remains internal', report.runtime_receipt.local_binding_present === true, report.runtime_receipt);
  check('no console errors', report.console_errors.length === 0, report.console_errors);
  check('no page errors', report.page_errors.length === 0, report.page_errors);

  report.clipboard_writes = writes.map((text, index) => ({
    index,
    length: text.length,
    raw_canary_present: containsForbiddenCardMaterial(text).length > 0,
    digest_present: /sha256:[a-f0-9]{64}/i.test(text)
  }));
  report.status = 'PASS';
  report.completed_at = new Date().toISOString();
  await page.screenshot({ path: path.join(artifactDir, `local-pocket-${browserName}-390x844.png`), fullPage: true });
  await fs.writeFile(path.join(artifactDir, `local-pocket-${browserName}-browser-witness.json`), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ status: report.status, browser: browserName, checks: report.checks.length, failed: report.checks.filter(item => item.status !== 'PASS') }, null, 2));
  await context.close();
} catch (error) {
  report.status = 'FAIL';
  report.error = String(error?.stack || error?.message || error);
  report.completed_at = new Date().toISOString();
  await fs.writeFile(path.join(artifactDir, `local-pocket-${browserName}-browser-witness.json`), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  throw error;
} finally {
  await browser.close();
}
