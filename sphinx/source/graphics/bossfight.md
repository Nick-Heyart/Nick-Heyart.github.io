# Boss Fight Render Challenge
Every few months, VFX artist and YouTuber Clint ["Pwnisher"](https://www.youtube.com/@pwnisher) Jones hosts a render competition where thousands of artists submit 3D renders, each one based on a template that allows for consistent camera movement between submissions. After the submission deadline, all submissions are compiled into one youtube video where each render smoothly transitions into the next. This article details my submission into the boss fight themed challenge.

## Concept
![A detailed render of the inside of a temple. Concentric rings of benches surround a strange blue anomaly. The roof is made of a thick slab of stone, and is partially open to the sky. One man, dwarfed by the structure, approached the anomaly.](img/time-temple.avif){.bg-warning w=350px align=left}
There were 3 templates available, each with a different distance between the boss and the hero. I chose to have the greatest distance, since I planned to have the hero face off against an angel in a vast cathedral. I had neither the time or the talent to model a detailed interior, so I knew I would have to find a way to imply the size of the building. One inspiration for this was the architectural render *the Hyperbolic Time Temple* by Gainluca Sorteni and Giovanni Toselli, which obscures the extent of the structure with dust and fog. My submission also wound up having a similar composition to this render, though I think this has more to do with the constraints of the template. The scale of the temple is not the only ambiguous thing in this render; we don't know if the anomaly in the center is dangerous or what the man's intentions are by approaching it. I feel that my submission inherited some of this as well.

But now we need to figure out who the hell fights an angel. A sinner? If breaking the law isn't always immoral, can the same go for religious rules? I went with the idea that the divine powers in this fictional world don't have humanity's best interests at heart, and our hero is trying to escape unjust damnation despite being crippled by his captors. My ideas for his appearance resemble something from [Scorn](https://en.wikipedia.org/wiki/Scorn_(video_game)), or maybe a victim race of [the Qu](https://en.wikipedia.org/wiki/All_Tomorrows#Summary). If the angels distort the objects around them, they may also distort the anatomy of humans as they see fit. 

## Initial Tests
The first step was to get a rough outline of the cathedral and angel. Both of these relied heavily, if not entirely on geometry nodes. The angel's core is made up of spiral "teeth" that are instanced and rotated along an elliptical curve, and scaled down near the center to prevent clipping. This was much more boring than I thought it would be, and I revisit it later on.

When watching a chess documentary by [Fredrik Knudsen](https://www.youtube.com/@FredrikKnudsen), the chess personality paintings by [Anton Oxenuk](https://antonoxenuk.com/) stood out to me; Deep Blue's depiction as a black hole had an intimidating look that I wanted to try recreating in 3D. We can see distinct "blades" to the distortions surrounding it. So, the first step was to create a geometry node setup to generate blades of a similar shape, then instance them in a random radial pattern around the core. Then, I gave them a transparent material with high refraction so that they would distort the background. The overlapping blades made for a very interesting pattern that I found myself getting distracted by while working on other parts of the scene.

Next up was the cathedral. Most churches have either a flat or slightly declined floor for good audience visibility, However I struggled to make this look good while complying with the camera constraints of the template. I decided that this detail was not important enough to worry about in a 5 second animation, and made the floor into an inclined staircase for dramatic effect. The floor and pews were generated from a few profile splines using geometry nodes. Cathedrals usually have very detailed and intricate ceilings, however I used geometry nodes to make a spiral pattern of acoustic padding as a placeholder. For lighting, I just pointed a bunch of area lights at the ceiling as a temporary solution. Time for a first test render:

![](img/bf-test-1.mp4)

## Revision Round 1

While I had the technical details nailed down, the angel did not have the intimidating look I was going for. The angel was animated by a single variable called "position" which ramped in a few places, though this alone was not enough to express anger and malice. So, I added a second variable called "shiver" that would make the angel's teeth vibrate, as if it was eager to engage with the hero. While adding this, I made a mistake that rotated the teeth in the wrong axis. This actually made it look way cooler, so I kept it in. I also made the shiver variable affect the distortion blades such that the distortion increases along with the angel's vibrations, maintaining the appearance that the distortion is an extension of the angel. I also made the refraction of each blade taper off at the beginning and end, making it less obvious that the effect is just a bunch of glass planes. 

It occurred to me that the hero was nonexistent, so I just re-enabled the placeholder model and decided that I would work on that later. It is worth noting that I had never made a serious attempt at modeling or rigging a character before this point.

![](img/bf-test-3.mp4)

## Revision Round 2

Obviously, I had a lot of work to do with materials. I had a hard time trying to get image textures to map correctly to the procedural meshes without visible repetition, so I decided to make procedural shaders for everything instead. I started making a wood material for the pews with a lofty goal of near-photorealism, but it was not going well. I also added a second bank of pews in the back in an attempt to hide void that the distortion effect keeps revealing. 

I was not happy with how the distortion blades affected the lighting. Earlier renders had a subtle caustic pattern cast on the foreground, but I wanted it to be more visible. So, I made a large area light above the stairs that uses light nodes to project a voronoi pattern down on the scene. This is also animated by the position and shiver variables.

![](img/bf-test-7.mp4)

## Revision Round 3

As I wrestled with the pew wood shader, I realized that the pews looked boring even with a realistic material; they fill the entire bottom half of the screen with brown no matter how you approach them. So, I modeled a chair and re-worked the geometry nodes to instance evenly-spaced chairs along a spline instead of pews. I changed my wood material to be a lighter color and map onto the chair's frame properly, then made a green fabric material that is a slightly different color for each chair instance. I also used this fabric material on the acoustic panel ceiling, which had been the Blender default material up until now. The geometry nodes for the panels was reworked to make them fit together with an even gap.

I posted a previous test render in Pwnisher's Discord server and got some feedback saying that the angel lacked an "attack". I didn't feel like this was needed, but it was a pretty common complaint so I decided to try having the angel send some kind of projectile(s) into the hero, covering the entire scene in chair debris. 

There were also a few lighting changes. I added more lights to the ceiling, and added multi-sample motion blur to the projection light since Blender wasn't calculating motion blur for it automatically. Since I had to make it very blurry before doing this, adding motion blur actually let me make the pattern sharper overall. I also added a few spotlights pointing down at the battle, and disabled shadow casting on the blades to get rid of weird shadows.

![](img/bf-test-12.mp4)

## Preparing for submission

At this point, I only had a few days before the submission deadline. The angel's "attack" was not working at all, and I realized that destroying/moving the chairs would be very difficult due to how they were generated. I reverted to an older save with no projectile and just tweaked the angel's animation so that it speeds towards the hero at the end. 

Speaking of the hero, I had completely neglected to work on him. I tried modeling and animating our hero stumbling up the stairs, getting pushed around by the angel's rage and clinging to the chairs on the sides for support. A few hours after I began work on this, I was completely hopeless and had immense respect for 3D character animators. I might have been able to finish a good model and animation before the deadline, but that would leave me no time for a final render. So, I re-enabled the placeholder figure that came with the template and threw together a geometry nodes setup to make it look interesting. Geometry nodes do well with hard surfaces, so I changed the hero's design to be plagued by shards that pierce him eternally, and gold parasites that run throughout his body. 

![](img/bf-sub-3.mp4)