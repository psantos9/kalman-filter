"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const simple_linalg_1 = require("simple-linalg");
const index_1 = require("../../../src/index");
const modelCollection = __importStar(require("../../../src/lib/model-collection"));
const state_1 = __importDefault(require("../../../src/lib/state"));
const equal_state_1 = __importDefault(require("../../helpers/equal-state"));
// Verify that we can use a registered model, the observations are here in 1D
(0, ava_1.default)('Check constant position', (t) => {
    const previousCorrected = new state_1.default({
        mean: [[0]],
        covariance: [[1]]
    });
    const kf = new index_1.KalmanFilter({
        observation: {
            dimension: 1,
            covariance: [[1]],
            stateProjection: [[1]]
        },
        dynamic: {
            dimension: 1,
            name: 'constant-position'
        }
    });
    // Const observations = [[0.1], [0.2], [0.1]];
    const result = kf.predict({ previousCorrected });
    const stateObjective = new state_1.default({
        mean: [[0]],
        covariance: [[2]]
    });
    t.true(result instanceof state_1.default);
    // We verify that the registered model returns the good correction
    t.true((0, equal_state_1.default)(result, stateObjective));
});
(0, ava_1.default)('Check constant speed', (t) => {
    const previousCorrected = new state_1.default({
        mean: [[0], [1]],
        covariance: [
            [1, 0],
            [0, 1]
        ]
    });
    const kf = new index_1.KalmanFilter({
        observation: {
            dimension: 1,
            covariance: [[1]],
            stateProjection: [[1, 0]]
        },
        dynamic: {
            name: 'constant-speed',
            covariance: [
                [1, 0],
                [0, 0.01]
            ],
            timeStep: 0.1
        }
    });
    const observations = [[0.11], [0.21], [0.3]];
    const predicted = kf.predict({ previousCorrected });
    const corrected = kf.correct({ predicted, observation: observations[0] });
    // Result calculated by hand
    const timeStep = 0.1;
    const stateObjective = new state_1.default({
        mean: [[timeStep + 0.006], [1]],
        covariance: [
            [0.66, 0.33 * timeStep],
            [0, 1.01]
        ]
    });
    t.true(predicted instanceof state_1.default);
    t.true(corrected instanceof state_1.default);
    // We verify that the registered model returns the good result
    t.true((0, equal_state_1.default)(corrected, stateObjective, 0.1));
});
(0, ava_1.default)('Check constant acceleration', (t) => {
    const previousCorrected = new state_1.default({
        mean: [[0], [1], [1]],
        covariance: [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ]
    });
    const kf = new index_1.KalmanFilter({
        observation: {
            dimension: 1,
            covariance: [[1]],
            stateProjection: [[1, 0, 0]]
        },
        dynamic: {
            name: 'constant-acceleration',
            covariance: [
                [1, 0, 0],
                [0, 0.01, 0],
                [0, 0, 0.0001]
            ],
            timeStep: 0.1
        }
    });
    const observations = [[0.11], [0.21], [0.3]];
    const predicted = kf.predict({ previousCorrected });
    const corrected = kf.correct({ predicted, observation: observations[0] });
    t.true(predicted instanceof state_1.default);
    t.true(corrected instanceof state_1.default);
});
(0, ava_1.default)('Check sensor', (t) => {
    const previousCorrected = new state_1.default({
        mean: [[0], [1]],
        covariance: [
            [1, 0],
            [0, 1]
        ]
    });
    const kf = new index_1.KalmanFilter({
        dynamic: {
            name: 'constant-speed',
            timeStep: 0.1,
            covariance: [1, 0.01]
        },
        observation: {
            name: 'sensor',
            nSensors: 2,
            sensorDimension: 1,
            covariance: [1] // Equivalent to diag(1,1)
        }
    });
    const kf2 = new index_1.KalmanFilter({
        dynamic: {
            name: 'constant-speed',
            timeStep: 0.1,
            covariance: [1, 0.01]
        },
        observation: {
            dimension: 2,
            stateProjection: [
                [1, 0],
                [1, 0]
            ],
            covariance: [
                [1, 0],
                [0, 1]
            ]
        }
    });
    const observations = [[[0.11], [0.1]], [[0.21], [0.19]], [[0.3], [0.3]]];
    const result = kf.predict({ previousCorrected, observation: observations[0] });
    t.true(result instanceof state_1.default);
    const stateObjective = kf2.predict({ previousCorrected, observation: observations[0] });
    t.true((0, equal_state_1.default)(result, stateObjective));
});
// Verify that we can register a model and use it correctly
(0, ava_1.default)('Registering custom speed', (t) => {
    const kf = new index_1.KalmanFilter({
        dynamic: {
            name: 'constant-speed',
            timeStep: 0.1,
            covariance: [1, 0.01]
        },
        observation: {
            name: 'sensor'
        }
    });
    modelCollection.registerDynamic('custom-speed', (dynamic, observation) => {
        const timeStep = dynamic.timeStep || 1;
        const { observedProjection } = observation;
        const { stateProjection } = observation;
        const observationDimension = observation.dimension;
        let dimension;
        if (stateProjection && Number.isInteger(stateProjection[0].length / 2)) {
            dimension = observation.stateProjection[0].length;
        }
        else if (observedProjection) {
            dimension = observedProjection[0].length * 2;
        }
        else if (observationDimension) {
            dimension = observationDimension * 2;
        }
        else {
            throw (new Error('observedProjection or stateProjection should be defined in observation in order to use constant-speed filter'));
        }
        const baseDimension = dimension / 2;
        // We construct the transition and covariance matrices
        const transition = (0, simple_linalg_1.identity)(dimension);
        for (let i = 0; i < baseDimension; i++) {
            transition[i][i + baseDimension] = timeStep;
        }
        const arrayCovariance = new Array(baseDimension).fill(1).concat(new Array(baseDimension).fill(timeStep * timeStep));
        const covariance = dynamic.covariance || arrayCovariance;
        return { dimension, transition, covariance };
    });
    const kf2 = new index_1.KalmanFilter({
        dynamic: {
            name: 'custom-speed',
            timeStep: 0.1,
            covariance: [1, 0.01]
        },
        observation: {
            name: 'sensor'
        }
    });
    const predicted1 = kf.predict();
    const predicted2 = kf2.predict();
    t.true(predicted1 instanceof state_1.default);
    t.true(predicted2 instanceof state_1.default);
    t.true((0, equal_state_1.default)(predicted1, predicted2));
    // Verify that the model had been correctly added to the list of exiting models
    // t.true(KalmanFilter.registeredModels.some(model => model.name === 'custom-speed'));
});
// Verify that init is conserved if defined
(0, ava_1.default)('Init and registered model', (t) => {
    const kf = new index_1.KalmanFilter({
        observation: {
            dimension: 1,
            covariance: [[1]],
            stateProjection: [[1, 0]]
        },
        dynamic: {
            name: 'constant-speed',
            covariance: [
                [1, 0],
                [0, 0.01]
            ],
            timeStep: 0.1,
            init: {
                mean: [[0], [1]],
                covariance: [
                    [1, 0],
                    [0, 1]
                ]
            }
        }
    });
    t.deepEqual(kf.dynamic.init.covariance, [[1, 0], [0, 1]]);
});
//# sourceMappingURL=register.js.map