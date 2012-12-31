/*
 * neural-reportable.js
 * 
 * Author: Anh Tran
 * 
 */

//module.exports = NeuralReportable;

function NeuralReportable(implementObj) {
	// Interface methods
	// update: update(retry, totalError, best Error)
	this.update = implementObj.update; 
}