import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as corpusMod from '../app/encyclopedia/vixen-estate/corpus-experiment-a.mjs';
import * as searchMod from '../app/encyclopedia/vixen-estate/semantic-semiotic-search.mjs';
import {
  deriveDesignGrammarSynthesis,
  AVAILABLE_INSTRUMENTS
} from '../app/encyclopedia/vixen-estate/dollhouse-design-grammar.mjs';
import {
  deriveSynthesisHeadline,
  scoreUnifiedSynthesisCandidates
} from '../app/encyclopedia/vixen-estate/synthesis-salon-engine.mjs';
import { createVixenPodium, PODIUM_SCHEMA } from '../app/encyclopedia/reference/vixen-podium.mjs';

const estateDir = new URL('../app/encyclopedia/vixen-estate/', import.meta.url);
const vixHtmlUrl = new URL('../app/encyclopedia/vix-cyb.html', import.meta.url);
const repoRoot = fileURLToPath(new URL('../', import.meta.url));

/** Build a minimal uncompressed (STORE method=0) PKZIP OOXML .docx buffer in memory for client parser tests. */
function makeSyntheticDocxBytes(paragraphs) {
  const escXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const xmlText =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
    paragraphs.map((p) => `<w:p><w:r><w:t>${escXml(p)}</w:t></w:r></w:p>`).join('') +
    '</w:body></w:document>';
  const nameBytes = Buffer.from('word/document.xml', 'utf8');
  const dataBytes = Buffer.from(xmlText, 'utf8');

  const lfh = Buffer.alloc(30 + nameBytes.length);
  lfh.writeUInt32LE(0x04034b50, 0);
  lfh.writeUInt16LE(20, 4);
  lfh.writeUInt16LE(0, 6);
  lfh.writeUInt16LE(0, 8); // STORE
  lfh.writeUInt32LE(0, 14); // crc dummy
  lfh.writeUInt32LE(dataBytes.length, 18);
  lfh.writeUInt32LE(dataBytes.length, 22);
  lfh.writeUInt16LE(nameBytes.length, 26);
  lfh.writeUInt16LE(0, 28);
  nameBytes.copy(lfh, 30);

  const cdOffset = lfh.length + dataBytes.length;
  const cdh = Buffer.alloc(46 + nameBytes.length);
  cdh.writeUInt32LE(0x02014b50, 0);
  cdh.writeUInt16LE(20, 4);
  cdh.writeUInt16LE(20, 6);
  cdh.writeUInt16LE(0, 8);
  cdh.writeUInt16LE(0, 10);
  cdh.writeUInt32LE(dataBytes.length, 20);
  cdh.writeUInt32LE(dataBytes.length, 24);
  cdh.writeUInt16LE(nameBytes.length, 28);
  nameBytes.copy(cdh, 46);

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(1, 8);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(cdh.length, 12);
  eocd.writeUInt32LE(cdOffset, 16);

  return new Uint8Array(Buffer.concat([lfh, dataBytes, cdh, eocd]));
}

/** Build minimal valid PNG header + IHDR bytes (no fake OCR allowed). */
function makeSyntheticPngBytes(width, height) {
  const buf = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
  buf.writeUInt32BE(13, 8);
  buf.write('IHDR', 12, 'ascii');
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  buf[24] = 8; // bit depth
  buf[25] = 6; // RGBA
  return new Uint8Array(buf);
}

test('Experiment-A shards and semantic-semiotic index satisfy budget, custody, and non-collapse counts', async () => {
  const idxStat = await stat(new URL('semantic-semiotic-index.v1.json', estateDir));
  assert.ok(idxStat.size > 200_000 && idxStat.size < 2_000_000, `Expected compact index <2MB, got ${idxStat.size}`);

  const p1 = await corpusMod.loadExperimentAShard('part1');
  const p2 = await corpusMod.loadExperimentAShard('part2');
  assert.equal(p1.shard, 1);
  assert.equal(p2.shard, 2);

  const totalSources = Object.keys(p1.sources).length + Object.keys(p2.sources).length;
  assert.equal(totalSources, 53);
  assert.deepEqual(p1.batch_b_files, [], 'A0 baseline must exclude held-out manuscript metadata and bodies');

  const mdRec = await corpusMod.loadExperimentABodyBySourceId('emsrc_b7e4e42924d33bdaf666a4f8');
  assert.equal(mdRec.custody_status, 'EXPERIMENT_A_PREVIEW_AUTHORIZED');
  assert.equal(mdRec.native_text_sha256_exact_match, true);
  assert.ok(mdRec.text_body.length > 10_000);
  const liveSha = await corpusMod.computeSha256HexAsync(mdRec.text_body);
  assert.equal(liveSha, mdRec.declared_source_sha256);

  const pdfRec = await corpusMod.loadExperimentABodyBySourceId('emsrc_a3675ad3117d3d35cb099ceb');
  assert.equal(pdfRec.custody_status, 'EXPERIMENT_A_PREVIEW_AUTHORIZED');
  assert.equal(pdfRec.body_representation, 'EXTRACTED_NATIVE_PDF_TEXT');
  assert.equal(pdfRec.binary_pdf_sha256_verified, false);
  assert.ok(pdfRec.text_body.length > 5_000);

  const instRec = await corpusMod.loadInstrumentBodyById('LINEAGE_ASSAY_PROTOCOL');
  assert.equal(instRec.custody_status, 'EXPERIMENT_A_PREVIEW_AUTHORIZED');
  assert.equal(instRec.standalone_executors_in_lineage, 0);
  assert.ok(instRec.text_body.length > 500);
});

