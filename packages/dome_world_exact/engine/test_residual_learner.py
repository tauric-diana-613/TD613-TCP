"""test_residual_learner.py -- assert-bearing gate for the T5 ResidualLearner.

Fixes the print-only gap the three Aperture gates have: every claim here is an assertion.
Covers the spec's required cases (a)-(e) plus the load-bearing guardrails:
  (a) captured input -> r == 0 and propose() is None
  (b) persistent off-axis stream -> exactly ONE growth after N ticks
  (c) after confirm() -> B grew and the novel component's residual -> 0 (exact)
  (d) model-layer only: a full cycle imports NO KIRA engine; module imports no kira*, no _IC_*
  (e) propose() is None while the calibration stub is False, flips on when True
  G2 confirm() is the ONLY mutator;  G5 witness hash-chain;  G8 exact Fraction core
  (float rejected);  G10 monic-integer seeds only;  NO_PROJECTION refusal of degenerate growth.

Ambient field: totally-real Q(sqrt2 + sqrt3), min_poly x^4 - 10x^2 + 1 (trace form pos-def).
"""
import ast
import os
import subprocess
import sys
import textwrap
from fractions import Fraction

import pytest

_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

import residual_learner as rl
from residual_learner import (
    ResidualLearner, SeedProposal, minimal_polynomial_of_coords,
    g_orthogonal_integer_vector, _g_inner,
)

F = Fraction
PHI4 = [1, 0, -10, 0, 1]          # x^4 - 10x^2 + 1 == minpoly(sqrt2 + sqrt3)
ONE = [1, 0, 0, 0]                # the element 1
THETA = [0, 1, 0, 0]              # the generator theta = sqrt2 + sqrt3


def _learner(**kw):
    return ResidualLearner(PHI4, [ONE, THETA], **kw)


def _w(learner):
    return g_orthogonal_integer_vector(learner._cols, learner._G)


def _in_span(a, b):
    return [F(a), F(b), F(0), F(0)]                 # a*1 + b*theta  in span{1, theta}


def _plus_w(w, a=1, b=0):
    return [F(a) + w[0], F(b) + w[1], F(0) + w[2], F(0) + w[3]]   # in-span + the novelty w


# (a) ----------------------------------------------------------------------- #
def test_a_captured_input_zero_residual_no_proposal():
    L = _learner(persistence_N=3)
    for (a, b) in [(2, 1), (-3, 4), (7, 0), (0, 5)]:
        L.observe(_in_span(a, b))
        st = L.state()
        assert st["last_residual_norm"] == 0          # exact capture
        assert st["captured"] is True
        assert st["streak"] == 0                       # nothing novel accumulates
        assert L.propose() is None                     # nothing to propose


# (b) ----------------------------------------------------------------------- #
def test_b_persistent_offaxis_exactly_one_growth_after_N():
    L = _learner(persistence_N=3)
    w = _w(L)
    assert w == [-5, 0, 1, 0]                          # 2*sqrt6 = theta^2 - 5, G-orthogonal to {1,theta}

    for tick in (1, 2):                                # first N-1 novelty ticks: not yet persistent
        L.observe(_plus_w(w))
        assert L.state()["streak"] == tick
        assert L.propose() is None

    L.observe(_plus_w(w))                              # Nth tick: persistence reached
    p = L.propose()
    assert isinstance(p, SeedProposal)
    assert p.coords == [-5, 0, 1, 0]
    assert p.min_poly == [1, 0, -24]                   # x^2 - 24 = minpoly(2 sqrt6)
    assert p.streak >= 3

    L.confirm(p)                                       # the single growth event
    L.observe(_plus_w(w))                              # novelty is now captured -> no further proposal
    assert L.state()["last_residual_norm"] == 0
    assert L.propose() is None


# (c) ----------------------------------------------------------------------- #
def test_c_after_confirm_basis_grows_and_residual_zero():
    L = _learner(persistence_N=3)
    w = _w(L)
    n0 = L.state()["num_seeds"]
    for _ in range(3):
        L.observe(_plus_w(w))
    L.confirm(L.propose())

    assert L.state()["num_seeds"] == n0 + 1            # B grew by exactly one exact dimension
    L.observe(_plus_w(w))
    assert L.state()["last_residual_norm"] == 0        # the novel component captured exactly
    L.observe(_plus_w(w, a=4, b=-2))                   # arbitrary in-span{1,theta,w} combo
    assert L.state()["last_residual_norm"] == 0


