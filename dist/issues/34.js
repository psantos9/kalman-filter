"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const simple_linalg_1 = require("simple-linalg");
const index_1 = require("../../index");
(0, ava_1.default)('#34 1-D', (t) => {
    const dataset = [0, 0, 0, 0, 16.1, 0, 0, 30.9, 0, 0, 0, 0, 26.1, null, null].map(a => [a]);
    const baseVariance = 1;
    const huge = 1e30;
    const kf = new index_1.KalmanFilter({
        observation: {
            dimension: 1,
            covariance(o) {
                if (o.observation[0][0] === null) {
                    return [[huge]];
                }
                return [[baseVariance]];
            }
        }
    });
    const response = kf.filterAll(dataset);
    t.is(response.length, dataset.length);
});
(0, ava_1.default)('#34 2D', (t) => {
    const dataset = [
        [22, null],
        [25, null],
        [4, 4],
        [4, 4],
        [22, 5],
        [null, null],
        [34, 45]
    ];
    const baseVariance = 1;
    const huge = 1e15;
    const kf = new index_1.KalmanFilter({
        observation: {
            stateProjection: [[1], [1]],
            covariance(o) {
                const variances = o.observation.map((a) => {
                    if (a[0] === null) {
                        return huge;
                    }
                    return baseVariance;
                });
                return (0, simple_linalg_1.diag)(variances);
            }
        }
    });
    const response = kf.filterAll(dataset);
    t.is(response.length, dataset.length);
});
//# sourceMappingURL=34.js.map