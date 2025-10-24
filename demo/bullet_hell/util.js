// My own collection of webgl utilities

/// Program creation function
function createProgram(gl, vertexShader, fragmentShader) {
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
		return program
	}

	console.log(gl.getProgramInfoLog(program));
	gl.deleteProgram(program);
}

/// returns an n-gon as a pre-flatted Float32Array
/// has first vertex in the center, subsequent points follow the provided polar function
function ngon(verts, rFunc) {
	// make an empty array and set up the step constant
	// leave first entry at 0, 0 to create a central vertex
	const points = new Float32Array((verts * 2) + 4);
	const step = 2.0 * Math.PI/verts;

	// add verticies to the array
	for (i = 0; i <= verts; i++){
		const theta = step * i;
		const r = rFunc(theta);

		points[(i * 2) + 2] = Math.cos(theta) * r;
		points[(i * 2) + 3] = Math.sin(theta) * r;
	}
	//console.log(points)
	return(points)
}

/// turns an array of 2d verts into a "shape", which is just a VAO and the number of verts. 
function makeShape(gl, program, verts) {
	// make new VAO and make it active
	const vao = gl.createVertexArray(verts);
	gl.bindVertexArray(vao);

	// upload vertex data to GPU memory; assumes data will not change often
	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

	// tell vertex shader that we have data for it, as well as how to read the data.
	const loc = gl.getAttribLocation(program, "a_position");
	gl.enableVertexAttribArray(loc);
	gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

	// return VAO and vert count
	return {vao, count: verts.length / 2};
}

/// Resize helper
function resizeCanvas(gl, canvas) {
	const displayWidth  = window.innerWidth;
	const displayHeight = window.innerHeight;

	// Check if canvas dimensions have changed, only change framebuffer size if it has
	if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
		canvas.width = displayWidth;
		canvas.height = displayHeight;
		gl.viewport(0, 0, canvas.width, canvas.height);
	}
}

/// Text retrieval function
async function loadText(url) {
	const response = await fetch(url);
	return await response.text();
}

/// Shader compilation function
function createShader(gl, type, source) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		return shader;
	}

	console.log(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
}

//------ Vector math helpers ------
class vec2 {
	constructor(x, y = null) {
		this.x = x;
		this.y = (y == null) ? x : y;
	}

	// basic math operations
	add(other) {
		if (other instanceof vec2){
			return new vec2(this.x + other.x, this.y + other.y);
		} else if (typeof other == "number") {
			return new vec2(this.x + other, this.y + other);
		}
	}

	subt(other) {
		if (other instanceof vec2){
			return new vec2(this.x - other.x, this.y - other.y);
		} else if (typeof other == "number") {
			return new vec2(this.x - other, this.y - other);
		}
	}

	mult(other) {
		if (other instanceof vec2){
			return new vec2(this.x * other.x, this.y * other.y);
		} else if (typeof other == "number") {
			return new vec2(this.x * other, this.y * other);
		}
	}

	div(other) {
		if (other instanceof vec2){
			return new vec2(this.x / other.x, this.y / other.y);
		} else if (typeof other == "number") {
			return new vec2(this.x / other, this.y / other);
		}
	}

	// vector math operations

	length() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	}

	/// Length squred, faster than regular length
	length2() {
		return Math.pow(this.x, 2) + Math.pow(this.y, 2);
	}

	/// Distance from this vector to a given vector
	distanceFrom(other) {
		return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
	}

	/// Distance from this vector to a given vector
	distanceFrom2(other) {
		return Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2);
	}

	dot(other) {
		return (this.x * other.x) + (this.y * other.y);
	}

	normalized() {
		const mag = this.length();
		// catch zero vector case
		if (mag == 0) {
			return this;
		} else {
			return this.div(mag);
		}
	}

	rotate_rad(r) {
		return new vec2(
			this.x * Math.cos(r) - this.y * Math.sin(r),
			this.x * Math.sin(r) + this.y * Math.cos(r),
		)
	}

	rotate_deg(d) {
		// just call rotate_rad with a converted value
		return this.rotate_rad(d * 0.0174533)
	}
}

class vec3 {
	constructor(x, y = null, z = null) {
		this.x = x;
		this.y = (y == null) ? x : y;
		this.z = (z == null) ? x : z;
	}

	// basic math operations
	add(other) {
		if (other instanceof vec3){
			return new vec3(this.x + other.x, this.y + other.y, this.z + other.z);
		} else if (typeof other == "number") {
			return new vec3(this.x + other, this.y + other, this.z + other);
		}
	}

	subt(other) {
		if (other instanceof vec3){
			return new vec3(this.x - other.x, this.y - other.y, this.z - other.z);
		} else if (typeof other == "number") {
			return new vec3(this.x - other, this.y - other, this.z - other);
		}
	}

	mult(other) {
		if (other instanceof vec3){
			return new vec3(this.x * other.x, this.y * other.y, this.z * other.z);
		} else if (typeof other == "number") {
			return new vec3(this.x * other, this.y * other), this.z * other;
		}
	}

	div(other) {
		if (other instanceof vec3){
			return new vec3(this.x / other.x, this.y / other.y, this.z / other.z);
		} else if (typeof other == "number") {
			return new vec3(this.x / other, this.y / other, this.z / other);
		}
	}

	// vector math operations

	length() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
	}

	/// Length squred, faster than regular length
	length2() {
		return Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2);
	}

	dot(other) {
		return (this.x * other.x) + (this.y * other.y) + (this.z * other.z);
	}

	normalized() {
		const mag = this.length();
		// catch zero vector case
		if (mag == 0) {
			return this;
		} else {
			return this.div(mag);
		}
	}

	/// Rotates the vector around a given axis. This function normalizes the input axis.
	rotate_rad(axis, r) {
		// Normalize the axis
		const axis_norm = axis.normalized

		// TODO Vec3 rotation math
		return vec3(
			0,
			0,
			0
		)
	}

	/// Rotates the vector around a given axis. This function normalizes the input axis.
	rotate_deg(axis, d) {
		// just call rotate_rad with a converted value
		return this.rotate_rad(axis, d * 0.0174533)
	}
}