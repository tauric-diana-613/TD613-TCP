import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createDollhouseCaseDossier} from './inputs/dollhouse-case-dossier.js';
const root=path.dirname(fileURLToPath(import.meta.url));
const input=JSON.parse(fs.readFileSync(path.join(root,'DOLLHOUSE_FINDINGS_INPUT.json'),'utf8'));
const output=createDollhouseCaseDossier(input);
fs.writeFileSync(path.join(root,'DOLLHOUSE_CASE_DOSSIER.json'),JSON.stringify(output,null,2)+'\n');
fs.writeFileSync(path.join(root,'DOLLHOUSE_EXECUTION_RECEIPT.json'),JSON.stringify({
 schema:'td613.loom.bounded-clerk-execution/v1',executed_at:new Date().toISOString(),
 source_commit:'8d57bdfcd69cff9c5760cd001549197f3180c00a',
 mechanism:'Existing createDollhouseCaseDossier; one local call over one analyst\'s findings.',
 findings:output.findings.length,agent_coverage:output.agent_coverage,unresolved:output.unresolved_finding_ids,
 disagreements:output.disagreements,decision:output.decision,deep_frozen:Object.isFrozen(output)&&Object.isFrozen(output.findings),
 empirical_Dollhouse_comparison:'NOT_RUN',provider_calls:0,independent_agents:0,
 authority:output.authority,limitations:output.evidence_posture
},null,2)+'\n');
console.log(JSON.stringify({findings:output.findings.length,unresolved:output.unresolved_finding_ids,decision:output.decision,deep_frozen:Object.isFrozen(output)},null,2));
