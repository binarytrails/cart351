
function makeArray(width, height) {
 var cells = new Array(height);

 for (var i = 0; i < height; i++) {
    cells[i] = new Array(width);

    for (var j = 0; j < width; j++) {
       cells[i][j] = 0;
    }
 }

 return cells;
}

function togglePixel(imageData, x, y, isOn) {
  index = (x + y * imageData.width) * 4;
  imageData.data[index+0] = isOn ? 0 : 255;
  imageData.data[index+1] = isOn ? 0 : 200;
  imageData.data[index+2] = isOn ? 100 : 255;
  imageData.data[index+3] = 255;
}

function clearCanvas() {
 var canvas = document.getElementById("canvas");
 var context = canvas.getContext("2d");
 
 context.clearRect(0, 0, canvas.width, canvas.height);
}

function initializeCells(cells, width, height, cellSize) {
 for (var cellI = 0; cellI < height; cellI += cellSize) {
    for (var cellJ = 0; cellJ < width; cellJ += cellSize) {
       var on = Math.random() < 0.50;
       if (cellI == 0 || cellI >= height-cellSize || cellJ == 0 || cellJ >= width-cellSize) {
          on = true;
       }
       
       for (var i = 0; i < cellSize; i++) {
          for (var j = 0; j < cellSize; j++) {
             cells[cellI + i][cellJ + j] = on ? 1 : 0;
          }
       }
    }
 }
}

function drawCells(cells) {
 clearCanvas();

 var canvas = document.getElementById("canvas");
 var context = canvas.getContext("2d");
 var pixelData = context.createImageData(canvas.width, canvas.height);
 
 for (var i = 0; i < canvas.height; i++) {
    for (var j = 0; j < canvas.width; j++) {
        togglePixel(pixelData, i, j, cells[i][j]);
    }
 }

 context.putImageData(pixelData, 0, 0);
}

function applyAutomaton(cells, width, height, bornList, surviveList, numIterations) {
 var newCells = makeArray(width, height); 
 var cellSize = window.cellSize;

 while (numIterations-- > 0) {
    for (var cellRow = 0; cellRow < height; cellRow += cellSize) {
       for (var cellCol = 0; cellCol < width; cellCol += cellSize) {
          var liveCondition;

          if (cellRow == 0 || cellRow >= height-cellSize || cellCol == 0 || cellCol >= width-cellSize) {
             liveCondition = true;
          } else {
             var nbhd = 0;

             nbhd += cells[cellRow-cellSize][cellCol-cellSize];
             nbhd += cells[cellRow-cellSize][cellCol];
             nbhd += cells[cellRow-cellSize][cellCol+cellSize];
             nbhd += cells[cellRow][cellCol-cellSize];
             nbhd += cells[cellRow][cellCol+cellSize];
             nbhd += cells[cellRow+cellSize][cellCol-cellSize];
             nbhd += cells[cellRow+cellSize][cellCol];
             nbhd += cells[cellRow+cellSize][cellCol+cellSize];

             // apply B678/S345678
             var currentState = cells[cellRow][cellCol];
             var liveCondition = 
                (currentState == 0 && bornList.indexOf(nbhd) > -1)|| 
                (currentState == 1 && surviveList.indexOf(nbhd) > -1); 
          }

          for (var i = 0; i < cellSize; i++) {
             for (var j = 0; j < cellSize; j++) {
                newCells[cellRow + i][cellCol + j] = liveCondition ? 1 : 0;
             }
          }
       }
    }
 }
 
 for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
       cells[i][j] = newCells[i][j];
    }
 }
}

function animate(cells, width, height, bornList, surviveList, numLeft) {
 if (numLeft == 0) {
    window.animating = false;
    return;
 }

 window.animating = true;
 applyAutomaton(cells, width, height, bornList, surviveList, 1); 
 drawCells(cells);
 setTimeout(function() {animate(cells, width, height, bornList, surviveList, numLeft-1);}, 25);
}

function animateAutomaton(bornList, surviveList, numIters) {
 if (window.animating) {
    return;
 }

 var canvas = document.getElementById("canvas");
 var width = canvas.width, height = canvas.height;
 
 animate(window.cells, width, height, bornList, surviveList, numIters);
}

function initAutomata() {
 var canvas = document.getElementById("canvas");
 var width = canvas.width, height = canvas.height;
 var cells = makeArray(width, height);
 window.cellSize = width / 64;

 clearCanvas(cells);
 initializeCells(cells, width, height, window.cellSize);
 drawCells(cells);
 window.cells = cells;

 animateAutomaton([5,6,7,8], [5,6,7,8], 3);
}

function reset() {
 var canvas = document.getElementById("canvas");
 var width = canvas.width, height = canvas.height;
 
 initializeCells(window.cells, width, height, window.cellSize);
 drawCells(window.cells);
}

function increaseResolution() {
 window.cellSize = Math.floor(window.cellSize / 2);

 if (window.cellSize == 0) {
    window.cellSize = 1;
 }
}
