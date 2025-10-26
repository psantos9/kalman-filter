/**
 * @typedef {Object.<DynamicName, DynamicConfig>} PerNameConfigs
 */
/**
 * @typedef {object} DynamicConfig
 * @param {Array.<number>} obsIndexes
 * @param {Covariance} staticCovariance
 * @property
 */
/**
 * Creates a dynamic model, considering the null in order to make the predictions
 * @param {object} main
 * @param {Object.<string, DynamicConfig>} main.perName
 * @param {ObservationConfig} observation
 * @param {Array.<Array.<number>>} opts.observedProjection
 * @returns {DynamicConfig}
 */
declare function composition({ perName }: {
    perName: any;
}, observation: any): {
    dimension: any;
    init: {
        index: number;
        mean: any[];
        covariance: any[][];
    };
    transition(options: any): any[][];
    covariance(options: any): any[][];
};

/**
 * Creates a dynamic model, following constant acceleration model with respect with the dimensions provided in the observation parameters
 * @param {DynamicConfig} dynamic
 * @param {ObservationConfig} observation
 * @returns {DynamicConfig}
 */
declare function constantAcceleration(dynamic: any, observation: any): any;

/**
 * Creates a dynamic model, following constant position model with respect with the dimensions provided in the observation parameters
 * @param {DynamicConfig} dynamic
 * @param {ObservationConfig} observation
 * @returns {DynamicConfig}
 */
declare function constantPosition(dynamic: any, observation: any): any;

/**
 * Creates a dynamic model, considering the null in order to make the predictions
 * @param {Array.<Array.<number>>} staticCovariance generated with moving average
 * @param {number} observationDimension
 * @returns {DynamicConfig}
 */
declare function constantPositionWithNull({ staticCovariance, obsDynaIndexes, init }: {
    staticCovariance: any;
    obsDynaIndexes: any;
    init: any;
}): {
    dimension: any;
    transition(): number[][];
    covariance({ previousCorrected, index }: {
        previousCorrected: any;
        index: any;
    }): any;
    init: any;
};

/**
 *Creates a dynamic model, following constant position model with respect with the dimensions provided in the observation parameters
 * @param {DynamicConfig} dynamic
 * @param {ObservationConfig} observation
 * @returns {DynamicConfig}
 */
declare function constantSpeed(dynamic: any, observation: any): any;

interface StateLT {
    mean: number[][];
    covariance: number[][];
    index?: number;
}

