"""Allowlisted original-method runner. Genuine inputs execute on the origin side only."""
import importlib.util
import json
from pathlib import Path
import re
import sys
import tempfile
from . import core

ROOT=Path(__file__).resolve().parent
PINS={x['path']:x for x in json.loads((ROOT/'ORIGINAL_CODE_PINS.json').read_bytes())}
REGISTRY={
 'SRC_PHASE2_TOMOGRAPHY':('native/phase2.py','conservation_and_tomography',{'operator':'claim_effect_dimensions_forward','evidence_delta':'UNKNOWN_AS_ORIGINAL','authority_delta':'UNKNOWN_AS_ORIGINAL','composite':'NULL_AS_ORIGINAL','scientific_ceiling':'DECLARED_EFFECTS_ONLY'}),
 'SRC_PHASE2_CONTEXT_ROLES':('native/phase2.py','contextual_roles_and_compilers',{'operator':'compiler_scope_time_context_roles','role':'CONTEXTUAL_NOT_INTRINSIC','candidate_status':'PRESERVED','scientific_ceiling':'RECORDED_CONTEXT_ONLY'}),
 'SRC_PROJECTIVE_ROUTING':('native/projective.py','summary',{'operator':'original_lexical_projective_census','native_cue':'Explore X.','candidates':'NO_SEMANTIC_OR_CAUSAL_PROMOTION','native_epoch':'FIXED_LITERAL_NOT_AUTHENTICATION'}),
 'SRC_NATIVE_QUERY':('native/query.py','query_dispatch',{'operator':'original_exact_identifier_readonly_query','missing_hops':'EXPLICIT','authority':'NO_LATEST_WINS','path_context':'EXACT_STAGED_BYTES_OR_EXPLICIT_ABSENCE;_WITHHELD_CONTEXT_HELD','scientific_ceiling':'WITNESSED_RECORDS_ONLY'})}
QUERY_INPUTS={
 'summary':['01-MANIFESTS/phase2/acquisition-outcomes.jsonl',*[f'05-OPERATIONS/phase2/{x}.jsonl' for x in ['expected-object-observations','contextual-role-assertions','compilation-passes','authority-jurisdiction-assertions','evidence-lineage-assertions']],'04-RECEIPTS/assays/2026-08-24-phase2-kiln/coverage-ledger.jsonl'],
 'resolve':['01-MANIFESTS/phase2/entity-resolver-v2.jsonl'],
 'authority':['05-OPERATIONS/phase2/authority-jurisdiction-assertions.jsonl'],
 'trace':['01-MANIFESTS/entity-index.jsonl',*[f'01-MANIFESTS/phase2/{x}.jsonl' for x in ['entity-resolver-v2','capture-v2','derivative-v1']],'04-RECEIPTS/assays/2026-08-24-phase15-authority-recompilation/witnessed-evidence.jsonl','05-OPERATIONS/relations/typed-edges.jsonl','05-OPERATIONS/relations/recompilation-edges.jsonl',*[f'05-OPERATIONS/phase2/{x}.jsonl' for x in ['contextual-role-assertions','compilation-passes','reference-assertions','authority-jurisdiction-assertions']]]}

def descriptor(method_id):
    core.need(method_id in REGISTRY,'UNSUPPORTED_NATIVE_METHOD')
    path,entry,contract=REGISTRY[method_id];pin=PINS[path]
    return {'method_id':method_id,'version':'original-v1','entrypoint':entry,'executable_sha256':pin['sha256'],
      'executable_git':{'repository':'tauric-diana-613/TD613-TCP','revision':pin['source_revision'],'path':pin['source_path'],'blob':pin['git_blob'],'lfs':None},'semantic_contract':contract.copy()}

def module(method_id):
    core.need(method_id in REGISTRY,'UNSUPPORTED_NATIVE_METHOD');path=REGISTRY[method_id][0];file=ROOT/path
    core.need(not file.is_symlink() and core.sha(file.read_bytes())==PINS[path]['sha256'],'NATIVE_EXECUTABLE_PIN_MISMATCH')
    name='carrier_native_'+method_id;spec=importlib.util.spec_from_file_location(name,file);m=importlib.util.module_from_spec(spec);sys.modules[name]=m;spec.loader.exec_module(m);return m

