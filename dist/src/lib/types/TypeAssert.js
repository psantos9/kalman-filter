"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function debugValue(value) {
    if (value === undefined) {
        return 'undefined';
    }
    let asStirng = '';
    asStirng = typeof (value) === 'function' ? value.toString() : JSON.stringify(value);
    if (asStirng.length < 100) {
        return asStirng;
    }
    return `${asStirng.slice(0, 97)}...`;
}
class TypeAssert {
    constructor() {
        throw new Error('do not constuct me');
    }
    dummy() { }
    static assertNotArray(arg, name = 'parameter') {
        if (Array.isArray(arg)) {
            throw new TypeError(`E001 ${name} cannot be an array. current value is ${debugValue(arg)}.`);
        }
    }
    static assertIsArray2D(arg, name = 'parameter') {
        if (!Array.isArray(arg)) {
            throw new TypeError(`E002 ${name} is not an array. current value is ${debugValue(arg)}.`);
        }
        if (arg.length === 0) {
            return;
        }
        if (!Array.isArray(arg[0])) {
            throw new TypeError(`E003 ${name} must be an array of array. current value is ${debugValue(arg)}.`);
        }
        // Allow type number[][][]
    }
    static assertIsArray2DOrFnc(arg, name = 'parameter') {
        if (typeof (arg) === 'function') {
            return;
        }
        TypeAssert.assertIsArray2D(arg, name);
    }
    /**
     * ensure that the provided arg is a number, number[], or number[][]
     * @param arg
     * @param name
     * @returns
     */
    static assertIsNumbersArray(arg, name = 'parameter') {
        if (typeof arg === 'number') {
            return;
        }
        if (!TypeAssert.isArray(arg)) {
            throw new TypeError(`E004 ${name} is not an array. current value is ${debugValue(arg)}.`);
        }
        if (arg.length === 0) {
            return;
        }
        if (typeof arg[0] === 'number') {
            return;
        }
        if (!TypeAssert.isArray(arg[0])) {
            throw new TypeError(`E005 ${name} is not an array of array. current value is ${debugValue(arg)}.`);
        }
        if (typeof (arg[0][0]) !== 'number') {
            throw new TypeError(`E006 ${name} is not an array of array of number. current value is ${debugValue(arg)}.`);
        }
    }
    static isArray2D(obj) {
        if (!Array.isArray(obj)) {
            return false;
        }
        return (Array.isArray(obj[0]));
    }
    static isArray1D(obj) {
        if (!Array.isArray(obj)) {
            return false;
        }
        return (typeof (obj[0]) === 'number');
    }
    static isArray(obj) {
        if (!Array.isArray(obj)) {
            return false;
        }
        return true;
    }
    static isFunction(arg) {
        if (typeof (arg) === 'function') {
            return true;
            // throw new TypeError(`E000 ${name} cannot be a fucntion. current value is ${debugValue(arg)}.`);
        }
        return false;
    }
}
exports.default = TypeAssert;
//# sourceMappingURL=TypeAssert.js.map