class Bullet {
	constructor(enemy, direction, position) {
		this.enemy = enemy;
		this.direction = direction;
		this.position = position;
	}

	move(delta) {
		this.position = this.position.add(this.direction.mult(delta));
	}
}

var canvas = document.getElementById("canvas");
/** @type {WebGL2RenderingContext} */
var gl = canvas.getContext("webgl2");
if (!gl) {
	alert("WebGL not supported");
}

var prompt = document.getElementById("prompt");

let vsSource;
let fsSource;

async function getShaders() {
	vsSource = await loadText("vs.glsl");
	fsSource = await loadText("fs.glsl");
}

let program;
let graph;
let star;
let boss;
let bullets = []

function init() {
	// Compile our two amazing shaders
	var vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
	var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

	// Now kiss
	program = createProgram(gl, vertexShader, fragmentShader);

	// Set up the render graph
	graph = [
		{
			// star
			shape: makeShape(gl, program, ngon(128,
				(theta) => Math.sin(theta * 5) * 0.005 + 0.03 )),
			color: {r: 0.8, g: 1, b: 0.8, a: 1},
			translation: {x: 0, y: 0, r: 0},
			drawMode: gl.TRIANGLE_FAN
		},
		{
			// enemy
			shape: makeShape(gl, program, ngon(256, (theta) => (theta % (Math.PI / 5) / 5 ) + 0.15 )),
			color: {r:1, g: 0.2, b: 0.2, a: 1},
			translation: {x: 0, y: 0.7, r: 0},
			drawMode: gl.TRIANGLE_FAN
		},
		{
			// projectile
			shape: makeShape(gl, program, ngon(16, (theta) => 0.008)),
			color: {r: 1, g: 1, b: 1, a: 1},
			translation: {x: 0, y: 0, r: 0},
			drawMode: gl.TRIANGLE_FAN
		}
	]

	star = graph[0];
	boss = graph[1];

	// test bullet
	// bullets.push(new Bullet(true, new vec2(0, 0.0001), new vec2(0.3)));
	// bullets.push(new Bullet(true, new vec2(0, 0.0001), new vec2(0.2)));
	// bullets.push(new Bullet(true, new vec2(0.0001, 0.0001), new vec2(0.1)));
	// bullets.push(new Bullet(true, new vec2(0.0001, 0.0001), new vec2(-0.1)));
	// bullets.push(new Bullet(true, new vec2(0.0001, 0.0001), new vec2(-0.2)));

	// start animation
	requestAnimationFrame(update);
}

/// Draw function
function draw() {
	const t0 = performance.now();

	resizeCanvas(gl, canvas);

	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(program);

	// u_trans is a float3; first 2 are x and y offset; 3rd is rotation
	// u_color is a float4 that holds shape color like normal
	const transLoc = gl.getUniformLocation(program, "u_trans");
	const colorLoc = gl.getUniformLocation(program, "u_color");
	const aspectLoc = gl.getUniformLocation(program, "u_aspect");
	gl.uniform1f(aspectLoc, canvas.clientWidth / canvas.clientHeight);

	// draw all of the bullets
	const bulletObject = graph[2];
	gl.bindVertexArray(bulletObject.shape.vao);

	for (let i = 0; i < bullets.length; i++) {
		const currBullet = bullets[i];
		gl.uniform3f(transLoc, currBullet.position.x, currBullet.position.y, bulletObject.translation.r);
		gl.uniform4f(colorLoc, bulletObject.color.r, bulletObject.color.g,
			bulletObject.color.b, bulletObject.color.a);
		gl.drawArrays(bulletObject.drawMode, 0, bulletObject.shape.count);
	}

	// draw enemy and player
	for (let i = 0; i < 2; i++) {
		const object = graph[i];
		gl.bindVertexArray(object.shape.vao);

		gl.uniform3f(transLoc, object.translation.x, object.translation.y, object.translation.r);
		gl.uniform4f(colorLoc, object.color.r, object.color.g, object.color.b, object.color.a);

		gl.drawArrays(object.drawMode, 0, object.shape.count);
	}

	const t1 = performance.now();
	//console.log(`draw took ${t1 - t0} ms`);
}

let running = false;
let started = false;

let lastTime;
let start;
let deltaTime = 1.0;
let runTime = 0.0;
let orbitTheta = 0;
let targetCenter = new vec2(0);
let starPos = new vec2(0);

const glideSpeed = 0.015;
const moveSpeed = 0.0005;
const playerHitRadius = 0.02;
const playerHitRadius2 = Math.pow(playerHitRadius, 2);
const playerBPerSec = 20;
const playerBSpread = .45;
const playerBSpeed = 0.005;
let playerBMsec = 0;

const bossHitRadius = 0.2;
const bossHitRadius2 = Math.pow(bossHitRadius, 2);
const bossBPerSec = 30;
const bossBSpeed = 0.00015 ;
let bossBAngle = 0.0;
let bossBMsec = 0;
let bossAnim = 0.0;

let playerHealth = 5;
const bossStartHealth = 500;
let bossHealth = bossStartHealth;

let timer = 0.0;

// WASD input event listener
const keys = {};

window.addEventListener("keydown", (e) => {
	keys[e.code] = true;
	//console.log(keys);

	if (keys["Space"] && started == false) {
		// Game is at the instructions screen and should be started
		prompt.style.display = 'none';
		prompt.innerHTML = `<h2 style="text-align: center;">Paused</h2><h4 style="text-align: center;">Press space to resume</h4>`;
		started = true;
		running = true;
		requestAnimationFrame(update);

	} else if (keys["Space"] && running == true){
		// Game is running and should be paused
		prompt.style.display = '';
		running = false;

	} else if (keys["Space"] && running == false){
		if (playerHealth > 0 && bossHealth > 0) {
			// Game is paused and should be running
			prompt.style.display = 'none';
			running = true;
			requestAnimationFrame(update);

		} else {
			// Game has ended 
			window.location.reload()
		}
		
	} 
});

