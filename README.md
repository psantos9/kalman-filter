# kalman-filter

[Kalman Filter](https://en.wikipedia.org/wiki/Kalman_filter) in JavaScript

This library implements: 
* N-dimension Kalman-Filter
* Online Kalman-Filter
* Prediction/Correction step
* Extended Kalman Filter
* Correlation Matrix

## Installation

```sh
npm install kalman-filter
```

## Simple Example

### 1D Smoothing Usage

```js
const {KalmanFilter} = require('kalman-filter');

const measures = [0, 0.1, 0.5, 0.2];

const kFilter = new KalmanFilter();

const res = kFilter.batch(measures)

console.log(res);
```

**TO DO** add a screenshot of the resulting curve

## How to instantiate your kalman filter

### Simple instanciation with stateModel.name

#### stateModel.name = 'constant-position' 

This is the default behavior

```js
const {KalmanFilter} = require('kalman-filter');

const kFilter = new KalmanFilter({
	observation: {
		sensorDimension: 2,
		name: 'sensors'
	},
	dynamic: {
		name: 'constant-position',// observation.sensorDimension == dynamic.dimension
		covariance: [3, 4]// equivalent to diag([3, 4])
	}
});

```

#### stateModel.name = 'constant-speed' on 2D data


```js
const {KalmanFilter} = require('kalman-filter');

const kFilter = new KalmanFilter({
	observation: {
		sensorDimension: 2,
		name: 'sensors'
	},
	dynamic: {
		name: 'constant-speed',// observation.sensorDimension * 2 == state.dimension
		timeStep: 0.1,
		covariance: [3, 3, 4, 4]// equivalent to diag([3, 3, 4, 4])
	}
});

```

#### stateModel.name = 'constant-acceleration' on 2D data


```js
const {KalmanFilter} = require('kalman-filter');

const kFilter = new KalmanFilter({
	observation: {
		sensorDimension: 2,
		name: 'sensors'
	},	
	dynamic: {
		name: 'constant-acceleration',// observation.sensorDimension * 3 == state.dimension
		timeStep: 0.1,
		covariance: [3, 3, 4, 4, 5, 5]// equivalent to diag([3, 3, 4, 4, 5, 5])
	}
});

```

### Instanciation of a generic linear model

This is an example of how build a constant speed model, in 3D without `stateModel.name`

```js
const {KalmanFilter} = require('kalman-filter');

const timeStep = 0.1;

const kFilter = new KalmanFilter({
	observation: {
		dimension: 3
	},
	dynamic: {
		dimension: 6, //(x, y, z, vx, vy, vz)
		transition: [
			[1, 0, 0, timeStep, 0, 0],
			[0, 1, 0, 0, timeStep, 0],
			[0, 0, 1, 0, 0, timeStep],
			[0, 0, 0, 1, 0, 0],
			[0, 0, 0, 0, 1, 0],
			[0, 0, 0, 0, 0, 1]
		],
		covariance: [1, 1, 1, 0.1, 0.1, 0.1]// equivalent to diag([1, 1, 1, 0.1, 0.1, 0.1])
	}
});

```

## Customize the observation

The observation is made from 2 different sensors which are identical, the input measure will be `[<sensor0-dim0>, <sensor0-dim1>, <sensor1-dim0>, <sensor1-dim1>]`.

```js
const {KalmanFilter} = require('kalman-filter');

const timeStep = 0.1;

const kFilter = new KalmanFilter({
	observation: {
		sensorDimension: 2,// observation.dimension == observation.sensorDimension * observation.nSensors
		nSensors: 2,
		sensorCovariance: [3, 4], // equivalent to diag([3, 3, 4, 4])
		name: 'sensors'
	},
	dynamic: {
		name: 'constant-speed',// observation.sensorDimension * 2 == state.dimension
		covariance: [3, 3, 4, 4]// equivalent to diag([3, 3, 4, 4])
	}
});

```

## Customize the observation

The observation is made from 2 different sensors which are different, the input measure will be `[<sensor0-dim0>, <sensor0-dim1>, <sensor1-dim0>, <sensor1-dim1>]`.

```js
const {KalmanFilter} = require('kalman-filter');

const timeStep = 0.1;

const kFilter = new KalmanFilter({
	observation: {
		sensorDimension: 2,
		nSensors: 2,		
		covariance: [3, 4, 0.3, 0.4], // equivalent to diag([3, 4, 0.3, 0.4])
		name: 'sensors'
	},
	dynamic: {
		name: 'constant-speed',// observation.sensorDimension * 2 == state.dimension
		covariance: [3, 3, 4, 4]// equivalent to diag([3, 3, 4, 4])
	}
});

```

## Custom observation matrix

The observation matrix transform measure into state, it is called `measureToState`


### Linear case

The observation is made from 2 different sensors which are different, the input measure will be `[<sensor0-dim0>, <sensor0-dim1>, <sensor1-dim0>, <sensor1-dim1>]`.

This can be achived manually by doing

```js
const {KalmanFilter} = require('kalman-filter');

const timeStep = 0.1;

const kFilter = new KalmanFilter({
	observation: {
		dimension: 4,
		measureToState: [
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[1, 0, 0, 0],
			[0, 1, 0, 0]
		],
		covariance: [3, 4, 0.3, 0.4]
	},
	dynamic: {
		name: 'constant-speed',// observation.sensorDimension * 2 == state.dimension
		covariance: [3, 3, 4, 4]// equivalent to diag([3, 3, 4, 4])
	}
});
```

### Use function as observation or dynamic  matrixes

In this example, we create a constant-speed filter with non-uniform intervals;

```js
const {KalmanFilter} = require('kalman-filter');

const intervals = [1,1,1,1,2,1,1,1];

const kFilter = new KalmanFilter({
	observation: {
		dimension: 2,
		/**
		* @param {KalmanPoint} predicted
		* @param {Array.<Number>} observation
		* @param {Number} index		
		*/
		measureToState: function(opts){
			return [
				[1, 0, 0, 0],
				[0, 1, 0, 0]
			]
		},
		/**
		* @param {KalmanPoint} predicted
		* @param {Array.<Number>} observation
		* @param {Number} index
		*/		
		covariance: function(opts){
			return [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, 1]
			]
		}
	},
	dynamic: {
		dimension: 4, //(x, y, vx, vy)
		/**
		* @param {KalmanPoint} previousCorrected
		* @param {Number} index
		*/
		transition: function(opts){
			const dT = intervals[opts.index];
			if(typeof(dT) !== 'number' || isNaN(dT) || dT <= 0){
				throw(new Error('dT should be positive number'))
			}
			return [
				[1, 0, dT, 0],
				[0, 1, 0, dT]
				[0, 0, 1, 0]
				[0, 0, 0, 1]
			]
		},
		/**
		* @param {KalmanPoint} previousCorrected
		* @param {Number} index
		*/		
		covariance: function(opts){
			const dT = intervals[opts.index];
			if(typeof(dT) !== 'number' || isNaN(dT) || dT <= 0){
				throw(new Error('dT should be positive number'))
			}			
			return [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1*dT, 0],
				[0, 0, 0, 1*dT]
			]
		}
	}
});
```

## Use your kalman filter

### Simple Batch usage (run it once for the whole dataset)

```js
const measures = [[0, 2], [0.1, 4], [0.5, 9], [0.2, 12]];

// batch kalman filter
const results = kFilter.batch(measures);
```
### Online usage (run it online)

When using online usage, the output of the `online` method is an instance of the "Kalman Point" class.

```js
// online kalman filter
let previous = null;
const results = [];
measures.forEach(m => {
	previous = kFilter.online(previous, m);
	results.push(previous.av);
});
```

### Predict/Correct detailed usage (run it online)

If you want to use KalmanFilter in more advanced usage, you might want to dissociate the `predict` and the `correct` functions

```js
// online kalman filter
let previousCorrected = null;
const results = [];
measures.forEach(measure => {
	const predicted = kFilter.predict({
		previousCorrected
	});
	
	previousCorrected = kFilter.correct({
		predicted,
		measure
	});
	
	results.push(previousCorrected.toArray());
});

console.log(results);
```

### Batch Forward - Backward filtering usage

```js
// batch kalman filter
const results = kFilter.batch({measures, passMode: 'forward-backward'});
```

## Register dynamic/observation models

To get more information on how to build a dynamic model, check in the code `lib/dynamic/` (or `lib/observation` for observation models).
If you feel your model can be used by other, do not hesitate to create a Pull Request.

```js
const {registerDynamic, KalmanFilter, registerObservation} = require('kalman-filter');

registerDynamic('custom-dynamic', function(opts1){
	// do your stuff
	return {
		dimension, 
		transition,
		covariance 
	}
})

registerObservation('custom-sensor', function(opts2){
	// do your stuff
	return {
		dimension, 
		measureToState,
		covariance 
	}
})

const kFilter = new KalmanFilter({
	dynamic: {
		name: 'custom-dynamic',
		// ... fields of opts1
	},
	observation: {
		name: 'custom-sensor',
		// ... fields of opts2
	}
});

```

## Set your model parameters from the ground truths state values

In order to find the proper values for covariance matrix, we use following approach :

```js

const {getCovariance, KalmanFilter} = require('kalman-filter');

// Ground truth values in the dynamic model hidden state 
const groundTruthStates = [ // here this is (x, vx)	
	[[0, 1.1], [1.1, 1], [2.1, 0.9], [3, 1], [4, 1.2]], // example 1 
	[[8, 1.1], [9.1, 1], [10.1, 0.9], [11, 1], [12, 1.2]] // example 2
]

// Observations of this values
const measures = [ // here this is x only
	[[0.1], [1.3], [2.4], [2.6], [3.8]], // example 1
	[[8.1], [9.3], [10.4], [10.6], [11.8]] // example 2
]; 

const kFilter = new KalmanFilter({
	observation: {
		name: 'sensor',
		sensorDimension: 1
	},
	dynamic: {
		name: 'constant-speed'
	}
})

const dynamicCovariance = getCovariance({
	measures: groundTruthStates.map(ex => 
		return ex.slice(1).map((_, index) => {
			return kFilter.predict({previousCorrected: ex[index - 1]}).av;
		})
	).reduce((a,b) => a.concat(b)),
	averages: groundTruthStates.map(ex => 
		return ex.slice(1)
	).reduce((a,b) => a.concat(b)),
});

const observationCovariance = getCovariance({
	measures: measures.reduce((a,b) => a.concat(b)),
	averages: groundTruthStates.map((a) => a[0]).reduce((a,b) => a.concat(b))
});

```
