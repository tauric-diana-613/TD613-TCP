"""
test_p2_06_circulant_cartan.py
==============================
Paper 2, Section 7: entry-level operators cannot emit Salem numbers either.

Forced relationships:
    circulant: a circulant's field is abelian (cyclotomic), hence totally real or
       CM; the Salem signature (2, m-1) is neither, so no circulant is Salem      (Prop 7.1)
    Cartan: A_n/D_n/E8 Cartan eigenvalues are 2 - 2cos(.) in [0,4], totally real;
       (+) is multiplicative on them                                              (Prop 7.3)
    generic commutator: a commutator is traceless; a Salem quartic has nonzero
       trace, and a traceless reciprocal quartic x^4+bx^2+1 has a symmetric
       trace-down t^2+(b-2) that cannot straddle -- so no free deg-4 Salem        (Prop 7.4)
"""
import random
import sympy as sp
from harness.algebra import x, t, companion, trace_down, flip_straddle, is_salem, mahler_mp
from harness.results import record

PAPER = "emission_gap"


def _circulant(row):
    n = len(row)
    return sp.Matrix([[row[(j - i) % n] for j in range(n)] for i in range(n)])


def _cartan_A(n):
    M = sp.zeros(n)
    for i in range(n):
        M[i, i] = 2
    for i in range(n - 1):
        M[i, i + 1] = -1
        M[i + 1, i] = -1
    return M


def test_circulants_emit_no_salem():
    random.seed(1729)
    checked = 0
    for _ in range(40):
        n = random.choice([4, 5, 6])
        row = [random.randint(-2, 2) for _ in range(n)]
        C = _circulant(row)
        coeffs = [int(v) for v in sp.Poly(C.charpoly(x).as_expr(), x).all_coeffs()]
        assert not is_salem(coeffs)            # abelian field is never Salem-signature
        checked += 1
    record("P2-CIRC-01", PAPER, "Prop 7.1 (no Salem circulant)",
           "a circulant matrix has an abelian (cyclotomic) eigenvalue field, hence totally "
           "real or CM; the Salem signature (2,m-1) is neither, so no integer circulant emits "
           "a Salem number (40 random circulants checked)",
           "circulant field abelian => not Salem signature => no Salem",
           detail={"circulants_checked": checked})


def test_cartan_eigenvalues_totally_real_in_band():
    rows = []
    for n in range(2, 6):
        A = _cartan_A(n)
        coeffs = [int(v) for v in sp.Poly(A.charpoly(x).as_expr(), x).all_coeffs()]
        p = sp.Poly(coeffs, x)
        assert p.count_roots(-sp.oo, sp.oo) == n      # totally real (n real roots)
        eig = [complex(e).real for e in A.eigenvals()]
        assert all(-1e-9 <= e <= 4 + 1e-9 for e in eig)   # eigenvalues in [0,4]
        rows.append({"A_n": n, "real_roots": n})
    record("P2-CART-01", PAPER, "Prop 7.3 (Cartan totally real)",
           "the Cartan matrices A_n have eigenvalues 2-2cos(k pi/(n+1)) in [0,4], all real, so "
           "their fields are totally real and emit no Salem; (+) acts multiplicatively",
           "spec(Cartan A_n) = {2-2cos(k pi/(n+1))} subset [0,4], totally real",
           detail={"cartan": rows})


def test_generic_commutator_no_deg4_salem():
    # a Salem quartic is reciprocal x^4-ax^3+bx^2-ax+1 with trace a != 0 (beta4 has a=1).
    b4 = [1, -1, -1, -1, 1]
    assert sp.Rational(-b4[1], b4[0]) != 0          # trace of beta4 companion is 1 != 0
    assert is_salem(b4)
    # a commutator is traceless: the reciprocal quartic becomes x^4 + b x^2 + 1, whose
    # trace-down is t^2 + (b-2) with symmetric roots -> cannot straddle t=2.
    for b in range(-6, 7):
        coeffs = [1, 0, b, 0, 1]
        T = trace_down(coeffs)
        assert sp.expand(T.as_expr() - (t**2 + (b - 2))) == 0   # symmetric trace-down
        straddle, _ = flip_straddle(coeffs)
        assert not straddle                          # never a Salem straddle
    record("P2-COMM-01", PAPER, "Prop 7.4 (generic commutator)",
           "a Salem quartic has nonzero trace, but a commutator is traceless; the traceless "
           "reciprocal quartic x^4+bx^2+1 has the symmetric trace-down t^2+(b-2), which cannot "
           "straddle t=2, so a free commutator reaches no degree-4 Salem",
           "trace([X,Y])=0; trace-down of x^4+bx^2+1 = t^2+(b-2) symmetric => no straddle",
           detail={"beta4_trace": 1, "traceless_tracedown": "t^2+(b-2)"})