# (d) ----------------------------------------------------------------------- #
def test_d_model_layer_only_never_kira_never_engine():
    # behavioral (clean subprocess): a full observe/propose/confirm cycle imports NO kira engine
    code = textwrap.dedent(
        """
        import os, sys
        sys.path.insert(0, os.path.dirname(%r))
        from fractions import Fraction as F
        import residual_learner as rl
        L = rl.ResidualLearner([1,0,-10,0,1], [[1,0,0,0],[0,1,0,0]], persistence_N=3)
        w = rl.g_orthogonal_integer_vector(L._cols, L._G)
        for _ in range(3):
            L.observe([F(1)+w[0], F(0)+w[1], F(0)+w[2], F(0)+w[3]])
        L.confirm(L.propose())
        assert "kira_server_canonical" not in sys.modules, "imported the KIRA engine!"
        assert not any(m.startswith("kira") for m in sys.modules), \
            "imported a kira module: " + str([m for m in sys.modules if m.startswith("kira")])
        assert "loom" not in sys.modules, "pulled in the float display chart"
        print("CLEAN")
        """ % (rl.__file__,)
    )
    out = subprocess.run([sys.executable, "-c", code], capture_output=True, text=True)
    assert out.returncode == 0, out.stdout + out.stderr
    assert "CLEAN" in out.stdout

    # static: imports the L0 core and NOTHING from the KIRA engine; sets no engine flags
    src = open(rl.__file__, encoding="utf-8").read()
    imported = set()
    for node in ast.walk(ast.parse(src)):
        if isinstance(node, ast.Import):
            for n in node.names:
                imported.add(n.name.split(".")[0])
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imported.add(node.module.split(".")[0])
    assert {"projector", "integral_basis"} <= imported       # REUSES the shipped L0 (does not reinvent)
    assert not any(m.startswith("kira") for m in imported)    # never imports KIRA
    assert "_IC_" not in src                                  # sets no engine flags


# (e) ----------------------------------------------------------------------- #
def test_e_calibration_gate_blocks_then_allows():
    flag = {"ok": False}
    L = _learner(persistence_N=3, calibration_ok=lambda: flag["ok"])
    w = _w(L)
    for _ in range(4):
        L.observe(_plus_w(w))
    assert L.state()["streak"] >= 3
    assert L.propose() is None                         # persistent but NOT calibrated -> blocked
    flag["ok"] = True
    assert isinstance(L.propose(), SeedProposal)        # calibrated -> the same novelty now proposes


# G2 ------------------------------------------------------------------------ #
def test_g2_confirm_is_the_only_mutator():
    L = _learner(persistence_N=3)
    w = _w(L)
    n0 = L.state()["num_seeds"]
    for _ in range(5):
        L.observe(_plus_w(w))            # observe must never grow B
        L.propose()                      # propose must never grow B
    assert L.state()["num_seeds"] == n0
    p = L.propose()
    assert L.propose() == p              # pure/idempotent: same proposal, no hidden second growth
    assert L.state()["num_seeds"] == n0
    L.confirm(p)
    assert L.state()["num_seeds"] == n0 + 1   # ONLY confirm() mutates the model


# G5 ------------------------------------------------------------------------ #
def test_g5_witness_hash_chain_tamper_evident():
    L = _learner(persistence_N=3)
    w = _w(L)
    for _ in range(3):
        L.observe(_plus_w(w))
    rec = L.confirm(L.propose())
    assert L.state()["witness_len"] == 1
    assert rec["prev_hash"] == "genesis" and len(rec["hash"]) == 16
    assert L.verify_witness() is True
    L._witness[0]["coords"] = [9, 9, 9, 9]              # tamper
    assert L.verify_witness() is False


