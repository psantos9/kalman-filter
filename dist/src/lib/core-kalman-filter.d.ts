import type { CoreConfig, DynamicConfig, ObservationConfig, PredictedCallback, PreviousCorrectedCallback, WinstonLogger } from './types/ObservationConfig';
import State from './state';
export default class CoreKalmanFilter {
    dynamic: DynamicConfig;
    observation: ObservationConfig;
    logger: WinstonLogger;
    constructor(options: CoreConfig);
    getValue(fn: number[][] | PreviousCorrectedCallback | PredictedCallback, options: any): number[][];
    getInitState(): State;
    /**
      This will return the predicted covariance of a given previousCorrected State, this will help us to build the asymptoticState.
     * @param {State} previousCorrected
     * @returns{Array.<Array.<Number>>}
     */
    getPredictedCovariance(options?: {
        previousCorrected?: State;
        index?: number;
    }): number[][];
    predictMean(o: {
        opts: any;
        transition: number[][];
    }): number[][];
    predictMeanWithoutControl(args: {
        opts: any;
        transition: number[][];
    }): number[][];
    /**
      This will return the new prediction, relatively to the dynamic model chosen
     * @param {State} previousCorrected State relative to our dynamic model
     * @returns{State} predicted State
     */
    predict(options?: {
        previousCorrected?: State;
        index?: number;
        observation?: number[] | number[][];
    }): State;
    /**
     * This will return the new correction, taking into account the prediction made
     * and the observation of the sensor
     * param {State} predicted the previous State
     * @param options
     * @returns kalmanGain
     */
    getGain(options: {
        predicted: State;
        stateProjection?: number[][];
    }): number[][];
    /**
     * This will return the corrected covariance of a given predicted State, this will help us to build the asymptoticState.
     * @param {State} predicted the previous State
     * @returns{Array.<Array.<Number>>}
     */
    getCorrectedCovariance(options: {
        predicted: State;
        optimalKalmanGain?: any;
        stateProjection?: any;
    }): number[][];
    getPredictedObservation(args: {
        opts: any;
        stateProjection: number[][];
    }): number[][];
    /**
      This will return the new correction, taking into account the prediction made
      and the observation of the sensor
     * @param {State} predicted the previous State
     * @param {Array} observation the observation of the sensor
     * @returns{State} corrected State of the Kalman Filter
     */
    correct(options: {
        predicted: any;
        observation: any;
    }): State;
}
//# sourceMappingURL=core-kalman-filter.d.ts.map