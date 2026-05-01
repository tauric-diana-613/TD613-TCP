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
      '  <details class="operator-receipt-debug">',
      '    <summary>operator debug payload</summary>',
      '    <pre>' + escapeHtml(JSON.stringify(debugPayload, null, 2)) + '</pre>',
      '  </details>',
      '</details>'
    ].join('');
    window.__TD613_LAST_OPERATOR_RECEIPT__ = receipt;
    return receipt;
  }

  window.TD613OperatorReceipt = Object.freeze({
    build,
    render,
    ensureMount
  });
}());
