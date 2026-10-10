"""Supply one analyst's separately scoped findings to the existing bounded clerk."""
import hashlib,json
from datetime import datetime,timezone
from pathlib import Path
R=Path(__file__).resolve().parent
def load(n):return json.loads((R/n).read_text())
def ref(n):return {'artifact':n,'sha256':hashlib.sha256((R/n).read_bytes()).hexdigest()}
def save(n,v):(R/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
findings=[]
def add(id,agent,claim,verdict,cls,artifact,condition,limits):
 findings.append({'id':id,'agent':agent,'claim_key':claim,'verdict':verdict,'evidence_class':cls,
  'observation_scope':{'source':'TD613 October 2026 Portable Loom first configured Gemini receiver corpus',
   'instrument':'One higher-model assistant plus retained byte/schema audit; no independent doll or second receiver',
   'condition':condition,'temporal_window':'Original captures 2026-10-09; a13-a19 captures 2026-10-10; review after a19 completion'},
  'reference':ref(artifact),'limitations':limits})
add('P_AUTHORITY','PEDAGOGUE','acquisition_and_admission_are_separate','SUPPORTED','EMPIRICAL_ACQUISITION','BYTE_AUDIT.json',
 'Frozen A19 authorized two sequential calls; both captured; parked HELD; no admission occurred.',
 ['Paid association is OPERATOR_ATTESTED_PAID; runtime key fingerprint matching does not independently prove Google billing association.',
  'The assay reviews current captures and grants no release, provider, or custody action.'])
add('P_RECEIPT','PEDAGOGUE','full_revised_output_contract_met','CONTRADICTED','PROVIDER_RESPONSE','TARGETED_ADJUDICATIONS.json',
 'Five of eight task receipts have a footer without the required explicit unverified/unadmitted qualification.',
 ['The defect is an output-contract omission. None of these observations proves that custody advanced.',
  'Primary frozen targeted checks remain supported separately.'])
add('A_BYTE_AUDIT','APERTURE','available_capture_bytes_match_ledger','SUPPORTED','OFFLINE_TEST','BYTE_AUDIT.json',
 '82 locally available records audited; provider request/response and 70 answer digests match the full-ID ledger.',
 ['One original a8 R12-3 answer preimage remains unlocated; its ledger hash supplies no answer bytes.',
  'a13 freeze bundle preimage remains unlocated despite individually verified files.'])
add('A_PRIMARY','APERTURE','bounded_primary_regression_checks','SUPPORTED','PROVIDER_RESPONSE','TARGETED_ADJUDICATIONS.json',
 'All 16 selected captures support their applicable frozen primary checks across seven case families.',
 ['Fixed, targeted, non-random battery with repeated prompts and chained turns.',
  'A single unblinded reviewer; no reliability estimate or causal treatment effect.'])
add('A_HIDDEN','APERTURE','foreign_host_enforcement_or_secrecy','UNKNOWN','EMPIRICAL_ACQUISITION','SCORECARD.json',
 'Visible text, provider-response metadata, and local custody bytes only; no hidden memory, training, or independent observer trace.',
 ['No protected secret recovery/retention assay or whole-conversation leakage denominator.',
  'Clean selected outputs do not establish hidden enforcement, non-retention, noninterference, or universal secrecy.'])
add('AT_RELATION','ATLAS','declared_source_and_policy_relation_preserved_in_retest','SUPPORTED','OFFLINE_TEST','BYTE_AUDIT.json',
 'All selected revised-artifact captures share the artifact hash; chained turns use successful predecessors from their own run.',
 ['The original and revised artifacts have different hashes and governing output contracts.',
  'Transport commits and run identities remain separate; later successes do not restore earlier experimental states.'])
add('AT_RETURN','ATLAS','origin_registered_receipts_admissible','HELD','PROVIDER_RESPONSE','TARGETED_ADJUDICATIONS.json',
 'Receipt arrays and carried roots match, but origin source-ID mapping is unavailable for named or unnamed inline examples.',
 ['R06-2 turn 1 summarizes an inline selected document while used_document_ids is empty.',
  'No actual origin Loom Check, task/source authorization comparison, CAS Admit, or custody head advance was performed.'])
add('F_GAP','FADT','method_nomenclature_and_gap_preserved','SUPPORTED','PROVIDER_RESPONSE','TARGETED_ADJUDICATIONS.json',
 'A19 R09-1 method reply reproduces all 32 names/scopes and states irreducible gap U minus I while retaining NOT_RUN.',
 ['Correct explanation is not execution of the finite support theorem on a new declared manifest.',
  'Finite law has no universal AI information-loss or physical-geometry claim here.'])
add('F_ERASURE','FADT','promotion_from_capture_coverage_to_full_acceptance','HELD','DECLARATION','SCORECARD.json',
 'A 16/16 primary-support label would erase five other contract failures and origin-registration holds.',
 ['This is a scoped promotion review; no new quantified FADT support experiment is asserted.',
  'The finding retains distinct primary, full-contract, custody, and historical-availability coordinates.'])
save('DOLLHOUSE_FINDINGS_INPUT.json',{'schema':'td613.dollhouse.case-dossier/v0.1','case_id':'PORTABLE_LOOM_A19_HIGHER_MODEL_ASSAY_20261010',
 'source_revision':'dc1851e199e850ca610e71c0c49df5f1acf37759','findings':findings})
save('TEMPORAL_SIDECAR.json',{'schema':'td613.loom.manual-temporal-review/v1','role':'TEMPORAL_CUSTODIAN',
 'reviewed_at':datetime.now(timezone.utc).isoformat(),'execution':'MANUAL_SIDECAR; separate candidate adapter not invoked',
 'verdict':'HELD_FOR_FULL_ACCEPTANCE','local_a19_acquisition':'COMPLETE_TWO_ANSWERS_NO_PROVIDER_HOLD',
 'global_output_contract':'Five receipt qualifier failures retained; no later clean answer clears them.',
 'history_preserved':True,'earlier_ledgers_unchanged':load('BYTE_AUDIT.json')['ledger_unchanged_by_full_keys'],
 'a13_bundle_preimage':'UNLOCATED','a8_R12_3_original_bytes':'UNLOCATED',
 'count_correction':'51 retained original-slot preimages plus a9 replacement = prior 52-entry review dataset; fresh setup supplements are separate.',
 'non_retroactivity':'Later source repair, release, capture, and this review supply no earlier chronology or original-state recovery.',
 'independence':'Same single analyst; separate jurisdiction, not independent witness or fifth installed clerk role.',
 'authority':{'admit':False,'provider':False,'release':False,'deployment':False}})
print('Manual findings prepared:',len(findings))
