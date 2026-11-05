#!/usr/bin/env python3
"""Read-only original Em discovery plus separately labelled restoration execution.

No claim extraction, protected admission, held scientific assay or Flight runs.
"""
import argparse
from collections import Counter
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import sqlite3
import subprocess
import tempfile
import zipfile

ORIGINAL = '70b5a0f9e94626cba6068f41c6117e7978800bbd'
COMPARATOR = '9b9c9392d99975a8770b336eeae3c6ab1ae88d55'
FIXTURE = 'packages/dome_world_exact/fixtures/a15-r0/EMSTD613'
ROOT = Path(__file__).resolve().parents[1]
ADMIN = ROOT/FIXTURE/'99-ADMIN'


def sha(raw): return hashlib.sha256(raw).hexdigest()


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    result = importlib.util.module_from_spec(spec); spec.loader.exec_module(result)
    return result


def jsonl(path): return [json.loads(line) for line in path.read_text(encoding='utf8').splitlines() if line.strip()]


def qualify(checkout):
    checkout = Path(checkout).resolve()
    def git(*args): return subprocess.check_output(['git', '-C', str(checkout), *args])
    if git('rev-parse', 'HEAD').decode().strip() != ORIGINAL:
        raise ValueError('EM_ORIGINAL_EXACT_HEAD_REQUIRED')
    em = checkout/FIXTURE
    witnesses = {}
    for entry in git('ls-tree', '-rz', ORIGINAL, '--', FIXTURE).split(b'\0'):
        if not entry: continue
        header, rawpath = entry.split(b'\t', 1)
        mode, kind, oid = header.decode().split()
        path = rawpath.decode(); p = checkout/path
        if mode != '100644' or kind != 'blob' or p.is_symlink(): raise ValueError('EM_PLAIN_SOURCE_FILE_REQUIRED')
        raw = p.read_bytes()
        if hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest() != oid:
            raise ValueError('EM_ORIGINAL_BYTE_OR_LFS_CUSTODY_DRIFT:'+path)
        witnesses[p.relative_to(em).as_posix()] = {'git_blob': oid, 'sha256': sha(raw), 'bytes': len(raw)}
    sources = jsonl(em/'01-MANIFESTS/source-files.jsonl')
    derivatives = jsonl(em/'03-DERIVATIVES/derivative-index.jsonl')
    works = jsonl(em/'01-MANIFESTS/work-index.jsonl')
    links = jsonl(em/'01-MANIFESTS/work-manifestations.jsonl')
    for source in sources:
        rel = '02-ORIGINALS/emstd613lineage/'+source['relative_path']
        if witnesses[rel]['sha256'] != source['sha256'] or witnesses[rel]['bytes'] != source['byte_length']:
            raise ValueError('EM_ORIGINAL_SOURCE_IDENTITY_DRIFT')
    extracted = [d for d in derivatives if d.get('extraction_status') == 'EXTRACTED_NATIVE_TEXT']
    source_by_id = {s['source_file_id']: s for s in sources}
    for derivative in extracted:
        if witnesses[derivative['derivative_relative_path']]['sha256'] != derivative['derivative_sha256']:
            raise ValueError('EM_DERIVATIVE_IDENTITY_DRIFT')
        if source_by_id[derivative['source_file_id']]['sha256'] != derivative['parent_sha256']:
            raise ValueError('EM_DERIVATIVE_PARENT_DRIFT')
    scientific_extensions = {'.py', '.js', '.mjs', '.cjs', '.html', '.ipynb', '.r', '.ps1', '.sh', '.wasm', '.exe'}
    executables = [rel for rel in witnesses if Path(rel).suffix.lower() in scientific_extensions]
    zip_members = []
    for rel in witnesses:
        if rel.endswith('.zip'):
            with zipfile.ZipFile(em/rel) as archive:
                zip_members.extend({'archive': rel, 'member': z.filename, 'bytes': z.file_size,
                                    'executable_extension': Path(z.filename).suffix.lower() in scientific_extensions}
                                   for z in archive.infolist() if not z.is_dir())
    native = load_module('em_qualification_text', ADMIN/'em-native-text-search-v1.py')
    route = load_module('em_qualification_work', ADMIN/'em-work-route-v1.py')
    journey = load_module('em_qualification_journey', ADMIN/'em-research-journey-v1.py')
    firewall = load_module('em_qualification_firewall', ADMIN/'em-motif-mechanism-control-v1.py')
    sensitivity = load_module('em_qualification_sensitivity', ROOT/'scripts/em-identity-sensitivity-v1.py')
    routes = [route.route(em, work['work_id']) for work in works]
    assert all(r['status'] != 'UNRESOLVED_WORK_ID' if 'status' in r else True for r in routes)
    assert sum(len(r['manifestations']) for r in routes) == 53
    absent = route.route(em, 'emwork_absent_qualification_control')
    assert absent['status'] == 'UNRESOLVED_WORK_ID'
    with tempfile.TemporaryDirectory(prefix='em-public-origin-side-') as folder:
        db = Path(folder)/'derivatives.sqlite'
        built = native.build(em, db, 'EMSTD613'); verified = native.verify(em, db, 'EMSTD613')
        for d in extracted:
            sid = 'derivative:'+d['derivative_relative_path']
            read = native.get(db, sid, include_text=True)
            assert sha(read['text'].encode()) == d['derivative_sha256']
            assert native.cite(db, sid)['source_sha256'] == d['derivative_sha256']
            span = native.context(db, sid, length=128)
            assert sha(span['text'].encode()) == span['span_sha256']
        first = extracted[0]; raw = (em/first['derivative_relative_path']).read_bytes()
        word = re.search(r'\w{5,}', raw.decode()).group()
        hit = native.search(db, word, limit=100, mode='exact')
        expected = [d for d in extracted if word in (em/d['derivative_relative_path']).read_text(encoding='utf8')]
        assert hit['total'] == len(expected)
        assert native.search(db, 'TD613_QUALIFICATION_ABSENT_TOKEN_5f9412', mode='exact')['total'] == 0
        joined = journey.explore(em, db, word, limit=5)
        assert joined['identity_sensitivity'] == {'operational_works': 32, 'supported_collapse': 32, 'supported_split': 40, 'human_gated_groups': 8}
        # Authentic exact bytes establish only the restored refusal guard.
        piece = raw[:64]
        while piece:
            try: piece.decode(); break
            except UnicodeDecodeError: piece = piece[:-1]
        packet = {'spans': [{'source_id': first['source_file_id'], 'sha256': sha(raw), 'byte_offset': 0,
                             'length_utf8': len(piece), 'span_sha256': sha(piece)}]}
        refused = firewall.assess(packet, {first['source_file_id']: raw})
        assert refused['classification'] == 'MOTIF_MATCH' and refused['mechanism_supported'] is False
        try: firewall.assess(packet, {first['source_file_id']: raw+b'altered'})
        except ValueError: pass
        else: raise AssertionError('EM_FALSE_SOURCE_ACCEPTED')
        # A real derivative-body mutation in a temporary index must fail.
        with sqlite3.connect(db) as c: c.execute("UPDATE records SET text=text||'tampered' WHERE source_id=?", ('derivative:'+first['derivative_relative_path'],))
        try: native.verify(em, db, 'EMSTD613')
        except ValueError: pass
        else: raise AssertionError('EM_TAMPERED_INDEX_ACCEPTED')
    identity = sensitivity.qualify(works)
    assert (identity['partition_count'], identity['work_count_lower'], identity['work_count_upper']) == (256, 32, 40)
    # These flags are expressly hypothetical; original claim ledgers remain NOT_GENERATED.
    flags = {sid: False for w in works for sid in w['manifestation_source_file_ids']}
    pair = next(w for w in works if w['identity_status'] == 'SAME_WORK_SUPPORTED')
    flags.update({sid: True for sid in pair['manifestation_source_file_ids']})
    hypothetical = sensitivity.qualify(works, flags, minimum_support=2)
    assert (hypothetical['support_lower'], hypothetical['support_upper']) == (1, 2)
    assert hypothetical['threshold_classification'] == 'IDENTITY_SENSITIVE_OR_EVIDENCE_UNRESOLVED'
    methods = []
    for rel in sorted(witnesses):
        if not rel.startswith('06-INSTRUMENTS/'): continue
        body = (em/rel).read_text(encoding='utf8')
        states = [line for line in body.splitlines() if line.startswith(('Status:', 'STATUS ='))]
        methods.append({'original_method_or_investigation_id': Path(rel).stem,
            'original_source_revision': ORIGINAL, 'exact_witness': rel, **witnesses[rel],
            'native_implementation_and_version': 'Original documentary protocol, version in title',
            'classification': 'DOCUMENTARY_PROTOCOL_WITHOUT_RECOVERED_ORIGINAL_EXECUTOR',
            'original_input_output_and_provenance': 'Protocol and historical source-reading receipts; no standalone run transcript inferred',
            'reproduction_or_differential_result': 'EXACT_BYTE_READBACK_ONLY; scientific assay not resumed',
            'current_support': 'Generic source/Work readback; motif refusal guard only; no complete native instrument executor',
            'negative_controls_and_falsifiers': 'Preserved in exact original protocol; execution requires its own governed assay',
            'held_or_human_gated_state': states,
            'scientific_claim_ceiling': 'Original limitations retained; no scientific promotion',
            'required_repair': 'Recover original executor if one exists, or separately register a new protocol implementation',
            'v2_and_capsule_requirements': 'Retain exact protocol, sources, typed operator/claim jurisdiction, receipts and held states'})
    continuity = []
    for rel in sorted(witnesses):
        if rel.startswith(('04-RECEIPTS/', '05-OPERATIONS/', '06-INSTRUMENTS/', '99-ADMIN/')) or rel in ('01-MANIFESTS/registry-index.json', '01-MANIFESTS/work-index.jsonl'):
            p = em/rel
            body = p.read_text(encoding='utf8')
            continuity.append({'path': rel, **witnesses[rel], 'historical_state_preserved': True,
                'headings': [line for line in body.splitlines() if line.startswith('#')],
                'explicit_state_lines': [line for line in body.splitlines() if line.startswith(('Status:', 'STATUS ='))],
                'automatic_resume': False})
    batch = jsonl(em/'01-MANIFESTS/batch-b-2026-09-11-source-files-v2.jsonl')
    known_hashes = {w['sha256'] for w in witnesses.values()}
    missing_batch = [{'source_file_id': b['source_file_id'], 'filename': b['original_filename'], 'sha256': b['sha256'],
                      'exact_bytes_in_original_fixture': b['sha256'] in known_hashes} for b in batch]
    for rel, info in witnesses.items():
        assert sha((em/rel).read_bytes()) == info['sha256']
    return {'schema': 'td613.native-method-qualification/v1', 'estate': 'EMSTD613', 'original_revision': ORIGINAL,
        'comparator_revision': COMPARATOR, 'source_witnesses': witnesses, 'verified_git_files': len(witnesses),
        'original_source_files_verified': len(sources), 'original_source_bytes': sum(s['byte_length'] for s in sources),
        'extracted_derivatives_verified': len(extracted), 'derivative_states': dict(Counter(d['extraction_status'] for d in derivatives)),
        'original_standalone_executable_candidates': executables, 'archive_member_inventory': zip_members,
        'original_executable_methods_reexecuted': 0,
        'restored_source_side_execution': {'index': built, 'fresh_verify': verified, 'exact_readbacks_and_citations': len(extracted),
            'work_routes': len(routes), 'manifestation_joins': sum(len(r['manifestations']) for r in routes),
            'query_matches_direct_byte_search': True, 'journey_identity_state': joined['identity_sensitivity'],
            'absent_token_and_work_refused': True, 'temporary_body_mutation_refused': True, 'exact_span_firewall': refused},
        'identity_partition_count': identity['partition_count'], 'work_count_bounds': [32, 40],
        'human_gated_work_ids': [w['work_id'] for w in works if w['human_gate_required']],
        'hypothetical_occurrence_control': {'scientific_claim_data': 'NONE_HYPOTHETICAL_FLAGS_ONLY', 'partition_count': hypothetical['partition_count'],
            'support_bounds': [hypothetical['support_lower'], hypothetical['support_upper']], 'classification': hypothetical['threshold_classification']},
        'native_inheritance_matrix': methods, 'research_continuity_inventory': continuity, 'batch_b_source_custody': missing_batch,
        'unrecoverable_state': ['Unrecorded chat/runtime state', 'Unsaved source annotations', 'Original supplied Aperture HTML bytes',
            'Original semantic checkpoint and vector database', 'Batch B exact source PDFs absent from pinned fixture',
            'Historical Vixen Cybernetics executable environment; separate estate'],
        'disposition': 'ORIGINAL_CUSTODY_AND_RESTORED_READBACK_QUALIFIED; ORIGINAL_SCIENTIFIC_EXECUTION_PARTIAL_DOCUMENTARY_ONLY',
        'genuine_receiver_admission': 'UNEXECUTED', 'flights': 'HELD', 'scientific_closure': 'RESERVED', 'original_bytes_unchanged': True}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('--em-checkout', type=Path, required=True); parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args(); result = qualify(args.em_checkout)
    args.output.parent.mkdir(parents=True, exist_ok=True); args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf8')
    print(json.dumps({k: result[k] for k in ('estate', 'original_revision', 'verified_git_files', 'original_source_files_verified', 'extracted_derivatives_verified', 'identity_partition_count', 'disposition')}, indent=2))
