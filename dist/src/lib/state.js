"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const simple_linalg_1 = require("simple-linalg");
const TypeAssert_1 = __importDefault(require("./types/TypeAssert"));
const array_to_matrix_1 = __importDefault(require("./utils/array-to-matrix"));
const check_covariance_1 = __importDefault(require("./utils/check-covariance"));
const check_matrix_1 = __importDefault(require("./utils/check-matrix"));
/**
 * Class representing a multi dimensionnal gaussian, with his mean and his covariance
 * @property {number} [index=0] the index of the State in the process, this is not mandatory for simple Kalman Filter, but is needed for most of the use case of extended kalman filter
 * @property {Array.<Array.<number>>} covariance square matrix of size dimension
 * @property {Array.<Array<number>>} mean column matrix of size dimension x 1
 */
class State {
    mean;
    covariance;
    index;
    constructor(args) {
        this.mean = args.mean;
        this.covariance = args.covariance;
        this.index = args.index || undefined;
    }
    /**
     * Check the consistency of the State
     * @param {object} options
     * @see check
     */
    check(options) {
        State.check(this, options);
    }
    /**
     * Check the consistency of the State's attributes
     * @param {State} state
     * @param {object} [options]
     * @param {Array} [options.dimension] if defined check the dimension of the state
     * @param {string} [options.title] used to log error mor explicitly
     * @param {boolean} options.eigen
     * @returns {null}
     */
    static check(state, args = {}) {
        const { dimension, title, eigen } = args;
        if (!(state instanceof State)) {
            throw (new TypeError('The argument is not a state \n'
                + 'Tips: maybe you are using 2 different version of kalman-filter in your npm deps tree'));
        }
        const { mean, covariance } = state; // Index
        const meanDimension = mean.length;
        if (typeof (dimension) === 'number' && meanDimension !== dimension) {
            throw (new Error(`[${title}] State.mean ${mean} with dimension ${meanDimension} does not match expected dimension (${dimension})`));
        }
        (0, check_matrix_1.default)(mean, [meanDimension, 1], title ? `${title}.mean` : 'mean');
        (0, check_matrix_1.default)(covariance, [meanDimension, meanDimension], title ? `${title}.covariance` : 'covariance');
        (0, check_covariance_1.default)({ covariance, eigen }, title ? `${title}.covariance` : 'covariance');
        // If (typeof (index) !== 'number') {
        // 	throw (new TypeError('t must be a number'));
        // }
    }
    /**
     * Multiply state with matrix
     * @param {State} state
     * @param {Array.<Array.<number>>} matrix
     * @returns {State}
     */
    static matMul(args) {
        const { state, matrix } = args;
        const covariance = (0, simple_linalg_1.matMul)((0, simple_linalg_1.matMul)(matrix, state.covariance), (0, simple_linalg_1.transpose)(matrix));
        const mean = (0, simple_linalg_1.matMul)(matrix, state.mean);
        return new State({
            mean,
            covariance,
            index: state.index
        });
    }
    /**
     * From a state in n-dimension create a state in a subspace
     * If you see the state as a N-dimension gaussian,
     * this can be viewed as the sub M-dimension gaussian (M < N)
     * @param {Array.<number>} obsIndexes list of dimension to extract,  (M < N <=> obsIndexes.length < this.mean.length)
     * @returns {State} subState in subspace, with subState.mean.length === obsIndexes.length
     */
    subState(obsIndexes) {
        const state = new State({
            mean: obsIndexes.map(i => this.mean[i]),
            covariance: (0, simple_linalg_1.subSquareMatrix)(this.covariance, obsIndexes),
            index: this.index
        });
        return state;
    }
    /**
     * @typedef {object} DetailedMahalanobis
     * @property {Array.<[number]>} diff
     * @property {Array.<Array.<number>>} covarianceInvert
     * @property {number} value
     */
    /**
     * Simple Malahanobis distance between the distribution (this) and a point
     * @param {Array.<[number]>} point a Nx1 matrix representing a point
     * @returns {DetailedMahalanobis}
     */
    rawDetailedMahalanobis(point) {
        const diff = (0, simple_linalg_1.subtract)(this.mean, point);
        this.check();
        const covarianceInvert = (0, simple_linalg_1.invert)(this.covariance);
        if (covarianceInvert === null) {
            this.check({ eigen: true });
            throw (new Error(`Cannot invert covariance ${JSON.stringify(this.covariance)}`));
        }
        const diffTransposed = (0, simple_linalg_1.transpose)(diff);
        // Console.log('covariance in obs space', covarianceInObservationSpace);
        const valueMatrix = (0, simple_linalg_1.matMul)((0, simple_linalg_1.matMul)(diffTransposed, covarianceInvert), diff);
        // Calculate the Mahalanobis distance value
        const value = Math.sqrt(valueMatrix[0][0]);
        if (Number.isNaN(value)) {
            const debugValue = (0, simple_linalg_1.matMul)((0, simple_linalg_1.matMul)(diffTransposed, covarianceInvert), diff);
            console.log({
                diff,
                covarianceInvert,
                this: this,
                point
            }, debugValue);
            throw (new Error('mahalanobis is NaN'));
        }
        return {
            diff,
            covarianceInvert,
            value
        };
    }
    /**
     * Malahanobis distance is made against an observation, so the mean and covariance
     * are projected into the observation space
     * @param {KalmanFilter} kf kalman filter use to project the state in observation's space
     * @param {Observation} observation
     * @param {Array.<number>} obsIndexes list of indexes of observation state to use for the mahalanobis distance
     * @returns {DetailedMahalanobis}
     */
    detailedMahalanobis(args) {
        const { kf, observation, obsIndexes } = args;
        if (observation.length !== kf.observation.dimension) {
            throw (new Error(`Mahalanobis observation ${observation} (dimension: ${observation.length}) does not match with kf observation dimension (${kf.observation.dimension})`));
        }
        let correctlySizedObservation = (0, array_to_matrix_1.default)({ observation, dimension: observation.length });
        TypeAssert_1.default.assertIsArray2D(kf.observation.stateProjection, 'State.detailedMahalanobis');
        const stateProjection = kf.getValue(kf.observation.stateProjection, {});
        let projectedState = State.matMul({ state: this, matrix: stateProjection });
        if (Array.isArray(obsIndexes)) {
            projectedState = projectedState.subState(obsIndexes);
            correctlySizedObservation = obsIndexes.map(i => correctlySizedObservation[i]);
        }
        return projectedState.rawDetailedMahalanobis(correctlySizedObservation);
    }
    /**
     * @param {object} options @see detailedMahalanobis
     * @returns {number}
     */
    mahalanobis(options) {
        const result = this.detailedMahalanobis(options).value;
        if (Number.isNaN(result)) {
            throw (new TypeError('mahalanobis is NaN'));
        }
        return result;
    }
    /**
     * Bhattacharyya distance is made against in the observation space
     * to do it in the normal space see state.bhattacharyya
     * @param {KalmanFilter} kf kalman filter use to project the state in observation's space
     * @param {State} state
     * @param {Array.<number>} obsIndexes list of indexes of observation state to use for the bhattacharyya distance
     * @returns {number}
     */
    obsBhattacharyya(options) {
        const { kf, state, obsIndexes } = options;
        TypeAssert_1.default.assertIsArray2D(kf.observation.stateProjection, 'State.obsBhattacharyya');
        const stateProjection = kf.getValue(kf.observation.stateProjection, {});
        let projectedSelfState = State.matMul({ state: this, matrix: stateProjection });
        let projectedOtherState = State.matMul({ state, matrix: stateProjection });
        if (Array.isArray(obsIndexes)) {
            projectedSelfState = projectedSelfState.subState(obsIndexes);
            projectedOtherState = projectedOtherState.subState(obsIndexes);
        }
        return projectedSelfState.bhattacharyya(projectedOtherState);
    }
    /**
     * @param {State} otherState other state to compare with
     * @returns {number}
     */
    bhattacharyya(otherState) {
        const { covariance, mean } = this;
        const average = (0, simple_linalg_1.elemWise)([covariance, otherState.covariance], ([a, b]) => (a + b) / 2);
        let covarInverted;
        try {
            covarInverted = (0, simple_linalg_1.invert)(average);
        }
        catch (error) {
            console.log('Cannot invert', average);
            throw error;
        }
        const diff = (0, simple_linalg_1.subtract)(mean, otherState.mean);
        return (0, simple_linalg_1.matMul)((0, simple_linalg_1.transpose)(diff), (0, simple_linalg_1.matMul)(covarInverted, diff))[0][0];
    }
}
exports.default = State;
//# sourceMappingURL=state.js.map