var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/lib/dynamic/index.ts
var dynamic_exports = {};
__export(dynamic_exports, {
  composition: () => composition,
  constantAcceleration: () => constantAcceleration,
  constantPosition: () => constantPosition,
  constantPositionWithNull: () => constantPositionWithNull,
  constantSpeed: () => constantSpeed,
  constantSpeedDynamic: () => constantSpeedDynamic,
  shorttermConstantSpeed: () => shorttermConstantSpeed
});

// src/lib/model-collection.ts
var registeredObservationModels = {};
var registeredDynamicModels = {};
function registerObservation(name, fn) {
  registeredObservationModels[name] = fn;
}
function registerDynamic(name, fn) {
  registeredDynamicModels[name] = fn;
}
function buildObservation(observation) {
  if (typeof registeredObservationModels[observation.name] !== "function") {
    throw new TypeError(
      `The provided observation model name (${observation.name}) is not registered`
    );
  }
  return registeredObservationModels[observation.name](observation);
}
function buildDynamic(dynamic, observation) {
  if (typeof registeredDynamicModels[dynamic.name] !== "function") {
    throw new TypeError(
      `The provided dynamic model (${dynamic.name}) name is not registered`
    );
  }
  return registeredDynamicModels[dynamic.name](dynamic, observation);
}

// src/lib/dynamic/composition.ts
function composition({ perName }, observation) {
  const { observedProjection } = observation;
  const observedDynamDimension = observedProjection[0].length;
  const dynamicNames = Object.keys(perName);
  const confs = {};
  let nextDynamicDimension = observedDynamDimension;
  let nextObservedDimension = 0;
  dynamicNames.forEach((k) => {
    const obsDynaIndexes = perName[k].obsDynaIndexes;
    if (typeof perName[k].name === "string" && perName[k].name !== k) {
      throw new Error(`${perName[k].name} and "${k}" should match`);
    }
    perName[k].name = k;
    const { dimension, transition, covariance, init: init2 } = buildDynamic(perName[k], observation);
    const dynamicIndexes = [];
    for (let i = 0; i < dimension; i++) {
      const isObserved = i < obsDynaIndexes.length;
      let newIndex;
      if (isObserved) {
        newIndex = nextObservedDimension;
        if (newIndex !== obsDynaIndexes[i]) {
          throw new Error("thsoe should match");
        }
        nextObservedDimension++;
      } else {
        newIndex = nextDynamicDimension;
        nextDynamicDimension++;
      }
      dynamicIndexes.push(newIndex);
    }
    confs[k] = {
      dynamicIndexes,
      transition,
      dimension,
      covariance,
      init: init2
    };
  });
  const totalDimension = dynamicNames.map((k) => confs[k].dimension).reduce((a, b) => a + b, 0);
  if (nextDynamicDimension !== totalDimension) {
    throw new Error("miscalculation of transition");
  }
  const init = {
    index: -1,
    mean: new Array(totalDimension),
    covariance: new Array(totalDimension).fill(0).map(() => new Array(totalDimension).fill(0))
  };
  dynamicNames.forEach((k) => {
    const {
      dynamicIndexes,
      init: localInit
    } = confs[k];
    if (typeof localInit !== "object") {
      throw new TypeError("Init is mandatory");
    }
    dynamicIndexes.forEach((c1, i1) => dynamicIndexes.forEach((c2, i2) => {
      init.covariance[c1][c2] = localInit.covariance[i1][i2];
    }));
    dynamicIndexes.forEach((c1, i1) => {
      init.mean[c1] = localInit.mean[i1];
    });
  });
  return {
    dimension: totalDimension,
    init,
    transition(options) {
      const { previousCorrected } = options;
      const resultTransition = new Array(totalDimension).fill(void 0).map(() => new Array(totalDimension).fill(0));
      dynamicNames.forEach((k) => {
        const {
          dynamicIndexes,
          transition
        } = confs[k];
        const options2 = {
          ...options,
          previousCorrected: previousCorrected.subState(dynamicIndexes)
        };
        const trans = transition(options2);
        dynamicIndexes.forEach((c1, i1) => dynamicIndexes.forEach((c2, i2) => {
          resultTransition[c1][c2] = trans[i1][i2];
        }));
      });
      return resultTransition;
    },
    covariance(options) {
      const { previousCorrected } = options;
      const resultCovariance = new Array(totalDimension).fill(void 0).map(() => new Array(totalDimension).fill(0));
      dynamicNames.forEach((k) => {
        const {
          dynamicIndexes,
          covariance
        } = confs[k];
        const options2 = {
          ...options,
          previousCorrected: previousCorrected.subState(dynamicIndexes)
        };
        const cov = covariance(options2);
        dynamicIndexes.forEach((c1, i1) => dynamicIndexes.forEach((c2, i2) => {
          resultCovariance[c1][c2] = cov[i1][i2];
        }));
      });
      return resultCovariance;
    }
  };
}

// src/lib/dynamic/constant-acceleration.ts
import { identity } from "simple-linalg";
function constantAcceleration(dynamic, observation) {
  const timeStep = dynamic.timeStep || 1;
  const { observedProjection } = observation;
  const { stateProjection } = observation;
  const observationDimension = observation.dimension;
  let dimension;
  if (stateProjection && Number.isInteger(stateProjection[0].length / 3)) {
    dimension = observation.stateProjection[0].length;
  } else if (observedProjection) {
    dimension = observedProjection[0].length * 3;
  } else if (observationDimension) {
    dimension = observationDimension * 3;
  } else {
    throw new Error("observedProjection or stateProjection should be defined in observation in order to use constant-speed filter");
  }
  const baseDimension = dimension / 3;
  const transition = identity(dimension);
  for (let i = 0; i < baseDimension; i++) {
    transition[i][i + baseDimension] = timeStep;
    transition[i][i + 2 * baseDimension] = 0.5 * timeStep ** 2;
    transition[i + baseDimension][i + 2 * baseDimension] = timeStep;
  }
  const arrayCovariance = new Array(baseDimension).fill(1).concat(new Array(baseDimension).fill(timeStep * timeStep)).concat(new Array(baseDimension).fill(timeStep ** 4));
  const covariance = dynamic.covariance || arrayCovariance;
  return {
    ...dynamic,
    dimension,
    transition,
    covariance
  };
}

// src/lib/dynamic/constant-position.ts
import { identity as identity2 } from "simple-linalg";
function constantPosition(dynamic, observation) {
  let { dimension } = dynamic;
  const observationDimension = observation.dimension;
  const { observedProjection } = observation;
  const { stateProjection } = observation;
  let { covariance } = dynamic;
  if (!dynamic.dimension) {
    if (observationDimension) {
      dimension = observationDimension;
    } else if (observedProjection) {
      dimension = observedProjection[0].length;
    } else if (stateProjection) {
      dimension = stateProjection[0].length;
    }
  }
  const transition = identity2(dimension);
  covariance ||= identity2(dimension);
  return {
    ...dynamic,
    dimension,
    transition,
    covariance
  };
}

