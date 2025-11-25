var canvas = document.getElementById("canvas");
/** @type {WebGL2RenderingContext} */
var gl = canvas.getContext("webgl2");
if (!gl) {
  alert("WebGL not supported");
}

const prompt = document.getElementById("prompt");

const camPos = new vec3(0, 3, 0);
const target = new vec3(0, 0, 0);
const up = new vec3(0, 0, 1);

let vsSource;
let fsSource;
let OBJSource;

async function getFiles() {
  vsSource = await loadText("vs.glsl");
  fsSource = await loadText("fs.glsl");
  OBJSource = await loadText("model.obj");
}

/** @type {renderer} */
let rend;

/** @type {substance} */
let monkeSubstance;

/** @type {Array<node3D>} */
let graph;

/** @type {Array<light3D>} */
let lightRegistry = [];

/** @type {draw3D} */
let monke;

/** @type {node3D} */
let lightRoot;

/** @type {camera3D} */
let pCam;

/** @type {camera3D} */
let oCam;

function init() {
  // Make a program out of the shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  var program = createProgram(gl, vertexShader, fragmentShader);
  monkeSubstance = new substance(gl, program);


  rend = new renderer(gl);

  // enable depth testing
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  rend.canvas = canvas;
  //TODO make ortho camera
  pCam = new camera3D(camPos, target, 60, rend);
  oCam = new camera3D(camPos, target, 1.4, rend, true);
  rend.camera = pCam;
  rend.lightRegistry = lightRegistry;

  // initialize the projection matrix based on aspect ratio
	rend.resize();

  // Parse the OBJ file
  let obj = parseOBJ(OBJSource);
  let monkeymesh = staticOBJMesh(gl, program, obj.meshes[0]);
  
  // Set up the render graph
  graph = [
    new draw3D(monkeymesh.vao, monkeymesh.count, monkeSubstance, gl.TRIANGLES),
    new node3D(),
    rend.camera
  ];

  monke = graph[0];
  lightRoot = graph[1];

  // spawn a few lights as children of a parent node so we can rotate them easily
  let light1 = new light3D(1.0, new vec3(.5, .5, 1.0), false, lightRegistry, lightRoot);
  light1.position = new vec3(1, 1, 1.5);
  lightRoot.children.push(light1);

  let light2 = new light3D(1.0, new vec3(.5, 1.0, .5), false, lightRegistry, lightRoot);
  light2.position = new vec3(-1, -1.5, 1);
  lightRoot.children.push(light2);

  let light3 = new light3D(1.0, new vec3(1.0, .5, .5), false, lightRegistry, lightRoot);
  light3.position = new vec3(1.5, 1, -1);
  lightRoot.children.push(light3);

  let light4 = new light3D(3, new vec3(1.0, 0.95, 0.95), false, lightRegistry, lightRoot);
  light4.position = new vec3(0, 0, -3);
  lightRoot.children.push(light4);

  let light5 = new light3D(0.5, new vec3(1.0, 0.95, 0.95), true, lightRegistry, lightRoot);
  light5.position = new vec3(0, 0, -3);
  lightRoot.children.push(light5);
  light5.disable();

  // start animation
  requestAnimationFrame(update);
}

/// Resize helper
function resizeCanvas(rend, canvas, force = false) {
	const displayWidth  = window.innerWidth;
	const displayHeight = window.innerHeight;

	// Check if canvas dimensions have changed
	if (canvas.width !== displayWidth || canvas.height !== displayHeight || force) {
		canvas.width = displayWidth;
		canvas.height = displayHeight;

		// update viewport size
		rend.gl.viewport(0, 0, canvas.width, canvas.height);

		// update projection matrix to correct for aspect ratio
		rend.resize()
	}
}