test('Experiment-A readable corpus remains authorized across local, preview and production-labeled build environments; Experiment C main release requires separate server gate', () => {
  const prevRes = corpusMod.resolveExperimentACustody({ deployment_env: 'VERCEL_PREVIEW', custody_layer: 'DERIVATIVE_OR_MD' });
  assert.equal(prevRes.status, 'EXPERIMENT_A_PREVIEW_AUTHORIZED');
  assert.equal(prevRes.authorized, true);
  assert.equal(prevRes.readable, true);
  assert.equal(prevRes.empirical_replication_credit, 0);
  assert.equal(prevRes.human_closure_required, true);

  const batchRes = corpusMod.resolveExperimentACustody({ deployment_env: 'VERCEL_PREVIEW', custody_layer: 'BATCH_B_PENDING_PDF' });
  assert.equal(batchRes.status, 'EXPERIMENT_A_METADATA_ONLY_BINARY_PENDING_UPLOAD');
  assert.equal(batchRes.readable, false);

  const productionLabeledExperimentA = corpusMod.resolveExperimentACustody({ deployment_env: 'PRODUCTION', operator_secret_verified: false });
  assert.equal(productionLabeledExperimentA.status, 'EXPERIMENT_A_PREVIEW_AUTHORIZED');
  assert.equal(productionLabeledExperimentA.authorized, true);
  assert.equal(productionLabeledExperimentA.readable, true);
  assert.equal(productionLabeledExperimentA.empirical_replication_credit, 0);
  assert.equal(corpusMod.EXPERIMENT_A_CUSTODY_POLICY.experiment_c_main_release_gate,
    'SERVER_SIDE_GIVING_STYLE_SECRET_NOT_YET_IMPLEMENTED');
  for (const environment of ['EXPERIMENT_A_LOCAL', 'VERCEL_PREVIEW', 'PRODUCTION']) {
    const gate = corpusMod.resolveExperimentACustody({ deployment_env: environment });
    assert.equal(gate.readable, true);
    assert.equal(gate.authorized, true);
  }
});

test('Semantic-Semiotic engine retrieves across all readable corpus strata while enforcing negative canary, Cross-Opera quarantine, Unicode, and [32,40] non-collapse', async () => {
  const eng = await searchMod.loadSemanticSemioticEngine();

  const qAlg = eng.search('algedonic bypass viability', { limit: 15 });
  assert.equal(qAlg.status, 'SEARCH_OK');
  assert.equal(qAlg.empirical_replication_credit, 0);
  assert.equal(qAlg.human_closure_required, true);
  assert.ok(qAlg.aperture_observability.condition_number_kappa > 1);
  assert.ok(qAlg.hits.some((h) => h.unit_kind === 'synthesis_folio' && h.id === 'TCC-05'));
  assert.ok(qAlg.hits.some((h) => h.unit_kind === 'source_passage' && h.work_id === 'emwork_085223e721130117f5510975'));
  for (const h of qAlg.hits) {
    assert.ok(['NONE', 'TERM_COOCCURRENCE', 'MOTIF_MATCH', 'STRUCTURAL_ANALOGY_CANDIDATE'].includes(h.highest_rung));
  }

  const qSpsc = eng.search('SPSC lock-free memory barrier', { limit: 10 });
  assert.equal(qSpsc.status, 'SEARCH_OK');
  assert.equal(qSpsc.hits[0].source_file_id, 'emsrc_2ddaf8197adecc8c5ba09c33');

  assert.equal(eng.sourcesMeta.some(m => m.cust === 'EXPERIMENT_A_METADATA_ONLY_BINARY_PENDING_UPLOAD'), false,
    'No held-out metadata may reach the full index');

  const qImg = eng.search('sculptural frontispiece chrome astrolabe', { limit: 5 });
  assert.equal(qImg.status, 'SEARCH_OK');
  assert.ok(qImg.hits.some((h) => h.id.startsWith('asset-frontispiece-')));

  // Paired .md and .pdf manifestations remain split under [32, 40]
  const pairHits = qAlg.hits.filter((h) => h.work_id === 'emwork_085223e721130117f5510975');
  assert.ok(pairHits.every((h) => h.paired_manifestation_preserved === true));

  // Unicode & ZWNJ & PUA/Tetragram non-collapse
  const qGlyph = eng.search('𝌋 non-collapse control plane', { limit: 8 });
  assert.equal(qGlyph.status, 'SEARCH_OK');
  assert.equal(qGlyph.semiotic_markers_detected.has_orchestrator_glyph, true);
  assert.ok(qGlyph.semiotic_markers_detected.planes.includes('S-PLANE'));

  // Negative canary MUST return zero hits in both full engine and inline fallback
  const canary = eng.search('qxzkv_nonexistent_canary_991');
  assert.equal(canary.status, 'OOV_ALPHABETIC_CANARY_ABSTENTION');
  assert.equal(canary.total_hits, 0);
  assert.deepEqual(canary.hits, []);

  // Cross-Opera quarantine MUST return zero hits
  const cross1 = eng.search('Eclipse-Omega');
  assert.equal(cross1.status, 'CROSS_OPERA_QUARANTINED');
  assert.equal(cross1.total_hits, 0);
  const cross2 = eng.search('G-001');
  assert.equal(cross2.status, 'CROSS_OPERA_QUARANTINED');
  assert.equal(cross2.total_hits, 0);
});

