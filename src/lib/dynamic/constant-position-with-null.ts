import { diag, identity } from 'simple-linalg'

const huge = 1e6

/**
 * Creates a dynamic model, considering the null in order to make the predictions
 * @param {Array.<Array.<number>>} staticCovariance generated with moving average
 * @param {number} observationDimension
 * @returns {DynamicConfig}
 */
export default function constantPositionWithNull({ staticCovariance, obsDynaIndexes, init }) {
  const dimension = obsDynaIndexes.length
  init ||= {
    mean: Array.from({ length: obsDynaIndexes.length }).fill(0).map(() => [0]),
    covariance: diag(Array.from({ length: obsDynaIndexes.length }).map(() => huge)),
    index: -1
  }

  if (staticCovariance && staticCovariance.length !== dimension) {
    throw (new Error('staticCovariance has wrong size'))
  }

  return {
    dimension,
    transition() {
      return identity(dimension)
    },
    covariance({ previousCorrected, index }) {
      const diffBetweenIndexes = index - previousCorrected.index
      if (staticCovariance) {
        return staticCovariance.map(row => row.map(element => element * diffBetweenIndexes))
      }

      return identity(dimension)
    },
    init
  }
}
