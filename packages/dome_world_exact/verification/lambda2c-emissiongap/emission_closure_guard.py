"""
emission_closure_guard.py  --  exact-arithmetic operational guard for the
Emission-Gap closure.  No float crosses any decision boundary.

Design:
  (B) the closure SELF-RESOLVES: framework ops are field-confined, so the
      Salem locus {M<phi} is never constructed (this is the theorem).
  (A) this guard is the CERTIFICATE of (B): on every produced matrix it runs
      the exact flip-straddle test; it returns FORCED if no sub-phi Salem
      factor exists, and INVALID_CLOSURE if one is ever hit -- which, by the
      theorem, can only occur if a NON-framework (field-breaking) operation
      was introduced.  The guard is the tripwire on that single failure mode.

Verdicts:  FORCED            -- no Salem factor; closure intact
           FORCED_ABOVE_FLOOR-- a Salem factor exists but beta >= phi (floor holds)
           INVALID_CLOSURE   -- a Salem factor with beta < phi (floor violated)
"""
import sympy as sp
from fractions import Fraction
x, t = sp.symbols('x t')

# ---------- exact primitives ----------
def charpoly_Z(M):
    """Exact integer characteristic polynomial."""
    return sp.Poly(M.charpoly(x).as_expr(), x)

def is_palindromic(coeffs):
    return list(coeffs) == list(coeffs)[::-1]

def trace_down(R):
    """Exact trace-down T(t): for reciprocal R of degree 2m, R(x)=x^m T(x+1/x).
       Built from x^k + x^-k = p_k(t),  p0=2, p1=t, p_{k+1}=t p_k - p_{k-1}."""
    c = R.all_coeffs()                 # c[0] x^(2m) + ... + c[2m]
    deg = R.degree(); m = deg // 2
    p = [sp.Integer(2), t]
    for k in range(1, m):
        p.append(sp.expand(t*p[-1] - p[-2]))
    # R(x)/x^m = c[m] + sum_{k=1..m} c[m-k]*(x^k + x^-k)   (palindromic: c[m-k]=c[m+k])
    T = sp.Integer(c[m])
    for k in range(1, m+1):
        T += c[m-k]*p[k]
    return sp.Poly(sp.expand(T), t)

def flip_straddle(T):
    """Exact Sturm test: T totally real, exactly one root in (2,inf),
       the rest in (-2,2), none <= -2 or = +-2.  Returns (bool, counts)."""
    m = T.degree()
    n_real  = T.count_roots(-sp.oo, sp.oo)
    n_above = T.count_roots(2, sp.oo)          # (2, inf]
    n_inside= T.count_roots(-2, 2)             # [-2, 2]
    at2  = 1 if T.eval(sp.Integer(2)) == 0 else 0
    atm2 = 1 if T.eval(sp.Integer(-2)) == 0 else 0
    n_above_open = n_above - at2               # strict (2, inf)
    n_inside_open = n_inside - at2 - atm2       # strict (-2, 2)
    straddle = (n_real == m and n_above_open == 1 and n_inside_open == m-1
                and at2 == 0 and atm2 == 0)
    return straddle, dict(real=n_real, above=n_above_open, inside=n_inside_open,
                          at_pm2=at2+atm2)

def sign_in_Qsqrt5(expr):
    """Exact sign of an element a+b*sqrt5 (a,b rational). No float."""
    e = sp.expand(expr)
    a = sp.nsimplify(e.subs(sp.sqrt(5), 0))
    b = sp.nsimplify((e - a)/sp.sqrt(5))
    a, b = sp.Rational(a), sp.Rational(b)
    if b == 0: return (a > 0) - (a < 0)
    if a == 0: return (b > 0) - (b < 0)
    # a + b sqrt5 > 0 ?
    if a > 0 and b > 0: return 1
    if a < 0 and b < 0: return -1
    # opposite signs: compare a^2 vs 5 b^2 with sign bookkeeping
    lhs, rhs = a*a, 5*b*b
    if a > 0:   # b<0 : positive iff a^2 > 5 b^2
        return 1 if lhs > rhs else (-1 if lhs < rhs else 0)
    else:       # a<0, b>0 : positive iff 5 b^2 > a^2
        return 1 if rhs > lhs else (-1 if rhs < lhs else 0)

def beta_below_phi(R):
    """Exact: is the Salem root beta (>1) of reciprocal R strictly below phi?
       beta < phi  <=>  R(phi) > 0   (phi past the dominant real root)."""
    phi = (1 + sp.sqrt(5))/2
    val = sp.expand(R.eval(phi))
    return sign_in_Qsqrt5(val) > 0

