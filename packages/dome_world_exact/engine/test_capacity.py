"""test_capacity.py -- assert-bearing gate for A3.P0 (exact height/capacity primitives).

The capacity gate decides on EXACT integers only (degree + coeff-height); the float Mahler is
display-only and never crosses the admit boundary. Landau (M(p) <= ||p||_2) lets the exact integer
landau_bound_sq = sum c_i^2 certify M^2 <= landau_bound_sq. Northcott (bounded degree + height ->
finitely many algebraic integers) makes the admissible set finite.
"""
import ast
import os
import subprocess
import sys
import textwrap

import pytest

_HERE = os.path.dirname(os.path.abspath(__file__))
_ROOT = os.path.dirname(_HERE)
for _p in (_HERE, _ROOT):
    if _p not in sys.path:
        sys.path.insert(0, _p)

import capacity as cap
from capacity import (
    degree, coeff_height, landau_bound_sq, certified_mahler_le, mahler_float,
    Budget, is_admissible, height_certificate, capacity_decision, CapacityVerdict,
)

PHI = [1, -1, -1]        # deg 2, coeff_height 1,  landau 3,   M = phi   = 1.618034
SQRT6 = [1, 0, -24]      # deg 2, coeff_height 24, landau 577, M = 24
SQRT7 = [1, 0, -7]       # deg 2, coeff_height 7,  landau 50,  M = 7
GAP = [1, -7, 1]         # deg 2, coeff_height 7,  landau 51,  M = phi^4 = 6.854102


# -- exact heights on known seeds (integers only) --------------------------- #
def test_exact_heights_on_known_seeds():
    assert (degree(PHI), coeff_height(PHI), landau_bound_sq(PHI)) == (2, 1, 3)
    assert (degree(SQRT6), coeff_height(SQRT6), landau_bound_sq(SQRT6)) == (2, 24, 577)
    assert (degree(SQRT7), coeff_height(SQRT7), landau_bound_sq(SQRT7)) == (2, 7, 50)
    assert (degree(GAP), coeff_height(GAP), landau_bound_sq(GAP)) == (2, 7, 51)
    for mp in (PHI, SQRT6, SQRT7, GAP):                     # all exact ints
        assert all(isinstance(v, int) for v in (degree(mp), coeff_height(mp), landau_bound_sq(mp)))


# -- Landau certifies M^2 <= landau_bound_sq (gate uses the EXACT bound) ------ #
def test_landau_certifies_mahler_cross_checked_vs_float():
    for mp in (PHI, SQRT6, SQRT7, GAP):
        m = mahler_float(mp)                               # float, DISPLAY only
        assert m * m <= landau_bound_sq(mp)                # Landau: M^2 <= ||m||_2^2 (exact bound holds)
    # the certified test is EXACT (integer compare) and CONSERVATIVE (sufficient, not necessary):
    assert certified_mahler_le(SQRT7, 8) is True           # landau 50 <= 64 -> certifies M <= 8 (M = 7)
    assert certified_mahler_le(SQRT7, 7) is False           # landau 50 <= 49 false -> cannot certify, even though M = 7 exactly
    # ... and the float Mahler is SMEARED (7.000000000000001 != 7) -- exactly why the gate must be exact,
    # not float: a naive float test "M <= 7" would wrongly FAIL here on rounding noise.
    assert abs(mahler_float(SQRT7) - 7.0) < 1e-9
    assert mahler_float(SQRT7) > 7.0                         # the smear is above 7 -- a float gate would mis-reject


# -- within-budget admissible / over-budget not -------------------------------- #
def test_within_and_over_budget():
    assert is_admissible(PHI, Budget(degree_max=4, height_max=10)) is True
    assert is_admissible(SQRT6, Budget(degree_max=4, height_max=30)) is True
    # over HEIGHT: 2sqrt6 has coeff_height 24
    assert is_admissible(SQRT6, Budget(degree_max=4, height_max=10)) is False
    # over DEGREE: a quartic under a degree-2 budget
    quartic = [1, 0, -10, 0, 1]                            # x^4 - 10x^2 + 1
    assert is_admissible(quartic, Budget(degree_max=2, height_max=100)) is False
    assert is_admissible(quartic, Budget(degree_max=4, height_max=100)) is True


# -- a float input is rejected AT THE GATE (never crosses, G8) ---------------- #
def test_float_input_rejected_at_gate():
    b = Budget(degree_max=4, height_max=10)
    with pytest.raises(TypeError):
        is_admissible([1.5, 0, -7], b)                     # non-integer float
    with pytest.raises(TypeError):
        is_admissible([1.0, 0, -7], b)                     # integer-VALUED float still rejected (strict G8)
    for fn in (degree, coeff_height, landau_bound_sq):
        with pytest.raises(TypeError):
            fn([1.0, 0, -7])
    with pytest.raises(TypeError):
        certified_mahler_le(SQRT7, 8.0)                    # float budget rejected too


