import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import {
  PHOENIX_OPERA_CONTRACT,
  OPERA_LIBRETTO_ACTS,
  renderPhasonicStaveSVG,
  mountVixenPhoenixOpera
} from '../app/encyclopedia/vixen-estate/vixen-phoenix-opera.mjs';
import { mountVixenManuscript } from '../app/encyclopedia/vixen-estate/manuscript-reader.mjs';
import { composeBiasDraft, renderBiasDraftSVG } from '../app/encyclopedia/vixen-estate/vixen-bias-draft.mjs';
import { VIXEN_ESTATE_ASSET_PATHS } from '../app/encyclopedia/vixen-estate/session-zip.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const vixHtml = readFileSync(resolve(here, '../app/encyclopedia/vix-cyb.html'), 'utf8');
const phoenixCss = readFileSync(resolve(here, '../app/encyclopedia/vixen-estate/vixen-phoenix-opera.css'), 'utf8');
const podiumHtml = readFileSync(resolve(here, '../app/encyclopedia/vix-cyb/podium.html'), 'utf8');
const humanPodiumHtml = readFileSync(resolve(here, '../app/encyclopedia/vix-cyb/human-podium.html'), 'utf8');

test('Phoenix Opera contract preserves Dollhouse Design authority firebreaks and portable ZIP closure', () => {
  assert.equal(PHOENIX_OPERA_CONTRACT.schema, 'td613.vixen.phoenix-opera/v1');
  assert.equal(PHOENIX_OPERA_CONTRACT.discourse_mode, 'OPEN_FIELD_CREATIVE_SYNTHESIS');
  assert.equal(PHOENIX_OPERA_CONTRACT.empirical_replication_credit, 0);
  assert.equal(PHOENIX_OPERA_CONTRACT.scientific_promotion_authority, false);
  assert.equal(PHOENIX_OPERA_CONTRACT.release_authority, false);
  assert.equal(PHOENIX_OPERA_CONTRACT.human_closure_required, true);
  assert.equal(OPERA_LIBRETTO_ACTS.length, 8);
  assert.ok(VIXEN_ESTATE_ASSET_PATHS.includes('vixen-phoenix-opera.css'));
  assert.ok(VIXEN_ESTATE_ASSET_PATHS.includes('vixen-phoenix-opera.mjs'));
});

test('RP-LIVE-06: Room numbering 00-07 is synchronized across main-nav, mobileNav, and vixenRoomRail', () => {
  const dom = new JSDOM(vixHtml);
  const doc = dom.window.document;
  const expectedOrder = ['overview', 'works', 'observatory', 'collection', 'reference', 'protocols', 'gates', 'holds'];

  const railViews = [...doc.querySelectorAll('#vixenRoomRail .vixen-room')].map((b) => b.getAttribute('data-view'));
  const mainViews = [...doc.querySelectorAll('.main-nav .nav-btn')].map((b) => b.getAttribute('data-view'));
  const mobileViews = [...doc.querySelectorAll('#mobileNav button[data-view]')].map((b) => b.getAttribute('data-view'));

  assert.deepEqual(railViews, expectedOrder);
  assert.deepEqual(mainViews, expectedOrder);
  assert.deepEqual(mobileViews, expectedOrder);
  dom.window.close();
});

test('RP-LIVE-04: Embedded U+10D613 font-face and unescaped Markdown prose + inline symbols render cleanly', () => {
  assert.match(phoenixCss, /font-family:"TD613 FlowCore"/);
  assert.match(phoenixCss, /unicode-range:U\+10D613/);
  assert.match(podiumHtml, /vixen-phoenix-opera\.css/);
  assert.match(humanPodiumHtml, /vixen-phoenix-opera\.css/);
  assert.match(podiumHtml, /PODIUM THRESHOLD · Current/);

  const dom = new JSDOM('<!doctype html><html><body><article id="reader"></article></body></html>');
  const target = dom.window.document.getElementById('reader');
  const md = [
    '[sym1]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    '# 1\\. Introduction and System Overview',
    '',
    'Referent configuration ( ![λ][sym1] ) with System 3 \\* and 1 \\+ 1 \\= 3 where \\\\&lt; 5 s and \\sum_{n=0}^{N-1} holds.'
  ].join('\n');

  mountVixenManuscript(target, md, { sourceId: 'emsrc_test', sourceFormat: 'text/markdown', showRaw: true });
  const heading = target.querySelector('.vix-reader-heading');
  const para = target.querySelector('.vix-reader-paragraph');
  const rawPre = target.querySelector('.vix-reader-raw pre');

  assert.equal(heading.textContent, '1. Introduction and System Overview');
  assert.ok(!para.classList.contains('vix-reader-figure-block'), 'Inline symbol image must not split paragraph into figure block');
  assert.ok(para.textContent.includes('1 + 1 = 3'), 'Escaped Markdown operators must render cleanly');
  assert.ok(para.textContent.includes('< 5 s'), 'Escaped angle bracket entity must unescape cleanly');
  assert.ok(!para.textContent.includes('1 \\+ 1'), 'Backslash escapes must not leak into prose');
  assert.equal(rawPre.textContent, md, 'Raw source text disclosure must remain byte-identical');
  dom.window.close();
});

test('Dollhouse Design Diapason mounts, renders Phasonic stave, and responds causally to zero-strain probe', () => {
  const staveActive = renderPhasonicStaveSVG({ width: 360, height: 40, gamma: 0.62 });
  const staveZero = renderPhasonicStaveSVG({ width: 360, height: 40, gamma: 0 });
  assert.notEqual(staveActive, staveZero, 'Setting gamma=0 must measurably alter rendered Phasonic geometry');

  const dom = new JSDOM(`<!doctype html><html><body data-view="collection">
    <main id="main">
      <section id="constitutiveInquiry"><div class="vixen-inquiry-inner"><div class="bc-salon-top-studio"></div></div></section>
      <section id="view-gates"><div id="gatesStackContainer"><article class="gate-pair-card"><button data-gate-set="1:UNADJUDICATED_PAIR" aria-pressed="true"></button><div class="optical-seam"></div></article></div></section>
    </main>
    <div id="vixenCarryRail" data-items="2"></div>
    <button id="vmaJourneyDock" hidden>Resume</button>
  </body></html>`);

  const instance = mountVixenPhoenixOpera({ document: dom.window.document, window: dom.window });
  assert.equal(instance.mounted, true);
  assert.ok(dom.window.document.getElementById('vixenPhoenixScoreBar'));
  assert.ok(dom.window.document.getElementById('vixenDollhouseDiapason'));
  assert.ok(dom.window.document.getElementById('vixenGatesLattice'));

  dom.window.document.getElementById('vxPhxZeroProbeBtn').click();
  assert.equal(instance.getState().phasonic_gamma, 0);
  assert.equal(instance.getState().falsified_zero, true);

  dom.window.document.querySelector('.vx-phx-carry-collapse').click();
  assert.equal(instance.getState().carry_collapsed, true);
  dom.window.close();
});

test('RP-LIVE-10: Compact 390px Bias Draft renders all 39+39 carriers and staggered gate marks cleanly', () => {
  const model = composeBiasDraft({ width: 358, height: 156, indexA: 2, indexB: 5, lag: 40, proposalFit: 0.8 });
  const svg = renderBiasDraftSVG(model);
  assert.equal(model.rendered_carriers.left, 39);
  assert.equal(model.rendered_carriers.right, 39);
  assert.match(svg, /CLOSURE HELD/);
  assert.doesNotMatch(svg, /UNRATIFIED FIT 80\.0%/);
  assert.match(svg, /FIT 80%/);
});
