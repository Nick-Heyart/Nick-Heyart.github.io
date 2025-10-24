#version 300 es

// get vertex position and canvas resolution
in vec4 a_position;
uniform float u_aspect;
uniform vec3 u_trans;

// scale y-coordinate to correct for canvas aspect ratio
vec4 fitAspect(vec4 relative) {
  return vec4(
    relative.x,
    relative.y * u_aspect,
    relative.z,
    relative.w
  );
}

vec4 rotate(vec4 pos, float rot) {
	// TODO all of this should be matrix operations
	return vec4(
    pos.x * cos(rot) - pos.y * sin(rot),
		pos.x * sin(rot) + pos.y * cos(rot),
		pos.z,
		pos.w
  );
}

// apply transformation
void main() {
	vec4 corrected = rotate(a_position, u_trans.z);
  corrected = fitAspect(corrected);

  gl_Position = vec4(
    corrected.x + u_trans.x,
    corrected.y + u_trans.y * u_aspect,
    corrected.z, corrected.w
  );
}