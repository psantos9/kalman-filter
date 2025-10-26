import type { DynamicConfig, DynamicConfigParcial, ObservationConfig } from '../types/ObservationConfig';
/**
 * Initializes the dynamic.init when not given
 * Only used by setupModelsParameters
 * @param {ObservationConfig} observation
 * @param {DynamicConfigParcial} dynamic
 * @returns {CoreConfig}
 */
export default function extendDynamicInit(args: {
    observation: ObservationConfig;
    dynamic: DynamicConfigParcial;
}): {
    observation: ObservationConfig;
    dynamic: DynamicConfig;
};
export interface ModelsParameters {
    dynamic: DynamicConfig;
    observation: ObservationConfig;
}
//# sourceMappingURL=extend-dynamic-init.d.ts.map