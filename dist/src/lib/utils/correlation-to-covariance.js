"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = correlationToCovariance;
const check_covariance_1 = __importDefault(require("./check-covariance"));
function correlationToCovariance({ correlation, variance }) {
    (0, check_covariance_1.default)({ covariance: correlation });
    return correlation.map((c, rowIndex) => c.map((a, colIndex) => a * Math.sqrt(variance[colIndex] * variance[rowIndex])));
}
//# sourceMappingURL=correlation-to-covariance.js.map