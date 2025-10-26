"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = deepAssign;
const uniq_1 = __importDefault(require("./uniq"));
const limit = 100;
/**
 *Equivalent to the Object.assign method, takes several arguments and creates a new object corresponding to the assignment of the arguments
 * @param {object} args
 * @param {number} step
 * @returns {object}
 */
function deepAssignInternal(args, step) {
    if (step > limit) {
        throw (new Error(`In deepAssign, number of recursive call (${step}) reached limit (${limit}), deepAssign is not working on  self-referencing objects`));
    }
    const filterArguments = args.filter(arg => (arg) !== undefined && arg !== null);
    const lastArgument = filterArguments.at(-1);
    if (filterArguments.length === 1) {
        return filterArguments[0];
    }
    if (typeof (lastArgument) !== 'object' || Array.isArray(lastArgument)) {
        return lastArgument;
    }
    if (filterArguments.length === 0) {
        return null;
    }
    const objectsArguments = filterArguments.filter(arg => typeof (arg) === 'object');
    let keys = [];
    for (const arg of objectsArguments) {
        keys = keys.concat(Object.keys(arg));
    }
    const uniqKeys = (0, uniq_1.default)(keys);
    const result = {};
    for (const key of uniqKeys) {
        const values = objectsArguments.map(arg => arg[key]);
        result[key] = deepAssignInternal(values, step + 1);
    }
    return result;
}
function deepAssign(...args) { return deepAssignInternal(args, 0); }
//# sourceMappingURL=deep-assign.js.map