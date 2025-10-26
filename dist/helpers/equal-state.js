"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = equalState;
const simple_linalg_1 = require("simple-linalg");
const state_1 = __importDefault(require("../../lib/state"));
function equalState(state1, state2, tolerance = 1e-6) {
    if ((!(state1 instanceof state_1.default)) || (!(state2 instanceof state_1.default))) {
        throw (new TypeError('One of the args is not a State'));
    }
    return (((0, simple_linalg_1.frobenius)(state1.mean, state2.mean) < tolerance)
        && ((0, simple_linalg_1.frobenius)(state1.covariance, state2.covariance) < tolerance));
}
//# sourceMappingURL=equal-state.js.map