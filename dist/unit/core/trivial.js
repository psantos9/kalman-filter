"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const simple_linalg_1 = require("simple-linalg");
const core_kalman_filter_1 = __importDefault(require("../../../lib/core-kalman-filter"));
const state_1 = __importDefault(require("../../../lib/state"));
const equal_state_1 = __importDefault(require("../../helpers/equal-state"));
const defaultOptions = {
    observation: {
        dimension: 1,
        stateProjection() {
            return [
                [1]
            ];
        },
        covariance() {
            return [
                [1]
            ];
        }
    },
    dynamic: {
        dimension: 1,
        init: {
            mean: [[0]],
            covariance: [
                [1]
            ]
        },
        transition() {
            return [
                [1]
            ];
        },
        covariance() {
            return [
                [1]
            ];
        }
    }
};
const observation = [[0.1]];
const huge = 1000;
const tiny = 0.001;
// Test 1: Verify that we have the same result when the previousCorrected.mean =null
// and when previousCorrected.mean = 0
(0, ava_1.default)('Init with zero mean', (t) => {
    const kf1 = new core_kalman_filter_1.default(defaultOptions);
    const { mean, covariance, index } = defaultOptions.dynamic.init;
    const initState = new state_1.default({ mean, covariance, index });
    t.true((0, equal_state_1.default)(kf1.predict(), kf1.predict({
        previousCorrected: initState
    })));
    t.true(kf1.predict() instanceof state_1.default);
});
// Test 2: Verify that smalls previousCorrected.covariance and dynamic.covariance
// return a small predicted.covariance
(0, ava_1.default)('Impact previousCorrected and dynamic covariance', (t) => {
    const smallDynamicCovOptions = {
        ...defaultOptions,
        dynamic: {
            ...defaultOptions.dynamic,
            covariance() {
                return [
                    [tiny]
                ];
            }
        }
    };
    const kf = new core_kalman_filter_1.default(smallDynamicCovOptions);
    const previousCorrected = new state_1.default({
        mean: [[0]],
        covariance: [[tiny]]
    });
    const predicted = kf.predict({ previousCorrected });
    t.true(predicted instanceof state_1.default);
    t.is(predicted.index, undefined);
    t.true(2 / (0, simple_linalg_1.trace)(predicted.covariance) > huge / 2); // Verifying that the sum of the variance is tiny
});
// Test 3: Verify that a huge predicted.covariance leads to a kalman Gain bigger than 0.9
// (i.e. we trust majorly the observation)
(0, ava_1.default)('Huge predicted covariance', (t) => {
    const kf = new core_kalman_filter_1.default(defaultOptions);
    const predicted = new state_1.default({
        mean: [[1]],
        covariance: [
            [huge]
        ]
    });
    const corrected = kf.correct({
        predicted,
        observation
    });
    const kalmanGain = kf.getGain({ predicted, stateProjection: [[1]] });
    t.true(corrected instanceof state_1.default);
    t.true(kalmanGain[0][0] > 0.99);
});
// Test 4a: Play with dynamic and previousCorrected covariances
(0, ava_1.default)('Dynamic covariance test', (t) => {
    const normalPreviousCorrected = new state_1.default({
        mean: [[0]],
        covariance: [[1]]
    });
    // Const smallPreviousCorrected = new State({
    // 	mean: [[0]],
    // 	covariance: [[tiny]]
    // });
    const hugePreviousCorrected = new state_1.default({
        mean: [[0]],
        covariance: [[huge]]
    });
    const kfDefault = new core_kalman_filter_1.default(defaultOptions);
    const hugeDynOptions = {
        ...defaultOptions,
        dynamic: {
            ...defaultOptions.dynamic,
            covariance() {
                return [
                    [huge]
                ];
            }
        }
    };
    const kfHuge = new core_kalman_filter_1.default(hugeDynOptions);
    const predicted1 = kfDefault.predict({
        previousCorrected: normalPreviousCorrected
    });
    const predicted2 = kfHuge.predict({
        previousCorrected: normalPreviousCorrected
    });
    const predicted3 = kfDefault.predict({
        previousCorrected: hugePreviousCorrected
    });
    t.true((0, simple_linalg_1.trace)(predicted1.covariance) < (0, simple_linalg_1.trace)(predicted2.covariance));
    t.true((0, equal_state_1.default)(predicted2, predicted3));
});
// Test 4b: Play with observation and previousCorrected covariances
(0, ava_1.default)('Observation covariance test', (t) => {
    const normalPredicted = new state_1.default({
        mean: [[0]],
        covariance: [[1]]
    });
    const smallPredicted = new state_1.default({
        mean: [[0]],
        covariance: [[tiny]]
    });
    // Const hugePredicted = new State({
    // 	mean: [[0]],
    // 	covariance: [[huge]]
    // });
    const kfDefault = new core_kalman_filter_1.default(defaultOptions);
    const smallObservationCovOptions = {
        ...defaultOptions,
        observation: {
            ...defaultOptions.observation,
            covariance() {
                return [
                    [tiny]
                ];
            }
        }
    };
    const kfSmall = new core_kalman_filter_1.default(smallObservationCovOptions);
    const corrected1 = kfDefault.correct({
        predicted: normalPredicted,
        observation
    });
    const corrected2 = kfSmall.correct({
        predicted: normalPredicted,
        observation
    });
    const corrected3 = kfDefault.correct({
        predicted: smallPredicted,
        observation
    });
    t.true((0, simple_linalg_1.trace)(corrected1.covariance) > (0, simple_linalg_1.trace)(corrected2.covariance));
    const kalmanGain1 = kfSmall.getGain({ predicted: normalPredicted });
    const kalmanGain2 = kfDefault.getGain({ predicted: normalPredicted, stateProjection: [[1]] });
    // Verify that the kalman gain is greater when we are more confident in Observation
    t.true((0, simple_linalg_1.sum)(kalmanGain1) > (0, simple_linalg_1.sum)(kalmanGain2));
    t.true((0, equal_state_1.default)(corrected2, corrected3, 0.1));
});
// Test 5: Verify that if predicted.covariance = 0, then newCorrected.covariance = 0
(0, ava_1.default)('Predicted covariance equals to zero', (t) => {
    const kf = new core_kalman_filter_1.default(defaultOptions);
    const predicted = new state_1.default({
        mean: [[0]],
        covariance: [
            [0]
        ]
    });
    const corrected = kf.correct({
        predicted,
        observation
    });
    t.is((0, simple_linalg_1.trace)(corrected.covariance), 0);
});
// Test 6: Verify that if observation fits the model, then the newCorrected.covariance
// is smaller than if not
(0, ava_1.default)('Fitted observation', (t) => {
    const kf1 = new core_kalman_filter_1.default(defaultOptions);
    const badFittedObs = [[1.2]];
    const previousCorrected = new state_1.default({
        mean: defaultOptions.dynamic.init.mean,
        covariance: defaultOptions.dynamic.init.covariance
    });
    const predicted1 = kf1.predict({
        previousCorrected
    });
    const corrected1 = kf1.correct({
        predicted: predicted1,
        observation
    });
    const corrected2 = kf1.correct({
        predicted: predicted1,
        observation: badFittedObs
    });
    t.true(corrected1 instanceof state_1.default);
    t.true(corrected2 instanceof state_1.default);
    const dist1 = (0, simple_linalg_1.frobenius)(defaultOptions.dynamic.init.mean, corrected1.mean);
    const dist2 = (0, simple_linalg_1.frobenius)(defaultOptions.dynamic.init.mean, corrected2.mean);
    // We verify that the corrected is broader for the correction with badFittedObs
    t.true(dist1 < dist2);
});
// Test : Throw an error if a covariance or mean is wrongly sized
// I think this test will be done during implementation of normal Kalman Filter
// test('Wrongly sized', t => {
// 	const WrongOptions = {
//	...defaultOptions,
// 		dynamic: {
//	...defaultOptions.dynamic,
// 			covariance() {
// 				return [
// 					[tiny, 0],
// 					[0, tiny]
// 				];
// 			}
// 		},
// 		observation: {
//       	...defaultOptions.observation,
// 			covariance() {
// 				return [
// 					[tiny]
// 				];
// 			}
// 		}
// 	};
// 	const kf = new CoreKalmanFilter(WrongOptions);
// 	const error = t.throws(() => kf.predict());
// 	t.is(error.message, 'An array of the model is wrongly sized');
// });
// Test : Throws an error for NaN predicted
(0, ava_1.default)('NaN Error', (t) => {
    const previousCorrected = new state_1.default({
        mean: [[0]],
        covariance: [[Number.NaN]]
    });
    const kf = new core_kalman_filter_1.default(defaultOptions);
    const error = t.throws(() => {
        kf.predict({ previousCorrected });
    });
    t.is(error.message, '[covariance] Matrix should not have a NaN\nIn : \nNaN');
});
// Error Test: non-squared matrix
(0, ava_1.default)('Non squared matrix', (t) => {
    const nonSquaredState = new state_1.default({
        mean: [[0, 0]],
        covariance: [
            [1, 0, 0],
            [0, 1, 0]
        ]
    });
    const kf = new core_kalman_filter_1.default(defaultOptions);
    const error = t.throws(() => {
        kf.predict({ previousCorrected: nonSquaredState });
    });
    t.is(error.message, '[mean] expected size (1) and length (2) does not match');
});
//# sourceMappingURL=trivial.js.map