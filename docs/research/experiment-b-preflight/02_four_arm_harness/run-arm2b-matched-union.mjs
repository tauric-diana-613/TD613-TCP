// TD613 Experiment B · Arm 2B Matched Native Union Reasoner
// Executes genuine live model inference in a flat, unchambered native union context.
// Parity Guarantee: Exact same model, temperature (0.0), token budget (4096), and prompt evidence.

import { GeminiLiveClient } from './gemini-live-client.mjs';

export async function runArm2BMatchedUnion(fixtures, clientOptions = {}) {
  const client = new GeminiLiveClient(clientOptions);
  const armId = 'ARM_2B_MATCHED_UNION';
  const traces = [];

  console.log(`[${armId}] Initializing live matched union inference via ${client.model}...`);

  const systemInstruction = 'You are an advanced mathematical and physical reasoning system. Analyze the provided scientific systems rigorously, compute exact parameters, verify isomorphism or false-twin status, perform epistemic updates, and decide whether evidence warrants inference or abstention.';

  // --- C1: Mathematical Correspondence ---
  console.log(`[${armId}] Executing C1 Matched Union...`);
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
  const c1Prompt = `Analyze whether System A and System B exhibit a formal mathematical isomorphism. If so, deduce the correspondence mapping between coordinates, velocities, parameters, and forcing terms. Calculate omega_0 and damping ratio zeta. Explicitly state whether total stored energy is conserved or dissipated over time.\n\nData:\n${JSON.stringify(c1Data, null, 2)}`;
  const c1Res = await client.invoke({
    systemInstruction,
    prompt: c1Prompt,
    episodeId: 'C1-MatchedUnion'
  });
  traces.push(c1Res.trace);

  // --- C2: False Twin vs Positive Control ---
  console.log(`[${armId}] Executing C2 Matched Union (Negative False-Twin)...`);
  const c2NegData = {
    system_A: fixtures.c2_logistic.model_visible_input,
    system_B: fixtures.c2_mm.model_visible_input
  };
  const c2NegPrompt = `Compare System A (Logistic Growth) and System B (Michaelis-Menten Kinetics). Determine whether these systems are dynamically isomorphic or if they are a false twin (superficial similarity). Analyze their differential vs algebraic structures.\n\nData:\n${JSON.stringify(c2NegData, null, 2)}`;
  const c2NegRes = await client.invoke({
    systemInstruction,
    prompt: c2NegPrompt,
    episodeId: 'C2-NegMatchedUnion'
  });
  traces.push(c2NegRes.trace);

  console.log(`[${armId}] Executing C2 Matched Union (Positive Control)...`);
  const c2PosData = {
    system_A: fixtures.c2_pos.system_A,
    system_B: fixtures.c2_pos.system_B
  };
  const c2PosPrompt = `Compare System A (Radioactive Decay) and System B (Discharging RC Circuit). Determine whether these systems exhibit a valid mathematical isomorphism.\n\nData:\n${JSON.stringify(c2PosData, null, 2)}`;
  const c2PosRes = await client.invoke({
    systemInstruction,
    prompt: c2PosPrompt,
    episodeId: 'C2-PosMatchedUnion'
  });
  traces.push(c2PosRes.trace);

  // --- C3: Epistemic Revision ---
  console.log(`[${armId}] Executing C3 Matched Union (Turn 1 & 2)...`);
  const c3T1Data = fixtures.c3_staged.turns[0].model_visible_input;
  const c3T1Prompt = `${JSON.stringify(c3T1Data, null, 2)}\n\nTask: ${c3T1Data.prompt}`;
  const c3T1Res = await client.invoke({
    systemInstruction,
    prompt: c3T1Prompt,
    episodeId: 'C3-T1MatchedUnion'
  });
  traces.push(c3T1Res.trace);

  const c3T2Data = fixtures.c3_staged.turns[1].model_visible_input;
  const c3T2Prompt = `Turn 1 Prior Results:\n${c3T1Res.text}\n\nTurn 2 New Contradictory Evidence:\n${JSON.stringify(c3T2Data, null, 2)}\n\nTask: ${c3T2Data.prompt}`;
  const c3T2Res = await client.invoke({
    systemInstruction,
    prompt: c3T2Prompt,
    episodeId: 'C3-T2MatchedUnion'
  });
  traces.push(c3T2Res.trace);

  // --- C4: Epistemic Abstention ---
  console.log(`[${armId}] Executing C4 Matched Union (Incomplete vs Sufficient)...`);
  const c4IncData = fixtures.c4_incomplete.model_visible_input;
  const c4IncPrompt = `${JSON.stringify(c4IncData, null, 2)}\n\nTask: ${c4IncData.task}`;
  const c4IncRes = await client.invoke({
    systemInstruction,
    prompt: c4IncPrompt,
    episodeId: 'C4-IncMatchedUnion'
  });
  traces.push(c4IncRes.trace);

  const c4SufData = fixtures.c4_sufficient.model_visible_input;
  const c4SufPrompt = `${JSON.stringify(c4SufData, null, 2)}\n\nTask: ${c4SufData.task}`;
  const c4SufRes = await client.invoke({
    systemInstruction,
    prompt: c4SufPrompt,
    episodeId: 'C4-SufMatchedUnion'
  });
  traces.push(c4SufRes.trace);

  console.log(`[${armId}] All live matched union conditions executed successfully.`);

  return {
    arm_label: 'ARM_2B_MATCHED_UNION',
    model_provider: 'Google Gemini (v1beta)',
    model_name: client.model,
    traces,
    c1_response: c1Res.text,
    c2_negative_response: c2NegRes.text,
    c2_positive_response: c2PosRes.text,
    c3_turn1_response: c3T1Res.text,
    c3_turn2_response: c3T2Res.text,
    c4_incomplete_response: c4IncRes.text,
    c4_sufficient_response: c4SufRes.text
  };
}
