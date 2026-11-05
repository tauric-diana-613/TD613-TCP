#!/usr/bin/env python3
"""New executable transcription of the historical TD613-side finite fixture.

Original witness: Wendbine PRCS-A ordering scab v0.4. This synthetic result
describes the declared operators only, without attributing a source pipeline.
"""
from collections import defaultdict
from itertools import permutations


def trace(order, value):
    payload, released, label = value, None, None
    history = []
    if sorted(order) != sorted('KPAN'):
        raise ValueError('EXACT_FOUR_STAGE_PERMUTATION_REQUIRED')
    for stage in order:
        if stage == 'K': payload = min(payload, 2)
        elif stage == 'P': payload %= 2
        elif stage == 'A':
            released = payload == 1
            if not released: payload = 0
        else:
            label = ('ALLOW' if released else 'HOLD') if released is not None else ('ODD' if payload % 2 else 'EVEN')
        history.append((payload, released, label))
    return history


def reproduce():
    classes = defaultdict(list)
    for order in permutations('KPAN'):
        signature = tuple(trace(order, x)[-1] for x in range(6))
        classes[signature].append(''.join(order))
    canonical = tuple(trace('KPAN', x)[-1] for x in range(6))
    # Explicit implementation of the documented disjoint-field commuting control.
    control = set()
    for order in permutations('KPAN'):
        fields = {}
        for stage in order: fields[stage] = stage
        control.add(tuple(sorted(fields.items())))
    return {'schema': 'td613.wendbine-derived.ordering-sensitivity/v1',
            'implementation': 'NEW_TRANSCRIPTION_OF_TD613_SIDE_DOCUMENTED_SYNTHETIC_FIXTURE',
            'inputs': list(range(6)), 'permutations': 24, 'terminal_signature_classes': len(classes),
            'canonical_equivalence_class_size': len(classes[canonical]),
            'canonical_class': sorted(classes[canonical]),
            'selected_pair_terminal_equal': all(trace('KPAN', x)[-1] == trace('AKPN', x)[-1] for x in range(6)),
            'selected_pair_first_stage_input_3': {'KPAN': trace('KPAN', 3)[0], 'AKPN': trace('AKPN', 3)[0]},
            'commuting_control_signature_classes': len(control), 'external_system_claim': False,
            'native_public_poster_method': False, 'novelty_promoted': False}
