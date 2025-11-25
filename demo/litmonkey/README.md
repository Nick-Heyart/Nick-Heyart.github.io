# NOTICE
Shaders and 3D models will fail to load if you open the HTML directly. To fix this, open the project
folder in a terminal and start a webserver with this command:
```
python3 -m http.server 8000
```
Then open [http://127.0.0.1:8000/lab4.html](http://127.0.0.1:8000/lab4.html) in your browser.

I also have it hosted on my github pages site:
[https://nick-heyart.github.io/demo/litmonkey/lab4.html](https://nick-heyart.github.io/demo/litmonkey/lab4.html)

# Controls
All model transformations can be manipulated using three sets of six keys that span the entire width
of the keyboard, each following a similar layout. Currently, all transformations are done about the
world origin instead of the model position. 

W, A, S, D, Q, and E control translation.

T, F, G, H, R, and Y control rotation.

I, J, K, L, U, and O control scaling.

P resets the model's transformation.

Space toggles wireframe rendering.

Z toggles the bright white light between a point source to a directional source.

X toggles the camera between perspective and orthographic.

C toggles specular lighting on and off, though the substance system allows for anything in between.

# Implementation Details
You may have noticed the submissions were pretty late on this one. I went and made a few new nodes
and classes in preparation for project 2, including light nodes, camera nodes, a material switching
system, a way of organizing the growing number of uniforms I have to work with, all while leaving
room for new substances to break the rules and add their own specific uniforms and draw code.

Light info is passed to the fragment shader in the form of multiple flat arrays of light info, as
well as an integer that specifies how many lights are present. I also use the vertex colors for
slightly jagged baked ambient occlusion.

Camera setup, ortho/perspective, and a model loader are all things that I had implemented in
previous labs just for the love of the game.