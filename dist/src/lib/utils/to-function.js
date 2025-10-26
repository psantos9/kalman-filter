"use strict";
// Const {diag} = require('simple-linalg');;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = toFunction;
/**
 * @callback MatrixCallback
 * @returns <Array.<Array.<Number>>
 */
/**
 * Tranforms:
 *a 2d array into a function (() => array)
 *a 1d array into a function (() => diag(array))
 *@param {Array.<number> | Array.<Array.<number>>} array
 *@returns {MatrixCallback}
 */
function toFunction(array, { label = '' } = {}) {
    if (typeof (array) === 'function') {
        return array;
    }
    if (Array.isArray(array)) {
        return array;
    }
    throw (new Error(`${label === null ? '' : `${label} : `}Only arrays and functions are authorized (got: "${array}")`));
}
//# sourceMappingURL=to-function.js.map