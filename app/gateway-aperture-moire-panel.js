(function () {
  if (!document.body || document.body.getAttribute('data-page-kind') !== 'gateway') return;
  if (window.TD613_GATEWAY_APERTURE_MOIRE_PANEL) return;
  window.TD613_GATEWAY_APERTURE_MOIRE_PANEL = 'v2.7-panel-port';

  var SQRT3_HALF = Math.sqrt(3) / 2;
  var dprCap = 1.5;
  var frame = 0;
  var running = true;

  function compactViewport() {
    var vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    return vw < 1180;
  }

  function byId(id) { return document.getElementById(id); }

  function currentState() {
    var body = document.body;
    var moire = byId('gatewayPreviewMoire');
    var bounce = byId('gatewayPreviewBounceStatus');
    var run = byId('gatewayPreviewRun') || byId('gatewayPreviewPropagate');
    var active = !!(moire && moire.classList && moire.classList.contains('gateway-preview-button-active')) || /halt/i.test(String((run || {}).textContent || ''));
    var bounceText = String((bounce || {}).textContent || '0');
    var bounceCount = Number((bounceText.match(/\d+/) || ['0'])[0]) || 0;
    var routeLive = /live|suppressed|halt/i.test(String((byId('gatewayPreviewNote') || {}).textContent || '') + ' ' + String((run || {}).textContent || ''));
    var mode = body && body.dataset ? String(body.dataset.gatewayRouteState || '') : '';
    return {
      compact: compactViewport(),
      active: active,
      quiet: !active && bounceCount === 0,
      bounceCount: bounceCount,
      routeLive: routeLive,
      mode: mode || (active ? 'suppressed' : 'preview')
    };
  }

  function fitCanvas(canvas) {
    var parent = canvas.parentElement;
    var rect = parent && parent.getBoundingClientRect ? parent.getBoundingClientRect() : null;
    var w = Math.max(220, Math.round((rect && rect.width) || parent.clientWidth || 420) - 20);
    var h = Math.max(150, Math.round((rect && rect.height) || parent.clientHeight || 220) - 34);
    var dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, dprCap));
    var targetW = Math.round(w * dpr);
    var targetH = Math.round(h * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      canvas._gatewayMoireDpr = dpr;
    }
    return { w: w, h: h, dpr: dpr };
  }

  function drawLattice(ctx, x0, y0, W, H, step, offset, hueBase, alpha, dotSize, phase, shear) {
    ctx.globalAlpha = alpha;
    for (var x = x0 - step; x < x0 + W + step; x += step) {
      for (var y = y0 - step; y < y0 + H + step; y += step) {
        var row = Math.floor((y - y0) / Math.max(1, step * SQRT3_HALF));
        var ox = (row % 2) * step * 0.5;
        var px = x + ox + Math.sin(phase + y * 0.026) * shear;
        var py = y + Math.cos(phase * 0.7 + x * 0.018) * shear;
        var hue = hueBase + Math.sin((x + y) * 0.018 + phase) * 24;
        ctx.fillStyle = 'hsl(' + hue + ',68%,58%)';
        ctx.fillRect(px, py, dotSize, dotSize);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawFieldLabels(ctx, W, H, quiet) {
    var halfW = W / 2;
    ctx.font = "600 8px 'IBM Plex Mono', monospace";
    ctx.fillStyle = 'rgba(220,230,244,0.58)';
    ctx.textAlign = 'center';
    ctx.fillText(quiet ? 'A — membrane field' : 'A — overcoherent mask', halfW / 2, 13);
    ctx.fillText(quiet ? 'B — de-masked field signature' : 'B — de-masked rupture', halfW + halfW / 2, 13);

    ctx.font = "300 7px 'IBM Plex Mono', monospace";
    ctx.fillStyle = 'rgba(139,233,253,0.38)';
    ctx.textAlign = 'left';
    var labels = quiet ? ['field signature', 'route prep'] : ['RGB carrier', 'hex-tri scaffold', 'defect-node', 'motion-attribution'];
    labels.forEach(function (label, index) {
      ctx.fillText((index + 1) + '. ' + label, 6, H - 6 - index * 11);
    });
  }

  function drawPanel() {
    if (!running) return;
    var canvas = byId('gatewayPreviewMoireCanvas');
    if (!canvas) {
      window.requestAnimationFrame(drawPanel);
      return;
    }

    canvas.dataset.apertureMoirePanel = 'v2.7';
    var size = fitCanvas(canvas);
    var ctx = canvas.getContext('2d');
    var W = size.w;
    var H = size.h;
    var dpr = canvas._gatewayMoireDpr || size.dpr;
    var s = currentState();
    var compact = s.compact;
    var quiet = s.quiet;
    var active = s.active;
    var t = frame * 1.35;
    var stepA = (compact ? 13 : 9) * (active ? 1.22 : 1);
    var stepB = (compact ? 13.8 : 9.6) * (active ? 1.22 : 1);
    var halfW = W / 2;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#060810';
    ctx.fillRect(0, 0, W, H);

    var vignette = ctx.createRadialGradient(W * 0.46, H * 0.5, Math.min(W, H) * 0.08, W * 0.5, H * 0.5, Math.max(W, H) * 0.72);
    vignette.addColorStop(0, 'rgba(20,28,48,0.05)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.48)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, halfW, H);
    ctx.clip();
    drawLattice(ctx, 0, 0, halfW, H, stepA, 0, 202, quiet ? 0.18 : 0.34, 2, t * 0.02, 0.35);
    drawLattice(ctx, 0, 0, halfW, H, stepB, 0.8, 272, quiet ? 0.12 : 0.28, 2, t * 0.015, 1.4);
    ctx.globalAlpha = quiet ? 0.026 : 0.065;
    var beatX = halfW / 2 + Math.sin(t * 0.01) * halfW * 0.22;
    var beatY = H / 2 + Math.cos(t * 0.012) * H * 0.22;
    var beat = ctx.createRadialGradient(beatX, beatY, 0, beatX, beatY, Math.min(halfW, H) * 0.52);
    beat.addColorStop(0, 'rgba(139,233,253,1)');
    beat.addColorStop(1, 'rgba(139,233,253,0)');
    ctx.fillStyle = beat;
    ctx.fillRect(0, 0, halfW, H);
    ctx.restore();
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.beginPath();
    ctx.rect(halfW, 0, halfW, H);
    ctx.clip();
    drawLattice(ctx, halfW, 0, halfW, H, stepA, 0, 202, quiet ? 0.16 : 0.3, 2, t * 0.02, 0.35);
    drawLattice(ctx, halfW, 0, halfW, H, stepB, 0.8, 272, quiet ? 0.04 : 0.08, 2, t * 0.015, 1.4);
    ctx.restore();

    ctx.strokeStyle = 'rgba(189,147,249,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(halfW, 0);
    ctx.lineTo(halfW, H);
    ctx.stroke();

    for (var y = 0; y < H; y += 2) {
      ctx.fillStyle = 'rgba(0,0,0,0.035)';
      ctx.fillRect(0, y, W, 1);
    }

    drawFieldLabels(ctx, W, H, quiet);

    ctx.font = "600 8px 'IBM Plex Mono', monospace";
    ctx.textAlign = 'right';
    ctx.fillStyle = active ? 'rgba(80,250,123,0.62)' : 'rgba(139,233,253,0.42)';
    ctx.fillText(active ? 'moire engaged / temporal suppressed' : 'moire preview / kappa closed', W - 8, H - 9);

    frame += 1;
    window.requestAnimationFrame(drawPanel);
  }

  function boot() {
    var panel = byId('gatewayPreviewMoireCanvas');
    if (!panel) return;
    window.requestAnimationFrame(drawPanel);
  }

  window.addEventListener('resize', function () {
    var canvas = byId('gatewayPreviewMoireCanvas');
    if (canvas) {
      canvas.width = 1;
      canvas.height = 1;
    }
  }, { passive: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());
