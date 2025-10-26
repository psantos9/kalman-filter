declare class TypeAssert {
    constructor();
    dummy(): void;
    static assertNotArray<T>(arg: T | T[], name?: string): asserts arg is T;
    static assertIsArray2D<T>(arg: unknown, name?: string): asserts arg is T[][];
    static assertIsArray2DOrFnc<T>(arg: unknown, name?: string): asserts arg is T[][] | Function;
    /**
     * ensure that the provided arg is a number, number[], or number[][]
     * @param arg
     * @param name
     * @returns
     */
    static assertIsNumbersArray(arg: unknown, name?: string): asserts arg is number[][] | number[] | number;
    static isArray2D(obj: unknown): obj is number[][];
    static isArray1D(obj: unknown): obj is number[];
    static isArray<T>(obj: T | T[]): obj is T[];
    static isFunction(arg: unknown): arg is Function;
}
export default TypeAssert;
//# sourceMappingURL=TypeAssert.d.ts.map