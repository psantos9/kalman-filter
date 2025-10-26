"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = constantPositionWithNull;
const simple_linalg_1 = require("simple-linalg");
const huge = 1e6;
/**
 * Creates a dynamic model, considering the null in order to make the predictions
 * @param {Array.<Array.<number>>} staticCovariance generated with moving average
 * @param {number} observationDimension
 * @returns {DynamicConfig}
 */
function constantPositionWithNull({ staticCovariance, obsDynaIndexes, init }) {
    const dimension = obsDynaIndexes.length;
    init ||= {
        mean: Array.from({ length: obsDynaIndexes.length }).fill(0).map(() => [0]),
        covariance: (0, simple_linalg_1.diag)(Array.from({ length: obsDynaIndexes.length }).map(() => huge)),
        index: -1
    };
    if (staticCovariance && staticCovariance.length !== dimension) {
        throw (new Error('staticCovariance has wrong size'));
    }
    return {
        dimension,
        transition() {
            return (0, simple_linalg_1.identity)(dimension);
        },
        covariance({ previousCorrected, index }) {
            const diffBetweenIndexes = index - previousCorrected.index;
            if (staticCovariance) {
                return staticCovariance.map(row => row.map(element => element * diffBetweenIndexes));
            }
            return (0, simple_linalg_1.identity)(dimension);
        },
        init
    };
}
//# sourceMappingURL=constant-position-with-null.js.map