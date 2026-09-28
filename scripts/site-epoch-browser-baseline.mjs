export const SITE_EPOCH_KEY = 'td613.site.browser-reset.epoch';
export const SITE_EPOCH = 'td613.site.browser-reset/2026-09-27-v1';
export const SITE_EPOCH_INFRA_LOCAL_STORAGE = Object.freeze({
  [SITE_EPOCH_KEY]: SITE_EPOCH,
  'td613.ash.cache-flush.aia3.epoch': 'td613.ash.cache-flush/2026-07-27-a15-postclosure-v1',
  'td613.ash.cache-preflight.epoch': 'td613.ash.cache-flush/2026-07-27-a15-postclosure-v1',
  'td613.ash.cache-flush.epoch': 'td613.ash.cache-flush/2026-07-18-canonical-membrane-v7'
});

export async function settleSiteEpochBaseline(context, base, { returnPath = '/' } = {}) {
  const origin = new URL(base).origin;
  const page = await context.newPage();
  const resetUrl = new URL('/site-epoch-reset.html', origin);
  const expectedReturn = new URL(returnPath, origin);
  resetUrl.searchParams.set('return', returnPath);
  try {
    await page.goto(resetUrl.href, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    // The reset script writes its marker immediately before location.replace().
    // Firefox can expose that marker while the reset document is already
    // tearing down, so do not receipt storage until the return navigation owns
    // the page and its DOMContentLoaded boundary has settled.
    await page.waitForURL(
      candidate => candidate.origin === origin && candidate.pathname === expectedReturn.pathname,
      { waitUntil: 'domcontentloaded', timeout: 60_000 }
    );
    await page.waitForFunction(({ key, epoch, origin: expectedOrigin, pathname }) => {
      const current = new URL(location.href);
      return location.origin === expectedOrigin
        && location.pathname === pathname
        && !current.searchParams.has('td613_site_epoch')
        && localStorage.getItem(key) === epoch;
    }, {
      key: SITE_EPOCH_KEY,
      epoch: SITE_EPOCH,
      origin,
      pathname: expectedReturn.pathname
    }, { timeout: 60_000 });
    const receipt = await page.evaluate(({ expected, key, epoch }) => {
      const local = Object.fromEntries(Object.keys(localStorage).sort().map(name => [name, localStorage.getItem(name)]));
      const session = Object.fromEntries(Object.keys(sessionStorage).sort().map(name => [name, sessionStorage.getItem(name)]));
      return {
        pathname: location.pathname,
        site_epoch: localStorage.getItem(key),
        local_storage: local,
        session_storage: session,
        exact_infrastructure_local_storage: Object.keys(local).length === Object.keys(expected).length
          && Object.entries(expected).every(([name, value]) => local[name] === value),
        session_storage_empty: Object.keys(session).length === 0,
        epoch_matches: localStorage.getItem(key) === epoch
      };
    }, { expected: SITE_EPOCH_INFRA_LOCAL_STORAGE, key: SITE_EPOCH_KEY, epoch: SITE_EPOCH });
    if (!receipt.epoch_matches || !receipt.exact_infrastructure_local_storage || !receipt.session_storage_empty) {
      throw new Error(`Site epoch browser baseline did not settle exactly: ${JSON.stringify(receipt)}`);
    }
    return Object.freeze(receipt);
  } finally {
    await page.close().catch(() => {});
  }
}

export async function siteEpochStoragePosture(page) {
  return page.evaluate(({ expected, key, epoch }) => {
    const local = Object.fromEntries(Object.keys(localStorage).sort().map(name => [name, localStorage.getItem(name)]));
    const session = Object.fromEntries(Object.keys(sessionStorage).sort().map(name => [name, sessionStorage.getItem(name)]));
    return {
      local_storage_keys: Object.keys(local),
      session_storage_keys: Object.keys(session),
      local_storage: local,
      session_storage: session,
      epoch_matches: local[key] === epoch,
      product_persistence_absent: Object.keys(local).length === Object.keys(expected).length
        && Object.entries(expected).every(([name, value]) => local[name] === value)
        && Object.keys(session).length === 0
    };
  }, { expected: SITE_EPOCH_INFRA_LOCAL_STORAGE, key: SITE_EPOCH_KEY, epoch: SITE_EPOCH });
}
