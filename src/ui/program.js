/* 
 * program.js
 * 
 * Author: Dr.Ralph Bunker
 * Modified by Anh Tran
 */

var useMouse = true;  // set to false when run on Nexus
var letterCanvas;
var letterContext;
var patternCanvas;
var patternContext;
var divDataDump;
var letterPointerIsDown = false;

/* Same data as used in OCR demo program */
var neuralNet = {
	A:'00110001100111001010111111100110001',
	B:'11111100011000111111100111000110111',
	C:'11111100001000010000100001100001111',
	D:'11111100011000110000100011000111111',
	E:'11111100001000011111100001000011111',
	F:'11111100001000011110100001000010000',
	G:'01110110001000010111100011000111111',
	H:'10001100001000111001111111000110001',
	I:'11111001000010000100001000010000111',
	J:'11111001000010000100101001010011100',
	K:'10001100111111011010100101001110011',
	L:'10000100001000010000100001000011111',
	M:'11111101111011110100101001010110101',
	N:'11111110111000110001100001000110001',
	O:'11111100011000110000100011000111111',
	P:'11111100011001111110100001000010000',
	Q:'01111110011000110001100111101101111',
	R:'11111100011000111011111101001110001',
	S:'01111110001100001111000010000111111',
	T:'11111001000010000100001000010000100',
	U:'10001100001000110001100011001111110',
	V:'10001100011101101011011100111000110',
	W:'10101101011010110101101011011111111',
	X:'10011110100111001100111001011010010',
	Y:'10001110110111001100010000100001000',
	Z:'11111000110011001100110001000011111'
};


window.onload = function(){
	// TODO: Modify the neural net based on input from user.
	neuralNet = initFromLocalStorage('neuralNet', JSON.stringify(neuralNet));
	neuralNet = JSON.parse(neuralNet);
	
	letterCanvas = document.getElementById('cnvLetter');    // Where letter is drawn
	letterContext = letterCanvas.getContext('2d');
	patternCanvas = document.getElementById('cnvPattern'); 
	patternContext = patternCanvas.getContext('2d');
	clearLetter();
	divDataDump = document.getElementById('dataDump');      // Where normalization matrix is shown
	setupEventHandlers();
	drawPattern();
	drawTrainingResult();
}

function setupEventHandlers () {
	var letter = document.getElementById('cnvLetter');	
	if (useMouse) {
		letter.addEventListener('mousedown', handlerLetterDown, false);
		letter.addEventListener('mousemove', handlerLetterMove, false);
		letter.addEventListener('mouseup', handlerLetterUp, false);
	} else {
		letter.addEventListener('touchstart', handlerLetterDown, false);
		letter.addEventListener('touchmove', handlerLetterMove, false);
		letter.addEventListener('touchend', handlerLetterUp, false);
	}
}

function initFromLocalStorage (name, dflt) {
	var value = localStorage.getItem(name);
	if (value != null) {
		if (value.match(/^\d+$/)) {		// if value is all digits, parse it as an integer
			return parseInt(value);
		} else if (value == 'true') {
			return true;
		} else if (value == 'false') {
			return false;
		} else {
			return value;
		}
	} else {
		localStorage.setItem(name, dflt);
		return dflt;
	}
}

// Clear the letter drawing area
function clearLetter () {
	letterContext.fillStyle = 'white';
	letterContext.fillRect(0, 0, letterCanvas.width, letterCanvas.height);
	drawPattern();
}

// Called when user clicks the Do OCR button
function doOCR () {
	var ocrData, letter;

	// Normalize the drawn letter into a SAMPLE_WIDTH x SAMPLE_HEIGHT array (see ocr.js)
	ocrData = downSample(letterCanvas);

	// Send neural net and ocrData to the server using Ajax.
	letter = checkOCR(ocrData);
	drawTrainingResult();
	alert(letter);
	clearLetter();
}

// Pointer event handlers
function getClientCoordinates (evt) {
	if (useMouse) {
		return {x:evt.clientX, y:evt.clientY};
	} else {
		return {x:evt.touches[0].pageX, y:evt.touches[0].pageY};
	}
}

// Called on mouseDown or touchStart event
function handlerLetterDown (evt) {
	var x, y, coords;
	coords = getClientCoordinates(evt);
	coords.x -= evt.target.offsetLeft;
	coords.y -= evt.target.offsetTop;
	letterPointerIsDown = true;
	letterContext.beginPath();
	letterContext.moveTo(coords.x, coords.y);
	evt.preventDefault();
	evt.stopPropagation();
}

// Called on moveMove or touchMove event
function handlerLetterMove (evt) {
	if (letterPointerIsDown) {
		coords = getClientCoordinates(evt);
		coords.x -= evt.target.offsetLeft;
		coords.y -= evt.target.offsetTop;
		letterContext.lineTo(coords.x, coords.y);
		letterContext.stroke();
	}
}

