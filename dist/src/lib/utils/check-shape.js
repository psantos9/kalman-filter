"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = checkShape;
function checkShape(matrix, shape, title = 'checkShape') {
    if (matrix.length !== shape[0]) {
        throw (new Error(`[${title}] expected size (${shape[0]}) and length (${matrix.length}) does not match`));
    }
    if (shape.length > 1) {
        return matrix.forEach(m => checkShape(m, shape.slice(1), title));
    }
}
//# sourceMappingURL=check-shape.js.map