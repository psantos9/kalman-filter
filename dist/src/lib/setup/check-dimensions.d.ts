import type { DynamicConfigParcial } from '../types/ObservationConfig';
/**
 * Verifies that dynamic.dimension and observation.dimension are set
 * Only used by setupModelsParameters
 * @param {ObservationConfig} observation
 * @param {DynamicConfig} dynamic
 */
export default function checkDimensions(args: {
    observation: any;
    dynamic: DynamicConfigParcial;
}): {
    observation: any;
    dynamic: DynamicConfigParcial;
};
//# sourceMappingURL=check-dimensions.d.ts.map