import { A15_R0_SCHEMAS, validateProjectionDescriptor } from './a15-r0-contracts.js';

const COMMON = Object.freeze({
  schema: A15_R0_SCHEMAS.descriptor,
  version: 'v0.1',
  canonical: false,
  preview_only: true,
  disposable: true,
  kernel_adapter: 'td613.ash.a15-r0.kernel-adapter/v0.1',
  declared_controls: Object.freeze([]),
  declared_world_answers: Object.freeze([]),
  technical_descent_optional: true,
  animation_required: false,
  production_cutover_authorized: false,
  deployment_authorized: false,
  human_selection_required: true
});

export const A15_R0_PROJECTIONS = Object.freeze([
  Object.freeze({
    ...COMMON,
    projection_id: 'A15_CONTROL',
    label: 'A15 control witness',
    implementation_status: 'OBSERVABLE_CONTROL',
    entry_route: '/dome-world/ash-keep.html',
    mutated_by_assay: false
  }),
  Object.freeze({
    ...COMMON,
    projection_id: 'MINIMAL_ASH',
    label: 'Minimal Ash',
    implementation_status: 'NOT_IMPLEMENTED',
    entry_route: null,
    mutated_by_assay: false
  }),
  Object.freeze({
    ...COMMON,
    projection_id: 'PROTO_LOOM',
    label: 'Proto-Loom',
    implementation_status: 'NOT_IMPLEMENTED',
    entry_route: null,
    mutated_by_assay: false
  })
]);

for (const descriptor of A15_R0_PROJECTIONS) validateProjectionDescriptor(descriptor);

export function getProjectionDescriptor(projectionId) {
  return A15_R0_PROJECTIONS.find(descriptor => descriptor.projection_id === projectionId) || null;
}
