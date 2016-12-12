/*

Warcraft 2
CART 351 Chrome Extension
Content script

This is where we actually add our p5 canvas to the browser page when it loads.
An easier way that doesn't use instanced mode, but may therefore lead to weird
conflicts that are hard to diagnose.

Now with images!

*/

// Keep track of whether the sketch should be running or not. At the start, no.
var running = false;

var cellSize,
    cellsH,     // total
    cellsV,     // total
    cells;

var portalImage,
    treesImage;

// p5 setup function!

function setup()
{
    chrome.runtime.sendMessage({name: "isPaused?"}, function (response)
    {
    
        if (response.value != 'true')
        {
            running = true;
          
            p5Canvas = createCanvas(windowWidth, windowHeight);
            
            p5Canvas.id = 'p5Canvas'

            p5Canvas.elt.style.position = 'fixed';
            p5Canvas.elt.style.top = 0;
            p5Canvas.elt.style.left = 0;
            p5Canvas.elt.style["z-index"] = 1000;
            p5Canvas.elt.style["pointer-events"] = 'none';

            portalImage = loadImage(
                chrome.extension.getURL("portal.png"));
            treesImage = loadImage(
                chrome.extension.getURL("trees100.png"));

            $('*').css({'cursor': 'none'});

            initMap(canvas, windowWidth, windowHeight);
        }
        else
        {
            noLoop();
        }
    });
}

// p5 draw() function

function draw() {
    // First of all, if the extension is paused, don't do anything
    if (!running) return;

    background('#551a8b');

    drawMap();
    //buildMouse();
    
    //clear();
}

function mouseClicked() {
  console.log("They clicked!");
}

function drawMap()
{
    for (var i = 0; i < height; i += cellSize)
    {
        for (var j = 0; j < width; j += cellSize)
        {
            if (cells[i][j])
            {
                image(treesImage, i, j);
            }
            else
            {
                image(portalImage, i, j);
            }
        }
    }
}

function drawMouse()
{
    noStroke();
    fill(255,0,0);
    image(treesImage, mouseX, mouseY);
}

function initMap(canvas, width, height)
{
    cellSize = windowWidth / 64;

    cellsH = Math.floor(width / 64);
    cellsV = Math.floor(height / 64);

    cells = buildArray(cellsH, cellsV);

    console.log(cells);

    initCells(cells, cellsH, cellsV, cellSize);
    
    console.log(cells);
}

function buildArray(width, height)
{
    var cells = new Array(height);

    for (var i = 0; i < height; i++)
    {
        cells[i] = new Array(width);

        for (var j = 0; j < width; j++)
        {
            cells[i][j] = 0;
        }
    }
    return cells;
}

function initCells(cells, width, height, cellSize)
{
    for (var i = 0; i < height; i++)
    {
        for (var j = 0; j < width; j++)
        {
            var on = Math.random() < 0.50;
            
            if (i == 0 || i >= height - (i * cellSize) ||
                j == 0 || j >= width - (j * cellSize))
            {
                on = true;
            }

            cells[i][j] = on ? 1 : 0;
        }
    }
}
