---
derivative_id: derivative:ca441e83c39d04dda62f36a2
parent_capture_id: capture:aeb09a588a4b031e0619fa9a
parent_blob_sha256: 599071d13739447b825b923d8481370a4b75304accecd5fffed42751855d9399
tool: PyMuPDF-native/1
source_title: "RECURSIVE DISCRIMINATION AMPLIFICATION .pdf"
---

RECURSIVE DISCRIMINATION AMPLIFICATION A Cross-Domain Empirical Test of Closed-Loop Institutional AI

Policing · Banking · Healthcare · Criminal-Legal Risk Assessment SignalRupture (SR) · 2026 FIELD POSITION This paper tests a specific dynamic hypothesis inside SignalRupture System Inheritance

Studies.

Artificial

intelligence

may

inherit

disparities

already

encoded

in

institutional

data,

but

inheritance

alone

does

not

imply

amplification.

Amplification

requires

a

second

mechanism:

the

AI-assisted

decision

must

alter

the

environment

that

generates

future

observations,

those

observations

must

return

to

the

system,

and

repeated

model

use

or

updating

must

preserve

or

intensify

the

disparity. Inheritance ≠ Amplification Closed Feedback + Endogenous Data + Repeated Use/Updating → Amplification

becomes

possible

Abstract The paper tests whether institutional AI can convert inherited disparity into recursively amplified

disparity

across

predictive

policing,

credit/lending,

healthcare

allocation,

and

criminal-legal

risk

assessment.

The

test

separates

four

concepts

that

are

frequently

conflated:

initial

inheritance,

feedback

closure,

distributional

drift,

and

disparity

amplification.

Evidence

is

graded

by

domain.

Predictive

policing

provides

the

strongest

direct

support:

mathematical

and

empirical

simulation

work

demonstrates

runaway

feedback

when

deployment

determines

where

incidents

are

discovered

and

discovered

incidents

are

reused

in

future

allocation.

Banking

provides

strong

evidence

of

selective

labels

and

censored

feedback—loan

denials

hide

counterfactual

repayment

outcomes—but

prominent

mortgage

evidence

also

finds

FinTech

discrimination

lower

than

face-to-face

discrimination,

rejecting

universal

amplification.

Healthcare

provides

strong

empirical

evidence

of

inherited

disparity

through

biased

proxy

targets

and

separate

experimental/simulation evidence that model-guided clinical decisions can alter future labels

and

cause

model

degradation

under

retraining;

direct

longitudinal

racial-amplification

evidence

remains

limited.

Criminal-legal

risk

assessment

has

strong

theoretical

and

simulation

evidence

that

repeat

scoring

can

compound

small

biases,

and

partial-feedback

research

explicitly

models

recidivism

decisions

as

feedback

systems,

but

real-world

longitudinal

causal

evidence

of

algorithm-induced

racial

amplification

remains

insufficient.

The

cross-domain

result

therefore

confirms

the

mechanism

but

rejects

a

universal

outcome

claim:

closed-loop

institutional

AI

can

amplify

inherited

disparities

under

identifiable

conditions,

but

can

also

attenuate

them

or

remain

approximately

stable.

1. The Hypothesis H1: Historical/Institutional Disparity → Data → AI Inheritance H2: AI Decision_t → Environment_t+1 → Observed Data_t+1 H3: Observed Data_t+1 → Repeated Model Use / Retraining H4: |Δ_ t+1| > |Δ_ t| under some closed-loop conditions H1 is inheritance. H2-H3 establish feedback closure. H4 is amplification. The paper requires

evidence

for

each

stage

separately.

2. Core Dynamic Model Let Δ_ t be the disparity in an outcome, allocation, error rate, or exposure between a focal

group

and

a

comparison

group

at

time

t.

Let

λ

represent

initial

inheritance

from

the

institutional

substrate.

Let

F_t

represent

feedback

closure,

D_t

distributional

drift

induced

by

the

decision

environment,

and

C_t

corrective

monitoring

or

