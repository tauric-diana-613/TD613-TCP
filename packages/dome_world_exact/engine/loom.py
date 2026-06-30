"""L00M -- weaving forced structure into observable pattern.

The expanded core: N*N characteristic polynomial (Faddeev-LeVerrier), minimal
polynomial (Krylov dependence detection), Mahler measure and eigenvalues
(Durand-Kerner), the weave closure Phi = companion . charpoly, and a full
invariant bundle via classify().

Exact integer/rational arithmetic for: charpoly, minpoly, det, trace,
derogatory, unimodular. Floating point (display only) for: eigenvalues, mahler,
spectral radius.
"""

import math
import sys
from typing import List, Tuple, Dict, Any, Optional

# Type aliases matching matrix_plates
Matrix = List[List[int]]


def companion(coeffs: List[int], order: str = "high") -> Matrix:
    """Build the companion matrix of a monic polynomial.

    Parameters
    ----------
    coeffs : list of int
        If order="high": [1, a_{n-1}, ..., a_0]  (monic, high-to-low as in
            matrix_plates -- the canonical convention and the DEFAULT).
        If order="low":  [a0, a1, ..., a_{n-1}] for x^n + a_{n-1}*x^{n-1} + ... + a0.
    order : "high" or "low"
        Coefficient ordering convention. Defaults to "high" -- the high-to-low
        form used by this docstring's matrix_plates reference, weave(), and every
        internal caller. (A high-to-low monic list is ALSO a syntactically valid
        "low" list, so the wrong default mis-builds silently with no error; "high"
        is the spec convention, so it is the default.)

    Returns
    -------
    Matrix
        The n*n companion matrix with sub-diagonal ones and last column = -coeffs.
    """
    n = (len(coeffs) - 1) if order == "high" else len(coeffs)
    if n < 1:
        raise ValueError(
            "companion requires a polynomial of degree >= 1; got effective "
            f"dimension {n} from coeffs={coeffs!r} (order={order!r}). A degree-0 "
            "constant has no companion matrix."
        )
    if order == "high":
        # Convert from matrix_plates convention [1, c_{n-1}, ..., c_0] to internal.
        # Last column: -poly[n-i] for i in range(n), matching operators.py
        n = len(coeffs) - 1
        C = [[0] * n for _ in range(n)]
        for i in range(1, n):
            C[i][i - 1] = 1
        for i in range(n):
            C[i][n - 1] = -coeffs[n - i]
        return C
    else:
        # Original L00M convention
        n = len(coeffs)
        M = [[0] * n for _ in range(n)]
        for i in range(n - 1):
            M[i + 1][i] = 1
        for i in range(n):
            M[i][n - 1] = -coeffs[i]
        return M


def charpoly(matrix: Matrix) -> List[int]:
    """Characteristic polynomial via Faddeev-LeVerrier (any N*N).

    Returns coefficients high-to-low: [1, c_{n-1}, ..., c_0].
    For a 2x2 matrix, c_0 = det, c_1 = -trace.

    Faddeev-LeVerrier recurrence:
        B_0 = I
        c_{n-k} = -tr(A * B_{k-1}) / k
        B_k = A * B_{k-1} + c_{n-k} * I
    """
    n = len(matrix)
    if n == 0:
        return [1]

    # Use fractions for exact integer arithmetic
    from fractions import Fraction

    B = [[Fraction(1) if i == j else Fraction(0) for j in range(n)] for i in range(n)]
    A = [[Fraction(matrix[i][j]) for j in range(n)] for i in range(n)]
    coeffs = [Fraction(1)]  # leading coefficient (monic)

    for k in range(1, n + 1):
        # AB = A * B
        AB = [[sum(A[i][m] * B[m][j] for m in range(n)) for j in range(n)]
              for i in range(n)]
        c = -sum(AB[i][i] for i in range(n)) / k
        coeffs.append(c)
        if k < n:
            B = [[AB[i][j] + (c if i == j else Fraction(0))
                  for j in range(n)] for i in range(n)]

    # The charpoly of an INTEGER matrix has integer coefficients. Guard the cast
    # so a rational/float matrix raises instead of silently truncating to a
    # wrong-but-plausible integer answer (integer invariants are ground truth).
    result = []
    for c in coeffs:
        if c.denominator != 1:
            raise ValueError(
                "charpoly requires an integer matrix; got non-integer "
                f"coefficient {c}"
            )
        result.append(int(c))
    return result