// src/lib/dynamic/constant-position-with-null.ts
import { diag, identity as identity3 } from "simple-linalg";
var huge = 1e6;
function constantPositionWithNull({ staticCovariance, obsDynaIndexes, init }) {
  const dimension = obsDynaIndexes.length;
  init ||= {
    mean: Array.from({ length: obsDynaIndexes.length }).fill(0).map(() => [0]),
    covariance: diag(Array.from({ length: obsDynaIndexes.length }).map(() => huge)),
    index: -1
  };
  if (staticCovariance && staticCovariance.length !== dimension) {
    throw new Error("staticCovariance has wrong size");
  }
  return {
    dimension,
    transition() {
      return identity3(dimension);
    },
    covariance({ previousCorrected, index }) {
      const diffBetweenIndexes = index - previousCorrected.index;
      if (staticCovariance) {
        return staticCovariance.map((row) => row.map((element) => element * diffBetweenIndexes));
      }
      return identity3(dimension);
    },
    init
  };
}

// src/lib/dynamic/constant-speed.ts
import { identity as identity4 } from "simple-linalg";
function constantSpeed(dynamic, observation) {
  const timeStep = dynamic.timeStep || 1;
  const { observedProjection } = observation;
  const { stateProjection } = observation;
  const observationDimension = observation.dimension;
  let dimension;
  if (stateProjection && Number.isInteger(stateProjection[0].length / 2)) {
    dimension = observation.stateProjection[0].length;
  } else if (observedProjection) {
    dimension = observedProjection[0].length * 2;
  } else if (observationDimension) {
    dimension = observationDimension * 2;
  } else {
    throw new Error("observedProjection or stateProjection should be defined in observation in order to use constant-speed filter");
  }
  const baseDimension = dimension / 2;
  const transition = identity4(dimension);
  for (let i = 0; i < baseDimension; i++) {
    transition[i][i + baseDimension] = timeStep;
  }
  const arrayCovariance = new Array(baseDimension).fill(1).concat(new Array(baseDimension).fill(timeStep * timeStep));
  const covariance = dynamic.covariance || arrayCovariance;
  return {
    ...dynamic,
    dimension,
    transition,
    covariance
  };
}

// src/lib/dynamic/constant-speed-dynamic.ts
import { diag as diag2 } from "simple-linalg";
function constantSpeedDynamic(args, observation) {
  const { staticCovariance, avSpeed, center } = args;
  const observationDimension = observation.observedProjection[0].length;
  const dimension = 2 * observationDimension;
  if (center === void 0) {
    throw new TypeError("Center must be defined");
  }
  if (center.length !== observationDimension) {
    throw new TypeError(`Center size should be ${observationDimension}`);
  }
  if (avSpeed.length !== observationDimension) {
    throw new TypeError(`avSpeed size should be ${observationDimension}`);
  }
  const initCov = diag2(center.map((c) => c * c / 3).concat(avSpeed.map((c) => c * c / 3)));
  const init = {
    mean: center.map((c) => [c]).concat(center.map(() => [0])),
    covariance: initCov,
    index: -1
  };
  const transition = (args2) => {
    const { getTime, index, previousCorrected } = args2;
    const dT = getTime(index) - getTime(previousCorrected.index);
    if (typeof dT !== "number" || Number.isNaN(dT)) {
      throw new TypeError(`dT (${dT}) should be a number`);
    }
    const mat = diag2(center.map(() => 1).concat(center.map(() => 1)));
    for (let i = 0; i < observationDimension; i++) {
      mat[i][observationDimension + i] = dT;
    }
    if (Number.isNaN(mat[0][2])) {
      throw new TypeError("nan mat");
    }
    return mat;
  };
  const covariance = (args2) => {
    const { index, previousCorrected, getTime } = args2;
    const dT = getTime(index) - getTime(previousCorrected.index);
    if (typeof dT !== "number") {
      throw new TypeError(`dT (${dT}) should be a number`);
    }
    const sqrt = Math.sqrt(dT);
    if (Number.isNaN(sqrt)) {
      console.log({ lastPreviousIndex: previousCorrected.index, index });
      console.log(dT, previousCorrected.index, index, getTime(index), getTime(previousCorrected.index));
      throw new Error("Sqrt(dT) is NaN");
    }
    return diag2(staticCovariance.map((v) => v * sqrt));
  };
  return {
    init,
    dimension,
    transition,
    covariance
  };
}

// src/lib/dynamic/shortterm-constant-speed.ts
import { diag as diag3, elemWise } from "simple-linalg";
var safeDiv = function(a, b) {
  if (a === 0) {
    return 0;
  }
  if (b === 0) {
    return 1;
  }
  return a / b;
};
function shorttermConstantSpeed(options, observation) {
  const { typicalTimes } = options;
  if (!Array.isArray(typicalTimes)) {
    throw new TypeError("typicalTimes must be defined");
  }
  const constantSpeed2 = constantSpeedDynamic(options, observation);
  const { dimension, init } = constantSpeed2;
  if (typicalTimes.length !== dimension) {
    throw new TypeError(`typicalTimes (${typicalTimes.length}) length is not as expected (${dimension})`);
  }
  const mixMatrix = function({
    ratios,
    aMat,
    bMat
  }) {
    return elemWise([aMat, bMat], ([m, d], rowIndex, colIndex) => {
      const ratio = rowIndex === colIndex ? ratios[rowIndex] : (ratios[rowIndex] + ratios[colIndex]) / 2;
      return ratio * m + (1 - ratio) * d;
    });
  };
  return {
    dimension,
    init,
    transition(options2) {
      const aMat = constantSpeed2.transition(options2);
      const { getTime, index, previousCorrected } = options2;
      const dT = getTime(index) - getTime(previousCorrected.index);
      const ratios = typicalTimes.map((t) => Math.exp(-1 * dT / t));
      const bMat = diag3(
        elemWise([init.mean, previousCorrected.mean], ([m, d]) => safeDiv(m, d)).reduce((a, b) => a.concat(b))
      );
      return mixMatrix({ ratios, aMat, bMat });
    },
    covariance(options2, observation2) {
      const { getTime, index, previousCorrected } = options2;
      const dT = getTime(index) - getTime(previousCorrected.index);
      const ratios = typicalTimes.map((t) => Math.exp(-1 * dT / t));
      const aMat = constantSpeed2.covariance(
        options2
        /* , observation */
      );
      return mixMatrix({ ratios, aMat, bMat: init.covariance });
    }
  };
}

