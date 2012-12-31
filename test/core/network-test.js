var assert = require('assert');
var Network = require(__dirname + '/../src/network.js');

suite('test network', function() {	
	setup(function(){
		this.o = new Network({
			learn: function(){return 'learn method';},
			trial: function(input){return 'trail method: ' + input;}
		});				 
	});
	
	test('constructor', function() {				
		assert.equal('learn method', this.o.learn());
		assert.equal('trail method: abc', this.o.trial('abc'));
	});
	
	test('vector length', function() {
		assert.equal(25, this.o.vectorLength([3,4]));		
	});
	
	test('dot product', function() {
		assert.equal(39,this.o.dotProduct([3,4],[5,6]));
	});
	
	test('randomize weights', function() {
		// Generate random weight matrix
		var weight = new Array(10);
		for (var y=0; y<weight.length; y++) {
			weight[y] = new Array(2);
		}
		this.o.randomizeWeights(weight);
		
		// Check if all the value is different
		var ok = true, hash = {};
		for (var y=0; y<weight.length; y++) {
			for (var x=0; x<weight[0].length; x++) {
				if (hash[weight[y][x]]) {
					ok = false;	/* duplicated */
				} else {
					hash[weight[y][x]] = true;					
				}
			}
		}
		assert.equal(true, ok);
	});
});