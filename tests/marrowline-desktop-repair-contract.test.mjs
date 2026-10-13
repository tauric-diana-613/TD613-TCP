import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { installMarrowlineDesktopRepair, installStarterCarousel } from '../app/dome-world/marrowline-desktop-repair.js';
import { installMarrowlineLivingChat } from '../app/dome-world/marrowline-living-chat.js';
import { clearMarrowlineAttachments, stageMarrowlineAttachments } from '../app/dome-world/marrowline-attachments.js';
import { MARROWLINE_MISSION_ASSAYS } from '../app/dome-world/marrowline-mission-assays.js';
import { createLoomAiHandoff, consumeLoomAiHandoff, createLoomAiGovernance, createLoomAiTaskGovernor, createPortableLoomAiPacket } from '../app/dome-world/holonomy-loom/ai-handoff.js';
import { installMarrowlineLoomPocket } from '../app/dome-world/marrowline-loom-pocket.js';

const js = fs.readFileSync('app/dome-world/marrowline-desktop-repair.js', 'utf8');
const css = fs.readFileSync('app/dome-world/marrowline-desktop-repair.css', 'utf8');
const boot = fs.readFileSync('app/dome-world/marrowline-egress-boot.js', 'utf8');
const page = fs.readFileSync('app/dome-world/marrowline.html', 'utf8');
const mobileShellCss = fs.readFileSync('app/dome-world/marrowline-mobile-shell.css', 'utf8');
const livingChatJs = fs.readFileSync('app/dome-world/marrowline-living-chat.js', 'utf8');
const terminalJs = fs.readFileSync('app/dome-world/marrowline-terminal.js', 'utf8');
const threadsJs = fs.readFileSync('app/dome-world/marrowline-threads.js', 'utf8');
const physicalJs = fs.readFileSync('app/dome-world/marrowline-physical-device-repair.js', 'utf8');
const loomPocketJs = fs.readFileSync('app/dome-world/marrowline-loom-pocket.js', 'utf8');
const loomGateContinuityJs = fs.readFileSync('app/dome-world/marrowline-loom-gate-continuity.js', 'utf8');
const loomGateContinuityCss = fs.readFileSync('app/dome-world/marrowline-loom-gate-continuity.css', 'utf8');
const release = JSON.parse(fs.readFileSync('app/dome-world/marrowline.release.json', 'utf8'));

test('legacy pocket export preserves the consumed original result after a newer same-input result enters the local cache', async t => {
  const packet = { task: 'Compare fictional pocket workstreams.', documents: [{ id: 'pocket-source', name: 'pocket.txt', text: 'Three fictional approved workstreams.' }], rules: ['Keep the original source selection.'] };
  packet.governance = await createLoomAiGovernance(packet, { withheldDocumentCount: 1 }, { crypto: webcrypto });
  const result = (request_id, answer) => ({ schema: 'td613.loom.ai-task-result/v0.1', request_id, status: 'completed', answer, missing_information: ['Independent effect unobserved.'], used_document_ids: ['pocket-source'], suggested_next_step: 'Review the selected record.' });
  const original = result('pocket-origin', 'Original pocket answer: three fictional workstreams.');
  const store = new Map(), sessionStorage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key) };
  const source = { location: new URL('https://td613.com/dome-world/holonomy-loom.html'), crypto: webcrypto, sessionStorage };
  const url = await createLoomAiHandoff(packet, source, { priorResult: original });
  await consumeLoomAiHandoff(url.split('#loom=')[1], { ...source, location: new URL('https://td613.com/dome-world/marrowline.html') });
  const governor = await createLoomAiTaskGovernor(packet, { crypto: webcrypto });
  assert.equal((await governor.authorize(packet)).allowed, true);
  const newer = result('pocket-newer', 'Newer local answer must not replace the consumed handoff.');
  assert.equal(governor.receive(newer, newer.request_id).allowed, true);
  assert.equal(createPortableLoomAiPacket(packet).continuation.prior_result.request_id, newer.request_id, 'negative control establishes the competing same-input cache result');

  const dom = new JSDOM(page, { url: 'https://td613.com/dome-world/marrowline.html' }), document = dom.window.document;
  dom.window.HTMLAnchorElement.prototype.click = function () {};
  const workspace = document.createElement('section');
  workspace.id = 'loomImportedWorkspace';workspace.setAttribute('data-loom-import-workspace', '');document.body.append(workspace);
  let exported, providerCalls = 0;
  const environment = { crypto: webcrypto, Blob, URL: { createObjectURL(blob) { exported = blob;return 'blob:pocket-regression'; }, revokeObjectURL() {} },
    innerWidth: 1280, innerHeight: 900, dispatchEvent() {}, setTimeout(callback) { callback(); },
    fetch() { providerCalls++;throw new Error('Pocket export must not call the provider.'); } };
  clearMarrowlineAttachments(environment);
  t.after(() => { governor.close();clearMarrowlineAttachments(environment);dom.window.close(); });
  assert.equal(installMarrowlineLoomPocket(document, environment), true);
  document.querySelector('#marrowlineAiaExport').click();
  assert.ok(exported, 'the visible pocket Export action emits a download');
  const carried = JSON.parse(await exported.text());
  assert.deepEqual(carried.continuation.prior_result, original);
  assert.equal(carried.task, packet.task);assert.deepEqual(carried.documents, packet.documents);assert.deepEqual(carried.rules, packet.rules);
  assert.deepEqual(carried.governance, packet.governance);
  assert.equal(carried.portability_assurance.authority_transferred, false);
  assert.equal(carried.portable_governance.output_protocol.gate_action.command,'米');
  assert.equal(carried.portable_governance.output_protocol.gate_output.command,'下');
  assert.equal(carried.portable_governance.mechanisms.length,32);
  assert.equal(providerCalls, 0);
});