def input_paths(c):
    mid=c['method']['method_id'];p=c['parameters']
    if mid in ('SRC_PHASE2_TOMOGRAPHY','SRC_PHASE2_CONTEXT_ROLES'):
        core.keys(p,['snapshot_id']);core.need(p['snapshot_id']==c['epoch']['snapshot_id'],'SNAPSHOT_PARAMETER_MISMATCH')
        return {'05-OPERATIONS/relations/representation-lift-candidates.jsonl'} if mid=='SRC_PHASE2_TOMOGRAPHY' else {'05-OPERATIONS/relations/recompilation-edges.jsonl','05-OPERATIONS/relations/compiler-input-candidates.jsonl'}
    if mid=='SRC_PROJECTIVE_ROUTING':
        core.keys(p,['operation']);core.need(p['operation']=='inventory','UNSUPPORTED_NATIVE_OPERATION')
        paths={a['path'] for a in c['assets']}
        core.need(all(re.fullmatch(r'03-DERIVATIVES/text/zenodo/zenodo-\d+-(?:file-0|metadata)\.md',x) for x in paths),'UNSUPPORTED_PROJECTIVE_INPUT')
        return paths
    core.keys(p,['operation','identifier','scope','absent_paths','withheld_paths']);core.need(p['operation'] in QUERY_INPUTS,'UNSUPPORTED_NATIVE_OPERATION')
    for key in ['absent_paths','withheld_paths']:
        core.need(type(p[key]) is list and len(set(p[key]))==len(p[key]),'EXPLICIT_PATH_CONTEXT_LIST_REQUIRED')
        for path in p[key]:core.relative(path)
    return set(QUERY_INPUTS[p['operation']])|{'04-RECEIPTS/phase2/current-seal.json','04-RECEIPTS/phase2/projection-seal.json'}

def validate_native_epoch(c):
    ep=c['epoch'];m=c['method']
    need=core.need;parse=core.parse;asset_bytes=core.asset_bytes;canon=core.canon;sha=core.sha
    if ep['binding_class']=='CONSUMED_BYTES_VERIFIED':
        need(c['source_class']=='PUBLIC_SOURCE_BOUND','VERIFIED_EPOCH_NEEDS_PUBLIC_ORIGIN_SIDE_ASSETS')
        assets={a['path']:a for a in c['assets']};seal_path='04-RECEIPTS/phase2/projection-seal.json'
        need(seal_path in assets,'VERIFIED_EPOCH_NEEDS_PROJECTION_MANIFEST')
        manifest=parse(asset_bytes(assets[seal_path],c['source_class']))
        need(manifest.get('atelier_snapshot_id')==ep['snapshot_id'] and manifest.get('seal_id')==ep['seal_id'] and manifest.get('projection_seal_id')==ep['projection_seal_id'],'EPOCH_MANIFEST_BINDING_MISMATCH')
        entries=manifest.get('entries');need(type(entries) is list,'SEAL_ENTRIES_REQUIRED')
        basis=b''.join(canon(e)+b'\n' for e in entries)
        need('src-projection-seal:'+sha(basis)==ep['projection_seal_id'],'PROJECTION_SEAL_DIGEST_MISMATCH')
        bypath={e['path']:e for e in entries};need(len(bypath)==len(entries),'DUPLICATE_SEAL_ENTRY')
        method_entries=[e for path,e in bypath.items() if m['executable_git']['path'].endswith('/'+path)]
        need(len(method_entries)==1 and method_entries[0]['sha256']==m['executable_sha256'],'NATIVE_EXECUTABLE_NOT_BOUND_TO_SEAL')
        replay={r['path']:r for r in ep['replay_lineage']};need(len(replay)==len(ep['replay_lineage']),'DUPLICATE_REPLAY_ENTRY')
        for path,a in assets.items():
            if path in (seal_path,'04-RECEIPTS/phase2/current-seal.json'):continue
            need(path in bypath,'CONSUMED_ASSET_NOT_SEALED');raw=asset_bytes(a,c['source_class'])
            if path in replay:
                lineage=replay[path];need(sha(raw)==lineage['retained_sha256'],'REPLAY_RETAINED_DIGEST_MISMATCH')
                raw=raw.replace(b'\r\n',b'\n').replace(b'\n',b'\r\n')
                need(sha(raw)==lineage['replayed_sha256'],'REPLAY_BYTES_MISMATCH')
            need(sha(raw)==bypath[path]['sha256'] and len(raw)==bypath[path]['bytes'],'CONSUMED_SEAL_BYTES_MISMATCH')