interface Observation {
    name: string;
}
type PreviousCorrectedCallback = (opts: {
    index: number;
    previousCorrected?: StateLT;
    predicted: StateLT;
    variance?: number[];
}) => number[][];
type PredictedCallback = (opts: {
    index: number;
    previousCorrected?: StateLT;
    predicted: StateLT;
    observation?: Observation;
}) => number[][];
interface WinstonLogger {
    info: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
}
interface DynamicConfig {
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
interface CoreConfig {
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
interface ObservationConfig {
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

declare class CoreKalmanFilter {
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

declare class KalmanFilter extends CoreKalmanFilter {
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

/**
 * Class representing a multi dimensionnal gaussian, with his mean and his covariance
 * @property {number} [index=0] the index of the State in the process, this is not mandatory for simple Kalman Filter, but is needed for most of the use case of extended kalman filter
 * @property {Array.<Array.<number>>} covariance square matrix of size dimension
 * @property {Array.<Array<number>>} mean column matrix of size dimension x 1
 */
declare class State implements StateLT {
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

/**
 * Creates a dynamic model, considering the null in order to make the predictions
 * @param {ObservationConfig} observation
 * @returns {DynamicConfig}
 */
declare function constantSpeedDynamic(args: {
    staticCovariance: number[];
    avSpeed: number[];
    center: number[];
}, observation: any): {
    init: {
        mean: number[][];
        covariance: number[][];
        index: number;
    };
    dimension: number;
    transition: (args: {
        getTime: (index: number) => number;
        index: number;
        previousCorrected: State;
    }) => number[][];
    covariance: (args: {
        index: number;
        previousCorrected: State;
        getTime: (index: number) => number;
    }) => number[][];
};

/**
 * This model is based on the constant speed model
 * The constant speed model creates problems when dT >> fps (the track is lost)
 * then the expected position can be very far from the center of the field
 * to solve that, we use a model with 2 more hidden variable that are always center of the field
 * When dT << typicalTime the model acts exactly as a constant speed model
 * When dT >> typicalTime the model is a constant [x,y] = center model, sigma = defaultVariance
 * @param {object} options
 * @param {ObservationConfig} observation
 * @param {number} [options.typicalTime]
 * @returns {DynamicConfig}
 */
declare function shorttermConstantSpeed(options: any, observation: any): {
    dimension: number;
    init: {
        mean: number[][];
        covariance: number[][];
        index: number;
    };
    transition(options: {
        getTime: (index: number) => number;
        index: number;
        previousCorrected: State;
    }): number[][];
    covariance(options: {
        getTime: (index: number) => number;
        index: number;
        previousCorrected: State;
    }, observation: any): number[][];
};

/**
 * Enables to register observation model and store it
 * @param {string} name
 * @callback fn the function corresponding to the desired model
 */
declare function registerObservation(name: string, fn: any): void;
/**
 * Enables to register dynamic model and store it
 * @param {string} name
 * @callback fn the function corresponding to the desired model
 */
declare function registerDynamic(name: string, fn: any): void;
/**
 * Build a model given an observation configuration
 * @param {ObservationConfig} observation
 * @returns {ObservationConfig} the configuration with respect to the model
 */
declare function buildObservation(observation: any): any;
/**
 * Build a model given dynamic and observation configurations
 * @param {DynamicConfig} dynamic
 * @param {ObservationConfig} observation
 * @returns {DynamicConfig} the dynamic configuration with respect to the model
 */
declare function buildDynamic(dynamic: any, observation: any): any;

declare function sensor(options: any): ObservationConfig;

/**
 * @param {object} options
 * @param {number} options.sensorDimension
 * @param {CovarianceParam} options.sensorCovariance
 * @param {number} options.nSensors
 * @returns {ObservationConfig}
 */
declare function nullableSensor(options: any): ObservationConfig;

/**
 *Creates an observation model with a observedProjection corresponding to
 * @param {DynamicConfig} dynamic
 * @param {ObservationConfig} observation
 * @returns {DynamicConfig}
 */
declare function sensorProjected({ selectedCovariance, totalDimension, obsIndexes, selectedStateProjection }: {
    selectedCovariance: any;
    totalDimension: any;
    obsIndexes: any;
    selectedStateProjection: any;
}): {
    dimension: any;
    observedProjection: number[][];
    covariance(o: any): any;
};

declare function checkCovariance(args: {
    covariance: number[][];
    eigen?: boolean;
}, _title?: string): void;

declare function correlationToCovariance({ correlation, variance }: {
    correlation: any;
    variance: any;
}): any;

declare function covarianceToCorrelation(covariance: any): {
    variance: any;
    correlation: any;
};

/**
 * @param {object} opts
 * @param {Array.<Array.<number>>} opts.measures a list of measure, size is LxN L the number of sample, N the dimension
 * @param {Array.<Array.<number>>} opts.averages a list of averages, size is LxN L the number of sample, N the dimension
 * @returns {Array.<Array.<number>>} covariance matrix size is NxN
 */
declare function getCovariance({ measures, averages }: {
    measures: any;
    averages: any;
}): number[][];

declare function projectObservation({ observation, obsIndexes, selectedStateProjection, invertSelectedStateProjection }: {
    observation: any;
    obsIndexes: any;
    selectedStateProjection: any;
    invertSelectedStateProjection: any;
}): number[];

export { KalmanFilter, State, buildDynamic, buildObservation, checkCovariance, composition, constantAcceleration, constantPosition, constantPositionWithNull, constantSpeed, constantSpeedDynamic, correlationToCovariance, covarianceToCorrelation, getCovariance, projectObservation, registerDynamic, registerObservation, sensor, nullableSensor as sensorLocalVariance, sensorProjected, shorttermConstantSpeed };