def minpoly_faddeev_leverrier(matrix: Matrix) -> List[int]:
    """Minimal polynomial via Krylov space dependence detection.

    Returns coefficients high-to-low: [1, c_{m-1}, ..., c_0] where m <= n.
    The minimal polynomial divides the characteristic polynomial and equals it
    iff the matrix is non-derogatory.

    Algorithm: build {I, A, A^2, ...} as vectors in R^{n^2} and find the first
    linear dependence via exact-rational Gaussian elimination.
    """
    from fractions import Fraction
    n = len(matrix)
    if n == 0:
        return [1]

    def mat_to_vec(M):
        return [Fraction(M[i][j]) for i in range(n) for j in range(n)]

    def matmul_frac(A, B):
        return [[sum(A[i][k] * B[k][j] for k in range(n))
                 for j in range(n)] for i in range(n)]

    # Build powers: I, A, A^2, ..., A^n
    P = [[Fraction(1) if i == j else Fraction(0) for j in range(n)] for i in range(n)]
    A_frac = [[Fraction(matrix[i][j]) for j in range(n)] for i in range(n)]

    basis = []
    for k in range(n + 1):
        vec = mat_to_vec(P)
        row_coeffs = [Fraction(0)] * (k + 1)
        row_coeffs[k] = Fraction(1)

        for bvec, piv, bc in basis:
            if vec[piv] != 0:
                f = vec[piv] / bvec[piv]
                vec = [vec[i] - f * bvec[i] for i in range(len(vec))]
                L = max(len(row_coeffs), len(bc))
                rc = row_coeffs + [Fraction(0)] * (L - len(row_coeffs))
                bb = bc + [Fraction(0)] * (L - len(bc))
                row_coeffs = [rc[i] - f * bb[i] for i in range(L)]

        piv = next((i for i, v in enumerate(vec) if v != 0), None)
        if piv is None:
            # Found dependence -- row_coeffs encodes the minimal polynomial.
            # Normalize to monic.
            while row_coeffs and row_coeffs[-1] == 0:
                row_coeffs.pop()
            lead = row_coeffs[-1]
            row_coeffs = [c / lead for c in row_coeffs]
            # Same integer-matrix guard as charpoly: the minpoly of an integer
            # matrix divides its monic integer charpoly (Gauss's lemma), so its
            # coefficients are integers. Raise rather than int()-truncate.
            result = []
            for c in reversed(row_coeffs):
                if c.denominator != 1:
                    raise ValueError(
                        "minpoly requires an integer matrix; got non-integer "
                        f"coefficient {c}"
                    )
                result.append(int(c))
            return result

        nrm = vec[piv]
        vec = [v / nrm for v in vec]
        row_coeffs = [c / nrm for c in row_coeffs]
        basis.append((vec, piv, row_coeffs))
        P = matmul_frac(A_frac, P)

    # Fallback: minpoly = charpoly
    return charpoly(matrix)


# ---------------------------------------------------------------------------
# Durand-Kerner (Weierstrass) simultaneous root finder -- the SINGLE float
# root-finding kernel. eigenvalues, mahler_measure, and polytope all route
# through this; the loop was previously copy-pasted four times with a drifted
# iteration count (240 vs 300) and re-hardcoded init constants.
# ---------------------------------------------------------------------------
_PHI = (1.0 + 5.0 ** 0.5) / 2.0
# Golden-angle rotation 2*pi*(1 - 1/phi): an irrational offset for the initial
# guesses so none sits exactly on the real axis (real-coefficient symmetry),
# replacing the old hand-picked 0.37 rad.
_DK_PHASE = 2.0 * math.pi * (1.0 - 1.0 / _PHI)


