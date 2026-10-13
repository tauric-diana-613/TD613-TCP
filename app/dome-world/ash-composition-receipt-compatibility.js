export const ASH_COMPOSITION_RECEIPT_COMPATIBILITY_VERSION = 'td613.ash.composition-receipt-compatibility/v0.1-capability-alias';

const host = globalThis.window;
const doc = globalThis.document;
const CAPABILITY = 'stable-navigation-motion';

function applyCompatibility() {
  if (!doc?.documentElement) return false;
  const current = doc.documentElement.dataset.ashCompositionStable || '';
  if (!current) return false;
  const tokens = current.split('+').filter(Boolean);
  if (!tokens.includes(CAPABILITY)) tokens.push(CAPABILITY);
  const next = tokens.join('+');
  if (next !== current) doc.documentElement.dataset.ashCompositionStable = next;
  doc.documentElement.dataset.ashCompositionCompatibility = ASH_COMPOSITION_RECEIPT_COMPATIBILITY_VERSION;
  return true;
}

export function installAshCompositionReceiptCompatibility() {
  if (!host || !doc?.documentElement || host.__td613AshCompositionReceiptCompatibility) return false;
  host.addEventListener('td613:ash:composition-stable', applyCompatibility);
  host.__td613AshCompositionReceiptCompatibility = Object.freeze({
    version:ASH_COMPOSITION_RECEIPT_COMPATIBILITY_VERSION,
    capability:CAPABILITY,
    refresh:applyCompatibility,
    current:() => Object.freeze({
      stable:doc.documentElement.dataset.ashCompositionStable || null,
      release:doc.documentElement.dataset.ashCompositionRelease || null,
      applied:doc.documentElement.dataset.ashCompositionStable?.split('+').includes(CAPABILITY) || false
    })
  });
  applyCompatibility();
  return true;
}

if (host && doc) installAshCompositionReceiptCompatibility();
