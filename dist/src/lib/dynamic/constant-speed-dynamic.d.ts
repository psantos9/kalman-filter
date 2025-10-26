import type State from '../state';
/**
 * Creates a dynamic model, considering the null in order to make the predictions
 * @param {ObservationConfig} observation
 * @returns {DynamicConfig}
 */
export default function constantSpeedDynamic(args: {
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
//# sourceMappingURL=constant-speed-dynamic.d.ts.map