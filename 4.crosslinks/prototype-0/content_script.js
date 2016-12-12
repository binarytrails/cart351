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

var portalImage,
    treesImage;

// p5 setup function!

function setup() {
  // At setup we should see whether or not this script has permission to run
  // in terms of the extension, so we send the message...
  chrome.runtime.sendMessage({name: "isPaused?"}, function (response) {
    // ... and then check the answer...
    if (response.value != 'true') {
      running = true;
      // And then create our canvas to cover the screen
      p5Canvas = createCanvas(windowWidth,windowHeight);
      // And set its CSS properties to be fixed (e.g. it scrolls), positioned
      // at the top left, with a high z-index to float over everything else, and
      // not to receive pointer events so we can still interact with the page below
      p5Canvas.elt.style.position = 'fixed';
      p5Canvas.elt.style.top = 0;
      p5Canvas.elt.style.left = 0;
      p5Canvas.elt.style["z-index"] = 1000;
      p5Canvas.elt.style["pointer-events"] = 'none';
      // Note that, for reasons I do not understand, all mouse events still work fine
      // in the p5 canvas...???

      // HERE IS THE KEY MOMENT
      // Notice that we can load an image (just like in p5 usually) but we have to use
      // chrome.extension.getURL(filename) in order to get a reference to the file.
      // That's the only difference.

      portalImage = loadImage(chrome.extension.getURL("portal.png"));
      treesImage = loadImage(chrome.extension.getURL("trees160.png"));

      // END OF KEY MOMENT!!!

      // Get rid of the cursor
      $('*').css({'cursor': 'none'});
    }
    else {
      // If we are paused, don't bother with draw
      noLoop();
    }
  });
}

// p5 draw() function

function draw() {
    // First of all, if the extension is paused, don't do anything
    if (!running) return;

    background('#551a8b');

    buildMap();
    buildMouse();
    //clear();
}

function mouseClicked() {
  console.log("They clicked!");
}

function buildMouse()
{
    noStroke();
    fill(255,0,0);
    image(portalImage, mouseX, mouseY);
}

function buildMap()
{
    for (var i = 0; i < screen.width; i += 100)
    {
        for (var j  = 0; j < screen.height; j += 100)
        {
            image(treesImage, i - 20, j - 20);
        }
    }
}
