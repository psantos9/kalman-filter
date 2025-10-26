"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const simple_linalg_1 = require("simple-linalg");
const index_1 = require("../../../index");
// Test 1 : Verify that a simple model converges quickly
(0, ava_1.default)('Convergence', (t) => {
    const kf = new index_1.KalmanFilter({
        dynamic: {
            name: 'constant-position',
            dimension: 1,
            covariance: [[1]]
        },
        observation: {
            dimension: 1,
            stateProjection: [[1]],
            covariance: [[1]]
        }
    });
    const asymptoticStateCovariance = kf.asymptoticStateCovariance();
    const asymptoticObjective = [[0.618]];
    t.true((0, simple_linalg_1.frobenius)(asymptoticStateCovariance, asymptoticObjective) < 0.001);
});
// Test 2: Assert that if both dynamic.covariance and observation.covariance are huge, the covarianceConvergence is very huge
(0, ava_1.default)('Large covariances', (t) => {
    const kf = new index_1.KalmanFilter({
        dynamic: {
            name: 'constant-speed',
            dimension: 2,
            covariance: [
                [1e6, 1e3],
                [1e3, 1e6]
            ]
        },
        observation: {
            dimension: 1,
            stateProjection: [[1, 0]],
            covariance: [[1e6]]
        }
    });
    t.true((0, simple_linalg_1.sum)(kf.asymptoticStateCovariance()) > 1e6);
});
// Test Error 1 : Assert that an error is raised when matrices are not linear functions
(0, ava_1.default)('Error when not converging', (t) => {
    const multiParameterCovariance = function ({ previousCorrected }) {
        const changingParameter = previousCorrected.covariance[0][0] ** 2;
        return [
            [1, 0],
            [0, changingParameter]
        ];
    };
    const kf = new index_1.KalmanFilter({
        dynamic: {
            dimension: 2,
            name: 'constant-speed',
            covariance: multiParameterCovariance
        },
        observation: {
            dimension: 1,
            stateProjection: [[1, 0]],
            covariance: [[1e6]]
        }
    });
    const error = t.throws(() => {
        kf.asymptoticStateCovariance();
    });
    t.is(error.message, 'The state covariance does not converge asymptotically');
});
//# sourceMappingURL=asymptotic.js.map