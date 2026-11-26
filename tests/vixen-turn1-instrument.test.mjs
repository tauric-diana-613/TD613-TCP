import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const vixHtmlUrl = new URL('../app/encyclopedia/vix-cyb.html', import.meta.url);
const llmsUrl = new URL('../app/encyclopedia/vix-cyb/llms.txt', import.meta.url);
const podiumHtmlUrl = new URL('../app/encyclopedia/vix-cyb/podium.html', import.meta.url);
const humanPodiumHtmlUrl = new URL('../app/encyclopedia/vix-cyb/human-podium.html', import.meta.url);

const html = await readFile(vixHtmlUrl, 'utf8');
const llmsTxt = await readFile(llmsUrl, 'utf8');
const podiumHtml = await readFile(podiumHtmlUrl, 'utf8');
const humanPodiumHtml = await readFile(humanPodiumHtmlUrl, 'utf8');
const salonModSrc = await readFile(new URL('../app/encyclopedia/vixen-estate/synthesis-salon.mjs', import.meta.url), 'utf8');
const corpus = JSON.parse(html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/)[1]);

test('RP-06: filename search works across hybrid, lexical, phrase, and exact shard UTF-8 modes', async () => {
  const searchMod = await import('../app/encyclopedia/vixen-estate/semantic-semiotic-search.mjs');
  const corpusMod = await import('../app/encyclopedia/vixen-estate/corpus-experiment-a.mjs');
  const engine = await searchMod.loadSemanticSemioticEngine();

  for (const mode of ['hybrid', 'lexical', 'phrase']) {
    const res = engine.search('LLM Architecture Deep Dive', { mode, limit: 8 });
    assert.ok(res.hits.length >= 1, `Expected hit in ${mode} mode`);
    assert.equal(res.hits[0].work_id, 'emwork_48f6c55fadb2e4d6b9dc4be8', `Expected emwork_48f6... first in ${mode}`);
    const filesJoined = [res.hits[0].original_filename || '', ...(res.hits[0].original_filenames || [])].join(' ');
    assert.match(filesJoined, /LLM Architecture Deep Dive\.md/);
  }

  const exactRes = await corpusMod.exactSearchInExperimentAShards('LLM Architecture Deep Dive', { limit: 8 });
  assert.ok(exactRes.hits.length >= 1, 'Expected exact shard hit for filename query');
  assert.ok(exactRes.hits.some((h) => h.source_file_id === 'emsrc_31ed6fb3bdc15d3c29b8ae13' && h.match_locus === 'ORIGINAL_FILENAME'));

  const negRes = engine.search('"viability bypass"', { mode: 'phrase', limit: 8 });
  assert.equal(negRes.hits.some((h) => h.phrase_verification === 'BODY_VERIFIED_PHRASE'), false);
});

test('RP-08: PDF reflow avoids 1-word micro-paragraphs and Markdown reader renders GFM tables & inline base64 images', async () => {
  const readerMod = await import('../app/encyclopedia/vixen-estate/manuscript-reader.mjs');
  const corpusMod = await import('../app/encyclopedia/vixen-estate/corpus-experiment-a.mjs');
  const pdfRec = await corpusMod.loadExperimentABodyBySourceId('emsrc_ae5d4155056773c8a50db1b9');
  const lineation = readerMod.projectManuscriptLineation(pdfRec.text_body, {
    sourceFormat: 'application/pdf',
    documentTitle: 'The Architecture of Control'
  });
  const shortParas = lineation.text.split(/\n\n+/).filter((p) => p.trim().split(/\s+/).length <= 2);
  assert.ok(lineation.collapsed_micro_paragraphs >= 50 || shortParas.length < 15, `Too many micro-paragraphs after PDF reflow: ${shortParas.length}`);

  const sampleMd = [
    '# Sample Title',
    '',
    '| Axis | Value |',
    '| :--- | :--- |',
    '| Clock | 48 kHz |',
    '',
    '![Diagram][image1]',
    '',
    '[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==>'
  ].join('\n');

  const dom = new JSDOM('<!doctype html><html><body><div id="mount"></div></body></html>');
  const prevDoc = globalThis.document;
  try {
    globalThis.document = dom.window.document;
    const mount = dom.window.document.getElementById('mount');
    const out = readerMod.mountVixenManuscript(mount, sampleMd, { showRaw: true, sourceFormat: 'text/markdown' });
    assert.equal(out.displayed_complete, true);
    assert.equal(mount.querySelectorAll('table.vix-reader-table').length, 1);
    assert.equal(mount.querySelectorAll('img.vix-reader-inline-img').length, 1);
    const proseText = Array.from(mount.querySelectorAll('.vix-reader-paragraph, .vix-reader-heading, .vix-reader-table'))
      .map((node) => node.textContent)
      .join(' ');
    assert.ok(!proseText.includes('[image1]: <data:image/png'), 'Prose should not dump raw base64 reference definition');
    assert.ok(mount.querySelector('.vix-reader-raw pre').textContent.includes('[image1]: <data:image/png'), 'Raw source pre must remain intact');
  } finally {
    if (prevDoc === undefined) delete globalThis.document;
    else globalThis.document = prevDoc;
    dom.window.close();
  }
});

