import type State from '../state';
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
export default function shorttermConstantSpeed(options: any, observation: any): {
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
//# sourceMappingURL=shortterm-constant-speed.d.ts.map