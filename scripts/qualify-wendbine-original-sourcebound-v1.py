#!/usr/bin/env python3
"""Pinned public original-method qualification, without private corpus admission."""
import argparse
from collections import Counter, defaultdict
import hashlib
import importlib.util
from itertools import combinations
import json
from pathlib import Path
import re
import subprocess
import tempfile

ORIGINAL='520e3db76af8f1c76618bd678456c543ec37b3e5'
EVOLVED='4dcb3ac45d5a14f1db2c2f9e0733ed2d1a7121c1'
COMPARATOR='61c09e54c1acd2223685eb4638fddffdd28e9515'
COMMON='3021cfbf94e33ad2935367056e4a33b01f43daad'
FIXTURE='packages/dome_world_exact/fixtures/a15-r0/WENDBINE'
ROOT=Path(__file__).resolve().parents[1]


def sha(raw):return hashlib.sha256(raw).hexdigest()
def jsonl(p):return [json.loads(line) for line in p.read_text(encoding='utf8').splitlines() if line.strip()]
def git(root,*args):return subprocess.check_output(['git','-C',str(root),*args])


def verify(root,revision):
    root=root.resolve()
    if git(root,'rev-parse','HEAD').decode().strip()!=revision:raise ValueError('WENDBINE_EXACT_ORIGINAL_HEAD_REQUIRED')
    result={}
    for entry in git(root,'ls-tree','-rz',revision,'--',FIXTURE).split(b'\0'):
        if not entry:continue
        header,p=entry.split(b'\t',1);mode,kind,oid=header.decode().split();rel=p.decode()
        file=root/rel
        if kind!='blob' or mode not in ('100644','100755') or file.is_symlink():raise ValueError('WENDBINE_PLAIN_TRACKED_FILE_REQUIRED')
        raw=file.read_bytes()
        if hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()!=oid:raise ValueError('WENDBINE_ORIGINAL_GIT_OR_LFS_BYTE_DRIFT:'+rel)
        result[file.relative_to(root/FIXTURE).as_posix()]={'git_blob':oid,'sha256':sha(raw),'bytes':len(raw)}
    actual={p.relative_to(root/FIXTURE).as_posix() for p in (root/FIXTURE).rglob('*') if p.is_file()}
    if actual!=set(result):raise ValueError('WENDBINE_UNDECLARED_PUBLIC_INPUT_FILE')
    return result


