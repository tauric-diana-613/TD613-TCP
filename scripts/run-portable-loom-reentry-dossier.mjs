/** Compile independently scoped findings; byte checks do not authenticate origin. */
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createDollhouseCaseDossier,DOLLHOUSE_CASE_DOSSIER_SCHEMA} from '../app/engine/dollhouse-case-dossier.js';

const source=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const changed=execFileSync('git',['diff','HEAD','--name-only','--','app'],{encoding:'utf8'}).trim();
if(changed)throw new Error('HELD_UNCOMMITTED_APPLICATION_SOURCE: commit application changes before compiling the dossier.');
const rootReceipt=JSON.parse(await readFile('docs/reentry/browser-evidence/candidate/receipt.json','utf8'));
if(rootReceipt.status!=='PASS'||!rootReceipt.application_matches_commit)throw new Error('HELD_ROOT_BROWSER_WITNESS');
for(const [path,sha] of Object.entries(rootReceipt.source_bytes)){
  const bytes=execFileSync('git',['show',`HEAD:${path}`]);
  if(createHash('sha256').update(bytes).digest('hex')!==sha)throw new Error(`HELD_BROWSER_SOURCE_DRIFT: ${path}`);
}
const findings=[],checked=[];
async function finding(id,agent,claim,verdict,evidenceClass,path,condition,limitations){
  const bytes=await readFile(path),sha=createHash('sha256').update(bytes).digest('hex');
  checked.push({artifact:path,bytes:bytes.length,sha256:sha});
  findings.push({id,agent,claim_key:claim,verdict,evidence_class:evidenceClass,
    observation_scope:{source:path,instrument:`Independent ${agent} review / stated local instrument`,condition,
      temporal_window:'2026-10-02 resumed session; exact source/time coordinates remain inside each artifact'},
    reference:{artifact:path,sha256:sha},limitations});
}
await finding('pedagogue-prior-veto','PEDAGOGUE','prior_surface.new_root_notice','CONTRADICTED','BROWSER_WITNESS',
  'docs/reentry/browser-evidence/pedagogue-resumed/receipt.json','Original working-tree prototype; offscreen consequence and unacknowledged replacement.',
  ['Historical failed surface, not a finding about the repaired source.','Visible exposure does not measure comprehension.']);
await finding('pedagogue-repair','PEDAGOGUE','repaired_surface.new_root_notice_and_gesture','SUPPORTED','BROWSER_WITNESS',
  'docs/reentry/browser-evidence/pedagogue-repair/receipt.json','Desktop/390px actual rendered exposure, denied/acknowledged replacement, private Save and admission.',
  ['This independent route is source-pinned by its served-byte receipt. Later metadata repairs receive separate root witnessing.','No human comprehension or physical-device measurement.']);
await finding('aperture-integrity','APERTURE','local_binding_and_episode_reservation','SUPPORTED','OFFLINE_TEST',
  'docs/reentry/APERTURE_FINDINGS.md','Independent substitution, omission, concurrency and source-coordinate controls.',
  ['Synthetic local tests, not receiver-origin authentication.','Acquisition class metadata is declared.']);
await finding('aperture-exterior','APERTURE','foreign_execution_and_enforcement','HELD','DECLARATION',
  'docs/reentry/EVIDENCE_AND_HOLDS.md','Local supplied capture and recomputation leave observationally equivalent fabricated histories.',
  ['Requires separately qualified host/action/custody witnesses.','Another transformation f(A) is not an exogenous witness.']);
await finding('atlas-relations','ATLAS','local_parents_scope_and_continuation','SUPPORTED','BROWSER_WITNESS',
  'docs/reentry/browser-evidence/atlas-scope-fourth/receipt.json','Independent desktop/390px fixed foreign anchor, distinct local parents, explicit sources and retained scopes.',
  ['Recorded route and content equality do not identify hidden foreign history.','Six guarded file hashes are not full dependency closure.']);
await finding('atlas-restoration','ATLAS','global_fork_exclusion_and_imported_authority','HELD','DECLARATION',
  'docs/reentry/RELATION_MAP.md','Process-local issued capabilities and review-only exports.',
  ['No independently authenticated durable current-head service in this lane.','Session continuity is not content or evidence continuity.']);
await finding('fadt-retention','FADT','finite_action_support_after_history_erasure','SUPPORTED','OFFLINE_TEST',
  'docs/reentry/FADT_RESUME_FINDINGS.md','Actual clean-only vs linked-exposure-then-clean admission controls plus occupied finite fibres.',
  ['Supports are declared finite inputs; model consistency supplies no action authority.','Equality applies only to the selected action coordinate.']);
await finding('missing-runtime-class','FADT','runtime_gesture_and_semantic_field_input','HELD','DECLARATION',
  'docs/reentry/FADT_RESUME_FINDINGS.md','Challenge adapter has no captured operator gesture trace or Portable-AIA semantic field.',
  ['HELD_INPUT_CLASS retained without compatibility object fabrication.','Independent browser collaboration does not manufacture runtime input.']);
await finding('final-root-route','PEDAGOGUE','final_candidate.rendered_route','SUPPORTED','BROWSER_WITNESS',
  'docs/reentry/browser-evidence/candidate/receipt.json','Exact committed application bytes; multiple tasks, large source set, admission, descendant assays, HOLD and recovery.',
  ['Synthetic returns and simulated viewport; foreign execution and comprehension unmeasured.','No release or production acceptance authority.']);
const dossier=createDollhouseCaseDossier({schema:DOLLHOUSE_CASE_DOSSIER_SCHEMA,
  case_id:'portable-loom-reentry-authenticated-local-ancestry',source_revision:source,findings});
await writeFile('docs/reentry/CASE_DOSSIER.json',JSON.stringify(dossier,null,2)+'\n');
await writeFile('docs/reentry/CASE_ARTIFACT_BYTES.json',JSON.stringify({schema:'td613.reentry.dossier-artifact-byte-check/v0.1',
  source_revision:source,root_browser_source:rootReceipt.source_sha,root_application_bytes_match_current_commit:true,
  status:'PASS',scope:'Local referenced bytes hashed by this separate script. Dossier clerk does not perform these checks.',
  upstream_authentication:false,evidence_multiplication:false,files:checked},null,2)+'\n');
console.log(JSON.stringify({source_revision:source,findings:findings.length,byte_checks:checked.length,
  decision:dossier.decision,unresolved:dossier.unresolved_finding_ids,authority:dossier.authority}));