// src/lib/observation/index.ts
var observation_exports = {};
__export(observation_exports, {
  sensor: () => sensor,
  sensorLocalVariance: () => nullableSensor,
  sensorProjected: () => sensorProjected
});

// src/lib/observation/sensor.ts
import { identity as identity5 } from "simple-linalg";

// src/lib/types/TypeAssert.ts
function debugValue(value) {
  if (value === void 0) {
    return "undefined";
  }
  let asStirng = "";
  asStirng = typeof value === "function" ? value.toString() : JSON.stringify(value);
  if (asStirng.length < 100) {
    return asStirng;
  }
  return `${asStirng.slice(0, 97)}...`;
}
var TypeAssert = class _TypeAssert {
  constructor() {
    throw new Error("do not constuct me");
  }
  dummy() {
  }
  static assertNotArray(arg, name = "parameter") {
    if (Array.isArray(arg)) {
      throw new TypeError(`E001 ${name} cannot be an array. current value is ${debugValue(arg)}.`);
    }
  }
  static assertIsArray2D(arg, name = "parameter") {
    if (!Array.isArray(arg)) {
      throw new TypeError(`E002 ${name} is not an array. current value is ${debugValue(arg)}.`);
    }
    if (arg.length === 0) {
      return;
    }
    if (!Array.isArray(arg[0])) {
      throw new TypeError(`E003 ${name} must be an array of array. current value is ${debugValue(arg)}.`);
    }
  }
  static assertIsArray2DOrFnc(arg, name = "parameter") {
    if (typeof arg === "function") {
      return;
    }
    _TypeAssert.assertIsArray2D(arg, name);
  }
  /**
   * ensure that the provided arg is a number, number[], or number[][]
   * @param arg
   * @param name
   * @returns
   */
  static assertIsNumbersArray(arg, name = "parameter") {
    if (typeof arg === "number") {
      return;
    }
    if (!_TypeAssert.isArray(arg)) {
      throw new TypeError(`E004 ${name} is not an array. current value is ${debugValue(arg)}.`);
    }
    if (arg.length === 0) {
      return;
    }
    if (typeof arg[0] === "number") {
      return;
    }
    if (!_TypeAssert.isArray(arg[0])) {
      throw new TypeError(`E005 ${name} is not an array of array. current value is ${debugValue(arg)}.`);
    }
    if (typeof arg[0][0] !== "number") {
      throw new TypeError(`E006 ${name} is not an array of array of number. current value is ${debugValue(arg)}.`);
    }
  }
  static isArray2D(obj) {
    if (!Array.isArray(obj)) {
      return false;
    }
    return Array.isArray(obj[0]);
  }
  static isArray1D(obj) {
    if (!Array.isArray(obj)) {
      return false;
    }
    return typeof obj[0] === "number";
  }
  static isArray(obj) {
    if (!Array.isArray(obj)) {
      return false;
    }
    return true;
  }
  static isFunction(arg) {
    if (typeof arg === "function") {
      return true;
    }
    return false;
  }
};
var TypeAssert_default = TypeAssert;

// src/lib/utils/check-shape.ts
function checkShape(matrix, shape, title = "checkShape") {
  if (matrix.length !== shape[0]) {
    throw new Error(`[${title}] expected size (${shape[0]}) and length (${matrix.length}) does not match`);
  }
  if (shape.length > 1) {
    return matrix.forEach((m) => checkShape(m, shape.slice(1), title));
  }
}

// src/lib/utils/check-matrix.ts
function checkMatrix(matrix, shape, title = "checkMatrix") {
  if (!Array.isArray(matrix)) {
    throw new TypeError(`[${title}] should be a 2-level array matrix and is ${matrix}`);
  }
  for (const row of matrix) {
    if (!Array.isArray(row)) {
      throw new TypeError(`[${title}] 1-level array should be a matrix ${JSON.stringify(matrix)}`);
    }
  }
  if (matrix.reduce((a, b) => a.concat(b)).some((a) => Number.isNaN(a))) {
    throw new Error(
      `[${title}] Matrix should not have a NaN
In : 
${matrix.join("\n")}`
    );
  }
  if (shape) {
    checkShape(matrix, shape, title);
  }
}

// src/lib/utils/polymorph-matrix.ts
import { diag as diag4 } from "simple-linalg";
function polymorphMatrix(cov, opts = {}) {
  const { dimension, title = "polymorph" } = opts;
  if (typeof cov === "number" || Array.isArray(cov)) {
    if (typeof cov === "number" && typeof dimension === "number") {
      return diag4(new Array(dimension).fill(cov));
    }
    if (TypeAssert_default.isArray2D(cov)) {
      let shape;
      if (typeof dimension === "number") {
        shape = [dimension, dimension];
      }
      checkMatrix(cov, shape, title);
      return cov;
    }
    if (TypeAssert_default.isArray1D(cov)) {
      return diag4(cov);
    }
  }
  return cov;
}

// src/lib/observation/sensor.ts
var copy = (mat) => mat.map((a) => a.concat());
function sensor(options) {
  const { sensorDimension = 1, sensorCovariance = 1, nSensors = 1 } = options;
  const sensorCovarianceFormatted = polymorphMatrix(sensorCovariance, { dimension: sensorDimension });
  if (TypeAssert_default.isFunction(sensorCovarianceFormatted)) {
    throw new TypeError("sensorCovarianceFormatted can not be a function here");
  }
  checkMatrix(sensorCovarianceFormatted, [sensorDimension, sensorDimension], "observation.sensorCovariance");
  const oneSensorObservedProjection = identity5(sensorDimension);
  let concatenatedObservedProjection = [];
  const dimension = sensorDimension * nSensors;
  const concatenatedCovariance = identity5(dimension);
  for (let i = 0; i < nSensors; i++) {
    concatenatedObservedProjection = concatenatedObservedProjection.concat(copy(oneSensorObservedProjection));
    for (const [rIndex, r] of sensorCovarianceFormatted.entries()) {
      for (const [cIndex, c] of r.entries()) {
        concatenatedCovariance[rIndex + i * sensorDimension][cIndex + i * sensorDimension] = c;
      }
    }
  }
  return {
    ...options,
    dimension,
    observedProjection: concatenatedObservedProjection,
    covariance: concatenatedCovariance
  };
}

// src/lib/observation/sensor-local-variance.ts
import { identity as identity6 } from "simple-linalg";
function nullableSensor(options) {
  const { dimension, observedProjection, covariance: baseCovariance } = buildObservation({ ...options, name: "sensor" });
  return {
    dimension,
    observedProjection,
    covariance(o) {
      const covariance = identity6(dimension);
      const { variance } = o;
      variance.forEach((v, i) => {
        covariance[i][i] = v * baseCovariance[i][i];
      });
      return covariance;
    }
  };
}

