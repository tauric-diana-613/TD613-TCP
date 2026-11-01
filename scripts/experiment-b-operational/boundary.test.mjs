import test from 'node:test';
import assert from 'node:assert/strict';
import { isolatedRequest } from './isolated-math-supervisor.mjs';
const image=process.env.TD613_BOUNDARY_IMAGE;
const enabled=process.env.TD613_RUN_BOUNDARY_TESTS==='true';
test('offline boundary rejects arbitrary image, arm and operation without launch',()=>{
 assert.throws(()=>isolatedRequest({image:'node:latest',arm:'ARM_2A',kind:'probe'}));
 assert.throws(()=>isolatedRequest({image:'sha256:'+'0'.repeat(64),arm:'UNDECLARED',kind:'probe'}));
 assert.throws(()=>isolatedRequest({image:'sha256:'+'0'.repeat(64),arm:'ARM_2A',kind:'math',operations:[{op:'shell',a:'1',b:'2'}]}));
});
test('actual offline container boundary with invented input',{skip:!enabled},()=>{
 const r=isolatedRequest({image,arm:'ARM_2A',kind:'probe'});
 assert.equal(r.result.uid,65534);assert(['EROFS','EACCES'].includes(r.result.rootWrite));assert(['ENETUNREACH','EHOSTUNREACH','EACCES','EPERM'].includes(r.result.network));
 assert.equal(r.result.scratchRead,'SYNTHETIC');assert.equal(r.result.hostMountPresent,false);assert.equal(r.result.ambientCodex,false);assert.deepEqual(r.result.credentialEnvironment,[]);assert.equal(r.result.capabilities,'0000000000000000');assert.equal(r.result.noNewPrivileges,'1');assert.equal(r.result.seccomp,'2');
 console.log(JSON.stringify({evidenceClass:'ACTUAL_OFFLINE_CONTAINER_PROBE',...r}));
});
test('actual matched exact integer operations in two separate workers',{skip:!enabled},()=>{
 const operations=[{op:'add',a:'9007199254740993',b:'2'},{op:'subtract',a:'1',b:'3'},{op:'multiply',a:'-7',b:'6'},{op:'gcd',a:'54',b:'24'}];
 const a=isolatedRequest({image,arm:'ARM_2A',kind:'math',operations}),b=isolatedRequest({image,arm:'ARM_2B',kind:'math',operations});
 assert.deepEqual(a.result,['9007199254740995','-2','-42','6']);assert.deepEqual(a.result,b.result);assert.equal(a.evidence.workerSHA256,b.evidence.workerSHA256);console.log(JSON.stringify({evidenceClass:'ACTUAL_OFFLINE_INTEGER_PARITY',a,b}));
});