// Called on mouseUp or touchend event
function handlerLetterUp (evt) {
	letterPointerIsDown = false;
}

// For debugging (displays actions save by the saveAction function)
function wtf () {
	var el, len, i, j, msg, action, row, col, answer;
	show('debug');
	el = document.getElementById('wtf');
	msg = '';
	for (i=firstAction, j=0, len = actions.length; j<len; j++) {
		action = actions[i];
		if (action.type == 'drawend') {
			msg += 'type=touchend: row=' +
				action.row +
				' col=' +
				action.col +
				' numMoves=' +
				action.numMoves +
				' elapsed=' +
				action.elapsed/1000 +
				' result=' +
				action.result +
				'<br/>';
		}
		i++;
		if (i == len) {
			i = 0;
		}
	}
	el.innerHTML = msg;
}

// Save action in a circular list
function saveAction (action) {
	var len, timeSinceLastAction;
	len = actions.length;
	if (action.elapsed) {		// elapsed is time since puzzle loaded
		timeSinceLastAction = action.elapsed - lastActionElapsed;
		lastActionElapsed = action.elapsed;
		action.elapsed = timeSinceLastAction;	// elapsed is now time since last action
	}
	if (len < maxActions) {
		actions.push(action);
	} else {
		actions[firstAction] = action;
		firstAction++;
		if (firstAction == len) {
			firstAction = 0;
		}
	}
}

function loadSample() {
	var options=[], lstLetters;
	lstLetters = document.getElementById('lettersKnown');
	for (var letter in neuralNet) {		
		options.push("<option onclick='drawSamplePattern(this)' value=" 
			+ letter + ">" + letter + "</option>");
	}
	lstLetters.innerHTML = options.join('\n');
}

function saveSample() {
	alert('This function is not implemented.');
}

function drawDownSample() {
	downSample(letterCanvas);
}

function drawSamplePattern(option) {	
	var grid=[], idx=0, y, x, letter;
	letter = option.value;	
	for (y=0; y<SAMPLE_HEIGHT; y++) {
		grid[y] = [];
		for (x=0; x<SAMPLE_WIDTH; x++) {
			grid[y][x] = (neuralNet[letter][idx++]==1) ? 
				OCR_THRESHHOLD+1 : 0;
		}
	}
	drawPattern(grid);
}

function drawPattern(data) {
	// Variables
	var width, height, cellWidth, cellHeight, row, col, x, y;
		
	// Prepare drawing		
	patternContext.strokeStyle = 'black';
	patternContext.lineWidth = 1;
	width = patternCanvas.width;
	height = patternCanvas.height;
	cellWidth = width / SAMPLE_WIDTH;	
    cellHeight = height / SAMPLE_HEIGHT;
	patternContext.clearRect(0,0,width,height);
	
	// Draw grid
	for (col = 0; col < SAMPLE_WIDTH; col++) {
		patternContext.beginPath();
		patternContext.moveTo(col * cellWidth, 0);
		patternContext.lineTo(col * cellWidth, height);
		patternContext.stroke();
	}
	for (row = 0; row < SAMPLE_HEIGHT; row++) {
		patternContext.beginPath();
		patternContext.moveTo(0, row * cellHeight);
		patternContext.lineTo(width, row * cellHeight);
		patternContext.stroke();
	}
	
	// Draw pattern
	if (data != undefined) {
		patternContext.fillStype = 'black';
		for (row = 0; row<SAMPLE_HEIGHT; row++) {
			for (col = 0; col < SAMPLE_WIDTH; col++) {
				if (data[row][col] > OCR_THRESHHOLD) {
					x = col * cellWidth;
					y = row * cellHeight;
					patternContext.fillRect(
						x, 
						y, 
						cellWidth, 
						cellHeight
					);					
				}
			}
		}
	}	
}

function drawTrainingResult() {
	var htmls = [], divResult;
	htmls.push('<b>Training Result</b><br>');
	htmls.push('<table>');
	if (network) {
		htmls.push('<tr><td>Tries: </td><td>'+ network.retryNum +'</td></tr>');
		htmls.push('<tr><td>Last Error: </td><td>'+ network.lastError +'</td></tr>');
		htmls.push('<tr><td>Best Error:	</td><td>'+ network.bestError +'</td></tr>');
	} else {
		htmls.push('<tr><td>Tries: </td><td></td></tr>');
		htmls.push('<tr><td>Last Error: </td><td></td></tr>');
		htmls.push('<tr><td>Best Error:	</td><td></td></tr>');
	}	
	htmls.push('</table');
	divResult = document.getElementById('divResult');
	divResult.innerHTML = htmls.join('\n');	
}