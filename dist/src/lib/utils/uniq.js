"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = uniq;
function uniq(array) {
    return array.filter((value, index) => array.indexOf(value) === index);
}
//# sourceMappingURL=uniq.js.map