import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  DOLLHOUSE_DESIGN_SCHEMA,
  DOLLHOUSE_DESIGN_VERSION,
  AVAILABLE_INSTRUMENTS,
  VALID_MEDIA,
  VALID_REFERENCE_CLASSIFICATIONS,
  VALID_PROVENANCE_CLASSES,
  normalizeCommission,
  analyzeSeedSemantics,
  deriveCommissionCandidates,
  buildInstrumentCausalContract,
  resolveHistoricalReference,
  resolveHistoricalReferences,
  getReferenceFullContent,
  runDollhouseDesignCycle
} from '../app/engine/dollhouse-design-conductor.js';

test('TD613 Dollhouse Design Conductor v0.2 - Schema & Constants', () => {
  assert.equal(DOLLHOUSE_DESIGN_SCHEMA, 'td613.dollhouse-design.return-receipt/v0.2');
  assert.equal(DOLLHOUSE_DESIGN_VERSION, 'v0.2-candidate');
  
  const expectedInstruments = [
    'PHASONIC_COUNTERPOINT',
    'CARO_INSTITUTIONAL_RECONSTRUCTION',
    'BUTLER_PERFORMATIVE_ITERATION',
    'SEDGWICK_REPARATIVE_TEXTURE',
    'DIALECTICAL_TENSION'
  ];
  assert.deepEqual(Object.keys(AVAILABLE_INSTRUMENTS).sort(), expectedInstruments.sort());
  assert.ok(Object.isFrozen(AVAILABLE_INSTRUMENTS));

  const expectedMedia = ['VISUAL', 'MOTION', 'SCHOLARLY', 'THEORETICAL', 'PRODUCT', 'HYBRID'];
  assert.deepEqual(VALID_MEDIA.slice().sort(), expectedMedia.sort());
  assert.ok(Object.isFrozen(VALID_MEDIA));
});

test('TD613 Dollhouse Design Conductor v0.2 - analyzeSeedSemantics', () => {
  const seed1 = 'A theater in which punctuation marks are the stage machinery, and each scene quietly changes the grammar of the scene before it.';
  const analysis1 = analyzeSeedSemantics(seed1);

  assert.equal(analysis1.raw, seed1);
  assert.ok(analysis1.salient_keywords.includes('theater'));
  assert.ok(analysis1.salient_keywords.includes('punctuation'));
  assert.ok(analysis1.salient_keywords.includes('machinery'));
  assert.ok(analysis1.detected_clusters.machinery.includes('machinery'));
  assert.ok(analysis1.detected_clusters.textual.includes('punctuation'));
  assert.ok(analysis1.detected_clusters.spatial.includes('theater'));
  assert.ok(analysis1.detected_clusters.temporal.includes('scene'));

  const seed2 = 'Estuary Title Dissolution';
  const analysis2 = analyzeSeedSemantics(seed2);
  assert.ok(analysis2.salient_keywords.includes('estuary'));
  assert.ok(analysis2.detected_clusters.spatial.includes('estuary'));
  assert.ok(analysis2.detected_clusters.institutional.includes('title'));
});

