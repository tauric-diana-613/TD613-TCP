import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { installDesktopInstrumentTabs } from '../app/dome-world/marrowline-desktop-repair.js';

const html = fs.readFileSync('app/dome-world/marrowline.html', 'utf8');
for (const startsMobile of [false, true]) {
  test(`instrument navigation, keyboard and resize (mobile start: ${startsMobile})`, () => {
    const dom = new JSDOM(html);
    const { document } = dom.window;
    let change;
    const media = { matches: startsMobile, addEventListener: (_, fn) => { change = fn; } };
    dom.window.matchMedia = () => media;
    let sends = 0;
    document.addEventListener('submit', () => sends++);
    assert.equal(installDesktopInstrumentTabs(document, dom.window), true);
    assert.equal(installDesktopInstrumentTabs(document, dom.window), false);
    const tabs = [...document.querySelectorAll('#marrowlineDesktopToolTabs [role=tab]')];
    assert.deepEqual(tabs.map(tab => tab.textContent), ['Gate', 'Keys', 'Stories', 'Receipts']);
    assert.equal(tabs[0].closest('.living-tools') !== null, true);
    if (startsMobile) {
      assert.equal(document.querySelector('#gatePanel').hasAttribute('role'), false);
      media.matches = false; change();
    }
    assert.equal(tabs[0].getAttribute('aria-selected'), 'true');
    assert.equal(document.querySelector('#gatePanel').open, true);
    tabs[0].focus();
    tabs[0].dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    assert.equal(document.activeElement, tabs[1]);
    assert.equal(document.querySelector('#invocationPanel').open, true);
    assert.equal(document.querySelector('#gatePanel').open, false);
    tabs[1].click();
    assert.equal(tabs[1].getAttribute('aria-selected'), 'true', 'active tab remains visible on repeated click');
    tabs[1].dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    assert.equal(document.activeElement, tabs[3]);
    tabs[3].dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    assert.equal(document.activeElement, tabs[0]);
    media.matches = true; change();
    assert.equal(document.querySelector('#gatePanel').hasAttribute('role'), false);
    media.matches = false; change();
    assert.equal(tabs[0].getAttribute('aria-selected'), 'true');
    assert.equal(tabs.filter(tab => tab.tabIndex === 0).length, 1);
    assert.equal(sends, 0, 'navigation never submits either form');
    assert.deepEqual([...document.querySelectorAll('.mobile-dock [data-mobile-target]')].map(el => el.dataset.mobileTarget),
      ['invocationPanel', 'gatePanel', 'speakingPanel', 'corpusPanel', 'receiptPanel']);
    dom.window.close();
  });
}