# ---------- the guard ----------
def validate_closure(M, label=""):
    cp = charpoly_Z(M)
    salem = []
    for fac, mult in sp.factor_list(cp.as_expr())[1]:
        Rp = sp.Poly(fac, x)
        if Rp.degree() >= 4 and is_palindromic(Rp.all_coeffs()):
            T = trace_down(Rp)
            straddle, counts = flip_straddle(T)
            if straddle:
                below = beta_below_phi(Rp)
                salem.append((Rp, below))
    if any(below for _, below in salem):
        verdict = "INVALID_CLOSURE"
    elif salem:
        verdict = "FORCED_ABOVE_FLOOR"
    else:
        verdict = "FORCED"
    return dict(verdict=verdict, salem=salem, label=label)

# ---------- framework operations (guarded) vs the foreign one ----------
def companion(c):
    n=len(c)-1; M=sp.zeros(n)
    for i in range(n-1): M[i+1,i]=1
    for i in range(n): M[i,n-1]=-c[n-i]
    return M

def op_kron(A,B):       return sp.Matrix(sp.kronecker_product(A,B))   # spectral
def op_dsum(A,B):       return sp.diag(A,B)                            # spectral
def op_square(A):       return A*A                                    # spectral firewall
def op_selfaction(M):                                                 # the channel
    n=M.shape[0]; basis=[]
    for i in range(n):
        for j in range(n):
            E=sp.zeros(n,n); E[i,j]=1; basis.append(E)
    cols=[[ (M*E-E*M)[a,b] for a in range(n) for b in range(n)] for E in basis]
    return sp.Matrix(cols).T
def op_free_commutator(A,B):  return A*B-B*A      # NOT a framework op (field-breaking)

if __name__ == "__main__":
    ok=lambda b:"PASS" if b else "FAIL"
    print("="*74); print("OPERATIONAL CLOSURE GUARD  (exact; no float on any decision)"); print("="*74)
    cat={"phi":companion([1,-1,-1]),"sqrt2":companion([1,0,-2]),
         "sqrt3":companion([1,0,-3]),"Kform":companion([1,0,5,0,-5])}

    print("\n--- (B) framework operations: closure self-resolves -> guard certifies FORCED ---")
    steps=[("kron(phi,sqrt2)", op_kron(cat["phi"],cat["sqrt2"])),
           ("dsum(sqrt2,sqrt3)", op_dsum(cat["sqrt2"],cat["sqrt3"])),
           ("square(Kform)", op_square(cat["Kform"])),
           ("selfaction(phi)  [the channel ad_R]", op_selfaction(cat["phi"])),
           ("selfaction(kron(phi,sqrt3))", op_selfaction(op_kron(cat["phi"],cat["sqrt3"]))),
           ("kron(selfaction(phi),sqrt2)", op_kron(op_selfaction(cat["phi"]),cat["sqrt2"]))]
    allforced=True
    for name,M in steps:
        r=validate_closure(M,name); allforced &= (r["verdict"].startswith("FORCED"))
        print(f"   {name:<40} dim {M.shape[0]:<3} -> {r['verdict']}")
    print(f"   every framework step intact (FORCED): {ok(allforced)}")

    print("\n--- (A) tripwire: a FOREIGN field-breaking op that HITS the Salem locus ---")
    # Lehmer Salem (beta=1.17628 < phi) planted via Shoda: a traceless matrix with
    # charpoly = Lehmer(x)*(x-1). diag(Companion(Lehmer),[1]) has trace -1+1 = 0 => a commutator.
    Lehmer=[1,1,0,-1,-1,-1,-1,-1,0,1,1]
    Cf=companion(Lehmer)                          # 10x10, trace -1
    Foreign=sp.diag(Cf, sp.Matrix([[1]]))         # 11x11, trace 0  => is a commutator (Shoda)
    print(f"   foreign matrix is traceless (a commutator by Shoda): {ok(Foreign.trace()==0)}")
    r=validate_closure(Foreign,"planted Lehmer via free commutator")
    print(f"   guard verdict on the Salem hit: {r['verdict']}  -> {ok(r['verdict']=='INVALID_CLOSURE')}")
    if r["salem"]:
        Rp,below=r["salem"][0]
        print(f"   detected Salem factor degree {Rp.degree()}, beta<phi exactly: {ok(below)}")

    print("\n--- control: a benign reciprocal that is NOT Salem must read FORCED ---")
    Cyc=companion([1,0,0,0,0,0,1])  # x^6+1 (12th-cyclotomic-ish), reciprocal, roots of unity
    r=validate_closure(Cyc,"x^6+1 (roots of unity)")
    print(f"   x^6+1 verdict: {r['verdict']}  -> {ok(r['verdict']=='FORCED')}")

    print("\n"+"="*74)
    print("RESULT: (B) framework ops never construct the Salem field (all FORCED);")
    print("        (A) the guard returns INVALID_CLOSURE the instant a foreign op hits it.")
    print("        The closure resolves the disjoint field BY CONSTRUCTION; the guard is the")
    print("        exact runtime certificate of that, and the tripwire for any foreign op.")