test('TD613 Dollhouse Design Conductor v0.2 - Commission-Derived Alternatives', () => {
  // Commission 1: The Punctuation Theater
  const comm1 = normalizeCommission({
    seed: 'A theater in which punctuation marks are the stage machinery, and each scene quietly changes the grammar of the scene before it.',
    medium: 'HYBRID',
    instruments: ['PHASONIC_COUNTERPOINT']
  });
  const [cand1A, cand1B] = deriveCommissionCandidates(comm1);

  assert.equal(cand1A.proposal_origin, 'COMMISSION_DERIVED');
  assert.equal(cand1B.proposal_origin, 'COMMISSION_DERIVED');
  assert.ok(cand1A.concept_title.toLowerCase().includes('punctuation') || cand1A.concept_title.toLowerCase().includes('machinery'));
  assert.ok(cand1A.formal_proposition.toLowerCase().includes('textual') || cand1A.formal_proposition.toLowerCase().includes('stage'));

  // Commission 2: The Two Distinct Processes (Endpoint Equivalence)
  const comm2 = normalizeCommission({
    seed: 'Two distinct processes arrive at an identical endpoint, but their histories differ',
    medium: 'VISUAL',
    instruments: ['PHASONIC_COUNTERPOINT', 'SEDGWICK_REPARATIVE_TEXTURE']
  });
  const [cand2A, cand2B] = deriveCommissionCandidates(comm2);

  // Substantive distinction test: Candidate titles and formal propositions must differ between seeds!
  assert.notEqual(cand1A.concept_title, cand2A.concept_title);
  assert.notEqual(cand1A.formal_proposition, cand2A.formal_proposition);
  assert.notEqual(cand1B.concept_title, cand2B.concept_title);
  assert.notEqual(cand1B.formal_proposition, cand2B.formal_proposition);

  // Neither candidate can use the old hardcoded strings
  assert.notEqual(cand1A.concept_title, 'The Stratigraphic Separation');
  assert.notEqual(cand1B.concept_title, 'The Procedural Inversion');
  assert.notEqual(cand2A.concept_title, 'The Stratigraphic Separation');
  assert.notEqual(cand2B.concept_title, 'The Procedural Inversion');
});

test('TD613 Dollhouse Design Conductor v0.2 - Author Candidate Overrides', () => {
  const customCandidates = [
    {
      concept_title: 'The Cartographic Palimpsest',
      formal_proposition: 'Superimposes erased colonial parcel boundaries over contemporary satellite imagery.',
      structural_mechanisms: ['Cadastral overlay', 'Opacity modulation', 'Toponym restoration'],
      medium_consequence: 'Exposes how modern land title conceals indigenous displacement.'
    },
    {
      concept_title: 'The Riparian Common',
      formal_proposition: 'Organizes the interface around seasonal water levels rather than statutory property deeds.',
      structural_mechanisms: ['Tidal timeline', 'Communal easement ledger', 'Submerged monument tracking'],
      medium_consequence: 'Subverts property boundaries through ecological impermanence.'
    }
  ];

  const comm = normalizeCommission({
    seed: 'Estuary Boundary Dispute',
    medium: 'SCHOLARLY',
    candidate_overrides: customCandidates
  });

  const candidates = deriveCommissionCandidates(comm);
  assert.equal(candidates.length, 2);
  assert.equal(candidates[0].concept_title, 'The Cartographic Palimpsest');
  assert.equal(candidates[0].proposal_origin, 'OPERATOR_OVERRIDE');
  assert.equal(candidates[1].concept_title, 'The Riparian Common');
  assert.equal(candidates[1].proposal_origin, 'OPERATOR_OVERRIDE');
});

test('TD613 Dollhouse Design Conductor v0.2 - Causally Consequential Instrumentation Contract', () => {
  const phasonicContract = buildInstrumentCausalContract('PHASONIC_COUNTERPOINT', 'HYBRID', ['punctuation', 'machinery']);
  assert.equal(phasonicContract.instrument_id, 'PHASONIC_COUNTERPOINT');
  assert.equal(phasonicContract.causality_class, 'OPERATIVE_TRANSFER');
  assert.deepEqual(phasonicContract.target_domains, ['GEOMETRY', 'MOTION', 'GRAMMAR']);
  assert.ok(phasonicContract.causal_bindings.length >= 2);

  const latticeBinding = phasonicContract.causal_bindings.find(b => b.target_component === 'spatial_lattice_geometry');
  assert.ok(latticeBinding);
  assert.equal(latticeBinding.parameter, 'scalar_interference_H');
  assert.ok(latticeBinding.transfer_law.includes('24.0 * H(u)'));
  assert.ok(latticeBinding.falsification_probe.includes('H = 0.0000'));

  const syntaxBinding = phasonicContract.causal_bindings.find(b => b.target_component === 'clause_syntax_selection');
  assert.ok(syntaxBinding);
  assert.equal(syntaxBinding.parameter, 'scalar_interference_H');
  assert.ok(syntaxBinding.transfer_law.includes('H >= 1.30'));
  assert.ok(syntaxBinding.falsification_probe.includes('Forcing H = 0.0000 resets syntax_state'));

  const caroContract = buildInstrumentCausalContract('CARO_INSTITUTIONAL_RECONSTRUCTION', 'SCHOLARLY');
  assert.equal(caroContract.causality_class, 'OPERATIVE_TRANSFER');
  assert.deepEqual(caroContract.target_domains, ['SPATIAL_TOPOLOGY', 'INTERACTION_FRICTION', 'DOCUMENT_CUSTODY']);
});

