const LOOM_PATH = '/app/dome-world/previews/a15-r0/holonomy-loom-child-legible-preflight.html';

function safeRequestDescriptor(request, canary) {
  const requestUrl = new URL(request.url());
  const postData = request.postData() || '';
  const encodedCanary = encodeURIComponent(canary);
  return {
    method: request.method(),
    origin: requestUrl.origin,
    pathname: requestUrl.pathname,
    query_present: Boolean(requestUrl.search),
    canary_present_in_url: request.url().includes(canary) || request.url().includes(encodedCanary),
    canary_present_in_body: postData.includes(canary),
    post_data_present: Boolean(postData)
  };
}

async function isDetailsOpen(locator) {
  return locator.evaluate(element => Boolean(element.open)).catch(() => false);
}

export async function runHolonomyLoomBrowserEgressWitness({ page, base, browserName }) {
  const canary = `TD613_LOOM_CANARY_${browserName.toUpperCase()}_613`;
  const protectedMarker = `PRIVATE_${browserName.toUpperCase()}_613`;
  const journeyMarker = `JOURNEY_${browserName.toUpperCase()}_613`;
  const observedRequests = [];
  let interactionStarted = false;

  const onRequest = request => {
    if (!interactionStarted) return;
    observedRequests.push(safeRequestDescriptor(request, canary));
  };
  page.on('request', onRequest);

  const result = {
    schema: 'td613.holonomy-loom.browser-egress-witness/v0.1',
    source_status: 'OBSERVED',
    authority_class: 'A1_OBSERVATIONAL',
    browser_engine: browserName,
    surface: LOOM_PATH,
    raw_canary_stored_in_receipt: false,
    checks: [],
    request_summary: null,
    status: 'OPEN'
  };
  const check = (name, pass, detail = null) => result.checks.push({ name, status: pass ? 'PASS' : 'FAIL', detail });

  try {
    await page.goto(`${String(base).replace(/\/+$/, '')}${LOOM_PATH}`, { waitUntil: 'networkidle', timeout: 60_000 });

    const protectionSummary = page.getByText('Protection rules', { exact: true });
    const protectionDetails = protectionSummary.locator('..');
    const whyDetails = page.getByText('Show me why', { exact: true }).locator('..');

    check('child-legible title visible', await page.getByRole('heading', { name: 'Holonomy Loom', exact: true }).isVisible());
    check('child-legible first sentence visible', await page.getByText('Before you send it, check what this message carries.', { exact: true }).isVisible());
    check('check control visible', await page.locator('#check').isVisible());
    check('Show me why closed before interaction', !(await isDetailsOpen(whyDetails)));

    await protectionSummary.click();
    check('protection rules open by explicit user action', await isDetailsOpen(protectionDetails));

    interactionStarted = true;
    await page.locator('#message').fill(`kiki ${canary} ${protectedMarker} ${journeyMarker}`);
    await page.locator('#protected').fill(protectedMarker);
    await page.locator('#journeys').fill(journeyMarker);
    await page.locator('#check').click();
    await page.locator('#result.show').waitFor({ timeout: 10_000 });

    check('deterministic hard block renders RED', (await page.locator('#statusLight').innerText()).trim() === 'RED');
    check('raw copy blocked on RED', await page.locator('#copyChecked').isDisabled());
    check('safer copy offered on RED', await page.locator('#makeSafer').isEnabled());
    check('declared journey relation visible', (await page.locator('#journeyResult').innerText()).includes('another journey'));
    check('Show me why remains optional after consequence', !(await isDetailsOpen(whyDetails)));

    await page.locator('#makeSafer').click();
    check('safer-copy action settles', (await page.locator('#copyStatus').innerText()).trim().length > 0);

    const requestContainingCanary = observedRequests.filter(item => item.canary_present_in_url || item.canary_present_in_body);
    const externalAfterInteraction = observedRequests.filter(item => item.origin !== new URL(base).origin);
    const mutationsAfterInteraction = observedRequests.filter(item => !['GET', 'HEAD'].includes(item.method));

    result.request_summary = {
      observed_after_interaction_count: observedRequests.length,
      external_after_interaction_count: externalAfterInteraction.length,
      mutation_after_interaction_count: mutationsAfterInteraction.length,
      canary_egress_count: requestContainingCanary.length,
      requests: observedRequests
    };

    check('no raw-draft canary observed in request URL or body', requestContainingCanary.length === 0, { canary_egress_count: requestContainingCanary.length });
    check('no external request after draft interaction', externalAfterInteraction.length === 0, { external_after_interaction_count: externalAfterInteraction.length });
    check('no mutation request after draft interaction', mutationsAfterInteraction.length === 0, { mutation_after_interaction_count: mutationsAfterInteraction.length });

    await page.locator('#message').fill(`plain ${canary}`);
    await page.locator('#protected').fill('');
    await page.locator('#journeys').fill('');
    await page.locator('#check').click();
    check('GREEN means enabled deterministic rules did not fire', (await page.locator('#statusLight').innerText()).trim() === 'GREEN');
    check('GREEN enables Loom-controlled checked copy', await page.locator('#copyChecked').isEnabled());
    check('unsupported provenance abstains', (await page.locator('#journeyResult').innerText()).includes('will not infer provenance from resemblance alone'));

    const finalCanaryRequests = observedRequests.filter(item => item.canary_present_in_url || item.canary_present_in_body);
    result.request_summary.observed_after_interaction_count = observedRequests.length;
    result.request_summary.canary_egress_count = finalCanaryRequests.length;
    result.request_summary.requests = observedRequests;
    check('raw-draft canary remains absent from all interaction requests', finalCanaryRequests.length === 0, { canary_egress_count: finalCanaryRequests.length });
  } catch (error) {
    result.error = error.message;
    check('Holonomy Loom browser egress witness completed', false, error.message);
  } finally {
    page.off('request', onRequest);
  }

  result.failed_checks = result.checks.filter(item => item.status === 'FAIL').map(item => item.name);
  result.status = result.failed_checks.length === 0 ? 'PASS' : 'HELD';
  return result;
}
