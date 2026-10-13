(function () {
  if (!document.body || document.body.getAttribute('data-page-kind') !== 'gateway') return;
  if (window.TD613_GATEWAY_RESCUE_ACTIVE) return;
  window.TD613_GATEWAY_RESCUE_ACTIVE = true;

  function $(id) { return document.getElementById(id); }
  function text(id, value) { var el = $(id); if (el) el.textContent = value; }
  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }
  function now() { return window.performance && typeof window.performance.now === 'function' ? window.performance.now() : Date.now(); }

  function passIngress(reason) {
    var membrane = $('ingressMembrane');
    if (membrane) membrane.hidden = true;
    document.body.removeAttribute('data-ingress-locked');
    document.body.setAttribute('data-ingress-phase', 'revealed');
    try { window.sessionStorage.setItem('tcp.gateway.ingress-rescue-passed', reason || 'manual'); } catch (error) {}
  }

  function initGatewayDoorRescue() {
    var pageMap = {
      homebase: './homebase.html',
      personas: './homebase.html',
      readout: './readout.html',
      deck: './deck.html',
      play: './deck.html',
      trainer: './clone.html',
      clone: './clone.html'
    };
    document.querySelectorAll('button[data-station-target]').forEach(function (button) {
      if (button.dataset.gatewayRescueBound === 'true') return;
      button.dataset.gatewayRescueBound = 'true';
      button.disabled = false;
      button.addEventListener('click', function (event) {
        var target = String(button.getAttribute('data-station-target') || '').trim().toLowerCase();
        var href = pageMap[target];
        if (!href) return;
        event.preventDefault();
        window.location.href = href;
      });
    });
  }

  function nativeContainmentGateActive() {
    var membrane = $('ingressMembrane');
    if (!membrane || membrane.hidden) return false;
    var cue = String(($('ingressCueLabel') || {}).textContent || '').toLowerCase();
    var core = String(($('ingressCoreLabel') || {}).textContent || '').toLowerCase();
    return cue.indexOf('collapse the ring stack') >= 0 || core.indexOf('stabilize') >= 0 || document.body.getAttribute('data-ingress-phase') === 'containment';
  }

  function initNativeIngressMeterSnap() {
    var holdMs = 1200;
    var active = false;
    var startedAt = 0;
    var finishTimer = 0;
    var cancelTimer = 0;

    function bar() { return $('ingressProgressBar'); }
    function snapFull() {
      var node = bar();
      if (!node) return;
      node.style.setProperty('transform-origin', 'left center', 'important');
      node.style.setProperty('transform', 'scaleX(1)', 'important');
      node.dataset.rescueProgress = '100';
    }
    function clearTimers() {
      if (finishTimer) window.clearTimeout(finishTimer);
      if (cancelTimer) window.clearTimeout(cancelTimer);
      finishTimer = 0;
      cancelTimer = 0;
    }
    function begin(event) {
      var core = $('ingressCore');
      if (!core || !event.target || !event.target.closest || event.target.closest('#ingressCore') !== core) return;
      if (!nativeContainmentGateActive()) return;
      clearTimers();
      active = true;
      startedAt = now();
      finishTimer = window.setTimeout(function () {
        if (active && nativeContainmentGateActive()) snapFull();
      }, holdMs - 90);
    }
    function maybeCancel(event) {
      if (!active || !nativeContainmentGateActive()) return;
      var core = $('ingressCore');
      if (event && event.target && event.target.closest && event.target.closest('#ingressCore') === core) {
        var elapsed = now() - startedAt;
        if (elapsed < holdMs * 0.9) {
          active = false;
          clearTimers();
        }
      }
    }
    function maybeComplete() {
      if (!active) return;
      if (!nativeContainmentGateActive()) {
        snapFull();
        active = false;
        clearTimers();
      }
    }

    document.addEventListener('pointerdown', begin, true);
    document.addEventListener('pointerup', maybeCancel, true);
    document.addEventListener('pointercancel', maybeCancel, true);
    document.addEventListener('touchend', maybeCancel, true);
    document.addEventListener('touchcancel', maybeCancel, true);
    window.setInterval(maybeComplete, 250);
  }

  function installIngressFallback() {
    var membrane = $('ingressMembrane');
    var core = $('ingressCore');
    if (!membrane || !core || membrane.hidden || document.documentElement.dataset.ingressBypass === 'true') return;
    if (nativeContainmentGateActive()) return;
    var label = String(($('ingressCoreLabel') || {}).textContent || '').trim().toLowerCase();
    if (label && label !== 'stand by' && label !== 'begin') return;

    var mirrorControls = $('ingressMirrorControls');
    var badgeControls = $('ingressBadgeControls');
    var sealNodes = $('ingressSealNodes');
    var progress = $('ingressProgressBar');
    var mirrorChoice = '';
    var badgeIndex = 0;
    var sealHits = [];
    var badges = [
      { label: 'holds', glyph: '☆' },
      { label: 'buffer', glyph: '⊞' },
      { label: 'branch', glyph: 'κ' }
    ];
    var phase = 0;

    document.body.setAttribute('data-ingress-locked', 'true');
    document.body.setAttribute('data-ingress-phase', 'standby');
    core.disabled = false;
    text('ingressCoreLabel', 'Begin');
    text('ingressCoreGlyph', '◇');
    text('ingressStatus', 'Tap the core to wake the ingress sequence.');
    text('ingressPhaseText', 'Protocol // rescue ready');
    text('ingressCueLabel', 'custody handshake ready');
    text('ingressCueCopy', 'Four gates. Tap through; choices stay lightweight.');
    if (progress) progress.style.setProperty('transform', 'scaleX(.08)', 'important');

    function markStage(id, active) {
      var node = $(id);
      if (!node) return;
      node.classList.toggle('is-active', Boolean(active));
      node.classList.toggle('is-complete', Boolean(active));
    }

    function render() {
      if (progress) progress.style.setProperty('transform', 'scaleX(' + Math.min(1, (8 + phase * 24) / 100) + ')', 'important');
      markStage('ingressStageContainment', phase >= 1);
      markStage('ingressStageMirror', phase >= 2);
      markStage('ingressStageBadge', phase >= 3);
      markStage('ingressStageSeal', phase >= 4);
      if (phase === 0) {
        hide(mirrorControls); hide(badgeControls); hide(sealNodes);
        text('ingressCoreLabel', 'Begin');
        text('ingressStatus', 'Tap the core to wake the membrane.');
        text('ingressPhaseText', 'Protocol // rescue ready');
      } else if (phase === 1) {
        hide(mirrorControls); hide(badgeControls); hide(sealNodes);
        text('ingressCoreLabel', 'Hold');
        text('ingressStatus', 'Containment stable. Tap once more to choose mirror posture.');
        text('ingressPhaseText', 'Protocol // containment held');
        text('ingressCueLabel', 'latent state held');
      } else if (phase === 2) {
        show(mirrorControls); hide(badgeControls); hide(sealNodes);
        text('ingressCoreLabel', mirrorChoice ? 'Next' : 'Choose');
        text('ingressStatus', mirrorChoice ? ('Mirror posture set: ' + mirrorChoice + '. Tap core to continue.') : 'Choose latent or clear, then tap core.');
        text('ingressPhaseText', 'Protocol // projected route');
      } else if (phase === 3) {
        hide(mirrorControls); show(badgeControls); hide(sealNodes);
        text('ingressBadgeReadout', 'token // ' + badges[badgeIndex].label);
        text('ingressCoreGlyph', badges[badgeIndex].glyph);
        text('ingressCoreLabel', 'Register');
        text('ingressStatus', 'Badge token registered. Cycle if needed, then tap core.');
        text('ingressPhaseText', 'Protocol // registered surface');
      } else if (phase === 4) {
        hide(mirrorControls); hide(badgeControls); show(sealNodes);
        text('ingressCoreLabel', sealHits.length >= 3 ? 'Open' : 'Seal');
        text('ingressStatus', sealHits.length >= 3 ? 'Seal triad complete. Tap core to enter.' : 'Tap the three seal points, or tap core to open rescue passage.');
        text('ingressPhaseText', 'Protocol // route ceiling');
      }
    }

    var mirrorArmed = $('ingressMirrorArmed');
    var mirrorOpen = $('ingressMirrorOpen');
    if (mirrorArmed) mirrorArmed.addEventListener('click', function () { mirrorChoice = 'latent'; render(); });
    if (mirrorOpen) mirrorOpen.addEventListener('click', function () { mirrorChoice = 'clear'; render(); });
    var cycle = $('ingressBadgeCycle');
    if (cycle) cycle.addEventListener('click', function () { badgeIndex = (badgeIndex + 1) % badges.length; render(); });
    ['ingressSealNodeUl', 'ingressSealNodeUr', 'ingressSealNodeBc'].forEach(function (id) {
      var node = $(id);
      if (!node) return;
      node.addEventListener('click', function () {
        if (sealHits.indexOf(id) < 0) sealHits.push(id);
        node.classList.add('is-active', 'is-complete');
        render();
      });
    });

    core.addEventListener('click', function (event) {
      event.preventDefault();
      if (phase === 4) {
        passIngress('rescue-sequence');
        return;
      }
      phase += 1;
      render();
    });
    render();
  }

  function initIngressRescue() {
    initNativeIngressMeterSnap();
    window.setTimeout(installIngressFallback, 1100);
  }

  function fallbackPreviewDraw() {
    var run = $('gatewayPreviewRun');
    var bounce = $('gatewayPreviewBounceStatus');
    var phase = $('gatewayPreviewPhaseStatus');
    if (!run) return;
    var count = Number(run.dataset.rescueBounces || 0);
    run.dataset.rescueBounces = String(count + 1);
    if (bounce) bounce.textContent = 'BOUNCES: ' + (count + 1);
    if (phase) phase.textContent = 'LIVE';
    run.textContent = 'Ⅱ HOLD';
    run.classList.add('gateway-preview-button-active');
  }

  function initGatewayPreviewRescue() {
    var run = $('gatewayPreviewRun');
    if (!run) return;
    run.addEventListener('click', function () {
      var beforeText = run.textContent;
      var beforeBounce = String(($('gatewayPreviewBounceStatus') || {}).textContent || '');
      window.setTimeout(function () {
        var afterText = run.textContent;
        var afterBounce = String(($('gatewayPreviewBounceStatus') || {}).textContent || '');
        if (afterText === beforeText && afterBounce === beforeBounce) {
          fallbackPreviewDraw();
        }
      }, 180);
    });
  }

  function init() {
    initGatewayDoorRescue();
    initIngressRescue();
    initGatewayPreviewRescue();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