test('Public copy scrubs Phasonic Counterpoint & Empty Operahouse while preserving TD613 Encyclopedia', async () => {
  const { translatePublicCopy } = await import('../app/encyclopedia/vixen-estate/vixen-opera-public-copy.mjs');
  const { scoreUnifiedSynthesisCandidates } = await import('../app/encyclopedia/vixen-estate/synthesis-salon-engine.mjs');

  assert.equal(translatePublicCopy('Return to TD613 Encyclopedia and TD613 host'), 'Return to TD613 Encyclopedia and the research host host');
  const bodyHtml = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  assert.doesNotMatch(bodyHtml, /Phasonic\s+Counterpoint/i);
  assert.doesNotMatch(bodyHtml, /The\s+Empty\s+Operahouse/i);
  assert.doesNotMatch(llmsTxt, /Phasonic\s+Counterpoint/i);
  assert.doesNotMatch(llmsTxt, /The\s+Empty\s+Operahouse/i);

  const ranked = scoreUnifiedSynthesisCandidates(corpus, { lagTicks: 36 });
  assert.equal(ranked.candidates[0].id, 'cand-phasonic-frontispiece');
  assert.doesNotMatch(ranked.candidates[0].title, /Phasonic/i);
  assert.doesNotMatch(ranked.candidates[0].headerTagline, /Phasonic/i);
});

test('Seven enriched conjectures include attributable filenames, mechanism vs metaphor, counterexample, and multi-axis coordinates', async () => {
  const { synthesizeOutsidePerspectiveConjectures } = await import('../app/encyclopedia/vixen-estate/synthesis-salon-engine.mjs');
  const list = synthesizeOutsidePerspectiveConjectures(corpus, { lagTicks: 36, limit: 7 });
  assert.equal(list.length, 7);
  for (const item of list) {
    assert.ok(Array.isArray(item.attributable_filenames) && item.attributable_filenames.length >= 1, item.id + ' needs filenames');
    assert.ok(['STRUCTURAL_MECHANISM_HYPOTHESIS', 'DIAGNOSTIC_METAPHOR_GUARD'].includes(item.mechanism_vs_metaphor?.classification));
    assert.ok(typeof item.competing_interpretation === 'string' && item.competing_interpretation.length > 10);
    assert.ok(typeof item.counterexample === 'string' && item.counterexample.length > 10);
    assert.ok(typeof item.exposed_assumption === 'string' && item.exposed_assumption.length > 10);
    assert.equal(item.diagnostic_coordinates?.provenance_class, 'OUTSIDE_PERSPECTIVE_SYNTHESIS_CONJECTURE');
    assert.ok(Number.isFinite(item.diagnostic_coordinates?.source_relevance));
  }
});

