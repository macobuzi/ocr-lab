var assert = require('assert');
var TrainingSet = require(__dirname + '/../src/training-set.js');

suite('test training set', function() {
	test('constructor', function() {
		var o = new TrainingSet(3,2);
		assert.equal(3, o.getInputCount());
		assert.equal(2, o.getOutputCount());
		assert.equal(0, o.getTrainingSetCount());
	});
	
	test('set training set count', function() {
		var o = new TrainingSet(3,2);
		o.setTrainingSetCount(10);
		assert.equal(3, o.getInputSet(9).length);
		assert.equal(2, o.getOutputSet(9).length);
	});
	
	test('set/get input and output', function() {
		var o = new TrainingSet(3,2);
		o.setTrainingSetCount(2);
		o.setInput(0, 2, 0.5);
		o.setOutput(0, 1, 0.9);
		assert.equal(0.5, o.getInput(0, 2));
		assert.equal(0.9, o.getOutput(0, 1));
	});
});