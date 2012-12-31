/* 
 * program.js
 * 
 * Author: Dr.Ralph Bunker
 * Modified by Anh Tran
 */

var SAMPLE_WIDTH = 5;
var SAMPLE_HEIGHT = 7;
var OCR_THRESHHOLD = 2;
var ocrData;
var network;

function downSample (canvas) {
    var a, row, col, w, h, img, pixelMap, downSample, ratioX, ratioY, x, y, numPixels;

    if (!ocrData) {
        ocrData = [];
        // Create a 2D array with SAMPLE_HEIGHT rows and SAMPLE_WIDTH columns
        for (row=0; row < SAMPLE_HEIGHT; row++) {
            a = [ ];
            ocrData.push(a);
            for (col=0; col < SAMPLE_WIDTH; col++) {
                a.push(false);
            }
        }
    }

    w = canvas.width;
    h = canvas.height;
    img = letterContext.getImageData(0, 0, w, h);
    pixelMap = img.data;		// pixels appear in a left to right, top to bottom order. Each pixel is 4 bytes (r, g, b, a)

    // Note: the following was translated from Java (See project HeatonOCRDemo)
    downSample = findBounds(pixelMap, w, h);    // Get bounding rectangle of letter
    ratioX = (downSample.right - downSample.left + 1) / SAMPLE_WIDTH;       // TODO: This is a problem for letter I
    ratioY = (downSample.bottom - downSample.top + 1) / SAMPLE_HEIGHT;

    // Count pixels in each of the SAMPLE_WIDTH x SAMPLE_HEIGHT partitions
    for (y = 0; y<SAMPLE_HEIGHT; y++) {
        for (x = 0; x < SAMPLE_WIDTH; x++) {
            numPixels = downSampleQuadrant(x, y, w, downSample, ratioX, ratioY, pixelMap);
            ocrData[y][x] = numPixels;
        }
    }

    // Display ocrData as a HTML table
    //drawMatrix(ocrData);
	
	drawPattern(ocrData);
	
    // Draw lines on image to mark the non-empty partitions
    markupCanvas(canvas, downSample, ocrData);

    return ocrData;
}

// Draw lines on the image to show the non-empty images
function markupCanvas (canvas, downsample, data) {
    var row, col, x, y, width, height, ctx;
    width = ((downsample.right - downsample.left + 1)/SAMPLE_WIDTH);
    height = ((downsample.bottom - downsample.top + 1)/SAMPLE_HEIGHT);
    ctx = canvas.getContext('2d');
    for (row = 0; row<SAMPLE_HEIGHT; row++) {
        for (col = 0; col < SAMPLE_WIDTH; col++) {
            if (data[row][col] > OCR_THRESHHOLD) {
                x = downsample.left + col * width;
                y = downsample.top + row * height;
                drawPartition('blue', ctx, {
                    left:x,
                    top:y,
                    right:x+width-1,
                    bottom:y+height-1
                    });
            }
        }
    }
}
    
function drawPartition (color, ctx, downSample) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(downSample.left, downSample.top);		// upper left corner
    	
    ctx.lineTo(downSample.right, downSample.top);
    ctx.stroke();			// draw top edge
    	
    ctx.lineTo(downSample.right, downSample.bottom);
    ctx.stroke();			// draw right edge
    	
    ctx.lineTo(downSample.left, downSample.bottom);
    ctx.stroke();			// draw bottom edge
    	
    ctx.lineTo(downSample.left, downSample.top)
    ctx.stroke();			// draw left edge

    ctx.strokeStyle = 'black';
}

// Display normalized data in an HTML table
function drawMatrix (data) {
    var x, y, dump;
    dump = '<table border="1px" style="border-collapse:collapse">';
    	
    for (y = 0; y<SAMPLE_HEIGHT; y++) {
        dump += '<tr>';
        for (x = 0; x < SAMPLE_WIDTH; x++) {
            dump += '<td>' + data[y][x] + '</td>';
        }
        dump += "</tr>";
    }
    dump += '</table>';
    divDataDump.innerHTML = dump;
}

// Count the number of pixels in partion <x, y>
function downSampleQuadrant (x, y, w, downSample, ratioX, ratioY, pixelMap) {
    var startX, startY, endX, endY, yy, xx, loc, count;

    startX = Math.floor(downSample.left + x*ratioX);
    startY = Math.floor(downSample.top + y*ratioY);
    endX = Math.floor(startX + ratioX);
    if (endX > downSample.right) {
        endX = downSample.right;
    }
    if (endY > downSample.bottom) {
        endY = downSample.bottom;
    }
    endY = Math.floor(startY + ratioY);
    count = 0;
    for (yy = startY; yy <= endY; yy++) {
        for (xx = startX; xx <= endX; xx++ ) {
            loc = 4 * (xx + yy*w);
            if (loc >= pixelMap.length) {
                continue;
            }
                
            if (pixelMap[loc] == 0 && pixelMap[loc+1] == 0 && pixelMap[loc+2] == 0 ) {
                count++;
            }
        }
    }

    return count;
}