test('Seam Allowance Header, Empty Cart Badge, Catalogue Sort/PDF Truth & Separate Podium HTML contracts hold', () => {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const entDom = new JSDOM(podiumHtml);
  const entDoc = entDom.window.document;
  const humDom = new JSDOM(humanPodiumHtml);
  const humDoc = humDom.window.document;

  assert.equal(doc.querySelectorAll('.vixen-room-rail .vixen-room').length, 8);
  assert.ok(doc.querySelector('#vixenReturnLink')?.textContent.includes('⌂'));
  assert.ok(doc.querySelector('#vixenHistoryBack')?.textContent.includes('🢔'));
  assert.ok(doc.querySelector('#vixenHistoryForward')?.textContent.includes('🢖'));
  assert.equal(doc.getElementById('searchShortcutKbd'), null);
  assert.ok(doc.getElementById('researchCartBtn'));
  assert.equal(doc.getElementById('collectionCount')?.hidden, true);
  assert.equal(doc.getElementById('collectionCount')?.textContent.trim(), '', 'Empty cart badge must have zero counter text');
  assert.equal(doc.getElementById('vixenCarryCount')?.textContent.trim(), '', 'Empty carry rail must not display 0');
  assert.ok(!doc.getElementById('motionBtn')?.textContent.includes('Still'));
  assert.ok(doc.getElementById('headerHelpBtn')?.textContent.includes('Need help?'));

  const popout = doc.getElementById('researchCartPopout');
  assert.ok(popout?.hidden);
  assert.ok(popout.querySelector('#exportTrayBtn')?.disabled);
  assert.ok(popout.querySelector('#footerSaveSessionBtn'));
  assert.ok(popout.querySelector('#collectionItemsContainer'));

  const sortOptions = [...doc.querySelectorAll('#workSortSelect option')].map((o) => o.value);
  assert.ok(sortOptions.includes('date'), 'Catalogue sort must include recorded date option');
  assert.ok(sortOptions.includes('author'), 'Catalogue sort must include established author option');
  assert.ok(doc.getElementById('workSortOrderBtn'));
  assert.ok(doc.getElementById('workSortNotice'));
  assert.match(html, /\.extracted\.txt/, 'Works PDF downloads must use .extracted.txt derivative extension');
  assert.match(salonModSrc, /\.extracted\.txt/, 'Salon PDF downloads must use .extracted.txt derivative extension');

  const salon = doc.getElementById('view-collection');
  assert.ok(salon.querySelector('#salonInviteAiBtn'));
  assert.ok(salon.querySelector('#salonLiveBrief'));
  assert.ok(salon.querySelector('#salonMathCrib'));
  assert.ok(salon.querySelector('#salonManifestoPanel'));
  assert.equal(salon.querySelector('#vixenAiJourney'), null);
  assert.equal(doc.getElementById('view-podium-threshold'), null);
  assert.equal(doc.getElementById('view-podium'), null);

  const footer = doc.querySelector('footer.footer');
  assert.equal(footer.querySelector('#footerVixenWordmark')?.dataset.coutureSlot, 'footer-wordmark');
  assert.equal(footer.querySelector('#footerEncyclopediaLink')?.textContent.trim(), '𝌋 TD613 Encyclopedia →');
  assert.equal(footer.querySelector('#footerPodiumLink')?.getAttribute('href'), './vix-cyb/podium.html');
  assert.equal(footer.querySelector('#footerSaveSessionBtn'), null);
  assert.equal(footer.querySelector('[data-view="operator"]'), null);

  assert.equal(entDoc.getElementById('podiumDoorHuman')?.getAttribute('href'), './human-podium.html');
  assert.equal(entDoc.getElementById('podiumDoorAi')?.getAttribute('href'), './llms.txt');
  assert.doesNotMatch(podiumHtml, /http-equiv="refresh"/i, 'podium.html must be a genuine destination, not a redirect');

  const podium = humDoc.getElementById('view-podium');
  assert.ok(podium.querySelector('#vixenAiJourney'));
  assert.ok(podium.querySelector('#view-operator'));
  assert.ok(humDoc.getElementById('vmaRestoreBanner'));
  assert.equal(humDoc.getElementById('humanPodiumLlmLink')?.getAttribute('href'), './llms.txt');
  assert.equal(podium.querySelectorAll('[data-podium-tab]').length, 4);

  dom.window.close();
  entDom.window.close();
  humDom.window.close();
});
