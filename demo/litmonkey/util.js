// My own collection of webgl utilities

const defaultUniformNames = [
  "u_projection", "u_view", "u_model", "u_ambient", "u_lightCount", "u_lightPositions",
  "u_lightColors", "u_lightIntensities", "u_lightTypes", "u_matProperties", "u_resolution",
  "u_camPosition", "u_camOrtho"
]

/// base 3D object class
class node3D {
  /** @type {node3D} */
  constructor(parent = null) {
    this.parent = parent;

    /** @type {Array<node3D>} */
    this.children = [];
    this.matrix = new mat4().one();
    this.position = new vec3();
    this.rotation = new vec3();
    this.scale = new vec3(1);

    // This variable gets set to true whenever an object or its parents move
    // gets set to false once the matrix is updated to reflect the position values
    this.dirty = false;
  }

  /// Rebuilds transform matrix from transformation values
  updateMatrix(ignoreParent = false, skipChildren = false, ignoreDirty = false) {

    if (ignoreDirty || this.dirty) {

      // rebuild matrix. scale, rotation, then translation.
      this.matrix = this.matrix.one();
      this.matrix = this.matrix.scale(this.scale);
      this.matrix = this.matrix.rotate(this.rotation);
      this.matrix = this.matrix.translate(this.position);

      // matrix is now up to date
      this.dirty = false;

      // inherit parent's transform
      if (!ignoreParent && this.parent) {
        this.matrix = this.matrix.multiply(this.parent.matrix);
      }
    }

    // apply transform to children
    if (!skipChildren) {
      for (const child of this.children) {
        child.updateMatrix(ignoreParent, false, ignoreDirty);
      }
    }

    // TODO skip matrix updates if a node and all children are not visible
  }

  // TODO function that gets transformation values from the transform matrix (if needed)

  // game logic must call this manually
  /// sets hasMoved flag for this and all children to a given value (true if none given)
  propagateDirty(val = true) {
    if (this.dirty == val) return;
    this.dirty = val;
    for (const child of this.children) {
      child.propagateDirty(val);
    }
  }

  /**
   * 
   * @param {renderer} rend 
   */
  draw(rend) {
    for (const child of this.children) {
      child.draw(rend)
    }
  }
}

/// extension of node3D but with a mesh that gets drawn
class draw3D extends node3D {
  /**
   * 
   * @param {WebGLVertexArrayObject} vao 
   * @param {number} count
   * @param {substance} substance 
   * @param {number} drawMode 
   * @param {node3D} parent 
   */
  constructor(vao, count, substance, drawMode, parent = null) {
    super(parent);
    /**@type {boolean} */
    this.visible = true;
    this.vao = vao;
    this.count = count;
    this.substance = substance;
    this.drawMode = drawMode;

    // objects can have their draw functions changed as needed
    /**
     * 
     * @param {renderer} rend 
     */
    this.drawFunc = function(rend) {
      // check if current substance and vao are already set up
      if (rend.currSubstance != this.substance) {
        rend.gl.useProgram(this.substance.program);
        rend.currSubstance = this.substance;
      }

      if (rend.currVAO != this.vao) {
        rend.gl.bindVertexArray(this.vao);
        rend.currVAO = this.vao;
      }

      // send transformation matrices and camera/viewport info
      rend.gl.uniformMatrix4fv(this.substance.getLoc("u_projection"), false, rend.camera.projMat.arr());
      rend.gl.uniformMatrix4fv(this.substance.getLoc("u_view"), false, rend.camera.viewMat.arr());
      rend.gl.uniformMatrix4fv(this.substance.getLoc("u_model"), false, this.matrix.arr());
      rend.gl.uniform3fv(this.substance.getLoc("u_matProperties"), substance.arr());

      // TODO camera position, type, viewport resolution, camera parent matrix transform
      rend.gl.uniform3fv(this.substance.getLoc("u_camPosition"), rend.camera.camArr());
      rend.gl.uniform1i(this.substance.getLoc("u_camOrtho"), (rend.camera.ortho)? 1 : 0);

      // send light info
      rend.gl.uniform3fv(this.substance.getLoc("u_ambient"), rend.ambient.arr());
      rend.gl.uniform1i(this.substance.getLoc("u_lightCount"), rend.lightRegistry.length);
      rend.gl.uniform1iv(this.substance.getLoc("u_lightTypes"), rend.flatLightInfo[0]);
      rend.gl.uniform3fv(this.substance.getLoc("u_lightPositions"), rend.flatLightInfo[1]);
      rend.gl.uniform3fv(this.substance.getLoc("u_lightColors"), rend.flatLightInfo[2]);
      rend.gl.uniform1fv(this.substance.getLoc("u_lightIntensities"), rend.flatLightInfo[3]);

      rend.gl.drawElements(this.drawMode, this.count, rend.gl.UNSIGNED_INT, 0);
    };
  }

