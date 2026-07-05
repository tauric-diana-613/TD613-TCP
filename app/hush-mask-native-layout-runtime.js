const VERSION = 'hush-mask-native-layout-runtime/v2-special-mask-lanes';
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
function lineUnits(value = '') { return norm(value).split('\n').map((line) => line.trim()).filter(Boolean); }
function blocks(value = '') { return norm(value).split(/\n\s*\n/u).map((part) => part.trim()).filter(Boolean); }
function topo(value = '') {
  const body = norm(value);
  return { lineCount: body ? body.split('\n').length : 0, blockCount: blocks(body).length, paragraphBreaks: (body.match(/\n\s*\n/g) || []).length, wordCount: (body.match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length };
}
function targetCount(unitList = [], m = 'natural-mask-pacing') {
  if (m === 'indexed-anchor-blocks') return Math.min(4, Math.max(2, Math.ceil(unitList.length / 2)));
  if (m === 'bounded-fracture-lines') return Math.min(5, Math.max(3, Math.ceil(unitList.length / 2)));
  if (m === 'short-handoff-paragraphs') return Math.min(4, Math.max(2, Math.ceil(unitList.length / 2)));
  if (unitList.length >= 10) return 4;
  if (unitList.length >= 6) return 3;
  if (unitList.length >= 3) return 2;
  return 1;
}
function sourceSpacingShadow(output = '', source = '', m = 'natural-mask-pacing') {
  const o = topo(output);
  const s = topo(source);
  if (o.wordCount < 24 || s.wordCount < 24) return false;
  if (m === 'indexed-anchor-blocks') return s.lineCount > 1 && o.lineCount === s.lineCount && o.blockCount === s.blockCount;
  if (m === 'bounded-fracture-lines') return s.lineCount > 1 && o.lineCount === s.lineCount;
  return (s.paragraphBreaks > 0 && o.blockCount === s.blockCount) || (s.lineCount > 1 && o.lineCount === s.lineCount);
}
function checklistShape(output = '') {
  const lines = lineUnits(output);
  if (lines.length < 3) return false;
  const listed = lines.filter((line) => /^\s*(?:\d+[.)]|[-*•])\s+/.test(line)).length;
  return listed >= 3 && listed / lines.length >= 0.55;
}
function longBlockShape(output = '') {
  const counts = blocks(output).map((part) => (part.match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length);
  return counts.length <= 2 && Math.max(...counts, 0) >= 55;
}
function underdistributed(output = '', m = 'natural-mask-pacing') {
  const list = units(output);
  const b = blocks(output);
  const lines = lineUnits(output);
  if (list.length <= 2) return false;
  if (!norm(output).includes('\n')) return true;
  if (m === 'indexed-anchor-blocks') return checklistShape(output) || b.length < targetCount(list, m) || longBlockShape(output);
  if (m === 'bounded-fracture-lines') return lines.length < Math.min(4, list.length) || longBlockShape(output);
  if (m === 'short-handoff-paragraphs') return b.length < targetCount(list, m) || longBlockShape(output);
  if (b.length < targetCount(list, m)) return true;
  const counts = b.map((part) => (part.match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length);
  return b.length <= 2 && Math.max(...counts) >= 70 && Math.min(...counts) <= 20;
}
function stripListMarker(value = '') { return String(value).replace(/^\s*(?:\d+[.)]|[-*•])\s+/, '').trim(); }
function group(unitList = [], target = 1) {
  if (target <= 1) return [unitList.join(' ')];
  const groups = [];
  const base = Math.floor(unitList.length / target);
  const rem = unitList.length % target;
  let cursor = 0;
  for (let i = 0; i < target; i += 1) {
    const size = base + (i < rem ? 1 : 0);
    groups.push(unitList.slice(cursor, cursor + size).join(' '));
    cursor += size;
  }
  return groups.filter(Boolean);
}
function repairLuz(unitList = []) {
  const cleanUnits = unitList.map(stripListMarker).filter(Boolean);
  const grouped = group(cleanUnits, targetCount(cleanUnits, 'indexed-anchor-blocks'));
  return grouped.map((part, index) => `Index ${index + 1} — ${part}`).join('\n\n');
}
function repairCryo(unitList = []) {
  const grouped = group(unitList, targetCount(unitList, 'short-handoff-paragraphs'));
  return grouped.join('\n\n');
}
function repairRex(unitList = []) {
  const grouped = group(unitList, targetCount(unitList, 'bounded-fracture-lines'));
  return grouped.map((part) => part.replace(/\s+—\s+/g, ' — ')).join('\n\n');
}
export function repairMaskNativeLayout(output = '', source = '', m = 'natural-mask-pacing') {
  const clean = norm(output);
  if (!clean) return clean;
  const list = units(clean);
  if (list.length <= 1) return clean;
  const mustRepair = sourceSpacingShadow(clean, source, m) || underdistributed(clean, m);
  if (!mustRepair) return clean;
  if (m === 'indexed-anchor-blocks') return repairLuz(list);
  if (m === 'bounded-fracture-lines') return repairRex(list);
  if (m === 'short-handoff-paragraphs') return repairCryo(list);
  const grouped = group(list, targetCount(list, m));
  return grouped.join('\n\n');
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