test('TD613 Dollhouse Design Conductor v0.2 - Full Cycle with v0.2 Governance & Interaction Topology', async () => {
  const seed = 'A theater in which punctuation marks are the stage machinery, and each scene quietly changes the grammar of the scene before it.';
  const receipt = await runDollhouseDesignCycle({
    seed,
    medium: 'HYBRID',
    instruments: ['PHASONIC_COUNTERPOINT', 'DIALECTICAL_TENSION'],
    human_coordinates: {
      what: 'Kinetic theatrical proscenium',
      who: 'Viewer and syntactic witness',
      where: 'Desktop & 390px mobile viewport',
      how: 'Punctuation machinery physically deforms active sentence geometry',
      when: 'Four progressive scenes followed by retrospective unwinding',
      why: 'To demonstrate that punctuation is mechanical work rather than passive ornament'
    }
  });

  // Schema & Version
  assert.equal(receipt.schema, 'td613.dollhouse-design.return-receipt/v0.2');
  assert.equal(receipt.version, 'v0.2-candidate');

  // Commission-derived proposals
  assert.equal(receipt.candidates.length, 2);
  assert.equal(receipt.candidates[0].proposal_origin, 'COMMISSION_DERIVED');
  assert.notEqual(receipt.candidates[0].concept_title, 'The Stratigraphic Separation');

  // Provenance contains Causal Contract
  assert.equal(receipt.instrument_provenance.length, 2);
  assert.ok(receipt.instrument_provenance[0].causal_contract);
  assert.equal(receipt.instrument_provenance[0].causal_contract.causality_class, 'OPERATIVE_TRANSFER');

  // Comparative analysis contains interaction topology and accessibility policy
  const topology = receipt.comparative_analysis.governing_interaction_topology;
  assert.ok(topology);
  assert.equal(topology.motion_policy, 'USER_CONTROLLED_STILL_STATE_UNDER_REDUCED_MOTION');
  assert.equal(topology.mobile_legibility_profile.minimum_telemetry_font_px, 12);
  assert.equal(topology.mobile_legibility_profile.minimum_hit_target_px, 44);

  // Deep Immutability
  assert.ok(Object.isFrozen(receipt));
  assert.ok(Object.isFrozen(receipt.candidates));
  assert.ok(Object.isFrozen(receipt.comparative_analysis));
  assert.ok(Object.isFrozen(receipt.governance));
  assert.equal(receipt.governance.discourse_mode, 'OPEN_FIELD_CREATIVE_SYNTHESIS');
  assert.equal(receipt.governance.release_authority, false);
});

