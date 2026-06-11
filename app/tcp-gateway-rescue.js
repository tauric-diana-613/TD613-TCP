(function () {
  if (!document.body || document.body.getAttribute('data-page-kind') !== 'gateway') return;
  if (window.TD613_GATEWAY_RESCUE_ACTIVE) return;
  window.TD613_GATEWAY_RESCUE_ACTIVE = true;

  function $(id) { return document.getElementById(id); }
  function text(id, value) { var el = $(id); if (el) el.textContent = value; }
  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }
  function css(el, name, value) { if (el) el.style.setProperty(name, value, 'important'); }
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
      trainer: './trainer.html'
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

  function initNativeIngressMeterSync() {
    var holdMs = 1200;
    var active = false;
    var startedAt = 0;
    var frame = 0;
    var completionTimer = 0;

    function bar() { return $('ingressProgressBar'); }
    function paint(progress) {
      var node = bar();
      if (!node) return;
      var value = Math.max(0, Math.min(1, progress));
      node.style.setProperty('animation', 'none', 'important');
      node.style.setProperty('transform-origin', 'left center', 'important');
      node.style.setProperty('transform', 'scaleX(' + value.toFixed(4) + ')', 'important');
      node.dataset.rescueProgress = String(Math.round(value * 100));
    }
    function stop(forceFull) {
      if (frame) window.cancelAnimationFrame(frame);
      if (completionTimer) window.clearTimeout(completionTimer);
      frame = 0;
      completionTimer = 0;
      active = false;
      if (forceFull) paint(1);
    }
    function tick() {
      if (!active) return;
      if (!nativeContainmentGateActive()) {
        stop(true);
        return;
      }
      var elapsed = now() - startedAt;
      var progress = elapsed / holdMs;
      paint(progress);
      if (progress >= 1) {
        stop(true);
        return;
      }
      frame = window.requestAnimationFrame(tick);
    }
    function begin(event) {
      var core = $('ingressCore');
      if (!core || !event.target || !event.target.closest || event.target.closest('#ingressCore') !== core) return;
      if (!nativeContainmentGateActive()) return;
      startedAt = now();
      active = true;
      paint(0);
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(tick);
      if (completionTimer) window.clearTimeout(completionTimer);
      completionTimer = window.setTimeout(function () { stop(true); }, holdMs + 70);
    }
    function maybeCancel(event) {
      if (!active || !nativeContainmentGateActive()) return;
      var core = $('ingressCore');
      if (event && event.target && event.target.closest && event.target.closest('#ingressCore') === core) {
        var elapsed = now() - startedAt;
        if (elapsed < holdMs * 0.9) stop(false);
      }
    }

    document.addEventListener('pointerdown', begin, true);
    document.addEventListener('mousedown', begin, true);
    document.addEventListener('touchstart', begin, true);
    document.addEventListener('pointerup', maybeCancel, true);
    document.addEventListener('pointercancel', maybeCancel, true);
    document.addEventListener('mouseup', maybeCancel, true);
    document.addEventListener('touchend', maybeCancel, true);
    document.addEventListener('touchcancel', maybeCancel, true);
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
    initNativeIngressMeterSync();
    window.setTimeout(installIngressFallback, 1100);
  }

  function initGatewayPreviewRescue() {
    var run = $('gatewayPreviewRun');
    var reset = $('gatewayPreviewReset');
    var moire = $('gatewayPreviewMoire');
    var bounce = $('gatewayPreviewBounceStatus');
    var phase = $('gatewayPreviewPhaseStatus');
    var canvas = $('gatewayPreviewCanvas');
    var moireCanvas = $('gatewayPreviewMoireCanvas');
    var traceCanvas = $('gatewayPreviewTraceCanvas');
    if (!run) return;

    var running = false;
    var showMoire = true;
    var bounces = 0;
    var tick = 0;
    var frame = 0;

    function context(node) {
      if (!node || typeof node.getContext !== 'function') return null;
      var parent = node.parentElement || node;
      var w = Math.max(220, parent.clientWidth || 320);
      var h = Math.max(120, parent.clientHeight || (node === canvas ? 420 : 160));
      var ratio = Math.max(1, Math.min(2, Number(window.devicePixelRatio || 1)));
      node.width = Math.round(w * ratio);
      node.height = Math.round(h * ratio);
      node.style.width = w + 'px';
      node.style.height = h + 'px';
      var ctx = node.getContext('2d');
      if (!ctx) return null;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      return { ctx: ctx, w: w, h: h };
    }

    function drawNode(node, seed) {
      var pack = context(node);
      if (!pack) return;
      var ctx = pack.ctx, w = pack.w, h = pack.h;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(5,7,16,0.96)';
      ctx.fillRect(0, 0, w, h);
      for (var i = -w; i < w * 2; i += 18) {
        ctx.globalAlpha = showMoire ? 0.18 : 0.06;
        ctx.strokeStyle = seed % 2 ? '#8be9fd' : '#bd93f9';
        ctx.beginPath();
        ctx.moveTo(i + ((tick + seed) % 60), 0);
        ctx.lineTo(i - w / 3, h);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = running ? '#50fa7b' : 'rgba(139,233,253,0.55)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.18);
      ctx.lineTo(w * 0.78, h * 0.72);
      ctx.lineTo(w * 0.22, h * 0.72);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = running ? 'rgba(80,250,123,0.74)' : 'rgba(220,230,244,0.54)';
      ctx.font = '600 10px IBM Plex Mono, monospace';
      ctx.fillText(running ? 'routing preview live' : 'routing preview latent', 12, 18);
      ctx.fillText('bounces ' + bounces, 12, 34);
    }

    function draw() {
      drawNode(canvas, 1);
      drawNode(moireCanvas, 2);
      drawNode(traceCanvas, 3);
      if (bounce) bounce.textContent = 'BOUNCES: ' + bounces;
      if (phase) phase.textContent = running ? 'LIVE' : 'STANDBY';
      run.textContent = running ? 'Ⅱ HOLD' : '▶ PROPAGATE';
      run.classList.toggle('gateway-preview-button-active', running);
      if (moire) moire.classList.toggle('gateway-preview-button-active', showMoire);
    }

    function loop() {
      if (running) {
        tick += 3;
        if (tick % 18 === 0) bounces += 1;
      }
      draw();
      frame = window.requestAnimationFrame(loop);
    }

    run.addEventListener('click', function (event) {
      event.preventDefault();
      running = !running;
      draw();
    });
    if (reset) reset.addEventListener('click', function (event) {
      event.preventDefault();
      running = false;
      bounces = 0;
      tick = 0;
      draw();
    });
    if (moire) moire.addEventListener('click', function (event) {
      event.preventDefault();
      showMoire = !showMoire;
      draw();
    });
    window.addEventListener('resize', draw, { passive: true });
    draw();
    if (!frame) frame = window.requestAnimationFrame(loop);
  }

  function init() {
    initGatewayDoorRescue();
    initIngressRescue();
    initGatewayPreviewRescue();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
