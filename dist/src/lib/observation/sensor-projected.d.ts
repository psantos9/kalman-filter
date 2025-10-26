/**
 *Creates an observation model with a observedProjection corresponding to
 * @param {DynamicConfig} dynamic
 * @param {ObservationConfig} observation
 * @returns {DynamicConfig}
 */
export default function sensorProjected({ selectedCovariance, totalDimension, obsIndexes, selectedStateProjection }: {
    selectedCovariance: any;
    totalDimension: any;
    obsIndexes: any;
    selectedStateProjection: any;
}): {
    dimension: any;
    observedProjection: number[][];
    covariance(o: any): any;
};
//# sourceMappingURL=sensor-projected.d.ts.map