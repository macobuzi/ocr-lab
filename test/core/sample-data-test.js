var assert = require('assert');
var SampleData = require(__dirname + '/../src/sample-data.js');

suite('test sample data', function() {
	test('constructor', function() {
		var o = new SampleData('A',3,4);
		assert.equal(3, o.getWidth());
		assert.equal(4, o.getHeight());
		assert.equal('A', o.getLetter());
	});
	
	test('compare to', function() {
		var o1 = new SampleData('C',3,4);
		var o2 = new SampleData('C',4,5);
		var o3 = new SampleData('A',3,4);
		assert.equal(-1, o1.compareTo(o2));
		assert.equal(1, o1.compareTo(o3));
	});
	
	test('to string', function() {
		var o = new SampleData('A',3,4);
		assert.equal('A', o.toString());
	});
	
	test('clone', function() {
		var o = new SampleData('A',3,4);
		o.setData(2,2,true);
		var c = o.clone();
		assert.equal(true, c.getData(2,2));
	});
	
	test('test clear', function() {
		var o = new SampleData('A',3,4);
		o.setData(2,2,true);
		o.clear();
		assert.equal(false, o.getData(2,2));
	});
});