def _durand_kerner(coeffs: List[int], iters: int = 300,
                   tol: float = 1e-13) -> Tuple[list, bool, float]:
    """Find all roots of a polynomial (coeffs high-to-low) by Durand-Kerner.

    Returns ``(roots, converged, max_residual)``:
      * ``roots``        -- the degree-many complex roots;
      * ``converged``    -- True iff the final sweep's max step fell below ``tol``
                            (False flags clustered/repeated roots, where DK is
                            only linearly convergent and the float roots smear);
      * ``max_residual`` -- ``max |P(root)|`` over the returned roots.

    The initial guesses sit on a circle of radius equal to the geometric mean of
    the root moduli, ``|a_n/a_0|**(1/n)`` (the product of the roots is
    ``(-1)**n a_n/a_0``), which centers them among the roots; if ``a_n == 0`` (a
    root at the origin) it falls back to half the Cauchy bound
    ``1 + max|a_i/a_0|``. Both are DERIVED from the coefficients -- there is no
    hand-tuned radius factor.
    """
    n = len(coeffs) - 1
    if n <= 0:
        return [], True, 0.0
    a0 = coeffs[0]

    def P(z):
        r = complex(a0, 0.0)
        for i in range(1, n + 1):
            r = r * z + coeffs[i]
        return r

    cauchy = 1.0 + max(abs(coeffs[i] / a0) for i in range(1, n + 1))
    an = coeffs[n]
    r0 = abs(an / a0) ** (1.0 / n) if an != 0 else 0.5 * cauchy
    if r0 == 0:
        r0 = 0.5 * cauchy

    z = [complex(r0 * math.cos(2.0 * math.pi * k / n + _DK_PHASE),
                 r0 * math.sin(2.0 * math.pi * k / n + _DK_PHASE))
         for k in range(n)]

    md = 0.0
    for _ in range(iters):
        md = 0.0
        for i in range(n):
            den = complex(a0, 0.0)
            for j in range(n):
                if j != i:
                    den *= (z[i] - z[j])
            if den == 0:
                den = complex(1e-18, 0.0)
            corr = P(z[i]) / den
            z[i] -= corr
            md = max(md, abs(corr))
        if md < tol:
            break

    max_res = max((abs(P(zi)) for zi in z), default=0.0)
    return z, md < tol, max_res


# ---------------------------------------------------------------------------
# Exact M==1 floor (Kronecker). A monic integer polynomial has Mahler measure
# exactly 1 iff every root is 0 or a root of unity -- equivalently, iff it is
# (up to a factor x^k) a product of cyclotomic polynomials. Decided over Z[x]
# with no roots, so the floor is immune to the Durand-Kerner float smear that
# nudges |root| slightly above 1 for repeated / cyclotomic spectra.
# ---------------------------------------------------------------------------

def _poly_div_exact(num: List[int], den: List[int]) -> Optional[List[int]]:
    """Exact division of integer polynomials (high->low). Returns the integer
    quotient iff the monic ``den`` divides ``num`` exactly, else None."""
    n, d = len(num), len(den)
    if d == 0 or den[0] != 1:
        return None
    if n < d:
        return [0] if not any(num) else None
    rem = list(num)
    qlen = n - d + 1
    quot = [0] * qlen
    for i in range(qlen):
        c = rem[i]
        if c == 0:
            continue
        quot[i] = c                      # den is monic: den[0] == 1
        for j in range(d):
            rem[i + j] -= c * den[j]
    if any(rem[qlen:]):
        return None
    return quot


_CYCLOTOMIC_CACHE: Dict[int, List[int]] = {}