intervention. Δ_ t+1 = λΔ_0 + ρ_ t Δ_ t - κ C_t + ε_ t ρ_ t = ρ_0 + γ F_tD_t This is a test architecture, not an estimated universal law. The sign and magnitude of γ must

be

measured.

Drift

alone

does

not

imply

discrimination;

feedback

alone

does

not

imply

amplification.

3. Amplification Ratio

AR_t = |Δ_ t+1| / |Δ_ t| AR Interpretation AR < 1 attenuation AR ≈ 1 persistence/inheritance AR > 1 recursive amplification A repeated-use system can therefore be fairer at deployment and still become less fair over

time,

or

biased

at

deployment

and

become

more

equitable

after

correction.

Dynamic

measurement

is

required.

4. Feedback Closure Index SR operationalizes feedback closure using four observable edges: decision impact on environment,

effect

of

environment

on

future

labels/data,

reuse

of

those

data,

and

repeated

updating

or

decision

reuse. FCI = (A + E + R + U) / 4 Component Question A — Action impact Does the model-supported decision alter access, exposure, treatment, surveillance, capital, or liberty? E — Endogenous observation Does that altered environment affect what outcomes are observed? R — Reuse Do those observations enter later scoring, training, validation, or decision rules? U — Updating/repetition Is the process repeated over time or across sequential decisions? FCI is a screening measure. It does not prove amplification. A high FCI identifies where

dynamic

amplification

should

be

tested.

5. Evidence Standard Level Evidence E0 conceptual possibility only E1 mechanism established theoretically or by simulation

E2 real-world one-shot inherited disparity or selective-feedback evidence E3 observed repeated-use feedback affecting model/data behavior E4 longitudinal causal evidence that group disparity itself amplifies because of the loop The distinction prevents simulated feedback amplification from being described as proven

real-world

discriminatory

amplification.

6. Domain I — Predictive Policing Predictive policing provides the strongest evidence for the closed-loop mechanism. Ensign

et

al.

model

systems

in

which

discovered

crime

or

arrest

data

update

future

police

allocation.

Because

deployment

changes

where

police

observe

offenses,

observed

incidents

are

endogenous

to

prior

allocation.

Their

mathematical

model

and

empirical

simulations

produce

runaway

feedback

loops

in

which

police

are

repeatedly

sent

to

the

same

neighborhoods

even

when

underlying

crime

does

not

justify

the

degree

of

concentration. Prediction → Deployment → Discovery → Data → Prediction The study also shows that resident-reported crime can attenuate the runaway process because

it

supplies

information

less

dependent

on

algorithm-directed

police

presence,

but

it

does

not

automatically

eliminate

the

loop. This is the cleanest SR feedback closure case because the algorithm's action changes its own

evidence-generating

environment.

7. Policing Evidence Classification Stage Evidence status Inheritance plausible/empirically supported through historical arrest and enforcement data, but varies by dataset Feedback closure strong: deployment determines discovered incidents Repeated reuse explicit in predictive-policing architecture studied by Ensign et al. Amplification strong E1: mathematically/simulation demonstrated runaway amplification Real-world group-disparity amplification not yet universal E4; field deployments require system-specific longitudinal data

Policing verdict: Mechanism CONFIRMED; universal real-world disparity amplification

NOT

CONFIRMED

8. Domain II — Banking and Credit Banking produces a different feedback architecture. When a lender denies credit, the counterfactual

repayment

outcome

is

never

observed.

Kilbertus

et

al.

formalize

this

selective-label

problem:

predictive

training

data

contain

outcomes

primarily

for

those

who

received

favorable

past

decisions.

Keswani

et

al.

show

that

credit

settings

with

partial

feedback

can

systematically

omit

outcomes

for

previously

rejected

applicants,

and

propose

exploration

to

recover

missing

information. Score → Approval/Denial → Repayment Observed Only If Approved → Future

Training

Data

This is feedback closure through selection rather than through surveillance. 9. Banking Counterevidence Is Crucial The strongest large mortgage study does not support universal amplification. Bartlett et al.

find

racial/ethnic

pricing

discrimination

in

both

traditional

and