  /**
   * 
   * @param {renderer} rend 
   */
  draw(rend) {
    if (this.visible) this.drawFunc(rend);

    for (const child of this.children) {
      child.draw(rend)
    }
  }
}

/// light class
class light3D extends node3D {
  /**
   * 
   * @param {number} brightness 
   * @param {vec3} color 
   * @param {boolean} directional False for point light, true for directional
   * @param {Array<light3D>} lightRegistry 
   * @param {node3D} parent 
   */
  constructor(brightness, color, directional, lightRegistry, parent = null) {
    super(parent);
    this.brightness = brightness;
    this.color = color;
    this.directional = directional;
    this.lightRegistry = lightRegistry
    
    // add self to light registry
    // draw loop does not have to search tree for lights with this approach
    if (lightRegistry != null) lightRegistry.push(this);
  }

  disable() {
    let index = this.lightRegistry.indexOf(this);

    if (index > -1) {
      this.lightRegistry.splice(index, 1);
    }
  }

  enable() {
    if (!this.lightRegistry.includes(this)) {
      this.lightRegistry.push(this);
    }
  }
}

/// camera class
class camera3D extends node3D {
  /**
   * 
   * @param {vec3} position 
   * @param {vec3} target 
   * @param {number} fov FOV in degrees
   * @param {renderer} rend 
   * @param {boolean} ortho True for orthographic, false for perspective
   * @param {node3D} parent 
   */
  constructor(position, target, fov, rend, ortho = false, parent) {
    super(parent);
    this.fov = fov;
    this.near = 0.1
    this.far = 100;
    this.rend = rend;
    this.position = position;
    this.target = target;
    this.ortho = ortho;
    this.viewMat = new mat4().lookAt(position, target, new vec3(0, 0, 1));
    this.projMat = new mat4();
    this.updateProjMat();
  }

  updateProjMat() {
    const width = this.rend.canvas.width;
    const height = this.rend.canvas.height;

    if (this.ortho) {
      this.projMat = this.projMat.ortho(width, height, this.near, this.far, this.fov);
    } else {
      this.projMat = this.projMat.perspective(width, height, this.near, this.far, d2r(this.fov));
    }
    
  }

  /**
   * 
   * @returns {vec3} Camera position if perspective, camera vector if ortho.
   */
  camArr() {
    if (this.ortho) {
      return this.position.normalized().arr();
    } else {
      return this.position.arr();
    }
  }
}

/// Program creation function
/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {WebGLShader} vertexShader 
 * @param {WebGLShader} fragmentShader 
 * @returns {WebGLProgram}
 */
