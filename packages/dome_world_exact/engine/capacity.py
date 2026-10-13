"""capacity.py -- A3.P0: exact height / capacity primitives (the Northcott-admissibility gate).

The EXACT-integer-only core of the Arakelov-Northcott capacity rule (see A3_DESIGN.md). A seed's
arithmetic cost is its (degree, height); Northcott finiteness -- bounded degree + height ⇒ finitely
many algebraic integers -- makes the admissible set finite, so the model's capacity is intrinsically
bounded (the principled replacement for HARD_DEGREE_CAP). This module supplies the EXACT primitives;
WIRING the gate into propose()/confirm() is A3.P1 (not built here), and the exact-threshold / Fisher
derivation is A3.P2 (DEFERRED research).

The GATE decides on EXACT INTEGERS ONLY (G8 / Principle 5.12): degree + coefficient-height. The float
Mahler measure M(theta) = H(theta)^deg is a DISPLAY / RANKING observable -- it NEVER crosses the admit
boundary. Landau's inequality M(p) <= ||p||_2 lets the exact integer ||m||_2^2 = sum c_i^2 certify an
upper bound on M from the same exact coefficients (M(p)^2 <= landau_bound_sq), with no roots and no float.

PURE functions (no mutation -- wiring is A3.P1). Pure stdlib on the gate path (the float Mahler
lazy-imports loom). Monic-integer inputs (G10); floats rejected at the gate (G8); model-layer only
(no z / KIRA / Plate-Matrices / numpy on the gate path).
"""
from __future__ import annotations

import os
import sys
from dataclasses import dataclass
from fractions import Fraction
from typing import List, Sequence

_HERE = os.path.dirname(os.path.abspath(__file__))
_ROOT = os.path.dirname(_HERE)
for _p in (_HERE, _ROOT):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from integral_basis import _guard_int_monic   # noqa: E402  (G10 guard, reuse L0; numpy-free at import)


# --------------------------------------------------------------------------- #
# A3.P2b information-threshold floors -- NAMED, DOCUMENTED constants (no magic numbers).
# Stored as CERTIFIED rational brackets [lo, hi] so the interval gate is rigorous.
# --------------------------------------------------------------------------- #
# Smyth's floor: the plastic number, the real root of x^3 - x - 1. It is the smallest Mahler measure of a
# NON-RECIPROCAL algebraic integer -- a THEOREM (Smyth 1971). f(lo) < 0 < f(hi) is checked by the probe,
# so [MU_SMYTH_LO, MU_SMYTH_HI] provably brackets mu_S = 1.32471795724...
MU_SMYTH_LO = Fraction("1.3247179")
MU_SMYTH_HI = Fraction("1.3247180")
# Lehmer's value (largest real root of Lehmer's degree-10 polynomial), 1.17628081826...  This is the
# CONJECTURAL universal floor (Lehmer's problem is OPEN). It is HEURISTIC ONLY -- it must never be a default
# floor; it is selected only via reciprocal_floor="lehmer".
MU_LEHMER_LO = Fraction("1.1762808")
MU_LEHMER_HI = Fraction("1.1762809")
# Dobrowolski's explicit constant in  M(p) >= 1 + c * (loglog d / log d)^3  for non-cyclotomic p of degree d
# (Dobrowolski 1979) -- a PROVABLE, degree-dependent lower bound (it tends to 1, so it is NOT a uniform
# floor). Used as the reciprocal-seed floor by default (RULING 1).
DOBROWOLSKI_C = Fraction(1, 1200)


def is_reciprocal(min_poly: Sequence[int]) -> bool:
    """True iff the monic-integer minpoly is (anti-)reciprocal: x^n * m(1/x) = +- m(x), i.e. the coefficient
    list is a palindrome (m == reversed) or an anti-palindrome (m == -reversed). Smyth's floor mu_S is a
    THEOREM only for NON-reciprocal integers; the unsolved core of Lehmer's problem (Salem numbers, units)
    lives in the reciprocal case -- so the floor branch (RULING 1) keys on this exact predicate. Order-agnostic
    (palindromy is the same high-to-low or low-to-high)."""
    m = _exact_int_poly(min_poly)
    rev = m[::-1]
    return rev == m or rev == [-c for c in m]


