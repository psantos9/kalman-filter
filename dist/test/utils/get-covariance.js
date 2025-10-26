"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const cholesky_1 = __importDefault(require("cholesky"));
const hasard_1 = __importDefault(require("hasard"));
const simple_linalg_1 = require("simple-linalg");
const get_covariance_1 = __importDefault(require("../../src/lib/utils/get-covariance"));
const buildDataFromCovariance = function (covariance) {
    const dimension = covariance.length;
    const cholTriangle = (0, cholesky_1.default)(covariance);
    const cholSquare = new Array(dimension).fill(1).map((_, row) => new Array(dimension).fill(1).map((_, col) => (cholTriangle[row][col] || 0)));
    const number = hasard_1.default.number({
        type: 'normal',
        mean: 0,
        std: 1
    });
    const mean = hasard_1.default.array({
        size: dimension,
        value: hasard_1.default.number({
            type: 'uniform',
            start: 0,
            end: 200
        })
    });
    const uncorrelatedRandomVector = hasard_1.default.array({ size: dimension, value: number });
    return hasard_1.default.fn((m, mean) => {
        const measure = (0, simple_linalg_1.add)(mean.map(element => [element]), (0, simple_linalg_1.matMul)(cholSquare, m.map(element => [element]))).map(element => element[0]);
        return {
            measure,
            average: mean
        };
    })(uncorrelatedRandomVector, mean);
};
(0, ava_1.default)('get-covariance should give a results that makes sense on 1000 data', (t) => {
    const n = 100_000;
    const covariance = [[4, 12, -16], [12, 37, -43], [-16, -43, 98]];
    const random = buildDataFromCovariance(covariance);
    const values = random.run(n);
    const cov = (0, get_covariance_1.default)({
        measures: values.map(({ measure }) => measure),
        averages: values.map(({ average }) => average)
    });
    for (const [rowIndex, row] of covariance.entries()) {
        for (const [colIndex, cell] of row.entries()) {
            t.true(Math.abs(cov[rowIndex][colIndex] - cell) < 1);
        }
    }
});
//# sourceMappingURL=get-covariance.js.map