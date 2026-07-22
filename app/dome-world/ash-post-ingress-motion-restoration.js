export const ASH_POST_INGRESS_MOTION_RESTORATION_VERSION = 'td613.ash.post-ingress-motion-restoration/v0.3-canonical-field-ingress-polish';

const host = globalThis.window;
const doc = globalThis.document;

function installStyles() {
  if (!doc?.head || doc.getElementById('td613-ash-post-ingress-motion-restoration-css')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-post-ingress-motion-restoration-css';
  style.textContent = `
    .ash-flowcore-mounted{
      display:grid!important;
      grid-template-columns:minmax(0,1fr)!important;
      grid-template-rows:auto auto!important;
      gap:10px!important;
      width:100%!important;
      height:auto!important;
      min-height:0!important;
      max-height:none!important;
      padding-bottom:10px!important;
      overflow:visible!important;
      contain:none!important;
    }
    .ash-flowcore-mounted>.ash-aia__frame-copy,
    .ash-flowcore-mounted>svg,
    .ash-flowcore-mounted>.ash-aia__static-sequence{
      display:none!important;
    }
    .ash-flowcore-mounted>.ash-flowcore-field:not(.ash-flowcore-field--proxy){
      order:1;
      display:grid!important;
      width:100%!important;
      min-width:0!important;
      height:auto!important;
      max-height:none!important;
      overflow:visible!important;
      visibility:visible!important;
      opacity:1!important;
    }
    .ash-flowcore-mounted>.ash-flowcore-field--proxy{
      display:none!important;
      visibility:hidden!important;
      opacity:0!important;
      width:0!important;
      height:0!important;
      min-height:0!important;
      overflow:hidden!important;
      pointer-events:none!important;
    }
    .ash-flowcore-mounted>.ash-flowcore-field:not(.ash-flowcore-field--proxy) .ash-flowcore-field__canvas{
      display:block!important;
      width:100%!important;
      height:auto!important;
      min-height:300px!important;
      max-height:none!important;
      visibility:visible!important;
      opacity:1!important;
    }
    .ash-flowcore-mounted>.ash-flowcore-field:not(.ash-flowcore-field--proxy) .ash-flowcore-field__canvas>svg{
      display:block!important;
      visibility:visible!important;
      opacity:1!important;
    }
    .ash-flowcore-field[data-flowcore-host="ingress"] .ash-flowcore-field__canvas{
      display:grid!important;
      grid-template-columns:minmax(0,1fr)!important;
      grid-template-rows:auto auto!important;
      min-height:0!important;
      overflow:visible!important;
    }
    .ash-flowcore-field[data-flowcore-host="ingress"] .ash-flowcore-field__caption{
      position:relative!important;
      inset:auto!important;
      left:auto!important;
      right:auto!important;
      bottom:auto!important;
      width:100%!important;
      max-width:none!important;
      margin:0!important;
      box-sizing:border-box!important;
    }
    .ash-flowcore-mounted>.ash-ux-motion-track{
      order:2;
      position:relative!important;
      inset:auto!important;
      left:auto!important;
      right:auto!important;
      top:auto!important;
      bottom:auto!important;
      z-index:2!important;
      display:grid!important;
      width:auto!important;
      min-height:48px!important;
      margin:0 12px 2px!important;
      padding:2px 0 0!important;
      overflow:visible!important;
      visibility:visible!important;
      opacity:1!important;
      pointer-events:none!important;
    }
    #ashAiaMembrane .ash-aia__guide:has(>.ash-aia__stage.ash-flowcore-mounted),
    #ashAiaMembrane .ash-aia__body:has(.ash-aia__stage.ash-flowcore-mounted){
      height:auto!important;
      min-height:0!important;
      max-height:none!important;
      overflow:visible!important;
    }
    @media(max-width:760px){
      .ash-flowcore-mounted{gap:8px!important;padding-bottom:8px!important}
      .ash-flowcore-mounted>.ash-ux-motion-track{margin:0 8px 2px!important;grid-template-columns:repeat(4,minmax(0,1fr))!important}
      .ash-flowcore-field[data-flowcore-host="ingress"] .ash-flowcore-field__caption{grid-template-columns:1fr!important}
      .ash-flowcore-field[data-flowcore-host="ingress"] .ash-flowcore-field__caption span{text-align:left!important}
    }
  `;
  doc.head.append(style);
}

function setImportant(node, property, value) {
  if (!node) return;
  if (node.style.getPropertyValue(property) !== value || node.style.getPropertyPriority(property) !== 'important') {
    node.style.setProperty(property, value, 'important');
  }
}

function activeParts() {
  const field = doc?.querySelector('#ashAiaMembrane .ash-flowcore-field:not([hidden]):not(.ash-flowcore-field--proxy)')
    || doc?.querySelector('.ash-flowcore-field:not([hidden]):not(.ash-flowcore-field--proxy)');
  const stage = field?.parentElement?.matches?.('[data-aia-stage],.ash-aia__stage')
    ? field.parentElement
    : doc?.querySelector('#ashAiaMembrane [data-aia-stage], #ashAiaMembrane .ash-aia__stage');
  const canvas = field?.querySelector('.ash-flowcore-field__canvas');
  const svg = canvas?.querySelector('svg');
  const caption = field?.querySelector('.ash-flowcore-field__caption');
  const rail = stage?.querySelector(':scope > .ash-ux-motion-track');
  const guide = stage?.closest('.ash-aia__guide');
  const body = stage?.closest('.ash-aia__body');
  const proxies = [...(stage?.querySelectorAll(':scope > .ash-flowcore-field--proxy') || [])];
  return { stage, field, canvas, svg, caption, rail, guide, body, proxies };
}

function quarantineProxies(proxies = []) {
  for (const proxy of proxies) {
    proxy.hidden = true;
    proxy.inert = true;
    proxy.setAttribute('aria-hidden', 'true');
    setImportant(proxy, 'display', 'none');
    setImportant(proxy, 'visibility', 'hidden');
    setImportant(proxy, 'opacity', '0');
    setImportant(proxy, 'width', '0px');
    setImportant(proxy, 'height', '0px');
    setImportant(proxy, 'min-height', '0px');
    setImportant(proxy, 'overflow', 'hidden');
    setImportant(proxy, 'pointer-events', 'none');
  }
}

function stabilizeIngressCaption(field, canvas, caption) {
  if (field?.dataset.flowcoreHost !== 'ingress') return;
  setImportant(canvas, 'display', 'grid');
  setImportant(canvas, 'grid-template-columns', 'minmax(0, 1fr)');
  setImportant(canvas, 'grid-template-rows', 'auto auto');
  setImportant(canvas, 'min-height', '0px');
  setImportant(canvas, 'overflow', 'visible');
  setImportant(caption, 'position', 'relative');
  setImportant(caption, 'inset', 'auto');
  setImportant(caption, 'left', 'auto');
  setImportant(caption, 'right', 'auto');
  setImportant(caption, 'bottom', 'auto');
  setImportant(caption, 'width', '100%');
  setImportant(caption, 'max-width', 'none');
  setImportant(caption, 'margin', '0px');
}

function stabilizeGeometry() {
  const parts = activeParts();
  const { stage, field, canvas, svg, caption, rail, guide, body, proxies } = parts;
  if (stage) stage.classList.add('ash-flowcore-mounted');
  quarantineProxies(proxies);

  for (const node of [body, guide, stage]) {
    setImportant(node, 'height', 'auto');
    setImportant(node, 'min-height', '0px');
    setImportant(node, 'max-height', 'none');
    setImportant(node, 'overflow', 'visible');
  }
  setImportant(stage, 'display', 'grid');
  setImportant(stage, 'grid-template-columns', 'minmax(0, 1fr)');
  setImportant(stage, 'grid-template-rows', 'auto auto');
  setImportant(stage, 'contain', 'none');

  setImportant(field, 'display', 'grid');
  setImportant(field, 'width', '100%');
  setImportant(field, 'height', 'auto');
  setImportant(field, 'max-height', 'none');
  setImportant(field, 'overflow', 'visible');
  setImportant(field, 'visibility', 'visible');
  setImportant(field, 'opacity', '1');

  setImportant(canvas, 'display', 'block');
  setImportant(canvas, 'width', '100%');
  setImportant(canvas, 'height', 'auto');
  setImportant(canvas, 'min-height', '300px');
  setImportant(canvas, 'max-height', 'none');
  setImportant(canvas, 'visibility', 'visible');
  setImportant(canvas, 'opacity', '1');

  setImportant(svg, 'display', 'block');
  setImportant(svg, 'visibility', 'visible');
  setImportant(svg, 'opacity', '1');
  stabilizeIngressCaption(field, canvas, caption);

  setImportant(rail, 'position', 'relative');
  setImportant(rail, 'inset', 'auto');
  setImportant(rail, 'display', 'grid');
  setImportant(rail, 'width', 'auto');
  setImportant(rail, 'min-height', '48px');
  setImportant(rail, 'overflow', 'visible');
  setImportant(rail, 'visibility', 'visible');
  setImportant(rail, 'opacity', '1');

  return parts;
}

function ensureProfilePrompt() {
  const select = doc?.getElementById('newProfile');
  const start = doc?.getElementById('startDemo');
  if (!select || !start) return false;
  let prompt = select.querySelector('option[value=""]');
  if (!prompt) {
    prompt = doc.createElement('option');
    prompt.value = '';
    prompt.textContent = 'Select a Profile...';
    prompt.disabled = true;
    select.prepend(prompt);
  }
  if (!doc.documentElement.classList.contains('ash-has-current-case') && !host.localStorage?.getItem?.('td613.ash-keep.current-case')) {
    select.value = '';
  }
  const sync = () => {
    start.disabled = !select.value;
    start.setAttribute('aria-disabled', String(start.disabled));
  };
  if (select.dataset.ashProfilePromptBound !== 'true') {
    select.dataset.ashProfilePromptBound = 'true';
    select.addEventListener('change', sync);
  }
  sync();
  return true;
}

function cleanAshTransitionUrl() {
  try {
    if (!['/dome-world/ash-threshold.html', '/dome-world/ash-keep.html'].includes(host.location.pathname)) return false;
    const url = new URL(host.location.href);
    let changed = false;
    for (const key of ['ash_epoch', 'ash_recovered']) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    }
    if (changed) host.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    return changed;
  } catch {
    return false;
  }
}

