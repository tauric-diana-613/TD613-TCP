"""Exact emission-gap closure guard used only by the opt-in emission profile."""

from __future__ import annotations

import sympy as sp

X, T = sp.symbols("x t")


def _charpoly_z(matrix):
    return sp.Poly(matrix.charpoly(X).as_expr(), X)


def _trace_down(poly):
    coeffs = poly.all_coeffs()
    half = poly.degree() // 2
    recurrences = [sp.Integer(2), T]
    for _ in range(1, half):
        recurrences.append(sp.expand(T * recurrences[-1] - recurrences[-2]))
    result = sp.Integer(coeffs[half])
    for index in range(1, half + 1):
        result += coeffs[half - index] * recurrences[index]
    return sp.Poly(sp.expand(result), T)


def _flip_straddle(poly):
    degree = poly.degree()
    real = poly.count_roots(-sp.oo, sp.oo)
    above = poly.count_roots(2, sp.oo)
    inside = poly.count_roots(-2, 2)
    at_two = int(poly.eval(sp.Integer(2)) == 0)
    at_minus_two = int(poly.eval(sp.Integer(-2)) == 0)
    above_open = above - at_two
    inside_open = inside - at_two - at_minus_two
    return (
        real == degree
        and above_open == 1
        and inside_open == degree - 1
        and at_two == 0
        and at_minus_two == 0
    )


def _sign_q_sqrt5(value):
    expanded = sp.expand(value)
    rational = sp.Rational(sp.nsimplify(expanded.subs(sp.sqrt(5), 0)))
    radical = sp.Rational(sp.nsimplify((expanded - rational) / sp.sqrt(5)))
    if radical == 0:
        return (rational > 0) - (rational < 0)
    if rational == 0:
        return (radical > 0) - (radical < 0)
    if rational > 0 and radical > 0:
        return 1
    if rational < 0 and radical < 0:
        return -1
    lhs, rhs = rational * rational, 5 * radical * radical
    if rational > 0:
        return 1 if lhs > rhs else (-1 if lhs < rhs else 0)
    return 1 if rhs > lhs else (-1 if rhs < lhs else 0)


def _beta_below_phi(poly):
    phi = (1 + sp.sqrt(5)) / 2
    return _sign_q_sqrt5(sp.expand(poly.eval(phi))) > 0


def validate_closure(matrix):
    """Return the exact emission-gap verdict for an integer matrix."""
    salem = []
    for factor, _multiplicity in sp.factor_list(_charpoly_z(matrix).as_expr())[1]:
        poly = sp.Poly(factor, X)
        coefficients = list(poly.all_coeffs())
        if poly.degree() < 4 or coefficients != coefficients[::-1]:
            continue
        if _flip_straddle(_trace_down(poly)):
            salem.append({
                "degree": poly.degree(),
                "polynomial": [int(value) for value in coefficients],
                "belowPhi": bool(_beta_below_phi(poly)),
            })
    if any(item["belowPhi"] for item in salem):
        verdict = "INVALID_CLOSURE"
    elif salem:
        verdict = "FORCED_ABOVE_FLOOR"
    else:
        verdict = "FORCED"
    return {"verdict": verdict, "salemFactors": salem}