// src/lib/observation/sensor-projected.ts
import { identity as identity7, matPermutation } from "simple-linalg";

// src/lib/utils/check-covariance.ts
import Matrix from "@rayyamhk/matrix";
var tolerance = 0.1;
var checkDefinitePositive = function(covariance, tolerance2 = 1e-10) {
  const covarianceMatrix = new Matrix(covariance);
  const eigenvalues = covarianceMatrix.eigenvalues();
  for (const eigenvalue of eigenvalues) {
    if (eigenvalue <= -tolerance2) {
      console.log(covariance, eigenvalue);
      throw new Error(`Eigenvalue should be positive (actual: ${eigenvalue})`);
    }
  }
  console.log("is definite positive", covariance);
};
var checkSymetric = function(covariance, title = "checkSymetric") {
  for (const [rowId, row] of covariance.entries()) {
    for (const [colId, item] of row.entries()) {
      if (rowId === colId && item < 0) {
        throw new Error(`[${title}] Variance[${colId}] should be positive (actual: ${item})`);
      } else if (Math.abs(item) > Math.sqrt(covariance[rowId][rowId] * covariance[colId][colId])) {
        console.log(covariance);
        throw new Error(`[${title}] Covariance[${rowId}][${colId}] should verify Cauchy Schwarz Inequality (expected: |x| <= sqrt(${covariance[rowId][rowId]} * ${covariance[colId][colId]}) actual: ${item})`);
      } else if (Math.abs(item - covariance[colId][rowId]) > tolerance) {
        throw new Error(
          `[${title}] Covariance[${rowId}][${colId}] should equal Covariance[${colId}][${rowId}]  (actual diff: ${Math.abs(item - covariance[colId][rowId])})  = ${item} - ${covariance[colId][rowId]}
${covariance.join("\n")} is invalid`
        );
      }
    }
  }
};
function checkCovariance(args, _title) {
  const { covariance, eigen = false } = args;
  checkMatrix(covariance);
  checkSymetric(covariance);
  if (eigen) {
    checkDefinitePositive(covariance);
  }
}

// src/lib/utils/correlation-to-covariance.ts
function correlationToCovariance({ correlation, variance }) {
  checkCovariance({ covariance: correlation });
  return correlation.map((c, rowIndex) => c.map((a, colIndex) => a * Math.sqrt(variance[colIndex] * variance[rowIndex])));
}

// src/lib/utils/covariance-to-correlation.ts
function covarianceToCorrelation(covariance) {
  checkCovariance({ covariance });
  const variance = covariance.map((_, i) => covariance[i][i]);
  return {
    variance,
    correlation: covariance.map((c, rowIndex) => c.map((a, colIndex) => a / Math.sqrt(variance[colIndex] * variance[rowIndex])))
  };
}

// src/lib/observation/sensor-projected.ts
function sensorProjected({ selectedCovariance, totalDimension, obsIndexes, selectedStateProjection }) {
  if (!selectedStateProjection) {
    selectedStateProjection = Array.from({ length: obsIndexes.length }).fill(0).map(() => Array.from({ length: obsIndexes.length }).fill(0));
    obsIndexes.forEach((index1, i1) => {
      selectedStateProjection[i1][i1] = 1;
    });
  } else if (selectedStateProjection.length !== obsIndexes.length) {
    throw new Error(`[Sensor-projected] Shape mismatch between ${selectedStateProjection.length} and ${obsIndexes.length}`);
  }
  const baseCovariance = identity7(totalDimension);
  obsIndexes.forEach((index1, i1) => {
    if (selectedCovariance) {
      obsIndexes.forEach((index2, i2) => {
        baseCovariance[index1][index2] = selectedCovariance[i1][i2];
      });
    }
  });
  const { correlation: baseCorrelation, variance: baseVariance } = covarianceToCorrelation(baseCovariance);
  const dynaDimension = selectedStateProjection[0].length;
  if (selectedStateProjection.length !== obsIndexes.length) {
    throw new Error(`shape mismatch (${selectedStateProjection.length} vs ${obsIndexes.length})`);
  }
  const observedProjection = matPermutation({
    outputSize: [totalDimension, dynaDimension],
    colIndexes: selectedStateProjection[0].map((_, i) => i),
    rowIndexes: obsIndexes,
    matrix: selectedStateProjection
  });
  return {
    dimension: totalDimension,
    observedProjection,
    covariance(o) {
      const { variance } = o;
      if (!variance) {
        return baseCovariance;
      }
      if (variance.length !== baseCovariance.length) {
        throw new Error("variance is difference size from baseCovariance");
      }
      const result = correlationToCovariance({ correlation: baseCorrelation, variance: baseVariance.map((b, i) => variance[i] * b) });
      return result;
    }
  };
}

// src/lib/kalman-filter.ts
import { frobenius as distanceMat } from "simple-linalg";

// src/lib/setup/build-state-projection.ts
import { identity as identity8, padWithZeroCols as padWithZeros } from "simple-linalg";
function buildStateProjection(args) {
  const { observation, dynamic } = args;
  const { observedProjection, stateProjection } = observation;
  const observationDimension = observation.dimension;
  const dynamicDimension = dynamic.dimension;
  if (observedProjection && stateProjection) {
    throw new TypeError("You cannot use both observedProjection and stateProjection");
  }
  if (observedProjection) {
    const stateProjection2 = padWithZeros(observedProjection, { columns: dynamicDimension });
    return {
      observation: {
        ...observation,
        stateProjection: stateProjection2
      },
      dynamic
    };
  }
  if (observationDimension && dynamicDimension && !stateProjection) {
    const observationMatrix = identity8(observationDimension);
    return {
      observation: {
        ...observation,
        stateProjection: padWithZeros(observationMatrix, { columns: dynamicDimension })
      },
      dynamic
    };
  }
  return { observation, dynamic };
}

// src/lib/setup/check-dimensions.ts
function checkDimensions(args) {
  const { observation, dynamic } = args;
  const dynamicDimension = dynamic.dimension;
  const observationDimension = observation.dimension;
  if (!dynamicDimension || !observationDimension) {
    throw new TypeError("Dimension is not set");
  }
  return { observation, dynamic };
}

