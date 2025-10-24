var canvas = document.getElementById("canvas");
/** @type {WebGL2RenderingContext} */
var gl = canvas.getContext("webgl2");
if (!gl) {
  alert("WebGL not supported");
}

const prompt = document.getElementById("prompt");

const fov = d2r(40);
const near = 0.1;
const far = 50;

const camPos = new vec3(0, 4, 0);
const target = new vec3(0, 0, 0);
const up = new vec3(0, 0, 1);

let vsSource;
let fsSource;
let OBJSource;

async function getFiles() {
  vsSource = await loadText("vs.glsl");
  fsSource = await loadText("fs.glsl");
  OBJSource = await loadText("mesh.obj");
}

let projectionMatrix;
let viewMatrix;
let program;
let graph;
let monke;

function init() {
  // Make a program out of the shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  program = createProgram(gl, vertexShader, fragmentShader);

  // enable depth testing
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  // use resize helper to initalize the projection matrix
	resizeCanvas(gl, canvas, true);

	viewMatrix = new mat4().lookAt(camPos, target, up)
	//console.log(viewMatrix);

  // Parse the OBJ file
  var obj = parseOBJ(OBJSource);
	//console.log(obj);

  // Set up the render graph
  graph = [
    {
      shape: staticOBJMesh(gl, program, obj.meshes[0]),
      matrix: new mat4().one(),
      drawMode: gl.TRIANGLES,
    },
  ];

  monke = graph[0];

  // start animation
  requestAnimationFrame(update);
}

/// Resize helper
function resizeCanvas(gl, canvas, force = false) {
	const displayWidth  = window.innerWidth;
	const displayHeight = window.innerHeight;

	// Check if canvas dimensions have changed
	if (canvas.width !== displayWidth || canvas.height !== displayHeight || force) {
		canvas.width = displayWidth;
		canvas.height = displayHeight;

		// update viewport size
		gl.viewport(0, 0, canvas.width, canvas.height);

		// update projection matrix to correct for aspect ratio
		projectionMatrix = new mat4().perspective(displayWidth, displayHeight, near, far, fov);
	}
}

/// Draw function
function draw() {
  const t0 = performance.now();

  resizeCanvas(gl, canvas);

  // clear color and depth buffers (we have a depth buffer now yipee)
  gl.clearColor(0.1, 0.1, 0.1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clearDepth(1.0);
  gl.clear(gl.DEPTH_BUFFER_BIT);

  gl.useProgram(program);

  // get uniform locations for transformation matrices
  const modelLoc = gl.getUniformLocation(program, "u_model");
  const viewLoc = gl.getUniformLocation(program, "u_view");
  const projLoc = gl.getUniformLocation(program, "u_projection");

  // draw all objects in the graph
  for (const object of graph) {
    gl.bindVertexArray(object.shape.vao);

    gl.uniformMatrix4fv(modelLoc, false, object.matrix.arr());
    gl.uniformMatrix4fv(viewLoc, false, viewMatrix.arr());
    gl.uniformMatrix4fv(projLoc, false, projectionMatrix.arr());

    gl.drawElements(object.drawMode, object.shape.count, gl.UNSIGNED_INT, 0);
  }

  const t1 = performance.now();
  //console.log(`draw took ${t1 - t0} ms`);
}

const keys = {};
let lastTime;
let start;
let deltaTime = 1.0;
let runTime = 0.0;

const rotatSpeed = 0.001;
const transSpeed = 0.0012;
let WASDQEVector = new vec3();
let arrowVector = new vec2();

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

  // translate model using WASDQE
	WASDQEVector.zero()
	if (keys["KeyW"]) WASDQEVector.y -= 1;
	if (keys["KeyS"]) WASDQEVector.y += 1;
	if (keys["KeyA"]) WASDQEVector.x += 1;
	if (keys["KeyD"]) WASDQEVector.x -= 1;
	if (keys["KeyQ"]) WASDQEVector.z -= 1;
	if (keys["KeyE"]) WASDQEVector.z += 1;
	WASDQEVector = WASDQEVector.normalized();

	monke.matrix = monke.matrix.translate(WASDQEVector.mult(deltaTime * transSpeed));
	
	// rotate model using arrow keys
	arrowVector.zero();
	if (keys["ArrowLeft"]) arrowVector.x -= 1;
	if (keys["ArrowRight"]) arrowVector.x += 1;
	if (keys["ArrowDown"]) arrowVector.y += 1;
	if (keys["ArrowUp"]) arrowVector.y -= 1;
	arrowVector = arrowVector.normalized();

	monke.matrix = monke.matrix.rotateZ(arrowVector.x * deltaTime * rotatSpeed)
	monke.matrix = monke.matrix.rotateX(arrowVector.y * deltaTime * rotatSpeed);


  draw();
	requestAnimationFrame(update);
}

// keyboard input event listener and wireframe switch

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  //console.log(keys);

	if (keys["Space"]) {
		if (monke.drawMode == gl.LINES) {
			monke.drawMode = gl.TRIANGLES;
		} else {
			monke.drawMode = gl.LINES;
		}
	}

	prompt.style.display = 'none';
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

getFiles().then(init);