export const PEDAGOGUE_RESPONSIVE_HIERARCHY_SPECIMEN_SCHEMA = 'td613.pedagogue-responsive-hierarchy-specimen/v0.1';
export const PEDAGOGUE_RESPONSIVE_HIERARCHY_DIAGNOSIS_SCHEMA = 'td613.pedagogue-responsive-hierarchy-diagnosis/v0.1';

function finding(code, consequence, exact, severity = 'MEDIUM') {
  return Object.freeze({ code, severity, consequence, exact });
}

function recommendation(code, now, why, exact, guardrails = []) {
  return Object.freeze({ code, now, why, exact, guardrails: Object.freeze([...guardrails]) });
}

export function compilePedagogueResponsiveHierarchyDiagnosis(specimen = {}) {
  if (specimen.schema !== PEDAGOGUE_RESPONSIVE_HIERARCHY_SPECIMEN_SCHEMA) {
    throw new Error(`Expected ${PEDAGOGUE_RESPONSIVE_HIERARCHY_SPECIMEN_SCHEMA}.`);
  }
  if (typeof specimen.surface_reference !== 'string' || !specimen.surface_reference.trim()) {
    throw new Error('Responsive hierarchy diagnosis requires surface_reference.');
  }

  const observed = specimen.observed || {};
  const constraints = specimen.constraints || {};
  const findings = [];
  const recommendations = [];

  if (observed.temporal_constraint_visual_dominance === true) {
    findings.push(finding(
      'TEMPORAL_CONSTRAINT_OVERSTATEMENT',
      'Ordinary date bounds acquire card-level visual mass and begin to read as the primary task rather than as two quiet search constraints.',
      'The responsive treatment adds height, rounded enclosure, and strong inset chrome to a native temporal control whose semantic role is only to bound retrieval time.'
    ));
    recommendations.push(recommendation(
      'QUIET_TEMPORAL_CONSTRAINT',
      'Reduce the date pair to compact single-line temporal boundaries while keeping both fields side by side.',
      'A date boundary should scan quickly and yield hierarchy to the contributor/search task around it.',
      'Keep the labels, preserve a platform-safe 16px value, remove chamber-like radius/background/box-shadow, and use a restrained baseline or hairline boundary inside each grid cell.',
      ['Keep both dates inside the responsive container.', 'Do not stack the pair on narrow mobile.', 'Do not make the date value smaller merely to create elegance.']
    ));
  }

  if (observed.secondary_constraint_visual_dominance === true) {
    findings.push(finding(
      'SECONDARY_CONSTRAINT_OVERSTATEMENT',
      'An optional modifier consumes subsection-level height and framing, implying more authority than the underlying search consequence warrants.',
      'The committee filter is subordinate to contributor retrieval, but a large bordered teaching card makes it read like a separate primary workflow.'
    ));
    recommendations.push(recommendation(
      'COMPRESS_OPTIONAL_CONSTRAINT',
      'Render the optional committee filter as one compact modifier band rather than a teaching panel.',
      'The operator needs the toggle, the route to choose context, and a bounded status—not a new visual chapter.',
      'Keep checkbox + label as the primary line; demote or suppress explanatory copy on narrow mobile; keep the committee route visibly interactive; render status as terse subordinate telemetry.',
      ['Do not hide the fact that committee filtering is optional.', 'Do not auto-select a committee.', 'Do not remove the guard when the filter is armed without context.']
    ));
  }

  if (observed.native_temporal_semantics_required === true) {
    findings.push(finding(
      'NATIVE_TEMPORAL_SEMANTICS_PROTECTIVE',
      'The native date input carries locale, picker, keyboard, and assistive-technology behavior that should survive visual simplification.',
      'The visual defect belongs to chrome and hierarchy rather than to the date input semantic itself.',
      'LOW'
    ));
    recommendations.push(recommendation(
      'PRESERVE_NATIVE_DATE_BEHAVIOR',
      'Keep input[type=date] and remove only the ornamental chrome that overstates its role.',
      'A quieter presentation should not require rebuilding the date picker or changing stored/query values.',
      'Retain the native input type and value semantics; use CSS appearance/chrome rules only at the presentation layer and preserve full tap/keyboard activation.',
      ['Do not replace date semantics with free text.', 'Preserve locale-aware interaction.', 'Preserve assistive-technology naming.']
    ));
  }

  if (observed.route_affordance_must_remain_explicit === true) {
    findings.push(finding(
      'COMPRESSION_MUST_NOT_HIDE_ROUTE',
      'Reducing visual mass can accidentally erase the only obvious route from a secondary constraint to the context it depends on.',
      'A compact committee modifier still needs an unmistakable human gesture that reaches Candidate & committee lookup.'
    ));
    recommendations.push(recommendation(
      'KEEP_COMPACT_ROUTE_EXPLICIT',
      'Preserve a visibly underlined or button-like committee jump while compressing surrounding explanation.',
      'Hierarchy can become quieter without turning the route back into mystery prose.',
      'Keep the route centered or otherwise intentionally separated from passive helper text, with keyboard focus and an explicit accessible label.',
      ['Do not encode the route through color alone.', 'Do not navigate until the operator activates it.']
    ));
  }

  return Object.freeze({
    schema: PEDAGOGUE_RESPONSIVE_HIERARCHY_DIAGNOSIS_SCHEMA,
    surface_reference: specimen.surface_reference,
    specimen_kind: specimen.specimen_kind || 'RESPONSIVE_HIERARCHY_REPROCESS',
    findings: Object.freeze(findings),
    recommendations: Object.freeze(recommendations),
    synthesis: Object.freeze({
      implementation_this_round: constraints.implementation_this_round === true,
      preserve_native_accessibility: constraints.preserve_native_accessibility !== false,
      preserve_route_affordance: constraints.preserve_route_affordance !== false,
      automatic_redesign: false,
      human_closure_required: true
    }),
    pedagogue_hydration: Object.freeze({
      capability: 'RESPONSIVE_ROLE_WEIGHT_AND_SECONDARY_CONSTRAINT_DIAGNOSIS',
      generic_operator_added: true,
      source_surface_is_specimen_not_owner: true,
      product_mutation_authority: false,
      diagnosis_may_propose_not_apply: true
    }),
    authority: Object.freeze({
      product_mutation_authorized: false,
      automatic_redesign: false,
      automatic_release: false,
      human_closure_required: true
    })
  });
}