// src/lib/setup/extend-dynamic-init.ts
import { diag as diag5 } from "simple-linalg";
function extendDynamicInit(args) {
  const { observation, dynamic } = args;
  if (!dynamic.init) {
    const huge2 = 1e6;
    const dynamicDimension = dynamic.dimension;
    const meanArray = new Array(dynamicDimension).fill(0);
    const covarianceArray = new Array(dynamicDimension).fill(huge2);
    const withInitOptions = {
      observation,
      dynamic: {
        ...dynamic,
        init: {
          mean: meanArray.map((element) => [element]),
          covariance: diag5(covarianceArray),
          index: -1
        }
      }
    };
    return withInitOptions;
  }
  if (dynamic.init && !dynamic.init.mean) {
    throw new Error("dynamic.init should have a mean key");
  }
  const covariance = polymorphMatrix(dynamic.init.covariance, { dimension: dynamic.dimension });
  if (TypeAssert_default.isFunction(covariance)) {
    throw new TypeError("covariance can not be a function");
  }
  dynamic.init = {
    ...dynamic.init,
    covariance
  };
  return { observation, dynamic };
}

// src/lib/setup/set-dimensions.ts
function setDimensions(args) {
  const { observation, dynamic } = args;
  const { stateProjection } = observation;
  const { transition } = dynamic;
  const dynamicDimension = dynamic.dimension;
  const observationDimension = observation.dimension;
  if (dynamicDimension && observationDimension && Array.isArray(stateProjection) && (dynamicDimension !== stateProjection[0].length || observationDimension !== stateProjection.length)) {
    throw new TypeError("stateProjection dimensions not matching with observation and dynamic dimensions");
  }
  if (dynamicDimension && Array.isArray(transition) && dynamicDimension !== transition.length) {
    throw new TypeError("transition dimension not matching with dynamic dimension");
  }
  if (Array.isArray(stateProjection)) {
    return {
      observation: {
        ...observation,
        dimension: stateProjection.length
      },
      dynamic: {
        ...dynamic,
        dimension: stateProjection[0].length
      }
    };
  }
  if (Array.isArray(transition)) {
    return {
      observation,
      dynamic: {
        ...dynamic,
        dimension: transition.length
      }
    };
  }
  return { observation, dynamic };
}

// src/lib/utils/array-to-matrix.ts
function arrayToMatrix(args) {
  const { observation, dimension } = args;
  if (!Array.isArray(observation)) {
    if (dimension === 1 && typeof observation === "number") {
      return [[observation]];
    }
    throw new TypeError(`The observation (${observation}) should be an array (dimension: ${dimension})`);
  }
  if (observation.length !== dimension) {
    throw new TypeError(`Observation (${observation.length}) and dimension (${dimension}) not matching`);
  }
  if (typeof observation[0] === "number" || observation[0] === null) {
    return observation.map((element) => [element]);
  }
  return observation;
}

// src/lib/utils/uniq.ts
function uniq(array) {
  return array.filter(
    (value, index) => array.indexOf(value) === index
  );
}

// src/lib/utils/deep-assign.ts
var limit = 100;
function deepAssignInternal(args, step) {
  if (step > limit) {
    throw new Error(`In deepAssign, number of recursive call (${step}) reached limit (${limit}), deepAssign is not working on  self-referencing objects`);
  }
  const filterArguments = args.filter((arg) => arg !== void 0 && arg !== null);
  const lastArgument = filterArguments.at(-1);
  if (filterArguments.length === 1) {
    return filterArguments[0];
  }
  if (typeof lastArgument !== "object" || Array.isArray(lastArgument)) {
    return lastArgument;
  }
  if (filterArguments.length === 0) {
    return null;
  }
  const objectsArguments = filterArguments.filter((arg) => typeof arg === "object");
  let keys = [];
  for (const arg of objectsArguments) {
    keys = keys.concat(Object.keys(arg));
  }
  const uniqKeys = uniq(keys);
  const result = {};
  for (const key of uniqKeys) {
    const values = objectsArguments.map((arg) => arg[key]);
    result[key] = deepAssignInternal(values, step + 1);
  }
  return result;
}
function deepAssign(...args) {
  return deepAssignInternal(args, 0);
}

// src/lib/utils/to-function.ts
function toFunction(array, { label = "" } = {}) {
  if (typeof array === "function") {
    return array;
  }
  if (Array.isArray(array)) {
    return array;
  }
  throw new Error(`${label === null ? "" : `${label} : `}Only arrays and functions are authorized (got: "${array}")`);
}

// src/lib/core-kalman-filter.ts
import {
  add,
  identity as getIdentity,
  invert as invert2,
  matMul as matMul2,
  subtract as sub,
  transpose as transpose2
} from "simple-linalg";