test('Multi-format local adapter extracts OOXML .docx, preserves UTF-8 ZWNJ/𝌋, and refuses fake OCR on binary images/PDFs', async () => {
  const docxBytes = makeSyntheticDocxBytes([
    'Algedonic Control Channel Khona\u200Clit-po',
    'Glyph 𝌋 must remain distinct from PUA 􍘓.'
  ]);
  const docxParsed = await searchMod.parseLocalDocument(docxBytes, 'experiment-a-sample.docx');
  assert.equal(docxParsed.format, 'docx');
  assert.equal(docxParsed.custody_status, 'EXPERIMENT_A_LOCAL_INSPECTOR_ONLY_NON_AUTHORITATIVE');
  assert.match(docxParsed.text_body, /Algedonic Control Channel/);
  assert.ok(docxParsed.text_body.includes('Khona\u200Clit-po'));
  assert.ok(docxParsed.text_body.includes('𝌋'));
  assert.ok(docxParsed.text_body.includes('􍘓'));

  const pngBytes = makeSyntheticPngBytes(3040, 1616);
  const pngParsed = await searchMod.parseLocalDocument(pngBytes, 'frontispiece-test.png');
  assert.equal(pngParsed.format, 'png');
  assert.equal(pngParsed.body_representation, 'IMAGE_METADATA_ONLY_NO_OCR');
  assert.equal(pngParsed.text_body, null);
  assert.deepEqual(pngParsed.dimensions, [3040, 1616]);
  assert.match(pngParsed.metadata_summary, /3040x1616/);
});

test('Dollhouse Design grammar engine scores and promotes cand-phasonic-frontispiece without boilerplate', async () => {
  assert.ok(AVAILABLE_INSTRUMENTS && Object.keys(AVAILABLE_INSTRUMENTS).length >= 4);
  const html = await readFile(vixHtmlUrl, 'utf8');
  const corpus = JSON.parse(html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/)[1]);
  const grammar = deriveDesignGrammarSynthesis({ corpus });
  assert.equal(grammar.empirical_replication_credit, 0);
  assert.equal(grammar.human_closure_required, true);
  assert.ok(grammar.inferred_instruments.includes('PHASONIC_COUNTERPOINT'));

  const ranked = scoreUnifiedSynthesisCandidates(corpus, { lagTicks: 36 });
  assert.equal(ranked.candidates[0].id, 'cand-phasonic-frontispiece');
  const headline = deriveSynthesisHeadline({ corpus });
  assert.equal(headline.regime, 'PHASONIC_COUNTERPOINT_SYNTHESIS');
  assert.equal(headline.provenance.selected_candidate_id, 'cand-phasonic-frontispiece');
  assert.equal(headline.provenance.empirical_replication_credit, 0);
  assert.equal(headline.provenance.human_closure_required, true);
  assert.equal(/\bTHE\s+ARCHITECTURE\s+OF\b/i.test(headline.patternSubtitle), false);
});

test('Podium bounded ATLAS adapter executes vixen_semantic_search while keeping HELD advisory ceiling', async () => {
  const html = await readFile(vixHtmlUrl, 'utf8');
  const corpus = JSON.parse(html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/)[1]);
  const { createPodiumNativeReadAdapters } = await import('../scripts/vixen-podium-native-adapters.mjs');
  const engineAdapters = await createPodiumNativeReadAdapters();
  const mockMem = {
    open: async () => ({ state: 'CENSUS_MATCHED' }),
    search: () => [],
    getRecord: async () => ({}),
    related: () => [],
    status: () => ({ state: 'UNOPENED' })
  };
  const podium = createVixenPodium({
    corpus,
    membrane: mockMem,
    operatorAuthorized: true,
    engineAdapters
  });
  const res = await podium.dispatch({
    schema: PODIUM_SCHEMA,
    intent: 'engine.invoke',
    params: {
      engine: 'ATLAS',
      operation: 'vixen_semantic_search',
      payload: { query: 'algedonic bypass viability', limit: 5 }
    }
  });
  assert.equal(res.status, 'HELD');
  assert.ok(res.result.output, JSON.stringify(res.result));
  assert.equal(res.result.output.status, 'SEARCH_OK');
  assert.equal(res.result.output.empirical_replication_credit, 0);
  assert.ok(res.result.output.hits.length >= 1);
});

test('vix-cyb.html runtime and static audit confirm zero stale offline-custody leakage outside frozen bundle and negative-canary zero in DOM', async () => {
  const html = await readFile(vixHtmlUrl, 'utf8');
  assert.equal(html.includes('Eclipse-Omega'), false);
  assert.equal(html.includes('Eclipse–Omega'), false);
  assert.equal(html.includes('G-001'), false);

  const bundleStart = html.indexOf('<script id="vixen-corpus-bundle"');
  const bundleEnd = html.indexOf('</script>', bundleStart);
  const h1Start = html.indexOf('<script type="application/json" id="vixen-astra-handoff"');
  const h1End = html.indexOf('</script>', h1Start);
  const nonFrozenHtml =
    html.slice(0, h1Start) +
    html.slice(h1End, bundleStart) +
    html.slice(bundleEnd);

  assert.equal(/reserved in secure offline custody/i.test(nonFrozenHtml), false);
  assert.equal(/UNAVAILABLE_IN_PUBLIC_SURFACE/.test(nonFrozenHtml), false);
  assert.equal(/Manuscript Body Reserved/.test(nonFrozenHtml), false);

  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM(html, {
    url: 'http://127.0.0.1/encyclopedia/vix-cyb.html',
    runScripts: 'dangerously',
    resources: 'usable'
  });
  try {
    await new Promise((r) => setTimeout(r, 80));
    const api = dom.window.VixenReference;
    assert.ok(api);
    assert.equal(api.search('qxzkv_nonexistent_canary_991').length, 0);
    const det = api.searchDetailed('qxzkv_nonexistent_canary_991');
    assert.equal(det.total_hits, 0);
    assert.equal(det.empirical_replication_credit, 0);
    const workRec = api.get('emwork_085223e721130117f5510975');
    assert.equal(workRec.custody_status, 'EXPERIMENT_A_PREVIEW_AUTHORIZED');
    assert.equal(JSON.parse(dom.window.document.getElementById('vixen-corpus-bundle').textContent).batch_b_files.length,0);
    assert.equal(dom.window.document.querySelector('[data-work-cluster="BATCH_B"]'),null);

    // Verify Pedagogue search UI mode pills & inline Wendbine search parity (quotes, -exclude, custody)
    const modeBtns = dom.window.document.querySelectorAll('#globalSearchModes [data-search-mode]');
    assert.equal(modeBtns.length, 5);
    const productionLabeledSearch = api.searchDetailed('algedonic', { deployment_env: 'PRODUCTION', operator_secret_verified: false });
    assert.notEqual(productionLabeledSearch.status, 'PRODUCTION_OPERATOR_SECRET_REQUIRED');
    assert.ok(productionLabeledSearch.total_hits > 0);
  } finally {
    dom.window.close();
  }
});

