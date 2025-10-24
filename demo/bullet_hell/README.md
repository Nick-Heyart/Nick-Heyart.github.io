# NOTICE
Shaders and 3D models will fail to load if you open the HTML directly. To fix this, open the project
folder in a terminal and start a webserver with this command:
```
python3 -m http.server 8000
```
Then open [http://127.0.0.1:8000/proj1.html](http://127.0.0.1:5500/proj1.html) in your browser.

I also have it hosted on my github pages site:
[https://nick-heyart.github.io/demo/bullet_hell/proj1.html](https://nick-heyart.github.io/demo/bullet_hell/proj1.html)

# Objective

Shoot the red thing until it dies. You can do this most effectively by following it closely, but
this makes dodging projectiles more difficult. Upon winning, your time will be displayed. This is
the scoring mechanic. See how fast you can beat the boss! My personal best is 41.820 seconds.

Boss health can be gauged by how many "teeth" remain, and the same goes for the points on your star.
You can take five hits before dying.

# Controls

Control the star's movement and weave between projectiles by moving your mouse.

The game can be paused by pressing the space bar (this will not impact your time).

# Implementation Details

In a previous assignment, I wrote a function to generate 2D shapes from any polar function. I used
this to indicate health; the models get regenerated using a tweaked equation when hits are taken.
The star is 128 polygons, and the boss is 256.

The projectile drawing is kind of a hack. Instead of iterating through the entire render graph, only
the first two entries are drawn. The third entry is the mesh for the bullet; it gets bound once per
frame and then drawn once per entry in the projectiles list. This happens first so that the player
and boss appear over the projectiles. Each bullet has a vector2 that gets multiplied by deltatime
and then applied to its position each frame, creating motion.

Hit detection is just a distance check, though I only have to calculate the square root once per
hit detector instead of once per bullet since it's just a comparison. Each bullet has a flag for who
fired it. This is used to prevent self-damage and skip distance checks. A third distance check
removes the bullets if they go too far from the center of the canvas, preventing off-screen bullets
from causing lag. 

2D transforms are still done with straight equations, no matrix math yet. 