def _exact_int_poly(min_poly: Sequence) -> List[int]:
    """Reject float coefficients (the gate is EXACT, G8) then enforce monic-integer (G10).
    Integer-valued floats are rejected too -- no float may cross the admit boundary."""
    for c in min_poly:
        if isinstance(c, float):
            raise TypeError("min_poly coefficients must be exact int, not float -- the gate is exact (G8)")
    return _guard_int_monic(min_poly)          # raises on non-monic / non-integer (G10)


# --------------------------------------------------------------------------- #
# exact height invariants (integers only -- these decide the gate)
# --------------------------------------------------------------------------- #
def degree(min_poly: Sequence[int]) -> int:
    """deg(m) = len(m) - 1. Exact integer."""
    return len(_exact_int_poly(min_poly)) - 1


def coeff_height(min_poly: Sequence[int]) -> int:
    """The naive height: max |coefficient| of the monic-integer minpoly. Exact integer."""
    mp = _exact_int_poly(min_poly)
    return max(abs(c) for c in mp)


def landau_bound_sq(min_poly: Sequence[int]) -> int:
    """||m||_2^2 = sum_i c_i^2 (exact integer). By Landau's inequality M(p) <= ||p||_2, so
    M(p)^2 <= landau_bound_sq -- a CERTIFIED upper bound on the Mahler measure derived from the exact
    coefficients alone (no roots, no float). Squared so it stays an exact integer."""
    mp = _exact_int_poly(min_poly)
    return sum(c * c for c in mp)


def certified_mahler_le(min_poly: Sequence[int], m_max: int) -> bool:
    """EXACT certified test 'M(theta) <= m_max' via Landau: M <= sqrt(landau_bound_sq) <= m_max iff
    landau_bound_sq <= m_max^2 (exact integers). Sufficient, not necessary (a conservative certificate)."""
    if isinstance(m_max, float):
        raise TypeError("m_max must be an exact int -- the certified bound is exact (G8)")
    return landau_bound_sq(min_poly) <= int(m_max) * int(m_max)


# --------------------------------------------------------------------------- #
# float Mahler / Weil height -- DISPLAY / RANKING ONLY (never crosses the gate)
# --------------------------------------------------------------------------- #
def mahler_float(min_poly: Sequence[int]) -> float:
    """M(theta) = |a_n| * prod max(1, |root|) as a FLOAT (needs the complex roots). DISPLAY / ranking
    ONLY -- it MUST NOT cross the admit boundary (G8 / Principle 5.12: decide membership over Q/Z,
    measure deviation over R). Lazy loom import keeps the gate path pure stdlib / numpy-free."""
    mp = _exact_int_poly(min_poly)
    import loom                                 # lazy: the gate never calls this -> gate path stays clean
    return float(loom.mahler_measure(list(mp)))


def weil_height_float(min_poly: Sequence[int]) -> float:
    """H(theta) = M(theta)^(1/deg) (the absolute Weil height), from M = H^deg. FLOAT, DISPLAY only."""
    d = degree(min_poly)
    return mahler_float(min_poly) ** (1.0 / d) if d > 0 else 1.0


# --------------------------------------------------------------------------- #
# the Northcott budget + the EXACT admissibility predicate
# --------------------------------------------------------------------------- #
@dataclass(frozen=True)
class Budget:
    """A Northcott (degree, height) budget. The admissible set
        { monic-integer m : deg(m) <= degree_max, coeff_height(m) <= height_max }
    is FINITE -- at most sum_{d=1..degree_max} (2*height_max+1)^d -- so the model's capacity is bounded
    (the principled, proven replacement for HARD_DEGREE_CAP)."""
    degree_max: int
    height_max: int


