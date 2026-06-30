"""
harness/algebra.py
==================
Shared EXACT-arithmetic primitives for the lambda=2c / Emission-Gap verification
suite. Every decision boundary below is evaluated symbolically (sympy + Fraction)
or by exact root counting (Sturm via sympy.Poly.count_roots). Floats / mpmath
appear ONLY for displayed magnitudes and Mahler-value cross-checks, never on a
decision path. This mirrors the epistemic discipline of both papers.

Conventions
-----------
* Polynomials are passed as integer coefficient lists, HIGH degree first:
  [1, b, c] == x^2 + b x + c.
* `companion(coeffs)` is the bottom-companion the papers use:
      R_C = [[0, C],[1, -1]]  for x^2 + x - C  (note the sign).
  For a generic monic p we build the standard companion whose charpoly is p.
"""
from fractions import Fraction
import sympy as sp
import mpmath as mp

mp.mp.dps = 60
x, t, y = sp.symbols('x t y')

# ----------------------------------------------------------------------------
# Canonical constants (exact where algebraic; high-precision for transcendentals)
# ----------------------------------------------------------------------------
PHI   = (1 + sp.sqrt(5)) / 2          # golden ratio, root of x^2 - x - 1
PSI   = (1 - sp.sqrt(5)) / 2          # conjugate, = -1/phi
SQRT5 = sp.sqrt(5)
PHI_f = float(PHI)
PSI_f = float(PSI)

# plastic / Smyth number mu_S, root of x^3 - x - 1  (smallest non-reciprocal Mahler)
MU_S  = mp.findroot(lambda z: z**3 - z - 1, 1.3247)
# Lehmer's number, the smallest known Salem number (degree 10)
LEHMER_POLY = [1, 1, 0, -1, -1, -1, -1, -1, 0, 1, 1]
# minimal degree-4 Salem number beta_4, root of x^4 - x^3 - x^2 - x + 1
BETA4_POLY  = [1, -1, -1, -1, 1]


def lucas(n):
    """Exact Lucas number L_n = phi^n + psi^n."""
    return int(sp.simplify(PHI**n + PSI**n))


def fib(n):
    """Exact Fibonacci number F_n = (phi^n - psi^n)/sqrt5."""
    return int(sp.simplify((PHI**n - PSI**n) / SQRT5))


# ----------------------------------------------------------------------------
# Polynomials and matrices
# ----------------------------------------------------------------------------
def poly(coeffs):
    """sympy Poly in x from integer coeff list (high degree first)."""
    return sp.Poly(coeffs, x)


def companion(coeffs):
    """Standard companion matrix whose characteristic polynomial is `coeffs` (monic)."""
    c = [sp.Integer(int(v)) for v in coeffs]
    assert c[0] == 1, "companion expects a monic polynomial"
    n = len(c) - 1
    M = sp.zeros(n)
    for i in range(n - 1):
        M[i + 1, i] = 1
    for i in range(n):
        M[i, n - 1] = -c[n - i]
    return M


def R_C(C):
    """The gate companion R_C = [[0, C],[1, -1]] of x^2 + x - C (Paper 1, eq:companion)."""
    return sp.Matrix([[0, sp.nsimplify(C)], [1, -1]])


def charpoly_coeffs(M):
    """Integer coefficient list (high first) of the characteristic polynomial of M."""
    p = sp.Poly(M.charpoly(x).as_expr(), x)
    return [int(v) for v in p.all_coeffs()]


def ad_operator(M):
    """Self-action ad_M = [M, .] : X -> MX - XM, as an n^2 x n^2 matrix over the
    standard basis {E_ij}. (Paper 1 Thm prop:trifurcation; Paper 2 def:selfaction.)"""
    n = M.shape[0]
    basis = []
    for i in range(n):
        for j in range(n):
            E = sp.zeros(n, n)
            E[i, j] = 1
            basis.append(E)
    cols = [[(M * E - E * M)[a, b] for a in range(n) for b in range(n)] for E in basis]
    return sp.Matrix(cols).T


def kron(A, B):
    return sp.Matrix(sp.kronecker_product(A, B))


def dsum(A, B):
    return sp.diag(A, B)


# ----------------------------------------------------------------------------
# Heights, reciprocity, Salem detection
# ----------------------------------------------------------------------------
def mahler_mp(coeffs):
    """Mahler measure as a high-precision mpf (for VALUE cross-checks, not decisions)."""
    cc = [mp.mpf(int(v)) for v in coeffs]
    lead = abs(mp.mpf(int(coeffs[0])))
    roots = mp.polyroots(cc, maxsteps=2000, extraprec=400)
    return lead * mp.fprod([max(mp.mpf(1), abs(r)) for r in roots])


def is_reciprocal(coeffs):
    c = [int(v) for v in coeffs]
    return c == c[::-1] or c == [-v for v in c[::-1]]


def signature(coeffs):
    """Exact metric signature (r1, r2): r1 real roots, r2 complex-conjugate pairs.
    r1 is counted by Sturm; no float touches the decision."""
    p = poly(coeffs)
    r1 = p.count_roots(-sp.oo, sp.oo)
    d = p.degree()
    return (r1, (d - r1) // 2)


def trace_down(coeffs):
    """Exact trace-down polynomial T in t with R(x) = x^m T(x + 1/x), for reciprocal R
    of even degree 2m. Built from x^k + x^-k = p_k(t): p0=2, p1=t, p_{k+1}=t p_k - p_{k-1}.
    (Paper 2 def:tracedown.)"""
    R = poly(coeffs)
    c = R.all_coeffs()
    m = R.degree() // 2
    p = [sp.Integer(2), t]
    for k in range(1, m):
        p.append(sp.expand(t * p[-1] - p[-2]))
    T = sp.Integer(c[m])
    for k in range(1, m + 1):
        T += c[m - k] * p[k]
    return sp.Poly(sp.expand(T), t)


def flip_straddle(coeffs):
    """Exact Sturm test for the Salem flip-straddle (Paper 2 lem:salemflip):
    R irreducible reciprocal of degree 2m>=4, trace-down T totally real with exactly
    one root in (2, inf) and m-1 in (-2, 2), none at +-2. Returns (bool, counts)."""
    R = poly(coeffs)
    cc = R.all_coeffs()
    if R.degree() < 4 or cc != cc[::-1] or not R.is_irreducible:
        return False, dict(real=0, above=0, inside=0, reason="not irreducible reciprocal deg>=4")
    T = trace_down(coeffs)
    m = T.degree()
    at2 = 1 if T.eval(2) == 0 else 0
    atm2 = 1 if T.eval(-2) == 0 else 0
    n_real = T.count_roots(-sp.oo, sp.oo)
    above = T.count_roots(2, sp.oo) - at2
    inside = T.count_roots(-2, 2) - at2 - atm2
    straddle = (n_real == m and above == 1 and inside == m - 1 and at2 == 0 and atm2 == 0)
    return straddle, dict(real=int(n_real), above=int(above), inside=int(inside))


def is_salem(coeffs):
    """Exact: is `coeffs` the minimal polynomial of a Salem number?
    Equivalent to the flip-straddle of its (irreducible, reciprocal, deg>=4) self."""
    straddle, _ = flip_straddle(coeffs)
    return straddle


def n_on_circle(coeffs, tol=1e-12):
    """Count roots on |z|=1 (display/diagnostic; not a decision boundary)."""
    rs = [complex(z) for z in poly(coeffs).all_roots()]
    return sum(1 for z in rs if abs(abs(z) - 1) < tol)
