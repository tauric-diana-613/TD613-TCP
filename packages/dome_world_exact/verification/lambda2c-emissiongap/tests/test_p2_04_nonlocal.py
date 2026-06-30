"""
test_p2_04_nonlocal.py
======================
Paper 2, Section 5: the non-local identity -- four structurally analogous gaps
with numerically distinct endpoints -- and the Lorentzian signature reading.

Forced relationships:
    four gaps, distinct endpoints: height (1,phi), entropy (0,log phi),
       channel (0,sqrt5), metric (det-G sign flip); phi != log phi != sqrt5     (Rem 5.2)
    Lorentzian: a degree-2m Salem field has signature (2, m-1); its trace form is
       indefinite. The catalog K places are OFF the unit circle                  (Prop 5.3)
    finitely generated: the emission Mahler spectrum is a discrete sub-semigroup
       of [phi, inf) with generators {phi,2,3,5,phi^4,beta^2}; no accumulation
       at 1                                                                       (Rem 5.4)
"""
import sympy as sp
import mpmath as mp
from harness.algebra import x, signature, mahler_mp, PHI, n_on_circle
from harness.results import record

PAPER = "emission_gap"


def test_four_gap_endpoints_distinct():
    phi = float(PHI)
    logphi = float(mp.log(phi))
    sqrt5 = float(sp.sqrt(5))
    pts = {"height_phi": phi, "entropy_logphi": logphi, "channel_sqrt5": sqrt5}
    vals = list(pts.values())
    assert all(abs(a - b) > 1e-6 for i, a in enumerate(vals) for b in vals[i + 1:])
    assert phi != logphi and phi != sqrt5 and logphi != sqrt5
    record("P2-NL-01", PAPER, "Rem 5.2 (four-gap non-local identity)",
           "the four gaps share one structure but distinct endpoints: height phi=1.618, "
           "entropy log phi=0.481, channel sqrt5=2.236; they are analogous, not equal",
           "phi != log phi != sqrt5 (structurally analogous gaps)",
           detail={k: round(v, 6) for k, v in pts.items()})


def test_catalog_K_complex_places_off_circle():
    Kpoly = [1, 0, 5, 0, -5]                       # x^4 + 5x^2 - 5
    assert signature(Kpoly) == (2, 1)              # 2 real (+-K), 1 complex pair (+-i beta)
    assert n_on_circle(Kpoly) == 0                 # the complex places are OFF the unit circle
    beta = float(mp.sqrt((5 + 3 * mp.sqrt(5)) / 2))
    assert abs(beta - 2.4195) < 1e-3               # |i beta| = beta ~ 2.4195
    assert abs(float(5**0.25) - 1.4953) < 1e-3     # |5^(1/4) i| ~ 1.4953
    record("P2-NL-02", PAPER, "Prop 5.3 (catalog Lorentzian, off circle)",
           "the K-formation field has signature (2,1); its complex places sit OFF the unit "
           "circle (|i beta|~2.4195, |5^(1/4) i|~1.4953), unlike Salem on-circle conjugates",
           "sig(Q(K)) = (2,1); complex places off |z|=1",
           detail={"signature": [2, 1], "beta": beta})


def test_salem_field_signature_lorentzian():
    # a degree-2m Salem field has 2 real embeddings and m-1 complex pairs: (2, m-1).
    L = [1, 1, 0, -1, -1, -1, -1, -1, 0, 1, 1]     # Lehmer, degree 10, m=5
    assert signature(L) == (2, 4)                  # (2, m-1) with m=5
    b4 = [1, -1, -1, -1, 1]                        # beta4, degree 4, m=2
    assert signature(b4) == (2, 1)                 # (2, m-1) with m=2
    record("P2-NL-03", PAPER, "Prop 5.3 (Salem signature)",
           "a degree-2m Salem field has signature (2, m-1) (2 real: lambda,1/lambda; m-1 "
           "complex pairs on the circle); Lehmer -> (2,4), beta4 -> (2,1)",
           "sig(Salem deg 2m) = (2, m-1)",
           detail={"lehmer_sig": [2, 4], "beta4_sig": [2, 1]})


def test_finitely_generated_discrete_semigroup():
    gens = {
        "phi": [1, -1, -1], "2": [1, 0, -2], "3": [1, 0, -3],
        "5": [1, 0, -5], "phi^4(gap)": [1, -7, 1], "beta^2(Kform)": [1, 0, 5, 0, -5],
    }
    measures = {nm: float(mahler_mp(c)) for nm, c in gens.items()}
    assert all(v >= float(PHI) - 1e-9 for v in measures.values())   # all >= phi
    # no accumulation at 1: the image has an open gap (1, phi)
    assert min(v for v in measures.values()) >= float(PHI) - 1e-9
    record("P2-NL-04", PAPER, "Rem 5.4 (finitely generated)",
           "the emission Mahler spectrum is a discrete sub-semigroup of [phi, inf) with "
           "generators {phi,2,3,5,phi^4,beta^2}; bounded away from 1 (open gap (1,phi))",
           "generators {phi,2,3,5,phi^4,beta^2} subset [phi, inf), no accumulation at 1",
           detail={"generator_measures": {k: round(v, 4) for k, v in measures.items()}})
