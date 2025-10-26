/**
 * @param {object} opts
 * @param {Array.<Array.<number>>} opts.measures a list of measure, size is LxN L the number of sample, N the dimension
 * @param {Array.<Array.<number>>} opts.averages a list of averages, size is LxN L the number of sample, N the dimension
 * @returns {Array.<Array.<number>>} covariance matrix size is NxN
 */
export default function getCovariance({ measures, averages }: {
    measures: any;
    averages: any;
}): number[][];
//# sourceMappingURL=get-covariance.d.ts.map