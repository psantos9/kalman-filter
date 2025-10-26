"use strict";
/**
 * @param {object} opts
 * @param {Array.<Array.<number>>} opts.measures a list of measure, size is LxN L the number of sample, N the dimension
 * @param {Array.<Array.<number>>} opts.averages a list of averages, size is LxN L the number of sample, N the dimension
 * @returns {Array.<Array.<number>>} covariance matrix size is NxN
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getCovariance;
function getCovariance({ measures, averages }) {
    const l = measures.length;
    const n = measures[0].length;
    if (l === 0) {
        throw (new Error('Cannot find covariance for empty sample'));
    }
    return (new Array(n).fill(1)).map((_, rowIndex) => (new Array(n).fill(1)).map((_, colIndex) => {
        const stds = measures.map((m, i) => (m[rowIndex] - averages[i][rowIndex]) * (m[colIndex] - averages[i][colIndex]));
        const result = stds.reduce((a, b) => a + b) / l;
        if (Number.isNaN(result)) {
            throw (new TypeError('result is NaN'));
        }
        return result;
    }));
}
//# sourceMappingURL=get-covariance.js.map