function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return program;
  }

  console.error("Shader compilation error: " + gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

/// Text retrieval function
async function loadText(url) {
  const response = await fetch(url);
  return await response.text();
}

/// Shader compilation function
/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {number} type 
 * @param {string} source 
 * @returns {WebGLShader}
 */
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

/// program class that keeps track of uniform locations and material properties
class substance {
  /**
   * 
   * @param {WebGL2RenderingContext} gl 
   * @param {WebGLProgram} program 
   * @param {Array<string>} uniformNames 
   * @param {boolean} useDefaultUniforms
   */
  constructor(gl, program, uniformNames = [], useDefaultUniforms = true) {
    this.program = program;
    this.uniformNames = uniformNames;

    this.diffuse = 1;
    this.specular = 1;
    this.shine = 20;

    this.uniformLocs = {};

    let allNames = []
    allNames = allNames.concat(uniformNames);

    if (useDefaultUniforms) {
      allNames = allNames.concat(defaultUniformNames);
    }

    for (const name of allNames) {
      this.uniformLocs[name] = gl.getUniformLocation(program, name);
    }
  }

  /**
   * 
   * @param {string} name 
   * @returns {WebGLUniformLocation}
   */
  getLoc(name) {
    return this.uniformLocs[name];
  }

  arr() {
    return [this.diffuse, this.specular, this.shine];
  }
}

/// renderer class that stores projection & view matrices as well as any other render state info
class renderer {
  /**
   * 
   * @param {WebGL2RenderingContext} gl 
   * @param {mat4} projMat 
   * @param {camera3D} camera 
   */
  constructor(gl) {
    this.gl = gl;

    /** @type {camera3D} */
    this.camera;

    /** @type {WebGLVertexArrayObject} */
    this.currVAO;

    /** @type {substance} */
    this.currSubstance;

    /** @type {Array<light3D>} */
    this.lightRegistry = [];

    /** @type {Array<Float32Array>} */
    this.flatLightInfo = [];

    /** @type {vec3} */
    this.ambient;

    /** @type {HTMLElement} */
    this.canvas;
    
  }

  /**
   * 
   * @param {boolean} force 
   */
  resize(force = false) {
    // TODO make resize function handle both fullscreen and windowed use cases.
    //const dpr = window.devicePixelRatio || 1;
    const dpr = .8;
    const displayWidth = Math.floor(window.innerWidth * dpr);
    const displayHeight = Math.ceil(window.innerHeight * dpr);
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    	// Check if canvas dimensions have changed
      if (canvasWidth !== displayWidth || canvasHeight !== displayHeight || force) {
        this.canvas.width = displayWidth;
        this.canvas.height = displayHeight;
      
        this.gl.viewport(0, 0, displayWidth, displayHeight);
        this.updateProjMat();
	}

  }

  updateProjMat() {
    this.camera.updateProjMat();
  }
}

//------ Vector math helpers ------

class vec2 {
  constructor(x = 0, y = null) {
    this.x = x;
    this.y = y == null ? x : y;
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
    if (other instanceof vec2) {
      return new vec2(this.x + other.x, this.y + other.y);
    } else if (typeof other == "number") {
      return new vec2(this.x + other, this.y + other);
    }
  }

  subt(other) {
    if (other instanceof vec2) {
      return new vec2(this.x - other.x, this.y - other.y);
    } else if (typeof other == "number") {
      return new vec2(this.x - other, this.y - other);
    }
  }

  mult(other) {
    if (other instanceof vec2) {
      return new vec2(this.x * other.x, this.y * other.y);
    } else if (typeof other == "number") {
      return new vec2(this.x * other, this.y * other);
    }
  }

  div(other) {
    if (other instanceof vec2) {
      return new vec2(this.x / other.x, this.y / other.y);
    } else if (typeof other == "number") {
      return new vec2(this.x / other, this.y / other);
    }
  }

  // vector math operations

  length() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  /// Length squared, faster than regular length
  length2() {
    return Math.pow(this.x, 2) + Math.pow(this.y, 2);
  }

  /// Distance from this vector to a given vector
  distanceFrom(other) {
    return Math.sqrt(
      Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2)
    );
  }

  /// Distance from this vector to a given vector
  distanceFrom2(other) {
    return Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2);
  }

  dot(other) {
    return this.x * other.x + this.y * other.y;
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
      this.x * Math.sin(r) + this.y * Math.cos(r)
    );
  }

  rotate_deg(d) {
    // just call rotate_rad with a converted value
    return this.rotate_rad(d * 0.0174533);
  }
}

