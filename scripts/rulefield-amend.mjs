#!/usr/bin/env node
/**
 * TD613 Kiki-Receiver — local-only amendment inbox dispatcher.
 * All writes target review outbox. Canonical Rulefield stays read-only.
 * Usage:
 *   node scripts/rulefield-amend.mjs help
 *   node scripts/rulefield-amend.mjs init RF-AP-20261107-001
 *   node scripts/rulefield-amend.mjs inspect RF-AP-20261107-001.json
 *   node scripts/rulefield-amend.mjs sync
 *   node scripts/rulefield-amend.mjs dry-run
 */
import {
 receiverCapabilities,packetTemplate,inspectPacket,intakeOne,syncInbox,initInbox,registryDigest
} from '../packages/rulefield/amendments/receiver.mjs';
const [cmd='help',value]=process.argv.slice(2);
const print=x=>console.log(JSON.stringify(x,null,2));
try{
 if(cmd==='help')print({...receiverCapabilities,commands:{
  init:'Create one inbox packet with the exact current registry digest; refuses overwrite.',
  inspect:'Dry-run a named inbox JSON packet and show review disposition; no writes.',
  sync:'Scan all inbox JSON packets, create complete JSON/Markdown review AND Light/Medium/Heavy human disclosure; never apply.',
  'dry-run':'Scan all inbox packets, validate only; no writes.',
  baseline:'Print SHA-256 of canonical source-free Rulefield registry.',
  template:'Show a sample machine-readable packet (without writing it).',
  hooks:'Read amendments/hooks.json for structured receiver lifecycle hooks.'}});
 else if(cmd==='init')print(initInbox(value||'RF-AP-20261107-001'));
 else if(cmd==='inspect'){if(!value)throw new Error('Provide inbox packet filename');print(intakeOne(value,{write:false}));}
 else if(cmd==='sync')print(syncInbox({write:true}));
 else if(cmd==='dry-run')print(syncInbox({write:false}));
 else if(cmd==='baseline')print({schema:'td613.rulefield.baseline-sha256/v1',sha256:registryDigest(),state:'READ_ONLY'});
 else if(cmd==='template')print(packetTemplate());
 else if(cmd==='hooks')print(JSON.parse((await import('node:fs')).readFileSync(new URL('../packages/rulefield/amendments/hooks.json',import.meta.url),'utf8')));
 else{print({error:'UNKNOWN_COMMAND',name:cmd});process.exitCode=2;}
}catch(error){console.error(JSON.stringify({status:'FAIL_CLOSED',code:error.code||'INVALID_OR_UNAVAILABLE',message:error.message}));process.exitCode=1;}
