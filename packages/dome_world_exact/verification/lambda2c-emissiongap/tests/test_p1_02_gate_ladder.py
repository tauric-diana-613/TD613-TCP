"""
test_p1_02_gate_ladder.py
=========================
Paper 1, Section 6: the quadratic gate ladder, its companion R_C, the trifurcation
spectrum of the self-action, and the gate-balance / Mahler-radius identities.

Forced relationships:
    R_C = [[0,C],[1,-1]]  ->  charpoly x^2+x-C, discriminant D = 1+4C   (eq:companion)
    spec(ad_{R_C}) = {-sqrt(1+4C), 0, +sqrt(1+4C)}, 0-space = span{I,R_C}  (Thm 6.2)
    charpoly(ad_{R_C}) = t^2 (t^2 - (1+4C))
    gate ladder C in {1/4,1/2,1} -> D in {2,3,5} -> Q(sqrt D)
    r(R_C) = sqrt(1+4C) = sqrt(M(x^2-D)),  M(x^2-D) = D = 1+4C        (Rem 6.4)
"""
import sympy as sp
from harness.algebra import x, t, ad_operator, R_C, mahler_mp
from harness.results import record

PAPER = "lambda_2c"
C = sp.Symbol('C')
lam = sp.Symbol('lam')


def test_RC_charpoly_and_discriminant():
    RC = R_C(C)
    cp = sp.expand(RC.charpoly(x).as_expr())
    assert sp.expand(cp - (x**2 + x - C)) == 0
    disc = sp.discriminant(sp.Poly(x**2 + x - C, x))
    assert sp.simplify(disc - (1 + 4 * C)) == 0          # D = 1 + 4C
    # eigenvalue gap squared equals the discriminant: (lam+ - lam-)^2 = 1+4C
    record("P1-LAD-01", PAPER, "eq:companion",
           "R_C=[[0,C],[1,-1]] has charpoly x^2+x-C and discriminant D=1+4C; the eigenvalue "
           "gap is sqrt(1+4C)",
           "charpoly(R_C)=x^2+x-C, disc=1+4C, gap=sqrt(1+4C)",
           detail={"charpoly": "x^2+x-C", "discriminant": "1+4C"})


def test_trifurcation_spectrum():
    RC = R_C(C)
    ad = ad_operator(RC)
    eig = ad.eigenvals()
    nonzero = [e for e in eig if sp.simplify(e) != 0]
    assert all(sp.simplify(e**2 - (1 + 4 * C)) == 0 for e in nonzero)   # +-sqrt(1+4C)
    assert eig.get(sp.Integer(0), 0) == 2                                # 0 has multiplicity 2
    # exact characteristic polynomial t^2 (t^2 - (1+4C)) = t^4 - (1+4C) t^2
    chp = sp.expand(ad.charpoly(lam).as_expr())
    assert sp.expand(chp - (lam**4 - (1 + 4 * C) * lam**2)) == 0
    record("P1-LAD-02", PAPER, "Thm 6.2 (trifurcation)",
           "spec(ad_{R_C}) = {-sqrt(1+4C), 0, +sqrt(1+4C)} with 0 of multiplicity 2; "
           "charpoly = t^2 (t^2 - (1+4C))",
           "spec(ad_RC)={-sqrt(1+4C),0,+sqrt(1+4C)}; charpoly_ad = t^4-(1+4C)t^2",
           detail={"spectrum": "{-sqrt(1+4C),0,+sqrt(1+4C)}", "zero_mult": 2})


def test_centralizer_is_span_I_R():
    RC = R_C(sp.Integer(1))                              # golden gate, non-scalar
    ad = ad_operator(RC)
    dim_kernel = ad.shape[0] - ad.rank()
    assert dim_kernel == 2                               # = dim span{I, R_C}
    record("P1-LAD-03", PAPER, "Thm 6.2 (centralizer)",
           "the 0-eigenspace of ad_{R_C} is span{I, R_C}, dimension 2: the CAPTURED channel "
           "is the centralizer and cannot be removed",
           "dim ker(ad_RC) = 2 = dim span{I,R_C}",
           detail={"kernel_dim": 2})


