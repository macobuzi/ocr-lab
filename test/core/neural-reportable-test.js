var assert = require('assert');
var NeuralReportable = require(__dirname + '/../src/neural-reportable.js');

suite('test neural reportable interface', function() {
	test('constructor', function() {
		var newImpl = new NeuralReportable({
			update:	function(retry, totalError, bestError) {
				return retry + totalError + bestError;			
			}
		});		
		assert.equal(10, newImpl.update(3,4,3));
	});	
});
