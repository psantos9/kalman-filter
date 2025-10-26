/**
 * Enables to register observation model and store it
 * @param {string} name
 * @callback fn the function corresponding to the desired model
 */
export declare function registerObservation(name: string, fn: any): void;
/**
 * Enables to register dynamic model and store it
 * @param {string} name
 * @callback fn the function corresponding to the desired model
 */
export declare function registerDynamic(name: string, fn: any): void;
/**
 * Build a model given an observation configuration
 * @param {ObservationConfig} observation
 * @returns {ObservationConfig} the configuration with respect to the model
 */
export declare function buildObservation(observation: any): any;
/**
 * Build a model given dynamic and observation configurations
 * @param {DynamicConfig} dynamic
 * @param {ObservationConfig} observation
 * @returns {DynamicConfig} the dynamic configuration with respect to the model
 */
export declare function buildDynamic(dynamic: any, observation: any): any;
//# sourceMappingURL=model-collection.d.ts.map