test('Wendbine hardening: streamed byte cap, fatal UTF-8 decode, sealed shard verification & tamper rejection before caching', async () => {
  const sealsCheck = await corpusMod.verifyExperimentAShards();
  assert.equal(sealsCheck.verified, true);
  assert.equal(sealsCheck.status, 'SHARD_SEALS_VERIFIED');
  assert.equal(sealsCheck.empirical_replication_credit, 0);
  assert.equal(sealsCheck.sources_verified, 53);
  assert.equal(sealsCheck.instruments_verified, 21);
  assert.equal(sealsCheck.batch_b_pending_count, 0);

  // Fatal UTF-8 check on parseLocalDocument with malformed UTF-8 sequence [0xFF, 0xFE, 0xFD]
  await assert.rejects(
    () => searchMod.parseLocalDocument(new Uint8Array([0xff, 0xfe, 0xfd]), 'corrupt.md'),
    /INVALID_UTF8|The encoded data was not valid/i
  );

  // Streamed byte cap rejection & tampered SHA-256 rejection before caching via mock fetch
  const origFetch = globalThis.fetch;
  try {
    // 1) Stream exceeds maxBytes even with no Content-Length header
    globalThis.fetch = async () => new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(64).fill(0x61));
          controller.enqueue(new Uint8Array(64).fill(0x61));
          controller.close();
        }
      }),
      { status: 200 }
    );
    await assert.rejects(
      () => corpusMod.loadJsonSibling('semantic-semiotic-index.v1.json', {
        baseUrl: 'http://127.0.0.1:9999/vixen-estate',
        maxBytes: 100
      }),
      /EXPERIMENT_A_PAYLOAD_TOO_LARGE/
    );

    // 2) Tampered shard byte-length & SHA-256 must fail closed BEFORE caching
    const tamperedBytes = new TextEncoder().encode(JSON.stringify({ schema: 'td613.vixen.experiment-a-corpus-shard/v1', sources: {} }));
    globalThis.fetch = async () => new Response(tamperedBytes, { status: 200 });
    await assert.rejects(
      () => corpusMod.loadJsonSibling('corpus-experiment-a-part1.json', {
        baseUrl: 'http://127.0.0.1:9999/vixen-estate',
        expectedSha256: '0'.repeat(64),
        forceReload: true
      }),
      /EXPERIMENT_A_BYTE_LENGTH_MISMATCH/
    );
    await assert.rejects(
      () => corpusMod.loadJsonSibling('tamper-sha-canary.json', {
        baseUrl: 'http://127.0.0.1:9999/vixen-estate',
        expectedBytes: tamperedBytes.byteLength,
        expectedSha256: '0'.repeat(64),
        forceReload: true
      }),
      /EXPERIMENT_A_SHA256_MISMATCH/
    );
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('Wendbine search modes, quotes, -exclude order, clean-to-raw projection, pagination binding, custody gate, graph & Aperture/FADT invariants', async () => {
  const rawIdx = JSON.parse(await readFile(new URL('semantic-semiotic-index.v1.json', estateDir), 'utf8'));
  const p1 = JSON.parse(await readFile(new URL('corpus-experiment-a-part1.json', estateDir), 'utf8'));
  const p2 = JSON.parse(await readFile(new URL('corpus-experiment-a-part2.json', estateDir), 'utf8'));

  // Zero base64 tail snippets anywhere in compact index docs
  const dirtySnippets = rawIdx.docs.filter((d) => /data:image|;base64,|[A-Za-z0-9+/]{64,}={0,2}/.test(d.sn || ''));
  assert.equal(dirtySnippets.length, 0, 'Index snippets must not contain base64 blobs');

  const eng = new searchMod.SemanticSemioticSearchEngine(rawIdx);
  eng.attachShardTexts(p1, p2);
  const integrity = eng.verifyIndexIntegrity();
  assert.equal(integrity.valid, true, JSON.stringify(integrity.issues));
  assert.equal(integrity.spd_covariance_valid, true);
  assert.equal(integrity.has_chunk_sha256, true);

  // Clean-to-raw projection on base64-heavy file emsrc_57021f0d10d938f524b738c5
  const b64Chunks = rawIdx.docs.filter((d) => rawIdx.sources_meta[d.ci]?.source_file_id === 'emsrc_57021f0d10d938f524b738c5');
  assert.ok(b64Chunks.length >= 10);
  const b64Body = p1.sources.emsrc_57021f0d10d938f524b738c5?.text_body || p2.sources.emsrc_57021f0d10d938f524b738c5?.text_body;
  assert.ok(b64Body);
  const b64Utf8 = Buffer.from(b64Body, 'utf8');
  for (const ch of b64Chunks.slice(0, 5)) {
    assert.equal(
      b64Body.slice(ch.off, ch.off + ch.len),
      b64Utf8.subarray(ch.boff, ch.boff + ch.blen).toString('utf8')
    );
  }

  // Hybrid vs Lexical vs Phrase + delta_chan + why + chunk_sha256 + 2-pass equitable work diversity
  const rHyb = eng.search('algedonic bypass viability', { limit: 12 });
  assert.equal(rHyb.status, 'SEARCH_OK');
  assert.equal(rHyb.returned_hits, 12);
  assert.equal(rHyb.pagination.has_more, true);
  assert.ok(rHyb.hits[0].why.length >= 1);
  assert.ok(typeof rHyb.hits[0].snippet === 'string' && rHyb.hits[0].snippet.length > 0);
  assert.match(rHyb.hits[0].chunk_sha256, /^[0-9a-f]{64}$/);
  assert.equal(rHyb.hits[0].delta_chan, +(rHyb.hits[0].s_lex - rHyb.hits[0].s_sem).toFixed(4));
  const uniqueWorksPage1 = new Set(rHyb.hits.map((h) => h.work_id || h.instrument_id || h.source_file_id));
  assert.ok(uniqueWorksPage1.size >= 4, `Expected 2-pass work diversity, got ${uniqueWorksPage1.size}`);

  // Pagination & bound cursor verification
  const page2 = eng.search('algedonic bypass viability', {
    offset: rHyb.pagination.next_offset,
    limit: 12,
    cursorToken: rHyb.pagination.cursor_token
  });
  assert.equal(page2.status, 'SEARCH_OK');
  const p1Ids = new Set(rHyb.hits.map((h) => h.id));
  assert.ok(page2.hits.every((h) => !p1Ids.has(h.id)), 'Page 2 hits must not overlap Page 1');

  const cursorMismatch = eng.search('algedonic bypass -theremin', {
    offset: rHyb.pagination.next_offset,
    limit: 12,
    cursorToken: rHyb.pagination.cursor_token
  });
  assert.equal(cursorMismatch.status, 'CURSOR_MISMATCH');
  assert.equal(cursorMismatch.total_hits, 0);

  // -exclude veto + positive OOV canary evaluation BEFORE -exclude
  const rNeg = eng.search('algedonic bypass -theremin', { limit: 12 });
  assert.equal(rNeg.status, 'SEARCH_OK');
  assert.ok(rNeg.excluded_by_negative_count > 0);
  const canaryBeforeNeg = eng.search('qxzkv_nonexistent_canary_991 -vixen');
  assert.equal(canaryBeforeNeg.status, 'OOV_ALPHABETIC_CANARY_ABSTENTION');

  // Quoted exact phrase & lexical mode
  const rPhr = eng.search('"semantic steering"', { mode: 'phrase', limit: 8 });
  assert.equal(rPhr.status, 'SEARCH_OK');
  assert.ok(rPhr.hits.some((h) => h.why.some((w) => w.includes('phrase match'))));

  const rLex = eng.search('SPSC lock-free memory barrier', { mode: 'lexical', limit: 8 });
  assert.equal(rLex.status, 'SEARCH_OK');
  assert.ok(rLex.hits.every((h) => h.s_sem === 0));

  // Exact UTF-8 byte search with no held-out metadata gap in the A0 baseline
  const exTooShort = await corpusMod.exactSearchInExperimentAShards('a');
  assert.equal(exTooShort.status, 'EXACT_QUERY_TOO_SHORT');
  const exOk = await corpusMod.exactSearchInExperimentAShards('Denavit-Hartenberg', { limit: 10 });
  assert.equal(exOk.status, 'EXECUTED_MATCHES');
  assert.ok(exOk.returned_hits >= 1);
  assert.equal(exOk.hits[0].offset_unit, 'UTF8_BYTE');
  assert.match(exOk.hits[0].exact_utf8_sha256, /^[0-9a-f]{64}$/);
  assert.equal(exOk.hits[0].observed_quote, 'Denavit-Hartenberg');

  // FADT [32, 40] protection & mixed cross-opera quarantine & fail-closed production gate
  const collapseTry = eng.search('algedonic bypass viability', { collapseManifestations: true, limit: 20 });
  assert.equal(collapseTry.collapse_vetoed_for_protected_pairs, true);

  for (const mixedCross of ['vixen G-001', 'wendbine holonomy', 'src-001 viability']) {
    const cr = eng.search(mixedCross);
    assert.equal(cr.status, 'CROSS_OPERA_QUARANTINED', `Expected quarantine on ${mixedCross}`);
    assert.equal(cr.total_hits, 0);
  }

  const productionLabeledSearch = eng.search('algedonic bypass', { deployment_env: 'PRODUCTION', operator_secret_verified: false });
  assert.equal(productionLabeledSearch.status, 'SEARCH_OK');
  assert.ok(productionLabeledSearch.total_hits > 0);

  // Aperture non-SPD rejection (no 0.05 floor masking!)
  const badCovIdx = structuredClone(rawIdx);
  badCovIdx.svd_subspace.background_null.sigma = 0;
  badCovIdx.svd_subspace.background_null.covariance_2x2 = [[0.01, 0.02], [0.02, 0.01]];
  const badEng = new searchMod.SemanticSemioticSearchEngine(badCovIdx);
  assert.equal(badEng.spdCovValid, false);
  const badRes = badEng.search('algedonic bypass', { limit: 5 });
  assert.equal(badRes.aperture_observability.spd_covariance_valid, false);
  assert.ok(badRes.hits.every((h) => h.s_sem === 0));

  // Explicit graph neighbors / route / context with NO_RELATION_PROMOTION & verified TEXT_CROSS_REF
  const nb = eng.neighbors('ACADEMIA_SUI_GENERIS_SIEVE_V0_1');
  assert.equal(nb.status, 'NEIGHBORS_OK');
  assert.equal(nb.relation_promotion_allowed, false);
  assert.equal(nb.causal_relation_inferred, false);
  const xrefEdge = nb.edges.find((e) => e.rel === 'TEXT_CROSS_REF' && e.neighbor === 'FORMAL_OPERATOR_CUSTODY_V0_1');
  assert.ok(xrefEdge, 'Expected verified TEXT_CROSS_REF edge to FORMAL_OPERATOR_CUSTODY_V0_1');
  assert.match(xrefEdge.span_sha256, /^[0-9a-f]{64}$/);
  const rt = eng.route('emwork_074ccf9ad783c9c9047d73a8', 'emsrc_f9d7bff007dd9547d42db2c1');
  assert.equal(rt.found, true);
  assert.equal(rt.relation_promotion_allowed, false);

  // Vague -> Intermediate -> Specific + Zero-Decoy retrieval benchmark
  const benchmark = [
    ['algedonic', true],
    ['"semantic steering"', true],
    ['ACADEMIA_SUI_GENERIS_SIEVE_V0_1', true],
    ['qxzkv_nonexistent_canary_991', false],
    ['vixen G-001', false],
    ['wendbine', false]
  ];
  for (const [qText, expectHits] of benchmark) {
    const bRes = eng.search(qText, { limit: 5 });
    assert.equal(bRes.hits.length > 0, expectHits, `Benchmark mismatch for "${qText}": status=${bRes.status}`);
  }
});


