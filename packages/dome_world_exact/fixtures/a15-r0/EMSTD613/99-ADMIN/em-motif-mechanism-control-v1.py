#!/usr/bin/env python3
"""Executable refusal/control instrument derived from Em's native firewall.

This checks an evidence packet; it does not annotate mechanisms or supply the
scientific judgment that the original documentary protocol reserves to humans.
"""
import hashlib

def assess(packet,source_bytes):
    required=('source_id','sha256','byte_offset','length_utf8','span_sha256')
    spans=packet.get('spans')
    if not isinstance(spans,list) or not spans:raise ValueError('EM_EXACT_SOURCE_SPANS_REQUIRED')
    for span in spans:
        if any(k not in span for k in required):raise ValueError('EM_SPAN_LOCATOR_INCOMPLETE')
        raw=source_bytes.get(span['source_id'])
        if not isinstance(raw,bytes) or hashlib.sha256(raw).hexdigest()!=span['sha256']:raise ValueError('EM_SOURCE_ANATOMY_DIGEST_MISMATCH')
        at=span['byte_offset'];length=span['length_utf8']
        if type(at) is not int or at<0 or type(length) is not int or length<1 or at+length>len(raw):raise ValueError('EM_SOURCE_SPAN_BOUNDS')
        raw[:at].decode('utf8');piece=raw[at:at+length];piece.decode('utf8')
        if hashlib.sha256(piece).hexdigest()!=span['span_sha256']:raise ValueError('EM_EXACT_SPAN_DIGEST_MISMATCH')
    missing=[]
    mapping=packet.get('structural_mapping')
    if not isinstance(mapping,dict) or any(not mapping.get(k) for k in ['entities','operators','boundary_conditions','predicted_consequences']):missing.append('SOURCE_SENSITIVE_STRUCTURAL_MAPPING')
    if not packet.get('field_generic_alternatives'):missing.append('FIELD_GENERIC_OR_HOSTILE_ALTERNATIVES')
    if not packet.get('non_metaphorical_mechanism'):missing.append('MECHANISM_WITHOUT_MOTIF_VOCABULARY')
    if not packet.get('discriminating_observation'):missing.append('DISCRIMINATING_OBSERVATION')
    if not packet.get('work_identity_sensitivity'):missing.append('SUPPORTED_WORK_COLLAPSE_SPLIT_SENSITIVITY')
    return {'schema':'td613.em.motif-mechanism-control/v1','classification':'MOTIF_MATCH' if 'SOURCE_SENSITIVE_STRUCTURAL_MAPPING' in missing else 'STRUCTURAL_ANALOGY_CANDIDATE','missing_for_mechanism_review':missing,'mechanism_supported':False,'automatic_promotion':False,'hostile_control_status':'RECORDED_FOR_HUMAN_TEST' if packet.get('field_generic_alternatives') else 'MISSING','human_adjudication_required':True,'native_protocol':'06-INSTRUMENTS/MOTIF_TO_MECHANISM_TRANSLATION.md'}
