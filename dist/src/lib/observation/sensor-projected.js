"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sensorProjected;
const simple_linalg_1 = require("simple-linalg");
const correlation_to_covariance_1 = __importDefault(require("../utils/correlation-to-covariance"));
const covariance_to_correlation_1 = __importDefault(require("../utils/covariance-to-correlation"));
/**
 *Creates an observation model with a observedProjection corresponding to
 * @param {DynamicConfig} dynamic
 * @param {ObservationConfig} observation
 * @returns {DynamicConfig}
 */
function sensorProjected({ selectedCovariance, totalDimension, obsIndexes, selectedStateProjection }) {
    if (!selectedStateProjection) {
        selectedStateProjection = Array.from({ length: obsIndexes.length }).fill(0).map(() => Array.from({ length: obsIndexes.length }).fill(0));
        obsIndexes.forEach((index1, i1) => {
            selectedStateProjection[i1][i1] = 1;
        });
    }
    else if (selectedStateProjection.length !== obsIndexes.length) {
        throw (new Error(`[Sensor-projected] Shape mismatch between ${selectedStateProjection.length} and ${obsIndexes.length}`));
    }
    const baseCovariance = (0, simple_linalg_1.identity)(totalDimension);
    obsIndexes.forEach((index1, i1) => {
        if (selectedCovariance) {
            obsIndexes.forEach((index2, i2) => {
                baseCovariance[index1][index2] = selectedCovariance[i1][i2];
            });
        }
    });
    const { correlation: baseCorrelation, variance: baseVariance } = (0, covariance_to_correlation_1.default)(baseCovariance);
    const dynaDimension = selectedStateProjection[0].length;
    if (selectedStateProjection.length !== obsIndexes.length) {
        throw (new Error(`shape mismatch (${selectedStateProjection.length} vs ${obsIndexes.length})`));
    }
    const observedProjection = (0, simple_linalg_1.matPermutation)({
        outputSize: [totalDimension, dynaDimension],
        colIndexes: selectedStateProjection[0].map((_, i) => i),
        rowIndexes: obsIndexes,
        matrix: selectedStateProjection
    });
    return {
        dimension: totalDimension,
        observedProjection,
        covariance(o) {
            const { variance } = o;
            if (!variance) {
                return baseCovariance;
            }
            if (variance.length !== baseCovariance.length) {
                throw (new Error('variance is difference size from baseCovariance'));
            }
            const result = (0, correlation_to_covariance_1.default)({ correlation: baseCorrelation, variance: baseVariance.map((b, i) => variance[i] * b) });
            return result;
        }
    };
}
//# sourceMappingURL=sensor-projected.js.map