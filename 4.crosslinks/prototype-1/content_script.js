var running = false;

var world;

var portalImage,
    treesImage;

var textArray;

// sarah

var body = document.getElementsByTagName('body')[0];

// Variable that counts the number of characters
var count=0;

var characters;

var imgArray = [4];

var charX =0;
var charY =0;


function buildWorld()
{
	var world = new CAWorld({
		width: 60,
		height: 60,
		cellSize: 30
	});

	world.palette = [
		'255, 255, 255, 1',
		'68, 36, 52, 1'
	];

	world.registerCellType('wall', {
		getColor: function () {
			return this.open ? 0 : 1;
		},
		process: function (neighbors) {
			var surrounding = this.countSurroundingCellsWithValue(neighbors, 'wasOpen');
            this.open = (this.wasOpen && surrounding >= 10) || surrounding >= 6;
		},
		reset: function () {
			this.wasOpen = this.open;
		}
	}, function () {
		//init
		this.open = Math.random() > 0.20;
	});

	world.initialize([
		{ name: 'wall', distribution: 100 }
	]);

    //console.log(world.grid[0][0]);
    //console.log(world.grid[0][0].open);
    return world;
}

function buildWorldWithWater()
{
	// FIRST CREATE CAVES
	var world = new CAWorld({
		width: 60,
		height: 60,
		cellSize: 30
	});

	world.registerCellType('wall', {
		process: function (neighbors) {
			var surrounding = this.countSurroundingCellsWithValue(neighbors, 'wasOpen');
			this.open = (this.wasOpen && surrounding >= 4) || surrounding >= 6;
		},
		reset: function () {
			this.wasOpen = this.open;
		}
	}, function () {
		//init
		this.open = Math.random() > 0.40;
	});

	world.initialize([
		{ name: 'wall', distribution: 100 }
	]);

	// generate our cave, 10 steps aught to do it
	for (var i=0; i<10; i++) {
		world.step();
	}

	var grid = world.createGridFromValues([
		{ cellType: 'wall', hasProperty: 'open', value: 0 }
	], 1);

	// NOW USE OUR CAVES TO CREATE A NEW WORLD CONTAINING WATER
	world = new CAWorld({
		width: 60,
		height: 60,
		cellSize: 30,
		clearRect: true
	});

	world.palette = [
		'89, 125, 206, 0',
		'89, 125, 206, ' + 1/9,
		'89, 125, 206, ' + 2/9,
		'89, 125, 206, ' + 3/9,
		'89, 125, 206, ' + 4/9,
		'89, 125, 206, ' + 5/9,
		'89, 125, 206, ' + 6/9,
		'89, 125, 206, ' + 7/9,
		'89, 125, 206, ' + 8/9,
		'89, 125, 206, 1',
		'109, 170, 44, 1',
		'68, 36, 52, 1'
	];

	world.registerCellType('water', {
		getColor: function() {
			//return 0x597DCE44;
			return this.water;
		},
		process: function(neighbors) {
			if (this.water === 0) {
				// already empty
				return;
			}
			// push my water out to my available neighbors

			// cell below me will take all it can
			if (neighbors[world.BOTTOM.index] !== null && this.water && neighbors[world.BOTTOM.index].water < 9) {
				var amt = Math.min(this.water, 9 - neighbors[world.BOTTOM.index].water);
				this.water-= amt;
				neighbors[world.BOTTOM.index].water += amt;
				return;
			}

			// bottom two corners take half of what I have
			for (var i=5; i<=7; i++) {
				if (i!=world.BOTTOM.index && neighbors[i] !== null && this.water && neighbors[i].water < 9) {
					var amt = Math.min(this.water, Math.ceil((9 - neighbors[i].water)/2));
					this.water-= amt;
					neighbors[i].water += amt;
					return;
				}
			}
			// sides take a third of what I have
			for (i=3; i<=4; i++) {
				if (neighbors[i] !== null && neighbors[i].water < this.water) {
					var amt = Math.min(this.water, Math.ceil((9 - neighbors[i].water)/3));
					this.water-= amt;
					neighbors[i].water += amt;
					return;
				}
			}
		}
	}, function() {
		//init
		this.water = Math.floor(Math.random() * 9);
	});

	world.registerCellType('rock', {
		isSolid: true,
		getColor: function() {
			return this.lighted ? 10 : 11;
		},
		process: function(neighbors) {
			this.lighted = neighbors[world.TOP.index] && !(neighbors[world.TOP.index].water === 9) && !neighbors[world.TOP.index].isSolid
				&& neighbors[world.BOTTOM.index] && neighbors[world.BOTTOM.index].isSolid;
		}
	});

	// pass in our generated cave data
	world.initializeFromGrid([
		{ name: 'rock', gridValue: 1 },
		{ name: 'water', gridValue: 0 }
	], grid);

	return world;
}

function setup()
{
    chrome.runtime.sendMessage({name: "isPaused?"}, function (response) {

    if (response.value != 'true')
    {
      running = true;

      // force it since height is not always 100% of the document
      p5Canvas = createCanvas($(document).width(), $(document).height());

      p5Canvas.elt.style.position = 'absolute';
      p5Canvas.elt.style.top = 0;
      p5Canvas.elt.style.left = 0;
      p5Canvas.elt.style["z-index"] = 1000;
      p5Canvas.elt.style["pointer-events"] = 'none';

      // Load human workers images in order to get a reference to the file.
      //image.push(loadImage(chrome.extension.getURL("assets/images/girlGif.png")));
      imgArray[0] = loadImage(chrome.extension.getURL("images/girlGif.png"));
      imgArray[1] = loadImage(chrome.extension.getURL("images/heartGif.png"));
      imgArray[2] = loadImage(chrome.extension.getURL("images/walkGif.gif"));
      imgArray[3] = loadImage(chrome.extension.getURL("images/runGif.png"));

      portalImage = loadImage(chrome.extension.getURL("portal.png"));
      treesImage = loadImage(chrome.extension.getURL("trees100.png"));

      $('*').css({'cursor': 'none'});

      textArray = extractPageText();
      world = buildWorld();

    }
    else {
      noLoop();
    }
  });
}

