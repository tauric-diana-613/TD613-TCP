export const HUSH_VISIBLE_DETOX_SEAM_GUARD_VERSION = 'hush-visible-detox-seam-guard/v1';

const INTERNAL_LABEL_RE = /\bPhase\s+(?:35|37)\b/g;

export function cleanVisibleHushLabel(value = '') {
  return String(value ?? '').replace(INTERNAL_LABEL_RE, 'Generator');
}

export function cleanVisibleHushLabels(root = null) {
  if (!root?.querySelectorAll) return { ok: false };
  root.querySelectorAll('*').forEach((element) => {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(element.tagName)) return;
    for (const node of element.childNodes || []) {
      if (node.nodeType === 3) node.nodeValue = cleanVisibleHushLabel(node.nodeValue);
    }
  });
  return { ok: true };
}
