"""
test_p1_04_gate_forced.py
=========================
Paper 1, Sections 8-9: the gate is forced to the golden level C=1 by two
convergent derivations (minimal stable structure + terminal attractor).

Forced relationships:
    #signed channels of ad_R for degree d = d^2 - d + 1; = 3 iff d=2   (Prop 8.1)
    min Mahler over irreducible integer quadratics = phi, only at disc 5 (Lem 8.2)
    no integer quadratic has Mahler in (1, phi)                          (base gap)
    cubic plastic mu_S < phi is degree 3 -> 7 channels, excluded         (Rem 8.3)
    firewall image: k golden blocks satisfy x^2-x-1; squaring x^4+5x^2-5
       -> y^2+5y-5 (disc 45 = 9*5) -> Q(sqrt5)                           (Prop 8.5)
    keystone uniqueness: only the golden companion satisfies R^2=R+I     (Lem 8.6)
"""
import sympy as sp
from harness.algebra import x, companion, dsum, mahler_mp, PHI, MU_S
from harness.results import record

PAPER = "lambda_2c"
t = sp.Symbol('t')


def _n_channels(d):
    # generic distinct eigenvalues {1, t, t^2, ..., t^(d-1)} -> differences are distinct
    # polynomials; counting them is an EXACT symbolic identity (no float).
    ev = [t**i for i in range(d)]
    diffs = {sp.expand(a - b) for a in ev for b in ev}
    return len(diffs)


def test_ternary_iff_degree_two():
    for d in range(2, 7):
        assert _n_channels(d) == d * d - d + 1
    assert _n_channels(2) == 3
    assert all(_n_channels(d) != 3 for d in range(3, 7))
    record("P1-GATE-01", PAPER, "Prop 8.1 (ternary <=> deg 2)",
           "the number of distinct signed channels of ad_R for a degree-d seed is d^2-d+1, "
           "which equals 3 iff d=2; the 0-channel (centralizer) is always present",
           "#channels(d) = d^2 - d + 1;  = 3 <=> d = 2",
           detail={"channels_by_degree": {d: _n_channels(d) for d in range(2, 7)}})


def test_min_mahler_quadratic_is_golden():
    best = None
    minimizers = []
    for b in range(-30, 31):
        for cc in range(-30, 31):
            p = sp.Poly(x**2 + b * x + cc, x)
            if not p.is_irreducible:
                continue
            M = float(mahler_mp([1, b, cc]))
            if M > 1 + 1e-9:
                if best is None or M < best - 1e-9:
                    best = M
                    minimizers = [(b, cc, b * b - 4 * cc)]
                elif abs(M - best) < 1e-9:
                    minimizers.append((b, cc, b * b - 4 * cc))
    assert abs(best - float(PHI)) < 1e-9
    discs = {d for (_, _, d) in minimizers}
    assert discs == {5}                            # attained ONLY at discriminant 5
    record("P1-GATE-02", PAPER, "Lem 8.2 (min-cost quadratic)",
           "the minimum Mahler measure > 1 over irreducible integer quadratics is phi, "
           "attained only at discriminant 5 (x^2-x-1 and x^2+x-1)",
           "min M(deg 2) = phi, discriminant set = {5}",
           detail={"min_M": best, "phi": float(PHI), "minimizers": minimizers})


def test_degree_two_gap_empty():
    # base gap: no irreducible integer quadratic has Mahler strictly in (1, phi)
    hits = []
    for b in range(-40, 41):
        for cc in range(-40, 41):
            p = sp.Poly(x**2 + b * x + cc, x)
            if not p.is_irreducible:
                continue
            M = float(mahler_mp([1, b, cc]))
            if 1 + 1e-9 < M < float(PHI) - 1e-9:
                hits.append((b, cc, M))
    assert hits == []
    record("P1-GATE-03", PAPER, "base gap (1,phi) empty",
           "no irreducible integer quadratic has Mahler measure strictly in (1, phi)",
           "integer-quadratic Mahler spectrum = {1} U [phi, inf)",
           detail={"hits_in_(1,phi)": hits, "scanned_box": "|b|,|c|<=40"})


