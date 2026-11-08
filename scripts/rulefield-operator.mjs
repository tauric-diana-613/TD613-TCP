#!/usr/bin/env node
/**
 * 𝌋 Human Review Dispatcher — No authentication, no auto-adoption.
 * Usage: node scripts/rulefield-operator.mjs disclose <packet_name.json>
 *        node scripts/rulefield-operator.mjs decision-template <packetid>--<digest>
 *        node scripts/rulefield-operator.mjs decision-check <name.json> <stem>
 */
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {intakeOne,OUTBOX} from '../packages/rulefield/amendments/receiver.mjs';
import {inspectHumanDecision} from '../packages/rulefield/operator/decision.mjs';
const args=process.argv.slice(2),cmd=args[0]||'help';
const safe=s=>{if(!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,119}$/.test(s||'')||(s||'').includes('..'))throw Error('UNSAFE_OPERATOR_FILE_NAME');return s;};
const readDisclosure=stem=>JSON.parse(readFileSync(join(OUTBOX,safe(stem)+'.disclosure.json'),'utf8'));
const print=x=>console.log(JSON.stringify(x,null,2));
try{
 if(cmd==='help')print({role:'SOURCE_FREE_OPERATOR_INTERFACE',commands:[
  'disclose PACKET.json — create full review and Light/Medium/Heavy dossier in amendments/outbox',
  'decision-template RECEIPT_STEM — print an UNSIGNED JSON form with exact digest anchors',
  'decision-check DECISION_FILE.json RECEIPT_STEM — inspect human decision claim; no action'
 ],authority:'NO_CANONICAL_MUTATION_NO_IDENTITY_AUTHENTICATION'});
 else if(cmd==='disclose')print(intakeOne(safe(args[1]),{write:true}));
 else if(cmd==='decision-template'){
  const d=readDisclosure(args[1]);
  print({schema:'td613.rulefield.operator-decision/v1',decision:'ASK_QUESTIONS',packet_id:d.packet_id,
    packet_sha256:d.packet_sha256,disclosure_sha256:d.disclosure_sha256,
    baseline_registry_sha256:d.baseline_registry_sha256,
    selected_proposal_ids:[],scope:'STAGED_CANDIDATE_ONLY',
    human_statement:'',accepts_unknown_future_patch:false,
    human_authority_attestation:'HUMAN_MUST_SUPPLY_IN_AUTHORIZED_CHANNEL'});
 }
 else if(cmd==='decision-check'){
  const decision=JSON.parse(readFileSync(join(fileURLToPath(new URL('../packages/rulefield/operator/decisions/',import.meta.url)),safe(args[1])),'utf8'));
  const d=readDisclosure(args[2]);print(inspectHumanDecision(decision,d));
 }
 else{print({error:'UNKNOWN_COMMAND',cmd});process.exitCode=2;}
}catch(e){console.error(JSON.stringify({status:'FAIL_CLOSED',code:e.code||'OPERATOR_CLI_FAILURE',message:e.message}));process.exitCode=1;}