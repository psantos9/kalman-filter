"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = nullableSensor;
const simple_linalg_1 = require("simple-linalg");
const model_collection_1 = require("../model-collection");
/**
 * @param {object} options
 * @param {number} options.sensorDimension
 * @param {CovarianceParam} options.sensorCovariance
 * @param {number} options.nSensors
 * @returns {ObservationConfig}
 */
function nullableSensor(options) {
    const { dimension, observedProjection, covariance: baseCovariance } = (0, model_collection_1.buildObservation)({ ...options, name: 'sensor' });
    return {
        dimension,
        observedProjection,
        covariance(o) {
            const covariance = (0, simple_linalg_1.identity)(dimension);
            const { variance } = o;
            variance.forEach((v, i) => {
                covariance[i][i] = v * baseCovariance[i][i];
            });
            return covariance;
        }
    };
}
//# sourceMappingURL=sensor-local-variance.js.map