class vec3 {
  constructor(x = 0, y = null, z = null) {
    this.x = x;
    this.y = y == null ? x : y;
    this.z = z == null ? x : z;
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
    if (other instanceof vec3) {
      return new vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    } else if (typeof other == "number") {
      return new vec3(this.x + other, this.y + other, this.z + other);
    }
  }

  subt(other) {
    if (other instanceof vec3) {
      return new vec3(this.x - other.x, this.y - other.y, this.z - other.z);
    } else if (typeof other == "number") {
      return new vec3(this.x - other, this.y - other, this.z - other);
    }
  }

  mult(other) {
    if (other instanceof vec3) {
      return new vec3(this.x * other.x, this.y * other.y, this.z * other.z);
    } else if (typeof other == "number") {
      return new vec3(this.x * other, this.y * other, this.z * other);
    }
  }

  div(other) {
    if (other instanceof vec3) {
      return new vec3(this.x / other.x, this.y / other.y, this.z / other.z);
    } else if (typeof other == "number") {
      return new vec3(this.x / other, this.y / other, this.z / other);
    }
  }

  // vector math operations

  length() {
    return Math.sqrt(
      Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2)
    );
  }

  /// Length squared, faster than regular length
  length2() {
    return Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2);
  }

  dot(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z;
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
    const axis_norm = axis.normalized;

    // TODO Vec3 rotation math
    return vec3(0, 0, 0);
  }

  /// Rotates the vector around a given axis. This function normalizes the input axis.
  rotate_deg(axis, d) {
    // just call rotate_rad with a converted value
    return this.rotate_rad(axis, d * 0.0174533);
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
    this.set([1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]);
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

  /// makes sure that both vertical and horizontal FOV >= fovDeg
  perspective(width, height, near, far, fovRad) {
    const aspect = width / height;
    let vertFov;


    if (aspect >= 1.0) {
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

  // orthographic projection matrix generator that parodies the perspective one
  ortho(width, height, near, far, orthoSize) {
    const aspect = width / height;

    let halfHeight;
    let halfWidth;

    if (aspect >= 1.0) {
      halfHeight = orthoSize;
      halfWidth = orthoSize * aspect;
    } else {
      halfHeight = orthoSize / aspect;
      halfWidth = orthoSize;
    }

    const left   = -halfWidth;
    const right  =  halfWidth;
    const bottom = -halfHeight;
    const top    =  halfHeight;

    const a = 2 / (right - left);
    const b = 2 / (top - bottom);
    const c = -2 / (far - near);

    const d = -(right + left)   / (right - left);
    const e = -(top + bottom)   / (top - bottom);
    const g = -(far + near)     / (far - near);

    this.set(
      [ a, 0, 0, 0 ],
      [ 0, b, 0, 0 ],
      [ 0, 0, c, 0 ],
      [ d, e, g, 1 ]
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
      [-xAxis.dot(pos), -zAxis.dot(pos), yAxis.dot(pos), 1]
    );
    return this;
  }

  // TODO just make the view matrix from the node3D position

  /**
   * 
   * @param {vec3} vec 
   * @returns {vec3}
   */
  transformPoint(vec) {
  const x = vec.x, y = vec.y, z = vec.z;

  const x2 = this.r0[0] * x + this.r0[1] * y + this.r0[2] * z + this.r0[3];
  const y2 = this.r1[0] * x + this.r1[1] * y + this.r1[2] * z + this.r1[3];
  const z2 = this.r2[0] * x + this.r2[1] * y + this.r2[2] * z + this.r2[3];
  const w  = this.r3[0] * x + this.r3[1] * y + this.r3[2] * z + this.r3[3];

  if (w !== 0 && w !== 1) {
    return new vec3(x2 / w, y2 / w, z2 / w);
  } else {
    return new vec3(x2, y2, z2);
  }
}
}

// TODO position-direction view matrix for first-person stuff

//------ General math helpers ------

function mapRange(value, oldMin, oldMax, newMin, newMax) {
  return ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
}

function d2r(deg) {
  return (deg * Math.PI) / 180;
}
