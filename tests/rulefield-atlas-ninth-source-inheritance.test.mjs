import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const exact={
 'packages/rulefield/lab/ninth_order_confluence.mjs':'412e5150e06a4161b8fe96e9db87740c6d4b8c7a',
 'packages/rulefield/lab/ninth_order_generalization.mjs':'75970cee450d71c6c29ba49b99286795e9e84545',
 'tests/rulefield-ninth-order-confluence.test.mjs':'e3b9e96677c88ceb5cdcea34c1e27e210b0fa535',
 'tests/rulefield-ninth-order-generalization.test.mjs':'1ef07ad1e69ebbe527d6e999c13856774a244e94'
};
test('four inherited Atlas #1735 Ninth-Order scientific source and test blobs remain byte-identical',()=>{
 for(const [path,expected] of Object.entries(exact)){
  const b=readFileSync(new URL('../'+path,import.meta.url));
  const actual=createHash('sha1').update(Buffer.from('blob '+b.length+String.fromCharCode(0))).update(b).digest('hex');
  assert.equal(actual,expected,path);
 }
});
test('research module inheritance is explicitly source-free and denies operator promotion',async()=>{
 const {CONTRACT}=await import('../packages/rulefield/lab/ninth_order_confluence.mjs');
 const {CONTRACT:GENERAL}=await import('../packages/rulefield/lab/ninth_order_generalization.mjs');
 assert.equal(CONTRACT.protectedFlight,'HELD');
 assert.equal(CONTRACT.humanClosure,'RESERVED');
 assert.equal(GENERAL.experimentalFlight,'HELD');
 assert.equal(GENERAL.scientificClosure,'RESERVED');
});