test('TD613 Dollhouse Design Conductor v0.2 - Contextual Instrument Inference Across All Five Traditions', () => {
  // 1. Caro: Institutional / Bureaucracy / Redaction
  const caroSeed = "A corridor of bureaucratic waiting rooms where each stamp of approval redacts a word from the applicant's petition, and the door only unlocks when the petition becomes completely illegible.";
  const caroComm = normalizeCommission({ seed: caroSeed, medium: 'VISUAL' });
  assert.deepEqual(caroComm.instruments, ['CARO_INSTITUTIONAL_RECONSTRUCTION'], 'Bureaucracy/petition seed must infer Caro');

  // 2. Butler: Performative / Iteration / Citational Subversion
  const butlerSeed = "A ritualized legal ceremony where iterative citations introduce subversive slippage into the normative decree.";
  const butlerComm = normalizeCommission({ seed: butlerSeed, medium: 'MOTION' });
  assert.deepEqual(butlerComm.instruments, ['BUTLER_PERFORMATIVE_ITERATION'], 'Citational/normative seed must infer Butler');

  // 3. Sedgwick: Reparative / Affective / Paratactic Texture
  const sedgwickSeed = "A textile archive of discarded communal patches offering affective shelter and textural survival beside the ruined monument.";
  const sedgwickComm = normalizeCommission({ seed: sedgwickSeed, medium: 'SCHOLARLY' });
  assert.deepEqual(sedgwickComm.instruments, ['SEDGWICK_REPARATIVE_TEXTURE'], 'Affective/textural patch seed must infer Sedgwick');

  // 4. Dialectical: Polyphonic Tension / Dissonance / Contradiction
  const dialecticalSeed = "Two irreconcilable choral voices sustaining polyphonic dissonance and structural contradiction without resolving into unison.";
  const dialecticalComm = normalizeCommission({ seed: dialecticalSeed, medium: 'THEORETICAL' });
  assert.deepEqual(dialecticalComm.instruments, ['DIALECTICAL_TENSION'], 'Polyphonic dissonance seed must infer Dialectical Tension');

  // 5. Phasonic: Quasiperiodic / Lattice / Detour
  const phasonicSeed = "A quasiperiodic wave lattice projecting moiré interference fringes across an equilateral triangular grid.";
  const phasonicComm = normalizeCommission({ seed: phasonicSeed, medium: 'VISUAL' });
  assert.deepEqual(phasonicComm.instruments, ['PHASONIC_COUNTERPOINT'], 'Quasiperiodic lattice seed must infer Phasonic Counterpoint');
});

test('TD613 Dollhouse Design Conductor v0.2 - Explicit Instrument Override & Ambiguous Fallback', () => {
  // Explicit author override must supersede heuristic inference
  const overriddenComm = normalizeCommission({
    seed: "A corridor of bureaucratic waiting rooms where each stamp of approval redacts a word from the applicant's petition.",
    medium: 'VISUAL',
    instruments: ['SEDGWICK_REPARATIVE_TEXTURE'] // Author explicitly chooses Sedgwick despite institutional words
  });
  assert.deepEqual(overriddenComm.instruments, ['SEDGWICK_REPARATIVE_TEXTURE'], 'Explicit author choice must override heuristic inference');

  // Ambiguous seed with zero cluster tokens must predictably fall back to PHASONIC_COUNTERPOINT
  const ambiguousSeed = "Blue pebbles falling through clear glass.";
  const ambiguousComm = normalizeCommission({ seed: ambiguousSeed, medium: 'VISUAL' });
  assert.deepEqual(ambiguousComm.instruments, ['PHASONIC_COUNTERPOINT'], 'Genuinely ambiguous seed must fall back predictably to Phasonic');
});

test('TD613 Dollhouse Design Conductor v0.2 - Explicit Fail-Closed Validation (Counterexample A66-3)', () => {
  // 1. Unrecognized instrument ID must fail closed with intelligible error, NOT silent fallback
  assert.throws(
    () => normalizeCommission({ seed: 'Valid seed', medium: 'VISUAL', instruments: ['INVALID_INSTRUMENT'] }),
    { name: 'TypeError', message: /Unrecognized instrument "INVALID_INSTRUMENT"/ }
  );

  // 2. Non-array instruments input must throw TypeError
  assert.throws(
    () => normalizeCommission({ seed: 'Valid seed', medium: 'VISUAL', instruments: 'CARO_INSTITUTIONAL_RECONSTRUCTION' }),
    { name: 'TypeError', message: /must be an array of instrument identifiers/ }
  );

  // 3. Explicit empty array must throw TypeError
  assert.throws(
    () => normalizeCommission({ seed: 'Valid seed', medium: 'VISUAL', instruments: [] }),
    { name: 'TypeError', message: /must not be an empty array/ }
  );

  // 4. Invalid medium must throw TypeError
  assert.throws(
    () => normalizeCommission({ seed: 'Valid seed', medium: 'SCULPTURE_3D' }),
    { name: 'TypeError', message: /Invalid medium "SCULPTURE_3D"/ }
  );

  // 5. Missing seed must throw TypeError
  assert.throws(
    () => normalizeCommission({ seed: '' }),
    { name: 'TypeError', message: /requires an intellectual seed/ }
  );
});