function findBounds (pixelMap, w, h) {
    var x, y, downSample;
    downSample = {
        top:0,
        bottom:h-1,
        left:0,
        right:w-1
        }

    // top line
    for (y=0; y < h; y++) {
        if (!hLineClear(pixelMap, w, y)) {
            downSample.top = y;
            break;
        }

    }
    // bottom line
    for (y = h-1; y >= 0; y--) {
        if (!hLineClear(pixelMap, w, y)) {
            downSample.bottom = y;
            break;
        }
    }
    // left line
    for (x = 0; x < w; x++) {
        if (!vLineClear(pixelMap, w, h, x)) {
            downSample.left = x;
            break;
        }
    }

    // right line
    for (x = w-1; x >= 0; x--) {
        if (!vLineClear(pixelMap, w, h, x)) {
            downSample.right = x;
            break;
        }
    }
        
    return downSample;
}

// returns true if row y has no pixels in it, otherwise returns false;  
function hLineClear (pixelMap, w, y) {
    var i, j, r, g, b;

    for (i=0; i < w; i++) {
        j = 4 * (y*w + i);
        if (pixelMap[j] != 255 || pixelMap[j+1] != 255 || pixelMap[j+2] != 255 ) {	// its a black pixel, hence row is not clear
            return false;
        }
    }

    return true;
}

// returns true if col x has not pixels in it, otherwise returns false
function vLineClear (pixelMap, w, h, x)
{
    var i, j;

    for (i=0; i < h; i++) {
        j = 4 * (i*w + x);
        if (pixelMap[j] != 255 || pixelMap[j+1] != 255 || pixelMap[j+2] != 255 ) {	// its a black pixel, hence row is not clear
            return false;
        }
    }
    return true;
}

function checkOCR (ocrData) {
    // TODO: Do not call server, do OCR in Javascript
    // TODO: Allow user to indicate whether matched letter is correct and modify training set accordingly.
	if (!ocrData) {
        alert('Down sample not done');
    }		
	var training, normfac=[], synth=[], map, input, best;    
	training = loadDataFromQuery(neuralNet);
	network = trainNeuralNet(training);
	map = mapNeurons(network, training);
	input = getInput(ocrData);
	best = network.winner(input, normfac, synth);		
	return map[best];
}

function getInput(data) {	
	var input = [],
		idx = 0;
	for (var y=0; y<data.length; y++) {
		for (var x=0; x<data[0].length; x++) {
			input[idx++] = (data[y][x] > OCR_THRESHHOLD) ? .5 : -.5;
		}
	}
	return input;
}

function loadDataFromQuery(data) {
	var training, sample, idx;
	training = [];
	for (var letter in data) {		
		sample = new SampleData(letter, SAMPLE_WIDTH, SAMPLE_HEIGHT);
		idx = 0;
		for (var y=0; y<SAMPLE_HEIGHT; y++) {
			for (var x=0; x<SAMPLE_WIDTH; x++) {
				sample.setData(x, y, data[letter][idx++] == 1);
			}
		}
		training.push(sample);
	}
	return training;
}

function trainNeuralNet(training) {
	var inputNeuron, outputNeuron, set, net, idx, ds, best, normfac=[], synth=[];
	try {
		inputNeuron = SAMPLE_WIDTH * SAMPLE_HEIGHT;
		outputNeuron = training.length;
		set = new TrainingSet(inputNeuron, outputNeuron);
		set.setTrainingSetCount(training.length);
		for (var t=0; t<training.length; t++) {
			idx = 0;
			ds = training[t];
			for (var y=0; y<ds.getHeight(); y++) {
				for (var x=0; x<ds.getWidth(); x++) {
					set.setInput(t, idx++, ds.getData(x,y) ? .5 : -.5);
				}
			}
		}		
		net = new KohonenNetwork(inputNeuron, outputNeuron);
		net.setTrainingSet(set);
		net.learn();		
		return net;
	} catch(e) {
		throw new Error('Training error: ' + e);		
	}
}

function mapNeurons(net, training) {
	var map, normfac, synth, input, idx, ds, best;
	map = new Array(training.length); 
	normfac = new Array(1);
	synth = new Array(1);
	input = new Array(SAMPLE_WIDTH * SAMPLE_HEIGHT);
	for (var i=0; i<map.length; i++) {
		map[i] = '?';
	}
	for (var i=0; i<training.length; i++) {		
		idx = 0;
		ds = training[i];
		for (var y=0; y<ds.getHeight(); y++) {
			for (var x=0; x<ds.getWidth(); x++) {
				input[idx++] = ds.getData(x,y) ? .5 : -.5;
			}
		}		
		best = net.winner(input, normfac, synth);
		map[best] = ds.getLetter();		
	}
	return map;
}