test('SRC Atelier native engines & untypical-input projective/signature retrieval preserve epistemic invariants and surface hidden structure', async () => {
  const srcMod = await import('../app/encyclopedia/vixen-estate/src-atelier-engines.mjs');

  // 1. Native projective routing: 13 FIELD_MARKERS + Explore X. numeral stripping + temporal ordering
  const docs = [
    {
      record_id: 'doc-a',
      title: 'Origin Carrier',
      created: '2025-02-01T00:00:00Z',
      body: 'Signatures are not slogans. They are coordinates. Explore Target Treatise II.'
    },
    {
      record_id: 'doc-b',
      title: 'Target Treatise',
      created: '2025-06-01T00:00:00Z',
      body: 'A field becomes a graph rather than a sequence under partial projections.'
    }
  ];
  const routing = srcMod.runSrcProjectiveRouting(docs, docs, { stripTrailingNumerals: true });
  assert.equal(routing.method, 'SRC_PROJECTIVE_ROUTING');
  assert.ok(routing.field_marker_hits >= 3);
  assert.equal(routing.cue_count, 1);
  assert.equal(routing.links.length, 1);
  assert.equal(routing.links[0].target_record_id, 'doc-b');
  assert.equal(routing.links[0].temporal_relationship, 'LATER');
  assert.equal(routing.links[0].semantic_promotion, 'NO_SEMANTIC_OR_CAUSAL_PROMOTION');

  // 2. Phase-2 tomography: composite_score MUST remain null
  const tomo = srcMod.runSrcPhase2Tomography([
    {
      transformation_id: 'lift-tcc-01',
      from_id: 'raw-note',
      to_id: 'TCC-01',
      claim_effects: { scope: 'EXPANDED', semantic_core: 'PRESERVED', falsifiers: 'FINITE_QUOTIENT' }
    }
  ]);
  assert.equal(tomo.composite_score, null);
  assert.equal(tomo.tomography[0].composite_score, null);
  assert.equal(tomo.contract_status, 'DECLARED_EFFECTS_ONLY');

  // 3. Contextual roles: CONTEXTUAL_NOT_INTRINSIC
  const roles = srcMod.runSrcPhase2ContextRoles([
    { compiler_id: 'vixen_salon', input_id: 'emwork_085223e721130117f5510975', scope_time: 'C5:EXPERIMENT_A', role_in_context: 'ALGEDONIC_CARRIER' }
  ], []);
  assert.equal(roles.intrinsic_role_claim, 'CONTEXTUAL_NOT_INTRINSIC');
  assert.equal(roles.roles[0].intrinsic_role_claim, 'CONTEXTUAL_NOT_INTRINSIC');

  // 4. Rabbit-Hole traversal + 6-state Shadow Graph separating ATTEMPTED_REJECTED vs ADMITTED
  const shadowWalk = srcMod.traverseSrcTypedStrata(
    {
      edges: [
        { from: 'N0', to: 'N1', rel: 'work_protocol', state: 'ADMITTED', stratum: 'F' },
        { from: 'N1', to: 'N2', rel: 'folio_link', state: 'ADMITTED', stratum: 'G', stratum_change: true },
        { from: 'N0', to: 'N_FORBIDDEN', rel: 'cross_opera', state: 'ATTEMPTED_REJECTED', stratum: 'G' }
      ]
    },
    'N0',
    { depth: 3, limit: 10 }
  );
  assert.equal(shadowWalk.discovered_count, 2);
  assert.equal(shadowWalk.shadow_attempts.length, 1);
  assert.equal(shadowWalk.shadow_attempts[0].shadow_state, 'ATTEMPTED_REJECTED');
  assert.equal(shadowWalk.paths[1].stratum_change_requires_new_witness, true);
  assert.equal(shadowWalk.typed_path_is_not_direct_relation, true);

  // 5. Untypical inputs: pure lexical misses vs SRC projective & hybrid retrieve EMSTD613 works
  const eng = await searchMod.loadSemanticSemioticEngine();

  const pureSpanishStem = 'Tú puedes clonarme';
  const lexStemRes = eng.search(pureSpanishStem, { mode: 'lexical', limit: 8 });
  const srcStemRes = eng.search(pureSpanishStem, { mode: 'src_projective', limit: 8 });
  assert.equal(lexStemRes.total_hits, 0, 'Pure BM25F lexical must fail/abstain on untranslated foreign stem');
  assert.equal(srcStemRes.status, 'SEARCH_OK');
  assert.equal(srcStemRes.src_conditioning.regime_id, 'Q_reader');
  assert.ok(srcStemRes.hits.some((h) => h.s_src > 0 && h.src_regime === 'Q_reader'));

  const bilingualSig = 'Tú puedes clonarme, pero no tienes mis genes.';
  const lexSigRes = eng.search(bilingualSig, { mode: 'lexical', limit: 8 });
  const srcSigRes = eng.search(bilingualSig, { mode: 'src_projective', limit: 8 });
  const hybSigRes = eng.search(bilingualSig, { mode: 'hybrid', limit: 8 });
  assert.ok(lexSigRes.hits.every((h) => !h.s_src || h.s_src === 0), 'Pure BM25F lexical has zero SRC signature conditioning');
  assert.equal(srcSigRes.status, 'SEARCH_OK');
  assert.equal(srcSigRes.src_conditioning.regime_id, 'Q_reader');
  assert.ok(srcSigRes.hits.length >= 2, 'SRC projective retrieves lineage/constitutive works from signature coordinate');
  assert.ok(srcSigRes.hits.some((h) => h.s_src > 0 && h.src_regime === 'Q_reader'));
  assert.ok(hybSigRes.hits.length >= 2, 'Hybrid activates SRC Q_reader regime automatically on untypical signature');
  assert.ok(hybSigRes.hits.some((h) => h.s_src > 0 && h.src_regime === 'Q_reader'));

  // Projective Explore X. routing
  const exploreRes = eng.search('Explore Emergent Topologies.', { mode: 'src_projective', limit: 8 });
  assert.equal(exploreRes.status, 'SEARCH_OK');
  assert.equal(exploreRes.src_conditioning.regime_id, 'Q_place');
  assert.ok(
    exploreRes.hits.some((h) => h.work_id === 'emwork_f2c89864337f162e88991e28' || /Emergent Topologies/i.test(h.title || h.snippet || '')),
    'Explore target should retrieve Emergent Topologies'
  );

  // Abstract epistemic/boundary phrasing
  const abstractRes = eng.search('epistemic omission under boundary collapse between observer and instrument', { mode: 'src_projective', limit: 8 });
  assert.equal(abstractRes.status, 'SEARCH_OK');
  assert.ok(abstractRes.hits.length >= 2);
  assert.equal(abstractRes.empirical_replication_credit, 0);

  // Inline fallback ALSO handles untypical queries while keeping gibberish zeroed
  const { readFileSync: readSyncFs } = await import('node:fs');
  const raw = readSyncFs(vixHtmlUrl, 'utf8');
  const bundleMatch = raw.match(/id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
  const inlineEng = searchMod.createInlineFallbackEngine(JSON.parse(bundleMatch[1]));
  const inlineSig = inlineEng.search(bilingualSig, { mode: 'src_projective', limit: 6 });
  assert.equal(inlineSig.status, 'INLINE_FALLBACK_OK');
  assert.ok(inlineSig.hits.length >= 1);

  // Negative bounded controls stay ZERO in src_projective mode
  const negSlogan = eng.search('SR, THE LAB.', { mode: 'src_projective', limit: 5 });
  assert.equal(negSlogan.src_conditioning.matched_signatures.length, 0);
  const canarySrc = eng.search('qxzkv_nonexistent_canary_991', { mode: 'src_projective', limit: 5 });
  assert.equal(canarySrc.status, 'OOV_ALPHABETIC_CANARY_ABSTENTION');
  assert.equal(canarySrc.total_hits, 0);

  // OG Heterostratigraphic invariants & zero wrong SRC naming
  assert.deepEqual(srcMod.SRC_CORPUS_ROOMS, ['FORMAL_SR', 'FICTIONAL_SR', 'GOVERNANCE_PROVENANCE_SR']);
  assert.deepEqual(srcMod.SRC_AUTHORITY_AXES, ['G', 'C', 'E', 'F', 'K']);
  assert.deepEqual(srcMod.SRC_EPISTEMIC_STATE_AXES, ['E', 'V', 'R', 'P', 'L', 'A']);
  const corpus = JSON.parse(bundleMatch[1]);
  const heteroAudit = srcMod.runSrcHeterostratigraphicAudit({
    corpus,
    operatorQuestion: 'Explore structural simulation narrative: Tú puedes clonarme, pero no tienes mis genes.',
    candidateEnvelope: { composite_state_score: 0.9, global_truth: 0.9 }
  });
  assert.equal(heteroAudit.canon_name, 'SignalRupture Canon (SRC)');
  assert.equal(heteroAudit.clone_genes_decoded, false);
  assert.equal(heteroAudit.epistemic_non_implication.composite_state_score, null);
  assert.equal(heteroAudit.tomography_composite_score, null);
  assert.equal(heteroAudit.universalizer_guard.accepted, false);
  assert.equal(heteroAudit.empirical_replication_credit, 0);
  const typeMismatchCheck = srcMod.classifySrcRelationContinuity({
    leftType: 'operator',
    rightType: 'signature',
    sharedSignature: true,
    multiHopPathOnly: true
  });
  assert.equal(typeMismatchCheck.type_mismatch, true);
  assert.equal(typeMismatchCheck.clone_genes_decoded, false);
  assert.equal(typeMismatchCheck.path_lifts_to_direct_edge, false);

  for (const p of [
    '../app/encyclopedia/vixen-estate/src-atelier-engines.mjs',
    '../app/encyclopedia/reference/vixen-podium.mjs',
    '../app/encyclopedia/reference/podium/manifest.json',
    '../app/encyclopedia/vix-cyb/llms.txt'
  ]) {
    const txt = readSyncFs(new URL(p, import.meta.url), 'utf8');
    assert.equal(/SignalRupture\s+Cybernetics/i.test(txt), false, `Forbidden SRC naming drift in ${p}`);
  }

  // Synthesis scoring incorporates SRC tomography & elevates SRC candidate on SRC prompt
  const salonMod = await import('../app/encyclopedia/vixen-estate/synthesis-salon-engine.mjs');
  const baseline = salonMod.scoreUnifiedSynthesisCandidates(corpus, { lagTicks: 36 });
  assert.equal(baseline.candidates[0].id, 'cand-phasonic-frontispiece');
  assert.equal(baseline.src_atelier.phase2_tomography.composite_score, null);
  assert.equal(baseline.src_atelier.context_roles.intrinsic_role_claim, 'CONTEXTUAL_NOT_INTRINSIC');
  assert.ok(baseline.weights.src_projective_tomography > 0);
  const weightSum = Object.values(baseline.weights).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(weightSum - 1) < 1e-6, `Synthesis weights must sum to 1.0, got ${weightSum}`);

  const srcPromptRanked = salonMod.scoreUnifiedSynthesisCandidates(corpus, {
    lagTicks: 36,
    operatorQuestion: 'Explore structural simulation narrative: Tú puedes clonarme, pero no tienes mis genes.'
  });
  const srcCand = srcPromptRanked.candidates.find((c) => c.id === 'cand-src-projective-tomography');
  assert.ok(srcCand);
  assert.ok(srcCand.breakdown.src_projective_tomography >= 0.9);
});


