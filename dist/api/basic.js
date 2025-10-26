"use strict";
// ReadMe Tests
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const index_1 = require("../../index");
const state_1 = __importDefault(require("../../lib/state"));
// Const getCovariance = require('../../lib/utils/get-covariance.js');
const observations = [[0, 2], [0.1, 4], [0.5, 9], [0.2, 12]];
(0, ava_1.default)('Default filter : Constant-position on 1D Data', (t) => {
    const observations = [0, 0.1, 0.5, 0.2, 3, 4, 2, 1, 2, 3, 5, 6];
    const kFilter = new index_1.KalmanFilter();
    const result = kFilter.filterAll(observations);
    t.true(Array.isArray(result));
    t.is(result.length, observations.length);
});
(0, ava_1.default)('Simple constant-position 2d', (t) => {
    const kf = new index_1.KalmanFilter({
        observation: 2
    });
    const observations = [[0.11, 0.1], [0.21, 0.19], [0.3, 0.3]];
    const result = kf.filterAll(observations);
    t.true(Array.isArray(result));
});
(0, ava_1.default)('Simple constant-speed 2d', (t) => {
    const kf = new index_1.KalmanFilter({
        observation: 2,
        dynamic: 'constant-speed'
    });
    const observations = [[0.11, 0.1], [0.21, 0.19], [0.3, 0.3]];
    const result = kf.filterAll(observations);
    t.true(Array.isArray(result));
});
(0, ava_1.default)('Constant-position on 2D Data', (t) => {
    const kFilter = new index_1.KalmanFilter({
        observation: {
            sensorDimension: 2,
            name: 'sensor'
        },
        dynamic: {
            name: 'constant-position', // Observation.sensorDimension == dynamic.dimension
            covariance: [3, 4] // Equivalent to diag([3, 4])
        }
    });
    const previousCorrected = new state_1.default({
        mean: [[100], [100]],
        covariance: [
            [1, 0],
            [0, 1]
        ]
    });
    const predicted = kFilter.predict({ previousCorrected });
    const corrected = kFilter.correct({ predicted, observation: observations[0] });
    t.true(predicted instanceof state_1.default);
    t.true(corrected instanceof state_1.default);
});
(0, ava_1.default)('Constant-speed on 3D Data', (t) => {
    const observations = [[0, 2, 3], [0.1, 4, 5.9], [0.5, 9, 8.4], [0.2, 12, 11]];
    const previousCorrected = new state_1.default({
        mean: [[100], [100], [100], [0], [0], [0]],
        covariance: [
            [1, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 0],
            [0, 0, 0, 0.01, 0, 0],
            [0, 0, 0, 0, 0.01, 0],
            [0, 0, 0, 0, 0, 0.01]
        ],
        index: 1
    });
    const kFilter = new index_1.KalmanFilter({
        observation: {
            sensorDimension: 3,
            name: 'sensor'
        },
        dynamic: {
            name: 'constant-speed', // Observation.sensorDimension * 2 == state.dimension
            timeStep: 0.1,
            covariance: [1, 1, 1, 0.1, 0.1, 0.1] // Equivalent to diag([3, 3, 3, 4, 4, 4])
        }
    });
    const predicted = kFilter.predict({ previousCorrected });
    const corrected = kFilter.correct({ predicted, observation: observations[0] });
    t.true(predicted instanceof state_1.default);
    t.true(corrected instanceof state_1.default);
    t.is(typeof corrected.index, 'number');
    t.is(corrected.covariance.length, 6);
    const timeStep = 0.1;
    const kFilter2 = new index_1.KalmanFilter({
        observation: {
            dimension: 3,
            name: 'sensor'
        },
        dynamic: {
            dimension: 6, // (x, y, z, vx, vy, vz)
            transition: [
                [1, 0, 0, timeStep, 0, 0],
                [0, 1, 0, 0, timeStep, 0],
                [0, 0, 1, 0, 0, timeStep],
                [0, 0, 0, 1, 0, 0],
                [0, 0, 0, 0, 1, 0],
                [0, 0, 0, 0, 0, 1]
            ],
            covariance: [1, 1, 1, 0.1, 0.1, 0.1] // Equivalent to diag([1, 1, 1, 0.1, 0.1, 0.1])
        }
    });
    t.deepEqual(kFilter2.predict({ previousCorrected }), kFilter.predict({ previousCorrected }));
});
(0, ava_1.default)('Constant acceleration on 2D Data', (t) => {
    const kFilter = new index_1.KalmanFilter({
        observation: {
            sensorDimension: 2,
            name: 'sensor'
        },
        dynamic: {
            name: 'constant-acceleration', // Observation.sensorDimension * 3 == state.dimension
            timeStep: 0.1,
            covariance: [3, 3, 4, 4, 5, 5] // Equivalent to diag([3, 3, 4, 4, 5, 5])
        }
    });
    const previousCorrected = new state_1.default({
        mean: [[100], [100], [10], [10], [0], [0]],
        covariance: [
            [1, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0],
            [0, 0, 0.01, 0, 0, 0],
            [0, 0, 0, 0.01, 0, 0],
            [0, 0, 0, 0, 0.0001, 0],
            [0, 0, 0, 0, 0, 0.0001]
        ]
    });
    const obs = [[102], [101]];
    const predicted = kFilter.predict({ previousCorrected });
    const corrected = kFilter.correct({
        predicted,
        observation: obs
    });
    t.true(predicted instanceof state_1.default);
    t.is(predicted.mean.length, 6);
    t.true(corrected instanceof state_1.default);
    t.is(corrected.mean.length, 6);
});
(0, ava_1.default)('Sensor observation', (t) => {
    const kFilter = new index_1.KalmanFilter({
        observation: {
            sensorDimension: 2, // Observation.dimension == observation.sensorDimension * observation.nSensors
            nSensors: 2,
            sensorCovariance: [3, 4],
            name: 'sensor'
        },
        dynamic: {
            name: 'constant-speed', // Observation.sensorDimension * 2 == state.dimension
            covariance: [3, 3, 4, 4] // Equivalent to diag([3, 3, 4, 4])
        }
    });
    t.is(kFilter.observation.stateProjection.length, kFilter.observation.sensorDimension * kFilter.observation.nSensors);
    t.is(kFilter.observation.stateProjection[0].length, 4);
    t.is(kFilter.observation.covariance.length, 4);
    const observations = [[[102], [101], [98], [105]]];
    const previousCorrected = new state_1.default({
        mean: [[100], [100], [10], [10]],
        covariance: [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0.01, 0],
            [0, 0, 0, 0.01]
        ]
    });
    const predicted = kFilter.predict({
        previousCorrected
    });
    const corrected = kFilter.correct({
        predicted,
        observation: observations[0]
    });
    t.true(predicted instanceof state_1.default);
    t.is(predicted.mean.length, 4);
    t.true(corrected instanceof state_1.default);
    t.is(corrected.mean.length, 4);
});
(0, ava_1.default)('Simple Batch Usage', (t) => {
    const kFilter = new index_1.KalmanFilter({
        observation: {
            sensorDimension: 2,
            name: 'sensor'
        },
        dynamic: {
            name: 'constant-speed', // Observation.sensorDimension == dynamic.dimension
            covariance: [3, 3, 4, 4] // Equivalent to diag([3, 4])
        }
    });
    const results = kFilter.filterAll(observations);
    t.is(results.length, 4);
});
(0, ava_1.default)('Model fits ', (t) => {
    const kFilter = new index_1.KalmanFilter({
        observation: {
            sensorDimension: 2,
            name: 'sensor'
        },
        dynamic: {
            name: 'constant-speed', // Observation.sensorDimension == dynamic.dimension
            covariance: [3, 3, 4, 4]
        }
    });
    const observations = [[0, 2], [0.1, 4], [0.5, 9], [0.2, 12]];
    // Online kalman filter
    let previousCorrected;
    const distances = [];
    for (const observation of observations) {
        const predicted = kFilter.predict({
            previousCorrected
        });
        const dist = predicted.mahalanobis({ observation, kf: kFilter });
        previousCorrected = kFilter.correct({
            predicted,
            observation
        });
        distances.push(dist);
    }
    const distance = distances.reduce((d1, d2) => d1 + d2, 0);
    t.true(distance > 0);
});
//# sourceMappingURL=basic.js.map