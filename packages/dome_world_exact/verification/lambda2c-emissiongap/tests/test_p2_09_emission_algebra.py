"""
test_p2_09_emission_algebra.py
==============================
Paper 2, Section 8 (the floor as a system invariant). The lambda=2c emission algebra
is a closed functional system: objects are emission matrices, operations are exactly
the framework operations, and every object carries its cost = 2c*log M. The cost
floor 2c*log(phi) is maintained as a GLOBAL invariant -- it survives every operation
and composition rather than being re-checked per object -- and the forbidden (Salem)
channel stays empty. A foreign operation that hits the Salem locus is rejected.

Core equation:
    cost(theta) = lambda * log M(theta) = 2c * log M(theta);
    invariant   M(theta) in {1} U [phi, inf)  =>  positive-cost floor = 2c * log(phi),
    linear in the free conformal constant c (never frozen at c=1).
"""
import sympy as sp
import mpmath as mp
from emission_algebra import EmissionAlgebra, Element, _companion, FOREIGN, PHI
from harness.results import record

mp.mp.dps = 30
PAPER = "emission_gap"


def fresh():
    return EmissionAlgebra(c=1)


def test_catalog_seeds_at_or_above_floor():
    A = fresh()
    for nm, e in A.seeds.items():
        assert e.respects_floor()
        assert e.mahler >= float(PHI) - 1e-12        # realized floor = phi
        assert e.cost() >= A.floor_cost() - 1e-9
    record("P2-EALG-01", PAPER, "Sec 8 (seeds at/above floor)",
           "every catalog seed respects the floor: Mahler >= phi and cost >= 2c*log(phi); the "
           "floor is realized (phi attains it)",
           "for all seeds: M >= phi and cost = 2c log M >= 2c log phi",
           detail={"seeds": list(A.seeds.keys()), "floor_cost_c1": A.floor_cost()})


def test_floor_survives_all_operations():
    A = fresh()
    p, s2, s3, s5, K = (A.seeds[k] for k in ("phi", "sqrt2", "sqrt3", "sqrt5", "Kform"))
    objs = [A.kron(p, s2), A.dsum(s2, s3), A.square(K), A.self_action(p),
            A.self_action(A.kron(p, s3)), A.kron(A.self_action(p), s5),
            A.self_action(A.self_action(p)), A.dsum(A.square(K), p)]
    for e in objs:
        assert e.respects_floor()
        assert e.cost() >= A.floor_cost() - 1e-9
    record("P2-EALG-02", PAPER, "Sec 8 (floor is a system invariant)",
           "the floor survives every framework operation and composition (kron, dsum, square, "
           "nested self-action): it is a global invariant of the generating field, not a "
           "per-object bound that might fail somewhere",
           "cost(op(...)) >= 2c log phi for all framework compositions",
           detail={"objects_checked": 8})


def test_forbidden_channel_empty_is_no_salem():
    A = fresh()
    p, s3 = A.seeds["phi"], A.seeds["sqrt3"]
    objs = list(A.seeds.values()) + [A.kron(p, s3), A.self_action(A.kron(p, s3))]
    assert all(e.channel["FORBIDDEN"] == 0 for e in objs)
    record("P2-EALG-03", PAPER, "Sec 8 (forbidden channel empty)",
           "the FORBIDDEN channel (on-circle-expanding ad-eigenvalues) is empty on every "
           "object -- the diagnostic reading of 'no Salem emitted' (the exact certificate is "
           "the closure guard)",
           "channel['FORBIDDEN'] = 0 for all framework objects",
           detail={"objects_checked": len(objs)})


def test_composition_preserves_field_confinement():
    A = fresh()
    p, s2 = A.seeds["phi"], A.seeds["sqrt2"]
    e = A.self_action(A.kron(A.square(p), s2))
    assert e.field_class in ("K(i)", "totally_real", "abelian")
    record("P2-EALG-04", PAPER, "Sec 8 (field confinement, provenance)",
           "under framework operations the field class stays in {K(i), totally_real, abelian}, "
           "never foreign; tracked as provenance (the exact field certificate is the guard)",
           "field_class(framework composition) in safe fields",
           detail={"field_class": e.field_class})


def test_foreign_salem_hit_is_rejected():
    A = fresh()
    Cf = _companion([1, 1, 0, -1, -1, -1, -1, -1, 0, 1, 1])     # Lehmer beta=1.176<phi
    foreign = sp.diag(Cf, sp.Matrix([[1]]))                     # traceless => commutator (Shoda)
    import pytest
    with pytest.raises(ValueError):
        A._emit(foreign, "planted_Lehmer", FOREIGN, "free_commutator")
    record("P2-EALG-05", PAPER, "Sec 8 (foreign op rejected)",
           "the algebra refuses to emit a foreign (free-commutator) matrix carrying a sub-phi "
           "Salem: _emit raises rather than registering it, so the closed system cannot admit "
           "a floor violation",
           "emit(foreign sub-phi Salem) raises ValueError",
           detail={"operation": "free_commutator", "rejected": True})


def test_floor_parametrized_over_c():
    # floor = 2c log phi, linear in c, never frozen at c=1.
    for c in (1, 2, 5, sp.Rational(1, 2)):
        A = EmissionAlgebra(c=c)
        assert abs(A.floor_cost() - float(2 * c * mp.log(PHI))) < 1e-9
    record("P2-EALG-06", PAPER, "Sec 8 (floor parametrized over c)",
           "the cost floor is 2c*log(phi), linear in the free conformal constant c and never "
           "frozen at c=1; c stays free (Cencov) so the floor scales, it does not collapse to "
           "one number",
           "floor_cost(c) = 2c log phi  (checked c in {1,2,5,1/2})",
           detail={"c_values": [1, 2, 5, 0.5]})


def test_four_readouts_consistent():
    A = fresh()
    e = A.kron(A.seeds["phi"], A.seeds["Kform"])
    assert abs(e.entropy - mp.log(e.height)) < 1e-9          # entropy = log height
    assert e.signature[0] + 2 * e.signature[1] == e.dim      # signature sums to degree
    assert abs(e.cost() - 2 * A.c * e.entropy) < 1e-9        # cost = 2c * entropy
    record("P2-EALG-07", PAPER, "Sec 8 (four readouts consistent)",
           "the four readouts of the single invariant agree: entropy = log(height), "
           "r1 + 2 r2 = degree, and cost = 2c * entropy",
           "entropy=log height; r1+2r2=deg; cost=2c*entropy",
           detail={"dim": int(e.dim), "signature": [int(v) for v in e.signature]})


if __name__ == "__main__":
    import subprocess
    import sys
    sys.exit(subprocess.call(["python3", "-m", "pytest", "-q", __file__]))
