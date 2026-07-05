const VERSION = 'hush-mask-native-layout-runtime/v1';
const $ = (id, doc = document) => doc.getElementById(id);
const norm = (value = '') => String(value ?? '').replace(/\r\n?/g, '\n').trim();

function mode(doc = document) {
  const select = $('maskFieldSelect', doc);
  const label = `${select?.value || ''} ${select?.selectedOptions?.[0]?.textContent || ''}`.toLowerCase();
  if (/luz|clipboard|index|custodial/.test(label)) return 'indexed-anchor-blocks';
  if (/cryo|cristiano|handoff|quick/.test(label)) return 'short-handoff-paragraphs';
  if (/rex|fractura|jagged/.test(label)) return 'bounded-fracture-lines';
  return 'natural-mask-pacing';
}
function units(value = '') {
  const body = norm(value).replace(/\s+/g, ' ');
  if (!body) return [];
  return body.match(/[^.!?]+[.!?]+(?:["'”’])?|[^.!?]+$/g)?.map((unit) => unit.trim()).filter(Boolean) || [body];
}
function blocks(value = '') { return norm(value).split(/\n\s*\n/u).map((part) => part.trim()).filter(Boolean); }
function topo(value = '') {
  const body = norm(value);
  return { lineCount: body.split('\n').length, blockCount: blocks(body).length, paragraphBreaks: (body.match(/\n\s*\n/g) || []).length, wordCount: (body.match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length };
}
function targetCount(unitList = [], m = 'natural-mask-pacing') {
  if (m === 'indexed-anchor-blocks' || m === 'bounded-fracture-lines') return unitList.length;
  if (m === 'short-handoff-paragraphs') return Math.min(2, Math.max(1, unitList.length));
  if (unitList.length >= 10) return 4;
  if (unitList.length >= 6) return 3;
  if (unitList.length >= 3) return 2;
  return 1;
}
function sourceSpacingShadow(output = '', source = '', m = 'natural-mask-pacing') {
  if (m === 'indexed-anchor-blocks' || m === 'bounded-fracture-lines') return false;
  const o = topo(output);
  const s = topo(source);
  if (o.wordCount < 24 || s.wordCount < 24) return false;
  return (s.paragraphBreaks > 0 && o.blockCount === s.blockCount) || (s.lineCount > 1 && o.lineCount === s.lineCount);
}
function underdistributed(output = '', m = 'natural-mask-pacing') {
  const list = units(output);
  const b = blocks(output);
  if (list.length <= 2) return false;
  if (!norm(output).includes('\n')) return true;
  if (m === 'indexed-anchor-blocks' || m === 'bounded-fracture-lines') return norm(output).split('\n').filter((line) => line.trim()).length < Math.min(3, list.length);
  if (b.length < targetCount(list, m)) return true;
  const counts = b.map((part) => (part.match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length);
  return b.length <= 2 && Math.max(...counts) >= 70 && Math.min(...counts) <= 20;
}
export function repairMaskNativeLayout(output = '', source = '', m = 'natural-mask-pacing') {
  const clean = norm(output);
  if (!clean) return clean;
  const list = units(clean);
  if (list.length <= 1) return clean;
  const mustRepair = sourceSpacingShadow(clean, source, m) || underdistributed(clean, m);
  if (!mustRepair) return clean;
  if (m === 'indexed-anchor-blocks' || m === 'bounded-fracture-lines') return list.join('\n');
  if (m === 'short-handoff-paragraphs') return list.length <= 2 ? list.join('\n\n') : `${list.slice(0, 2).join(' ')}\n\n${list.slice(2).join(' ')}`;
  const target = targetCount(list, m);
  if (target <= 1) return list.join(' ');
  const groups = [];
  const base = Math.floor(list.length / target);
  const rem = list.length % target;
  let cursor = 0;
  for (let i = 0; i < target; i += 1) {
    const size = base + (i < rem ? 1 : 0);
    groups.push(list.slice(cursor, cursor + size).join(' '));
    cursor += size;
  }
  return groups.filter(Boolean).join('\n\n');
}
export function repairLiveMaskNativeLayout(doc = document) {
  const input = $('messageDraftInput', doc);
  const output = $('protectedOutputInput', doc);
  if (!input || !output) return false;
  const before = output.value || '';
  const after = repairMaskNativeLayout(before, input.value || '', mode(doc));
  if (before === after) return false;
  output.value = after;
  output.dataset.maskNativeLayoutRuntime = VERSION;
  if (window.__TD613_HUSH_PATCH38_LAST_RESULT) {
    window.__TD613_HUSH_PATCH38_LAST_RESULT.selectedOutput = after;
    window.__TD613_HUSH_PATCH38_LAST_RESULT.maskNativeLayoutRuntime = VERSION;
  }
  output.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}
function schedule() { [40, 180, 520].forEach((delay) => window.setTimeout(() => repairLiveMaskNativeLayout(document), delay)); }
function boot() {
  if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
  if (document.body.dataset.hushMaskNativeLayoutRuntime === VERSION) return;
  document.body.dataset.hushMaskNativeLayoutRuntime = VERSION;
  window.addEventListener('td613:hush:patch38-result', schedule);
  window.addEventListener('td613:hush:aperture-repair-pass', schedule);
  window.__TD613_HUSH_MASK_NATIVE_LAYOUT_RUNTIME__ = { version: VERSION, repairMaskNativeLayout, repairLiveMaskNativeLayout };
}
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
}
