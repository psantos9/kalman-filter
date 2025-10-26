"use strict";
// From observationTracks to movingAverageGroundTruthsStates with speed
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = projectObservation;
const simple_linalg_1 = require("simple-linalg");
function projectObservation({ observation, obsIndexes, selectedStateProjection, invertSelectedStateProjection }) {
    if (!observation) {
        return null;
    }
    const value = observation.observation || observation;
    const vec = obsIndexes.map((i) => {
        if ((value[i]) === undefined) {
            throw (new TypeError(`obsIndexes (${obsIndexes}) is not matching with observation (${observation})`));
        }
        return [value[i]];
    });
    const inverse = invertSelectedStateProjection || (0, simple_linalg_1.invert)(selectedStateProjection);
    if (inverse === null) {
        throw (new Error('selectedStateProjection is not invertible, please provide invertSelectedStateProjection'));
    }
    const out = (0, simple_linalg_1.matMul)(inverse, vec);
    return out
        .map(v => v[0])
        .map((v) => {
        if (Number.isNaN(v)) {
            throw (new TypeError('NaN in projection'));
        }
        return v;
    });
}
//# sourceMappingURL=project-observation.js.map