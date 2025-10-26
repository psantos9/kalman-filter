import type { DynamicConfigParcial, DynamicConfigParcialNoDim } from '../types/ObservationConfig';
/**
 * Verifies that dimensions are matching and set dynamic.dimension and observation.dimension
 * with respect of stateProjection and transition dimensions
 * Only used by setupModelsParameters
 * @param {ObservationConfig} observation
 * @param {DynamicConfig} dynamic
 * @returns {ObservationConfig, DynamicConfig}
 */
export default function setDimensions(args: {
    observation: any;
    dynamic: DynamicConfigParcialNoDim;
}): {
    observation: any;
    dynamic: DynamicConfigParcial;
};
//# sourceMappingURL=set-dimensions.d.ts.map