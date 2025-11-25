#version 300 es
precision highp float;

#define MAX_LIGHTS 8

uniform vec2 u_resolution; //TODO NOT PASSED
uniform vec3 u_camPosition;
uniform int u_camOrtho;

uniform vec3 u_ambient;
uniform int u_lightCount;
uniform vec3 u_lightPositions[MAX_LIGHTS];
uniform vec3 u_lightColors[MAX_LIGHTS];
uniform float u_lightIntensities[MAX_LIGHTS];

// True if directional, false if point.
// Position becomes a direction vector for directional lights.
uniform bool u_lightTypes[MAX_LIGHTS];

// spot lights, if I ever implement them, will be handled separately. 

// x is rough, y is specular, z doesn't do anything yet
uniform vec3 u_matProperties;

in mat4 g_view;
in mat4 g_projection;

in vec3 v_normal;
in vec3 v_position;
in vec3 v_color;

out vec4 outColor;

// gradient noise from Jorge Jimenez's presentation (see slide 123):
// http://www.iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare
float gradientNoise(vec2 screenPos)
{
	return fract(52.9829189 * fract(dot(screenPos, vec2(0.06711056, 0.00583715))));
}

void main() {
  vec3 normal = normalize(v_normal);
  vec3 diffuse = vec3(0.0);
  vec3 specular = vec3(0.0);

  // viewDir gets calculated differently depending on if the camera is orthographic or not
  vec3 viewDir;

  if (u_camOrtho == 1) {
    // TODO hack that only works for head-on camera
    // I need to implement forward vector function into the object class. 
    viewDir = vec3(1, 0, 0);
  } else {
    viewDir = normalize(u_camPosition - v_position);
  }

  // loop through each light, calculate its contribution, then add it to the color
  for (int i = 0; i < u_lightCount; i++) {
    if (u_lightTypes[i]) {
      vec3 lightDir = u_lightPositions[i];
      vec3 viewDir = normalize(u_camPosition - v_position);
      vec3 reflectDir = reflect(-lightDir, normal);
      float normDiff = max(dot(normal, lightDir), 0.0);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), u_matProperties.z);
      vec3 light = (u_lightColors[i] * u_lightIntensities[i] * v_color);

      diffuse += light * normDiff;
      specular += light * spec;

    } else {
      vec3 lightDir = normalize(u_lightPositions[i] - v_position);
      vec3 reflectDir = reflect(-lightDir, normal);
      float normDiff = max(dot(normal, lightDir), 0.0);
      float spec = pow(max(dot(lightDir, reflectDir), 0.0), u_matProperties.z);
      float distance = distance(u_lightPositions[i], v_position);
      vec3 light = (u_lightColors[i] * u_lightIntensities[i] * v_color) / (distance * distance);

      diffuse += light * normDiff;
      specular += light * spec;
    }
  }

  // add terms and ambient light
  vec3 color = (diffuse * u_matProperties.x) + (specular * u_matProperties.y) + u_ambient;

  // apply debanding
  color += (1.0 / 255.0) * gradientNoise(gl_FragCoord.xy) - (0.5 / 255.0);

  outColor = vec4(color, 1.0);
  //outColor = vec4(u_lightColors[0], 1.0);
}