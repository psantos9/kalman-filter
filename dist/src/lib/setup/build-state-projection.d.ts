import type { DynamicConfigParcial } from '../types/ObservationConfig';
/**
 * Builds the stateProjection given an observedProjection
 * Only used by setupModelsParameters
 * @param {ObservationConfig} observation
 * @param {DynamicConfig} dynamic
 * @returns {ObservationConfig, DynamicConfig} the model containing the created stateProjection
 */
export default function buildStateProjection(args: {
    observation: any;
    dynamic: DynamicConfigParcial;
}): {
    observation: any;
    dynamic: DynamicConfigParcial;
};
//# sourceMappingURL=build-state-projection.d.ts.map