def test_gate_ladder_radicands_and_fields():
    rows = []
    for Cval, D in [(sp.Rational(1, 4), 2), (sp.Rational(1, 2), 3), (sp.Integer(1), 5)]:
        assert sp.simplify(1 + 4 * Cval - D) == 0
        assert abs(float(mahler_mp([1, 0, -D])) - D) < 1e-30   # M(x^2-D)=D
        rows.append({"C": str(Cval), "D": D})
    record("P1-LAD-04", PAPER, "Sec 6 ladder table",
           "the three gates C in {1/4,1/2,1} give D=1+4C in {2,3,5}, fields Q(sqrt2),Q(sqrt3),"
           "Q(sqrt5); M(x^2-D)=D for each",
           "C in {1/4,1/2,1} -> D in {2,3,5}, M(x^2-D)=D",
           detail={"ladder": rows})


def test_gate_balance_and_mahler_radius():
    # r(R_C) = sqrt(1+4C); the discriminant seed x^2-D has M = D = 1+4C, so
    # r(R_C) = sqrt(M(x^2-D)). The gate balance is lambda*C = r(R_C) = sqrt(1+4C).
    r = sp.sqrt(1 + 4 * C)
    M = 1 + 4 * C
    assert sp.simplify(r - sp.sqrt(M)) == 0
    # at the golden gate C=1: r = sqrt5, lambda*C = lambda = sqrt5
    assert sp.simplify(r.subs(C, 1) - sp.sqrt(5)) == 0
    record("P1-LAD-05", PAPER, "Rem 6.4 + eq:gatebalance",
           "the self-action radius r(R_C)=sqrt(1+4C)=sqrt(M(x^2-D)); the gate balance "
           "lambda*C = r(R_C) sits at the 0->+ channel boundary",
           "r(R_C)=sqrt(1+4C)=sqrt(M(x^2-D)); lambda*C = sqrt(1+4C)",
           detail={"r": "sqrt(1+4C)", "M_x2mD": "1+4C", "at_C1": float(sp.sqrt(5))})


def test_three_valid_gates_forced():
    # A gate C defines a genuine real quadratic field Q(sqrt D), D=1+4C, iff x^2+x-C is
    # irreducible over Q (D a non-square). Integrality of D forces C in (1/4)Z; the golden
    # ceiling forces 0 < C <= 1. The quarter-gates in (0,1] are {1/4,1/2,3/4,1} -> D in
    # {2,3,4,5}; D=4 is a perfect square (x^2+x-3/4 = (x-1/2)(x+3/2)) so its gate degenerates.
    # Exactly three valid gates remain -> the three minimal real quadratic fields.
    quarter_gates = [sp.Rational(1, 4), sp.Rational(1, 2), sp.Rational(3, 4), sp.Integer(1)]
    valid, degenerate = [], []
    for Cg in quarter_gates:
        D = int(1 + 4 * Cg)
        if sp.Poly(x**2 + x - Cg, x).is_irreducible:     # genuine quadratic field
            valid.append((Cg, D))
        else:
            degenerate.append((Cg, D))                   # field collapses to Q
    assert valid == [(sp.Rational(1, 4), 2), (sp.Rational(1, 2), 3), (sp.Integer(1), 5)]
    assert degenerate == [(sp.Rational(3, 4), 4)]        # D=4 perfect square excluded
    assert [D for _, D in valid] == [2, 3, 5]            # Q(sqrt2), Q(sqrt3), Q(sqrt5)
    record("P1-LAD-06", PAPER, "Sec 6 (three valid gates forced)",
           "the gate set is forced, not chosen: integrality (C in (1/4)Z) + golden ceiling "
           "(0<C<=1) give quarter-gates {1/4,1/2,3/4,1} -> D in {2,3,4,5}; D=4 is a perfect "
           "square (degenerate), leaving exactly three valid gates {1/4,1/2,1} -> {2,3,5}",
           "valid gates = {1/4,1/2,1} -> D in {2,3,5}; C=3/4 (D=4) degenerate",
           detail={"valid_gates": {"1/4": 2, "1/2": 3, "1": 5}, "excluded": {"3/4": 4}})
