#version 300 es
precision highp float;

in vec3 a_position;
in vec3 a_normal;
in vec2 a_uv;
in vec3 a_color;

out mat4 g_view;
out mat4 g_projection;

out vec3 v_normal;
out vec3 v_position;
out vec3 v_color;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
    // rotate and scale vert normals according to model matrix, but no transformation
    // TODO add scaling to vert normals
    // matrix math for that should be done once on the cpu instead of millions of times on the GPU
    mat3 normaMat = mat3(u_model);
    v_normal = normalize(normaMat * a_normal);

    // apply model matrix to vert positions that get sent to the fragment shader
    vec4 newPos = u_model * vec4(a_position, 1.0);
    v_position = vec3(newPos.x, newPos.y, newPos.z);

    v_color = a_color;
    g_view = u_view;
    g_projection = u_projection;

    gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
    //gl_Position = u_model * vec4(a_position, 1.0);
}
