/*
 * kohonen-network.js
 * 
 * Author: Anh Tran
 * 
 */

// This is for testing with node.js using command line 
// module.exports = KohonenNetwork;
// var Network = require(__dirname + '/../src/network.js');

// Extends Network class
KohonenNetwork.prototype = new Network({
	learn: KohonenNetwork.prototype.learn,
	trail: KohonenNetwork.prototype.trial
});	
KohonenNetwork.prototype.constructor = KohonenNetwork;

function KohonenNetwork(inputCount, outputCount, owner) {
	// Inherited variables	
	this.totalError = 1.0;
	this.inputNeuronCount = inputCount;
	this.outputNeuronCount = outputCount;		
	this.output = new Array(this.outputNeuronCount);
		
	// Variables	
	this.owner = owner; /* NeuralReportable */
	this.train; /* TrainingSet */
	this._outputWeights = new Array(this.outputNeuronCount); 	
	for (var i=0; i<this.outputNeuronCount; i++) {
		this._outputWeights[i] = new Array(this.inputNeuronCount + 1);
	}
	
	// Learning parameters
	this.learnMethod = 1;
	this.learnRate = 0.5;
	this.quitError = 0.1;
	this.retries = 10000;
	this.reduction= 0.99;
	this.halt = false;
	
	// Training Result
	this.retryNum;
	this.lastError;
	this.bestError;
}

KohonenNetwork.prototype.setTrainingSet = function(set) {
	this.train = set;
}

KohonenNetwork.prototype.copyWeights = function(dest, source) {
	for (var i=0; i<dest._outputWeights.length; i++) {
		for (var j=0; j<dest._outputWeights[0].length; j++) {
			dest._outputWeights[i][j] = source._outputWeights[i][j];	
		}		
	}
}

KohonenNetwork.prototype.clearWeights = function() {
	this.totalError = 1.0;
	for (var y=0; y<this._outputWeights.length; y++) {
		for (var x=0; x<this._outputWeights[0].length; x++) {
			this._outputWeights[y][x] = 0;
		}
	}
}

KohonenNetwork.prototype.normalizeInput = function(input, normfac, synth) {
	var length, d;	
	length = this.vectorLength(input);	
	if (length < 1.E-30) {
		length = 1.E-30;
	}	
	normfac[0] = 1.0 / Math.sqrt(length);
	synth[0] = 0.0;
}

KohonenNetwork.prototype.normalizeWeight = function(w) {
	var i, len;
	len = this.vectorLength(w);
	if (len < 1.E-30) {
		len = 1.E-30;
	}
	len = 1.0 / Math.sqrt(len);
	for (var i=0; i<this.inputNeuronCount; i++) {
		w[i] *= len;
	}
	w[this.inputNeuronCount] = 0;
}

KohonenNetwork.prototype.trial = function(input) {
	// Variables
	var i, normfac, synth, optr;
	
	// Normalize input
	normfac = new Array(1);
	synth = new Array(1);
	this.normalizeInput(input, normfac, synth);
	
	// Calculate and transform output values
	for (var i=0; i<this.outputNeuronCount; i++) {
		// Calculate output values
		optr = this._outputWeights[i];
		this.output[i] = this.dotProduct(input, optr) * normfac[0] +
			synth[0] * optr[this.inputNeuronCount];
		
		// Remap to bipolar -1,1 to 0,1 with rounding
		this.output[i] = 0.5 * (this.output[i] + 1.0);
		if (this.output[i] > 1.0) {
			this.output[i] = 1.0;
		}
		if (this.output[i] < 0.0) {
			this.output[i] = 0.0;
		}
	}
}

