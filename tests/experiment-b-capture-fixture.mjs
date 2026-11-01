// SYNTHETIC ONLY. No provider executable, human identity or live authority.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { digest } from '../scripts/experiment-b-resumable/journal.mjs';
export function syntheticCapture(t, options = {}) {
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'td613-capture-synthetic-'));
  t.after(()=>{assert.equal(path.dirname(directory),os.tmpdir());assert(path.basename(directory).startsWith('td613-capture-synthetic-'));fs.rmSync(directory,{recursive:true,force:true});});
  const pending=new Map();
  const service={
    prepare(binding) {
      const outputFile=path.join(directory,binding.dispatchId+'.txt');
      const fd=fs.openSync(outputFile,'wx'); fs.closeSync(fd);
      const ticket={...binding,captureId:binding.dispatchId,outputFile};
      pending.set(binding.dispatchId,{ticket,consumed:false});return ticket;
    },
    collect({dispatchId,ticket}) {
      if(options.absent)throw Error('SYNTHETIC_FILE_ABSENT');
      return {bytes:fs.readFileSync(ticket.outputFile),proof:{dispatchId:options.wrongDispatch?'WRONG':dispatchId}};
    },
    verify(binding,proof) {
      const row=pending.get(binding.dispatchId);
      if(!row || row.consumed || options.stale || options.reused || proof.dispatchId!==binding.dispatchId)return false;
      row.consumed=true;
      return digest(fs.readFileSync(row.ticket.outputFile))===binding.finalSHA256;
    }
  };
  const spawnNative=async call=>{
    const index=call.args.indexOf('--output-last-message');assert(index>=0);
    const output=options.output??'SYNTHETIC_FINAL';
    fs.writeFileSync(call.args[index+1],options.fileOutput??output);
    const events=[{type:'thread.started',thread_id:'SYNTHETIC_THREAD'},...(options.events??[]),{type:'item.completed',item:{type:'agent_message',text:output}},{type:'turn.completed',usage:{input_tokens:3,output_tokens:1}},...(options.late??[])];
    const stdout=events.map(JSON.stringify).join('\n');
    if(!options.skipCapture)call.capture('stdout',Buffer.from(stdout));
    return {exitCode:0,stdout,stderr:''};
  };
  return {service,spawnNative};
}