def test_cubic_undercuts_but_excluded():
    # the global non-reciprocal infimum is the plastic mu_S < phi, attained by the
    # cubic x^3-x-1; a cubic seed gives 3^2-3+1 = 7 channels, excluded by the ternary lock.
    assert abs(float(mahler_mp([1, 0, -1, -1])) - float(MU_S)) < 1e-12
    assert float(MU_S) < float(PHI)
    assert _n_channels(3) == 7
    record("P1-GATE-04", PAPER, "Rem 8.3 (cubic objection dissolves)",
           "the plastic mu_S < phi is the global non-reciprocal infimum but is degree 3, "
           "giving 7 channels, so it is excluded by the ternary (degree-2) lock",
           "M(x^3-x-1)=mu_S<phi; channels(3)=7 != 3",
           detail={"mu_S": float(MU_S), "phi": float(PHI), "channels_deg3": 7})


def test_firewall_minpoly_collapse():
    G = companion([1, -1, -1])                     # golden Fibonacci companion
    for k in (1, 2, 3, 5):
        Mk = G
        for _ in range(k - 1):
            Mk = dsum(Mk, G)
        nn = Mk.shape[0]
        assert Mk * Mk - Mk - sp.eye(nn) == sp.zeros(nn)   # satisfies x^2-x-1, any k
    record("P1-GATE-05a", PAPER, "Prop 8.5 (minpoly firewall)",
           "any direct sum of k golden blocks satisfies x^2-x-1 (degree-2 minpoly): the "
           "block count k is forgotten (the firewall is one-way)",
           "(+_k golden) satisfies R^2 - R - I = 0 for all k",
           detail={"k_tested": [1, 2, 3, 5]})


def test_firewall_squaring_collapse():
    # squaring y=x^2 sends x^4+5x^2-5 to y^2+5y-5, discriminant 45 = 9*5 -> Q(sqrt5)
    disc = sp.discriminant(sp.Poly(x**2 + 5 * x - 5, x))
    assert disc == 45
    K = 5**sp.Rational(1, 4) / PHI
    assert sp.expand(sp.minimal_polynomial(K**2, x) - (x**2 + 5 * x - 5)) == 0
    record("P1-GATE-05b", PAPER, "Prop 8.5 (squaring firewall)",
           "squaring y=x^2 collapses the K-formation x^4+5x^2-5 to y^2+5y-5 with discriminant "
           "45=9*5, landing in Q(sqrt5); minpoly(K^2)=x^2+5x-5",
           "x^4+5x^2-5 --(y=x^2)--> y^2+5y-5, disc=45 -> Q(sqrt5)",
           detail={"disc": 45})


def test_keystone_unique_to_golden():
    I2 = sp.eye(2)
    seeds = {
        "phi   x^2-x-1": (companion([1, -1, -1]), "R^2=R+I"),
        "tau   x^2+x-1": (companion([1, 1, -1]),  "R^2=I-R"),
        "sqrt2 x^2-2":   (companion([1, 0, -2]),  "R^2=2I"),
        "sqrt3 x^2-3":   (companion([1, 0, -3]),  "R^2=3I"),
        "sqrt5 x^2-5":   (companion([1, 0, -5]),  "R^2=5I"),
    }
    golden = companion([1, -1, -1])
    assert golden * golden == golden + I2                       # only golden: R^2=R+I
    assert companion([1, 1, -1])**2 == I2 - companion([1, 1, -1])
    for D in (2, 3, 5):
        assert companion([1, 0, -D])**2 == D * I2
    record("P1-GATE-06", PAPER, "Lem 8.6 (keystone unique)",
           "among the seed companions only the golden one satisfies R^2=R+I; tau gives "
           "R^2=I-R and each radicand seed gives R^2=DI",
           "golden: R^2=R+I (unique); tau: R^2=I-R; sqrt(D): R^2=DI",
           detail={nm: rel for nm, (_, rel) in seeds.items()})