def _cyclotomic(d: int) -> List[int]:
    """Cyclotomic polynomial Phi_d (high->low integer coeffs), built from the
    identity ``x^d - 1 = prod_{e | d} Phi_e``."""
    if d in _CYCLOTOMIC_CACHE:
        return _CYCLOTOMIC_CACHE[d]
    poly = [1] + [0] * (d - 1) + [-1]    # x^d - 1
    for e in range(1, d):
        if d % e == 0:
            poly = _poly_div_exact(poly, _cyclotomic(e))
    _CYCLOTOMIC_CACHE[d] = poly
    return poly


def _is_cyclotomic_product(coeffs: List[int]) -> bool:
    """True iff the integer polynomial ``coeffs`` (high->low) is, up to a factor
    ``x^k`` and a unit, a product of cyclotomic polynomials -- equivalently
    (Kronecker) iff its Mahler measure is exactly 1. Exact integer arithmetic."""
    c = [int(v) for v in coeffs]
    while len(c) > 1 and c[0] == 0:      # defensive: strip leading zeros
        c = c[1:]
    if not c or c[0] == 0:
        return False
    while len(c) > 1 and c[-1] == 0:     # strip x-factors (roots at 0 -> factor 1)
        c = c[:-1]
    deg = len(c) - 1
    if deg == 0:
        return True                      # reduced to a nonzero constant: M = 1
    if c[0] not in (1, -1):
        return False                     # non-monic up to sign: M >= |lead| > 1
    if abs(c[-1]) != 1:
        return False                     # |constant| = prod|roots| must be 1
    remaining = c if c[0] == 1 else [-v for v in c]   # normalize to monic +1
    dmax = 2 * deg * deg + 3             # phi(d) <= deg => d well below this
    d = 1
    while d <= dmax and len(remaining) - 1 > 0:
        phid = _cyclotomic(d)
        if len(phid) <= len(remaining):
            q = _poly_div_exact(remaining, phid)
            while q is not None:
                remaining = q
                if len(remaining) - 1 == 0:
                    break
                q = _poly_div_exact(remaining, phid)
        d += 1
    return len(remaining) == 1 and abs(remaining[0]) == 1


def mahler_measure(coeffs: List[int], iters: int = 300) -> float:
    """Mahler measure of an integer polynomial (coeffs high-to-low).

    M(p) = |lead| * prod_{|z|>1} |z|, from the Durand-Kerner roots. The integer
    coefficients are exact; the roots and the product are floating point.

    The M==1 floor is decided EXACTLY from the integer spectrum (Kronecker: M==1
    iff p is, up to x^k, a product of cyclotomics), so a repeated/cyclotomic
    polynomial like (x-1)^4 reports exactly 1.0 rather than the smeared
    1.0000770 the float product would give.
    """
    n = len(coeffs) - 1
    if n <= 0:
        return 1.0
    if (all(isinstance(c, int) for c in coeffs) and coeffs[0] in (1, -1)
            and _is_cyclotomic_product(coeffs)):
        return 1.0
    roots, _converged, _res = _durand_kerner(coeffs, iters=iters)
    m = abs(coeffs[0]) if coeffs[0] else 1.0
    for root in roots:
        m *= max(1.0, abs(root))
    return m


def eigenvalues(coeffs: List[int], iters: int = 300) -> list:
    """Approximate eigenvalues (roots of the charpoly) via Durand-Kerner.

    Returns a list of complex numbers. This is the floating-point display
    layer; trust integer invariants (det, trace, coefficients) for exact work.
    """
    roots, _converged, _res = _durand_kerner(coeffs, iters=iters)
    return roots


def weave(seed_coeffs: List[int], order: str = "high") -> Tuple[Matrix, List[int]]:
    """The closure: seed polynomial -> companion matrix -> charpoly -> companion.

    This is Phi = companion . charpoly. One pass. The returned polynomial
    should equal the input (Phi is idempotent on companion matrices).

    Parameters
    ----------
    seed_coeffs : list of int
        Monic integer polynomial coefficients.
    order : "high" or "low"
        Coefficient convention for the seed.

    Returns
    -------
    (Matrix, List[int])
        The companion matrix and its characteristic polynomial (high-to-low).
    """
    M = companion(seed_coeffs, order=order)
    p = charpoly(M)
    return M, p


