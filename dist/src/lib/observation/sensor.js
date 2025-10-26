"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sensor;
const simple_linalg_1 = require("simple-linalg");
const TypeAssert_1 = __importDefault(require("../types/TypeAssert"));
const check_matrix_1 = __importDefault(require("../utils/check-matrix"));
const polymorph_matrix_1 = __importDefault(require("../utils/polymorph-matrix"));
/**
 * @param {number} sensorDimension
 * @param {CovarianceParam} sensorCovariance
 * @param {number} nSensors
 * @returns {ObservationConfig}
 */
const copy = (mat) => mat.map(a => a.concat());
function sensor(options) {
    const { sensorDimension = 1, sensorCovariance = 1, nSensors = 1 } = options;
    const sensorCovarianceFormatted = (0, polymorph_matrix_1.default)(sensorCovariance, { dimension: sensorDimension });
    if (TypeAssert_1.default.isFunction(sensorCovarianceFormatted)) {
        throw new TypeError('sensorCovarianceFormatted can not be a function here');
    }
    (0, check_matrix_1.default)(sensorCovarianceFormatted, [sensorDimension, sensorDimension], 'observation.sensorCovariance');
    const oneSensorObservedProjection = (0, simple_linalg_1.identity)(sensorDimension);
    let concatenatedObservedProjection = [];
    const dimension = sensorDimension * nSensors;
    const concatenatedCovariance = (0, simple_linalg_1.identity)(dimension);
    for (let i = 0; i < nSensors; i++) {
        concatenatedObservedProjection = concatenatedObservedProjection.concat(copy(oneSensorObservedProjection));
        for (const [rIndex, r] of sensorCovarianceFormatted.entries()) {
            for (const [cIndex, c] of r.entries()) {
                concatenatedCovariance[rIndex + (i * sensorDimension)][cIndex + (i * sensorDimension)] = c;
            }
        }
    }
    return {
        ...options,
        dimension,
        observedProjection: concatenatedObservedProjection,
        covariance: concatenatedCovariance
    };
}
//# sourceMappingURL=sensor.js.map