FinTech

lending,

but

estimate

FinTech

discrimination

to

be

about

40%

lower

than

face-to-face

discrimination;

in

their

data,

FinTech

lenders

did

not

discriminate

in

approval

decisions. Algorithmic mediation can attenuate inherited discrimination. This is a hard counterexample to any SR claim that moving discrimination into algorithms

necessarily

increases

it.

10. Banking Dynamic Prediction Recursive amplification remains possible when credit decisions materially change future

financial

capacity

and

the

resulting

outcomes

are

reused.

For

example,

denial

can

constrain

investment

or

liquidity,

while

approval

creates

an

observable

repayment

record.

But

the

empirical

literature

located

for

this

paper

establishes

the

selective-label

mechanism

more

strongly

than

longitudinal

group-disparity

amplification.

Banking verdict: Inheritance/selection mechanism CONFIRMED; universal recursive

amplification

DENIED;

longitudinal

amplification

remains

TESTABLE

11. Domain III — Healthcare Allocation Healthcare provides the strongest empirical inheritance case. Obermeyer et al. studied a commercial

population-health

algorithm

affecting

millions

of

patients.

At

equal

risk

scores,

Black

patients

were

substantially

sicker

than

White

patients.

Correcting

the

disparity

would

have

increased

the

share

of

Black

patients

receiving

additional

help

from

17.7%

to

46.5%.

The

mechanism

was

the

target:

the

algorithm

predicted

health-care

cost

rather

than

illness,

while

unequal

access

caused

lower

spending

on

Black

patients

at

comparable

levels

of

need. Unequal Access → Lower Historical Cost → Proxy Target → Lower Algorithmic

Priority

This is direct System Inheritance: an apparently neutral proxy encoded the institutional history

of

unequal

access.

12. Healthcare Feedback Evidence Separate machine-learning research establishes that healthcare decision support can close

a

feedback

loop.

Adam

et

al.

simulate

settings

in

which

clinicians

act

on

imperfect

model

predictions

and

future

labels

are

altered

by

those

actions.

Under

full

adoption

in

their

modeled

setting,

repeated

updates

can

cause

false-positive

rates

to

grow

uncontrollably.

Feng

et

al.

show

that

healthcare

model

monitoring

is

complicated

by

performativity

because

high-risk

predictions

prompt

prophylactic

treatment,

changing

the

adverse

outcome

the

model

is

supposed

to

predict. Risk Prediction → Treatment → Outcome Changed → Future Label → Monitoring/Retraining

Boeken et al. further show that naive retraining of decision-support systems can be biased

when

the

prediction

affects

the

target,

explicitly

naming

healthcare

and

law

among

high-stakes

performative

settings.

13. Healthcare Evidence Classification Stage Evidence status Inherited racial disparity strong E2/E3 empirical evidence from Obermeyer et al. Feedback closure strong theoretical/simulation and methodological evidence Model degradation under repeated updating demonstrated in simulation Racial disparity amplification through the feedback loop not directly established longitudinally in the cited healthcare evidence Healthcare verdict: Inheritance CONFIRMED; feedback mechanism CONFIRMED;

racial

amplification

via

loop

NOT

YET

CONFIRMED

14. Domain IV — Criminal-Legal Risk Assessment Criminal-legal risk assessment differs from predictive policing because the model commonly

scores

people

rather

than

places.

Yet

the

decision

can

still

affect

the

target:

detention,

supervision

intensity,

treatment

requirements,

or

incarceration

may

change

later

opportunities,

detection

exposure,

and

recorded

recidivism. Risk Score → Detention/Supervision → Future Exposure/Behavior/Detection

→

Recidivism

Label

Ensign et al.'s limited-feedback work explicitly treats recidivism prediction as a setting in

which

decisions

influence

what

future

training

data

become

observable.

Laufer's

repeat-use

criminal-risk

simulations

further

show

that

very

small

initial

biases

can

compound

over

sequential

risk-based

decisions

and

become

observable

group

differences

after

repeated

iterations. The available repeat-use amplification evidence is primarily theoretical/simulation-based