/// Draw function
function draw() {
  const t0 = performance.now();

  rend.resize();

  // clear color and depth buffers (we have a depth buffer now yipee)
  gl.clearColor(0.1, 0.1, 0.1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clearDepth(1.0);
  gl.clear(gl.DEPTH_BUFFER_BIT);

  // calculate matrices
  for (const object of graph) {
    object.updateMatrix();
  }

  // update lighting info
  const lightPos = new Float32Array(lightRegistry.length * 3);
  const lightCol = new Float32Array(lightRegistry.length * 3);
  const lightInt = new Float32Array(lightRegistry.length);
  const lightType = new Int32Array(lightRegistry.length);
  let finalPos;

  for (let i = 0; i < lightRegistry.length; i++) {
    const currLight = lightRegistry[i];

    if (currLight.directional) {
      lightType[i] = 1;
      // normalize the position since it gets used as a direction vector for directional lights
      finalPos = currLight.parent.matrix.transformPoint(currLight.position).normalized();
      //console.log(finalPos);
    } else {
      lightType[i] = 0;
      // transform light position my model matrix for point lights
      finalPos = currLight.parent.matrix.transformPoint(currLight.position);
    }
    
    lightPos.set(finalPos.arr(), i * 3);
    lightCol.set(currLight.color.arr(), i * 3);
    lightInt[i] = currLight.brightness;
  }

  rend.flatLightInfo = [];
  rend.flatLightInfo.push(lightType, lightPos, lightCol, lightInt);
  rend.ambient = new vec3(0.1);

  // draw all objects
  for (const object of graph) {
    object.draw(rend);
  }

  const t1 = performance.now();
  //console.log(`draw took ${t1 - t0} ms`);
}

const keys = {};
let lastTime;
let start;
let deltaTime = 1.0;
let runTime = 0.0;
let frameSkip = 2;
let framesSinceSkip = 0;

const rotateSpeed = 0.001;
const transSpeed = 0.0012;
const scaleSpeed = 0.0005;
const lightSpeed = 0.0007;

let WASDQEVector = new vec3();
let TFGHRYVector = new vec3();
let IJKLUOVector = new vec3();

// logic update function
function update(timestamp) {
  // update timing values
  if (lastTime == undefined) {
    lastTime = timestamp;
    start = timestamp;
  } else {
    // cap deltatime to prevent glitches when the animations isn't being rendered
    deltaTime = Math.min(timestamp - lastTime, 25.0);
    runTime = timestamp - start;
    lastTime = timestamp;
  }

  // rotate lights
  lightRoot.rotation = lightRoot.rotation.add(
    new vec3(deltaTime * lightSpeed,
    deltaTime * lightSpeed * 0.2,
    0));
  //console.log(lightRoot.rotation);

  monke.propagateDirty();
  lightRoot.propagateDirty();

  // translate model using WASDQE
	WASDQEVector.zero()
	if (keys["KeyA"]) WASDQEVector.x += 1;
	if (keys["KeyD"]) WASDQEVector.x -= 1;
	if (keys["KeyW"]) WASDQEVector.y -= 1;
	if (keys["KeyS"]) WASDQEVector.y += 1;
	if (keys["KeyQ"]) WASDQEVector.z -= 1;
	if (keys["KeyE"]) WASDQEVector.z += 1;

	WASDQEVector = WASDQEVector.normalized();
  monke.position = monke.position.add(WASDQEVector.mult(deltaTime * transSpeed));

	// rotate model using TFGHRY
	TFGHRYVector.zero();
	if (keys["KeyT"]) TFGHRYVector.x -= 1;
	if (keys["KeyG"]) TFGHRYVector.x += 1;
	if (keys["KeyY"]) TFGHRYVector.y += 1;
	if (keys["KeyR"]) TFGHRYVector.y -= 1;
	if (keys["KeyH"]) TFGHRYVector.z -= 1;
	if (keys["KeyF"]) TFGHRYVector.z += 1;

	TFGHRYVector = TFGHRYVector.normalized();
  monke.rotation = monke.rotation.add(TFGHRYVector.mult(deltaTime * rotateSpeed));

	// scale model using IJKLUO
	IJKLUOVector.zero();
	if (keys["KeyJ"]) IJKLUOVector.x -= 1;
	if (keys["KeyL"]) IJKLUOVector.x += 1;
	if (keys["KeyU"]) IJKLUOVector.y -= 1;
	if (keys["KeyO"]) IJKLUOVector.y += 1;
	if (keys["KeyK"]) IJKLUOVector.z -= 1;
	if (keys["KeyI"]) IJKLUOVector.z += 1;

  IJKLUOVector = IJKLUOVector.normalized();
  monke.scale = monke.scale.add(IJKLUOVector.mult(deltaTime * scaleSpeed));

  // TODO add controls for switching cameras

  // TODO add controls for toggling lights

  // skip frames to save battery (disabled publicly)
  // this is just to preserve my laptop battery since I have a viewport open at all times
  framesSinceSkip ++
  if (framesSinceSkip >= frameSkip) {
    framesSinceSkip = 0;
    draw();
  }

  //draw();

	requestAnimationFrame(update);
}

// keyboard input event listener and wireframe switch

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  //console.log(keys);

  // wireframe toggle
	if (keys["Space"]) {
		if (monke.drawMode == gl.LINES) {
			monke.drawMode = gl.TRIANGLES;
		} else {
			monke.drawMode = gl.LINES;
		}
	}

  // transform reset
	if (keys["KeyP"]) {
		monke.position.zero();
    monke.rotation.zero();
    monke.scale.set(1);
	}

  // Specular/directional light toggle
  if (keys["KeyZ"]) {
    if (lightRegistry.includes(lightRoot.children[4])) {
      lightRoot.children[4].disable();
      lightRoot.children[3].enable();
    } else {
      lightRoot.children[3].disable();
      lightRoot.children[4].enable();
    }
  }

  // Orthographic/perspective camera toggle
  if (keys["KeyX"]) {
    rend.camera = (rend.camera == pCam) ? oCam : pCam;
    rend.camera.updateProjMat();
  }

  // Specular toggle
  if (keys["KeyC"]) {
    monkeSubstance.specular = (monkeSubstance.specular == 1) ? 0 : 1;
  }

	prompt.style.display = 'none';
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

getFiles().then(init);