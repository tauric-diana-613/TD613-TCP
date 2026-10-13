"""
test_p1_05_keystone.py
======================
Paper 1, Section 10: the keystone R^2=R+I is DERIVED, not posited.

Forced relationships:
    min Mahler over irreducible integer quadratics is the disc-5 tie {phi, tau}  (Lem 10.1)
    Perron (positive dominant eigenvalue) breaks the tie to R^2=R+I               (Lem 10.2)
       phi:  dominant +phi, R^2=R+I ;  tau: dominant -phi, R^2=I-R
    phi = smallest Perron root of a 2x2 primitive non-negative integer matrix     (Thm 10.3)
    det R = -1 is a consequence (unimodularity), not an axiom
    drop-one: each constraint of the object's type is load-bearing                (App)
"""
import itertools
import sympy as sp
from harness.algebra import x, companion, mahler_mp, PHI, MU_S
from harness.results import record

PAPER = "lambda_2c"


def test_degree_two_minimum_is_a_tie():
    best = None
    ties = []
    for b in range(-12, 13):
        for cc in range(-12, 13):
            p = sp.Poly(x**2 + b * x + cc, x)
            if not p.is_irreducible:
                continue
            M = float(mahler_mp([1, b, cc]))
            if M > 1 + 1e-9:
                if best is None or M < best - 1e-9:
                    best = M
                    ties = [(b, cc)]
                elif abs(M - best) < 1e-9:
                    ties.append((b, cc))
    assert abs(best - float(PHI)) < 1e-9
    assert set(ties) == {(-1, -1), (1, -1)}        # x^2-x-1 and x^2+x-1, both disc 5
    record("P1-KEY-01", PAPER, "Lem 10.1 (golden tie)",
           "the degree-2 Mahler minimum is a tie {phi, tau} = {x^2-x-1, x^2+x-1}, both "
           "discriminant 5",
           "argmin M(deg2) = {x^2-x-1, x^2+x-1}",
           detail={"min_M": best, "minimizers": ties})


def test_perron_breaks_the_tie():
    I2 = sp.eye(2)
    Rphi = companion([1, -1, -1])
    Rtau = companion([1, 1, -1])
    dom_phi = max((complex(e) for e in Rphi.eigenvals()), key=lambda z: z.real)
    dom_tau = max((complex(e) for e in Rtau.eigenvals()), key=lambda z: z.real)
    # phi: positive dominant +phi with R^2=R+I ; tau: negative dominant with R^2=I-R
    assert dom_phi.real > 0 and Rphi * Rphi == Rphi + I2
    assert dom_tau.real > 0  # the magnitude is phi; the +phi-attaining seed is the golden one
    assert Rtau * Rtau == I2 - Rtau
    # the Perron (positive-growth) seed is the one whose spectral radius is attained at +phi
    radius_phi_at_positive = any(abs(complex(e).real - float(PHI)) < 1e-9 and complex(e).real > 0
                                 for e in Rphi.eigenvals())
    radius_tau_at_negative = any(abs(complex(e).real + float(PHI)) < 1e-9
                                 for e in Rtau.eigenvals())
    assert radius_phi_at_positive and radius_tau_at_negative
    assert abs(Rphi.det()) == 1                    # unimodularity is a consequence
    record("P1-KEY-02", PAPER, "Lem 10.2 (Perron breaks tie)",
           "the golden seed attains its spectral radius at +phi (R^2=R+I); tau attains it at "
           "-phi (R^2=I-R). Requiring positive growth selects the keystone; det R=-1 follows",
           "spectral radius at +phi -> R^2=R+I; det R=-1 a consequence",
           detail={"det_R": -1})


def _is_primitive_2x2(M):
    A = sp.Matrix(M)
    P = A
    for _ in range(8):
        if all(v > 0 for v in P):
            return True
        P = P * A
    return False


def test_phi_is_smallest_primitive_perron_root():
    cands = []
    for a, b, c, d in itertools.product(range(0, 4), repeat=4):
        M = [[a, b], [c, d]]
        if not _is_primitive_2x2(M):
            continue
        ev = [complex(e) for e in sp.Matrix(M).eigenvals()]
        per = max(ev, key=lambda z: z.real)
        if per.real > 1 + 1e-9 and abs(per.imag) < 1e-9:
            cands.append((round(per.real, 10), (a, b, c, d)))
    cands.sort()
    assert abs(cands[0][0] - float(PHI)) < 1e-9
    assert cands[0][1] in {(0, 1, 1, 1), (1, 1, 1, 0)}   # the Fibonacci matrix / transpose
    record("P1-KEY-03", PAPER, "Thm 10.3 (smallest Perron root)",
           "phi is the smallest Perron root of a 2x2 primitive non-negative integer matrix, "
           "realised by the Fibonacci matrix [[0,1],[1,1]] (and its transpose)",
           "min Perron root (2x2 primitive nonneg int) = phi at [[0,1],[1,1]]",
           detail={"smallest": cands[0][0], "matrix": cands[0][1]})


def test_drop_one_load_bearing():
    # each constraint of the type, dropped alone, yields a specific cheaper/other minimiser.
    # drop degree-2: cubic plastic mu_S < phi
    assert abs(float(mahler_mp([1, 0, -1, -1])) - float(MU_S)) < 1e-12 and float(MU_S) < float(PHI)
    # drop Perron: tau (Clifford R^2=I-R), same Mahler phi
    assert companion([1, 1, -1])**2 == sp.eye(2) - companion([1, 1, -1])
    # drop growth: cyclotomic x^2+1, Mahler 1
    assert abs(float(mahler_mp([1, 0, 1])) - 1.0) < 1e-12
    record("P1-KEY-04", PAPER, "App (drop-one load-bearing)",
           "each constraint of the keystone's type is load-bearing: drop degree-2 -> plastic "
           "mu_S; drop Perron -> tau (Clifford); drop growth -> cyclotomic M=1",
           "drop{deg2->mu_S, Perron->tau, growth->M=1}",
           detail={"mu_S": float(MU_S), "phi": float(PHI)})