rather

than

a

randomized

or

quasi-experimental

longitudinal

evaluation

of

a

deployed

risk

instrument.

15. Criminal-Legal Evidence Classification Stage Evidence status Historical/institutional disparity well documented broadly; system-specific inheritance must be established per instrument

Feedback closure theoretically strong; decision can affect future observed outcomes Sequential amplification E1 simulation evidence Field-level causal group amplification insufficient evidence for a universal claim Criminal-legal verdict: Recursive mechanism SUPPORTED; real-world discriminatory

amplification

remains

UNCONFIRMED

16. Cross-Domain Result Domain Inheritance Feedback closure Repeated-use amplification evidence Counterevidence Overall verdict Predictive policing Moderate/strong depending on data Strong Strong theory/simulation reporting/substitution can attenuate Best-confirmed amplification mechanism Banking/credit Strong disparity/selective-label evidence Strong selective feedback Limited direct longitudinal group amplification FinTech discrimination ~40% lower than face-to-face in major mortgage study Amplification not general Healthcare Strong empirical inheritance Strong performative mechanism Model degradation simulated; group amplification not longitudinally established target redesign can remove major bias Inheritance strong; amplification conditional Criminal-legal risk System-specific Strong conceptual/partial-feedback mechanism Repeat-use amplification simulated human/algorithmic interventions can attenuate Mechanism plausible; E4 evidence lacking

17. The Universal Claim Fails AI → Discrimination Amplification [REJECTED as a universal claim] The banking evidence alone is enough to reject universality: algorithmic lending can reduce

some

forms

of

discrimination

relative

to

face-to-face

processes.

Healthcare

also

shows

that

redesigning

a

biased

target

can

sharply

reduce

disparity.

Correction

matters.

18. The Conditional Claim Survives Inherited Disparity + Feedback Closure + Endogenous Data + Repeated Use/Updating

-

Effective

Correction

→

Amplification

Risk

This conditional architecture is supported across the literature even though the strength of

observed

group-amplification

evidence

differs

by

domain.

19. Drift Must Be Repositioned The evidence does not support treating drift as the primary cause of amplification. Performative

systems

generate

distribution

shift

because

the

model

changes

the

target

environment.

Drift

is

therefore

better

treated

as

an

observable

state

that

can

emerge

inside

the

feedback

loop. AI Action → Environment Shift → Data Distribution Shift/Drift → Retraining Drift can amplify disparity only when it interacts with asymmetric exposure, selective observation,

proxy

targets,

or

group-specific

response.

Drift

by

itself

is

not

discriminatory. Drift ≠ Bias Drift × Asymmetric Feedback can change bias 20. Recursive Disparity Test A deployed system should be audited longitudinally rather than only at validation time. Δ_ g(t) = group disparity at iteration t AR_t = |Δ_ g(t+1)| / |Δ_ g(t)| FCI_t = feedback-closure score Drift_t = distance between current and baseline feature/label distributions The central empirical test is: AR_t = α + β1 FCI_t + β2 Drift_t + β3( FCI_t×Drift_t) + β4 Correction_t + controls

+

ε_ t

The SR amplification hypothesis predicts a positive interaction only in systems where the

drift

is

produced

or

exploited

asymmetrically.

A

non-positive

β3

falsifies

the

strong

drift-amplification

mechanism

for

that

system.

21. Stronger Causal Design Where deployment timing varies across sites or groups, use staggered or difference-in-differences

designs

comparing

disparity

trajectories

before

and

after

algorithmic

deployment.

Where

an

algorithm

changes

thresholds

or

model

versions,

interrupted time series can test whether disparity growth changes with the feedback architecture.

Where

counterfactual

outcomes

are

censored,

exploration/randomization

or

causal

identification

is

required.

Domain Preferred design Policing matched precincts/areas; exposure-adjusted incident data; deployment intensity; repeated allocation Banking approval exploration/randomization or quasi-experimental cutoff designs; rejected-applicant counterfactual recovery Healthcare model-version changes; treatment-response causal adjustment; repeated subgroup outcome monitoring Criminal legal instrument rollout variation; judge/court assignment variation where valid; repeated decision histories

