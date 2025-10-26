"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const index_1 = require("../../../src/index");
const state_1 = __importDefault(require("../../../src/lib/state"));
const equal_state_1 = __importDefault(require("../../../test/helpers/equal-state"));
(0, ava_1.default)('Filter method', (t) => {
    const observations = [[0.11], [0.21], [0.3]];
    const kf = new index_1.KalmanFilter({
        dynamic: {
            name: 'constant-speed'
        },
        observation: {
            name: 'sensor'
        }
    });
    const filtered = kf.filter({ observation: observations[0] });
    t.true(filtered instanceof state_1.default);
    const predicted = kf.predict();
    const corrected = kf.correct({ predicted, observation: observations[0] });
    t.true((0, equal_state_1.default)(filtered, corrected));
});
(0, ava_1.default)('FilterAll', (t) => {
    const observations = [[0.11], [0.21], [0.3]];
    const kf = new index_1.KalmanFilter({
        dynamic: {
            name: 'constant-speed'
        },
        observation: {
            name: 'sensor'
        }
    });
    const allFiltered = kf.filterAll(observations);
    t.is(allFiltered.length, 3);
    const filtered = kf.filter({ observation: observations[0] });
    const firstMean = filtered.mean.map(m => m[0]);
    t.deepEqual(firstMean, allFiltered[0]);
});
//# sourceMappingURL=filter.js.map