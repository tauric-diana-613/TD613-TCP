"""Exploratory mathematical counterexamples; never measured LLM/physical results."""
import json, math
from pathlib import Path

# Same proportional controller, different plants. The plant's dynamics matter.
k=2.0
static_plant_error=1/(1+k)
dt=0.01
integrator_output=0.0
for _ in range(1000):
    integrator_output += dt*k*(1-integrator_output)
integrator_error=1-integrator_output
assert static_plant_error>0.3 and abs(integrator_error)<1e-8

# Same coherence and categorical confidence, opposite correctness.
def chorus(answers,known_toy_target=0):
    phases=[0.0]*len(answers)
    coherence=abs(sum(complex(math.cos(p),math.sin(p)) for p in phases)/len(phases))
    prob=sum(answers)/len(answers)
    entropy=-sum(p*math.log2(p) for p in [prob,1-prob] if p)
    return {'answers':answers,'phase_order_parameter':coherence,
            'answer_entropy_bits':entropy,
            'error_fraction':sum(x!=known_toy_target for x in answers)/len(answers)}
right=chorus([0]*4)
wrong=chorus([1]*4)
assert right['phase_order_parameter']==wrong['phase_order_parameter']==1
assert right['answer_entropy_bits']==wrong['answer_entropy_bits']==0
assert right['error_fraction']==0 and wrong['error_fraction']==1
result={'classification':'CONSTRUCTED_MATHEMATICAL_COUNTEREXAMPLES_ONLY',
 'external_empirical_credit':0,'measured_answer_model_trials':0,
 'proportional_control':{'gain':k,'target':1,'static_plant':'y=u',
    'static_plant_error':static_plant_error,'integrator_plant':'dy/dt=u',
    'integrator_error_after_euler_10_seconds':integrator_error,
    'analytic_integrator_error':'exp(-K*t)',
    'limit':'Not an LLM plant identification or control-performance result'},
 'coherence_and_error':{'known_toy_target':0,'correct':right,'incorrect':wrong,
    'limit':'Categorical Shannon entropy, not measured density-matrix von Neumann entropy; constructed oscillator phases, not human temporal observations'}}
Path('vixen-seven-source-dev/evidence/constructed-counterexamples.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
