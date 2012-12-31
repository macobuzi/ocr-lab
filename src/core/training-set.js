/*
 * training-set.js
 * 
 * Author: Anh Tran
 * 
 */

//module.exports = TrainingSet;

function TrainingSet(inputCount, outputCount) {	
	this.inputCount = inputCount;
	this.outputCount = outputCount;
	this.trainingSetCount = 0;
}

TrainingSet.prototype.getInputCount = function() {
	return this.inputCount;
}

TrainingSet.prototype.getOutputCount = function() {
	return this.outputCount;
}

TrainingSet.prototype.setTrainingSetCount = function(trainingSetCount) {
	this.trainingSetCount = trainingSetCount;
	this.input = new Array(trainingSetCount);
	this.output = new Array(trainingSetCount);
	
	for (var i=0; i<trainingSetCount; i++) {
		this.input[i] = new Array(this.inputCount);
		this.output[i] = new Array(this.outputCount);
	}
}

TrainingSet.prototype.getTrainingSetCount = function() {
	return this.trainingSetCount;
}

TrainingSet.prototype.setInput = function(set, index, value) {
	if (set<0 || set>=this.trainingSetCount) {
		throw new Error("Training set out of range: " + set);
	}
	if (index<0 || index>=this.inputCount) {
		throw new Error("Training input index out of range: " + index);
	}
	this.input[set][index] = value;
}

TrainingSet.prototype.setOutput = function(set, index, value) {
	if (set<0 || set>=this.trainingSetCount) {
		throw new Error("Training set out of range: " + set);
	}
	if (index<0 || index>=this.outputCount) {
		throw new Error("Training output index out of range: " + index);
	}
	this.output[set][index] = value;
}

TrainingSet.prototype.getInput = function(set, index) {
	if (set<0 || set>=this.trainingSetCount) {
		throw new Error("Training set out of range: " + set);
	}
	if (index<0 || index>=this.inputCount) {
		throw new Error("Training input index out of range: " + index);
	}
	return this.input[set][index];
}

TrainingSet.prototype.getOutput = function(set, index) {
	if (set<0 || set>=this.trainingSetCount) {
		throw new Error("Training set out of range: " + set);
	}
	if (index<0 || index>=this.outputCount) {
		throw new Error("Training output index out of range: " + index);
	}
	return this.output[set][index];
}

TrainingSet.prototype.getOutputSet = function(set) {
	if (set<0 || set>=this.trainingSetCount) {
		throw new Error("Training set out of range: " + set);
	}
	return this.output[set];
}

TrainingSet.prototype.getInputSet = function(set) {
	if (set<0 || set>=this.trainingSetCount) {
		throw new Error("Training set out of range: " + set);
	}
	return this.input[set];
}
