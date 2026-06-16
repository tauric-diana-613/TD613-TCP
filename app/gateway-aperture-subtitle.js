(function () {
  function isDesktopGateway() {
    return typeof window.matchMedia === 'function' && window.matchMedia('(min-width: 1024px)').matches;
  }

  function placeGatewaySummary() {
    var lockup = document.querySelector('.gateway-head .gateway-lockup');
    var titleBlock = document.querySelector('.gateway-head .gateway-lockup > div:first-child');
    var gatewaySummary = document.querySelector('.gateway-summary');
    if (!lockup || !titleBlock || !gatewaySummary) return;

    if (isDesktopGateway()) {
      if (gatewaySummary.parentElement !== titleBlock) titleBlock.appendChild(gatewaySummary);
      gatewaySummary.dataset.gatewayTitleGrouped = 'true';
      return;
    }

    delete gatewaySummary.dataset.gatewayTitleGrouped;
    if (gatewaySummary.parentElement !== lockup) {
      if (titleBlock.nextSibling) lockup.insertBefore(gatewaySummary, titleBlock.nextSibling);
      else lockup.appendChild(gatewaySummary);
    }
  }

  function placeBounceTrace() {
    var banner = document.querySelector('.gateway-head .gateway-lockup');
    var bottom = document.querySelector('.gateway-preview-shell .gateway-preview-bottom');
    var tracePanel = document.getElementById('gatewayPreviewTraceCanvas')?.closest?.('.gateway-preview-bottom-panel');
    var moirePanel = document.getElementById('gatewayPreviewMoireCanvas')?.closest?.('.gateway-preview-bottom-panel');
    if (!tracePanel) return;

    if (!isDesktopGateway()) {
      tracePanel.classList.remove('gateway-banner-bounce-trace');
      delete tracePanel.dataset.gatewayBannerTrace;
      if (bottom && tracePanel.parentElement !== bottom) bottom.appendChild(tracePanel);
      if (moirePanel) moirePanel.classList.remove('gateway-preview-moire-wide');
      return;
    }

    if (!banner || tracePanel.parentElement === banner) {
      if (moirePanel) moirePanel.classList.add('gateway-preview-moire-wide');
      return;
    }

    tracePanel.dataset.gatewayBannerTrace = 'true';
    tracePanel.classList.add('gateway-banner-bounce-trace');
    banner.appendChild(tracePanel);
    if (moirePanel) moirePanel.classList.add('gateway-preview-moire-wide');
  }

  function installGatewayCopy() {
    if (!document.body || document.body.getAttribute('data-page-kind') !== 'gateway') return;

    var brandmark = document.querySelector('.gateway-brandmark');
    if (brandmark) brandmark.textContent = 'Threshold / Select Chamber';

    var heading = document.querySelector('.gateway-head h1');
    if (heading) heading.textContent = 'The Cadence Playground';

    var gatewaySummary = document.querySelector('.gateway-summary');
    if (gatewaySummary) {
      gatewaySummary.textContent = 'Enter the machine where voice becomes signal, mask, packet, witness, and sealed route. TD613 is a custody-aware authorship stack for patterned language under pressure: part gothic console, part forensic chapel, part futurecore switchboard for seeing what the system tries to flatten before it names you back.';
      gatewaySummary.setAttribute('data-copy-pass', 'gateway-machine-threshold');
    }

    var subtitle = document.querySelector('.gateway-preview-subtitle');
    if (subtitle) {
      subtitle.textContent = 'Aperture keeps the witness field from flattening into a single answer-surface. It tracks what enters as latent state, what survives projection, what gets registered, and which narrowing operator authored the loss before any route is allowed to call itself clean.';
      subtitle.setAttribute('data-copy-pass', 'repo-governed-exposure');
    }

    placeGatewaySummary();
    placeBounceTrace();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installGatewayCopy, { once: true });
  else installGatewayCopy();
  window.setTimeout(installGatewayCopy, 400);
  window.addEventListener('resize', function () {
    placeGatewaySummary();
    placeBounceTrace();
  }, { passive: true });
}());