// src/lib/state.ts
import {
  elemWise as elemWise2,
  invert,
  matMul,
  subSquareMatrix,
  subtract,
  transpose
} from "simple-linalg";
var State = class _State {
  mean;
  covariance;
  index;
  constructor(args) {
    this.mean = args.mean;
    this.covariance = args.covariance;
    this.index = args.index || void 0;
  }
  /**
   * Check the consistency of the State
   * @param {object} options
   * @see check
   */
  check(options) {
    _State.check(this, options);
  }
  /**
   * Check the consistency of the State's attributes
   * @param {State} state
   * @param {object} [options]
   * @param {Array} [options.dimension] if defined check the dimension of the state
   * @param {string} [options.title] used to log error mor explicitly
   * @param {boolean} options.eigen
   * @returns {null}
   */
  static check(state, args = {}) {
    const { dimension, title, eigen } = args;
    if (!(state instanceof _State)) {
      throw new TypeError(
        "The argument is not a state \nTips: maybe you are using 2 different version of kalman-filter in your npm deps tree"
      );
    }
    const { mean, covariance } = state;
    const meanDimension = mean.length;
    if (typeof dimension === "number" && meanDimension !== dimension) {
      throw new Error(`[${title}] State.mean ${mean} with dimension ${meanDimension} does not match expected dimension (${dimension})`);
    }
    checkMatrix(mean, [meanDimension, 1], title ? `${title}.mean` : "mean");
    checkMatrix(covariance, [meanDimension, meanDimension], title ? `${title}.covariance` : "covariance");
    checkCovariance({ covariance, eigen }, title ? `${title}.covariance` : "covariance");
  }
  /**
   * Multiply state with matrix
   * @param {State} state
   * @param {Array.<Array.<number>>} matrix
   * @returns {State}
   */
  static matMul(args) {
    const { state, matrix } = args;
    const covariance = matMul(
      matMul(matrix, state.covariance),
      transpose(matrix)
    );
    const mean = matMul(matrix, state.mean);
    return new _State({
      mean,
      covariance,
      index: state.index
    });
  }
  /**
   * From a state in n-dimension create a state in a subspace
   * If you see the state as a N-dimension gaussian,
   * this can be viewed as the sub M-dimension gaussian (M < N)
   * @param {Array.<number>} obsIndexes list of dimension to extract,  (M < N <=> obsIndexes.length < this.mean.length)
   * @returns {State} subState in subspace, with subState.mean.length === obsIndexes.length
   */
  subState(obsIndexes) {
    const state = new _State({
      mean: obsIndexes.map((i) => this.mean[i]),
      covariance: subSquareMatrix(this.covariance, obsIndexes),
      index: this.index
    });
    return state;
  }
  /**
   * @typedef {object} DetailedMahalanobis
   * @property {Array.<[number]>} diff
   * @property {Array.<Array.<number>>} covarianceInvert
   * @property {number} value
   */
  /**
   * Simple Malahanobis distance between the distribution (this) and a point
   * @param {Array.<[number]>} point a Nx1 matrix representing a point
   * @returns {DetailedMahalanobis}
   */
  rawDetailedMahalanobis(point) {
    const diff = subtract(this.mean, point);
    this.check();
    const covarianceInvert = invert(this.covariance);
    if (covarianceInvert === null) {
      this.check({ eigen: true });
      throw new Error(`Cannot invert covariance ${JSON.stringify(this.covariance)}`);
    }
    const diffTransposed = transpose(diff);
    const valueMatrix = matMul(
      matMul(diffTransposed, covarianceInvert),
      diff
    );
    const value = Math.sqrt(valueMatrix[0][0]);
    if (Number.isNaN(value)) {
      const debugValue2 = matMul(
        matMul(
          diffTransposed,
          covarianceInvert
        ),
        diff
      );
      console.log({
        diff,
        covarianceInvert,
        this: this,
        point
      }, debugValue2);
      throw new Error("mahalanobis is NaN");
    }
    return {
      diff,
      covarianceInvert,
      value
    };
  }
  /**
   * Malahanobis distance is made against an observation, so the mean and covariance
   * are projected into the observation space
   * @param {KalmanFilter} kf kalman filter use to project the state in observation's space
   * @param {Observation} observation
   * @param {Array.<number>} obsIndexes list of indexes of observation state to use for the mahalanobis distance
   * @returns {DetailedMahalanobis}
   */
  detailedMahalanobis(args) {
    const { kf, observation, obsIndexes } = args;
    if (observation.length !== kf.observation.dimension) {
      throw new Error(`Mahalanobis observation ${observation} (dimension: ${observation.length}) does not match with kf observation dimension (${kf.observation.dimension})`);
    }
    let correctlySizedObservation = arrayToMatrix({ observation, dimension: observation.length });
    TypeAssert_default.assertIsArray2D(kf.observation.stateProjection, "State.detailedMahalanobis");
    const stateProjection = kf.getValue(kf.observation.stateProjection, {});
    let projectedState = _State.matMul({ state: this, matrix: stateProjection });
    if (Array.isArray(obsIndexes)) {
      projectedState = projectedState.subState(obsIndexes);
      correctlySizedObservation = obsIndexes.map((i) => correctlySizedObservation[i]);
    }
    return projectedState.rawDetailedMahalanobis(correctlySizedObservation);
  }
  /**
   * @param {object} options @see detailedMahalanobis
   * @returns {number}
   */
  mahalanobis(options) {
    const result = this.detailedMahalanobis(options).value;
    if (Number.isNaN(result)) {
      throw new TypeError("mahalanobis is NaN");
    }
    return result;
  }
  /**
   * Bhattacharyya distance is made against in the observation space
   * to do it in the normal space see state.bhattacharyya
   * @param {KalmanFilter} kf kalman filter use to project the state in observation's space
   * @param {State} state
   * @param {Array.<number>} obsIndexes list of indexes of observation state to use for the bhattacharyya distance
   * @returns {number}
   */
  obsBhattacharyya(options) {
    const { kf, state, obsIndexes } = options;
    TypeAssert_default.assertIsArray2D(kf.observation.stateProjection, "State.obsBhattacharyya");
    const stateProjection = kf.getValue(kf.observation.stateProjection, {});
    let projectedSelfState = _State.matMul({ state: this, matrix: stateProjection });
    let projectedOtherState = _State.matMul({ state, matrix: stateProjection });
    if (Array.isArray(obsIndexes)) {
      projectedSelfState = projectedSelfState.subState(obsIndexes);
      projectedOtherState = projectedOtherState.subState(obsIndexes);
    }
    return projectedSelfState.bhattacharyya(projectedOtherState);
  }
  /**
   * @param {State} otherState other state to compare with
   * @returns {number}
   */
  bhattacharyya(otherState) {
    const { covariance, mean } = this;
    const average = elemWise2([covariance, otherState.covariance], ([a, b]) => (a + b) / 2);
    let covarInverted;
    try {
      covarInverted = invert(average);
    } catch (error) {
      console.log("Cannot invert", average);
      throw error;
    }
    const diff = subtract(mean, otherState.mean);
    return matMul(transpose(diff), matMul(covarInverted, diff))[0][0];
  }
};

