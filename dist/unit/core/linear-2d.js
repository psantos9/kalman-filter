"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const simple_linalg_1 = require("simple-linalg");
const core_kalman_filter_1 = __importDefault(require("../../../lib/core-kalman-filter"));
const state_1 = __importDefault(require("../../../lib/state"));
// Tests in 2D with constant speed model
const huge = 1000;
const defaultOptions = {
    observation: {
        dimension: 2,
        stateProjection() {
            return [
                [1, 0, 0, 0],
                [0, 1, 0, 0]
            ];
        },
        covariance() {
            return [
                [1, 0],
                [0, 1]
            ];
        }
    },
    dynamic: {
        init: {
            mean: [[500], [500], [0], [0]],
            covariance: [
                [huge, 0, 0, 0],
                [0, huge, 0, 0],
                [0, 0, huge, 0],
                [0, 0, 0, huge]
            ]
        },
        dimension: 4,
        transition() {
            return [
                [1, 0, timeStep, 0],
                [0, 1, 0, timeStep],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ];
        },
        covariance() {
            return [
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 0.01, 0],
                [0, 0, 0, 0.01]
            ];
        }
    }
};
const timeStep = 0.1;
const observations = [
    [[1], [2]],
    [[2.1], [3.9]],
    [[3], [6]]
];
// Test 1: Verify that if observation fits the model, then the newCorrected.covariance
// is smaller than if not
(0, ava_1.default)('Fitted observation', (t) => {
    const kf1 = new core_kalman_filter_1.default(defaultOptions);
    const firstState = new state_1.default({
        mean: [[1], [2], [11], [19]],
        covariance: [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]
    });
    const badFittedObs = [[3.2], [2.9]];
    const predicted1 = kf1.predict({
        previousCorrected: firstState
    });
    const corrected1 = kf1.correct({
        predicted: predicted1,
        observation: observations[1]
    });
    const corrected2 = kf1.correct({
        predicted: predicted1,
        observation: badFittedObs
    });
    t.true(corrected1 instanceof state_1.default);
    t.true(corrected2 instanceof state_1.default);
    const dist1 = (0, simple_linalg_1.frobenius)(firstState.mean, corrected1.mean);
    const dist2 = (0, simple_linalg_1.frobenius)(firstState.mean, corrected2.mean);
    // We verify that the new mean has changed more when observation does not fit the model
    t.true(dist1 < dist2);
});
// Test 2: Covariance position/speed in one direction: the correlation between position
// and speed emerges because of the transition matrix (and especially timeStep)
(0, ava_1.default)('Covariance between position and speed', (t) => {
    const kf = new core_kalman_filter_1.default(defaultOptions);
    const { covariance } = kf.predict();
    // Check if the covariance between x and Vx is not zero
    t.not(covariance[1][3], 0);
    t.not(covariance[2][4], 0);
});
// Test 3: Balanced (same certainty on all variables) vs unbalanced:
// verify that the covariance is smaller when balanced
(0, ava_1.default)('Balanced and unbalanced', (t) => {
    const kf = new core_kalman_filter_1.default(defaultOptions);
    const previousCorrectedBalanced = new state_1.default({
        mean: [[1], [2], [1.1], [1.9]],
        covariance: [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0.01, 0],
            [0, 0, 0, 0.01]
        ]
    });
    const previousCorrectedUnbalanced = new state_1.default({
        mean: [[1], [2], [1.1], [1.9]],
        covariance: [
            [10, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0.1, 0],
            [0, 0, 0, 0.01]
        ]
    });
    const predictedBalanced = kf.predict({
        previousCorrected: previousCorrectedBalanced
    });
    const predictedUnbalanced = kf.predict({
        previousCorrected: previousCorrectedUnbalanced
    });
    t.true(predictedBalanced instanceof state_1.default);
    t.true(predictedUnbalanced instanceof state_1.default);
    t.true(predictedBalanced.covariance[0][0] < predictedUnbalanced.covariance[0][0]);
});
// Test 4: Impact of timeStep
(0, ava_1.default)('Impact of timeStep', (t) => {
    const timeStep1 = 1;
    const timeStep2 = 2;
    const smallTimeStepOptions = {
        ...defaultOptions,
        dynamic: {
            ...defaultOptions.dynamic,
            transition() {
                return [
                    [1, 0, timeStep1, 0],
                    [0, 1, 0, timeStep1],
                    [0, 0, 1, 0],
                    [0, 0, 0, 1]
                ];
            }
        }
    };
    const bigTimeStepOptions = {
        ...defaultOptions,
        dynamic: {
            ...defaultOptions.dynamic,
            transition() {
                return [
                    [1, 0, timeStep2, 0],
                    [0, 1, 0, timeStep2],
                    [0, 0, 1, 0],
                    [0, 0, 0, 1]
                ];
            }
        }
    };
    const kf1 = new core_kalman_filter_1.default(smallTimeStepOptions);
    const kf2 = new core_kalman_filter_1.default(bigTimeStepOptions);
    const predicted1 = kf1.predict();
    const predicted2 = kf2.predict();
    t.true(predicted1 instanceof state_1.default);
    t.true(predicted2 instanceof state_1.default);
    // Verify that the variance on x is bigger when timeStep increases
    t.true(predicted1.covariance[0][0] < predicted2.covariance[0][0]);
    // Verify that the predicted covariance between x and Vx is also bigger when timeStep increases
    t.true(predicted1.covariance[0][2] < predicted2.covariance[0][2]);
});
//# sourceMappingURL=linear-2d.js.map