def is_admissible(min_poly: Sequence[int], budget: Budget) -> bool:
    """EXACT Northcott-admissibility (integers only -- G8): degree <= D_max AND coeff_height <= H_max.

    Conservative-certified: coeff_height <= H_max bounds every coefficient (a naive-height cap), and via
    Landau M <= ||m||_2 <= sqrt(deg+1)*coeff_height -- a SUFFICIENT (not necessary) cap on arithmetic
    complexity. The float Mahler is NOT consulted; nothing float crosses this boundary. For a tight
    certified Mahler budget use certified_mahler_le(min_poly, m_max) instead."""
    return degree(min_poly) <= budget.degree_max and coeff_height(min_poly) <= budget.height_max


# --------------------------------------------------------------------------- #
# A3.P1: the derived GROW / STOP / REJECT decision (replaces the tuned heuristic)
# --------------------------------------------------------------------------- #
@dataclass(frozen=True)
class CapacityVerdict:
    """The derived capacity decision. `decision` in {GROW, STOP, REJECT}; numeric fields are exact."""
    decision: str
    degree: int
    coeff_height: int
    admissible: bool
    reason: str


def capacity_decision(min_poly, residual_norm, budget: Budget, *, effective_degree=None, floor=0,
                      info_threshold=False, ambient_degree=None, one_in_basis=False,
                      lam=2, degree_aware=True, reciprocal_floor="dobrowolski",
                      dobrowolski_c=DOBROWOLSKI_C) -> CapacityVerdict:
    """The DERIVED Northcott growth rule (A3.P1) -- replaces the tuned persistence / HARD_DEGREE_CAP gate.

      STOP    if the residual defect is at/below the floor (captured, or noise that averages out);
      REJECT  if the candidate seed is NOT Northcott-admissible (degree or height beyond the budget);
      GROW    otherwise (a real defect AND a Northcott-admissible seed).

    EXACT (G8): the defect test (residual_norm vs floor) and admissibility (degree + coeff_height vs the
    budget) are decided over Q/Z; the float Mahler is never consulted. `effective_degree` overrides
    degree(min_poly) -- pass the ACTUAL compositum degree so compositum growth (P2c) reuses the SAME
    gate, disjointness-independent.

    --------------------------------------------------------------------------------------------------
    A3.P2b INFORMATION THRESHOLD  --  OPT-IN, DEFAULT OFF (RULING 2).
    --------------------------------------------------------------------------------------------------
    With `info_threshold=False` (the default) this returns the shipped verdict BYTE-FOR-BYTE: the entire
    existing suite is unaffected and the default code path stays pure stdlib (no mpmath import).

    With `info_threshold=True` the gain/cost criterion of A3.P2b is applied:

        gain   = residual_norm = ||r||_G^2  (= n * Fisher(r) only when 1 in B; A3.P2a)   -- EXACT Fraction
        floor  = (ambient_degree if degree_aware else 1) * lam * log(mu)                  -- Lehmer-derived
        cost   = lam * log M(theta),  certified via Landau:  M(theta) <= sqrt(landau_bound_sq)  (root-free,
                 exact-integer-derived), so  cost <= lam * (1/2) * log(landau_bound_sq) =: cost_upper.

        STOP   (certified)  if  gain < floor                  (below the cheapest-admissible-seed floor)
        GROW   (certified)  if  gain >= cost_upper  AND  gain >= floor   (beats even the MAX possible cost)
        STOP   (conservative) otherwise               (gain clears the floor but is not certified to beat
                                                        this seed's cost -- do not spend capacity on an
                                                        uncertified margin; the safe default is not to grow).

    All comparisons are CERTIFIED via mpmath interval arithmetic (mpmath.iv): the gain stays an exact
    Fraction injected as a rigorous thin interval; only the cost/floor are interval-real (G8: exact gate,
    real magnitude). RULING 1 (reciprocity): mu is chosen by `is_reciprocal(min_poly)` --
      * NON-reciprocal seed  -> mu_S = 1.3247... (Smyth's THEOREM): an unconditional positive floor.
      * reciprocal seed      -> Dobrowolski's degree-dependent provable bound (default; tends to 1, so the
                                floor can be 0 for small degree -- honest: no uniform floor is proven for
                                reciprocal seeds), OR the HEURISTIC Lehmer mu_L only if
                                reciprocal_floor="lehmer" (never the default).
    1-in-B PRECONDITION: the gain reading ||r||_G^2 = n*Fisher(r) is valid only when 1 in B (A3.P2a). The
    info path therefore requires `one_in_basis=True` (and `ambient_degree` when `degree_aware`); if the
    precondition is unmet it FALLS BACK to the exact admissibility-only path (the shipped behaviour) and
    says so in the reason. `lam`/`mu`/`dobrowolski_c` are named, documented, tunable parameters."""
    if (isinstance(residual_norm, float) or isinstance(floor, float)
            or isinstance(lam, float) or isinstance(dobrowolski_c, float)):
        raise TypeError("gate values must be exact (int/Fraction), not float -- the gate is exact (G8)")
    lam_q = Fraction(lam)
    if lam_q <= 0:
        raise ValueError("lam must be a positive exact rational")
    d = int(effective_degree) if effective_degree is not None else degree(min_poly)
    ch = coeff_height(min_poly)
    admissible = (d <= budget.degree_max) and (ch <= budget.height_max)

    def _shipped_verdict(extra_reason: str = "") -> CapacityVerdict:
        """The shipped A3.P1 gate (floor STOP -> admissibility REJECT -> GROW). Default path; also the
        info-threshold fallback when the 1-in-B precondition is unmet."""
        if Fraction(residual_norm) <= Fraction(floor):
            r = "residual defect at/below the floor (captured or noise)"
            return CapacityVerdict("STOP", d, ch, admissible, r + extra_reason)
        if not admissible:
            r = "seed exceeds the Northcott (degree, height) budget"
            return CapacityVerdict("REJECT", d, ch, admissible, r + extra_reason)
        return CapacityVerdict("GROW", d, ch, admissible, "real defect AND Northcott-admissible" + extra_reason)

    if not info_threshold:
        return _shipped_verdict()

    # ---- A3.P2b information-threshold path (opt-in) ---------------------------------------------- #
    if (not one_in_basis) or (degree_aware and ambient_degree is None):
        return _shipped_verdict(
            " [info_threshold requested but 1-in-B / ambient_degree precondition unmet "
            "-> admissibility-only fallback]")
    if not admissible:                                   # admissibility REJECT precedes the threshold
        return CapacityVerdict("REJECT", d, ch, admissible,
                               "seed exceeds the Northcott (degree, height) budget")

    import mpmath as _mp                                  # lazy: default path stays pure stdlib / mpmath-free
    iv = _mp.iv
    with _mp.workdps(50):
        gain_iv = iv.mpf(int(Fraction(residual_norm).numerator)) / iv.mpf(int(Fraction(residual_norm).denominator))
        mult = ambient_degree if degree_aware else 1
        recip = is_reciprocal(min_poly)
        if not recip:
            floor_kind = "Smyth mu_S (theorem, non-reciprocal)"
            log_mu = iv.log(iv.mpf([str(MU_SMYTH_LO), str(MU_SMYTH_HI)]))
            lam_iv = iv.mpf(int(lam_q.numerator)) / iv.mpf(int(lam_q.denominator))
            floor_iv = iv.mpf(int(mult)) * lam_iv * log_mu
        elif reciprocal_floor == "lehmer":
            floor_kind = "Lehmer mu_L (HEURISTIC, conjectural)"
            log_mu = iv.log(iv.mpf([str(MU_LEHMER_LO), str(MU_LEHMER_HI)]))
            lam_iv = iv.mpf(int(lam_q.numerator)) / iv.mpf(int(lam_q.denominator))
            floor_iv = iv.mpf(int(mult)) * lam_iv * log_mu
        else:                                            # "dobrowolski" (provable, degree-dependent, default)
            floor_kind = "Dobrowolski (provable, degree-dependent, reciprocal)"
            floor_iv = iv.mpf(0)
            lam_iv = iv.mpf(int(lam_q.numerator)) / iv.mpf(int(lam_q.denominator))
            if d >= 2:
                ld = iv.log(iv.mpf(int(d)))
                ratio = iv.log(ld) / ld
                c_iv = iv.mpf(int(dobrowolski_c.numerator)) / iv.mpf(int(dobrowolski_c.denominator))
                m_lb = iv.mpf(1) + c_iv * ratio**3
                if m_lb.a > 1:                           # only a CERTIFIED-positive lower bound counts
                    floor_iv = iv.mpf(int(mult)) * lam_iv * iv.log(m_lb)
        cost_upper_iv = lam_iv * (iv.log(iv.mpf(int(landau_bound_sq(min_poly)))) / 2)
        d_floor = gain_iv - floor_iv
        d_cost = gain_iv - cost_upper_iv
        below_floor = bool(d_floor.b < 0)
        beats_cost = bool(d_cost.a >= 0)
        clears_floor = bool(d_floor.a >= 0)

    tag = (f"[info_threshold lam={lam_q} degree_aware={degree_aware} n={mult} floor={floor_kind}; "
           f"gain>=floor={clears_floor} gain>=cost_upper(Landau)={beats_cost}]")
    if below_floor:
        return CapacityVerdict("STOP", d, ch, admissible,
                               "gain below the certified degree-aware floor " + tag)
    if beats_cost and clears_floor:
        return CapacityVerdict("GROW", d, ch, admissible,
                               "gain beats the certified max seed cost AND clears the floor " + tag)
    return CapacityVerdict("STOP", d, ch, admissible,
                           "gain clears the floor but is not certified to cover this seed's cost " + tag)