def _run(c,*,origin_side_public=False):
    core.validate(c)
    validate_native_epoch(c)
    core.need(c['source_class']=='SYNTHETIC' or (c['source_class']=='PUBLIC_SOURCE_BOUND' and origin_side_public is True),'GENUINE_RECEIVER_ADMISSION_HELD')
    mid=c['method']['method_id'];core.need(core.canon(c['method'])==core.canon(descriptor(mid)),'NATIVE_METHOD_SEMANTICS_CHANGED')
    expected=input_paths(c);found={a['path'] for a in c['assets']}
    if c['epoch']['binding_class']=='CONSUMED_BYTES_VERIFIED':
        expected.add('04-RECEIPTS/phase2/projection-seal.json')
        if '04-RECEIPTS/phase2/current-seal.json' in found:expected.add('04-RECEIPTS/phase2/current-seal.json')
    dynamic_query=mid=='SRC_NATIVE_QUERY' and c['parameters']['operation'] in ('resolve','trace')
    core.need((expected<=found) if dynamic_query else (found==expected),'EXACT_METHOD_INPUT_CLOSURE_REQUIRED')
    m=module(mid)
    with tempfile.TemporaryDirectory(prefix='td613-native-method-') as temp:
        root=Path(temp)
        replay={r['path']:r for r in c['epoch']['replay_lineage']} if c['epoch']['binding_class']=='CONSUMED_BYTES_VERIFIED' else {}
        for a in c['assets']:
            raw=core.asset_bytes(a,c['source_class'])
            if a['path'] in replay:raw=raw.replace(b'\r\n',b'\n').replace(b'\n',b'\r\n')
            p=root/a['path'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw)
        if mid=='SRC_PHASE2_TOMOGRAPHY':return m.conservation_and_tomography(root,c['parameters']['snapshot_id'])[1]
        if mid=='SRC_PHASE2_CONTEXT_ROLES':
            roles,passes=m.contextual_roles_and_compilers(root,c['parameters']['snapshot_id']);return {'roles':roles,'compilation_passes':passes}
        if mid=='SRC_PROJECTIVE_ROUTING':
            docs=m.load_documents(root)
            as_of=core.timestamp(c['chronology']['as_of'])
            for document in docs:
                created=m.parse_iso(document.created) or m.parse_iso(document.publication_date)
                core.need(created is None or created<=as_of,'SOURCE_DOCUMENT_AFTER_COMPARISON_FRAME')
            explore=m.explore_observations(docs);signatures=m.signature_observations(docs);markers=m.field_marker_observations(docs)
            return {'summary':m.summary(docs,explore,signatures,markers),'explore':explore,'signatures':signatures,'markers':markers}
        m.epoch(root,c['epoch']['snapshot_id'],c['epoch']['seal_id'])
        p=c['parameters'];op=p['operation'];id=p['identifier']
        if op in ('summary','authority'):
            core.need(not p['absent_paths'] and not p['withheld_paths'],'UNUSED_PATH_CONTEXT_DECLARATION')
            return m.summarize(root) if op=='summary' else m.authority(root,id,p['scope'])
        core.need(type(id) is str and bool(id),'NATIVE_IDENTIFIER_REQUIRED')
        result=getattr(m,op)(root,id)
        selected=result.get('matches',[]) if op=='resolve' else result.get('resolver_records',[])
        referenced={core.relative(row['path']) for row in selected if row.get('path')}
        absent=set(p['absent_paths']);withheld=set(p['withheld_paths'])
        core.need(not withheld,'NATIVE_PATH_CONTEXT_WITHHELD')
        core.need(not (absent&found) and absent<=referenced,'CONTRADICTORY_PATH_CONTEXT')
        core.need(found==expected|(referenced-absent),'NATIVE_PATH_CONTEXT_CLOSURE_MISSING')
        return result


def run(c,*,origin_side_public=False):
    result=_run(c,origin_side_public=origin_side_public)
    core.canon(result)  # The original operation cannot return nonfinite/unbounded carrier values.
    return result
