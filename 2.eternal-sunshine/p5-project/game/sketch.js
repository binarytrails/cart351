var joel,
    clementine,
    frame,
    surface_bg,
    surface_w = 2000,
    surface_h = 800;

function preload()
{
    //create an animation from a sequence of numbered images
    //pass the first and the last file name and it will try to find the ones in between
    ghost = loadAnimation("assets/ghost_standing0001.png", "assets/ghost_standing0007.png");
      
    //create an animation listing all the images files
    asterisk = loadAnimation("assets/asterisk.png", "assets/triangle.png", "assets/square.png", "assets/cloud.png", "assets/star.png", "assets/mess.png", "assets/monster.png");
}

function setup()
{
    createCanvas(windowWidth, windowHeight);
    
    surface_bg = new Group();
    var bg_sand = createSprite(windowWidth, windowHeight);
    bg_sand.addAnimation("normal", "assets/images/background/white-sand.jpg");
    surface_bg.add(bg_sand);
    
    // surface_bg = new Group();
  
    // // Background
    // for(var i=0; i<80; i++)
    // {
    //     //create a sprite and add the 3 animations
    //     var rock = createSprite(random(-width, surface_w+width), random(-height, surface_h+height));
    //     //cycles through rocks 0 1 2
    //     rock.addAnimation("normal", "assets/rocks"+i%3+".png");
    //     surface_bg.add(rock);
    // }
    //frame = loadImage("assets/frame.png");
    
    // x, y, w, h
    joel = createSprite(200, 200, 50, 100);
    
    var joelAnimation = joel.addAnimation(
        "floating",
        "assets/ghost_standing0001.png",
        "assets/ghost_standing0007.png"
    );
    joelAnimation.offY = 18;
    
    joel.addAnimation(
        "moving",
        "assets/ghost_walk0001.png",
        "assets/ghost_walk0004.png"
    );
}

function draw() {
    background(255, 255,255);
    
    //animation(ghost, 300, 150);
    //animation(asterisk, 500, 150);
    
    limit_sprite_position(joel);
    
    // speed = 1/distance_mouse
    joel.velocity.x = (camera.mouseX-joel.position.x)/20;
    joel.velocity.y = (camera.mouseY-joel.position.y)/20;
    
    camera.zoom = .5;
    camera.position.x = joel.position.x;
    camera.position.y = joel.position.y;
    
    drawSprites(surface_bg);
    drawSprite(joel);
    
    camera.off();
    //image(frame, 0, 0);
}

function limit_sprite_position(sprite)
{
    if(sprite.position.x < 0)
    {
        sprite.position.x = 0;
    }
    if(sprite.position.x > surface_w)
    {
        sprite.position.x = surface_w;
    }
    
    if(sprite.position.y < 0)
    {
        sprite.position.y = 0;
    }
    if(sprite.position.y > surface_h)
    {
        sprite.position.y = surface_h;
    }
}