def weave_n(seed_coeffs: List[int], n: int = 1, order: str = "high") -> List[Tuple[Matrix, List[int]]]:
    """Iterate the weave n times. Returns the full trace of (matrix, poly) pairs.

    Since Phi is idempotent, the second iteration should be a fixed point.
    The trace lets you VERIFY idempotence rather than assume it.
    """
    trace = []
    coeffs = list(seed_coeffs)
    for _ in range(n):
        M, p = weave(coeffs, order=order)
        trace.append((M, p))
        coeffs = p
        order = "high"  # after first pass, output is always high-to-low
    return trace


def classify(matrix: Matrix) -> Dict[str, Any]:
    """Classify a matrix by its forced invariants.

    Works for any N*N integer matrix. Returns a dictionary with:
      - trace, det (exact integers)
      - charpoly, minpoly (exact integer coefficient lists, high-to-low)
      - mahler (floating point)
      - derogatory (bool: deg(minpoly) < deg(charpoly))
      - unimodular (bool: |det| == 1)
      - n (matrix dimension)
    """
    n = len(matrix)
    cp = charpoly(matrix)
    mp = minpoly_faddeev_leverrier(matrix)
    det_val = cp[-1] * ((-1) ** n)  # det = (-1)^n * c_0
    trace_val = -cp[1] if n >= 1 else 0  # trace = -c_{n-1}
    m = mahler_measure(cp)
    return {
        "n": n,
        "trace": trace_val,
        "det": det_val,
        "charpoly": cp,
        "minpoly": mp,
        "mahler": m,
        "derogatory": (len(mp) - 1) < (len(cp) - 1),
        "unimodular": abs(det_val) == 1,
    }


# ---------------------------------------------------------------------------
# Shared exact integer/rational matrix helpers. These were copy-pasted (with
# minor drift) across kira_matrix_modules, ax_smoke_matrix, boot_product, and
# sigma_mu_matrix; this is now their single home.
# ---------------------------------------------------------------------------

def mat_mul(A: Matrix, B: Matrix) -> Matrix:
    """Exact integer/Fraction matrix product ``A @ B`` (any conformable shapes)."""
    m = len(B)
    p = len(B[0]) if B else 0
    return [[sum(A[i][k] * B[k][j] for k in range(m)) for j in range(p)]
            for i in range(len(A))]


def mat_add(A: Matrix, B: Matrix) -> Matrix:
    """Elementwise sum ``A + B`` (same shape)."""
    return [[A[i][j] + B[i][j] for j in range(len(A[0]))] for i in range(len(A))]


def trace(M: Matrix) -> int:
    """Sum of the diagonal (exact)."""
    return sum(M[i][i] for i in range(len(M)))


def mat_pow(A: Matrix, k: int) -> Matrix:
    """``A**k`` for ``k >= 0`` by repeated squaring (``A**0`` = identity)."""
    if k < 0:
        raise ValueError("mat_pow requires k >= 0 (no integer inverse)")
    n = len(A)
    result: Matrix = [[1 if i == j else 0 for j in range(n)] for i in range(n)]
    base = [row[:] for row in A]
    while k > 0:
        if k & 1:
            result = mat_mul(result, base)
        k >>= 1
        if k:
            base = mat_mul(base, base)
    return result


if __name__ == "__main__":
    # The golden seed: x^2 - x - 1, coefficients [1, -1, -1] (high-to-low).
    phi_seed = [1, -1, -1]
    M, p = weave(phi_seed, order="high")
    inv = classify(M)

    print("L00M")
    print(f"  seed:      x^2 - x - 1  (the golden ratio)")
    print(f"  companion: {M}")
    print(f"  charpoly:  {inv['charpoly']}")
    print(f"  minpoly:   {inv['minpoly']}")
    print(f"  trace={inv['trace']}  det={inv['det']}  mahler={inv['mahler']:.6f}  "
          f"derogatory={inv['derogatory']}  unimodular={inv['unimodular']}")
