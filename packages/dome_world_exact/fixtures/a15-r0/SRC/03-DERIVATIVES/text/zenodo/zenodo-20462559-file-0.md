---
derivative_id: derivative:f558e4b19de8ac70ebaea4d8
parent_capture_id: capture:cb40b010e2f339b9bf1d08ae
parent_blob_sha256: 7e9ec1ab7d88b769adad7a6cd8705ab576ad034c79e105426cae5660f8d68fd1
tool: PyMuPDF-native/1
source_title: "CORRELATION VS CAUSATION IN SOCIOTECHNICAL SYSTEMS: .pdf"
---

CORRELATION VS CAUSATION IN SOCIOTECHNICAL

SYSTEMS:

THE SIGNALRUPTURE CAUSAL SEPARATION

THEOREM

(SR-CST)

A Formal Distinction Between Drift Co-Movement and Drift Propagation Under

the

SR-CAF

Substrate

Abstract Most sociotechnical research relies on correlation-based metrics to infer system behavior. Correlation

can

identify

co-movement

between

variables,

institutions,

or

subsystems,

but

it

cannot

by

itself

distinguish

shared

variation

from

causal

propagation.

Building

upon

the

SignalRupture

Core

Axiomatic

Framework

(SR-CAF),

this

paper

introduces

the

SignalRupture

Causal

Separation

Theorem

(SR-CST),

which

formalizes

the

distinction

between

drift

correlation

and

drift

propagation.

Under SR-CAF’s assumptions regarding identifiability, bounded noise, stable dynamics, and persistent

excitation,

drift-transfer

φ

represents

a

recoverable

operator

describing

directional

propagation

across

subsystems.

The

theorem

demonstrates

that

covariance-based

methods

alone

cannot

recover

propagation

structure

because

covariance

is

fundamentally

symmetric

whereas

propagation

is

directional.

Under SR-CAF’s assumptions regarding identifiability, bounded noise, stable dynamics, and persistent

excitation,

drift-transfer

φ

represents

a

recoverable

operator

describing

directional

propagation

across

subsystems.

The

theorem

demonstrates

that

covariance-based

methods

alone

cannot

recover

propagation

structure

because

covariance

is

fundamentally

symmetric

whereas

propagation

is

directional.

An

empirical

illustration

drawn

from

financial

contagion

during

the

2007–2009

Global

Financial

Crisis

demonstrates

the

practical

distinction

between

co-movement

and

propagation.

SR-CST

therefore

establishes

a

formal

and

empirically

anchored

distinction

between

drift

correlation

and

drift

causation

within

sociotechnical

systems.

Keywords: SignalRupture; causality; correlation; drift transfer; sociotechnical systems; governance;

institutional

instability;

causal

inference;

propagation

dynamics.

1. Introduction Correlation-based analysis dominates contemporary institutional, organizational, and sociotechnical

research.

Statistical

associations

are

routinely

used

to

identify

patterns,

estimate

relationships,

and

evaluate

system

behavior.

However, correlation alone cannot establish: ● directional influence; ● propagation pathways; ● causal structure; ● mechanisms of instability transmission. Two institutions may exhibit similar behavior without influencing one another. Conversely, one subsystem

may

exert

substantial

influence

upon

another

even

when

simple

correlation

measures

fail

to

reveal

the

propagation

pathway.

The SignalRupture framework addresses this limitation through the concept of drift-transfer. Within

SR-CAF,

drift-transfer

represents

the

mechanism

through

which

instability

propagates

across

interconnected

systems.

This paper formalizes the distinction between correlation and causation through the SignalRupture

Causal

Separation

Theorem

(SR-CST).

To demonstrate the practical relevance of the theorem, the paper examines financial contagion during

the

Global

Financial

Crisis

as

an

empirical

illustration

of

the

distinction

between

covariance

and

propagation.

The

crisis

provides

a

well-studied

example

in

which

institutions

exhibited

strong

co-movement

while

the

actual

transmission

of

instability

depended

upon

directional

exposure

relationships

that

could

not

be

recovered

through

correlation

alone.

The theorem proposes that correlation identifies co-movement, while drift-transfer identifies propagation.

2. Background: The Limits of Correlation Correlation measures statistical association. Formally, covariance and correlation identify shared variation among variables: Cov(Di, Dj) Such measures provide information regarding:

● co-movement; ● association; ● shared variance. However, correlation alone cannot determine: ● whether Di influences Dj; ● whether Dj influences Di; ● whether both respond to a common external factor; ● whether propagation occurs through a larger network structure. As a result, correlation-based analysis cannot distinguish between: “A and B drift together” and “A’s drift contributes to B’s drift.” This limitation motivates the need for causal recovery frameworks.

3. SR-CAF as a Causal Foundation SR-CAF introduced four foundational primitives: ● Drift D(t) ● Visibility Lag Δ V ● Harm H ● Drift-Transfer φ Within the framework, drift-transfer represents directional propagation between subsystems. Prior SR-CAF results establish: ● identifiability conditions for drift-transfer; ● recoverability under bounded noise; ● consistency of estimation; ● representation equivalence across multiple model classes. These results provide the theoretical foundation upon which SR-CST is constructed.

4. Correlation Cannot Recover Propagation Structure Covariance-based methods possess several structural limitations. First, covariance is symmetric: Cov(Di, Dj) = Cov(Dj, Di) Second, propagation is directional. Third, covariance combines: ● shared shocks; ● common environments; ● indirect interactions; ● genuine propagation effects. Consequently: Cov(Di, Dj) ≠ φ i→j Covariance may indicate association, but it cannot uniquely identify directional transfer. This constitutes the central limitation of correlation-only approaches to sociotechnical instability.

5. Causal Recovery Under SR-CAF SR-CAF proposes that propagation structure can be recovered through dynamic system relationships

rather

than

covariance

alone.

Under the framework: D(t+1) = Φ D(t) + ε( t) the operator Φ represents directional transfer relationships among subsystems. Under appropriate identifiability conditions, propagation structure may be estimated from system dynamics.

Within SR terminology, this propagation structure is represented through drift-transfer φ. Thus, correlation and propagation become analytically distinct objects.

6. Theorem 11 — SignalRupture Causal Separation Theorem

(SR-CST)

Theorem Statement Under the SR-CAF assumptions of bounded noise, stable dynamics, persistent excitation, and operator

identifiability:

1. Covariance measures drift co-movement but does not identify directional propagation. 2. Drift-transfer φ represents directional propagation between subsystems. 3. Covariance alone is insufficient to recover φ. 4. Under SR-CAF identifiability conditions, φ may be estimated from system dynamics. Formally: Cov(D) ⇏ φ while D(t+1) = Φ D(t) + ε( t) permits recovery of propagation structure under the SR-CAF recovery framework.

7. Interpretation In plain language: ● Correlation tells us that subsystems move together. ● Drift-transfer tells us how instability propagates. ● Correlation is symmetric. ● Propagation is directional. ● Correlation is descriptive. ● Drift-transfer is causal. The theorem therefore separates observed association from generative influence. It does not claim that every observed correlation reflects causal propagation. Rather, it establishes that propagation requires causal structure beyond covariance alone.

8. Implications for Existing Literature

SR-CST does not invalidate correlation-based research. Instead, it identifies a limitation shared by all covariance-based methods. Correlation remains valuable for: ● pattern detection; ● exploratory analysis; ● system monitoring. However, correlation alone cannot recover propagation structure. The theorem therefore positions drift-transfer as a complementary causal layer that extends beyond

descriptive

association.

9. Falsification Conditions The theorem would be challenged if: ● directional propagation cannot be recovered under SR-CAF assumptions; ● covariance alone fully explains propagation structure; ● drift-transfer fails to converge across equivalent representations; ● empirical systems consistently exhibit non-directional propagation dynamics. These conditions make the theorem open to empirical evaluation and potential falsification.

10. Empirical Illustration: Financial Contagion And The Limits

Of

Correlation

The distinction between correlation and causation is empirically illustrated by the Global Financial

Crisis.

Prior to the crisis, major financial institutions exhibited strong positive correlations across asset values,

leverage

ratios,

liquidity

conditions,

and

market

performance.

Conventional

covariance-based

analysis

successfully

detected

co-movement

among

institutions

but

could

not

determine

the

mechanisms

responsible

for

that

co-movement.

Formally, \mathrm{Cov}(D_i,D_j)>0 demonstrates that two subsystems share variation. However, covariance alone cannot determine

whether:

● institution i influences institution j; ● institution j influences institution i; ● both institutions respond to a common external shock; ● instability propagates through a larger network structure. Following the crisis, extensive research in financial contagion and systemic risk demonstrated that

instability

propagated

through

directional

exposure

networks

involving:

● interbank lending; ● liquidity dependencies; ● derivative contracts; ● counterparty obligations; ● funding relationships. The failure of Lehman Brothers provides a particularly important example. Prior to its collapse, covariance-based measures identified widespread co-movement among financial

institutions.

However,

identifying

the

pathways

through

which

stress

spread

required

reconstruction

of

directional

exposure

relationships

rather

than

observation

of

covariance

alone.

In SR terminology, market correlations measured shared instability while propagation occurred through

directional

transfer

structures

analogous

to

drift-transfer

\phi.

Thus, \mathrm{Cov}(D)\not\Rightarrow\phi because covariance identifies association but not transmission. The Global Financial Crisis therefore demonstrates that co-movement and propagation are distinct

phenomena.

Institutions

may

exhibit

strong

statistical

association

without

directly

transmitting

instability

to

one

another.

Conversely,

highly

connected

institutions

may

function

as

propagation

nodes

whose

systemic

importance

is

not

fully

captured

through

covariance

measures

alone.

Under the SR-CST framework, financial contagion constitutes an empirical example of directional

drift-transfer

operating

within

a

complex

sociotechnical

network.

11. Corollary: Contagion–Propagation

Distinction

In networked sociotechnical systems, high covariance between subsystems is insufficient evidence

of

causal

propagation.

Multiple propagation structures may generate similar covariance patterns, while directional transfer

relationships

generate

distinct

propagation

pathways.

Therefore: \mathrm{Cov}(D_i,D_j) cannot uniquely identify: \phi_{i\rightarrow j} without additional causal recovery procedures. The experience of the Global Financial Crisis demonstrates this distinction: correlation identified co-movement

among

institutions,

but

exposure-network

analysis

was

required

to

identify

contagion

pathways

and

transmission

mechanisms.

12. Conclusion The SignalRupture Causal Separation Theorem formalizes a distinction between correlation and causation

within

sociotechnical

systems.

Correlation

identifies

co-movement,

while

drift-transfer

identifies

propagation.

The theorem demonstrates that covariance alone is insufficient for recovering directional instability

pathways

because

covariance

measures

association

whereas

propagation

reflects

transmission

structure.

Under

SR-CAF’s

identifiability

conditions,

drift-transfer

provides

a

recoverable

representation

of

how

instability

moves

between

subsystems.

The empirical illustration drawn from financial contagion during the Global Financial Crisis reinforces

this

distinction.

Financial

institutions

displayed

strong

co-movement,

yet

understanding

contagion

required

reconstruction

of

directional

exposure

networks

rather

than

covariance

measures

alone.

The

case

demonstrates

that

observing

instability

is

not

equivalent

to

understanding

how

instability

spreads.

Within the broader SignalRupture architecture, SR-CST serves as a methodological bridge between

observable

drift

patterns

and

the

causal

structures

responsible

for

their

propagation.

By

distinguishing

co-movement

from

transmission,

the

theorem

establishes

a

substrate-level

framework

for

analyzing

instability

across

governance,

institutional,

economic,

and

sociotechnical

systems.

11. Canonical Paragraph Correlation describes co-movement; causation describes propagation. The SignalRupture Causal

Separation

Theorem

formalizes

this

distinction

by

showing

that

drift

covariance,

regardless

of

its

statistical

strength,

cannot

by

itself

reveal

the

directional

structure

through

which

instability

spreads.

Under

the

SR-CAF

substrate,

drift-transfer

φ

represents

the

recoverable

propagation

structure

that

separates

descriptive

association

from

generative

influence.

Correlation

captures

what

subsystems

share,

while

drift-transfer

captures

how

instability

moves

between

them.

In

this

sense,

correlation

observes

the

surface

of

system

behavior,

whereas

drift-transfer

seeks

to

recover

the

mechanisms

beneath

it.

SR-CST

therefore

establishes

a

formal

boundary

between

co-movement

and

propagation

within

sociotechnical

systems.The

distinction

mirrors

empirical

observations

in

financial

contagion,

where

covariance

revealed

co-movement

among

institutions

while

exposure

networks

revealed

the

pathways

through

which

instability

propagated.