KohonenNetwork.prototype.winner = function(input, normfac, synth) {
	// Declare variables and normalize input
	var i, win=0, biggest, optr;
	this.normalizeInput(input, normfac, synth);
	
	// Find the biggest output value
	biggest = -1.E30;
	for (var i=0; i<this.outputNeuronCount; i++) {
		optr = this._outputWeights[i];
		this.output[i] = this.dotProduct(input, optr) * normfac[0] +
			synth[0] * optr[this.inputNeuronCount];
		this.output[i] = 0.5 * (this.output[i] + 1.0);
		if (this.output[i] > biggest) {
			biggest = this.output[i];
			win = i;
		}
		if (this.output[i] > 1.0) {
			this.output[i] = 1.0;
		}
		if (this.output[i] < 0.0) {
			this.output[i] = 0.0;
		}
	}
	
	return win;
}

KohonenNetwork.prototype.evaluateErrors = function (
	rate, learnMethod, won, bigerr, correc, work) 
{
	// Variables
	var best, size, tset,
		dptr, normfac, synth,
		cptr, wptr, length, diff;		
	normfac = new Array(1);
	synth = new Array(1);
	
	// Reset correction and winner counts
	for (var y=0; y<correc.length; y++) {
		for (var x=0; x<correc[0].length; x++) {
			correc[y][x] = 0;
		}
	}
	for (var i=0; i<won.length; i++) {
		won[i] = 0;
	}
	bigerr[0] = 0.0;
	
	// Loop through all training sets to determine correction
	for (tset = 0; tset<this.train.getTrainingSetCount(); tset++) {
		dptr = this.train.getInputSet(tset);
		best = this.winner(dptr, normfac, synth);
		won[best]++;
		wptr = this._outputWeights[best];
		cptr = correc[best];
		length = 0.0;		
		for (var i=0; i<this.inputNeuronCount; i++) {
			diff = dptr[i] * normfac[0] - wptr[i];
			length += diff * diff;
			if (this.learnMethod != 0) {
				cptr[i] += diff;
			} else {
				work[i] = rate * dptr[i] * normfac[0] + wptr[i];
			}
		}
		diff = synth[0] - wptr[this.inputNeuronCount];		
		length += diff*diff;
		if (this.learnMethod != 0) {
				cptr[i] += diff;
		} else {
			work[i] = rate * dptr[i] * normfac[0] + wptr[i];
		}
		if (length > bigerr[0]) {
			bigerr[0] = length;
		}
		if (learnMethod == 0) {
			this.normalizeWeight(work);
			for (var i=0; i<this.inputNeuronCount; i++) {
				cptr[i] += work[i] - wptr[i];
			}
		}		
	}
	
	// Scale the error
	bigerr[0] = Math.sqrt(bigerr[0]);
}	

KohonenNetwork.prototype.adjustWeights = function(
	rate, learnMethod, won, bigcorr, correc) 
{
	// Variables
	var corr, cptr, wptr, length, f;
	bigcorr[0] = 0.0;
	
	// Adjust output weights matrix
	for (var i=0; i<this.outputNeuronCount; i++) {
		if (won[i] == 0) {
			continue;
		}
		wptr = this._outputWeights[i];
		cptr = correc[i];
		f = 1.0 / won[i];
		if (learnMethod != 0) {
			f *= rate;
		}
		length = 0.0;
		for (var j=0; j<=this.inputNeuronCount; j++) {
			corr = f * cptr[j];
			wptr[j] += corr;
			length += corr * corr;
		}
		if (length > bigcorr[0])
			bigcorr[0] = length;
	}
	
	// Scale the correction
	bigcorr[0] = Math.sqrt(bigcorr[0]) / rate;
}		

