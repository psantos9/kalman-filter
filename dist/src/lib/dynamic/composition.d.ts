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
export default function composition({ perName }: {
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
//# sourceMappingURL=composition.d.ts.map