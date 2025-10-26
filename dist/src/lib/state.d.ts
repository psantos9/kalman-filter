import type KalmanFilter from './kalman-filter';
import type { StateLT } from './types/StateLT';
/**
 * Class representing a multi dimensionnal gaussian, with his mean and his covariance
 * @property {number} [index=0] the index of the State in the process, this is not mandatory for simple Kalman Filter, but is needed for most of the use case of extended kalman filter
 * @property {Array.<Array.<number>>} covariance square matrix of size dimension
 * @property {Array.<Array<number>>} mean column matrix of size dimension x 1
 */
export default class State implements StateLT {
    mean: number[][];
    covariance: number[][];
    index: number | undefined;
    constructor(args: {
        mean: number[][];
        covariance: number[][];
        index?: number;
    });
    /**
     * Check the consistency of the State
     * @param {object} options
     * @see check
     */
    check(options?: {
        dimension?: number | null;
        title?: string;
        eigen?: boolean;
    }): void;
    /**
     * Check the consistency of the State's attributes
     * @param {State} state
     * @param {object} [options]
     * @param {Array} [options.dimension] if defined check the dimension of the state
     * @param {string} [options.title] used to log error mor explicitly
     * @param {boolean} options.eigen
     * @returns {null}
     */
    static check(state: State, args?: {
        dimension?: number | null;
        title?: string;
        eigen?: boolean;
    }): void;
    /**
     * Multiply state with matrix
     * @param {State} state
     * @param {Array.<Array.<number>>} matrix
     * @returns {State}
     */
    static matMul(args: {
        state: State;
        matrix: number[][];
    }): State;
    /**
     * From a state in n-dimension create a state in a subspace
     * If you see the state as a N-dimension gaussian,
     * this can be viewed as the sub M-dimension gaussian (M < N)
     * @param {Array.<number>} obsIndexes list of dimension to extract,  (M < N <=> obsIndexes.length < this.mean.length)
     * @returns {State} subState in subspace, with subState.mean.length === obsIndexes.length
     */
    subState(obsIndexes: number[]): State;
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
    rawDetailedMahalanobis(point: number[][]): {
        diff: number[][];
        covarianceInvert: number[][];
        value: number;
    };
    /**
     * Malahanobis distance is made against an observation, so the mean and covariance
     * are projected into the observation space
     * @param {KalmanFilter} kf kalman filter use to project the state in observation's space
     * @param {Observation} observation
     * @param {Array.<number>} obsIndexes list of indexes of observation state to use for the mahalanobis distance
     * @returns {DetailedMahalanobis}
     */
    detailedMahalanobis(args: {
        kf: KalmanFilter;
        observation: number[][] | number[];
        obsIndexes?: number[];
    }): {
        diff: number[][];
        covarianceInvert: number[][];
        value: number;
    };
    /**
     * @param {object} options @see detailedMahalanobis
     * @returns {number}
     */
    mahalanobis(options: {
        kf: KalmanFilter;
        observation: number[][] | number[];
        obsIndexes?: number[];
    }): number;
    /**
     * Bhattacharyya distance is made against in the observation space
     * to do it in the normal space see state.bhattacharyya
     * @param {KalmanFilter} kf kalman filter use to project the state in observation's space
     * @param {State} state
     * @param {Array.<number>} obsIndexes list of indexes of observation state to use for the bhattacharyya distance
     * @returns {number}
     */
    obsBhattacharyya(options: {
        kf: KalmanFilter;
        state: State;
        obsIndexes: number[];
    }): number;
    /**
     * @param {State} otherState other state to compare with
     * @returns {number}
     */
    bhattacharyya(otherState: State): number;
}
//# sourceMappingURL=state.d.ts.map