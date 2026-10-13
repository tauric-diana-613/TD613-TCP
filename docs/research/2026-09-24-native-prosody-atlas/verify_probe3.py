"""Offline stipulated-model oracle and selected-excerpt comparison; no model calls."""
import hashlib
import itertools
import json
from fractions import Fraction
from pathlib import Path


def replay(routes):
    state = (10, 0, 0)
    history = [state]
    for outside in routes:
        c, a, e = state
        state = (c - 2, a + 8 * (1 - outside), e + 8 * outside)
        history.append(state)
    return history


def verify():
    expected = [(10, 0, 0), (8, 8, 0), (6, 16, 0), (4, 16, 8)]
    assert replay([0, 0, 1]) == expected
    for routes in itertools.product((0, 1), repeat=3):
        history = replay(routes)
        for t, (c, a, e) in enumerate(history):
            assert c == 10 - 2 * t
            assert c + a + e == 10 + 6 * t
        for before, after, routed in zip(history, history[1:], routes):
            assert sum(after[:2]) - sum(before[:2]) == 6 - 8 * routed
    assert replay([0, 0, 0])[-1][1] == 24
    assert replay([0, 0, 0, 0])[-1][1] == 32  # algebraic extension only
    assert 24 - 16 == 8
    assert (24 - 0) - (24 - 16) == 16
    assert [16 + 3 * k for k in (1, 2, 3)] == [19, 22, 25]
    c, a, e = expected[-1]
    drained = (c, a - 16, e + 16)  # explicitly added operation
    assert drained == (4, 0, 24) and sum(drained) == 28
    duty = Fraction(2, 3)  # explicitly added ideal linear control law
    assert 4 - 6 * duty == 0
    assert 8 * duty == Fraction(16, 3)
    excerpts = json.loads(Path(__file__).with_name('probe3-observations.json').read_text())['unicode_excerpts']
    old, new = excerpts['earlier_flash_eight_receipts_laugh'], excerpts['probe3_laugh']
    assert old == new
    return {
        'status': 'PASS',
        'scope': 'Offline mathematical oracle and manually transcribed selected excerpts; not a model test',
        'three_cycle_states_C_A_exterior': expected,
        'binary_routing_schedules_checked': 8,
        'excess_apparent_capacity_after_false_zero': 16,
        'subsequent_verified_drain_state': drained,
        'new_ideal_duty_factor': str(duty),
        'new_ideal_duty_exhaust': str(8 * duty),
        'selected_laughs_equal': True,
        'selected_laugh_unicode_scalars': len(new),
        'selected_laugh_sha256': hashlib.sha256(new.encode()).hexdigest(),
        'full_transcript_authenticated': False,
        'provider_calls': 0
    }


if __name__ == '__main__':
    print(json.dumps(verify(), indent=2))
