// P-044 / RCA-01. Bounded, deterministic test of the shipped Observatory
// plus explicitly synthetic observer controls. No human-response claim.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('../docs/research/wolfram-rule-atlas/VIRILIAN_WOLFRAMIAN_BERLANTIAN_PHASONIC_OBSERVATORY.html', import.meta.url), 'utf8');
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)?.[1];
assert.ok(inline, 'Observatory simulation script present');

function harness(script = inline) {
  const elements = new Map();
  const frames = [];
  const geometry = [];
  const attrs = {};
  function element(id) {
    if (!elements.has(id)) {
      const handlers = new Map();
      const classes = new Set();
      const e = {
        id, value: '0.75', textContent: '', className: '', style: {},
        handlers,
        classList: { add: x => classes.add(x), remove: x => classes.delete(x), toggle: (x, state) => state ? classes.add(x) : classes.delete(x) },
        addEventListener: (ev, fn) => handlers.set(ev, fn),
        getAttribute: attr => attr === 'data-theme' ? id : attrs[attr],
        setAttribute: (attr, value) => { attrs[attr] = value; },
        dispatch: (ev, data = {}) => { const fn = handlers.get(ev); assert.ok(fn, id + ':' + ev); fn(data); }
      };
      elements.set(id, e);
    }
    return elements.get(id);
  }
  const themes = ['cyber-noir', 'high-noon', 'moire-rose'].map(element);
  const ctx = new Proxy({}, {
    get(target, property) {
      if (property in target) return target[property];
      return (...args) => {
        if (['moveTo', 'lineTo', 'arc'].includes(property)) geometry.push([property, ...args]);
      };
    },
    set(target, property, value) { target[property] = value; return true; }
  });
  const canvas = element('observatoryCanvas');
  canvas.width = 900; canvas.height = 520; canvas.getContext = () => ctx;
  const document = {
    body: element('body'),
    getElementById: element,
    querySelectorAll: q => q === '.amb-btn' ? themes : []
  };
  vm.runInNewContext(script, { document, requestAnimationFrame: fn => frames.push(fn) }, { timeout: 2000 });
  return {
    theme(name) { element(name).dispatch('click'); },
    tick(count = 1) { for (let i = 0; i < count; i++) { const fn = frames.shift(); assert.ok(fn, 'animation callback present'); fn(); } },
    beta(value) { element('betaSlider').dispatch('input', { target: { value: String(value) } }); },
    snapshot() {
      const ids = ['betaVal', 'tauBlindVal', 'lyapunovVal', 'maintEnergyVal', 'graphHealthVal', 'regimeBadge'];
      return JSON.stringify({ telemetry: ids.map(id => element(id).textContent), geometry });
    },
    attrs
  };
}
function run(theme, source = inline, frames = 3) {
  const h = harness(source); h.theme(theme); h.tick(frames); return h;
}
function protectedDecision({ evidence, permissions, signedOperatorGrant }) {
  return { admissible: evidence === 'verified' && permissions === 'authorized' && signedOperatorGrant === true };
}
function syntheticObserver({ cueVisible, legibility }) {
  return Number(cueVisible && legibility >= 0.7);
}

test('RCA-01 bounded positive: shipped Observatory presentation themes preserve numerical telemetry and geometry', () => {
  const base = run('cyber-noir').snapshot();
  for (const theme of ['high-noon', 'moire-rose']) {
    assert.equal(run(theme).snapshot(), base, 'same frames and inputs preserve modeled output: ' + theme);
  }
});
test('RCA-01 metamorphic: same presentation intervention at multiple frozen frame counts', () => {
  for (const frames of [1, 2, 5, 8]) {
    assert.equal(run('cyber-noir', inline, frames).snapshot(), run('high-noon', inline, frames).snapshot());
  }
});
test('RCA-01 structural positive control: changing beta changes the simulated telemetry', () => {
  const ordinary = harness(); ordinary.tick();
  const changed = harness(); changed.beta(1.5); changed.tick();
  assert.notEqual(ordinary.snapshot(), changed.snapshot());
});
test('RCA-01 attempted falsification: a contaminated theme handler is detected, not accepted', () => {
  const needle = "document.body.setAttribute('data-ambiance', btn.getAttribute('data-theme'));";
  assert.ok(inline.includes(needle), 'negative-control injection site matches shipped source');
  const contaminated = inline.replace(needle, needle + '\n      if (btn.getAttribute("data-theme") === "high-noon") beta = 1.5;');
  assert.notEqual(run('cyber-noir', contaminated).snapshot(), run('high-noon', contaminated).snapshot(),
    'deliberate theme-to-physics contamination must break equality');
});
test('RCA-01 authority boundary: style cannot independently create a grant', () => {
  const fixed = { evidence: 'verified', permissions: 'authorized', signedOperatorGrant: false };
  assert.deepEqual(protectedDecision({ ...fixed, theme: 'high-noon' }), protectedDecision({ ...fixed, theme: 'cyber-noir' }));
  assert.equal(protectedDecision({ ...fixed, theme: 'moire-rose' }).admissible, false);
  assert.equal(protectedDecision({ ...fixed, signedOperatorGrant: true }).admissible, true, 'operator grant is a distinct structural control');
});
test('RCA-01 observer null/sham and constructed counterexample to universal zero coupling', () => {
  const shamA = syntheticObserver({ cueVisible: true, legibility: 0.9, color: 'blue' });
  const shamB = syntheticObserver({ cueVisible: true, legibility: 0.9, color: 'rose' });
  assert.equal(shamA, shamB, 'sham palette change holds synthetic affordances fixed');
  const intervention = syntheticObserver({ cueVisible: false, legibility: 0.9 });
  assert.notEqual(shamA, intervention, 'constructed layout/legibility condition falsifies universal zero-response coupling');
});
test('P-044 active surfaces replace unsupported absolute ambiance orthogonality', () => {
  const base = new URL('../docs/research/wolfram-rule-atlas/', import.meta.url);
  for (const name of ['README_AMARI_HANDOFF.md', 'VIRILIAN_WOLFRAMIAN_BERLANTIAN_RELATIONAL_GEOMETRY.md',
    'Wolframian_Rule_Index_Expanded.md', 'VIRILIAN_WOLFRAMIAN_BERLANTIAN_PHASONIC_OBSERVATORY.html']) {
    const source = readFileSync(new URL(name, base), 'utf8');
    assert.doesNotMatch(source, /Ambiance-Orthogonality Invariant|strictly orthogonal to ambiance|tau_theory ⟂ tau_ambiance/i, name);
    assert.match(source, /P-044/, name);
  }
});