function measure() {
  const { stage, field, canvas, svg, caption, rail, proxies } = activeParts();
  const stageRect = stage?.getBoundingClientRect?.();
  const fieldRect = field?.getBoundingClientRect?.();
  const canvasRect = canvas?.getBoundingClientRect?.();
  const captionRect = caption?.getBoundingClientRect?.();
  const railRect = rail?.getBoundingClientRect?.();
  const visible = node => {
    if (!node) return false;
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
  };
  const visibleProxyCount = proxies.filter(visible).length;
  return Object.freeze({
    version:ASH_POST_INGRESS_MOTION_RESTORATION_VERSION,
    available:Boolean(stage && field && canvas && svg && rail),
    stage_visible:visible(stage),
    field_visible:visible(field),
    canvas_visible:visible(canvas) && visible(svg),
    caption_visible:visible(caption),
    rail_visible:visible(rail),
    proxy_count:proxies.length,
    visible_proxy_count:visibleProxyCount,
    stage_height:Math.round(stageRect?.height || 0),
    field_height:Math.round(fieldRect?.height || 0),
    canvas_height:Math.round(canvasRect?.height || 0),
    caption_height:Math.round(captionRect?.height || 0),
    rail_height:Math.round(railRect?.height || 0),
    field_clipped:Boolean(stageRect && fieldRect && fieldRect.bottom > stageRect.bottom + 2),
    rail_clipped:Boolean(stageRect && railRect && railRect.bottom > stageRect.bottom + 2),
    caption_overlaps_svg:Boolean(captionRect && svg?.getBoundingClientRect && captionRect.top < svg.getBoundingClientRect().bottom - 2)
  });
}