test('TD613 Dollhouse Design Conductor v0.2 - First-Class Historical Reference Ingestion & Resolution (A67-C1)', async () => {
  const commInput = {
    commission_id: 'TEST-LOOM-REF-01',
    seed: 'Holonomy Loom returned-work custody under historical relation map',
    medium: 'HYBRID',
    historical_references: [
      {
        reference_id: 'REF-RELATION-MAP-01',
        source_path: 'docs/reentry/RELATION_MAP.md',
        source_revision: 'e0a7ba5f3b76f545da11037833c269abd7623a04',
        classification: 'BINDING_CUSTODY_LAW',
        provenance_class: 'CONTEMPORANEOUS_ORIGINAL',
        summary: 'Registration, Check, Challenge, and Carrier continuation custody law.'
      },
      {
        reference_id: 'REF-LOOM-SCREEN-02',
        source_path: 'docs/reentry/NONEXISTENT_LOOM_FILE.md',
        source_revision: 'e0a7ba5f3b76f545da11037833c269abd7623a04',
        classification: 'NEGOTIABLE_AESTHETIC_DIRECTION',
        provenance_class: 'RECONSTRUCTED_RECORD',
        summary: 'Non-binding aesthetic cues with unresolvable path.'
      }
    ]
  };

  const receipt = await runDollhouseDesignCycle(commInput);

  assert.equal(receipt.commission_id, 'TEST-LOOM-REF-01');
  assert.ok(Array.isArray(receipt.historical_references), 'Receipt must contain historical_references array');
  assert.equal(receipt.historical_references.length, 2);

  // 1. Valid binding reference resolved against immutable git revision
  const ref1 = receipt.historical_references[0];
  assert.equal(ref1.reference_id, 'REF-RELATION-MAP-01');
  assert.equal(ref1.classification, 'BINDING_CUSTODY_LAW');
  assert.equal(ref1.provenance_class, 'CONTEMPORANEOUS_ORIGINAL');
  assert.equal(ref1.revision_type, 'IMMUTABLE_40HEX_COMMIT');
  assert.equal(ref1.resolution_status, 'RESOLVED');
  assert.equal(ref1.resolved, true);
  assert.equal(ref1.retrieval_method, 'GIT_SHOW_IMMUTABLE_40HEX_COMMIT');
  assert.ok(/^[a-f0-9]{64}$/.test(ref1.sha256), 'Must contain 64-char sha256 digest of resolved bytes');
  assert.ok(ref1.byte_count > 0, 'Byte count must be positive');
  assert.ok(ref1.content_excerpt.includes('RELATION_MAP') || ref1.content_excerpt.length > 50, 'Must contain substantive source content snippet');
  assert.equal(Buffer.byteLength(ref1.full_content, 'utf8'), ref1.byte_count, 'Byte length of full_content must match byte_count');
  assert.equal(ref1.content_manifest.is_complete, true);
  assert.equal(ref1.content_manifest.inspection_protocol, 'FULL_SOURCE_INGESTION');
  assert.equal(ref1.content_manifest.sha256, ref1.sha256);
  assert.equal(getReferenceFullContent(ref1), ref1.full_content);

  // 2. Non-binding reference with missing file records UNRESOLVED without halting cycle
  const ref2 = receipt.historical_references[1];
  assert.equal(ref2.reference_id, 'REF-LOOM-SCREEN-02');
  assert.equal(ref2.classification, 'NEGOTIABLE_AESTHETIC_DIRECTION');
  assert.equal(ref2.provenance_class, 'RECONSTRUCTED_RECORD');
  assert.equal(ref2.resolution_status, 'UNRESOLVED');
  assert.equal(ref2.resolved, false);
  assert.ok(ref2.error, 'Unresolved reference must record retrieval error');

  assert.ok(Object.isFrozen(receipt.historical_references));
  assert.ok(Object.isFrozen(receipt.historical_references[0]));
});