# -- the gate decides on the EXACT bound, NOT the float Mahler --------------- #
def test_gate_uses_exact_not_float_mahler():
    # SQRT7 (M = 7) and GAP (M = 6.854) have the SAME exact coeff_height (7) but DIFFERENT float Mahler;
    # the gate decision depends only on the exact height, so it is identical for both:
    assert mahler_float(SQRT7) != mahler_float(GAP)
    for b in (Budget(2, 7), Budget(2, 6), Budget(2, 100)):
        assert is_admissible(SQRT7, b) == is_admissible(GAP, b)


# -- Northcott finiteness: the admissible set at a fixed budget is finite ----- #
def test_northcott_finiteness_admissible_set_is_finite():
    D_max, H_max = 2, 1
    b = Budget(degree_max=D_max, height_max=H_max)
    admissible = []
    for d in range(1, D_max + 1):                          # enumerate monic-integer polys, |coeff| <= H_max
        def rec(prefix):
            if len(prefix) == d:
                mp = [1] + prefix
                if is_admissible(mp, b):
                    admissible.append(tuple(mp))
                return
            for c in range(-H_max, H_max + 1):
                rec(prefix + [c])
        rec([])
    expected = sum((2 * H_max + 1) ** d for d in range(1, D_max + 1))   # Northcott count = 3 + 9 = 12
    assert len(admissible) == expected == 12
    # and the boundary holds: a coefficient one past the budget is NOT admissible
    assert is_admissible([1, H_max + 1], b) is False


# -- model-layer only: the GATE path pulls no numpy/loom; no KIRA ------------- #
def test_model_layer_only_gate_path_clean():
    code = textwrap.dedent(
        """
        import os, sys
        sys.path.insert(0, os.path.dirname(%r))
        import capacity as cap
        b = cap.Budget(degree_max=4, height_max=10)
        assert cap.is_admissible([1, -1, -1], b) is True
        assert cap.coeff_height([1, 0, -24]) == 24 and cap.landau_bound_sq([1, 0, -7]) == 50
        # the GATE path must NOT pull the float-root machinery
        assert "numpy" not in sys.modules and "loom" not in sys.modules
        assert "kira_server_canonical" not in sys.modules
        assert not any(m.startswith("kira") for m in sys.modules)
        print("CLEAN")
        """ % (cap.__file__,)
    )
    out = subprocess.run([sys.executable, "-c", code], capture_output=True, text=True)
    assert out.returncode == 0, out.stdout + out.stderr
    assert "CLEAN" in out.stdout

    imported = set()
    for node in ast.walk(ast.parse(open(cap.__file__, encoding="utf-8").read())):
        if isinstance(node, ast.Import):
            for n in node.names:
                imported.add(n.name.split(".")[0])
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imported.add(node.module.split(".")[0])
    assert "integral_basis" in imported                    # reuses the L0 G10 guard
    assert "numpy" not in imported
    assert not any(m.startswith("kira") for m in imported)


# -- A3.P1: the derived GROW / STOP / REJECT decision ------------------------ #
def test_capacity_decision_grow_stop_reject():
    from fractions import Fraction as Fr
    b = Budget(degree_max=4, height_max=30)
    g = capacity_decision(SQRT6, Fr(96), b)                # real defect + admissible (deg 2, coeff_h 24<=30)
    assert isinstance(g, CapacityVerdict)
    assert g.decision == "GROW" and g.admissible is True and (g.degree, g.coeff_height) == (2, 24)
    assert capacity_decision(SQRT6, Fr(96), Budget(4, 10)).decision == "REJECT"      # over HEIGHT
    assert capacity_decision([1, 0, -10, 0, 1], Fr(96), Budget(2, 100)).decision == "REJECT"  # over DEGREE
    assert capacity_decision(SQRT6, Fr(0), b).decision == "STOP"                     # defect at/below floor
    with pytest.raises(TypeError):
        capacity_decision(SQRT6, 96.0, b)                  # float defect rejected (G8)
    with pytest.raises(TypeError):
        capacity_decision(SQRT6, Fr(96), b, floor=0.5)     # float floor rejected (G8)


def test_capacity_decision_effective_degree_for_compositum():
    from fractions import Fraction as Fr
    # the generator sqrt7 has minpoly degree 2, but a compositum makes the ACTUAL degree 8; effective_degree
    # lets the SAME gate decide on the compositum degree (disjointness-independent -- P2c reuses it):
    assert capacity_decision(SQRT7, Fr(56), Budget(4, 100), effective_degree=8).decision == "REJECT"
    assert capacity_decision(SQRT7, Fr(56), Budget(8, 100), effective_degree=8).decision == "GROW"