// src/lib/core-kalman-filter.ts
var defaultLogger = {
  info: (...args) => console.log(...args),
  debug() {
  },
  warn: (...args) => console.log(...args),
  error: (...args) => console.log(...args)
};
var CoreKalmanFilter = class {
  dynamic;
  observation;
  logger;
  constructor(options) {
    const { dynamic, observation, logger = defaultLogger } = options;
    this.dynamic = dynamic;
    this.observation = observation;
    this.logger = logger;
  }
  // | number[]
  getValue(fn, options) {
    return typeof fn === "function" ? fn(options) : fn;
  }
  getInitState() {
    const { mean: meanInit, covariance: covarianceInit, index: indexInit } = this.dynamic.init;
    const initState = new State({
      mean: meanInit,
      covariance: covarianceInit,
      index: indexInit
    });
    State.check(initState, { title: "dynamic.init" });
    return initState;
  }
  /**
  This will return the predicted covariance of a given previousCorrected State, this will help us to build the asymptoticState.
    * @param {State} previousCorrected
    * @returns{Array.<Array.<Number>>}
    */
  getPredictedCovariance(options = {}) {
    let { previousCorrected, index } = options;
    previousCorrected ||= this.getInitState();
    const getValueOptions = { previousCorrected, index, ...options };
    const transition = this.getValue(this.dynamic.transition, getValueOptions);
    checkMatrix(transition, [this.dynamic.dimension, this.dynamic.dimension], "dynamic.transition");
    const transitionTransposed = transpose2(transition);
    const covarianceInter = matMul2(transition, previousCorrected.covariance);
    const covariancePrevious = matMul2(covarianceInter, transitionTransposed);
    const dynCov = this.getValue(this.dynamic.covariance, getValueOptions);
    const covariance = add(
      dynCov,
      covariancePrevious
    );
    checkMatrix(covariance, [this.dynamic.dimension, this.dynamic.dimension], "predicted.covariance");
    return covariance;
  }
  predictMean(o) {
    const mean = this.predictMeanWithoutControl(o);
    if (!this.dynamic.constant) {
      return mean;
    }
    const { opts } = o;
    const control = this.dynamic.constant(opts);
    checkMatrix(control, [this.dynamic.dimension, 1], "dynamic.constant");
    return add(mean, control);
  }
  predictMeanWithoutControl(args) {
    const { opts, transition } = args;
    if (this.dynamic.fn) {
      return this.dynamic.fn(opts);
    }
    const { previousCorrected } = opts;
    return matMul2(transition, previousCorrected.mean);
  }
  /**
  This will return the new prediction, relatively to the dynamic model chosen
    * @param {State} previousCorrected State relative to our dynamic model
    * @returns{State} predicted State
    */
  predict(options = {}) {
    let { previousCorrected, index } = options;
    previousCorrected ||= this.getInitState();
    if (typeof index !== "number" && typeof previousCorrected.index === "number") {
      index = previousCorrected.index + 1;
    }
    State.check(previousCorrected, { dimension: this.dynamic.dimension });
    const getValueOptions = {
      ...options,
      previousCorrected,
      index
    };
    const transition = this.getValue(this.dynamic.transition, getValueOptions);
    const mean = this.predictMean({ transition, opts: getValueOptions });
    const covariance = this.getPredictedCovariance(getValueOptions);
    const predicted = new State({ mean, covariance, index });
    this.logger.debug("Prediction done", predicted);
    if (Number.isNaN(predicted.mean[0][0])) {
      throw new TypeError("nan");
    }
    return predicted;
  }
  /**
   * This will return the new correction, taking into account the prediction made
   * and the observation of the sensor
   * param {State} predicted the previous State
   * @param options
   * @returns kalmanGain
   */
  getGain(options) {
    let { predicted, stateProjection } = options;
    const getValueOptions = {
      index: predicted.index,
      ...options
    };
    TypeAssert_default.assertIsArray2DOrFnc(this.observation.stateProjection, "CoreKalmanFilter.getGain");
    stateProjection ||= this.getValue(this.observation.stateProjection, getValueOptions);
    const obsCovariance = this.getValue(this.observation.covariance, getValueOptions);
    checkMatrix(obsCovariance, [this.observation.dimension, this.observation.dimension], "observation.covariance");
    const stateProjTransposed = transpose2(stateProjection);
    checkMatrix(stateProjection, [this.observation.dimension, this.dynamic.dimension], "observation.stateProjection");
    const noiselessInnovation = matMul2(
      matMul2(stateProjection, predicted.covariance),
      stateProjTransposed
    );
    const innovationCovariance = add(noiselessInnovation, obsCovariance);
    const optimalKalmanGain = matMul2(
      matMul2(predicted.covariance, stateProjTransposed),
      invert2(innovationCovariance)
    );
    return optimalKalmanGain;
  }
  /**
   * This will return the corrected covariance of a given predicted State, this will help us to build the asymptoticState.
   * @param {State} predicted the previous State
   * @returns{Array.<Array.<Number>>}
   */
  getCorrectedCovariance(options) {
    let { predicted, optimalKalmanGain, stateProjection } = options;
    const identity9 = getIdentity(predicted.covariance.length);
    if (!stateProjection) {
      TypeAssert_default.assertIsArray2D(this.observation.stateProjection, "CoreKalmanFilter.getCorrectedCovariance");
      const getValueOptions = {
        index: predicted.index,
        ...options
      };
      stateProjection = this.getValue(this.observation.stateProjection, getValueOptions);
    }
    optimalKalmanGain ||= this.getGain({ stateProjection, ...options });
    return matMul2(
      sub(identity9, matMul2(optimalKalmanGain, stateProjection)),
      predicted.covariance
    );
  }
  getPredictedObservation(args) {
    const { opts, stateProjection } = args;
    if (this.observation.fn) {
      return this.observation.fn(opts);
    }
    const { predicted } = opts;
    return matMul2(stateProjection, predicted.mean);
  }
  /**
  This will return the new correction, taking into account the prediction made
  and the observation of the sensor
    * @param {State} predicted the previous State
    * @param {Array} observation the observation of the sensor
    * @returns{State} corrected State of the Kalman Filter
    */
  correct(options) {
    const { predicted, observation } = options;
    State.check(predicted, { dimension: this.dynamic.dimension });
    if (!observation) {
      throw new Error("no measure available");
    }
    const getValueOptions = {
      observation,
      predicted,
      index: predicted.index,
      ...options
    };
    TypeAssert_default.assertIsArray2DOrFnc(this.observation.stateProjection, "CoreKalmanFilter.correct");
    const stateProjection = this.getValue(this.observation.stateProjection, getValueOptions);
    const optimalKalmanGain = this.getGain({
      predicted,
      stateProjection,
      ...options
    });
    const innovation = sub(
      observation,
      this.getPredictedObservation({ stateProjection, opts: getValueOptions })
    );
    const mean = add(
      predicted.mean,
      matMul2(optimalKalmanGain, innovation)
    );
    if (Number.isNaN(mean[0][0])) {
      console.log({ optimalKalmanGain, innovation, predicted });
      throw new TypeError("Mean is NaN after correction");
    }
    const covariance = this.getCorrectedCovariance(
      {
        predicted,
        optimalKalmanGain,
        stateProjection,
        ...options
      }
    );
    const corrected = new State({ mean, covariance, index: predicted.index });
    this.logger.debug("Correction done", corrected);
    return corrected;
  }
};