# G8 ------------------------------------------------------------------------ #
def test_g8_exact_fraction_core_floats_rejected():
    L = _learner()
    L.observe(_in_span(2, 1))
    st = L.state()
    assert isinstance(st["last_residual_norm"], Fraction)
    assert all(isinstance(c, Fraction) for c in st["last_residual"])
    assert all(isinstance(v, Fraction) for row in st["gram"] for v in row)
    assert all(isinstance(v, Fraction) for row in st["basis_gram"] for v in row)
    with pytest.raises(TypeError):
        L.observe([1.5, 0, 0, 0])                      # a float observation is refused (exact core)


# G10 ----------------------------------------------------------------------- #
def test_g10_minimal_polynomial_exact_and_monic_integer():
    assert minimal_polynomial_of_coords([0, 1, 0, 0], PHI4) == PHI4         # theta -> ambient quartic
    assert minimal_polynomial_of_coords([-5, 0, 1, 0], PHI4) == [1, 0, -24]  # 2 sqrt6 -> x^2 - 24
    assert minimal_polynomial_of_coords([3, 0, 0, 0], PHI4) == [1, -3]       # rational integer 3 -> x - 3
    # a non-integer seed coordinate is refused at the mutation point (algebraic-integer only)
    L = _learner()
    bad = SeedProposal(min_poly=[1, -1], coords=[Fraction(1, 2), 0, 0, 0],
                       centroid=[F(0)] * 4, streak=3, centroid_norm=0.0)
    with pytest.raises(ValueError):
        L.confirm(bad)


# NO_PROJECTION ------------------------------------------------------------- #
def test_confirm_refuses_degenerate_growth():
    L = _learner()
    dup = SeedProposal(min_poly=[1, -1], coords=[1, 0, 0, 0],           # == seed "1", already in span
                       centroid=[F(0)] * 4, streak=3, centroid_norm=0.0)
    with pytest.raises(ValueError):
        L.confirm(dup)                                 # dependent column -> B^T G B singular -> refused


# helper -------------------------------------------------------------------- #
def test_g_orthogonal_vector_is_genuinely_off_axis():
    L = _learner()
    w = _w(L)
    assert w is not None and any(x != 0 for x in w)
    for col in L._cols:
        assert _g_inner([F(x) for x in w], col, L._G) == 0     # G-orthogonal to every current seed
    from projector import residual_norm
    assert residual_norm([F(x) for x in w], L._P, L._G) > 0    # and NOT captured by the current basis


# ============================================================================ #
# A2.P1 -- the exact coords_to_minpoly bridge wired into propose()/confirm()
# ============================================================================ #
from coords_to_minpoly import coords_to_minpoly, regular_representation   # the A2.P0 bridge


def _matmul_p1(A, B):
    n, k, m = len(A), len(B), len(B[0])
    return [[sum(A[i][t] * B[t][j] for t in range(k)) for j in range(m)] for i in range(n)]


def _poly_eval_matrix_p1(high_low, M):
    n = len(M)
    res = [[F(0)] * n for _ in range(n)]
    for coeff in high_low:
        res = _matmul_p1(res, M)
        for r in range(n):
            res[r][r] += F(coeff)
    return res


def _is_zero_matrix(M):
    return all(M[i][j] == 0 for i in range(len(M)) for j in range(len(M[0])))


def test_p1_propose_returns_exact_bridge_minpoly_not_placeholder():
    L = _learner(persistence_N=3)
    w = _w(L)                                              # 2*sqrt6 = [-5,0,1,0], an exact algebraic integer
    for _ in range(3):
        L.observe(_plus_w(w))
    p = L.propose()
    assert p is not None
    assert p.snap == "exact"                               # the centroid IS an algebraic integer -> exact path
    # the proposed minpoly is EXACTLY the bridge result on the persistent centroid (not a rounded placeholder)
    assert p.min_poly == coords_to_minpoly(p.centroid, PHI4)
    assert p.min_poly == [1, 0, -24]                       # x^2 - 24 = minpoly(2 sqrt6)


