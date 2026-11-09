/**
 * Vixen source-first browser witness · PR #1730 · exact local HTTP assets.
 *
 * This is an engineering geometry and route witness, NOT a certificate
 * of scientific success or the operator's visual/artistic qualification.
 * No Universal reference is performed by the Vixen Opera.
 */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const site = 'http://127.0.0.1:6130/encyclopedia/vix-cyb.html';
const output = path.resolve('artifacts/vixen-browser-witness');
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const screens = [
  { width: 1440, height: 900, motion: 'no-preference' },
  { width: 1024, height: 768, motion: 'no-preference' },
  { width: 390, height: 844, motion: 'reduce' }
];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const witness = [];
try {
  for (const { width, height, motion } of screens) {
    const context = await browser.newContext({
      viewport: { width, height },
      reducedMotion: motion,
      deviceScaleFactor: 1
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(site, { waitUntil: 'domcontentloaded', timeout: 30000 });
    assert.equal(response?.status(), 200, 'Exact HTTP source must load');
    await page.locator('#menuToggle').click();
    await page.locator('#mobileNav button[data-view="reference"]').click();
    await page.locator('#vixenReferenceChamber .vxe-source-folio').first().waitFor();
    await page.waitForTimeout(650); // settle the original 450ms view-enter transition

    const before = await page.evaluate(() => {
      const bounds = (selector) => {
        const node = document.querySelector(selector);
        assertNode(node, selector);
        const rect = node.getBoundingClientRect();
        return {
          x: rect.x, top: rect.top, right: rect.right, bottom: rect.bottom,
          width: rect.width, height: rect.height
        };
      };
      function assertNode(node, label) {
        if (!node) throw new Error('Missing rendered node: ' + label);
      }
      return {
        page: document.body.dataset.view,
        viewport: { width: innerWidth, height: innerHeight },
        documentWidth: document.documentElement.scrollWidth,
        header: bounds('.site-header'),
        menu: bounds('#menuToggle'),
        brand: bounds(innerWidth <= 680 ? '.brand-mobile-logo .vixen-fox-emblem' : '.brand-desktop-lockup .vixen-fox-emblem'),
        source: bounds('.vxe-vixen-pair .vxe-source-folio'),
        firstEstate: bounds('.vxe-vixen-pair .vxe-estate-vixen'),
        secondEstate: bounds('.vxe-vixen-pair .vxe-estate-companion'),
        workTitleDisclosurePresent: !!document.querySelector('.vxe-title-disclosure'),
        stageRole: document.querySelector('#vixenReferenceChamber')?.getAttribute('data-stage-role'),
        performerRoles: [...document.querySelectorAll('.vxe-vixen-pair .vxe-estate')].map(x => x.getAttribute('data-stage-role')),
        excludesUnrelatedOpera: !/Eclipse[–-]Omega|G-001/.test(document.querySelector('#vixenReferenceChamber')?.textContent || '')
      };
    });

    assert.equal(before.page, 'reference');
    assert.equal(before.stageRole, 'OPERA');
    assert.deepEqual(before.performerRoles, ['PERFORMER', 'PERFORMER']);
    assert.equal(before.excludesUnrelatedOpera, true);
    assert.equal(before.workTitleDisclosurePresent, true);
    assert(before.documentWidth <= width + 1, 'Horizontal overflow at ' + width);
    assert(before.source.top < height - 80,
      'Original source remains below the initial viewport at ' + width + ': y=' + before.source.top);
    assert(before.brand.width > 0 && before.brand.height > 0, 'Vixen fox identity must remain visible');
    assert(before.menu.width > 0 && before.menu.height > 0, 'Compact menu must remain visible');
    assert(before.brand.right + 8 < before.menu.x, 'Masthead fox/utility control collision');
    assert(before.header.bottom <= before.source.top, 'Fixed header overlays source card');
    assert.equal(errors.length, 0, 'Uncaught runtime errors before inquiry: ' + errors.join(' | '));

    const stem = 'vixen-' + width + 'x' + height + (motion === 'reduce' ? '-reduced' : '');
    await page.screenshot({ path: path.join(output, stem + '-notice.png'), fullPage: false });
    await page.getByRole('button', { name: /Begin this Work.s comparison/ }).click();
    await page.getByRole('button', { name: /Observe the recorded differences/ }).click();
    assert.match(await page.locator('.vxe-result').innerText(), /METADATA_COMPARISON_ONLY|HELD_/);
    await page.getByRole('button', { name: /Name an unresolved question/ }).click();
    await page.locator('.vxe-name').fill('Leave cross-Opera authorship unasserted.');
    await page.getByRole('button', { name: /Rest without penalty/ }).click();
    await page.getByRole('button', { name: /Return to the Opera/ }).click();
    assert.equal(await page.locator('.vxe-name').inputValue(), 'Leave cross-Opera authorship unasserted.');
    assert.equal(errors.length, 0, 'Uncaught runtime errors during inquiry: ' + errors.join(' | '));
    await page.screenshot({ path: path.join(output, stem + '-resumed.png'), fullPage: false });

    // The reader is a separately typed Operahouse stage, not the Vixen Opera.
    const house=page.locator('#operahouseEncounter');
    assert.equal(await house.getAttribute('data-stage-role'),'OPERAHOUSE');
    assert.equal(await house.locator('[data-stage-role="INDEPENDENT_REFERENCE"]').count(),1);
    assert.equal(await house.locator('[data-stage-role="SOURCE_LOCUS"]').count(),1);
    assert(!/G-101|Eclipse[–-]Omega/.test(await house.innerText()),
      'Independent Universal records cannot be auto-presented before operator inquiry');
    await house.getByRole('button',{name:'Open independent read-only estate'}).click();
    await house.getByRole('button',{name:'Search Universal separately'}).waitFor({timeout:15000});
    await house.getByRole('searchbox',{name:'Search independent Universal index'}).fill('G-101');
    await house.getByRole('button',{name:'Search Universal separately'}).click();
    await house.getByRole('button',{name:/G-101/}).first().click();
    await house.locator('.oh-payload').waitFor({timeout:15000});
    assert.match(await house.innerText(),/VERIFIED INDEPENDENT REFERENCE · G-101/);
    assert(!/G-101/.test(await page.locator('#vixenReferenceChamber').innerText()),
      'A separately witnessed Universal record must not become a Vixen Performer');
    await house.getByRole('button',{name:'Observe separately — do not ratify a relationship'}).click();
    assert.equal(await house.locator('.oh-disposition').getAttribute('data-encounter-state'),
      'WITNESSED_UNLINKED_PAIR');
    assert.match(await house.locator('.oh-disposition').innerText(),/Relationship: UNESTABLISHED/);
    await house.getByRole('button',{name:'Rest without penalty'}).click();
    await house.getByRole('button',{name:'Resume without penalty'}).click();
    assert.equal(errors.length,0,'Uncaught errors across distinct Operahouse encounter');
    await page.screenshot({path:path.join(output,stem+'-operahouse.png'),fullPage:false});


    witness.push({ width, height, motion, head, result: 'GEOMETRY_AND_ROUTE_PASS', before, errors });
    await context.close();
  }
} finally {
  await browser.close();
}
await writeFile(path.join(output, 'witness.json'), JSON.stringify({
  schema: 'td613.vixen.exact-head-browser-geometry/v1',
  scope: 'source-first layout, same-Work role boundary, accessible route, local Rest',
  creative_scientific_qualification: 'HUMAN_RESERVED',
  hosted_verification: 'NOT_PERFORMED',
  head, witness
}, null, 2) + '\n');
console.log('Vixen exact-head browser geometry passed:', head, witness.map(x => x.width + '×' + x.height).join(', '));