function publish(reason = 'INSTALL') {
  cleanAshTransitionUrl();
  ensureProfilePrompt();
  stabilizeGeometry();
  const receipt = measure();
  if (doc?.documentElement) {
    doc.documentElement.dataset.ashPostIngressMotion = receipt.canvas_visible && receipt.rail_visible && receipt.visible_proxy_count === 0 && !receipt.field_clipped && !receipt.rail_clipped && !receipt.caption_overlaps_svg ? 'VISIBLE' : 'HELD';
  }
  host?.dispatchEvent?.(new CustomEvent('td613:ash:post-ingress-motion', { detail:{ ...receipt, reason } }));
  return receipt;
}

export function installAshPostIngressMotionRestoration() {
  if (!host || !doc?.documentElement) return false;
  installStyles();
  for (const type of ['aia-ready','aia3-ready','composition-stable','case-opened','case-created','flowcore-portal-synced','flowcore-field-phase','explanation-frame','case-closed']) {
    host.addEventListener(`td613:ash:${type}`, () => queueMicrotask(() => publish(type.toUpperCase())));
  }
  host.__td613AshPostIngressMotionRestoration = Object.freeze({
    version:ASH_POST_INGRESS_MOTION_RESTORATION_VERSION,
    current:measure,
    refresh:() => publish('EXPLICIT_REFRESH')
  });
  queueMicrotask(() => publish('INSTALL'));
  return true;
}

installAshPostIngressMotionRestoration();
