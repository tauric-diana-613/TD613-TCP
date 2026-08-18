export const PEDAGOGUE_INTERFACE_SPECIMEN_SCHEMA = 'td613.pedagogue-interface-specimen/v0.1';
export const PEDAGOGUE_INTERFACE_DIAGNOSIS_SCHEMA = 'td613.pedagogue-interface-diagnosis/v0.2';

function finite(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function finding(code, consequence, exact, severity = 'MEDIUM') {
  return Object.freeze({ code, severity, consequence, exact });
}

function recommendation(code, now, why, exact, guardrails = []) {
  return Object.freeze({ code, now, why, exact, guardrails: Object.freeze([...guardrails]) });
}

function compileActionRouting(actions = []) {
  return Object.freeze(actions.map((action) => {
    const effect = String(action.context_effect || 'UNKNOWN').toUpperCase();
    const destination = action.destination_reference || null;
    const changesContext = effect === 'REPLACE_ACTIVE_CONTEXT' || effect === 'RESTORE_ACTIVE_CONTEXT';
    const preservesContext = effect === 'PRESERVE_ACTIVE_CONTEXT';
    const recommendedRoute = changesContext && destination
      ? 'NAVIGATE_AFTER_WORLD_ANSWER'
      : preservesContext
        ? 'STAY_IN_PLACE_AFTER_WORLD_ANSWER'
        : 'NO_AUTOMATIC_ROUTE_INFERRED';

    return Object.freeze({
      action_id: action.action_id,
      label: action.label || action.action_id,
      context_effect: effect,
      destination_reference: destination,
      recommended_route: recommendedRoute,
      rationale: changesContext
        ? 'The active working context changed. Return the operator to the declared entry surface after the consequence becomes visible.'
        : preservesContext
          ? 'The active working context remained the same. Forced navigation would add route burden without exposing a new consequence.'
          : 'The specimen does not establish enough context change to justify automatic navigation.',
      automatic_action_forbidden: true,
      human_gesture_remains_origin: true
    });
  }));
}

export function compilePedagogueInterfaceDiagnosis(specimen = {}) {
  if (specimen.schema !== PEDAGOGUE_INTERFACE_SPECIMEN_SCHEMA) {
    throw new Error(`Expected ${PEDAGOGUE_INTERFACE_SPECIMEN_SCHEMA}.`);
  }
  if (typeof specimen.surface_reference !== 'string' || !specimen.surface_reference.trim()) {
    throw new Error('Interface diagnosis requires surface_reference.');
  }

  const observed = specimen.observed || {};
  const constraints = specimen.constraints || {};
  const findings = [];
  const recommendations = [];
  const actionRouting = compileActionRouting(Array.isArray(specimen.actions) ? specimen.actions : []);

  if (observed.shared_control_rule === true) {
    findings.push(finding(
      'CONTROL_ROLE_COLLAPSE',
      'Different kinds of entry surfaces read as one generic form family, which weakens the surrounding product grammar.',
      'A shared selector owns text inputs, numeric inputs, dates, selects, and textareas without declaring distinct visual roles.'
    ));
    recommendations.push(recommendation(
      'DECLARE_ENTRY_ROLES',
      'Give each entry family a named visual role before changing decoration.',
      'Names, money, dates, long-form notes, and selectors carry different reading tasks even when they share storage mechanics.',
      'Add role tokens/classes for narrative text, identity/search text, numeric currency, temporal entry, and long-form text areas.',
      ['Do not change data semantics.', 'Do not infer user intent from the visual role.']
    ));
  }

  if (observed.dedicated_input_typography !== true) {
    findings.push(finding(
      'TYPOGRAPHIC_ROLE_UNDECLARED',
      'Typed content inherits general interface typography, so the control can resemble an off-the-shelf web form even when the panel around it has a strong visual language.',
      'The field has theme colors and borders but lacks its own declared font weight, tracking, line-height, and content role.'
    ));
    recommendations.push(recommendation(
      'DECLARE_FIELD_TYPOGRAPHY',
      'Create a field typography token set rather than shrinking text ad hoc.',
      'A dedicated type role can preserve legibility while making entered data feel native to the instrument.',
      'Define field-family tokens for font family, weight, tracking, line-height, placeholder contrast, and numeric tabularity.',
      ['Keep mobile text at or above the platform-safe zoom threshold.', 'Preserve user font scaling.']
    ));
  }

  const mobileFont = finite(observed.mobile_font_size_px);
  if (mobileFont !== null && mobileFont >= 16) {
    findings.push(finding(
      'MOBILE_SIZE_IS_PROTECTIVE',
      'The comparatively large mobile type is carrying a usability job and should not be treated as the aesthetic defect by itself.',
      `Observed mobile entry text is ${mobileFont}px; the redesign should create elegance through weight, tracking, line-height, padding, and field geometry rather than simply making it smaller.`,
      'LOW'
    ));
  }

  if (observed.dedicated_textarea_treatment !== true) {
    findings.push(finding(
      'TEXTAREA_VISUAL_MASS',
      'Large blank writing areas dominate the panel and amplify the generic-form resemblance.',
      'Textarea height, placeholder scale, and inset treatment follow the same grammar as compact single-line controls despite a different reading and writing task.'
    ));
    recommendations.push(recommendation(
      'AUTHOR_TEXTAREA_AS_WORK_SURFACE',
      'Treat long-form entry as a writing surface rather than an enlarged input box.',
      'A dedicated writing-surface treatment can reduce blank visual mass without reducing tap or text accessibility.',
      'Use a distinct inset, line-height, placeholder posture, minimum-height rhythm, and focus treatment while preserving native textarea behavior.',
      ['Keep resize/accessibility behavior available where supported.', 'Do not encode meaning through color alone.']
    ));
  }

  if (observed.dedicated_numeric_typography !== true) {
    findings.push(finding(
      'NUMERIC_SIGNAL_LOSS',
      'Money fields lack a visual cue that the content is quantitative rather than prose.',
      'Currency entry uses the same content typography as names and narrative text.'
    ));
    recommendations.push(recommendation(
      'INSTRUMENT_NUMERIC_ENTRY',
      'Give money and count fields tabular numeric behavior while leaving ordinary text fields humanist.',
      'Numeric rhythm should aid scanning without turning every input into monospace telemetry.',
      'Use tabular numerals and a restrained numeric role for amounts; keep names and prose in the primary sans family.',
      ['Do not alter numeric parsing or locale semantics.']
    ));
  }

  if (observed.native_temporal_control === true) {
    findings.push(finding(
      'NATIVE_CONTROL_SEAM',
      'Date entry can expose browser-native chrome that visually departs from the surrounding instrument.',
      'The seam belongs at the wrapper/presentation layer; replacing the native temporal control would trade visual continuity for avoidable accessibility and input risk.',
      'LOW'
    ));
    recommendations.push(recommendation(
      'STYLE_AROUND_NATIVE_TEMPORAL_CONTROL',
      'Keep native date semantics and style the containing field grammar around them.',
      'The browser should continue owning date-entry behavior while TD613 owns border, inset, spacing, focus, and contextual typography.',
      'Use wrapper-level geometry and focus lighting; avoid recreating a date picker unless native behavior becomes a proven functional blocker.',
      ['Preserve keyboard and assistive-technology semantics.', 'Preserve locale-aware date entry.']
    ));
  }

  if (observed.placeholder_is_primary_visual === true) {
    findings.push(finding(
      'PLACEHOLDER_DOMINANCE',
      'Placeholder copy reads like the main content layer before the user types, which makes empty fields feel louder and more template-like.',
      'Placeholder size/contrast competes with labels instead of behaving as a subordinate prompt.'
    ));
    recommendations.push(recommendation(
      'SUBORDINATE_PLACEHOLDER',
      'Keep placeholder text readable but visually secondary to the field label and entered value.',
      'The label carries durable meaning; the placeholder should only demonstrate shape or example content.',
      'Reduce placeholder contrast and weight while preserving sufficient readability and leaving entered text at full hierarchy.',
      ['Never use placeholder text as the only label.']
    ));
  }

  const implementationAllowed = constraints.implementation_this_round === true;
  const preserveNativeAccessibility = constraints.preserve_native_accessibility !== false;
  const diagnosis = {
    schema: PEDAGOGUE_INTERFACE_DIAGNOSIS_SCHEMA,
    surface_reference: specimen.surface_reference,
    specimen_kind: specimen.specimen_kind || 'INTERFACE_FIELD_SYSTEM',
    findings: Object.freeze(findings),
    recommendations: Object.freeze(recommendations),
    action_routing: actionRouting,
    synthesis: {
      primary_break: findings.some((item) => item.code === 'TYPOGRAPHIC_ROLE_UNDECLARED')
        ? 'The strongest discontinuity comes from an undeclared data-entry typography/role system, not from the surrounding TD613 panel design.'
        : 'No dominant typography-role discontinuity was established from the supplied specimen.',
      implementation_this_round: implementationAllowed,
      preserve_native_accessibility: preserveNativeAccessibility,
      automatic_redesign: false,
      human_closure_required: true
    },
    pedagogue_hydration: {
      capability: 'INTERFACE_CONTINUITY_AND_ACTION_ROUTE_DIAGNOSIS',
      generic_operator_added: true,
      source_surface_is_specimen_not_owner: true,
      product_mutation_authority: false,
      diagnosis_may_propose_not_apply: true
    },
    authority: {
      product_mutation_authorized: false,
      automatic_redesign: false,
      automatic_release: false,
      user_level_score: null,
      human_closure_required: true
    }
  };
  return Object.freeze(diagnosis);
}

export const _pedagogueInterfaceDiagnosisInternals = Object.freeze({ compileActionRouting });
