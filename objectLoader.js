function loadObjFile(objPath) {
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
                vertices.push([x, y, z]);
            }
        }
        return vertices;
    } else {
        throw new Error(`Failed to load OBJ file: ${xhr.status}`);
    }
}
