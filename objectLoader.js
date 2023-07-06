function loadObjVertices(objPath) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', objPath, false);
    xhr.send();

    if (xhr.status === 200) {
        const vertices = [];
        const lines = xhr.responseText.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const parts = lines[i].trim().split(' ');
            if (parts[0] === 'v') {
                const x = parseFloat(parts[1]);
                const y = parseFloat(parts[2]);
                const z = parseFloat(parts[3]);
                vertices.push(x);
                vertices.push(y);
                vertices.push(z);
            }
        }
        return vertices;
    } else {
        throw new Error(`Failed to load OBJ file: ${xhr.status}`);
    }
}
function loadObjIndices(objPath) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", objPath, false);
    xhr.send();

    if (xhr.status === 200) {
        const indices = [];
        const lines = xhr.responseText.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const parts = lines[i].trim().split(" ");
            if (parts[0] === "f"){
                for (let j = 1; j < parts.length; j++) {
                const vertexData = parts[j].split("/");
                const vertexIndex = parseInt(vertexData[0]) - 1; // OBJ indices start at 1
                indices.push(vertexIndex);
            }
            }
        }
        return indices;
    } else {
        throw new Error("Failed to load OBJ file: ${xhr.status}");
    }
}
function loadObjNormals(objPath) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", objPath, false);
    xhr.send();

    if (xhr.status === 200) {
        const normals = [];
        const lines = xhr.responseText.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const parts = lines[i].trim().split(" ");
            if (parts[0] === "vn") {
                const normalData = parts.slice(1).map(parseFloat);
                normals.push(...normalData);
            }
        }
        return normals;
    } else {
        throw new Error("Failed to load OBJ file: ${xhr.status}");
    }
}