test('TD613 Dollhouse Design Conductor v0.2 - Decisive Full-Source vs Excerpt Ingestion (C68-2 Regression Test)', async () => {
  // Ingest AGENTS.md (24KB+) at immutable revision e0a7ba5f3b76f545da11037833c269abd7623a04
  const agentsComm = {
    commission_id: 'TEST-AGENTS-DEEP-INGESTION',
    seed: 'Auditing deep binding instructions beyond 1000 character excerpt limit',
    historical_references: [
      {
        reference_id: 'REF-AGENTS-LAW-DEEP',
        source_path: 'AGENTS.md',
        source_revision: 'e0a7ba5f3b76f545da11037833c269abd7623a04',
        classification: 'BINDING_CUSTODY_LAW',
        provenance_class: 'CONTEMPORANEOUS_ORIGINAL',
        summary: 'TD613 Agent Entry Contract containing governing design law.'
      }
    ]
  };

  const receipt = await runDollhouseDesignCycle(agentsComm);
  const ref = receipt.historical_references[0];

  assert.equal(ref.reference_id, 'REF-AGENTS-LAW-DEEP');
  assert.equal(ref.resolved, true);
  assert.equal(ref.revision_type, 'IMMUTABLE_40HEX_COMMIT');
  assert.equal(ref.content_manifest.inspection_protocol, 'FULL_SOURCE_INGESTION');
  assert.ok(ref.byte_count > 20000, `Byte count must exceed 20,000 bytes (got ${ref.byte_count})`);

  // Target deep instruction located at byte offset ~20,574
  const targetInstruction = 'child-legible NOW / WHY / EXACT where human consequence is involved';

  // Excerpt (first 1000 chars) MUST NOT contain the deep instruction
  assert.equal(
    ref.content_excerpt.includes(targetInstruction),
    false,
    'Truncated content_excerpt must NOT contain deep instruction located past byte 20,000'
  );

  // Full source retrieved via getReferenceFullContent MUST contain the deep instruction
  const fullContent = getReferenceFullContent(ref);
  assert.equal(
    fullContent.includes(targetInstruction),
    true,
    'getReferenceFullContent must provide the complete source containing the deep instruction'
  );

  // Adjacent governing design laws must also be present in full content
  assert.ok(fullContent.includes('rest and exit remain available without penalty'));
  assert.ok(fullContent.includes('same endpoint does not erase route history'));
});

test('TD613 Dollhouse Design Conductor v0.2 - Strict Historical Reference Input Classification Validation (C68-2)', () => {
  // 1. Unrecognized classification throws TypeError
  assert.throws(
    () => normalizeCommission({
      seed: 'Test invalid classification',
      historical_references: [
        {
          reference_id: 'REF-BAD-CLASS',
          source_path: 'AGENTS.md',
          classification: 'OPTIONAL_SUGGESTION'
        }
      ]
    }),
    {
      name: 'TypeError',
      message: /Unrecognized historical reference classification "OPTIONAL_SUGGESTION"/
    }
  );

  // 2. Non-array historical_references throws TypeError
  assert.throws(
    () => normalizeCommission({
      seed: 'Test non-array historical_references',
      historical_references: 'not-an-array'
    }),
    {
      name: 'TypeError',
      message: /Commission "historical_references" must be an array of reference objects/
    }
  );

  // 3. Binding reference missing source_path throws TypeError
  assert.throws(
    () => normalizeCommission({
      seed: 'Test missing path on binding reference',
      historical_references: [
        {
          reference_id: 'REF-NO-PATH',
          classification: 'BINDING_CUSTODY_LAW'
        }
      ]
    }),
    {
      name: 'TypeError',
      message: /Binding historical reference "REF-NO-PATH" missing source_path/
    }
  );

  // 4. Mutable symbolic ref classification
  const mutableRef = resolveHistoricalReference({
    reference_id: 'REF-MUTABLE-SYM',
    source_path: 'AGENTS.md',
    source_revision: 'feat/dollhouse-design-candidate',
    classification: 'NEGOTIABLE_AESTHETIC_DIRECTION'
  });
  assert.equal(mutableRef.revision_type, 'MUTABLE_SYMBOLIC_REF');
  assert.equal(mutableRef.retrieval_method, 'GIT_SHOW_MUTABLE_REF');
  assert.equal(mutableRef.resolved, true);

  // 5. Working tree reference classification
  const wtRef = resolveHistoricalReference({
    reference_id: 'REF-WORKING-TREE',
    source_path: 'AGENTS.md',
    source_revision: 'WORKING_TREE',
    classification: 'NEGOTIABLE_AESTHETIC_DIRECTION'
  });
  assert.equal(wtRef.revision_type, 'WORKING_TREE');
  assert.equal(wtRef.retrieval_method, 'LOCAL_FILESYSTEM_WORKING_TREE');
  assert.equal(wtRef.resolved, true);
});

