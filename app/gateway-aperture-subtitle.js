(function () {
  function moveBounceTraceToBanner() {
    var banner = document.querySelector('.gateway-head .gateway-lockup');
    var tracePanel = document.getElementById('gatewayPreviewTraceCanvas')?.closest?.('.gateway-preview-bottom-panel');
    if (!banner || !tracePanel || tracePanel.dataset.gatewayBannerTrace === 'true') return;
    tracePanel.dataset.gatewayBannerTrace = 'true';
    tracePanel.classList.add('gateway-banner-bounce-trace');
    banner.appendChild(tracePanel);

    var moirePanel = document.getElementById('gatewayPreviewMoireCanvas')?.closest?.('.gateway-preview-bottom-panel');
    if (moirePanel) moirePanel.classList.add('gateway-preview-moire-wide');
  }

  function installGatewayCopy() {
    if (!document.body || document.body.getAttribute('data-page-kind') !== 'gateway') return;

    var brandmark = document.querySelector('.gateway-brandmark');
    if (brandmark) brandmark.textContent = 'Threshold / Select Chamber';

    var heading = document.querySelector('.gateway-head h1');
    if (heading) heading.textContent = 'The Cadence Playground';

    var subtitle = document.querySelector('.gateway-preview-subtitle');
    if (subtitle) {
      subtitle.textContent = 'Aperture keeps the witness field from flattening into a single answer-surface. It tracks what enters as latent state, what survives projection, what gets registered, and which narrowing operator authored the loss before any route is allowed to call itself clean.';
      subtitle.setAttribute('data-copy-pass', 'repo-governed-exposure');
    }

    moveBounceTraceToBanner();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installGatewayCopy, { once: true });
  else installGatewayCopy();
  window.setTimeout(installGatewayCopy, 400);
}());
