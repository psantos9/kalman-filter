"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerObservation = registerObservation;
exports.registerDynamic = registerDynamic;
exports.buildObservation = buildObservation;
exports.buildDynamic = buildDynamic;
const registeredObservationModels = {};
// const registeredDynamicModels: Record<(dynamic, observation) => dynamic, {dimension, transition, covariance}> = {};
const registeredDynamicModels = {};
/**
 * Enables to register observation model and store it
 * @param {string} name
 * @callback fn the function corresponding to the desired model
 */
function registerObservation(name, fn) {
    registeredObservationModels[name] = fn;
}
/**
 * Enables to register dynamic model and store it
 * @param {string} name
 * @callback fn the function corresponding to the desired model
 */
function registerDynamic(name, fn) {
    registeredDynamicModels[name] = fn;
}
/**
 * Build a model given an observation configuration
 * @param {ObservationConfig} observation
 * @returns {ObservationConfig} the configuration with respect to the model
 */
function buildObservation(observation) {
    if (typeof (registeredObservationModels[observation.name]) !== 'function') {
        throw (new TypeError(`The provided observation model name (${observation.name}) is not registered`));
    }
    return registeredObservationModels[observation.name](observation);
}
/**
 * Build a model given dynamic and observation configurations
 * @param {DynamicConfig} dynamic
 * @param {ObservationConfig} observation
 * @returns {DynamicConfig} the dynamic configuration with respect to the model
 */
function buildDynamic(dynamic, observation) {
    if (typeof (registeredDynamicModels[dynamic.name]) !== 'function') {
        throw (new TypeError(`The provided dynamic model (${dynamic.name}) name is not registered`));
    }
    return registeredDynamicModels[dynamic.name](dynamic, observation);
}
//# sourceMappingURL=model-collection.js.map