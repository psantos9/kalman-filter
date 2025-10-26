"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = checkDimensions;
/**
 * Verifies that dynamic.dimension and observation.dimension are set
 * Only used by setupModelsParameters
 * @param {ObservationConfig} observation
 * @param {DynamicConfig} dynamic
 */
function checkDimensions(args) {
    const { observation, dynamic } = args;
    const dynamicDimension = dynamic.dimension;
    const observationDimension = observation.dimension;
    if (!dynamicDimension || !observationDimension) {
        throw (new TypeError('Dimension is not set'));
    }
    return { observation, dynamic };
}
//# sourceMappingURL=check-dimensions.js.map