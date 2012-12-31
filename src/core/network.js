/*
 * network.js
 * 
 * Author: Anh Tran
 * 
 */

//module.exports = Network;

function Network(implementObj) {
	// Constant
	this.NERON_ON = 0.9;
	this.NEURON_OFF = 0.1;
	
	// Variables
	this.ouput = [];
	this.totalError;
	this.inputNeuronCount;
	this.outputNeuronCount;
		
	// Abstract methods	
	// learn: learn()
	// trail: trail(input)
	this.learn = implementObj.learn;
	this.trial = implementObj.trial;
}

Network.prototype.getOutput = function() {
	return this.output;
}

Network.prototype.vectorLength = function(v) {
	var rtn = 0.0;	
	for (var i=0; i<v.length; i++) {
		rtn += v[i] * v[i];
	}
	return rtn;
}

Network.prototype.dotProduct = function(vec1, vec2) {
	var k = vec1.length,
		v = 0,
		rtn = 0.0;
	while((k--)>0) {
		rtn += vec1[v] * vec2[v];
		v++;
	}
	return rtn;
}

Network.prototype.randomizeWeights = function(weight) {
	var r, temp, maxint;	
	temp = Math.floor(3.464101615 / (2. * Math.random()));
	maxint = Math.pow(2,32) - 1;	
	for (var y=0; y<weight.length; y++) {
		for (var x=0; x<weight[0].length; x++) {
			r = Math.floor(Math.random()*maxint) + Math.floor(Math.random()*maxint) -
				Math.floor(Math.random()*maxint) - Math.floor(Math.random()*maxint);
			weight[y][x] = temp * r;
		}
	}
}