22. Correction Coefficient The empirical literature repeatedly shows that feedback need not be fatal. Reported incidents

can

attenuate

predictive-policing

feedback;

exploration

can

repair

selective

labels

in

lending;

redesigning

healthcare

targets

can

sharply

reduce

bias;

performative-prediction

algorithms

can

be

designed

for

stable

behavior. C_t = monitoring + exploration + target redesign + fairness constraint + human/institutional

correction Higher effective C_t should reduce AR_t This makes recursive amplification falsifiable and governable. 23. Relationship to Historical SSO Historical SSO explains why biased or unequal structure can remain available to be inherited.

Recursive

Discrimination

Amplification

explains

what

may

happen

after

a

technical

decision

system

begins

acting

on

that

structure. Historical SSO → Residual Substrate → System Inheritance → Closed-Loop AI

→

Dynamic

Outcome

The temporal sequence is therefore two-stage: historical persistence creates the initial condition;

recursive

deployment

can

then

attenuate,

preserve,

or

amplify

it.

24. Relationship to System Inheritance Studies System Inheritance Studies asks how institutions transmit prior structures through data and

technical

systems.

The

present

paper

adds

a

dynamic

test:

once

inherited

structure

enters

an

algorithmic

allocation

system,

does

the

system

merely

represent

the

inherited

state,

or

does

it

help

reproduce

the

future

data

from

which

later

decisions

are

made? Inheritance is transmission. Recursive amplification is endogenous reproduction. 25. Falsification Conditions •

If repeated-use systems show no relationship between feedback closure and disparity trajectories

after

matched

controls,

the

recursive

amplification

hypothesis

is

weakened.

•

If model-induced drift occurs but group disparities remain stable or shrink, drift cannot be

treated

as

an

amplification

mechanism

in

that

domain.

•

If algorithmic systems consistently attenuate disparity despite high FCI, correction/substitution

mechanisms

dominate

the

proposed

loop.

•

If future labels are demonstrably exogenous to AI-supported decisions, the closed-loop mechanism

is

absent.

•

If banking, healthcare, policing, and criminal-legal systems do not reuse endogenous observations,

cross-domain

generalization

fails.

•

If one-shot fairness metrics accurately predict long-run disparity trajectories in repeated-use

systems,

the

dynamic

SR

contribution

is

weakened.

26. What Is Confirmed •

Institutional AI can inherit disparities through targets, proxies, records, and selective labels.

•

AI-supported decisions can alter the data-generating environment. •

Repeated use/retraining can create feedback loops and distribution shift. •

Runaway or compounding amplification is mathematically and empirically demonstrable

in

some

modeled

AI

environments.

•

Algorithmic intervention can also attenuate discrimination. •

Therefore amplification is conditional, not intrinsic to AI. 27. What Is Not Yet Confirmed •

That all AI deployed in policing, banking, healthcare, or law amplifies discrimination. •

That drift alone causes discriminatory amplification. •

That real-world longitudinal racial disparities have already been causally shown to amplify

through

feedback

in

all

four

domains.

•

That a single feedback coefficient applies across institutional domains. •

That algorithmic decisions are always more discriminatory than human decisions. 28. Final Finding AI does not merely inherit history when it enters a closed institutional loop. It can become part of the mechanism that produces its own future evidence.

The empirical literature supports this as a real machine-learning and institutional-decision

problem.

What

remains

domain-specific

is

the

sign

of

the

outcome:

attenuation,

persistence,

or

amplification. The correct SR question is not: Is the AI biased? The correct dynamic question is: Does the AI help produce the data that will

later

justify

its

next

decision,

and

what

happens

to

disparity

across

that

loop?

29. Final Distinction: Model Recursion and Institutional Recursion Closed-loop amplification does not require a model to retrain itself continuously. The consequences

of

an

AI-assisted

decision

can

return

through

two

distinct

channels:

model

recursion

and

institutional

recursion.

This

distinction

is

essential

in

