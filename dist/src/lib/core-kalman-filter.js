"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const simple_linalg_1 = require("simple-linalg");
const state_1 = __importDefault(require("./state"));
const TypeAssert_1 = __importDefault(require("./types/TypeAssert"));
const check_matrix_1 = __importDefault(require("./utils/check-matrix"));
const defaultLogger = {
    info: (...args) => console.log(...args),
    debug() { },
    warn: (...args) => console.log(...args),
    error: (...args) => console.log(...args)
};
class CoreKalmanFilter {
    dynamic;
    observation;
    logger;
    constructor(options) {
        const { dynamic, observation, logger = defaultLogger } = options;
        this.dynamic = dynamic;
        this.observation = observation;
        this.logger = logger;
    }
    // | number[]
    getValue(fn, options) {
        return (typeof (fn) === 'function' ? fn(options) : fn);
    }
    getInitState() {
        const { mean: meanInit, covariance: covarianceInit, index: indexInit } = this.dynamic.init;
        const initState = new state_1.default({
            mean: meanInit,
            covariance: covarianceInit,
            index: indexInit
        });
        state_1.default.check(initState, { title: 'dynamic.init' });
        return initState;
    }
    /**
      This will return the predicted covariance of a given previousCorrected State, this will help us to build the asymptoticState.
     * @param {State} previousCorrected
     * @returns{Array.<Array.<Number>>}
     */
    getPredictedCovariance(options = {}) {
        let { previousCorrected, index } = options;
        previousCorrected ||= this.getInitState();
        const getValueOptions = { previousCorrected, index, ...options };
        const transition = this.getValue(this.dynamic.transition, getValueOptions);
        (0, check_matrix_1.default)(transition, [this.dynamic.dimension, this.dynamic.dimension], 'dynamic.transition');
        const transitionTransposed = (0, simple_linalg_1.transpose)(transition);
        const covarianceInter = (0, simple_linalg_1.matMul)(transition, previousCorrected.covariance);
        const covariancePrevious = (0, simple_linalg_1.matMul)(covarianceInter, transitionTransposed);
        const dynCov = this.getValue(this.dynamic.covariance, getValueOptions);
        const covariance = (0, simple_linalg_1.add)(dynCov, covariancePrevious);
        (0, check_matrix_1.default)(covariance, [this.dynamic.dimension, this.dynamic.dimension], 'predicted.covariance');
        return covariance;
    }
    predictMean(o) {
        const mean = this.predictMeanWithoutControl(o);
        if (!this.dynamic.constant) {
            return mean;
        }
        const { opts } = o;
        const control = this.dynamic.constant(opts);
        (0, check_matrix_1.default)(control, [this.dynamic.dimension, 1], 'dynamic.constant');
        return (0, simple_linalg_1.add)(mean, control);
    }
    predictMeanWithoutControl(args) {
        const { opts, transition } = args;
        if (this.dynamic.fn) {
            return this.dynamic.fn(opts);
        }
        const { previousCorrected } = opts;
        return (0, simple_linalg_1.matMul)(transition, previousCorrected.mean);
    }
    /**
      This will return the new prediction, relatively to the dynamic model chosen
     * @param {State} previousCorrected State relative to our dynamic model
     * @returns{State} predicted State
     */
    predict(options = {}) {
        let { previousCorrected, index } = options;
        previousCorrected ||= this.getInitState();
        if (typeof (index) !== 'number' && typeof (previousCorrected.index) === 'number') {
            index = previousCorrected.index + 1;
        }
        state_1.default.check(previousCorrected, { dimension: this.dynamic.dimension });
        const getValueOptions = {
            ...options,
            previousCorrected,
            index
        };
        const transition = this.getValue(this.dynamic.transition, getValueOptions);
        const mean = this.predictMean({ transition, opts: getValueOptions });
        const covariance = this.getPredictedCovariance(getValueOptions);
        const predicted = new state_1.default({ mean, covariance, index });
        this.logger.debug('Prediction done', predicted);
        if (Number.isNaN(predicted.mean[0][0])) {
            throw (new TypeError('nan'));
        }
        return predicted;
    }
    /**
     * This will return the new correction, taking into account the prediction made
     * and the observation of the sensor
     * param {State} predicted the previous State
     * @param options
     * @returns kalmanGain
     */
    getGain(options) {
        let { predicted, stateProjection } = options;
        const getValueOptions = {
            index: predicted.index,
            ...options
        };
        TypeAssert_1.default.assertIsArray2DOrFnc(this.observation.stateProjection, 'CoreKalmanFilter.getGain');
        stateProjection ||= this.getValue(this.observation.stateProjection, getValueOptions);
        const obsCovariance = this.getValue(this.observation.covariance, getValueOptions);
        (0, check_matrix_1.default)(obsCovariance, [this.observation.dimension, this.observation.dimension], 'observation.covariance');
        const stateProjTransposed = (0, simple_linalg_1.transpose)(stateProjection);
        (0, check_matrix_1.default)(stateProjection, [this.observation.dimension, this.dynamic.dimension], 'observation.stateProjection');
        const noiselessInnovation = (0, simple_linalg_1.matMul)((0, simple_linalg_1.matMul)(stateProjection, predicted.covariance), stateProjTransposed);
        const innovationCovariance = (0, simple_linalg_1.add)(noiselessInnovation, obsCovariance);
        const optimalKalmanGain = (0, simple_linalg_1.matMul)((0, simple_linalg_1.matMul)(predicted.covariance, stateProjTransposed), (0, simple_linalg_1.invert)(innovationCovariance));
        return optimalKalmanGain;
    }
    /**
     * This will return the corrected covariance of a given predicted State, this will help us to build the asymptoticState.
     * @param {State} predicted the previous State
     * @returns{Array.<Array.<Number>>}
     */
    getCorrectedCovariance(options) {
        let { predicted, optimalKalmanGain, stateProjection } = options;
        const identity = (0, simple_linalg_1.identity)(predicted.covariance.length);
        if (!stateProjection) {
            TypeAssert_1.default.assertIsArray2D(this.observation.stateProjection, 'CoreKalmanFilter.getCorrectedCovariance');
            const getValueOptions = {
                index: predicted.index,
                ...options
            };
            stateProjection = this.getValue(this.observation.stateProjection, getValueOptions);
        }
        optimalKalmanGain ||= this.getGain({ stateProjection, ...options });
        return (0, simple_linalg_1.matMul)((0, simple_linalg_1.subtract)(identity, (0, simple_linalg_1.matMul)(optimalKalmanGain, stateProjection)), predicted.covariance);
    }
    getPredictedObservation(args) {
        const { opts, stateProjection } = args;
        if (this.observation.fn) {
            return this.observation.fn(opts);
        }
        const { predicted } = opts;
        return (0, simple_linalg_1.matMul)(stateProjection, predicted.mean);
    }
    /**
      This will return the new correction, taking into account the prediction made
      and the observation of the sensor
     * @param {State} predicted the previous State
     * @param {Array} observation the observation of the sensor
     * @returns{State} corrected State of the Kalman Filter
     */
    correct(options) {
        const { predicted, observation } = options;
        state_1.default.check(predicted, { dimension: this.dynamic.dimension });
        if (!observation) {
            throw (new Error('no measure available'));
        }
        const getValueOptions = {
            observation,
            predicted,
            index: predicted.index,
            ...options
        };
        TypeAssert_1.default.assertIsArray2DOrFnc(this.observation.stateProjection, 'CoreKalmanFilter.correct');
        const stateProjection = this.getValue(this.observation.stateProjection, getValueOptions);
        const optimalKalmanGain = this.getGain({
            predicted,
            stateProjection,
            ...options
        });
        const innovation = (0, simple_linalg_1.subtract)(observation, this.getPredictedObservation({ stateProjection, opts: getValueOptions }));
        const mean = (0, simple_linalg_1.add)(predicted.mean, (0, simple_linalg_1.matMul)(optimalKalmanGain, innovation));
        if (Number.isNaN(mean[0][0])) {
            console.log({ optimalKalmanGain, innovation, predicted });
            throw (new TypeError('Mean is NaN after correction'));
        }
        const covariance = this.getCorrectedCovariance({
            predicted,
            optimalKalmanGain,
            stateProjection,
            ...options
        });
        const corrected = new state_1.default({ mean, covariance, index: predicted.index });
        this.logger.debug('Correction done', corrected);
        return corrected;
    }
}
exports.default = CoreKalmanFilter;
//# sourceMappingURL=core-kalman-filter.js.map