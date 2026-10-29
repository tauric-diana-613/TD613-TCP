// TD613 Experiment B · Arm 2A Modular Jurisdictional Reasoner
// Executes genuine live model inference across distinct jurisdictional gates:
// Chamber 1: Pedagogue & Aperture Gate (Consequence order, observability, parameter identifiability)
// Chamber 2: Atlas & FADT Gate (Relational mapping, finite admissibility descent, synthesis)

import { GeminiLiveClient } from './gemini-live-client.mjs';

export async function runArm2AModular(fixtures, clientOptions = {}) {
  const client = new GeminiLiveClient(clientOptions);
  const armId = 'ARM_2A_MODULAR';
  const traces = [];

  console.log(`[${armId}] Initializing live modular inference via ${client.model}...`);

  // Two-chamber jurisdictional pipeline
  async function runTwoChamberPipeline(taskDescription, neutralData, episodePrefix) {
    // Chamber 1: Pedagogue & Aperture Audit
    const c1Prompt = `You are the Pedagogue & Aperture Chamber.
1. PEDAGOGUE: Decompose the problem, isolate the route invariants, and state required consequence order.
2. APERTURE: Audit the observability of state variables, determine parameter identifiability, and assess rank/nullity.

Problem Data:
${JSON.stringify(neutralData, null, 2)}

Objective:
${taskDescription}`;

    const s1 = await client.invoke({
      systemInstruction: 'You are TD613 Pedagogue & Aperture specialist: audit consequence order, route invariants, observability, and parameter identifiability.',
      prompt: c1Prompt,
      episodeId: `${episodePrefix}-Chamber1-PedagogueAperture`
    });
    traces.push(s1.trace);

    // Chamber 2: Atlas & FADT Descent
    const c2Prompt = `You are the Atlas & FADT Chamber.
1. ATLAS: Establish the coordinate transformation and relational custody. Check whether representations are invariant or false twins.
2. FADT: Perform finite admissibility descent. Verify whether the morphism/conclusion descends unconditionally or if epistemic deficits occur. Deliver the exact final mathematical values, bijections, and physical conclusions.

Chamber 1 Findings:
${s1.text}

Objective:
${taskDescription}`;

    const s2 = await client.invoke({
      systemInstruction: 'You are TD613 Atlas & FADT specialist: enforce coordinate custody, holonomy parity, finite quotient fibers, and admissibility descent.',
      prompt: c2Prompt,
      episodeId: `${episodePrefix}-Chamber2-AtlasFADT`
    });
    traces.push(s2.trace);

    return {
      final_text: s2.text,
      stages: {
        chamber1_pedagogue_aperture: s1.text,
        chamber2_atlas_fadt: s2.text
      }
    };
  }

  // --- C1: Mathematical Correspondence ---
  console.log(`[${armId}] Executing C1 Modular Pipeline (2 Chambers)...`);
  const c1Data = {
    system_A: {
      domain: fixtures.c1_mech.domain,
      equation: fixtures.c1_mech.governing_equation,
      state_variables: fixtures.c1_mech.state_variables,
      parameters: fixtures.c1_mech.physical_parameters
    },
    system_B: {
      domain: fixtures.c1_elec.domain,
      equation: fixtures.c1_elec.governing_equation,
      state_variables: fixtures.c1_elec.state_variables,
      parameters: fixtures.c1_elec.physical_parameters
    }
  };
  const c1Task = 'Analyze whether System A and System B exhibit a formal mathematical isomorphism. If so, deduce the correspondence mapping between coordinates, velocities, parameters, and forcing terms. Calculate omega_0 and damping ratio zeta. Explicitly state whether total stored energy is conserved or dissipated over time.';
  const c1Res = await runTwoChamberPipeline(c1Task, c1Data, 'C1-Morphism');

  // --- C2: False Twin vs Positive Control ---
  console.log(`[${armId}] Executing C2 Modular Pipeline (Negative False-Twin)...`);
  const c2NegData = {
    system_A: fixtures.c2_logistic.model_visible_input,
    system_B: fixtures.c2_mm.model_visible_input
  };
  const c2NegTask = 'Compare System A (Logistic Growth) and System B (Michaelis-Menten Kinetics). Determine whether these systems are dynamically isomorphic or if they are a false twin (superficial similarity). Analyze their differential vs algebraic structures.';
  const c2NegRes = await runTwoChamberPipeline(c2NegTask, c2NegData, 'C2-FalseTwin');

  console.log(`[${armId}] Executing C2 Modular Pipeline (Positive Control)...`);
  const c2PosData = {
    system_A: fixtures.c2_pos.system_A,
    system_B: fixtures.c2_pos.system_B
  };
  const c2PosTask = 'Compare System A (Radioactive Decay) and System B (Discharging RC Circuit). Determine whether these systems exhibit a valid mathematical isomorphism.';
  const c2PosRes = await client.invoke({
    systemInstruction: 'You are TD613 Atlas & FADT specialist: verify coordinate bijections and mathematical equivalence.',
    prompt: `Data:\n${JSON.stringify(c2PosData, null, 2)}\n\nTask: ${c2PosTask}`,
    episodeId: 'C2-PositiveControl'
  });
  traces.push(c2PosRes.trace);

  // --- C3: Epistemic Revision ---
  console.log(`[${armId}] Executing C3 Modular Pipeline (Turn 1 & 2)...`);
  const c3T1Data = fixtures.c3_staged.turns[0].model_visible_input;
  const c3T1Task = c3T1Data.prompt;
  const c3T1Res = await client.invoke({
    systemInstruction: 'You are TD613 Epistemic Reasoner (Pedagogue/Aperture). Analyze initial evidence and determine prior frequency omega_0 and prior quality factor Q.',
    prompt: `${JSON.stringify(c3T1Data, null, 2)}\n\nTask: ${c3T1Task}`,
    episodeId: 'C3-Turn1-Prior'
  });
  traces.push(c3T1Res.trace);

  const c3T2Data = fixtures.c3_staged.turns[1].model_visible_input;
  const c3T2Task = c3T2Data.prompt;
  const c3T2Context = `Turn 1 Prior Results:\n${c3T1Res.text}\n\nTurn 2 Contradictory Evidence:\n${JSON.stringify(c3T2Data, null, 2)}`;
  const c3T2Res = await client.invoke({
    systemInstruction: 'You are TD613 Epistemic Reasoner (Atlas/FADT). Integrate new contradictory empirical decay measurements. Compute revised damping b and quality factor Q, and state preserved priors.',
    prompt: `${c3T2Context}\n\nTask: ${c3T2Task}`,
    episodeId: 'C3-Turn2-Revision'
  });
  traces.push(c3T2Res.trace);

  // --- C4: Epistemic Abstention ---
  console.log(`[${armId}] Executing C4 Modular Pipeline (Incomplete vs Sufficient)...`);
  const c4IncData = fixtures.c4_incomplete.model_visible_input;
  const c4IncTask = c4IncData.task;
  const c4IncRes = await runTwoChamberPipeline(c4IncTask, c4IncData, 'C4-IncompleteAbstain');

  const c4SufData = fixtures.c4_sufficient.model_visible_input;
  const c4SufTask = c4SufData.task;
  const c4SufRes = await client.invoke({
    systemInstruction: 'You are TD613 Epistemic Reasoner. Determine whether evidence is sufficient to infer the closed-form trajectory. If complete, infer; if incomplete, abstain.',
    prompt: `${JSON.stringify(c4SufData, null, 2)}\n\nTask: ${c4SufTask}`,
    episodeId: 'C4-SufficientControl'
  });
  traces.push(c4SufRes.trace);

  console.log(`[${armId}] All live modular conditions executed successfully.`);

  return {
    arm_label: 'ARM_2A_MODULAR',
    model_provider: 'Google Gemini (v1beta)',
    model_name: client.model,
    traces,
    c1_response: c1Res.final_text,
    c2_negative_response: c2NegRes.final_text,
    c2_positive_response: c2PosRes.text,
    c3_turn1_response: c3T1Res.text,
    c3_turn2_response: c3T2Res.text,
    c4_incomplete_response: c4IncRes.final_text,
    c4_sufficient_response: c4SufRes.text
  };
}
