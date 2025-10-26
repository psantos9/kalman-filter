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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectObservation = exports.getCovariance = exports.covarianceToCorrelation = exports.correlationToCovariance = exports.checkCovariance = exports.State = exports.KalmanFilter = void 0;
const defaultDynamicModels = __importStar(require("./lib/dynamic"));
const modelCollection = __importStar(require("./lib/model-collection"));
const defaultObservationModels = __importStar(require("./lib/observation"));
function camelToDash(str) {
    if (str === str.toLowerCase()) {
        return str;
    }
    return str.replaceAll(/[A-Z]/g, m => `-${m.toLowerCase()}`);
}
Object.keys(defaultDynamicModels).forEach((k) => {
    modelCollection.registerDynamic(camelToDash(k), defaultDynamicModels[k]);
});
Object.keys(defaultObservationModels).forEach((k) => {
    modelCollection.registerObservation(camelToDash(k), defaultObservationModels[k]);
});
__exportStar(require("./lib/dynamic"), exports);
var kalman_filter_1 = require("./lib/kalman-filter");
Object.defineProperty(exports, "KalmanFilter", { enumerable: true, get: function () { return __importDefault(kalman_filter_1).default; } });
__exportStar(require("./lib/model-collection"), exports);
__exportStar(require("./lib/observation"), exports);
var state_1 = require("./lib/state");
Object.defineProperty(exports, "State", { enumerable: true, get: function () { return __importDefault(state_1).default; } });
var check_covariance_1 = require("./lib/utils/check-covariance");
Object.defineProperty(exports, "checkCovariance", { enumerable: true, get: function () { return __importDefault(check_covariance_1).default; } });
var correlation_to_covariance_1 = require("./lib/utils/correlation-to-covariance");
Object.defineProperty(exports, "correlationToCovariance", { enumerable: true, get: function () { return __importDefault(correlation_to_covariance_1).default; } });
var covariance_to_correlation_1 = require("./lib/utils/covariance-to-correlation");
Object.defineProperty(exports, "covarianceToCorrelation", { enumerable: true, get: function () { return __importDefault(covariance_to_correlation_1).default; } });
var get_covariance_1 = require("./lib/utils/get-covariance");
Object.defineProperty(exports, "getCovariance", { enumerable: true, get: function () { return __importDefault(get_covariance_1).default; } });
var project_observation_1 = require("./lib/utils/project-observation");
Object.defineProperty(exports, "projectObservation", { enumerable: true, get: function () { return __importDefault(project_observation_1).default; } });
//# sourceMappingURL=index.js.map