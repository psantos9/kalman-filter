"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = extendDynamicInit;
const simple_linalg_1 = require("simple-linalg");
const TypeAssert_1 = __importDefault(require("../types/TypeAssert"));
const polymorph_matrix_1 = __importDefault(require("../utils/polymorph-matrix"));
/**
 * Initializes the dynamic.init when not given
 * Only used by setupModelsParameters
 * @param {ObservationConfig} observation
 * @param {DynamicConfigParcial} dynamic
 * @returns {CoreConfig}
 */
function extendDynamicInit(args) {
    const { observation, dynamic } = args;
    if (!dynamic.init) {
        const huge = 1e6;
        const dynamicDimension = dynamic.dimension;
        const meanArray = new Array(dynamicDimension).fill(0);
        const covarianceArray = new Array(dynamicDimension).fill(huge);
        const withInitOptions = {
            observation,
            dynamic: {
                ...dynamic,
                init: {
                    mean: meanArray.map(element => [element]),
                    covariance: (0, simple_linalg_1.diag)(covarianceArray),
                    index: -1
                }
            }
        };
        return withInitOptions;
    }
    if (dynamic.init && !dynamic.init.mean) {
        throw (new Error('dynamic.init should have a mean key'));
    }
    const covariance = (0, polymorph_matrix_1.default)(dynamic.init.covariance, { dimension: dynamic.dimension });
    if (TypeAssert_1.default.isFunction(covariance)) {
        throw new TypeError('covariance can not be a function');
    }
    dynamic.init = {
        ...dynamic.init,
        covariance
    };
    return { observation, dynamic: dynamic };
}
//# sourceMappingURL=extend-dynamic-init.js.map