var worldLinks = new Array(new Array()),
    foundLinks = false;

function draw()
{
    if (!running) return;
    
    if (!foundLinks)
    {
        foundLinks = loadLinks();
    }

    background('#ffffff');
    //console.log('building map');
    buildMap();

    //spriteEvolve();

    drawMouse();
    keyPressed();
}

function loadLinks()
{
    var links = [],
        found = false;

    $('a').each(function ()
    {
        var href = $(this).attr('href');

        if (href != undefined &&
            $(this).is(':visible') &&
            href.indexOf("http") != -1)
        {
            links.push(href);
            found = true;
        }
    });

    //console.log(links);
    
    // find their places in the world
    for (var i = 0; i < world.width; i++)
    {
        for (var j = 0; j < world.height; j++)
        {
            try
            {
                var open = world.grid[i][j].open,
                    h = w = world.cellSize,
                    x = i * h,
                    y = j * w;

                var randInt = getRandomInt(1, 100);

                if ((open) &&
                    (links.length > 0) &&
                    (randInt % 10 == 0)) // 10 % probability
                {
                    worldLinks[x][y] = links.pop(links.length - 1);
                    //console.log(randInt);
                }
                else
                {
                    worldLinks[x][y] = '';
                }
            }
            catch (e)
            {
                continue;
            }
        }
    }

    return found;
}

// sarah
/*document.onkeypress = function(evt) {
   // prevent the default action (scroll / move caret)
   evt.preventDefault();
    evt = evt || window.event;
    var charCode = evt.keyCode || evt.which;
    var charStr = String.fromCharCode(charCode);
    alert(evt.which);

    if(charStr ==='r')
    {
      charX ++;
      10;
    }

    if(charStr ==='l')
    {
      charX --;
    }
    if(charStr ==='u')
    {
      charY --;
    }
    if(charStr ==='d')
    {
      charY ++;
    }

};*/

// sarah
var evolveCounter = 0;

function spriteEvolve()
{
  if (evolveCounter == 0)
  {
    image(imgArray[0], charX, charY);
  }
  else if (evolveCounter == 1)
  {
    image(imgArray[1], charX, charY);
  }
  if (evolveCounter == 2)
  {
    image(imgArray[2], charX, charY);
  }
  if (evolveCounter == 3)
  {
    image(imgArray[3], charX, charY);
  }
}

function extractPageText()
{
    var array = [],
        raw = $('body').text();

    for (var i = 0; i < raw.length; i++)
    {
        var letter = raw[i];

        if (letter != '')
        {
            array.push(letter);
        }
    }

    return array;
}

function drawText(l, f, x, y, h, w, bgRgb)
{
    // background
    fill(bgRgb[0], bgRgb[1], bgRgb[2]);
    rect(x, y, h, w);

    // text
    fill(255, 255, 255);
    textSize(h);
    textFont("Helvetica");
    // x + h/5 serves as an textAlign(CENTER)
    text(l, x + h/5, y, h, w);
}

function drawMouse()
{
    noStroke();
    fill(255,0,0);
    
    image(imgArray[2], mouseX - 50, mouseY);
}

function buildMap()
{
    for (var i = 0; i < world.width; i++)
    {
        for (var j = 0; j < world.height; j++)
        {
            try
            {
                var open = world.grid[i][j].open,
                    h = w = world.cellSize,
                    x = i * h,
                    y = j * w;

                if (open && (worldLinks[x][y] != ''))
                {
                    drawText('?', 20, x, y, h, w, [0, 180, 0]);
                    
                    var a = createA(worldLinks[x][y], '  ');
                    a.style('z-index:2000; font-size:20pt; color: white');
                    a.position(x, y);
                    a.size(h, w);
                }
                else // (!open)
                {
                    var letter = '';

                    // bigger world than text chars
                    if ((i + j) > (textArray.length - 1))
                    {
                        letter = '#';
                    }
                    else
                    {
                        letter = textArray[i + j];
                    }
                    letter = letter.toUpperCase();

                    drawText(letter, 20, x, y, h, w, [0, 0, 0]);
                }
            }
            catch (e)
            {
                continue;
            }
        }
    }
    return true;
}
/*
function buildMap()
{
    for (var i = 0; i < world.width; i++)
    {
        for (var j  = 0; j < world.height; j++)
        {
            var open = world.grid[i][j].open;

            //console.log(open);
            image(treesImage, i, j);
        }
    }
}
*/

// Sarah
function keyPressed()
{

  if (keyIsDown (UP_ARROW))
  {
    charY += 5;
    //console.log(charY);
  }
  // if (keyIsDown (DOWN_ARROW))
  // {
  //   y+=5;
  // }
  // if (keyIsDown (LEFT_ARROW))
  // {
  //   x-=5;
  // }
  // if (keyIsDown (RIGHT_ARROW))
  // {
  //   x+=5;
  // }
}
