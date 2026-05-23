let cubeMesh = {
    vertices: [
        [0.5, 0.5, 0.5],
        [0.5, 0.5, -0.5],
        [-0.5, 0.5, -0.5],
        [-0.5, 0.5, 0.5],
        [0.5, -0.5, 0.5],
        [0.5, -0.5, -0.5],
        [-0.5, -0.5, -0.5],
        [-0.5, -0.5, 0.5],
    ],
    edges: [
        [0, 1],
        [0, 3],
        [0, 4],
        [4, 5],
        [4, 7],
        [3, 7],
        [3, 2],
        [6, 7],
        [6, 2],
        [6, 5],
        [5, 1],
        [2, 1],
    ],
};

let shapeObj = [];

let shapeMesh = {};

function preload() {
    shapeObjLines = loadStrings("monke.obj");
}

let cube1 = {
    mesh: cubeMesh,
    position: [0, 0, 5],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
};

let camera = {
    focalLength: 700,
    position: [0, 0, 0],
    rotation: [0, 0],
};

let scene = { objects: [] };

function setup() {
    createCanvas(400, 400);
    angleMode(DEGREES);
    shapeMesh = parseObj(shapeObjLines);
    let shape1 = {
        mesh: shapeMesh,
        position: [0, 0, 5],
        rotation: [0, 0, 0],
        scale: [0.8, 0.8, 0.8],
    };
    console.log(shape1.mesh);
    scene.objects.push(shape1);
}

function draw() {
    scene.objects[0].rotation[1] += 1;
    background(20);
    angleMode(DEGREES);
    for (let o of scene.objects) {
        let modelTransformed = modelTransform(o);
        let cameraTransformed = cameraTransform(modelTransformed, camera);
        let screenProjected = projectToScreen(cameraTransformed, camera);
        drawMesh(screenProjected, o.mesh);
    }
}

function modelTransform(object) {
    let transformedVertices = [];

    let cx = cos(object.rotation[0]);
    let sx = sin(object.rotation[0]);

    let cy = cos(object.rotation[1]);
    let sy = sin(object.rotation[1]);

    let cz = cos(object.rotation[2]);
    let sz = sin(object.rotation[2]);

    for (let v of object.mesh.vertices) {
        let scaled = [
            v[0] * object.scale[0],
            v[1] * object.scale[1],
            v[2] * object.scale[2],
        ];

        let Xrotated = [
            scaled[0],
            scaled[1] * cx - scaled[2] * sx,
            scaled[1] * sx + scaled[2] * cx,
        ];
        let Yrotated = [
            Xrotated[0] * cy + Xrotated[2] * sy,
            Xrotated[1],
            -Xrotated[0] * sy + Xrotated[2] * cy,
        ];
        let Zrotated = [
            Yrotated[0] * cz - Yrotated[1] * sz,
            Yrotated[0] * sz + Yrotated[1] * cz,
            Yrotated[2],
        ];

        let transformedVert = [
            Zrotated[0] + object.position[0],
            Zrotated[1] + object.position[1],
            Zrotated[2] + object.position[2],
        ];

        transformedVertices.push(transformedVert);
    }
    return transformedVertices;
}

function cameraTransform(vertices, camera) {
    let transformedVertices = [];

    let cx = cos(-camera.rotation[0]);
    let sx = sin(-camera.rotation[0]);

    let cy = cos(-camera.rotation[1]);
    let sy = sin(-camera.rotation[1]);

    for (let v of vertices) {
        let vertexRelativeToCamera = [
            v[0] - camera.position[0],
            v[1] - camera.position[1],
            v[2] - camera.position[2],
        ];

        let afterYaw = [
            vertexRelativeToCamera[0] * cy + vertexRelativeToCamera[2] * sy,
            vertexRelativeToCamera[1],
            -vertexRelativeToCamera[0] * sy + vertexRelativeToCamera[2] * cy,
        ];

        let afterPitch = [
            afterYaw[0],
            afterYaw[1] * cx - afterYaw[2] * sx,
            afterYaw[1] * sx + afterYaw[2] * cx,
        ];
        transformedVertices.push(afterPitch);
    }
    return transformedVertices;
}

function projectToScreen(vertices, { focalLength }) {
    projectedPoints = [];
    for (let v of vertices) {
        if (v[2] > 0) {
            let projectedpoint = [
                (v[0] / v[2]) * focalLength,
                -(v[1] / v[2]) * focalLength,
            ];
            projectedPoints.push(projectedpoint);
        }
    }
    return projectedPoints;
}

function drawMesh(points, { edges }) {
    push();
    strokeWeight(1);
    stroke(122);
    translate(width / 2, height / 2);
    for (let edge of edges) {
        let start = points[edge[0]];
        let end = points[edge[1]];
        line(start[0], start[1], end[0], end[1]);
    }
    pop();
}

function parseObj(objLines) {
    let vertices = [];
    let edgesSet = new Set();
    for (let line of objLines) {
        if (line.split(" ")[0] == "v") {
            vertices.push([
                line.split(" ")[1],
                line.split(" ")[2],
                line.split(" ")[3],
            ]);
        } else if (line.split(" ")[0] == "f") {
            let spaceSplit = line.split(" ");
            for (let i = 1; i < spaceSplit.length; i++) {
                if (i != spaceSplit.length - 1) {
                    edgesSet.add(
                        [
                            spaceSplit[i].split("/")[0] - 1,
                            spaceSplit[i + 1].split("/")[0] - 1,
                        ].sort(),
                    );
                } else {
                    edgesSet.add(
                        [
                            spaceSplit[i].split("/")[0] - 1,
                            spaceSplit[1].split("/")[0] - 1,
                        ].sort(),
                    );
                }
            }
        } else if (line.split(" ")[0] == "l") {
            let spaceSplit = line.split(" ");
            for (let i = 1; i < spaceSplit.length - 1; i++) {
                edgesSet.add(
                    [line.split(" ")[i] - 1, line.split(" ")[i + 1] - 1].sort(),
                );
            }
        }
    }
    edges = [...edgesSet];
    return {
        vertices: vertices,
        edges: edges,
    };
}
