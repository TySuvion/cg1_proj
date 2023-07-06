var vertexShaderTransparent = "";
var fragmentShaderTransparent = "";


//#endregion

//#region WebGL Program
var InitDemoK = async function() {
    vertexShaderTransparent = await getShaderSourceCode("shaders/vertexShader.glsl");
    fragmentShaderTransparent = await getShaderSourceCode("shaders/fragmentShaderTransparent.glsl")
    vertexShaderNormals = await getShaderSourceCode("shaders/vertexShaderNormals.glsl");
    fragmentShaderNormals = await getShaderSourceCode("shaders/fragmentShaderNormals.glsl")
    //#region Getting Context
    var canvas = document.getElementById("game-surface"); // get the canvas object from the html doc
    var gl = canvas.getContext("webgl"); // get the context webgl context from canvas
    //#endregion


    //#region Init WebGL
    //initialize webgl
    gl.clearColor(0.5, 0.5, 0.5, 1.0); //setting background color (R,G,B,A)
    //out is not actually doing the painting just choosing the paint
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // do the actual painting of the background, by clearing the color buffer
    gl.enable(gl.DEPTH_TEST); // activate the z-buffer algorithm
    gl.enable(gl.CULL_FACE); //enable backface culling
    gl.frontFace(gl.CCW); // front facing primitves are drawn counter clock wise
    gl.cullFace(gl.BACK); // cut away the back faces.
    //#endregion

    //#region Create and Compile Shader Program
    //create shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    // set our shader source code
    gl.shaderSource(vertexShader, vertexShaderTransparent);
    gl.shaderSource(fragmentShader, fragmentShaderTransparent);

    //compile the shader
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error(
            "ERROR: compiling vertex shader",
            gl.getShaderInfoLog(vertexShader)
        );
        return;
    }
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error(
            "ERROR: compiling fragment shader",
            gl.getShaderInfoLog(fragmentShader)
        );
        return;
    }

    //create shaderprogram and attach the shader
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log("ERROR linking program", gl.getProgramInfoLog(program));
        return;
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.log("ERROR validating program", gl.getProgramInfoLog(program));
        return;
    }
    gl.useProgram(program);
    //TODO: createGreenShaderProgram ersetzen und/oder an den Workflow anpassen
    function createGreenShaderProgram(gl) {
        // Vertex shader source code
        const vertexShaderSource = `
   precision mediump float;
   attribute vec3 vertPosition;
   attribute vec3 vertColor;
   varying vec3 fragColor;
   uniform mat4 mWorld;
   uniform mat4 mView;
   uniform mat4 mProj;

void main() {
    fragColor = vertColor;
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}
  `;

        // Fragment shader source code
        const fragmentShaderSource = `
    precision mediump float;

    void main() {
      gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); // Green color
    }
  `;

        // Create vertex shader
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        // Create fragment shader
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        // Create shader program
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        return shaderProgram;
    }

    const greenShaderProgram = createGreenShaderProgram(gl);

    function createShaderProgram(gl, fragmentShaderSource, vertexShaderSource) {
        //load in shaders
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource)
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error("ERROR: compiling vertex shader", gl.getShaderInfoLog(vertexShader));
            return;
        }

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        //create shader program
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.log("ERROR linking program", gl.getProgramInfoLog(shaderProgram));
            return;
        }
        gl.validateProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS)) {
            console.log("ERROR validating program", gl.getProgramInfoLog(shaderProgram));
            return;
        }
        return shaderProgram;
    }

    var normalsShaderProgram = createShaderProgram(
        gl,
        fragmentShaderNormals,
        vertexShaderNormals
    )

    //#endregion

    //#region Buffer
    //#region Buffer Data
    //create a buffer
    //create vertices write counterclockwise
    var boxVertices = [
        // X, Y, Z           R, G, B, A
        // Top
        -1.0, 1.0, -1.0, 0.5, 0.5, 0.5, 1.0,
        -1.0, 1.0, 1.0, 0.5, 0.5, 0.5, 1.0,
        1.0, 1.0, 1.0, 0.5, 0.5, 0.5, 1.0,
        1.0, 1.0, -1.0, 0.5, 0.5, 0.5, 1.0,

        // Left
        -1.0, 1.0, 1.0, 0.75, 0.25, 0.5, 1.0,
        -1.0, -1.0, 1.0, 0.75, 0.25, 0.5, 1.0,
        -1.0, -1.0, -1.0, 0.75, 0.25, 0.5, 1.0,
        -1.0, 1.0, -1.0, 0.75, 0.25, 0.5, 1.0,

        // Right
        1.0, 1.0, 1.0, 0.25, 0.25, 0.75, 1.0,
        1.0, -1.0, 1.0, 0.25, 0.25, 0.75, 1.0,
        1.0, -1.0, -1.0, 0.25, 0.25, 0.75, 1.0,
        1.0, 1.0, -1.0, 0.25, 0.25, 0.75, 1.0,

        // Front
        1.0, 1.0, 1.0, 1.0, 0.0, 0.15, 1.0,
        1.0, -1.0, 1.0, 1.0, 0.0, 0.15, 1.0,
        -1.0, -1.0, 1.0, 1.0, 0.0, 0.15, 1.0,
        -1.0, 1.0, 1.0, 1.0, 0.0, 0.15, 1.0,

        // Back
        1.0, 1.0, -1.0, 0.0, 1.0, 0.15, 1.0,
        1.0, -1.0, -1.0, 0.0, 1.0, 0.15, 1.0,
        -1.0, -1.0, -1.0, 0.0, 1.0, 0.15, 1.0,
        -1.0, 1.0, -1.0, 0.0, 1.0, 0.15, 1.0,

        // Bottom
        -1.0, -1.0, -1.0, 0.5, 0.5, 1.0, 1.0,
        -1.0, -1.0, 1.0, 0.5, 0.5, 1.0, 1.0,
        1.0, -1.0, 1.0, 0.5, 0.5, 1.0, 1.0,
        1.0, -1.0, -1.0, 0.5, 0.5, 1.0, 1.0,
    ];

    var boxIndices = [
        // Top
        0, 1, 2, 0, 2, 3,

        // Left
        4, 5, 6, 4, 6, 7,

        // Right
        8, 9, 10, 8, 10, 11,

        // Front
        12, 13, 14, 12, 14, 15,

        // Back
        16, 17, 18, 16, 18, 19,

        // Bottom
        20, 21, 22, 20, 22, 23,
    ];

    var utahVertices = loadObjVertices("teapot.obj");
    var utahIndices = loadObjIndices("teapot.obj");
    var utahNormals = loadObjNormals("teapot.obj");
    console.log(utahVertices);
    console.log(utahNormals);

    //#endregion
    function bindBoxBuffers(program) {
        // Vertex buffer object
        var boxVertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

        // Index buffer object
        var boxIndexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

        // Attribute locations
        var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
        var colorAttribLocation = gl.getAttribLocation(program, "vertColor");

        // Set up vertex attribute pointers for position
        gl.vertexAttribPointer(
            positionAttribLocation,
            3,
            gl.FLOAT,
            gl.FALSE,
            7 * Float32Array.BYTES_PER_ELEMENT,
            0
        );
        gl.enableVertexAttribArray(positionAttribLocation);

        // Set up vertex attribute pointers for color
        gl.vertexAttribPointer(
            colorAttribLocation,
            3,
            gl.FLOAT,
            gl.FALSE,
            7 * Float32Array.BYTES_PER_ELEMENT,
            3 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(colorAttribLocation);
    }

    function bindUtahBuffer(program) {
        // Create vertex buffer object
        var vertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(utahVertices), gl.STATIC_DRAW);
        //create index buffer object
        var indexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(utahIndices),gl.STATIC_DRAW);

        // Attribute location
        var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");

        // Set up vertex attribute pointer for position
        gl.vertexAttribPointer(
            positionAttribLocation,
            3,
            gl.FLOAT,
            gl.FALSE,
            0,
            0
        );
        gl.enableVertexAttribArray(positionAttribLocation);
    }
    function bindBuffersNormal(program){
        let vertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(utahVertices), gl.STATIC_DRAW);

        let indexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(utahIndices), gl.STATIC_DRAW);

        //Attrib Location
        let positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
        let normalAttribLocation = gl.getAttribLocation(program, "vertNormal");
        gl.vertexAttribPointer(
            positionAttribLocation,
            3,
            gl.FLOAT,
            gl.FALSE,
            0,
            0
        );
        gl.enableVertexAttribArray(positionAttribLocation);

        var normalBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(utahNormals), gl.STATIC_DRAW);

        gl.vertexAttribPointer(
            normalAttribLocation,
            3,
            gl.FLOAT,
            gl.FALSE,
            0,
            0
        );
        gl.enableVertexAttribArray(normalAttribLocation);

    }

    function uniformUtah(){
        gl.uniformMatrix4fv(matWorldUniformLocationGreen, gl.FALSE, worldMatrix2);
        gl.uniformMatrix4fv(matViewUniformLocationGreen, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(matProjUniformLocationGreen, gl.FALSE, projMatrix);
    };
    function uniformBox(){
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
    }

    //#region Matrices
    // get the transfrom matrices location from vertex shader
    var matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
    var matViewUniformLocation = gl.getUniformLocation(program, "mView");
    var matProjUniformLocation = gl.getUniformLocation(program, "mProj");

    var matWorldUniformLocationGreen = gl.getUniformLocation(greenShaderProgram, "mWorld");
    var matViewUniformLocationGreen = gl.getUniformLocation(greenShaderProgram, "mView");
    var matProjUniformLocationGreen = gl.getUniformLocation(greenShaderProgram, "mProj");

    var matWorldUniformLocationNormals = gl.getUniformLocation(normalsShaderProgram, "mWorld");
    var matViewUniformLocationNormals = gl.getUniformLocation(normalsShaderProgram, "mView");
    var matProjUniformLocationNormals = gl.getUniformLocation(normalsShaderProgram, "mProj");


    function uniformUtahNormals(){
        gl.uniformMatrix4fv(matWorldUniformLocationNormals, gl.FALSE, worldMatrix2);
        gl.uniformMatrix4fv(matViewUniformLocationNormals, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(matProjUniformLocationNormals, gl.FALSE, projMatrix);

        const objectColor = [1.0, 0.0, 0.0];
        var materialColorUniformLocation = gl.getUniformLocation(normalsShaderProgram, "materialColor");
        gl.uniform3fv(materialColorUniformLocation, objectColor);
    }

    //create transform matrices
    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);

    glMatrix.mat4.identity(worldMatrix);
    //TODO(Konrad): Look at und perspective func selber einbinden
    glMatrix.mat4.lookAt(viewMatrix, [0, 0, -10], [0, 0, 0], [0, 1, 0]);
    glMatrix.mat4.perspective(
        projMatrix,
        Math.PI / 4,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000.0
    );

    //#endregion

    // preperation for main render loop
    var angle = 0; // allocate mem for angle (needed in loop)

    //create identity matrix
    var identityMatrix = new Float32Array(16);
    identity(identityMatrix);

    var worldMatrix2 = new Float32Array(16);
    identity(worldMatrix2);
    translate(worldMatrix2,[0, 0, 0]);
    rotate(worldMatrix2, identityMatrix, Math.PI/1.5, [0,1,0]);
    scale(worldMatrix2, [0.2, .2, .2]);

// preload
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    //main render loop
    function loop() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
        //animation setup
        scale(worldMatrix, [1, 1, 1]);
       // gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        rotate(worldMatrix, identityMatrix, angle, [0, 1, 1]);
        //Teapot
       bindBuffersNormal(normalsShaderProgram);
        gl.useProgram(normalsShaderProgram);
       uniformUtahNormals();
        gl.drawElements(gl.TRIANGLES, utahIndices.length, gl.UNSIGNED_SHORT,0);
        //first cube
        bindBoxBuffers(program);
        gl.useProgram(program);
        uniformBox();
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
};