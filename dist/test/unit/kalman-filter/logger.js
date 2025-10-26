"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const index_1 = require("../../../src/index");
(0, ava_1.default)('Logger.debug', (t) => {
    let hasDebug = false;
    const kf = new index_1.KalmanFilter({
        observation: {
            name: 'sensor'
        },
        dynamic: {
            name: 'constant-speed'
        },
        logger: {
            info: (...args) => { console.log(...args); },
            debug() {
                hasDebug = true;
                // Console.log(...args);
            },
            warn: (...args) => { console.log(...args); },
            error: (...args) => { console.log(...args); }
        }
    });
    kf.predict();
    t.is(hasDebug, true);
});
//# sourceMappingURL=logger.js.map