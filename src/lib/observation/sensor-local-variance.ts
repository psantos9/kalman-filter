import type { ObservationConfig } from '../types/ObservationConfig'

import { identity } from 'simple-linalg'
import { buildObservation } from '../model-collection'
/**
 * @param {object} options
 * @param {number} options.sensorDimension
 * @param {CovarianceParam} options.sensorCovariance
 * @param {number} options.nSensors
 * @returns {ObservationConfig}
 */

export default function nullableSensor(options): ObservationConfig {
  const { dimension, observedProjection, covariance: baseCovariance } = buildObservation({ ...options, name: 'sensor' })

  return {
    dimension,
    observedProjection,
    covariance(o): number[][] {
      const covariance = identity(dimension)
      const { variance } = o

      variance.forEach((v, i) => {
        covariance[i][i] = v * baseCovariance[i][i]
      })

      return covariance
    }
  }
}