def qualify(original,evolved):
    original=original.resolve();evolved=evolved.resolve()
    old=verify(original,ORIGINAL);new=verify(evolved,EVOLVED)
    base=original/FIXTURE;later=evolved/FIXTURE
    posts=jsonl(base/'01-MANIFESTS/public-reddit-48h-source-registry-v01.jsonl')
    relations=json.loads((base/'01-MANIFESTS/typed-relation-registry-v01.json').read_text())
    frozen=json.loads((base/'03-DERIVATIVES/public-reddit-48h/topology-index.v0.1.json').read_text())
    receipt=json.loads((base/'04-RECEIPTS/assays/2026-09-11-wendbine-td613-bounded-assay-v01.json').read_text())
    with tempfile.TemporaryDirectory(prefix='wendbine-origin-public-') as folder:
        output=Path(folder)/'operations.json';full=Path(folder)/'topology.json'
        subprocess.run(['node',str(ROOT/'scripts/qualify-wendbine-native-operations-v1.mjs'),str(base),str(later),str(output),str(full)],check=True)
        executed=json.loads(output.read_text());native=json.loads(full.read_text())
    # Independent Python oracle over the declared input; no Node compiler reuse.
    concepts=defaultdict(set);pairs=defaultdict(set)
    for post in posts:
        for concept in set(post['declared_concepts']):concepts[concept].add(post['source_id'])
        for pair in combinations(sorted(set(post['declared_concepts'])),2):pairs[pair].add(post['source_id'])
    observed={(e['from'].removeprefix('concept:'),e['to'].removeprefix('concept:')):(e['weight'],set(e['source_ids'])) for e in native['cooccurrence_overlay']}
    expected={pair:(len(ids),ids) for pair,ids in pairs.items() if len(ids)>=2}
    assert observed==expected
    assert {x['label']:set(x['source_ids']) for x in native['concept_nodes']}==dict(concepts)
    counts=Counter(row[1] for row in relations['relations']);assert dict(counts)==native['typed_relation_counts']==frozen['typed_relation_counts']
    assert (len(posts),len(concepts),len(relations['relations']),len(expected))==(33,191,146,143)
    assert len(native['recurrent_public_concepts'])==43
    assert all(x['evidence_class']=='ARCHIVE_DERIVED_COOCCURRENCE_NOT_CAUSAL' for x in native['cooccurrence_overlay'])
    assert len(native['declaration_edges'])==sum(len(set(p['declared_concepts'])) for p in posts)
    assert native['correction_sources']==['reddit:t3_1wd7mjl'] and native['explicit_synthesis_sources']==['reddit:t3_1wcv89d']
    # Prior Git freeze is independently bound; this alone does not prove blind prediction.
    freeze=receipt['source_freeze'];freeze_pins={}
    for rel,field in [('01-MANIFESTS/public-reddit-48h-source-registry-v01.jsonl','source_registry_git_blob'),('01-MANIFESTS/typed-relation-registry-v01.json','typed_relation_registry_git_blob'),('06-INSTRUMENTS/HELD_OUT_RECONSTRUCTION_PROTOCOL_V0_1.md','held_out_protocol_git_blob')]:
        oid=git(original,'rev-parse',freeze['pre_assay_corpus_commit']+':'+FIXTURE+'/'+rel).decode().strip()
        assert oid==freeze[field]==old[rel]['git_blob'];freeze_pins[rel]=oid
    assert subprocess.run(['git','-C',str(original),'merge-base','--is-ancestor',freeze['pre_assay_corpus_commit'],'634c010648d033c3a2cb3349538ff95c4530ed3d']).returncode==0
    controls=receipt['held_out_reconstruction']['controls']
    assert controls['C4_unrelated_technical_post_decoy']['state']=='NOT_BOUND_NOT_EXECUTED'
    targets=receipt['held_out_reconstruction']['targets']
    assert Counter(t['adjudication'] for t in targets)=={'CONSTRAINED_PLACEMENT':4,'NEGATIVE_CONTROL_LIKE_RESULT':1}
    echo=next(t for t in targets if t['source_id']=='reddit:t3_1wd7mjl');assert echo['immediate_neighbors']=='NOT_RECONSTRUCTED'
    spec=importlib.util.spec_from_file_location('wendbine_derived_scab',ROOT/'scripts/wendbine-ordering-sensitivity-v1.py')
    scab=importlib.util.module_from_spec(spec);spec.loader.exec_module(scab);finite=scab.reproduce()
    historic_scab=json.loads((base/'04-RECEIPTS/assays/2026-09-11-prcsa-ordering-scab-assay-v04.json').read_text())['synthetic_fixture']
    assert (finite['terminal_signature_classes'],finite['canonical_equivalence_class_size'])==(historic_scab['observed_terminal_signature_classes'],historic_scab['canonical_terminal_equivalence_class_size'])
    manifests=jsonl(later/'01-MANIFESTS/phase2/manifestations.jsonl');ids={m['source_id'] for m in manifests};old_ids={p['source_id'] for p in posts}
    assert old_ids<=ids
    for rel in ('01-MANIFESTS/public-reddit-48h-source-registry-v01.jsonl','01-MANIFESTS/typed-relation-registry-v01.json','99-ADMIN/wendbine-compile.mjs'):
        assert old[rel]['sha256']==new[rel]['sha256']
    holds=json.loads((base/'ATELIER_PROFILE.json').read_text())['held_or_conditional_stages']
    assert holds==json.loads((later/'ATELIER_PROFILE.json').read_text())['held_or_conditional_stages']
    method_specs=[
      ('PUBLIC_TYPED_TOPOLOGY_COMPILER','99-ADMIN/wendbine-compile.mjs','EXECUTABLE_ORIGINAL_PUBLIC_METHOD_REPRODUCED','33 posts; 191 concepts; 146 typed relations; nine independent graph families. New strict successor matches exact native output; independent Python oracle agrees.','Original permissive inputs remain versioned; successor refuses unsupported graph/relation/evidence, identity substitution, duplicated witnesses and body-field masking.'),
      ('SOURCE_DECLARATION_AND_COOCCURRENCE','06-INSTRUMENTS/WENDBINE_PUBLIC_CORPUS_COMPILER_V0_1.md','EXECUTABLE_AS_PART_OF_ORIGINAL_COMPILER','43 recurrent concepts and 143 co-occurrences reproduced with exact source support sets. Declaration and co-occurrence evidence stay separate.','Co-occurrence remains noncausal; unknown sources and full-body flags refused by original; stronger versioned validation in successor.'),
      ('SOURCE_EXPLICIT_CORRECTION','05-OPERATIONS/2026-09-11-PUBLIC-SERIALIZED-TOPOLOGY-FIRST-PASS.md','ORIGINAL_FLAGS_EXECUTED_WITH_HISTORICAL_READING','Exact correction landmark reddit:t3_1wd7mjl retained; correction/source-synthesis flags survive original compilation.','Preserve both source assertion and researcher interpretation; no automatic chronological authority.'),
      ('HELD_OUT_RECONSTRUCTION','06-INSTRUMENTS/HELD_OUT_RECONSTRUCTION_PROTOCOL_V0_1.md','DOCUMENTARY_PREREGISTRATION_AND_LATER_PARTIAL_ADJUDICATION','Pre-assay Git freeze bound; historical four constrained placements and EchoCore failure verified as saved receipts; no new prediction run.','C1 order effect unidentified at DAY precision; C2/C3 structural ablations only; C4 NOT_BOUND_NOT_EXECUTED / HELD; full success unearned.'),
      ('BOUNDED_NOMENCLATURE_OPERATOR_CROSSWALK','04-RECEIPTS/assays/2026-09-11-wendbine-td613-bounded-assay-v01.json','HISTORICAL_SOURCE_READING_NOT_REEXECUTED_SCIENCE','14 rows: 4 BETTER_NAME, 1 BETTER_OPERATOR, 6 BOTH, 2 NEITHER, 1 REJECTED; source references preserved.','Conventional terminology confers no donor provenance; lineage, novelty and foreign donor chamber remain held.'),
      ('RESIDUAL_LITERATURE_SIEVE','05-OPERATIONS/2026-09-11-TD613-RESIDUAL-LITERATURE-SIEVE-V0_2.md','SUBSEQUENT_TD613_DOCUMENTARY_COMPARATOR','Seven saved verdict rows; original source supplement retained.','External literature was not independently revalidated in this bounded source-method qualification; no source-poster authorship or novelty promotion.'),
      ('DEVASTATE_REPAIR_SIEVE','05-OPERATIONS/2026-09-11-TD613-DEVASTATE-THEN-REPAIR-SIEVE-V0_3.md','SUBSEQUENT_TD613_DOCUMENTARY_COMPARATOR','Six saved zero-promotion verdicts and four surviving research targets preserved.','Retained questions about evidence-state utility, AIA governance, PRCS-A stage witnesses and scoped holonomy remain prospective.'),
      ('ORDERING_SCAB','05-OPERATIONS/2026-09-11-PRCSA-ORDERING-SCAB-ASSAY-V0_4.md','NEW_EXECUTABLE_TRANSCRIPTION_OF_TD613_SIDE_SYNTHETIC_METHOD','24 permutations reproduce 5 terminal classes and canonical class size 9; selected pair has an intermediate distinction; commuting control one class.','Finite declared synthetic operators only; no original executable recovered, no native public-poster or external pipeline claim.'),
      ('PORTABLE_AIA_ASSURANCE_DELTA','05-OPERATIONS/2026-09-13-PORTABLE-AIA-ASSURANCE-DELTA-V0_1.md','TD613_APPLICATION_DESIGN_WITH_HELD_EXTENSIONS','Four accepted operator-sharpening distinctions preserved: direct edges, source/path provenance, observation boundary, carriage/enforcement.','Uses September 11 parent corpus; September 13 date carries no source refresh. Freshness, update propagation, robustness/recovery extensions remain HELD.'),
      ('UNIFIED_PUBLIC_QUERY','99-ADMIN/wendbine-query.mjs','EVOLVED_ORIGINAL_EXECUTABLE_PUBLIC_METHOD_REPRODUCED','39,308 indexed metadata/receipt records; lexical/weighted-concept/recent/resolve APIs remain distinct. Held capture debt stays queryable.','Weighted token concept semantics supplies no embeddings or causal relation inference; 39,308 records are not 39,308 posts or full bodies.'),
      ('CAPTURE_RECONCILIATION','99-ADMIN/wendbine-capture-contract.mjs','EVOLVED_ORIGINAL_EXECUTABLE_PUBLIC_METHOD_REPRODUCED','25 observed = 0 persisted + 25 explicit failures; negative unexplained-gap control refused.','Reconciled debt remains lost historical payload; no inferred recovery or silent erase.'),
      ('SEALED_PUBLIC_EPOCH_QUERY','99-ADMIN/wendbine-srcquery.mjs','EVOLVED_ORIGINAL_EXECUTABLE_PUBLIC_METHOD_REPRODUCED','20 route/action cases on original sealed epoch; 2,062 manifestations / 6,763 captures; wrong seal, unknown action/route and mutated member refused.','All 6,703 present edges are MANIFESTATION; preserve separate nine-family legacy scientific topology. Metadata queries establish no private-body availability.'),
      ('TIME_INDEXED_CAPTURE_COMPILATION','99-ADMIN/wendbine-src-autosync.mjs','ORIGINAL_EXECUTABLE_SYNTHETIC_CONTROL_ONLY','Pure compileSync: time-indexed capture changes with stable source/manifestation and one blob for unchanged content; removed source held; predecessor unchanged.','No live discovery, gate activation, encryption/writeProjection or private bootstrap executed.'),
      ('VERBATIM_ACQUISITION_AND_PRIVATE_QUERY','06-INSTRUMENTS/WENDBINE_VERBATIM_ORIGINALS_ACQUISITION_V0_1.md','EVOLVED_CODE_PRESENT_GENUINE_RUNTIME_UNEXECUTED','Private query/audit/restore, archive/OAuth rescue and chat-export tools discovered from original estate.','Original DBs, raw source captures, private keys/archives, provider authorization and exact environment remain separate custody dependencies; none acquired or admitted.'),
    ]
    matrix=[]
    for mid,rel,classification,result,limit in method_specs:
        witness=new[rel] if rel not in old else old[rel];revision=ORIGINAL if rel in old else EVOLVED
        matrix.append({'original_method_or_investigation_id':mid,'original_source_revision':revision,'exact_witness':rel,**witness,
            'native_implementation_and_version':rel,'classification':classification,'original_input_output_and_provenance':'Pinned original public source/metadata and historical receipts; synthetic controls explicitly labelled.',
            'reproduction_or_differential_result':result,'current_universal_atelier_support':'Later observed-body/link retrieval; original native operations qualified separately, not integrated by corpus counts.',
            'negative_controls_and_unresolved_observations':limit,'held_or_human_gated_state':holds if mid=='HELD_OUT_RECONSTRUCTION' else 'Original declared state preserved',
            'scientific_claim_ceiling':limit,'required_repair':'Strict origin-side successor validation; current timestamp guard repaired. Other missing genuine execution remains explicitly unestablished.',
            'v2_and_capsule_requirements':'Preserve estate-specific snapshot/method IDs, graph type, capture and Work missingness, experiment provenance, negative controls and human holds.'})
    source_census=[]
    continuity=[]
    for rel,witness in new.items():
        if rel.startswith('99-ADMIN/') and Path(rel).suffix in ('.py','.mjs'):
            body=(later/rel).read_text(encoding='utf8')
            source_census.append({'path':rel,**witness,'exported_functions':re.findall(r'^export (?:async )?function (\w+)',body,re.M),
                'imports':re.findall(r'^import .*?from [\'\"]([^\'\"]+)',body,re.M),
                'execution_scope':'Only named public methods above executed; private acquisition/restore paths unexecuted'})
        if rel.startswith(('04-RECEIPTS/','05-OPERATIONS/','06-INSTRUMENTS/')) or rel=='ATELIER_PROFILE.json':
            body=(later/rel).read_text(encoding='utf8')
            continuity.append({'path':rel,**witness,'headings':[x for x in body.splitlines() if x.startswith('#')],
                'state_lines':[x for x in body.splitlines() if x.startswith(('**State:', 'Status:', 'STATUS ='))], 'automatic_resumption':False})
    verify(original,ORIGINAL);verify(evolved,EVOLVED)
    return {'schema':'td613.native-method-qualification/v1','estate':'WENDBINE','original_revision':ORIGINAL,'evolved_original_revision':EVOLVED,'restoration_comparator_revision':COMPARATOR,
        'original_witnesses':old,'evolved_witnesses':new,'verified_original_files':len(old),'verified_evolved_files':len(new),
        'native_execution':executed,'independent_python_compiler_oracle':{'concept_source_sets_match':True,'pair_support_sets_match':True,'nine_graph_counts_match':True,'declarations_checked':len(native['declaration_edges'])},
        'pre_assay_freeze':{'commit':freeze['pre_assay_corpus_commit'],'blob_bindings':freeze_pins,'ancestor_of_recorded_adjudication':True,'blind_prediction_independently_established':False},
        'historical_held_out_result':{'targets':targets,'controls':controls,'full_success_earned':False,'new_held_out_research_executed':False},
        'td613_side_synthetic_transcription':finite,'original_to_evolved_source_identity':{'original_post_ids':33,'all_ids_in_evolved_manifest':True,'evolved_manifestations':len(manifests),'genuine_body_byte_continuity_established':False},
        'restored_2767_3473_database':{'predecessor_reported_counts':[2767,3473],'genuine_database_available_in_this_qualification':False,'new_execution_credit':0,'old_method_state_migration_established':False},
        'native_inheritance_matrix':matrix,'evolved_code_inventory':source_census,'research_continuity_inventory':continuity,'historical_holds':holds,
        'common_method_comparator':{'pr':1118,'head':COMMON,'merged':False,'meaning':'Documentary shared evidence/authority interface; physical homogenization forbidden'},
        'unrecoverable_or_unexecuted_state':['Private source text and original archive bytes','Genuine restored database and exact historical runtime','Unrecorded held-out reasoning/scoring runtime','Unrun C4 unrelated-post decoy','Unsaved annotations, external literature reevaluation and private group material'],
        'disposition':'PUBLIC_ORIGINAL_NATIVE_METHODS_REPRODUCED_WITH_LIMITATIONS; PRIVATE_EXECUTION_AND_RECIPROCAL_INHERITANCE_UNESTABLISHED',
        'receiver_admission':'UNEXECUTED','protected_flights':'HELD','human_scientific_closure':'RESERVED','original_bytes_unchanged':True}


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--original-checkout',type=Path,required=True);p.add_argument('--evolved-checkout',type=Path,required=True);p.add_argument('--output',type=Path,required=True);a=p.parse_args()
    r=qualify(a.original_checkout,a.evolved_checkout);a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(json.dumps({k:r[k] for k in ('estate','original_revision','evolved_original_revision','verified_original_files','verified_evolved_files','disposition')}|{'native_output_sha256':r['native_execution']['compiler']['native_output_sha256']},indent=2))
