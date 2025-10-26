"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = arrayToMatrix;
/**
 *Returns the corresponding matrix in dim*1, given an dim matrix, and checks
 * if corresponding with the observation dimension
 *@param {Array.<number> | Array.<Array.<number>>} observation
 *@param {number} dimension
 *@returns {Array.<Array.<number>>}
 */
// export default function arrayToMatrix(args: {observation: number, dimension: 1}): number[][];
function arrayToMatrix(args) {
    const { observation, dimension } = args;
    if (!Array.isArray(observation)) {
        if (dimension === 1 && typeof (observation) === 'number') {
            return [[observation]];
        }
        throw (new TypeError(`The observation (${observation}) should be an array (dimension: ${dimension})`));
    }
    if (observation.length !== dimension) {
        throw (new TypeError(`Observation (${observation.length}) and dimension (${dimension}) not matching`));
    }
    if (typeof (observation[0]) === 'number' || observation[0] === null) {
        return observation.map(element => [element]);
    }
    return observation;
}
//# sourceMappingURL=array-to-matrix.js.map