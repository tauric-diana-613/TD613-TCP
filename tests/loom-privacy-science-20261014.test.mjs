import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { loomWorkspaceTemplate } from '../app/dome-world/holonomy-loom/workspace-template.js';
import { mountLoomPrivacyScienceView, calculateLoomPrivacyScience } from '../app/dome-world/holonomy-loom/privacy-science-view.js';

test('real finite observer-channel model computes leakage and signed joining without empirical promotion',()=>{
  const three=calculateLoomPrivacyScience('parity',['first','second','third']);
  const two=calculateLoomPrivacyScience('parity',['first','second']);
  assert.equal(three.schema,'td613.loom.privacy-science-view/v0.1');
  assert.equal(three.evaluation.finite_synthetic_calculation.status,'SYNTHETIC_CALCULATED');
  assert.ok(Math.abs(three.evaluation.finite_synthetic_calculation.routes.control.signed_excess_bits-1)<1e-12);
  assert.equal(two.evaluation.finite_synthetic_calculation.routes.control.selected_view.additional_bits,0);
  assert.deepEqual(Object.values(three.measured_surfaces),[null,null,null,null,null]);
  assert.equal(three.empirical_credit,0);
  assert.equal(three.golden_egg_earned,false);
  assert.equal(three.thresholds.L_max,0.5);
  assert.equal(three.thresholds.R_max,0.2);
  assert.equal(three.thresholds.J_max,0.1);
});

test('redundant disclosure remains a non-private model despite negative signed excess',()=>{
  const out=calculateLoomPrivacyScience('redundancy',['first','second']);
  assert.ok(out.evaluation.finite_synthetic_calculation.routes.control.signed_excess_bits < -0.99);
  assert.ok(out.evaluation.finite_synthetic_calculation.routes.control.selected_view.total_recovery > 0.99);
  assert.equal(out.golden_egg_earned,false);
});

test('missing capture is a held channel, never fabricated zero information',()=>{
  const out=calculateLoomPrivacyScience('missing',['reply','error']);
  assert.equal(out.evaluation.finite_synthetic_calculation.status,'HELD_MISSING_CHANNELS');
  assert.equal(out.evaluation.finite_synthetic_calculation.routes.protected.selected_view,null);
  assert.equal(out.evaluation.finite_synthetic_calculation.routes.protected.signed_excess_bits,null);
});

test('real Loom UI exposes scientific calculator in both intro and tools without sharing protected bodies',()=>{
  const dom=new JSDOM(loomWorkspaceTemplate);
  const doc=dom.window.document;
  assert.ok(doc.querySelector('#loomScienceIntro'));
  assert.ok(doc.querySelector('#loomScienceTools'));
  assert.ok(doc.querySelector('#loomOpenPrivacyScience'));
  const root=doc.querySelector('#loomScienceIntro');
  const view=mountLoomPrivacyScienceView(root,{environment:dom.window,getLocalFacts:()=>({
    selected_files:2,withheld_files:1,session_prepared:true,
    local_return_admitted:false,gate_report_count:1
  })});
  assert.match(root.textContent,/Privacy mathematics/);
  assert.match(root.textContent,/Empirical five-surface measurement: L unmeasured/);
  assert.match(root.textContent,/2 selected file\(s\), 1 withheld file\(s\)/);
  assert.equal(view.inspect().case_id,'parity');
  const select=root.querySelector('select');
  select.value='missing';
  select.dispatchEvent(new dom.window.Event('change'));
  assert.equal(view.inspect().case_id,'missing');
  assert.match(root.textContent,/missing error/);
  assert.match(root.textContent,/Full-channel calculation HELD/);
  assert.equal(view.inspect().empirical_credit,0);
  dom.window.close();
});