test('TD613 Dollhouse Design Conductor v0.2 - Fail-Closed on Unresolvable Binding Historical Reference (A67-C1)', async () => {
  const invalidBindingComm = {
    seed: 'Testing fail-closed binding reference resolution',
    medium: 'SCHOLARLY',
    historical_references: [
      {
        reference_id: 'REF-BINDING-MISSING',
        source_path: 'tests/fixtures/dollhouse/nonexistent_file_xyz.json',
        source_revision: '5968eabd468a9dbc83961f3c75eb09e3d95a893f',
        classification: 'BINDING_CUSTODY_LAW',
        summary: 'Binding reference pointing to non-existent file must throw ReferenceError.'
      }
    ]
  };

  await assert.rejects(
    async () => runDollhouseDesignCycle(invalidBindingComm),
    {
      name: 'ReferenceError',
      message: /Binding historical reference "REF-BINDING-MISSING" could not be resolved/
    },
    'Failing to retrieve a BINDING_CUSTODY_LAW source file must fail closed with ReferenceError'
  );
});

test('TD613 Dollhouse Design Conductor v0.2 - Caro Executed Demonstration Laws vs Declarative Alternatives (A67-C4)', () => {
  const contract = buildInstrumentCausalContract('CARO_INSTITUTIONAL_RECONSTRUCTION', 'VISUAL');
  assert.equal(contract.instrument_id, 'CARO_INSTITUTIONAL_RECONSTRUCTION');
  assert.equal(contract.causal_bindings.length, 2);

  const frictionBinding = contract.causal_bindings.find(b => b.parameter === 'procedural_friction_coefficient_mu');
  assert.ok(frictionBinding, 'Must bind procedural_friction_coefficient_mu');
  assert.equal(frictionBinding.target_component, 'procedural_clearance_latency');
  assert.ok(frictionBinding.transfer_law.includes('T_clearance = mu * 400ms'), 'Transfer law must accurately describe implemented clearance latency');
  assert.ok(frictionBinding.declarative_alternative.includes('scroll_delta_effective'), 'Must distinguish declarative scroll velocity alternative');
  assert.equal(frictionBinding.execution_status, 'EXECUTED_DEMONSTRATION_LAW');

  const redactionBinding = contract.causal_bindings.find(b => b.parameter === 'archive_omission_index_lambda');
  assert.ok(redactionBinding, 'Must bind archive_omission_index_lambda');
  assert.equal(redactionBinding.target_component, 'progressive_document_redaction');
  assert.ok(redactionBinding.transfer_law.includes('redacted_word_count = chamber_index * 4'), 'Transfer law must accurately describe discrete chamber redaction');
  assert.ok(redactionBinding.declarative_alternative.includes('text_opacity'), 'Must distinguish declarative opacity alternative');
  assert.equal(redactionBinding.execution_status, 'EXECUTED_DEMONSTRATION_LAW');
});

