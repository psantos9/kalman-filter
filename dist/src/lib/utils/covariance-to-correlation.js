"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = covarianceToCorrelation;
const check_covariance_1 = __importDefault(require("./check-covariance"));
function covarianceToCorrelation(covariance) {
    (0, check_covariance_1.default)({ covariance });
    const variance = covariance.map((_, i) => covariance[i][i]);
    return {
        variance,
        correlation: covariance.map((c, rowIndex) => c.map((a, colIndex) => a / Math.sqrt(variance[colIndex] * variance[rowIndex])))
    };
}
//# sourceMappingURL=covariance-to-correlation.js.map