# --------------------------------------------------------------------------- #
# a reporting certificate (exact fields + a clearly-separated float display field)
# --------------------------------------------------------------------------- #
@dataclass(frozen=True)
class HeightCertificate:
    degree: int                  # exact
    coeff_height: int            # exact (naive height = max |coeff|)
    landau_bound_sq: int         # exact: M(theta)^2 <= this  (certified Mahler upper bound)
    mahler_float: float          # DISPLAY only -- never crosses the gate


def height_certificate(min_poly: Sequence[int]) -> HeightCertificate:
    """All exact height invariants + the float Mahler display, in one record (for reporting/ranking)."""
    return HeightCertificate(
        degree=degree(min_poly),
        coeff_height=coeff_height(min_poly),
        landau_bound_sq=landau_bound_sq(min_poly),
        mahler_float=mahler_float(min_poly),
    )


# --------------------------------------------------------------------------- #
# __main__: exact heights + the Landau certificate vs the float Mahler
# --------------------------------------------------------------------------- #
def _demo() -> None:
    seeds = {"phi  [1,-1,-1]": [1, -1, -1], "2*sqrt6 [1,0,-24]": [1, 0, -24],
             "sqrt7 [1,0,-7]": [1, 0, -7], "gap  [1,-7,1]": [1, -7, 1]}
    print(f"{'seed':22} {'deg':>3} {'coeff_h':>7} {'landau_sq':>9} {'M (float)':>11} {'M^2<=landau?':>13}")
    for name, mp in seeds.items():
        c = height_certificate(mp)
        print(f"{name:22} {c.degree:>3} {c.coeff_height:>7} {c.landau_bound_sq:>9} "
              f"{c.mahler_float:>11.6f} {str(c.mahler_float ** 2 <= c.landau_bound_sq):>13}")
    b = Budget(degree_max=4, height_max=10)
    print(f"\nBudget(degree_max=4, height_max=10):")
    for name, mp in seeds.items():
        print(f"  {name:22} admissible = {is_admissible(mp, b)}  (deg {degree(mp)}, coeff_h {coeff_height(mp)})")


if __name__ == "__main__":
    _demo()