// src/lib/kalman-filter.ts
var buildDefaultDynamic = function(dynamic) {
  if (typeof dynamic === "string") {
    return { name: dynamic };
  }
  return { name: "constant-position" };
};
var buildDefaultObservation = function(observation) {
  if (typeof observation === "number") {
    return { name: "sensor", sensorDimension: observation };
  }
  if (typeof observation === "string") {
    return { name: observation };
  }
  return { name: "sensor" };
};
var setupModelsParameters = function(args) {
  let { observation, dynamic } = args;
  if (typeof observation !== "object" || observation === null) {
    observation = buildDefaultObservation(observation);
  }
  if (typeof dynamic !== "object" || dynamic === null) {
    dynamic = buildDefaultDynamic(
      dynamic
      /* , observation */
    );
  }
  if (typeof observation.name === "string") {
    observation = buildObservation(observation);
  }
  if (typeof dynamic.name === "string") {
    dynamic = buildDynamic(dynamic, observation);
  }
  const withDimensionOptions = setDimensions({ observation, dynamic });
  const checkedDimensionOptions = checkDimensions(withDimensionOptions);
  const buildStateProjectionOptions = buildStateProjection(checkedDimensionOptions);
  return extendDynamicInit(buildStateProjectionOptions);
};
var modelsParametersToCoreOptions = function(modelToBeChanged) {
  const { observation, dynamic } = modelToBeChanged;
  TypeAssert_default.assertNotArray(observation, "modelsParametersToCoreOptions: observation");
  return deepAssign(modelToBeChanged, {
    observation: {
      stateProjection: toFunction(polymorphMatrix(observation.stateProjection), { label: "observation.stateProjection" }),
      covariance: toFunction(polymorphMatrix(observation.covariance, { dimension: observation.dimension }), { label: "observation.covariance" })
    },
    dynamic: {
      transition: toFunction(polymorphMatrix(dynamic.transition), { label: "dynamic.transition" }),
      covariance: toFunction(polymorphMatrix(dynamic.covariance, { dimension: dynamic.dimension }), { label: "dynamic.covariance" })
    }
  });
};
var KalmanFilter = class extends CoreKalmanFilter {
  /**
   * @typedef {object} Config
   * @property {DynamicObjectConfig | DynamicNonObjectConfig} dynamic
   * @property {ObservationObjectConfig | ObservationNonObjectConfig} observation
   */
  /**
   * @param {Config} options
   */
  // constructor(options: {observation?: ObservationConfig, dynamic?: DynamicConfig, logger?: WinstonLogger} = {}) {
  constructor(options = {}) {
    const modelsParameters = setupModelsParameters(options);
    const coreOptions = modelsParametersToCoreOptions(modelsParameters);
    super({ ...options, ...coreOptions });
  }
  // previousCorrected?: State, index?: number,
  correct(options) {
    const coreObservation = arrayToMatrix({ observation: options.observation, dimension: this.observation.dimension });
    return super.correct({
      ...options,
      observation: coreObservation
    });
  }
  /**
   * Performs the prediction and the correction steps
   * @param {State} previousCorrected
   * @param {<Array.<Number>>} observation
   * @returns {Array.<number>} the mean of the corrections
   */
  filter(options) {
    const predicted = super.predict(options);
    return this.correct({
      ...options,
      predicted
    });
  }
  /**
   * Filters all the observations
   * @param {Array.<Array.<number>>} observations
   * @returns {Array.<Array.<number>>} the mean of the corrections
   */
  filterAll(observations) {
    let previousCorrected = this.getInitState();
    const results = [];
    for (const observation of observations) {
      const predicted = this.predict({ previousCorrected });
      previousCorrected = this.correct({
        predicted,
        observation
      });
      results.push(previousCorrected.mean.map((m) => m[0]));
    }
    return results;
  }
  /**
   * Returns an estimation of the asymptotic state covariance as explained in https://en.wikipedia.org/wiki/Kalman_filter#Asymptotic_form
   * in practice this can be used as a init.covariance value but is very costful calculation (that's why this is not made by default)
   * @param {number} [limitIterations] max number of iterations
   * @param {number} [tolerance] returns when the last values differences are less than tolerance
   * @return {Array.<Array.<number>>} covariance
   */
  asymptoticStateCovariance({ limitIterations = 100, tolerance: tolerance2 = 1e-6 } = {}) {
    let previousCorrected = super.getInitState();
    const results = [];
    for (let i = 0; i < limitIterations; i++) {
      const predicted = new State({
        mean: [],
        covariance: super.getPredictedCovariance({ previousCorrected })
      });
      previousCorrected = new State({
        mean: [],
        covariance: super.getCorrectedCovariance({ predicted })
      });
      results.push(previousCorrected.covariance);
      if (distanceMat(previousCorrected.covariance, results[i - 1]) < tolerance2) {
        return results[i];
      }
    }
    throw new Error("The state covariance does not converge asymptotically");
  }
  /**
   * Returns an estimation of the asymptotic gain, as explained in https://en.wikipedia.org/wiki/Kalman_filter#Asymptotic_form
   * @param {number} [tolerance] returns when the last values differences are less than tolerance
   * @return {Array.<Array.<number>>} gain
   */
  asymptoticGain({ tolerance: tolerance2 = 1e-6 } = {}) {
    const covariance = this.asymptoticStateCovariance({ tolerance: tolerance2 });
    const asymptoticState = new State({
      // We create a fake mean that will not be used in order to keep coherence
      mean: Array.from({ length: covariance.length }).fill(0).map(() => [0]),
      covariance
    });
    return super.getGain({ predicted: asymptoticState });
  }
};

// src/lib/utils/get-covariance.ts
function getCovariance({ measures, averages }) {
  const l = measures.length;
  const n = measures[0].length;
  if (l === 0) {
    throw new Error("Cannot find covariance for empty sample");
  }
  return new Array(n).fill(1).map((_, rowIndex) => new Array(n).fill(1).map((_2, colIndex) => {
    const stds = measures.map((m, i) => (m[rowIndex] - averages[i][rowIndex]) * (m[colIndex] - averages[i][colIndex]));
    const result = stds.reduce((a, b) => a + b) / l;
    if (Number.isNaN(result)) {
      throw new TypeError("result is NaN");
    }
    return result;
  }));
}

// src/lib/utils/project-observation.ts
import { invert as invert3, matMul as matMul3 } from "simple-linalg";
function projectObservation({ observation, obsIndexes, selectedStateProjection, invertSelectedStateProjection }) {
  if (!observation) {
    return null;
  }
  const value = observation.observation || observation;
  const vec = obsIndexes.map((i) => {
    if (value[i] === void 0) {
      throw new TypeError(`obsIndexes (${obsIndexes}) is not matching with observation (${observation})`);
    }
    return [value[i]];
  });
  const inverse = invertSelectedStateProjection || invert3(selectedStateProjection);
  if (inverse === null) {
    throw new Error("selectedStateProjection is not invertible, please provide invertSelectedStateProjection");
  }
  const out = matMul3(inverse, vec);
  return out.map((v) => v[0]).map((v) => {
    if (Number.isNaN(v)) {
      throw new TypeError("NaN in projection");
    }
    return v;
  });
}

// src/index.ts
function camelToDash(str) {
  if (str === str.toLowerCase()) {
    return str;
  }
  return str.replaceAll(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}
Object.keys(dynamic_exports).forEach((k) => {
  registerDynamic(camelToDash(k), dynamic_exports[k]);
});
Object.keys(observation_exports).forEach((k) => {
  registerObservation(camelToDash(k), observation_exports[k]);
});
export {
  KalmanFilter,
  State,
  buildDynamic,
  buildObservation,
  checkCovariance,
  composition,
  constantAcceleration,
  constantPosition,
  constantPositionWithNull,
  constantSpeed,
  constantSpeedDynamic,
  correlationToCovariance,
  covarianceToCorrelation,
  getCovariance,
  projectObservation,
  registerDynamic,
  registerObservation,
  sensor,
  nullableSensor as sensorLocalVariance,
  sensorProjected,
  shorttermConstantSpeed
};
module.exports = module.exports.default;