def test_p1_proposed_minpoly_annihilates_element_and_growth_zeros_residual():
    L = _learner(persistence_N=3)
    w = _w(L)
    for _ in range(3):
        L.observe(_plus_w(w))
    p = L.propose()
    # (a) the proposed minpoly ANNIHILATES the element of the centroid: mp(M) == 0
    M = regular_representation(p.centroid, PHI4)
    assert _is_zero_matrix(_poly_eval_matrix_p1(p.min_poly, M))
    # (b) confirm grows B with the real algebraic seed; the novel component's residual -> 0 exactly
    n0 = L.state()["num_seeds"]
    L.confirm(p)
    assert L.state()["num_seeds"] == n0 + 1
    L.observe(_plus_w(w))
    assert L.state()["last_residual_norm"] == 0


def test_p1_nearest_integer_is_only_a_labeled_fallback():
    L = _learner(persistence_N=3)
    # a centroid that is NOT an algebraic integer (element 4/3 -> minpoly x - 4/3): the exact bridge
    # raises, so the seed drops to the clearly-labeled nearest-integer fallback (flagged for A2.P3).
    seed_coords, min_poly, snap = L._seed_from_centroid([F(4, 3), F(0), F(0), F(0)])
    assert snap == "nearest_integer_fallback"
    assert seed_coords == [F(1), F(0), F(0), F(0)]         # nearest-integer snap of 4/3 -> 1
    assert min_poly == [1, -1]                             # x - 1 (the rounded placeholder seed)
    # an exact algebraic-integer centroid takes the exact path (no fallback)
    _, _, snap_exact = L._seed_from_centroid([F(-5), F(0), F(1), F(0)])
    assert snap_exact == "exact"


# ============================================================================ #
# A3.P1 -- the Northcott capacity gate wired into propose() (replaces the cap)
# ============================================================================ #
from capacity import Budget as _Budget, CapacityVerdict as _CapacityVerdict


def test_p1capacity_within_budget_grows_via_capacity_path():
    L = _learner(persistence_N=3)                          # default budget admits 2sqrt6
    w = _w(L)
    for _ in range(3):
        L.observe(_plus_w(w))
    p = L.propose()
    assert isinstance(p, SeedProposal) and p.min_poly == [1, 0, -24]   # 2sqrt6 still GROWS (subsumes old)
    # the decision came from the capacity / Northcott path, not the old abs-coord cap:
    assert isinstance(L._last_verdict, _CapacityVerdict)
    assert L._last_verdict.decision == "GROW" and L._last_verdict.admissible is True
    assert (L._last_verdict.degree, L._last_verdict.coeff_height) == (2, 24)


def test_p1capacity_over_height_budget_rejected_no_growth():
    L = ResidualLearner(PHI4, [ONE, THETA], persistence_N=3,
                        budget=_Budget(degree_max=64, height_max=10))   # coeff_height(2sqrt6)=24 > 10
    w = _w(L)
    n0 = L.state()["num_seeds"]
    for _ in range(3):
        L.observe(_plus_w(w))
    assert L.propose() is None                             # REJECT: over the Northcott height budget
    assert L._last_verdict.decision == "REJECT" and L._last_verdict.admissible is False
    assert L.state()["num_seeds"] == n0                    # no growth (propose-for-confirm)


def test_p1capacity_over_degree_budget_rejected():
    L = ResidualLearner(PHI4, [ONE, THETA], persistence_N=3,
                        budget=_Budget(degree_max=1, height_max=256))   # 2sqrt6 minpoly degree 2 > 1
    w = _w(L)
    for _ in range(3):
        L.observe(_plus_w(w))
    assert L.propose() is None
    assert L._last_verdict.decision == "REJECT"


def test_p1capacity_subsumes_heuristic_default_budget():
    # the DEFAULT budget reproduces today's behavior: the current 2sqrt6 case still grows + confirms
    L = _learner(persistence_N=3)
    w = _w(L)
    for _ in range(3):
        L.observe(_plus_w(w))
    p = L.propose()
    assert p is not None
    L.confirm(p)                                           # confirm still the SOLE mutator (G2)
    assert L.state()["num_seeds"] == 3
    L.observe(_plus_w(w))
    assert L.state()["last_residual_norm"] == 0            # captured after growth (unchanged behavior)