test('TD613 Dollhouse Design Conductor v0.2 - Qualification Commission Full Ingestion & Resolution (A69-C2/C3)', async () => {
  const qualCommPath = resolve(process.cwd(), 'tests/fixtures/dollhouse/qualification_commission.json');
  const qualComm = JSON.parse(readFileSync(qualCommPath, 'utf8'));

  const receipt = await runDollhouseDesignCycle(qualComm);
  assert.equal(receipt.commission_id, 'COMM-QUAL-01');
  assert.equal(receipt.historical_references.length, 2);

  const refLaw = receipt.historical_references.find(r => r.reference_id === 'REF-LAW-AGENTS-01');
  assert.ok(refLaw);
  assert.equal(refLaw.resolved, true);
  assert.equal(refLaw.classification, 'BINDING_CUSTODY_LAW');
  assert.equal(refLaw.revision_type, 'IMMUTABLE_40HEX_COMMIT');
  assert.equal(refLaw.content_manifest.inspection_protocol, 'FULL_SOURCE_INGESTION');
  assert.ok(refLaw.full_content.length > 20000);
  assert.equal(getReferenceFullContent(refLaw), refLaw.full_content);

  const deepInstruction = 'child-legible NOW / WHY / EXACT where human consequence is involved';
  assert.equal(refLaw.content_excerpt.includes(deepInstruction), false);
  assert.equal(refLaw.full_content.includes(deepInstruction), true);
});


test('DD-02: operator-defined deliverable cardinality is independent of internal alternatives', async () => {
  const seed = 'A room in which contrasting witnesses must preserve distinct histories';
  const single = normalizeCommission({ seed, medium: 'VISUAL' });
  assert.equal(single.deliverable_count, 1, 'Implicit commission must authorize exactly one finished artifact');

  const receipt = await runDollhouseDesignCycle({ seed, medium: 'VISUAL' });
  assert.equal(receipt.output_contract.requested_deliverables, 1);
  assert.equal(receipt.output_contract.cardinality_authority, 'OPERATOR_COMMISSION_ONLY');
  assert.equal(receipt.output_contract.candidates_are_internal_scaffolding, true);
  assert.equal(receipt.output_contract.refraction_is_internal_scaffolding, true);
  assert.equal(receipt.refractive_variant.status, 'INTERNAL_COMPARATIVE_DESIGN_STUDY_NOT_A_DELIVERABLE');
  assert.equal(receipt.candidates.length, 2, 'Two internal concepts are permissible without authorizing two outputs');

  const explicit = await runDollhouseDesignCycle({ seed, medium: 'VISUAL', deliverable_count: 3 });
  assert.equal(explicit.output_contract.requested_deliverables, 3, 'Only explicit commission cardinality permits more artifacts');
  assert.equal(explicit.candidates.length, 2, 'Candidate count must remain independent of requested deliverable count');

  for (const bad of [0, -1, 1.5, '2', null, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => normalizeCommission({ seed, deliverable_count: bad }), /deliverable_count/,
      'Invalid deliverable counts must not silently change output contract');
  }
});

test('DD-02: skill and authoring cycle must not impose experimental paired outputs on ordinary commissions', async () => {
  const { readFile } = await import('node:fs/promises');
  const skill = await readFile(new URL('../.agents/skills/dollhouse-design/SKILL.md', import.meta.url), 'utf8');
  const cycle = await readFile(new URL('../.agents/skills/dollhouse-design/references/authoring-cycle.md', import.meta.url), 'utf8');
  const provenance = await readFile(new URL('../.agents/skills/dollhouse-design/references/firebreak-and-provenance.md', import.meta.url), 'utf8');
  assert.match(skill, /Operator-Defined Deliverable Cardinality/);
  assert.match(skill, /one finished deliverable per commission/);
  assert.match(cycle, /exactly the artifacts explicitly commissioned/);
  assert.match(provenance, /internal Refractive Comparison/);
  assert.doesNotMatch(skill, /materializes both Candidate A/);
  assert.doesNotMatch(skill, /Deliver the inspectable artifact, its refractive counterpart/);
  assert.doesNotMatch(cycle, /presents the materialized work, its refractive counterpart/);
});