policing,

banking,

healthcare,

and

criminal-legal

systems,

where

a

fixed

model

can

still

reorganize

human

behavior

and

institutional

records. R_M = Model Recursion

Model recursion occurs when AI-supported decisions alter the environment, the altered environment

produces

new

observations,

and

those

observations

are

reused

to

retrain,

recalibrate,

fine-tune,

or

otherwise

update

the

model. AI_t → Decision_t → Environment_t+1 → Data_t+1 → Updated AI_t+1 R_I = Institutional Recursion Institutional recursion occurs when AI-supported decisions alter human or organizational

behavior

and

the

resulting

records

influence

later

institutional

decisions

even

if

the

underlying

model

weights

never

change. AI → Human Decision → Institutional Behavior → New Records → Future Institutional

Decision Accordingly, the absence of online learning does not establish the absence of a feedback

loop.

The

empirical

question

is

whether

consequences

produced

partly

by

the

AI-supported

decision

return

to

later

decisions

through

either

technical

or

institutional

pathways.

30. Revised Feedback Closure Architecture FC = f(R_M, R_I) Feedback closure exists when at least one recursive pathway is materially operative. Model

recursion

and

institutional

recursion

can

coexist,

but

either

may

be

sufficient

to

create

endogenous

evidence.

The

Feedback

Closure

Index

should

therefore

record

the

channel

through

which

observations

return

rather

than

treating

retraining

as

a

necessary

condition. FC = 0 ⇒ no recursive amplification through this mechanism This is a hard boundary condition. A system may still inherit or reproduce a static disparity

when

FC

equals

zero,

but

any

worsening

cannot

be

attributed

to

the

recursive

mechanism

developed

in

this

paper.

31. Final Five-Stage Dynamic Sequence Stage I — Inheritance: historical/institutional structure enters the decision system

Stage II — Interaction: AI-supported decisions act upon people or environments Stage III — Feedback Closure: consequences return through R_M and/or R_I Stage IV — Drift: the observed environment/data distribution changes Stage V — Dynamic Outcome: attenuation, persistence, or amplification This ordering prevents several causal errors. Inheritance can exist without interaction. Interaction

can

exist

without

feedback

closure.

Feedback

closure

can

exist

without

discriminatory

drift.

Drift

can

occur

without

disparity

amplification.

Amplification

is

established

only

when

the

measured

disparity

grows

across

the

recursive

sequence

and

credible

alternatives

are

excluded.

32. Revised Amplification Condition Amplification requires: AR_t = |Δ_ t+1| / |Δ_ t| > 1 A stronger causal attribution to recursive AI additionally requires evidence that the feedback

channel

contributed

to

that

increase.

The

preferred

test

therefore

combines

longitudinal

disparity

measurement

with

observed

model

or

institutional

recursion. Recursive Amplification Evidence = (AR_t > 1) ∧ (R_M ∨ R_I) ∧ Feedback Contribution This prevents ordinary social change, unrelated institutional deterioration, or pre-existing

trend

continuation

from

being

mislabeled

as

AI

amplification.

33. Domain Implications of the Two Recursion Channels •

Predictive policing can contain both channels: deployment creates new incident data for later

models

and

also

changes

police

behavior,

supervision,

and

resource

allocation

around

the

model.

•

Banking can exhibit model recursion through refreshed credit outcomes and institutional recursion

through

approval

policies,

human

underwriting,

portfolio

management,

and

credit-history

formation.

•

Healthcare can exhibit model recursion through updated outcome/utilization data and institutional

recursion

when

clinicians

reorganize

treatment,

referrals,

monitoring,

or

resource

allocation

around

model

scores.

•

Criminal-legal risk systems can generate institutional recursion even with fixed instruments

because

judges,

supervision

systems,

detention

decisions,

and

subsequent

records

may

repeatedly

respond

to

the

same

scoring

architecture.

34. Final Falsification Boundary The recursive discrimination hypothesis must be rejected for a particular system when the

alleged

feedback

pathway

cannot

be

demonstrated.

Biased

input

data

alone

establish

