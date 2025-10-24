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

	console.error("Shader compilation error: " + gl.getProgramInfoLog(program));
	gl.deleteProgram(program);
}

/// returns an n-gon as a pre-flatted Float32Array
/// has first vertex in the center, subsequent points follow the provided polar function
function polarNgon(verts, rFunc) {
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
function staticShape2D(gl, program, verts) {
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
	constructor(x = 0, y = null) {
		this.x = x;
		this.y = (y == null) ? x : y;
	}

	arr() {
		return [this.x, this.y];
	}

  zero() {
    this.x = 0;
    this.y = 0;
  }

  set(n) {
    this.x = n;
    this.y = n;
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
	constructor(x = 0, y = null, z = null) {
		this.x = x;
		this.y = (y == null) ? x : y;
		this.z = (z == null) ? x : z;
	}

	arr() {
		return [this.x, this.y, this.z];
	}

  zero() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }

    set(n) {
    this.x = n;
    this.y = n;
    this.z = n;
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
			return new vec3(this.x * other, this.y * other, this.z * other);
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

	cross(other) {
		return new vec3(
			this.y * other.z - this.z * other.y,
			this.z * other.x - this.x * other.z,
			this.x * other.y - this.y * other.x
		);
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

//------ Matrix math helpers ------

class mat4 {
  /// Takes either one long array, or one array per row
	constructor(inMat, r1, r2, r3) {
		this.set(inMat, r1, r2, r3);
  }

  set(inMat, r1, r2, r3) {
		if (inMat && inMat.length == 16) {
			this.r0 = inMat.slice(0, 4);
			this.r1 = inMat.slice(4, 8);
			this.r2 = inMat.slice(8, 12);
			this.r3 = inMat.slice(12, 16);
		} else {
      this.r0 = inMat;
      this.r1 = r1;
      this.r2 = r2;
      this.r3 = r3;
    }
	}

	arr() {
		return this.r0.concat(this.r1, this.r2, this.r3);
	}

  one() {
    this.set(
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    );
    return this;
  }

  // matrix operations

  multiply(other) {
    const a = this.arr();
    const b = other.arr();
    const result = new Array(16).fill(0);

    // 4x4 multiply
    for (let row = 0; row < 4; ++row) {
      for (let col = 0; col < 4; ++col) {
        for (let i = 0; i < 4; ++i) {
          result[row * 4 + col] += a[row * 4 + i] * b[i * 4 + col];
        }
      }
    }

    return new mat4(result);
  }

  // TODO inverse, identity, determinant, etc (as needed)

  // rotation/translation/scaling functions

  rotateX(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const rot = new mat4(
      [1, 0, 0, 0],
      [0, c, -s, 0],
      [0, s, c, 0],
      [0, 0, 0, 1]
    );
    return this.multiply(rot);
  }

  rotateY(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const rot = new mat4(
      [c, 0, s, 0],
      [0, 1, 0, 0],
      [-s, 0, c, 0],
      [0, 0, 0, 1]
    );
    return this.multiply(rot);
  }

  rotateZ(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const rot = new mat4(
      [c, -s, 0, 0],
      [s, c, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    );
    return this.multiply(rot);
  }

  rotate(vec) {
    const xc = Math.cos(vec.x);
    const xs = Math.sin(vec.x);
    const yc = Math.cos(vec.y);
    const ys = Math.sin(vec.y);
    const zc = Math.cos(vec.z);
    const zs = Math.sin(vec.z);

    const rotX = new mat4(
      [1, 0, 0, 0],
      [0, xc, -xs, 0],
      [0, xs, xc, 0],
      [0, 0, 0, 1]
    );

    const rotY = new mat4(
      [yc, 0, ys, 0],
      [0, 1, 0, 0],
      [-ys, 0, yc, 0],
      [0, 0, 0, 1]
    );

    const rotZ = new mat4(
      [zc, -zs, 0, 0],
      [zs, zc, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    );

    // using ZYX order, just like Blender
    const rotAll = rotZ.multiply(rotY).multiply(rotX);
    return this.multiply(rotAll);
  }

  translate(vec) {
    const t = new mat4(
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [vec.x, vec.y, vec.z, 1]
    );
    return this.multiply(t);
  }

  scale(vec) {
    const s = new mat4(
      [vec.x, 0, 0, 0],
      [0, vec.y, 0, 0],
      [0, 0, vec.z, 0],
      [0, 0, 0, 1]
    );
    return this.multiply(s);
  }

  // TODO rotate around axis
  // TODO quaternion functions (maybe)

  // Projection matrix generators

  ortho(width, height, depth) {
    let aspect = width / height;
    this.set(
      [1, 0, 0, 0],
      [0, aspect, 0, 0],
      [0, 0, 2 / depth, 0],
      [0, 0, 0, 1]
    );
    return this;
  }

  /// makes sure that both vertical and horizontal FOV >= fovDeg
  perspective(width, height, near, far, fovRad) {
    const aspect = width / height;
    let vertFov;
    if (width >= height) {
      vertFov = fovRad;
    } else {
      vertFov = 2 * Math.atan(Math.tan(fovRad / 2) * (height / width));
    }

    const f = 1 / Math.tan(vertFov / 2);
    const a = (far + near) / (near - far);
    const b = (2 * far * near) / (near - far);

    this.set(
      [f / aspect, 0, 0, 0],
      [0, f, 0, 0],
      [0, 0, a, -1],
      [0, 0, b, 0]
    );
    return this;
  }

  // View matrix generators

  lookAt(pos, target, up) {
    const yAxis = target.subt(pos).normalized();
    const xAxis = yAxis.cross(up).normalized();
    const zAxis = xAxis.cross(yAxis);

    this.set(
      [xAxis.x, zAxis.x, -yAxis.x, 0],
      [xAxis.y, zAxis.y, -yAxis.y, 0],
      [xAxis.z, zAxis.z, -yAxis.z, 0],
      [-xAxis.dot(pos),-zAxis.dot(pos), yAxis.dot(pos), 1]
    )
    return this;
  }
}

// TODO position-direction view matrix for first-person stuff

//------ General math helpers ------

function mapRange(value, oldMin, oldMax, newMin, newMax) {
    return ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
};

function d2r(deg) {
  return deg * Math.PI / 180;
}