window.addEventListener("keyup", (e) => {
	keys[e.code] = false;
});

function hitPlayer(oneshot = false) {
	playerHealth --;
	star.shape = makeShape(gl, program, ngon(128,
		(theta) => Math.sin(theta * playerHealth) * 0.005 + 0.035 ))
	
	if (playerHealth == 0 || oneshot) {
		playerHealth = 0;
		prompt.style.display = '';
		prompt.innerHTML = `<h2 style="text-align: center;">Game over!</h2><h4 style="text-align: center;">Press space to restart</h4>`;
		running = false;
	}
}

const mapRange = (value, oldMin, oldMax, newMin, newMax) => {
    return ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
};

function hitBoss(oneshot = false) {
	bossHealth --;
	boss.translation.r += 0.05;
	boss.shape = makeShape(gl, program, ngon(256, (theta) => (theta % (Math.PI / mapRange(bossHealth, 0, bossStartHealth, 0.001, 5))
		/ mapRange(bossHealth, 0, bossStartHealth, 40, 5)) + 0.15 ))

	if (bossHealth == 0 || oneshot) {
		bossHealth = 0;
		const seconds = (timer / 1000).toFixed(3);
		prompt.style.display = '';
		prompt.innerHTML = `
  <h2 style="text-align: center;">You win!</h2>
  <p>Your time was ${seconds} seconds.<br>Try again and see if you can beat it!</p>
  <h4 style="text-align: center;">Press space to restart</h4>`;
		running = false;
	}
}

// game update function
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
	timer += deltaTime;

	// clip target position so the star stays onscreen
	const aspect = canvas.clientHeight / canvas.clientWidth;
	targetCenter.x = Math.max(-0.95, Math.min(0.95, targetCenter.x));
	targetCenter.y = Math.max(-aspect + 0.05, Math.min(aspect - 0.05, targetCenter.y));

	// smooth out star position
	starPos.x += ((targetCenter.x) - starPos.x) * glideSpeed * deltaTime;
	starPos.y += ((targetCenter.y) - starPos.y) * glideSpeed * deltaTime;

	// update star position
	star.translation.x = starPos.x;
	star.translation.y = starPos.y;
	star.translation.r += deltaTime / 400;

	// fire player projectiles
	const playerMSPerBullet = 1000 / playerBPerSec;
	playerBMsec += deltaTime;
	
	while (playerBMsec >= playerMSPerBullet) {
		playerBMsec -= playerMSPerBullet;
		const PBDir = new vec2(0, playerBSpeed).rotate_rad(Math.random() * playerBSpread - playerBSpread / 2);
		bullets.push(new Bullet(false, PBDir, new vec2(star.translation.x, star.translation.y)));
	}

	// update enemy position
	boss.translation.r -= deltaTime / 800;
	bossAnim += deltaTime;
	boss.translation.x = Math.sin(bossAnim / 1200) * 0.7;
	boss.translation.y = Math.cos(bossAnim / 800) / 3 + 1;

	// fire enemy projectiles
	const bossMSPerBullet = 1000 / bossBPerSec;
	bossBMsec += deltaTime;

	while (bossBMsec >= bossMSPerBullet) {
		bossBMsec -= bossMSPerBullet;
		bossBAngle += Math.PI/40 + Math.PI /1.5;
		const BBDir = new vec2(0, bossBSpeed).rotate_rad(bossBAngle);
		bullets.push(new Bullet(true, BBDir, new vec2(boss.translation.x, boss.translation.y)));
	}

	// update bullet positions and check collision
	for (let i = 0; i < bullets.length; i++) {
		// remove bullets that have gone too far off screen
		const distCenter2 = bullets[i].position.distanceFrom2(new vec2(0));
		if (distCenter2 > 4) {
			bullets.splice(i, 1);
			continue;
		}

		//console.log(bullets[i]);
		bullets[i].move(deltaTime);
		

		if (bullets[i].enemy) {

			const distPlayer2 = bullets[i].position.distanceFrom2(new vec2(star.translation.x, star.translation.y));
			if (distPlayer2 < playerHitRadius2) {
				// decrement player health and delete bullet
				hitPlayer();
				bullets.splice(i, 1);
			}
		} else{
			// boss damage
			const distBoss2 = bullets[i].position.distanceFrom2(new vec2(boss.translation.x, boss.translation.y));
			if (distBoss2 < bossHitRadius2) {
				hitBoss();
				bullets.splice(i, 1);
			}
		}
	}

	// check for contact boss damage (instant kill)
	const bossDistance = new vec2(boss.translation.x, boss.translation.y).distanceFrom(new vec2(star.translation.x, star.translation.y))
	if (bossDistance < bossHitRadius + playerHitRadius) hitPlayer(true);

	draw();

	if (running) {
		requestAnimationFrame(update);
	}
}

// Click input handler
document.addEventListener("mousemove", onClick);

function onClick(event) {
	const rect = canvas.getBoundingClientRect();
	const pixX = event.clientX - rect.left;
	const pixY = event.clientY - rect.top;

	// translate pixel coords to the aspect-corrected webgl coords
	const aspect = canvas.clientHeight / canvas.clientWidth;
	targetCenter.x = (pixX / canvas.clientWidth) * 2 - 1;
	targetCenter.y = ((pixY / canvas.clientHeight) * -2 + 1) * aspect;

	// uncomment this for debug info
	//console.log(targetCenter);

	// hide the control prompt if it is visible
	//prompt.style.display = 'none';
}

getShaders().then(init);