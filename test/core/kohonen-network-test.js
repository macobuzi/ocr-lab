var assert = require('assert');
var KohonenNetwork = require(__dirname + '/../src/kohonen-network.js');
var TrainingSet = require(__dirname + '/../src/training-set.js');

suite('test kohonen network', function() {
	setup(function(){
		// Prepare training sets
		var ts = new TrainingSet(3,3);	
		ts.setTrainingSetCount(3);
		ts.setInput(0, 0, 0.1);
		ts.setInput(0, 1, 0.2);
		ts.setInput(0, 2, 0.3);
		ts.setInput(1, 0, 0.2);
		ts.setInput(1, 1, 0.3);
		ts.setInput(1, 2, 0.4);
		ts.setInput(2, 0, 0.3);
		ts.setInput(2, 1, 0.4);
		ts.setInput(2, 2, 0.5);
		ts.setOutput(0, 0, 1);
		ts.setOutput(0, 1, 0);
		ts.setOutput(0, 2, 0);
		ts.setOutput(1, 0, 0);
		ts.setOutput(1, 1, 1);
		ts.setOutput(1, 2, 0);
		ts.setOutput(2, 0, 0);
		ts.setOutput(2, 1, 0);
		ts.setOutput(2, 2, 1);
		
		// Prepare network
		this.o = new KohonenNetwork(3,3);	
		this.o.setTrainingSet(ts);		
		this.o._outputWeights = [
			[0.1,0.2,0.3,0.1],
			[0.2,0.3,0.1,0.2],
			[0.3,0.1,0.2,0.3]
		];
	});
	
	test('constructor', function() {
		assert.equal(3, this.o.inputNeuronCount);
		assert.equal(3, this.o.outputNeuronCount);
		assert.equal(1, this.o.learnMethod);
	});
	
	test('set training set', function() {
		assert.equal(3, this.o.train.getTrainingSetCount());	
	});
	
	test('copy weight', function() {
		var o1 = new KohonenNetwork(1,1);
		var o2 = new KohonenNetwork(1,1);
		
		o1.initialize();
		o2.copyWeights(o2,o1);
		assert.equal(o2._outputWeights[0][0], o1._outputWeights[0][0]);
	});
	
	test('clear weight', function() {
		var o = new KohonenNetwork(3,3);
		o.initialize();
		o.clearWeights();
		assert.equal(0, o._outputWeights[0][0]);
	});
	
	test('normalize input', function() {
		var input = [3,4,5], normfac=[], synth=[];
		this.o.normalizeInput(input, normfac, synth);
		assert.equal(1/Math.sqrt(50), normfac[0]);
		assert.equal(0.0, synth[0]);		
	});
	
	test('normalize weight', function() {
		var weights = [3,4,5];
		this.o.normalizeWeight(weights);
		assert.equal(3/Math.sqrt(50), weights[0]);
	});
	
	test('trial', function() {
		var input = [3,4,5];
		var result = 0.5 * (2.6 * (1/Math.sqrt(50)) + 1);
		this.o.trial(input);
		assert.equal(result, this.o.output[0]); 
	});
	
	test('winner', function() {
		var input = [5,4,3], normfac=[], synth=[];
		assert.equal(1, this.o.winner(input, normfac, synth));
	});
	
	test('evaluate error', function() {
		var won=[], bigerr=[], correc, work=[], result;
		correc = new Array(3);
		for (var i=0; i<correc.length; i++) {
			correc[i] = new Array(4);
		}
		this.o.evaluateErrors(0.5, 1, won, bigerr, correc, work);
		result = (0.1 * (1/Math.sqrt(0.1*0.1 + 0.2*0.2 + 0.3*0.3)) - 0.1) +
				 (0.2 * (1/Math.sqrt(0.2*0.2 + 0.3*0.3 + 0.4*0.4)) - 0.1) +
				 (0.3 * (1/Math.sqrt(0.3*0.3 + 0.4*0.4 + 0.5*0.5)) - 0.1);				 
		assert.equal(result, correc[0][0]);
	});
	
	test('initialize', function() {		
		// Initialize		
		this.o.initialize();
			
		// Check if all the value is different
		var ok = true, hash = {};
		for (var y=0; y<this.o.outputNeuronCount; y++) {
			for (var x=0; x<this.o.inputNeuronCount; x++) {				
				if (hash[this.o._outputWeights[y][x]]) {
					ok = false;	/* duplicated */
				} else {
					hash[this.o._outputWeights[y][x]] = true;					
				}
			}
		}		
		assert.equal(true, ok);				
	});
	
	test('adjust weights', function() {
		var won, bigcorr=[], correc, result;
		won = [3, 0, 0];
		correc = [
		[0.1, 0, 0, 0], 
		[0, 0, 0, 0], 
		[0, 0, 0, 0]
		];
		this.o.adjustWeights(0.5, 1, won, bigcorr, correc);
		result = 0.5 * (1/3) * 0.1 + 0.1;
		assert.equal(result , this.o._outputWeights[0][0]);
	});
});