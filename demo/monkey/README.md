# NOTICE
Shaders and 3D models will fail to load if you open the HTML directly. To fix this, open the project
folder in a terminal and start a webserver with this command:
```
python3 -m http.server 8000
```
Then open [http://127.0.0.1:8000/lab3.html](http://127.0.0.1:5500/lab3.html) in your browser.

I also have it hosted on my github pages site:
[https://nick-heyart.github.io/demo/monkey/lab3.html](https://nick-heyart.github.io/demo/monkey/lab3.html)

# Controls
All model transformations can be manipulated using three sets of six keys that span the entire width
of the keyboard, each following a similar layout. Currently, all transformations are done about the
world origin instead of the model position. 

W, A, S, D, Q, and E control translation.

T, F, G, H, R, and Y control rotation.

I, J, K, L, U, and O control scaling.

P resets the model's transformation.

Space toggles wireframe rendering.

# Implementation Details
I extended the util.js math library to include all the basic 4x4 matrix math functions, using the
slides and online resources to figure out the math. Instead of manually defining a mesh, I wrote
an OBJ loader that parses and buffers vert positions, vert normals, UVs, and vert colors. I plan to
extend this to handle .mtl files and image textures for future assignments. The only information the
shader uses is positions and colors, though the baked vert colors from Blender make it appear as if
there is more sophisticated lighting.

I did occasionally consult chatGPT for this project, mostly for questions about Javascript as I'm
still pretty new at it. That said, I did not copy/paste from it at any point. You may have already
noticed that I do not like using other people's code. I usually come up with my own ideas for how
things should work, for better and for worse.

# Matrix Information
The matrix composition order is projection * view * model. Technically a view matrix isn't required
if the camera doesn't need to move, but I wanted to get it out of the way as I want to have a
first-person game for project 2. 

The amount of transformation is calculated by taking the input vector, normalizing it, then
multiplying it by a tuned constant and deltatime. Scaling is an exception to this; the scale factor
can't be normalized directly, so normalizing scale speed needs some extra work that I couldn't be
bothered to do. This means that the net scaling effect increases when you scale in multiple axes at
the same time. 

Also, rotations are done in ZYX order, which is the same as what Blender uses. Blender is the first
3D program that I actually got good at, so the different coordinate systems in most other programs
trip me up.