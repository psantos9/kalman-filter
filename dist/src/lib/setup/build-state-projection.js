"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = buildStateProjection;
const simple_linalg_1 = require("simple-linalg");
/**
 * Builds the stateProjection given an observedProjection
 * Only used by setupModelsParameters
 * @param {ObservationConfig} observation
 * @param {DynamicConfig} dynamic
 * @returns {ObservationConfig, DynamicConfig} the model containing the created stateProjection
 */
function buildStateProjection(args) {
    const { observation, dynamic } = args;
    const { observedProjection, stateProjection } = observation;
    const observationDimension = observation.dimension;
    const dynamicDimension = dynamic.dimension;
    if (observedProjection && stateProjection) {
        throw (new TypeError('You cannot use both observedProjection and stateProjection'));
    }
    if (observedProjection) {
        const stateProjection = (0, simple_linalg_1.padWithZeroCols)(observedProjection, { columns: dynamicDimension });
        return {
            observation: {
                ...observation,
                stateProjection
            },
            dynamic
        };
    }
    if (observationDimension && dynamicDimension && !stateProjection) {
        const observationMatrix = (0, simple_linalg_1.identity)(observationDimension);
        return {
            observation: {
                ...observation,
                stateProjection: (0, simple_linalg_1.padWithZeroCols)(observationMatrix, { columns: dynamicDimension })
            },
            dynamic
        };
    }
    return { observation, dynamic };
}
//# sourceMappingURL=build-state-projection.js.map