possible

inheritance,

not

recursive

amplification.

A

model

that

never

affects

future

observations,

institutional

behavior,

or

later

decision

evidence

cannot

amplify

disparity

through

the

mechanism

specified

here. Biased Data + AI ≠ Recursive Amplification Biased Data + Consequential Interaction + Feedback Closure + Asymmetric Dynamic

Change

→

Test

for

Amplification

35. Frozen Theoretical Architecture The theoretical architecture is now complete. Model recursion and institutional recursion

are

mechanisms

within

the

existing

framework,

not

additional

universal

SR

operators.

Future

work

should

estimate

the

strength

of

each

channel

and

the

resulting

disparity

trajectory

in

deployed

systems

rather

than

expand

the

conceptual

vocabulary. Inheritance → Interaction → Feedback Closure → Drift → {Attenuation, Persistence,

Amplification} The theory is frozen; the next task is empirical estimation and replication. References Ensign, D., Friedler, S. A., Neville, S., Scheidegger, C., & Venkatasubramanian, S. (2018).

Runaway

Feedback

Loops

in

Predictive

Policing.

Proceedings

of

FAT*,

PMLR

81,

160-171.

Ensign, D., Friedler, S. A., Neville, S., Scheidegger, C., & Venkatasubramanian, S. (2018).

Decision

Making

with

Limited

Feedback.

Proceedings

of

ALT,

PMLR

83,

359-367. Perdomo, J., Zrnic, T., Mendler-Dünner, C., & Hardt, M. (2020). Performative Prediction.

Proceedings

of

ICML,

PMLR

119,

7599-7609. Kilbertus, N., Gomez Rodriguez, M., Schölkopf, B., Muandet, K., & Valera, I. (2020). Fair

Decisions

Despite

Imperfect

Predictions.

Proceedings

of

AISTATS,

PMLR

108,

277-287. Keswani, V., Mehrotra, A., & Celis, L. E. (2024). Fair Classification with Partial Feedback:

An

Exploration-Based

Data

Collection

Approach.

Proceedings

of

ICML,

PMLR

235,

23547-23576. Bartlett, R., Morse, A., Stanton, R., & Wallace, N. (2019/2021). Consumer-Lending Discrimination

in

the

FinTech

Era.

NBER

Working

Paper

25943;

Journal

of

Financial

Economics. Obermeyer, Z., Powers, B., Vogeli, C., & Mullainathan, S. (2019). Dissecting racial bias

in

an

algorithm

used

to

manage

the

health

of

populations.

Science,

366(6464),

447-453.

https://doi.org/10.1126/science.aax2342. Adam, G. A., Chang, C.-H. K., Haibe-Kains, B., & Goldenberg, A. (2020). Hidden Risks

of

Machine

Learning

Applied

to

Healthcare:

Unintended

Feedback

Loops

Between

Models

and

Future

Data

Causing

Model

Degradation.

Proceedings

of

MLHC,

PMLR

126,

710-731. Feng, J., Gossmann, A., Pennello, G. A., Petrick, N., Sahiner, B., & Pirracchio, R. (2024).

Monitoring

machine

learning-based

risk

prediction

algorithms

in

the

presence

of

performativity.

Proceedings

of

AISTATS,

PMLR

238,

919-927. Boeken, P., Zoeter, O., & Mooij, J. (2024). Evaluating and Correcting Performative Effects

of

Decision

Support

Systems

via

Causal

Domain

Shift.

Proceedings

of

CLeaR,

PMLR

236,

551-569. Laufer, B. (2020). Feedback Effects in Repeat-Use Criminal Risk Assessments. arXiv:2011.14075.

Brown, G., Hod, S., & Kalemaj, I. (2022). Performative Prediction in a Stateful World. Proceedings

of

AISTATS,

PMLR

151,

6045-6061. SignalRupture. (2026). System Inheritance Studies. SignalRupture. (2026). Historical Systemic Substrate Omission: Institutional Modernization

Without

Causal

Transformation.

Recursive Discrimination Amplification | Final Frozen Edition | SignalRupture