test('RGI16 live fusion channels are real ablations with bound cursors, honest semiotic rungs and canonical defaults',async()=>{
  const {normalizeFusionControls,scoreFusionChannels, boundedFusionComparisonSpec}=await import('../app/encyclopedia/vixen-estate/fusion-controls.mjs');
  assert.throws(()=>normalizeFusionControls({channels:{lexical:false,semantic:false,semiotic:false,src:false}}),/ZERO_ACTIVE_CHANNELS/);
  assert.throws(()=>normalizeFusionControls({channels:{semantic:'false'}}),/INVALID_CHANNEL/);
  assert.throws(()=>normalizeFusionControls({weight_policy:'MAKE_UP_EVIDENCE'}),/UNKNOWN_WEIGHT_POLICY/);
  const unit=scoreFusionChannels({lexical:0.8,semantic:0.6,semiotic:0.4},null,'hybrid');
  assert.equal(+unit.active_score.toFixed(2),0.66);
  const removed=scoreFusionChannels({lexical:0.8,semantic:0.6,semiotic:0.4},{profile:'NO_SEMIOTIC'},'hybrid');
  assert.equal(+removed.active_score.toFixed(2),0.58);
  assert.equal(removed.effective_contributions.semiotic,0);
  const renormalized=scoreFusionChannels({lexical:0.8,semantic:0.6,semiotic:0.4},
    {profile:'NO_SEMIOTIC',weight_policy:'RENORMALIZE_ACTIVE'},'hybrid');
  assert.ok(renormalized.active_score>removed.active_score);
  assert.throws(()=>boundedFusionComparisonSpec({query:'algedonic',profiles:Array(7).fill('FULL_FUSION')}),/PROFILES_MUST_BE_UNIQUE/);

  const idx=JSON.parse(await readFile(new URL('semantic-semiotic-index.v1.json',estateDir),'utf8'));
  const eng=new searchMod.SemanticSemioticSearchEngine(idx);
  const query='algedonic bypass viability';
  const full=eng.search(query,{limit:12});
  const explicitFull=eng.search(query,{limit:12,fusion:{profile:'FULL_FUSION'}});
  assert.equal(full.status,'SEARCH_OK');
  assert.equal(full.fusion_state,'FULL_INDEX_FUSION');
  assert.deepEqual(full.hits.map(h=>[h.id,h.score_total]),explicitFull.hits.map(h=>[h.id,h.score_total]));
  const noSemi=eng.search(query,{limit:12,fusion:{profile:'NO_SEMIOTIC'}});
  assert.equal(noSemi.status,'SEARCH_OK');
  assert.ok(noSemi.hits.length>0);
  assert.ok(noSemi.hits.every(h=>h.fusion_contributions.semiotic===0));
  const noSemantic=eng.search(query,{limit:12,fusion:{profile:'NO_SEMANTIC'}});
  assert.ok(noSemantic.hits.every(h=>h.fusion_contributions.semantic===0));
  assert.notEqual(noSemi.pagination.cursor_token,full.pagination.cursor_token);
  const stale=eng.search(query,{
    offset:12,limit:12,cursorToken:full.pagination.cursor_token,fusion:{profile:'NO_SEMIOTIC'}
  });
  assert.equal(stale.status,'CURSOR_MISMATCH');
  assert.equal(full.empirical_replication_credit,0);
  assert.equal(noSemi.release_authority,false);
});

test('RGI16 fusion and machine control surfaces remain co-versioned and actually linked',async()=>{
  const page=await readFile(vixHtmlUrl,'utf8');
  const {readFileSync}=await import('node:fs');
  const podManifest=JSON.parse(readFileSync(new URL('../app/encyclopedia/reference/podium/manifest.json',import.meta.url),'utf8'));
  assert.ok(page.includes('id="vixenFusionConsole"'));
  for(const channel of ['lexical','semantic','semiotic','src']){
    assert.ok(page.includes('data-fusion-channel="'+channel+'"'));
  }
  for(const id of ['globalFusionWeightPolicy','globalFusionReadout','globalFusionCopyTask',
    'globalFusionCompare','globalFusionTaskPreview'])assert.ok(page.includes('id="'+id+'"'));
  assert.ok(page.includes('fusion:currentVixenFusionControls()'));
  assert.ok(page.includes('vixen.fusion.compare'));
  assert.ok(page.includes('vixen.fusion.search'));
  assert.equal(podManifest.routes.length,16);
  assert.equal(podManifest.aix_conducting.semantic_semiotic_search_integration.fusion_controls.channels.length,4);
  assert.ok(page.includes('fusion-console.css'));
});