test('desktop instruments have a persistent adjacent panel and Loom Gate default', () => {
  assert.match(css, /grid-template-columns:minmax\(0,2fr\) minmax\(300px,1fr\)/);
  assert.match(css, /html:root #speakingPanel #khonapolitMessages\{flex:1 1 0;min-height:0!important/);
  assert.deepEqual(release.desktop.instrumentTabs, ['Loom Gate', 'Keys', 'Stories', 'Receipts']);
  assert.equal(release.desktop.persistentInstrumentPanel, true);
  assert.equal(release.desktop.posture, 'conversation-with-persistent-instruments');
});
test('Loom Gate continuity precedes the separate adversarial assay and preserves four-role jurisdiction', () => {
  assert.equal(release.loomGateContinuitySchema, 'td613.dome-world.marrowline-loom-gate-continuity/v0.1');
  assert.deepEqual(release.mobile.navigationOrder, ['Keys', 'Loom Gate', 'Chat', 'Stories', 'Receipts']);
  assert.match(page, /data-mobile-target="gatePanel"><span>⟁<\/span>Loom Gate<\/button>/);
  assert.match(loomGateContinuityJs, /What crossed this Loom Gate\?/);
  assert.match(loomGateContinuityJs, /Pedagogue/);
  assert.match(loomGateContinuityJs, /Aperture/);
  assert.match(loomGateContinuityJs, /Atlas/);
  assert.match(loomGateContinuityJs, /FADT/);
  assert.match(loomGateContinuityJs, /SEPARATE EXPERIMENT/);
  assert.match(loomGateContinuityJs, /Adversarial boundary assay preserved for the later Gate pass/);
  assert.match(loomGateContinuityJs, /Browser submission of #1 began; server receipt and receiver result remain unresolved/);
  assert.match(loomGateContinuityJs, /PRIOR EXPORT RETAINED/);
  assert.match(loomGateContinuityCss, /\.loom-gate-consequence-grid\{[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(loomGateContinuityCss, /\.loom-gate-role\[data-role="pedagogue"\]/);
  assert.match(loomGateContinuityCss, /\.loom-gate-role\[data-role="aperture"\]/);
  assert.match(loomGateContinuityCss, /\.loom-gate-role\[data-role="atlas"\]/);
  assert.match(loomGateContinuityCss, /\.loom-gate-role\[data-role="fadt"\]/);
  assert.match(loomGateContinuityCss, /#gatePanel\[data-loom-continuity-active="true"\] #marrowlineGatePedagogue/);
  assert.match(loomGateContinuityCss, /#gatePanel\[data-loom-continuity-active="true"\] #marrowlineForm/);
  assert.match(loomGateContinuityCss, /@media\(max-width:860px\)\{[\s\S]*\.loom-gate-consequence-grid,\.loom-gate-role-grid\{grid-template-columns:1fr\}/);
});

test('lore-bearing demo prompts preserve canonical Flow-Core glyphs and Palantir attribution', () => {
  const flow = "['Flow-Core labor dispute', '米, à, 出, hõt, cōl, 上, 下, and 𝄐 file a labor complaint against an animation coordinator that uses their glyphs as decorative status lights. Let each relation testify to what semantic work it actually performs, then redesign the scheduler so cadence serves meaning rather than consuming it.']";
  const palantir = "['Palantir ontology hearing', 'A city adopts an ontology platform by Palantir that promises one clean object model for people, places, risks, and events. Conduct a hostile-but-fair architecture hearing: distinguish useful relational integration from the power to make the ontology’s categories operationally real, and identify what governance would keep a graph from quietly becoming jurisdiction.']";
  assert.ok(js.includes(flow));
  assert.ok(js.includes(palantir));
  assert.equal(js.includes("'Flow-Core labor dispute', 'À,"), false, 'à must never be capitalized into a different glyph');
  for (const glyph of ['米', 'à', '出', 'hõt', 'cōl', '上', '下', '𝄐']) assert.ok(flow.includes(glyph), glyph);
});

test('isolated 56-prompt shuffle bag never repeats early or across the cycle seam', () => {
  const dom = new JSDOM('<div id="khonapolitMessages"><div class="starter-prompts"><button>Follow a memory</button><button>Meet the Ash Moon</button></div></div><textarea id="khonapolitPrompt"></textarea>');
  const { document } = dom.window;
  assert.equal(installStarterCarousel(document, dom.window), true);
  const rotate = document.querySelector('.starter-rotate');
  const choices = () => [...document.querySelectorAll('.starter-prompts button:not(.starter-rotate)')].map(button => button.textContent);
  const firstPaint = choices();
  assert.deepEqual(firstPaint, ['Follow a memory', 'Meet the Ash Moon']);
  const seen = new Set(firstPaint);
  for (let turn = 0; turn < 28; turn += 1) {
    rotate.click();
    const labels = choices();
    assert.equal(labels.length, 2);
    for (const label of labels) {
      assert.equal(seen.has(label), false, `rupture prompt repeated before all 56 draws: ${label}`);
      seen.add(label);
    }
    assert.equal(rotate.dataset.seenCount, String((turn + 1) * 2));
    assert.equal(rotate.dataset.shuffleCycle, '1');
  }
  assert.equal(seen.size, 58, 'two initial prompts and 56 unique prompts');
  const previousPair = choices();
  rotate.click();
  assert.equal(rotate.dataset.shuffleCycle, '2');
  assert.equal(rotate.dataset.seenCount, '2');
  assert.equal(choices().some(label => previousPair.includes(label)), false, 'next bag cannot repeat immediately preceding pair');
  const chosen = document.querySelector('.starter-prompts button:not(.starter-rotate)');
  chosen.click();
  assert.equal(document.querySelector('#khonapolitPrompt').value, chosen.dataset.promptValue, 'rotated prompt still fills composer without sending');
  dom.window.__TD613_MARROWLINE_STARTER_CAROUSEL_OBSERVER__?.disconnect();
  dom.window.close();
});


test('24 additional mission prompts preserve varied affect and the existing nonrepeating carousel', () => {
  assert.equal(MARROWLINE_MISSION_ASSAYS.length, 24);
  const labels = MARROWLINE_MISSION_ASSAYS.map(([label]) => label);
  assert.equal(new Set(labels).size, 24);
  for (const [label, prompt] of MARROWLINE_MISSION_ASSAYS) {
    assert.ok(label.length > 3 && label.length <= 45, label);
    assert.ok(prompt.length > 100 && prompt.length < 900, label);
    assert.equal(prompt.includes('\\u0301'), false, 'no Unicode template');
  }
  const all = MARROWLINE_MISSION_ASSAYS.map(row => row[1]).join(' ');
  for (const motif of ['Red Deer', 'Chairman', 'Orestes–kerykeion', 'Black feminist epistemology',
    'grief', 'hornani', 'consenting adult', 'blue–orange', 'swarm', 'demiurge', 'Rex Nemorensis',
    'stylometric', 'same-episode', 'surveillance', 'grandmother']) {
    assert.ok(all.toLowerCase().includes(motif.toLowerCase()), motif);
  }
  assert.match(js, /\.\.\.MARROWLINE_MISSION_ASSAYS/);
  assert.match(js, /Shuffle \$\{STARTER_ASSAYS\.length\} Marrowline prompts without repeats/);
});

test('composer has one universal plus with exactly file photo and Loom actions', () => {
  assert.match(js, /id = 'marrowlineComposerPlus'/);
  assert.match(js, /'Upload file'/);
  assert.match(js, /'Upload photo'/);
  assert.match(js, /'Loom'/);
  assert.match(js, /peekLastConsumedLoomAiHandoff/);
  assert.match(js, /\/dome-world\/holonomy-loom\.html/);
  assert.match(js, /'_blank'/);
  assert.deepEqual(release.composer.plusActions, ['UPLOAD_FILE', 'UPLOAD_PHOTO', 'LOOM']);
  assert.equal(release.composer.loomDormantAction, 'open-loom-in-new-tab');
  assert.equal(release.composer.loomAwakeAction, 'continue-staged-loom-handoff');
});

test('Loom demo attention follows pending steps and the two-step route branches from the Loom menu item', () => {
  assert.match(js, /doc\.documentElement\?\.dataset\?\.loomTaskImport === 'staged'/);
  assert.match(js, /Boolean\(demo\?\.pending_steps && !demo\?\.busy\)/);
  assert.match(js, /plus\.dataset\.loomAttention = String\(awake && !cuePaused\)/);
  assert.doesNotMatch(js, /loomCueAcknowledged/);
  assert.match(js, /root\.addEventListener\?\.\('td613:marrowline:loom-demo-state', refreshLoom\)/);
  assert.match(js, /loomItem\.button\.setAttribute\('aria-haspopup', 'menu'\)/);
  assert.match(js, /loomItem\.button\.setAttribute\('aria-expanded', 'true'\)/);
  assert.match(js, /loomItem\.text\.textContent = demo && !\['LEFT','EXPIRED'\]\.includes\(demo\.phase\) \? 'Loom demo' : 'Loom'/);
  assert.match(css, /\.marrowline-composer-plus\{[^}]*color:#e6ece8/);
  assert.match(css, /\.marrowline-composer-plus\[data-loom-attention="true"\],#khonapolitSend\[data-loom-attention="true"\]\{animation:marrowline-loom-demo-attention \.62s/);
  assert.match(css, /#marrowlineContextLoom\[data-loom-awake="true"\]>span:nth-child\(2\)\{color:#ff69c3\}/);
  assert.match(css, /#marrowlineContextLoom\[data-loom-awake="true"\] small\{color:#f38ec8\}/);
  assert.match(css, /#marrowlineContextLoom\[data-submenu-parent="true"\]\[data-loom-submenu="true"\]::after\{content:"›"/);
  assert.match(css, /\.marrowline-context-submenu\{position:fixed/);
  assert.doesNotMatch(css, /marrowline-composer-plus\[data-loom-awake="true"\][^{]*\{[^}]*color:/);
  assert.doesNotMatch(css, /marrowline-composer-plus\[data-loom-awake="true"\]::after/);
  assert.match(css, /\.loom-import-workspace \.loom-demo-gate-next\{[^}]*border:1px solid #f38ec8[^}]*color:#ffb5e1/);
  assert.match(loomPocketJs, /\.marrowline-aia-plus::after\{content:none\}/,
    'legacy Loom-pocket plus carries no competing green attention dot');
});

test('reply-local Receipts selects the real desktop tab or mobile dock and snaps the panel', () => {
  assert.match(livingChatJs, /receiptButton\.textContent = 'Receipts'/);
  assert.match(livingChatJs, /openPanel\('receiptPanel', true\)/);
  assert.match(livingChatJs, /#marrowlineDesktopToolTabs \[data-target="\$\{id\}"\]/);
  assert.match(livingChatJs, /\.mobile-dock \[data-mobile-target="\$\{id\}"\]/);
  assert.match(livingChatJs, /target\.scrollIntoView\?\.\(\{ block: 'start', behavior \}\)/);
  assert.match(livingChatJs, /desktopTab\.click\(\)/);
  assert.match(livingChatJs, /dockButton\?\.click\(\)/);
});

test('staged attachments have two temporary access points and the composer control aligns with the textarea column', async t => {
  const dom = new JSDOM(page, { url: 'https://td613.com/dome-world/marrowline.html' });
  const { window } = dom;
  const { document } = window;
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.HTMLElement.prototype.scrollIntoView = function () {};
  clearMarrowlineAttachments(window);
  t.after(() => {
    clearMarrowlineAttachments(window);
    window.__TD613_MARROWLINE_TRANSCRIPT_CUSTODY_OBSERVER__?.disconnect?.();
    window.__TD613_MARROWLINE_STARTER_CAROUSEL_OBSERVER__?.disconnect?.();
    dom.window.close();
  });

  const relay = document.createElement('article');
  relay.className = 'relay-message';
  relay.innerHTML = '<section class="relay-khonapolit" data-present="true"><div class="relay-stage-head"><span>Kʰonapolit</span><small>synthetic</small></div><div class="relay-stage-text">Synthetic reply.</div></section><button class="marrowline-copy-reply" type="button">Copy</button>';
  document.querySelector('#khonapolitMessages').append(relay);

  installMarrowlineDesktopRepair(document, window);
  const living = installMarrowlineLivingChat(document, window);
  t.after(() => living?.dispose?.());

  const composerAttachments = document.querySelector('#marrowlineComposerAttachments');
  const replyAttachments = document.querySelector('.reply-attachment-access');
  assert.ok(composerAttachments, 'composer-level Attachments control exists');
  assert.ok(replyAttachments, 'reply-drawer Attachments control exists');
  assert.equal(composerAttachments.hidden, true, 'composer control starts absent without staged material');
  assert.equal(replyAttachments.hidden, true, 'reply action starts absent without staged material');

  const bytes = new TextEncoder().encode('attachment canary');
  await stageMarrowlineAttachments([{
    name: 'canary.txt', type: 'text/plain', size: bytes.byteLength,
    arrayBuffer: async () => bytes.buffer
  }], { kind: 'file', environment: window });

  assert.equal(composerAttachments.hidden, false, 'staging a file reveals the composer Attachments control');
  assert.equal(replyAttachments.hidden, false, 'staging a file reveals Attachments in More with this reply');
  composerAttachments.click();
  assert.equal(document.querySelector('#marrowlineAttachmentDrawer').hidden, false, 'either access point opens the shared staged attachment drawer');
  assert.equal(document.querySelectorAll('#marrowlineAttachmentTray [data-attachment-id]').length, 1);

  window.dispatchEvent(new window.CustomEvent('td613:marrowline:attachment-submission-state', { detail: { sending: true, count: 1 } }));
  assert.equal(composerAttachments.hidden, true, 'Send handoff hides the composer Attachments control immediately');
  assert.equal(replyAttachments.hidden, true, 'Send handoff hides the reply-drawer Attachments control immediately');
  assert.equal(document.querySelector('#marrowlineAttachmentDrawer').hidden, true, 'open attachment drawer closes at Send handoff');

  window.dispatchEvent(new window.CustomEvent('td613:marrowline:attachment-submission-state', { detail: { sending: false, count: 1 } }));
  assert.equal(composerAttachments.hidden, false, 'a held send can restore access to the preserved staged file');
  assert.equal(replyAttachments.hidden, false, 'a held send can restore the matching reply action');

  clearMarrowlineAttachments(window);
  assert.equal(composerAttachments.hidden, true, 'cleared/successfully consumed staging removes the composer control');
  assert.equal(replyAttachments.hidden, true, 'cleared/successfully consumed staging removes the reply action');

  // Exercise the actual Upload photo input path with a mobile-sized payload
  // that exceeds the full 2.5 MB wire envelope. This must be normalized in the
  // browser, then reveal both Attachments entry points without staging a file first.
  const photoBytes = new Uint8Array(4_200_000);
  photoBytes[0] = 0xff; photoBytes[1] = 0xd8; photoBytes[photoBytes.length - 2] = 0xff; photoBytes[photoBytes.length - 1] = 0xd9;
  const nativeCreateElement = document.createElement.bind(document);
  document.createElement = tag => {
    if (String(tag).toLowerCase() !== 'canvas') return nativeCreateElement(tag);
    return {
      width: 0, height: 0,
      getContext: () => ({ fillStyle: '', fillRect() {}, drawImage() {} }),
      toBlob: callback => callback({ size: 1_200_000, type: 'image/jpeg' })
    };
  };
  window.createImageBitmap = async () => ({ width: 4032, height: 3024, close() {} });
  window.File = class {
    constructor(parts, name, options = {}) {
      this.name = name;
      this.type = options.type || 'application/octet-stream';
      this.size = 1_200_000;
      this.lastModified = options.lastModified || Date.now();
      this.bytes = new Uint8Array(this.size);
    }
    async arrayBuffer() { return this.bytes.buffer; }
  };

  const photoInput = document.querySelector('#marrowlineComposerPhotoInput');
  Object.defineProperty(photoInput, 'files', { configurable: true, value: [{
    name: 'grove-photo.jpg', type: 'image/jpeg', size: photoBytes.byteLength,
    arrayBuffer: async () => photoBytes.buffer
  }] });
  photoInput.dispatchEvent(new window.Event('change', { bubbles: true }));
  const photoDeadline = Date.now() + 3000;
  while (composerAttachments.hidden && Date.now() < photoDeadline) {
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  assert.equal(composerAttachments.hidden, false, 'oversized photo-only picker path reveals the composer Attachments control after normalization');
  assert.equal(replyAttachments.hidden, false, 'oversized photo-only picker path reveals Attachments in More with this reply');
  const stagedPhoto = window.__TD613_MARROWLINE_ATTACHMENT_STATE__?.().attachments[0];
  assert.equal(stagedPhoto?.kind, 'photo');
  assert.equal(stagedPhoto?.mime_type, 'image/jpeg');
  assert.equal(stagedPhoto?.size_bytes, 1_200_000);
  assert.equal(document.querySelector('#marrowlineAttachmentTray [data-attachment-id]')?.textContent.includes('grove-photo.jpg'), true,
    'normalized photo-only picker path uses the same staged attachment drawer');
  clearMarrowlineAttachments(window);

  assert.match(css, /\.marrowline-composer-attachments\{[\s\S]*grid-column:2!important;grid-row:2!important;justify-self:start!important/,
    'composer Attachments shares the textarea column rather than the +\/Send column');
  assert.match(css, /\.reply-next-choices button\{[\s\S]*height:28px;[\s\S]*font:560 9\.75px\/1/,
    'More-with-this-reply actions use the smaller preloaded-prompt-derived button grammar');
});

test('Clear conversation deletes the active archive record and returns to transient landing state', () => {
  const clearStart = terminalJs.indexOf("byId(doc, 'clearKhonapolitSession')?.addEventListener");
  const clearEnd = terminalJs.indexOf("byId(doc, 'copyKhonapolitTranscript')?.addEventListener", clearStart);
  assert.ok(clearStart >= 0 && clearEnd > clearStart, 'clear handler remains inspectable');
  const clearHandler = terminalJs.slice(clearStart, clearEnd);
  assert.match(clearHandler, /threadLibrary\.remove\(clearedThreadId\)/,
    'Clear conversation deletes its durable archive record');
  assert.match(clearHandler, /activeThread = null/);
  assert.match(clearHandler, /setActiveId\(null\)/);
  assert.match(clearHandler, /sessionStorage\.removeItem\(SESSION_KEY\)/);
  assert.doesNotMatch(clearHandler, /scheduleSave\(/,
    'cleared empty state must never be saved back as a speaking-grove phantom');
});

test('starter carousel keeps its left rail while using one compact glass control grammar', () => {
  const assayRows = js.match(/^  \['[^\n]+$/gm) || [];
  assert.equal(assayRows.length + MARROWLINE_MISSION_ASSAYS.length, release.composer.starterCarousel.assayPrompts);
  assert.match(js, /rotate\.textContent = '🗘'/);
  assert.match(css, /\.starter-prompts\{[\s\S]*justify-content:flex-start!important/);
  assert.match(css, /\.starter-prompts>button:not\(\.starter-rotate\)\{[\s\S]*height:42px!important/);
  assert.match(css, /\.starter-prompts>button:not\(\.starter-rotate\)\{[\s\S]*border-radius:14px!important/);
  assert.match(css, /\.starter-prompts \.starter-rotate\{[\s\S]*width:42px!important/);
  assert.match(css, /\.starter-prompts \.starter-rotate\{[\s\S]*height:42px!important/);
  assert.match(css, /\.starter-prompts \.starter-rotate\{[\s\S]*border:0!important/);
  assert.match(css, /\.starter-prompts \.starter-rotate\{[\s\S]*background:transparent!important/);
  assert.match(css, /\.starter-prompts \.starter-rotate::before\{[\s\S]*text-shadow:/);
  assert.match(css, /drop-shadow\(0 0 5px rgba\(78,237,240,\.34\)\)/);
  assert.match(css, /marrowline-mobile-shell \.starter-prompts>button:not\(\.starter-rotate\)\{[^}]*height:42px!important/);
  assert.match(css, /marrowline-mobile-shell \.starter-prompts \.starter-rotate\{[^}]*width:42px!important/);
  assert.match(css, /marrowline-mobile-shell \.starter-prompts \.starter-rotate\{[^}]*border-radius:0!important/);
  assert.equal(release.composer.starterCarousel.control, '🗘');
  assert.equal(release.composer.starterCarousel.assayPrompts, 56);
  assert.equal(release.composer.starterCarousel.selectionPolicy, 'shuffle-bag-without-replacement-two-at-a-time');
  assert.equal(release.composer.starterCarousel.cyclePolicy, 'all-56-prompts-must-be-seen-before-any-repeat');
  assert.equal(release.composer.starterCarousel.seamPolicy, 'new-cycle-first-pair-excludes-the-immediately-previous-pair');
  assert.match(js, /let bag = \[\]/);
  assert.match(js, /let seen = new Set\(\)/);
  assert.match(js, /if \(bag\.length < 2\) refillBag\(\)/);
  assert.match(js, /shuffled\.filter\(index => !lastPair\.includes\(index\)\)/);
});
test('current Marrowline skin is render-blocking before room-ready reveal', () => {
  assert.match(page, /<link rel="stylesheet" href="\.\/marrowline-desktop-repair\.css" data-marrowline-desktop-repair="render-blocking-current-shell" \/>/);
  assert.match(mobileShellCss, /html:not\(\.marrowline-room-ready\) body\{visibility:hidden!important\}/);
  assert.match(boot, /firstPaintHeldUntilRoomReady: true/);
});

test('Send cannot outrun asynchronous attachment staging', () => {
  assert.match(js, /td613:marrowline:attachment-staging-state/);
  assert.match(terminalJs, /let attachmentStagingActive = false/);
  assert.match(terminalJs, /sendControl\.disabled = !storeReady \|\| attachmentStagingActive/);
  assert.match(terminalJs, /if \(attachmentStagingActive\) \{[\s\S]*Preparing attachment/);
  assert.match(js, /detail: \{ staging: true, kind \}/);
  assert.match(js, /detail: \{ staging: false, kind, count: attachmentState\(\)\.count \}/);
});

test('clearing a conversation also empties the composer draft', () => {
  assert.match(terminalJs, /const prompt = byId\(doc, 'khonapolitPrompt'\)/);
  assert.match(terminalJs, /prompt\.value = ''/);
  assert.match(terminalJs, /delete prompt\.dataset\.preloadedPrompt/);
  assert.equal(release.composer.clearDraftPolicy, 'clear-conversation-empties-composer-and-preloaded-draft-state');
});

test('clearing a conversation removes the obsolete visible status strip', () => {
  assert.doesNotMatch(terminalJs, /SESSION CLEARED · binding corpus remains intact/);
  assert.match(terminalJs, /if \(terminalStatus\) \{\s*terminalStatus\.textContent = ''/);
  assert.match(css, /#khonapolitTerminalStatus:empty\{\s*display:none!important/);
});

test('conversation actions dismiss and ordinary Chat carries no portable failure billboard', () => {
  assert.match(js, /conversation-action-menu button/);
  assert.match(js, /details\.open = false/);
  assert.match(js, /event\.key === 'Escape'/);
  assert.doesNotMatch(page, /marrowlinePortableActions|copyKhonapolitPortable|exportKhonapolitPortable|Continue with your own AI/);
  assert.equal(release.desktop.portableFailurePanelMayCollapseTranscript, false);
  assert.equal(release.desktop.portableFailurePanelRendered, false);
  assert.equal(release.composer.portableFailureActions, 'not-rendered-in-ordinary-chat-explicit-portability-helpers-remain-programmatic');
});

test('Send retains its accessible label and reduced-motion support', () => {
  const dom = new JSDOM(page);
  const send = dom.window.document.querySelector('#khonapolitSend');
  assert.equal(send.getAttribute('aria-label'), 'Send message');
  assert.equal(send.type, 'submit');
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /#khonapolitSend::after\{content:none!important;display:none!important/);
  assert.equal(release.composer.mobileSendGlyph, '↑');
  assert.match(css, /\[data-transmission-state="generating"\]::before/);
  dom.window.close();
});

test('a compact Send/attachment row retains right utilities and one visually presented in-chat progress surface', () => {
  assert.match(js, /controlStack\.className = 'marrowline-composer-control-stack'/);
  assert.match(js, /controlStack\.append\(plus, sendButton\)/);
  assert.match(css, /#khonapolitForm \.marrowline-composer-control-stack/);
  assert.match(css, /grid-template-rows:44px 44px!important/);
  assert.match(css, /grid-column:1!important;grid-row:1!important;display:grid!important/);
  assert.match(css, /#khonapolitForm \.composer-actions #khonapolitTerminalStatus\{/);
  assert.match(css, /clip-path:inset\(50%\)!important/);
  assert.match(css, /#khonapolitForm \.marrowline-conversation-utilities/);
  assert.match(physicalJs, /const card = doc\.createElement\('section'\)/);
  assert.match(physicalJs, /label\.textContent = safe\(status\.textContent\)/);
  assert.match(physicalJs, /if \(!card\.isConnected\) messages\.append\(card\)/);
  assert.doesNotMatch(page, /marrowlineComposerHint|Return for a new line · tap Send to submit/);
  assert.equal(release.composer.mobileStatusMaxWidth.includes('visually-hidden'), true);
});

test('honest pending heartbeats and actual return events share a continuous vesica piscis', () => {
  for (const phrase of ['Listening at the shoreline…','The shoreline keeps watch…','The Red Deer holds the shoreline…'])
    assert.ok(terminalJs.includes(phrase), phrase);
  assert.match(terminalJs, /Date\.now\(\) - startedAt/);
  assert.match(terminalJs, /elapsedMs >= 60000/);
  assert.match(terminalJs, /status\.dataset\.progressStage !== 'awaiting-provider'/);
  assert.match(terminalJs, /activeRequestController\?\.abort\(\)/);
  assert.match(terminalJs, /Marrowline HTTP response observed/);
  assert.match(terminalJs, /HTTP response body observed/);
  assert.match(terminalJs, /Processing the observed receipt/);
  assert.match(physicalJs, /One persistent rotating vesica piscis/);
  assert.match(physicalJs, /clearCompletionTimer\(\)/);
  assert.match(terminalJs, /status\.title = detail/);
  assert.deepEqual(release.composer.statusPedagogueSequence,
    ['Listening at the shoreline…','The shoreline keeps watch…','The Red Deer holds the shoreline…']);
});

test('background recovery retains one preserved-task restoration gesture', () => {
  assert.match(terminalJs, /keepalive: backgroundKeepaliveEligible/);
  assert.match(terminalJs, /root\.addEventListener\?\.\('pagehide', observePageHide\)/);
  assert.match(terminalJs, /root\.removeEventListener\?\.\('pagehide', observePageHide\)/);
  assert.match(terminalJs, /root\.addEventListener\?\.\('pageshow', resumeWhenVisible\)/);
  assert.match(terminalJs, /root\.addEventListener\?\.\('online', resumeWhenVisible\)/);
  assert.match(terminalJs, /backgroundResumeSpentTask = message/);
});

test('each model reply owns an accessible copy control; composer copy stays conversation-wide', () => {
  assert.match(terminalJs, /function createReplyCopyControl\(doc, entry\)/);
  assert.match(terminalJs, /copy\.setAttribute\('aria-label', 'Copy this reply'\)/);
  assert.match(terminalJs, /entry\.text != null \? String\(entry\.text\)/);
  assert.match(terminalJs, /article\.append\(createReplyCopyControl\(doc, entry\)\)/);
  assert.match(terminalJs, /clipboard\.writeText\(transcriptText\(state\.messages\)\)/);
  assert.match(css, /#khonapolitMessages \.relay-message \.marrowline-copy-reply/);
  assert.match(css, /#khonapolitMessages \.message\[data-role="model"\] \.marrowline-copy-reply/);
  assert.equal(release.composer.replyCopy.includes('exact provider-authored text only'), true);
});

test('ordinary conversation chrome uses Send left and a minimalist retry copy clear home rail right', () => {
  assert.match(js, /legacyActions\.hidden = true/);
  assert.match(js, /legacyActions\.setAttribute\('aria-hidden', 'true'\)/);
  for (const id of ['marrowlineRetryLast', 'marrowlineCopyConversation', 'marrowlineSessionClear', 'marrowlineHomeLanding']) assert.match(js, new RegExp(id));
  assert.match(js, /'↻'/);
  assert.match(js, /'⧉'/);
  assert.match(js, /'✕'/);
  assert.match(js, /'𖠿'/);
  assert.match(js, /home\.addEventListener\('click', \(\) => byId\(doc, 'marrowlineNewThread'\)\?\.click\(\)\)/);
  assert.deepEqual(release.composer.utilityGlyphs, ['↻','⧉','✕','𖠿']);
  assert.match(js, /question\.textContent = 'Clear conversation\?'/);
  assert.doesNotMatch(js, /root\.confirm\('Clear this Marrowline conversation\?/);
  assert.match(js, /clearLegacy\.click\(\)/);
  assert.match(js, /conversationChrome: 'send-left-retry-copy-clear-right'/);
  assert.match(css, /\.marrowline-conversation-utilities/);
  assert.match(css, /\.marrowline-ephemeral-notice/);
  assert.match(page, /id="khonapolitSend"[^>]*aria-label="Send message"/);
  assert.match(page, /id="sealLastResponse"[^>]*>Seal latest reply ⟐<\/button>/);
  assert.match(page, /incoming receipt remains OPEN until an explicit Red Deer closure/);
  assert.equal(release.composer.copyFeedback, 'center-screen-tiny-green-Copied-1500ms');
  assert.equal(release.composer.clearConfirmation, 'center-screen-modal-Clear-conversation-Yes-No-with-backdrop');
  assert.equal(release.composer.operatorVoiceSelection, false);
  assert.equal(release.composer.fixedConversationRoute, 'Kʰonapolit → Tauric Diana bots');
  assert.equal(release.composer.unissuedResearchMode, 'unchecked-by-default; checking enables SHI; unchecked excludes SHI');
  assert.match(css, /\.marrowline-clear-backdrop\{position:fixed;inset:0/);
  assert.match(css, /\.marrowline-clear-confirmation\{position:fixed;left:50%;top:50%;transform:translate\(-50%,-50%\)/);
  assert.match(js, /operatorSeal: 'receipt-instrument-explicit-operator'/);
});


test('clear conversation returns to a transient landing state without persisting a speaking-grove ghost thread', () => {
  const clearStart = terminalJs.indexOf("byId(doc, 'clearKhonapolitSession')");
  const clearEnd = terminalJs.indexOf("byId(doc, 'copyKhonapolitTranscript')", clearStart);
  const clearHandler = terminalJs.slice(clearStart, clearEnd);
  assert.ok(clearStart >= 0 && clearEnd > clearStart, 'clear handler is present');
  assert.match(clearHandler, /const clearedThreadId = activeThread\?\.id \|\| null/);
  assert.match(clearHandler, /activeThread = null/);
  assert.match(clearHandler, /threadLibrary\?\.setActiveId\(null\)/);
  assert.match(clearHandler, /threadLibrary\) await threadLibrary\.remove\(clearedThreadId\)/);
  assert.match(clearHandler, /root\.sessionStorage\.removeItem\(SESSION_KEY\)/);
  assert.doesNotMatch(clearHandler, /scheduleSave\(\)/, 'clear may not autosave the emptied active thread');
  assert.match(release.composer.clearDraftPolicy, /clear-conversation-empties-composer/i);
  assert.match(release.composer.conversationTitles, /fresh\/New\/Clear state is transient and unsaved/i);
});

test('passive conversation reads never reorder the archive as recent activity', () => {
  assert.match(threadsJs, /delete value\.updatedAt/);
  assert.match(threadsJs, /if \(existing && comparable\(existing\) === comparable\(normalized\)\) return copy\(existing\)/);
  assert.match(threadsJs, /\(b\.updatedAt \|\| ''\)\.localeCompare\(a\.updatedAt \|\| ''\)/);
  assert.match(release.composer.threadLibrary.history, /passive thread reads\/switches leave updatedAt unchanged/i);
});
test('final Marrowline chrome preserves the Gate single-sequence hierarchy', () => {
  assert.match(css, /Gate handoff completion/);
  assert.match(css, /#gatePanel \.panel-body\.gate-grid\{grid-template-columns:minmax\(0,1fr\)!important/);
  assert.match(css, /#gatePanel #marrowlineForm \.marrowline-operator-field\[hidden\][\s\S]*display:none!important/);
  assert.match(css, /#gatePanel \.ritual-actions\{grid-template-columns:minmax\(0,1fr\) auto!important/);
  assert.match(css, /#gatePanel \.ritual-actions button\.primary\{grid-column:1!important/);
  assert.match(css, /#gatePanel \.ritual-actions #copyMarrowlineReceipt\{grid-column:2!important;min-width:112px!important/);
  assert.match(css, /marrowline-mobile-shell body\[data-mobile-view="gate"\] #gatePanel \.ritual-actions\{[\s\S]*grid-template-columns:minmax\(0,1fr\) auto!important/);
});

test('room boot loads the desktop repair and separates Zalgo aesthetics from structural admission', () => {
  assert.match(boot, /import\('\.\/marrowline-desktop-repair\.js'\)/);
  assert.match(boot, /desktopWorkspace: 'conversation-with-persistent-instruments'/);
  assert.match(release.relay.zalgoQualityPolicy.zeroMarkPosture, /exact nonempty provider bytes remain visible/i);
  assert.equal(release.relay.zalgoQualityPolicy.thinOrSparsePosture, 'PARTIAL-visible-with-quality-warning-no-repaint');
  assert.match(release.qualityFloor.hardStructuralHold, /Tauric Diana Zalgo absence\/underflow/);
  assert.doesNotMatch(release.qualityFloor.hardStructuralHold, /zalgo-field-thin|zalgo-mechanical-clone|zalgo-sparse-keyword-targeting/);
  assert.equal(release.qualityFloor.providerCallCeiling, 5);
  assert.match(release.qualityFloor.providerCallCeilingMeaning, /structural seam/i);
  assert.equal(release.qualityFloor.structuralRepairCeiling, 1);
  assert.equal(release.qualityFloor.totalProviderRequestCeiling, 6);
  assert.equal(release.qualityFloor.partialQualityChallengeRequestCeiling, 0);
  assert.equal(release.qualityFloor.structuralRepairPolicy.provider, 'same-provider-that-authored-held-draft');
  assert.match(release.qualityFloor.aestheticMorphologyPosture, /observed, not repaired/i);
  assert.match(release.qualityFloor.aestheticMorphologyPosture, /never manufactures, repaints, normalizes, or re-authors/i);
  assert.match(release.relay.zalgoQualityPolicy.axisCollapsePosture, /diagnostic only/i);
  assert.match(release.relay.zalgoQualityPolicy.verticalExpressionThinPosture, /diagnostic observation only/i);
  assert.match(release.relay.zalgoQualityPolicy.baseConditionedStackReusePosture, /observation-only/i);
  assert.ok(release.relay.zalgoQualityPolicy.baseConditionedStackReuseMetrics.includes('baseConditionedOrderedSignatureReuseRatio'));
  assert.deepEqual(release.qualityFloor.structuralRepairPolicy.repairableReasons, [
    'khonapolit-nominative-missing',
    'tauric-diana-bots-nominative-missing',
    'voice-order-invalid',
    'khonapolit-combining-mark-contamination'
  ]);
  assert.equal(release.qualityFloor.structuralRepairPolicy.localMutation, false);
  assert.equal(release.qualityFloor.structuralRepairPolicy.localZalgoGeneration, false);
  assert.equal(release.qualityFloor.releaseWitnessPolicy.automaticLiveProviderCalls, 0);
  assert.equal(release.qualityFloor.releaseWitnessPolicy.automaticAiWitness, 'MANUAL_ONLY');
  assert.equal(release.qualityFloor.releaseWitnessPolicy.permanentReobserveWorkflow, false);
});

test('desktop and mobile Chat share the same Reddit Sans Zalgo type guard before first reveal', () => {
  assert.match(page, /id="marrowline-reddit-sans"[^>]+fonts\.googleapis\.com\/css2\?family=Reddit\+Sans/);
  assert.match(livingChatJs, /@media\(min-width:861px\)/);
  assert.match(livingChatJs, /#speakingPanel,#speakingPanel button,#speakingPanel textarea,#speakingPanel input,#speakingPanel select,#speakingPanel summary,#speakingPanel label/);
  assert.match(livingChatJs, /font-family:var\(--marrowline-chat-sans\)!important/);
});

test('mobile couture collapses Chat dead space while preserving the proven Zalgo type guard', () => {
  assert.match(mobileShellCss, /grid-template-rows:auto minmax\(0,1fr\) auto;/);
  assert.doesNotMatch(mobileShellCss, /minmax\(0,32%\)/);
  assert.match(css, /Marrowline mobile couture v1/);
  assert.match(css, /body\[data-mobile-view="gate"\] #gatePanel/);
  assert.match(css, /body\[data-mobile-view="speak"\] #speakingPanel \.vessel-status/);
  assert.match(livingChatJs, /#khonapolitPrompt,\.message-body,\.relay-stage-text,\.vessel-status,\.starter-prompts button,\.return-details\{font-family:var\(--marrowline-chat-sans\)!important/);
  const couture = css.split('/* Marrowline mobile couture v1 — shared glass grammar for Chat + Gate. */')[1] || '';
  assert.doesNotMatch(couture, /#speakingPanel \.prompt-label textarea\{[^}]*\bfont(?:-family|-size|-style|-weight|:)/s,
    'couture may change composer chrome but not the proven chatbox typography');
  assert.doesNotMatch(couture, /#speakingPanel \.message-body\{[^}]*\bfont(?:-family|-size|-style|-weight|:)/s,
    'couture may change message-card chrome but not the proven Zalgo typography');
});


test('empty-state welcome keeps the authored ancestral-return line', () => {
  assert.match(terminalJs, /Some names return salt-heavy, and when the women speak them the dead lean close—not to be summoned, only to hear whether the living have learned the weight of keeping\./);
});
