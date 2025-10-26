import type { DynamicConfig, ObservationConfig, WinstonLogger } from './types/ObservationConfig';
import CoreKalmanFilter from './core-kalman-filter';
import State from './state';
export interface ModelsParameters {
    dynamic: DynamicConfig;
    observation: ObservationConfig;
}
export default class KalmanFilter extends CoreKalmanFilter {
    /**
     * @typedef {object} Config
     * @property {DynamicObjectConfig | DynamicNonObjectConfig} dynamic
     * @property {ObservationObjectConfig | ObservationNonObjectConfig} observation
     */
    /**
     * @param {Config} options
     */
    constructor(options?: {
        observation?: any | {
            name: string;
        };
        dynamic?: any | {
            name: string;
        };
        logger?: WinstonLogger;
    });
    correct(options: {
        predicted: State;
        observation: number[] | number[][];
    }): State;
    /**
     * Performs the prediction and the correction steps
     * @param {State} previousCorrected
     * @param {<Array.<Number>>} observation
     * @returns {Array.<number>} the mean of the corrections
     */
    filter(options: {
        previousCorrected?: State;
        index?: number;
        observation: number[] | number[][];
    }): State;
    /**
     * Filters all the observations
     * @param {Array.<Array.<number>>} observations
     * @returns {Array.<Array.<number>>} the mean of the corrections
     */
    filterAll(observations: any): number[][];
    /**
     * Returns an estimation of the asymptotic state covariance as explained in https://en.wikipedia.org/wiki/Kalman_filter#Asymptotic_form
     * in practice this can be used as a init.covariance value but is very costful calculation (that's why this is not made by default)
     * @param {number} [limitIterations] max number of iterations
     * @param {number} [tolerance] returns when the last values differences are less than tolerance
     * @return {Array.<Array.<number>>} covariance
     */
    asymptoticStateCovariance({ limitIterations, tolerance }?: {
        limitIterations?: number;
        tolerance?: number;
    }): number[][];
    /**
     * Returns an estimation of the asymptotic gain, as explained in https://en.wikipedia.org/wiki/Kalman_filter#Asymptotic_form
     * @param {number} [tolerance] returns when the last values differences are less than tolerance
     * @return {Array.<Array.<number>>} gain
     */
    asymptoticGain({ tolerance }?: {
        tolerance?: number;
    }): number[][];
}
//# sourceMappingURL=kalman-filter.d.ts.map