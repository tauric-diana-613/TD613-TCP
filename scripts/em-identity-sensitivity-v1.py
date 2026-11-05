#!/usr/bin/env python3
"""New finite sensitivity instrument derived from Em's original identity rule.

This enumerates permitted identity hypotheses. It never resolves a human gate,
extracts claims, supplies missing evidence, or authenticates scientific lineage.
"""
import itertools
from fractions import Fraction


def partitions(works):
    fixed, uncertain, source_ids, work_ids = [], [], set(), set()
    for work in works:
        wid = work.get('work_id')
        members = work.get('manifestation_source_file_ids')
        if not isinstance(wid, str) or wid in work_ids:
            raise ValueError('EM_UNIQUE_WORK_ID_REQUIRED')
        work_ids.add(wid)
        if not isinstance(members, list) or not members or any(not isinstance(x, str) for x in members):
            raise ValueError('EM_MANIFESTATION_ID_REQUIRED')
        if len(set(members)) != len(members) or source_ids.intersection(members):
            raise ValueError('EM_MANIFESTATION_PARTITION_OVERLAP')
        source_ids.update(members)
        status = work.get('identity_status')
        if status == 'SAME_WORK_SUPPORTED':
            if work.get('human_gate_required') is not True or len(members) != 2:
                raise ValueError('EM_SUPPORTED_PAIR_HUMAN_GATE_REQUIRED')
            if work.get('minimum_independent_work_contribution') != 1 or work.get('maximum_independent_work_contribution') != 2:
                raise ValueError('EM_SUPPORTED_PAIR_INTERVAL_REQUIRED')
            uncertain.append((wid, tuple(members)))
        elif status in ('SAME_WORK_CONFIRMED', 'SINGLETON_WORK_SURFACE'):
            if work.get('human_gate_required') is not False:
                raise ValueError('EM_FIXED_WORK_GATE_CONFLICT')
            if status == 'SINGLETON_WORK_SURFACE' and len(members) != 1:
                raise ValueError('EM_SINGLETON_CARDINALITY')
            fixed.append(tuple(members))
        else:
            raise ValueError('EM_UNSUPPORTED_IDENTITY_STATUS')
    if len(uncertain) > 16:
        raise ValueError('EM_BOUNDED_SENSITIVITY_REQUIRED')
    for choices in itertools.product((False, True), repeat=len(uncertain)):
        groups = list(fixed)
        for (_, members), split in zip(uncertain, choices):
            groups.extend([(member,) for member in members] if split else [members])
        yield {'split_work_ids': [wid for (wid, _), split in zip(uncertain, choices) if split],
               'groups': groups}


def qualify(works, occurrence=None, *, minimum_support=None):
    """Count Work units containing a witnessed manifestation occurrence.

    Occurrence values: True, False, None (explicit UNKNOWN), WITHHELD; an absent
    key remains ABSENT. A positive group means at least one positive member;
    it does not copy that claim to its other manifestations.
    """
    if minimum_support is not None and (type(minimum_support) is not int or minimum_support < 1):
        raise ValueError('EM_POSITIVE_INTEGER_THRESHOLD_REQUIRED')
    ids = {sid for work in works for sid in work.get('manifestation_source_file_ids', [])}
    occurrence = {} if occurrence is None else dict(occurrence)
    if set(occurrence) - ids:
        raise ValueError('EM_OCCURRENCE_SOURCE_OUTSIDE_PARTITION')
    if any(type(v) is not bool and v is not None and v != 'WITHHELD' for v in occurrence.values()):
        raise ValueError('EM_TYPED_OCCURRENCE_REQUIRED')
    states = {sid: ('ABSENT' if sid not in occurrence else
                    'UNKNOWN' if occurrence[sid] is None else
                    'WITHHELD' if occurrence[sid] == 'WITHHELD' else
                    'PRESENT' if occurrence[sid] else 'EXPLICIT_NEGATIVE') for sid in sorted(ids)}
    outcomes = []
    for partition in partitions(works):
        lower = upper = 0
        for group in partition['groups']:
            values = [states[sid] for sid in group]
            lower += int('PRESENT' in values)
            upper += int(any(v != 'EXPLICIT_NEGATIVE' for v in values))
        n = len(partition['groups'])
        outcomes.append({'split_work_ids': partition['split_work_ids'], 'work_count': n,
                         'support_lower': lower, 'support_upper': upper,
                         'fraction_lower': str(Fraction(lower, n)),
                         'fraction_upper': str(Fraction(upper, n))})
    if not outcomes:
        raise ValueError('EM_WORKS_REQUIRED')
    lower, upper = min(x['support_lower'] for x in outcomes), max(x['support_upper'] for x in outcomes)
    classification = 'NO_THRESHOLD_REQUESTED'
    if minimum_support is not None:
        classification = ('ROBUSTLY_AT_LEAST_THRESHOLD' if lower >= minimum_support else
                          'ROBUSTLY_BELOW_THRESHOLD' if upper < minimum_support else
                          'IDENTITY_SENSITIVE_OR_EVIDENCE_UNRESOLVED')
    return {'schema': 'td613.em.identity-sensitivity/v1', 'implementation': 'NEW_PROTOCOL_DERIVATION',
            'partition_count': len(outcomes), 'work_count_lower': min(x['work_count'] for x in outcomes),
            'work_count_upper': max(x['work_count'] for x in outcomes),
            'occurrence_states': states, 'support_lower': lower, 'support_upper': upper,
            'threshold_classification': classification, 'outcomes': outcomes,
            'claim_equivalence_inferred': False, 'human_gates_resolved': False,
            'scientific_classification_promoted': False}
