"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = polymorphMatrix;
const simple_linalg_1 = require("simple-linalg");
const TypeAssert_1 = __importDefault(require("../types/TypeAssert"));
const check_matrix_1 = __importDefault(require("./check-matrix"));
/**
 * If cov is a number, result will be Identity*cov
 * If cov is an Number[], result will be diag(cov)
 * If cov is an Number[][], result will be cov
 */
function polymorphMatrix(cov, opts = {}) {
    const { dimension, title = 'polymorph' } = opts;
    // if (!cov) {
    //	return undefined;
    // }
    if (typeof (cov) === 'number' || Array.isArray(cov)) {
        if (typeof (cov) === 'number' && typeof (dimension) === 'number') {
            return (0, simple_linalg_1.diag)(new Array(dimension).fill(cov));
        }
        if (TypeAssert_1.default.isArray2D(cov)) {
            let shape;
            if (typeof (dimension) === 'number') {
                shape = [dimension, dimension];
            }
            (0, check_matrix_1.default)(cov, shape, title);
            return cov;
        }
        if (TypeAssert_1.default.isArray1D(cov)) {
            return (0, simple_linalg_1.diag)(cov);
        }
    }
    // throw new Error('Invalid input type in polymorphMatrix get ' + JSON.stringify(cov).slice(0, 100));
    return cov;
}
//# sourceMappingURL=polymorph-matrix.js.map