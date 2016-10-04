/*
    Todo:
        Evade speed variation
        Glow effect
            filter( BLUR, 2 ); // too much to handle for a browser
        Maps function:
            Snow map
            Sand map
        Particles
        
    Unsure:
        Keep follow
        Turn 180 degrees on walls
        
    Done:
        Reset on tag
        Basic evade
*/

var joel,
    clementine,
    frame,
    surface_bg,
    surface_w = 4000,
    surface_h = 3000;

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
    
    /*
    var bg_sand = createSprite(1000, 700);
    bg_sand.addAnimation("normal", "assets/images/background/white-sand.jpg");
    surface_bg.add(bg_sand);
    */  
  
    // Background
    for(var i = 0; i < 400; i++)
    {
        //create a sprite and add the 3 animations
        var ground_particle = createSprite(
            random(-width, surface_w + width),
            random(-height, surface_h + height)
        );
        
        ground_particle.draw = function()
        {
            // snow
            fill(209, 228, 245);
            ellipse(0, 0, 10, 10);
        }
        
        surface_bg.add(ground_particle);
    }
    //frame = loadImage("assets/frame.png");
    
    // x, y, w, h
    joel = createSprite(200, 200, 50, 100);
    clementine = createSprite(500, 500, 50, 100);
    
    /*
    var joelAnimation = joel.addAnimation(
        "floating",
        "assets/ghost_standing0001.png",
        "assets/ghost_standing0007.png"
    );
    joel.addAnimation(
        "moving",
        "assets/ghost_walk0001.png",
        "assets/ghost_walk0004.png"
    );
    joelAnimation.offY = 18;*/
    
    joel.draw = function()
    {
        fill(82, 165, 159);
        rotate(radians(this.getDirection()));
        ellipse(0, 0, 100 + (this.getSpeed()/2), 100-(this.getSpeed()/2));
    }
    joel.maxSpeed = 10;
    
    clementine.draw = function()
    {
        fill(102, 152, 255);
        rotate(radians(this.getDirection()));
        ellipse(0, 0, 100 + (this.getSpeed()/2), 100-(this.getSpeed()/2));
    }
    clementine.maxSpeed = 15;
    
}

function reset_game()
{
    joel.position.x = 200;
    joel.position.y = 200;
    
    clementine.position.y = random(500, surface_w - 100);
    clementine.position.y = random(500, surface_h - 100);
}

function draw()
{
    // sand background
    background(255, 248, 198);
    
    //animation(ghost, 300, 150);
    //animation(asterisk, 500, 150);
        
    limit_sprite_position([joel, clementine]);
    
    handle_sprites_interactions(joel, clementine);
    
    // speed = 1/distance_mouse
    joel.velocity.x = (camera.mouseX-joel.position.x)/20;
    joel.velocity.y = (camera.mouseY-joel.position.y)/20;
    
    camera.zoom = 0.5;
    camera.position.x = joel.position.x;
    camera.position.y = joel.position.y;
    
    drawSprites(surface_bg);
    drawSprite(joel);
    drawSprite(clementine);
    
    camera.off();
    //image(frame, 0, 0);
}

function handle_sprites_interactions(catching, evading)
{
    // speed = 1/distance_mouse
    //evading.position.x = (catching.position.x + 100);
    //evading.position.y = (catching.position.y + 100);
    
    var distance_x = Math.abs(catching.position.x - evading.position.x);
    var distance_y = Math.abs(catching.position.y - evading.position.y);
   
    // Joel catched up Clementine
    if (distance_x < 5 && distance_y < 5)
    {
        reset_game();
        return;
    }
    
    // Clementine sees Joel
    if (distance_x < 200 && distance_y < 200)
    {
        evading.velocity.x = catching.velocity.x;
        evading.velocity.y = catching.velocity.y;   
        
        // // walls trap
        // if (evading.position.x < 0 || evading.postion.x > surface_w)
        // {
        //     console.log('X Wall');
        //     evading.velocity.x = evading.velocity.x * -1;
        // }
    }
        // else
        // if(distance_x < 500 && distance_y < 500)
        // {
        //     evading.velocity.x = catching.velocity.x * random(0.8, 1.2);
        //     evading.velocity.y = catching.velocity.y * random(0.8, 1.2);
        // }
    else // Clementine can't see Joel
    {
        evading.velocity.x = 0;
        evading.velocity.y = 0;
    }
}

function limit_sprite_position(sprites)
{
    for (var i = 0; i < sprites.length; i++)
    {
        var sprite = sprites[i];
        
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
}