"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const simple_linalg_1 = require("simple-linalg");
const build_state_projection_1 = __importDefault(require("../lib/setup/build-state-projection"));
const check_dimensions_1 = __importDefault(require("../lib/setup/check-dimensions"));
const extend_dynamic_init_1 = __importDefault(require("../lib/setup/extend-dynamic-init"));
const set_dimensions_1 = __importDefault(require("../lib/setup/set-dimensions"));
const array_to_matrix_1 = __importDefault(require("../lib/utils/array-to-matrix"));
const deep_assign_1 = __importDefault(require("../lib/utils/deep-assign"));
const polymorph_matrix_1 = __importDefault(require("../lib/utils/polymorph-matrix"));
const to_function_1 = __importDefault(require("../lib/utils/to-function"));
const core_kalman_filter_1 = __importDefault(require("./core-kalman-filter"));
const modelCollection = __importStar(require("./model-collection"));
const state_1 = __importDefault(require("./state"));
const TypeAssert_1 = __importDefault(require("./types/TypeAssert"));
/**
 * @typedef {string} DynamicNonObjectConfig
 */
/**
 * @typedef {DynamicConfig} DynamicObjectConfig
 * @property {string} name
 */
/**
 * @param {DynamicNonObjectConfig} dynamic
 * @returns {DynamicObjectConfig}
 */
const buildDefaultDynamic = function (dynamic) {
    if (typeof (dynamic) === 'string') {
        return { name: dynamic };
    }
    return { name: 'constant-position' };
};
/**
 * @typedef {string | number} ObservationNonObjectConfig
 */
/**
 * @typedef {ObservationConfig} ObservationObjectConfig
 * @property {string} name
 */
/**
 * @param {ObservationNonObjectConfig} observation
 * @returns {ObservationObjectConfig}
 */
const buildDefaultObservation = function (observation) {
    if (typeof (observation) === 'number') {
        return { name: 'sensor', sensorDimension: observation };
    }
    if (typeof (observation) === 'string') {
        return { name: observation };
    }
    return { name: 'sensor' };
};
/**
 *This function fills the given options by successively checking if it uses a registered model,
 * it builds and checks the dynamic and observation dimensions, build the stateProjection if only observedProjection
 *is given, and initialize dynamic.init
 *@param {DynamicObjectConfig | DynamicNonObjectConfig} options.dynamic
 *@param {ObservationObjectConfig | ObservationNonObjectConfig} options.observation
 * @returns {CoreConfig}
 */
const setupModelsParameters = function (args) {
    let { observation, dynamic } = args;
    if (typeof (observation) !== 'object' || observation === null) {
        observation = buildDefaultObservation(observation);
    }
    if (typeof (dynamic) !== 'object' || dynamic === null) {
        dynamic = buildDefaultDynamic(dynamic /* , observation */);
    }
    if (typeof (observation.name) === 'string') {
        observation = modelCollection.buildObservation(observation);
    }
    if (typeof (dynamic.name) === 'string') {
        dynamic = modelCollection.buildDynamic(dynamic, observation);
    }
    const withDimensionOptions = (0, set_dimensions_1.default)({ observation, dynamic });
    const checkedDimensionOptions = (0, check_dimensions_1.default)(withDimensionOptions);
    const buildStateProjectionOptions = (0, build_state_projection_1.default)(checkedDimensionOptions);
    return (0, extend_dynamic_init_1.default)(buildStateProjectionOptions);
};
/**
 * Returns the corresponding model without arrays as values but only functions
 * @param {ModelsParameters} modelToBeChanged
 * @returns {CoreConfig} model with respect of the Core Kalman Filter properties
 */
