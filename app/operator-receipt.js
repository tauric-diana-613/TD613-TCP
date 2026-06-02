(function () {
  'use strict';

  function asArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    if (value == null || value === '') return [];
    return [String(value)];
  }

  function safeText(value, fallback) {
    const text = value == null ? '' : String(value).trim();
    return text || fallback || '';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function compactList(values, emptyText) {
    const list = asArray(values);
    return list.length ? list.join('; ') : (emptyText || 'none');
  }

  function normalizeStatus(value) {
    const status = safeText(value, 'observing').toLowerCase();
    if (/block|hold|risk|short|missing|error|fault/.test(status)) return 'blocked';
    if (/ready|armed|mint|issued|sealed|landed|complete|live|open/.test(status)) return 'ready';
    if (/idle|await|pending|observe|latent/.test(status)) return 'idle';
    return status.replace(/[^a-z0-9-]+/g, '-') || 'observing';
  }

  function build(input) {
    const source = input && typeof input === 'object' ? input : {};
    const status = normalizeStatus(source.status || source.state);
    const repairBrief = source.repairBrief && typeof source.repairBrief === 'object'
      ? {
          title: safeText(source.repairBrief.title, 'Operator repair brief'),
          summary: safeText(source.repairBrief.summary, ''),
          targetFiles: asArray(source.repairBrief.targetFiles),
          missingOperators: asArray(source.repairBrief.missingOperators),
          acceptance: asArray(source.repairBrief.acceptance),
          command: safeText(source.repairBrief.command, ''),
          fixtureHint: safeText(source.repairBrief.fixtureHint, '')
        }
      : null;
    const receipt = {
      schema: 'td613.operator-receipt/v1',
      generated_at: new Date().toISOString(),
      surface: safeText(source.surface, 'TCP operator surface'),
      action: safeText(source.action, 'Observe current route'),
      status,
      route: safeText(source.route, 'pending'),
      preserved: asArray(source.preserved),
      changed: asArray(source.changed),
      blocked: asArray(source.blocked),
      next: safeText(source.next, 'continue observing'),
      risks: asArray(source.risks),
      repairBrief,
      details: source.details && typeof source.details === 'object' ? source.details : {},
      raw: source.raw && typeof source.raw === 'object' ? source.raw : null
    };
    receipt.operator_summary = [
      receipt.action,
      'status=' + receipt.status,
      'route=' + receipt.route,
      'next=' + receipt.next
    ].join(' / ');
    return receipt;
  }

  function repairBriefText(brief) {
    if (!brief) return '';
    return [
      '# ' + brief.title,
      brief.summary,
      '',
      'Missing operators:',
      compactList(brief.missingOperators, 'none'),
      '',
      'Likely files:',
      compactList(brief.targetFiles, 'none'),
      '',
      'Acceptance:',
      compactList(brief.acceptance, 'none'),
      '',
      brief.fixtureHint ? 'Fixture: ' + brief.fixtureHint : '',
      brief.command ? 'Command: ' + brief.command : ''
    ].filter((line) => line !== '').join('\n');
  }

  function renderRepairBrief(brief) {
    if (!brief) return '';
    return [
      '  <section class="operator-receipt-repair">',
      '    <div class="operator-receipt-repair-head">',
      '      <div>',
      '        <span>Repair brief</span>',
      '        <strong>' + escapeHtml(brief.title) + '</strong>',
      '      </div>',
      '      <button class="operator-receipt-copy" type="button" data-operator-receipt-copy="repair-brief">Copy brief</button>',
      '    </div>',
      brief.summary ? '    <p>' + escapeHtml(brief.summary) + '</p>' : '',
      '    <div class="operator-receipt-repair-grid">',
      '      <div><span>Missing</span><strong>' + escapeHtml(compactList(brief.missingOperators, 'none')) + '</strong></div>',
      '      <div><span>Files</span><strong>' + escapeHtml(compactList(brief.targetFiles, 'none')) + '</strong></div>',
      '      <div><span>Acceptance</span><strong>' + escapeHtml(compactList(brief.acceptance, 'none')) + '</strong></div>',
      '      <div><span>Run</span><strong>' + escapeHtml(brief.command || 'focused Deck proof') + '</strong></div>',
      '    </div>',
      '    <pre class="operator-receipt-repair-text" hidden>' + escapeHtml(repairBriefText(brief)) + '</pre>',
      '  </section>'
    ].join('');
  }

  function resolveNode(target) {
    if (!target) return null;
    if (typeof target === 'string') return document.querySelector(target);
    if (target.nodeType === 1) return target;
    return null;
  }

  function ensureMount(options) {
    const opts = options && typeof options === 'object' ? options : {};
    const id = opts.id || 'operatorReceiptMount';
    let mount = document.getElementById(id);
    if (mount) return mount;

    mount = document.createElement('section');
    mount.id = id;
    mount.className = opts.className || 'operator-receipt-mount';
    mount.dataset.td613Skip = 'true';

    const anchor = resolveNode(opts.anchor) ||
      document.querySelector('.statusrail') ||
      document.querySelector('.gateway-head') ||
      document.querySelector('.chamber-header') ||
      document.querySelector('.ingress-console-panel') ||
      document.querySelector('main') ||
      document.body;

    const placement = opts.placement || 'afterend';
    if (anchor === document.body || placement === 'append') {
      anchor.appendChild(mount);
    } else {
      anchor.insertAdjacentElement(placement, mount);
    }
    return mount;
  }

  function render(target, input) {
    const mount = resolveNode(target);
    if (!mount) return null;
    const receipt = build(input);
    const debugPayload = {
      receipt,
      details: receipt.details,
      raw: receipt.raw
    };
    mount.innerHTML = [
      '<details class="operator-receipt" data-status="' + escapeHtml(receipt.status) + '">',
      '  <summary class="operator-receipt-head">',
      '    <div>',
      '      <div class="section-kicker">Aperture receipt</div>',
      '      <h3>' + escapeHtml(receipt.action) + '</h3>',
      '      <p class="operator-receipt-next operator-receipt-next-inline"><span>Next</span> ' + escapeHtml(receipt.next) + '</p>',
      '    </div>',
      '    <span class="operator-receipt-status">' + escapeHtml(receipt.status) + '</span>',
      '  </summary>',
      '  <div class="operator-receipt-grid">',
      '    <div><span>Route</span><strong>' + escapeHtml(receipt.route) + '</strong></div>',
      '    <div><span>Preserved</span><strong>' + escapeHtml(compactList(receipt.preserved, 'watching')) + '</strong></div>',
      '    <div><span>Changed</span><strong>' + escapeHtml(compactList(receipt.changed, 'none')) + '</strong></div>',
      '    <div><span>Blocked</span><strong>' + escapeHtml(compactList(receipt.blocked, 'none')) + '</strong></div>',
      '  </div>',
      receipt.risks.length
        ? '  <p class="operator-receipt-risk"><span>Risk</span> ' + escapeHtml(compactList(receipt.risks, 'none')) + '</p>'
        : '',
      renderRepairBrief(receipt.repairBrief),
      '  <details class="operator-receipt-debug">',
      '    <summary>operator debug payload</summary>',
      '    <pre>' + escapeHtml(JSON.stringify(debugPayload, null, 2)) + '</pre>',
      '  </details>',
      '</details>'
    ].join('');
    window.__TD613_LAST_OPERATOR_RECEIPT__ = receipt;
    return receipt;
  }

  document.addEventListener('click', (event) => {
    const button = event.target && event.target.closest ? event.target.closest('[data-operator-receipt-copy="repair-brief"]') : null;
    if (!button) return;
    const root = button.closest('.operator-receipt');
    const textNode = root ? root.querySelector('.operator-receipt-repair-text') : null;
    const text = textNode ? textNode.textContent || '' : '';
    if (!text) return;
    const done = () => {
      button.textContent = 'Copied';
      window.setTimeout(() => { button.textContent = 'Copy brief'; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => {});
    }
  });

  window.TD613OperatorReceipt = Object.freeze({
    build,
    render,
    ensureMount
  });

  (function bootstrapSafeHarborHousekeeping() {
    const path = String((window.location && window.location.pathname) || '');
    if (!/safe-harbor/i.test(path)) return;
    const version = '20260602-pr155-mobile-button-type';
    const sessionKey = 'td613.safe-harbor.session.v1';
    const mirrorKey = 'td613.safe-harbor.session.mirror.v1';
    const shiPattern = /^TD613-SH-9B07D8B-[A-F0-9]{8}$/i;
    const normalizeText = (value) => String(value == null ? '' : value).trim();
    const sessionLooksOpen = (saved) => {
      const ingress = saved && saved.ingress;
      const issuance = saved && saved.packet && saved.packet.issuance;
      const covenant = saved && saved.covenant;
      const hasShi = Boolean(
        (issuance && shiPattern.test(normalizeText(issuance.badge_number))) ||
        (covenant && shiPattern.test(normalizeText(covenant.badgeNumber)))
      );
      return Boolean(ingress && (
        ingress.vaultOpen ||
        ingress.operatorShellOpen ||
        ingress.packetId ||
        ingress.receiptId ||
        saved.packet ||
        saved.sealed ||
        hasShi
      ));
    };
    try {
      const sessionRaw = sessionStorage.getItem(sessionKey);
      const mirrorRaw = localStorage.getItem(mirrorKey);
      const raw = sessionRaw || mirrorRaw;
      if (raw) {
        const saved = JSON.parse(raw);
        const ingress = saved && saved.ingress;
        if (!sessionRaw && mirrorRaw) sessionStorage.setItem(sessionKey, mirrorRaw);
        if (sessionLooksOpen(saved)) {
          if (ingress && !ingress.vaultOpen && !ingress.operatorShellOpen) ingress.vaultOpen = true;
          if (ingress && (saved.packet || saved.sealed)) ingress.recovered = true;
          const normalized = JSON.stringify(saved);
          sessionStorage.setItem(sessionKey, normalized);
          localStorage.setItem(mirrorKey, normalized);
          document.documentElement.dataset.safeHarborSessionOpen = 'true';
        }
      }
    } catch (error) {}
    document.documentElement.classList.add('safe-harbor-pr147');
    document.documentElement.classList.add('safe-harbor-pr149');
    document.documentElement.classList.add('safe-harbor-pr150');
    document.documentElement.classList.add('safe-harbor-pr151');
    document.documentElement.classList.add('safe-harbor-pr152');
    document.documentElement.classList.add('safe-harbor-pr153');
    document.documentElement.classList.add('safe-harbor-pr154');
    document.documentElement.classList.add('safe-harbor-pr155');
    const cssHref = 'app/safe-harbor-housekeeping.css?v=' + version;
    if (!document.querySelector('link[href*="safe-harbor-housekeeping.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssHref;
      document.head.appendChild(link);
    }
    const pr149CssHref = 'app/safe-harbor-pr149-recall-hotfix.css?v=' + version;
    if (!document.querySelector('link[href*="safe-harbor-pr149-recall-hotfix.css"]')) {
      const pr149Link = document.createElement('link');
      pr149Link.rel = 'stylesheet';
      pr149Link.href = pr149CssHref;
      document.head.appendChild(pr149Link);
    }
    const pr153CssHref = 'app/safe-harbor-pr153-mobile-field-scale.css?v=' + version;
    if (!document.querySelector('link[href*="safe-harbor-pr153-mobile-field-scale.css"]')) {
      const pr153Link = document.createElement('link');
      pr153Link.rel = 'stylesheet';
      pr153Link.href = pr153CssHref;
      document.head.appendChild(pr153Link);
    }
    const pr154CssHref = 'app/safe-harbor-pr154-mobile-focus-stable.css?v=' + version;
    if (!document.querySelector('link[href*="safe-harbor-pr154-mobile-focus-stable.css"]')) {
      const pr154Link = document.createElement('link');
      pr154Link.rel = 'stylesheet';
      pr154Link.href = pr154CssHref;
      document.head.appendChild(pr154Link);
    }
    const jsSrc = 'app/safe-harbor-housekeeping.js?v=' + version;
    if (!document.querySelector('script[src*="safe-harbor-housekeeping.js"]')) {
      const script = document.createElement('script');
      script.src = jsSrc;
      script.defer = true;
      document.head.appendChild(script);
    }
  }());
}());
