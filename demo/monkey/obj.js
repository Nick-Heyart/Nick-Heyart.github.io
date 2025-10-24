// OBJ file loader, written by Nick Heyart

// an OBJ can contain multiple meshes
class OBJ {
    constructor() {
        this.meshes = [];
    }
}

class Mesh {
    constructor(name = "") {
        this.name = name;

        // verticies store the 3D coordinates of the points
        this.verts = [];

        // verts with colors just have the color values appended to the positions
        // I think it makes sense to store them separately
        // indices are the same as verts so they don't need to be stored separately
        this.colors = [];

        // normals are unit vectors that store the orientation of a face
        this.normals = [];

        // UVs are 2D coordinates that correspond to a texture image
        // TODO find out if Blender can export OBJs with multiple UVs per vert
        this.UVs = [];

        // A face can have anywhere between 3 and infinite points.
        // It is important to distinguish between points and verticies:
        // - verts hold 3D coordinates
        // - points hold indexes of verts, normals, UVs, etc

        // Faces do not share points; they may have points that reference the same infomration.
        // Faces with a common edge will have 2+ points that refrence the same vertex.
        // Points may reference any additional per-vertex info, such as color or UV2.
        // Every point in a face should use the same normal, unless there is smooth shading.
        // Smooth shading should just work with this but I'm not bothering to test it.
        this.faces = [];
    }

    collapseVerts() {
        //TODO process the parsed OBJ data into something that can get beamed to the GPU
    }
}

class Face {
    constructor() {
        this.points = [];
    }
}

class Point {
    constructor(vert, normal, UV) {
        // these should just be ints corresponding to the index of the data in its respective array. 
        // OBJs start counting at 1 for some reason; this should be the actual array index that counts from 0.
        this.vert = vert;
        this.normal = normal;
        this.UV = UV;
    }
}

function parseOBJ(text) {
    // use regex to split the text into individual lines
    const lines = text.split(/\r?\n/);

    const obj = new OBJ();
    let currentMesh;

    // This part was mostly chatGPT'd
    // I tweaked it to use my vec2/3 classes as well as the usual bugfixes
    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith("#")) continue; // skip comments and empty lines

        // split the lines with regex
        const parts = line.split(/\s+/);
        const flag = parts[0];
        const args = parts.slice(1);

        switch (flag) {
            case "o":
            case "g": {
                // Start new mesh
                currentMesh = new Mesh(args[0] || "unnamed");
                obj.meshes.push(currentMesh);
                break;
            }

            case "v": {
                // vertex position
                const [x, y, z, r, g, b] = args.map(Number)
                const vert = new vec3(x, y, z);
                const color = new vec3(r, g, b);
                currentMesh.verts.push(vert);
                currentMesh.colors.push(color);
                break;
            }

            case "vn": {
                // vertex normal
                const [x, y, z] = args.map(Number)
                const normal = new vec3(x, y, z);
                currentMesh.normals.push(normal);
                break;
            }

            case "vt": {
                // texture coordinate (can have 2 - 3 components)
                const [u, v] = args.map(Number);
                const uv = new vec2(u, v);
                currentMesh.UVs.push(uv);
                break;
            }

            case "f": {
                // face: groups of vertex/uv/normal indices like "v/vt/vn"
                const face = new Face();
                for (let token of args) {
                    // note the subtract by one
                    const [v, vt, vn] = token.split("/").map(x => x ? parseInt(x, 10) - 1 : null);
                    face.points.push(new Point(v, vn, vt));
                }
                currentMesh.faces.push(face);
                break;
            }

            default:
                // ignore other flags like 's', 'usemtl', 'mtllib', comments, etc
                break;
        }
    }

    return obj;
    
}

// Function to turn the OBJ into a VAO
// Made references to the code in this guide: https://webgl2fundamentals.org/webgl/lessons/webgl-3d-perspective.html
// Occasionally consulted (but never copied from) ChatGPT
// God I should have used typescript
/**
 * @param {WebGL2RenderingContext} gl
 * @param {WebGLProgram} program
 * @param {Mesh} mesh
 */
function staticOBJMesh(gl, program, mesh) {
    // make a new VAO
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // buffer positions
    const posBuffer = gl.createBuffer();
    const positions = new Float32Array(mesh.verts.flatMap(v => [v.x, v.y, v.z]));
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_position");
    // shader inputs get optimized out sometimes (e.g. you haven't implemented them yet)
    if (posLoc != -1) {
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
    }

    // buffer normals
    // technically OBJs don't have to have face normals, but anything exported from blender should have them
    const normBuffer = gl.createBuffer();
    const normals = new Float32Array(mesh.normals.flatMap(n => [n.x, n.y, n.z]));
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STREAM_DRAW);

    const normLoc = gl.getAttribLocation(program, "a_normal");
    if (normLoc != -1) {
        gl.enableVertexAttribArray(normLoc);
        gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 0, 0);
    }

    // buffer UVs
    // not sure if I'll use UVs in this lab yet
    // anything exported from blender should have one or more UV
    const UVBuffer = gl.createBuffer();
    const UVs = new Float32Array(mesh.UVs.flatMap(uv => [uv.x, uv.y]));
    gl.bindBuffer(gl.ARRAY_BUFFER, UVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, UVs, gl.STREAM_DRAW);

    const UVLoc = gl.getAttribLocation(program, "a_uv");
    if (UVLoc != -1) {
        gl.enableVertexAttribArray(UVLoc);
        gl.vertexAttribPointer(UVLoc, 2, gl.FLOAT, false, 0, 0);
    }

    // buffer colors
    const ColBuffer = gl.createBuffer();
    const colors = new Float32Array(mesh.colors.flatMap(c => [c.x, c.y, c.z]));
    gl.bindBuffer(gl.ARRAY_BUFFER, ColBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STREAM_DRAW);

    const colorLoc = gl.getAttribLocation(program, "a_vertColor");
    if (colorLoc != -1) {
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
    }

    // index buffer
    const indexBuffer = gl.createBuffer();
    const indices = [];

    // triangle fan-ify the faces since they can have more than 3 points
    // this breaks on concave faces but it's really simple so I don't care
    for (const face of mesh.faces) {
        for (let i = 1; i < face.points.length - 1; i++) {
            indices.push(
                face.points[0].vert,
                face.points[i].vert,
                face.points[i + 1].vert
            );
        }
    }
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STREAM_DRAW);

    return {vao, count: indices.length};
}