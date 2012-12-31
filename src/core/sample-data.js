/*
 * sample-data.js
 * 
 * Author: Anh Tran
 * 
 */

//module.exports = SampleData;

function SampleData(letter, width, height) {
	this.grid = new Array(width);
	for (var x=0; x<width; x++) {
		this.grid[x] = new Array(height);
	}		
	this.letter = letter;
}

SampleData.prototype.setData = function(x, y, v) {
	this.grid[x][y] = v;
}	

SampleData.prototype.getData = function(x, y) {
	return this.grid[x][y];	
}

SampleData.prototype.clear = function() {
	for (var x=0; x<this.grid.length; x++) {
		for (var y=0; y<this.grid[0].length; y++) {
			this.grid[x][y] = false;
		}
	}
}

SampleData.prototype.getHeight = function() {
	return this.grid[0].length;	
}

SampleData.prototype.getWidth = function() {
	return this.grid.length;
}

SampleData.prototype.getLetter = function() {
	return this.letter;
}

SampleData.prototype.setLetter = function(letter) {
	this.letter = letter;
}

SampleData.prototype.compareTo = function(o) {
	return (this.getLetter() > o.getLetter())? 1 : -1;
}

SampleData.prototype.toString = function() {
	return this.letter;
}

SampleData.prototype.clone = function() {
	var obj = new SampleData(this.letter, this.getWidth(), this.getHeight());
	for (var x=0; x<this.getWidth(); x++) {
		for (var y=0; y<this.getHeight(); y++) {
			obj.setData(x,y,this.getData(x,y));
		}
	}
	return obj;
}