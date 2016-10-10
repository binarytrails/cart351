/*
    Todo:
        Genetic evolution
        Evade speed variation
        Glow effect
            filter( BLUR, 2 ); // too much to handle for a browser
                https://github.com/processing/p5.js/issues/1388
        Falling Particles
        Collision colors - Journey Game
        
    Unsure:
        Keep follow
        Turn 180 degrees on walls
        
    Done:
        Reset on tag
        Basic evade
        Maps function:
            Snow map
            Sand map
*/

var joel,
    clementine,
    frame,
    surface_bg,
    surface_fg_div,
    surface_w = 4000,
    surface_h = 3000;

var maps,
    current_map;
    
var xoff = 1.0;

var falling_snow;

function preload(){}

function setup()
{
    createCanvas(windowWidth, windowHeight);
    
    init_surface();
    init_characters();
    
    surface_fg_div = createDiv('some text');
    surface_fg_div.id('surface-overlay');

    // init_interactions()
    //randomSeed(99);
}

function init_surface()
{
    surface_bg = new Group();

    maps = {
        beach_snow : {
            colors: {
                background: '#FFF8C6',
                particles: '#92E1FF'    // 7ECDFF
            }
        },
        frozen_lake : {
            colors: {
                background: '#F0FFFF',  // azure
                particles: '#56A5EC'    // iceberg
            }
        }
    }
    current_map = Object.keys(maps)[1];
    
    // Groud particles
    for(var i = 0; i < 400; i++)
    {
        var ground_particle = createSprite(
            random(-width, surface_w + width),
            random(-height, surface_h + height)
        );
   
        ground_particle.draw = function()
        {
            fill(maps[current_map].colors.particles);
            ellipse(0, 0, 10, 10);
        }

        surface_bg.add(ground_particle);
    }

    var snow_particles_template = {
        name: "snow_particles",
        colors: [maps[current_map].colors.particles],
        // fraction of screen width/height, centered at xy
        // [-a:a,-b:b] defines generation box, default [0,0]
        // note: not sure what it does but it randomize well the snow source
        dxy: [2, 0],
        lifetime: Math.pow(10, 10),
        angle: [0, 180],
        size: [10, 20],
        speed: 5,
        speedx: 0.1,
        rate: [500, 1],
        x: 0.5,
        y: 0
    };
    falling_snow = new Fountain(null, snow_particles_template);
    
    // allow them to go anywhere
    height = surface_h + height;
    width = surface_w + width;

}

function init_characters()
{
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
        fill(82, 165, 159, 240);
        //rotate(radians(this.getDirection()));
        //ellipse(0, 0, 100 + (this.getSpeed()/2), 100-(this.getSpeed()/2));
        ellipse(0, 0, 100, 100);
    }
    joel.maxSpeed = 10;
    
    clementine.draw = function()
    {
        fill(102, 152, 255, 240);
        //filter(BLUR, 4);
        //rotate(radians(this.getDirection()));
        //ellipse(0, 0, 100 + (this.getSpeed()/2), 100-(this.getSpeed()/2));
        ellipse(0, 0, 100, 100)
    }
    //clementine.maxSpeed = 50; // 15
}

function reset_game()
{
    load_next_map();
    falling_snow.colors.fill(maps[current_map].colors.particles);

    joel.position.x = 200;
    joel.position.y = 200;
    
    clementine.position.y = random(500, surface_w - 100);
    clementine.position.y = random(500, surface_h - 100);
}

function draw()
{
    // Initial background color
    background(maps[current_map].colors.background);

    limit_sprite_position(joel, 0);
    limit_sprite_position(clementine, 150);
    
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
    
    draw_falling_snow();
    falling_snow.location.x = joel.position.x;
    falling_snow.location.y = joel.position.y - height - 100;

    fadein_surface_fg();

    camera.off();
}

function handle_sprites_interactions(catching, evading)
{
    var distance_x = Math.abs(
        catching.position.x - evading.position.x
    );
    var distance_y = Math.abs(
        catching.position.y - evading.position.y
    );
    
    // Joel catched up Clementine
    if (distance_x < 10 && distance_y < 10)
    {
        reset_game();
        return;
    }
    // Clementine sees Joel
    else if(distance_x < 250 && distance_y < 250)
    {
        xoff += 0.01;
        var n = noise(xoff) * 3;
        
        evading.velocity.x = catching.velocity.x * n;
        evading.velocity.y = catching.velocity.y * n;
        
        clementine.draw = function()
        {
            fill(255, 152, 255, 240);
            ellipse(0, 0, 100, 100)
        }
    }
    // Clementine starting lose sight of Joel
    else
    {
        clementine.draw = function()
        {
            fill(255, 0, 0);
            ellipse(0, 0, 100, 100)
        }
        // Dropping gradually velocity
        if (xoff > 0.00)
        {
            var down_by = 0.01;
            xoff -= down_by;
        
            evading.velocity.x -= down_by;
            evading.velocity.y -= down_by;
        }
        // Clementine can't see Joel
        else
        {
            xoff = 0.00;
            evading.velocity.x = 0;
            evading.velocity.y = 0;
        } 
    }
}

function limit_sprite_position(sprite, distance)
{
    if(sprite.position.x < distance)
    {
        sprite.position.x = distance;
    }
    if(sprite.position.x > surface_w - distance)
    {
        sprite.position.x = surface_w - distance;
    }
    
    if(sprite.position.y < distance)
    {
        sprite.position.y = distance;
    }
    if(sprite.position.y > surface_h - distance)
    {
        sprite.position.y = surface_h - distance;
    }
}

// It modifies background - only call this function from draw()
function load_next_map()
{
    var maps_array = Object.keys(maps);
    
    for (var i = 0; i < maps_array.length; i++)
    {
        var name = maps_array[i];
    
        if (!current_map)
        {
            update_map_colors(
                maps[name].colors.background,
                maps[name].colors.particles
            );
            current_map = name;
            break;
        }
        else
        if (name == current_map)
        {
            if (i == maps_array.length - 1)
            {
                // Set load first map
                name = maps_array[0];
            }
            else
            {
                // Set load next map
                name = maps_array[i + 1];
            }
            update_map_colors(
                 maps[name].colors.background,
                 maps[name].colors.particles
            );
            current_map = name;
            break;
        }
    }
}

// It modifies background - only call this function from draw()
function update_map_colors(bg_color, particles_color)
{
    background(bg_color);
    
    // Background particles
    for (var i = 0; i < surface_bg.length; i++)
    {
        surface_bg[i].draw = function()
        {
            fill(particles_color);
            ellipse(0, 0, 10, 10);
        };
    }
}

function draw_falling_snow()
{
    falling_snow.Draw();
    falling_snow.CreateN();
    falling_snow.Step();
    noStroke();
    text(
        falling_snow.length,
        width/2,
        20
    );
    stroke(0);
}

var fadein_counter = 1.00;

// TODO use frameRate() and seconds in arg
function fadein_surface_fg()
{
    if (fadein_counter < 0.00)
    {
        return;
    }
    
    var precision = 0.001;
    
    surface_fg_div.style(
        'opacity',
        1.00 * fadein_counter
    );
    fadein_counter -= precision;
}