KohonenNetwork.prototype.forceWin = function(won) {
	// Variables
	var i, tset, best, size, which=0,
		dptr, normfac, synth, dist, optr;
	normfac = new Array(1);
	synth = new Array(1);	
	size = this.inputNeuronCount - 1;
	
	// Find the training set that have the lowest winner value
	dist = 1.E30;
	for (tset = 0; tset < this.train.getTrainingSetCount(); tset++) {
		dptr = this.train.getInputSet(tset);
		best = this.winner(dptr, normfac, synth);
		if (this.output[best] < dist) {
			dist = this.output[best];
			which = tset;
		}
	}
	dptr = this.train.getInputSet(which);
	best = this.winner(dptr, normfac, synth);
	
	// Find the neuron have highest value which never win given set
	dist = -1.E30;
	i = this.outputNeuronCount;
	while((i--) > 0) {
		if (won[i] != 0) {
			continue;
		}
		if (this.output[i] > dist) {
			dist = this.output[i];
			which = i;
		}
	}	
	
	// Adjust weight to make sure that output will win next time
	optr = this._outputWeights[which];
	for (var i=0; i<dptr.length; i++) {
		optr[i] = dptr[i];	
	}	
	optr[this.inputNeuronCount] = synth[0] / normfac[0];
	this.normalizeWeight(optr);
}

KohonenNetwork.prototype.learn = function() {
	// Variables
	var i, key, tset, iter, nRetry, nwts,
		won, winners, work, correc, rate, bestErr,
		dptr, bigerr, bigcorr, bestnet;
	bigerr = new Array(1);
	bigcorr = new Array(1);
	this.totalError = 1.0;
	
	// Initilize training process
	for (tset=0; tset < this.train.getTrainingSetCount(); tset++) {
		dptr = this.train.getInputSet(tset);
		if (this.vectorLength(dptr) < 1.E-30) {
			throw new Error('Multiplicative normalization has null training case');
		}
	}
	bestnet = new KohonenNetwork(this.inputNeuronCount, this.outputNeuronCount, this.owner);
	won = new Array(this.outputNeuronCount);
	correc = new Array(this.outputNeuronCount);
	for (var i=0; i < correc.length; i++) {
		correc[i] = new Array(this.inputNeuronCount + 1);
	}
	if (this.learnMethod == 0) {
		work = new Array(this.inputNeuronCount + 1);
	} else {
		work = null;
	}
	rate = this.learnRate;
	this.initialize();
	bestErr = 1.E30;
	
	// Main loop
	nRetry = 0;
	for (iter = 0; ; iter++) {
		// Find the best output weights
		this.evaluateErrors(rate, this.learnMethod, won, 
			bigerr, correc, work);
		this.totalError = bigerr[0];
		if (this.totalError < bestErr) {			
			bestErr = this.totalError;
			this.copyWeights(bestnet, this);
		}
		
		// If error is good enough then finish training
		if (bigerr[0] < this.quitError) {
			break;
		}
		
		// If there are some outputs that never win, force them win 
		winners = 0;
		for (var i=0; i<won.length; i++) {
			if (won[i] != 0) {
				winners++;
			}
		}				
		if ((winners < this.outputNeuronCount) && 
			(winners < this.train.getTrainingSetCount())) 
		{
			this.forceWin(won);
			continue;
		}
		
		// Adjust output weights
		this.adjustWeights(rate, this.learnMethod, won, bigcorr, correc);
		
		// If error is not too big then create a new weights matrix and start
		// again. However, if the number of retries is bigger than the retries 
		// limit then finish the training
		if (bigcorr[0] < 1E-5) {
			if (++nRetry > this.retries) {
				break;
			}
			this.initialize();
			iter = -1;
			rate = this.learnRate;
			continue;
		}
						
		// If rate is not too small, reduce rate to make the training process
		// converge easily
		if (rate > 0.01) {
			rate *= this.reduction;
		}
	}
	
	// Done
	this.copyWeights(this, bestnet);
	for (var i=0; i<this.outputNeuronCount; i++) {
		this.normalizeWeight(this._outputWeights[i]);
	}
	
	// Copy result
	this.retryNum = iter;
	this.lastError = bigerr[0];
	this.bestError = bestErr;
}

KohonenNetwork.prototype.initialize = function() {
	var i, optr;
	this.clearWeights();	
	this.randomizeWeights(this._outputWeights);
	for (var i=0; i<this.outputNeuronCount; i++) {
		optr = this._outputWeights[i];
		this.normalizeWeight(optr);
	}
}