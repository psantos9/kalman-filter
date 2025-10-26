"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setDimensions;
/**
 * Verifies that dimensions are matching and set dynamic.dimension and observation.dimension
 * with respect of stateProjection and transition dimensions
 * Only used by setupModelsParameters
 * @param {ObservationConfig} observation
 * @param {DynamicConfig} dynamic
 * @returns {ObservationConfig, DynamicConfig}
 */
function setDimensions(args) {
    const { observation, dynamic } = args;
    const { stateProjection } = observation;
    const { transition } = dynamic;
    const dynamicDimension = dynamic.dimension;
    const observationDimension = observation.dimension;
    if (dynamicDimension && observationDimension && Array.isArray(stateProjection) && (dynamicDimension !== stateProjection[0].length || observationDimension !== stateProjection.length)) {
        throw (new TypeError('stateProjection dimensions not matching with observation and dynamic dimensions'));
    }
    if (dynamicDimension && Array.isArray(transition) && dynamicDimension !== transition.length) {
        throw (new TypeError('transition dimension not matching with dynamic dimension'));
    }
    if (Array.isArray(stateProjection)) {
        return {
            observation: {
                ...observation,
                dimension: stateProjection.length
            },
            dynamic: {
                ...dynamic,
                dimension: stateProjection[0].length
            }
        };
    }
    if (Array.isArray(transition)) {
        return {
            observation,
            dynamic: {
                ...dynamic,
                dimension: transition.length
            }
        };
    }
    return { observation, dynamic: dynamic };
}
//# sourceMappingURL=set-dimensions.js.map