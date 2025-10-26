import type { StateLT } from './StateLT';
interface Observation {
    name: string;
}
export type PreviousCorrectedCallback = (opts: {
    index: number;
    previousCorrected?: StateLT;
    predicted: StateLT;
    variance?: number[];
}) => number[][];
export type PredictedCallback = (opts: {
    index: number;
    previousCorrected?: StateLT;
    predicted: StateLT;
    observation?: Observation;
}) => number[][];
export interface WinstonLogger {
    info: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
}
export interface DynamicConfig {
    /**
     * named this config.
     */
    name?: string;
    dimension?: number;
    /**
     * a function that returns the control parameter B_k*u_k of the kalman filter
     */
    constant?: PreviousCorrectedCallback;
    /**
     * for extended kalman filter only, the non-linear state-transition model
     */
    fn?: PreviousCorrectedCallback;
    /**
     * the state-transition model (or for EKF the jacobian of the fn)
     */
    transition: number[][] | PredictedCallback;
    /**
     * covariance the covariance of the process noise
     */
    covariance: number[] | number[][] | PredictedCallback;
    /**
     *
     */
    init: StateLT;
    timeStep?: number;
}
/**
 * partial verion of DynamicConfig
 * to be convert to a full DynamicConfig using extendDynamicInit
 */
export interface DynamicConfigParcial extends Omit<DynamicConfig, 'init'> {
    init?: {
        mean: number[][];
        covariance: number | number[] | number[][];
        index?: number;
    };
}
export interface DynamicConfigParcialNoDim extends Omit<DynamicConfigParcial, 'dimension'> {
    dimension?: number;
}
export interface CoreConfig {
    /**
     * dynamic the system's dynamic model
     */
    dynamic: DynamicConfig;
    /**
     *  the system's observation model
     */
    observation: ObservationConfig;
    /**
     * a Winston-like logger
     */
    logger?: WinstonLogger;
}
export interface ObservationConfig {
    sensorDimension?: number;
    dimension: number;
    nSensors?: number;
    observedProjection?: any;
    fn?: PredictedCallback;
    /**
     * stateProjection the matrix to transform state to observation (for EKF, the jacobian of the fn)
     */
    stateProjection?: number | number[] | number[][] | PreviousCorrectedCallback;
    /**
     * covariance the covariance of the observation noise
     */
    covariance: number[] | number[][] | PreviousCorrectedCallback;
    sensorCovariance?: number[];
    name?: 'sensor' | string;
}
export interface ObservationObjectConfig {
    sensorDimension?: number;
    dimension?: number;
    nSensors?: number;
    observedProjection?: any;
    sensorCovariance?: number[];
    name?: 'sensor' | string;
}
export {};
//# sourceMappingURL=ObservationConfig.d.ts.map