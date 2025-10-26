import type { ObservationConfig } from '../types/ObservationConfig'

import { identity } from 'simple-linalg'
import TypeAssert from '../types/TypeAssert'
import checkMatrix from '../utils/check-matrix'
import polymorphMatrix from '../utils/polymorph-matrix'

/**
 * @param {number} sensorDimension
 * @param {CovarianceParam} sensorCovariance
 * @param {number} nSensors
 * @returns {ObservationConfig}
 */

const copy = (mat: number[][]): number[][] => mat.map(a => a.concat())

export default function sensor(options: any): ObservationConfig {
  const { sensorDimension = 1, sensorCovariance = 1, nSensors = 1 } = options
  const sensorCovarianceFormatted = polymorphMatrix(sensorCovariance, { dimension: sensorDimension })
  if (TypeAssert.isFunction(sensorCovarianceFormatted)) { throw new TypeError('sensorCovarianceFormatted can not be a function here') }
  checkMatrix(sensorCovarianceFormatted, [sensorDimension, sensorDimension], 'observation.sensorCovariance')
  const oneSensorObservedProjection = identity(sensorDimension)
  let concatenatedObservedProjection = []
  const dimension = sensorDimension * nSensors
  const concatenatedCovariance = identity(dimension)
  for (let i = 0; i < nSensors; i++) {
    concatenatedObservedProjection = concatenatedObservedProjection.concat(copy(oneSensorObservedProjection))

    for (const [rIndex, r] of sensorCovarianceFormatted.entries()) {
      for (const [cIndex, c] of r.entries()) {
        concatenatedCovariance[rIndex + (i * sensorDimension)][cIndex + (i * sensorDimension)] = c
      }
    }
  }

  return {
    ...options,
    dimension,
    observedProjection: concatenatedObservedProjection,
    covariance: concatenatedCovariance
  }
}