const modelsParametersToCoreOptions = function (modelToBeChanged) {
    const { observation, dynamic } = modelToBeChanged;
    TypeAssert_1.default.assertNotArray(observation, 'modelsParametersToCoreOptions: observation');
    // TypeAssert.assertIsArray2D(observation.stateProjection, 'modelsParametersToCoreOptions: observation.stateProjection');
    // TypeAssert.assertIsArray2D(observation.covariance, 'modelsParametersToCoreOptions: observation.covariance');
    // TypeAssert.assertIsArray2D(dynamic.transition, 'modelsParametersToCoreOptions: dynamic.transition');
    // TypeAssert.assertIsNumbersArray(dynamic.covariance, 'modelsParametersToCoreOptions: dynamic.covariance');
    return (0, deep_assign_1.default)(modelToBeChanged, {
        observation: {
            stateProjection: (0, to_function_1.default)((0, polymorph_matrix_1.default)(observation.stateProjection), { label: 'observation.stateProjection' }),
            covariance: (0, to_function_1.default)((0, polymorph_matrix_1.default)(observation.covariance, { dimension: observation.dimension }), { label: 'observation.covariance' })
        },
        dynamic: {
            transition: (0, to_function_1.default)((0, polymorph_matrix_1.default)(dynamic.transition), { label: 'dynamic.transition' }),
            covariance: (0, to_function_1.default)((0, polymorph_matrix_1.default)(dynamic.covariance, { dimension: dynamic.dimension }), { label: 'dynamic.covariance' })
        }
    });
};
class KalmanFilter extends core_kalman_filter_1.default {
    /**
     * @typedef {object} Config
     * @property {DynamicObjectConfig | DynamicNonObjectConfig} dynamic
     * @property {ObservationObjectConfig | ObservationNonObjectConfig} observation
     */
    /**
     * @param {Config} options
     */
    // constructor(options: {observation?: ObservationConfig, dynamic?: DynamicConfig, logger?: WinstonLogger} = {}) {
    constructor(options = {}) {
        const modelsParameters = setupModelsParameters(options);
        const coreOptions = modelsParametersToCoreOptions(modelsParameters);
        super({ ...options, ...coreOptions });
    }
    // previousCorrected?: State, index?: number,
    correct(options) {
        const coreObservation = (0, array_to_matrix_1.default)({ observation: options.observation, dimension: this.observation.dimension });
        return super.correct({
            ...options,
            observation: coreObservation
        });
    }
    /**
     * Performs the prediction and the correction steps
     * @param {State} previousCorrected
     * @param {<Array.<Number>>} observation
     * @returns {Array.<number>} the mean of the corrections
     */
    filter(options) {
        const predicted = super.predict(options);
        return this.correct({
            ...options,
            predicted
        });
    }
    /**
     * Filters all the observations
     * @param {Array.<Array.<number>>} observations
     * @returns {Array.<Array.<number>>} the mean of the corrections
     */
    filterAll(observations) {
        let previousCorrected = this.getInitState();
        const results = [];
        for (const observation of observations) {
            const predicted = this.predict({ previousCorrected });
            previousCorrected = this.correct({
                predicted,
                observation
            });
            results.push(previousCorrected.mean.map(m => m[0]));
        }
        return results;
    }
    /**
     * Returns an estimation of the asymptotic state covariance as explained in https://en.wikipedia.org/wiki/Kalman_filter#Asymptotic_form
     * in practice this can be used as a init.covariance value but is very costful calculation (that's why this is not made by default)
     * @param {number} [limitIterations] max number of iterations
     * @param {number} [tolerance] returns when the last values differences are less than tolerance
     * @return {Array.<Array.<number>>} covariance
     */
    asymptoticStateCovariance({ limitIterations = 1e2, tolerance = 1e-6 } = {}) {
        let previousCorrected = super.getInitState();
        const results = [];
        for (let i = 0; i < limitIterations; i++) {
            // We create a fake mean that will not be used in order to keep coherence
            const predicted = new state_1.default({
                mean: [],
                covariance: super.getPredictedCovariance({ previousCorrected })
            });
            previousCorrected = new state_1.default({
                mean: [],
                covariance: super.getCorrectedCovariance({ predicted })
            });
            results.push(previousCorrected.covariance);
            if ((0, simple_linalg_1.frobenius)(previousCorrected.covariance, results[i - 1]) < tolerance) {
                return results[i];
            }
        }
        throw (new Error('The state covariance does not converge asymptotically'));
    }
    /**
     * Returns an estimation of the asymptotic gain, as explained in https://en.wikipedia.org/wiki/Kalman_filter#Asymptotic_form
     * @param {number} [tolerance] returns when the last values differences are less than tolerance
     * @return {Array.<Array.<number>>} gain
     */
    asymptoticGain({ tolerance = 1e-6 } = {}) {
        const covariance = this.asymptoticStateCovariance({ tolerance });
        const asymptoticState = new state_1.default({
            // We create a fake mean that will not be used in order to keep coherence
            mean: Array.from({ length: covariance.length }).fill(0).map(() => [0]),
            covariance
        });
        return super.getGain({ predicted: asymptoticState });
    }
}
exports.default = KalmanFilter;
//# sourceMappingURL=kalman-filter.js.map