//
// global vars
//
var canvas; // canvas that is displayed on the webpage
//vertex shader
var skyBoxVertShaderText = "";

//fragment shader
var skyBoxFragShaderText = "";
// functions
async function getShaderSourceCode(url) {
  let response = await fetch(url);
  sourceCode = await response.text();
  return sourceCode;
}

async function createAndCompileShaderProg(
  webGLContext,
  vertShaderCode,
  fragShaderCode
) {
  //create shader program vars
  var program = webGLContext.createProgram();
  var vertShader = webGLContext.createShader(webGLContext.VERTEX_SHADER);
  var fragShader = webGLContext.createShader(webGLContext.FRAGMENT_SHADER);

  // set our shader source code
  webGLContext.shaderSource(vertShader, vertShaderCode);
  webGLContext.shaderSource(fragShader, fragShaderCode);

  //compile the shader
  webGLContext.compileShader(vertShader);
  if (
    !webGLContext.getShaderParameter(vertShader, webGLContext.COMPILE_STATUS)
  ) {
    console.error(
      "ERROR: compiling vertex shader",
      webGLContext.getShaderInfoLog(vertShader)
    );
    return;
  }
  webGLContext.compileShader(fragShader);
  if (
    !webGLContext.getShaderParameter(fragShader, webGLContext.COMPILE_STATUS)
  ) {
    console.error(
      "ERROR: compiling fragment shader",
      webGLContext.getShaderInfoLog(fragShader)
    );
    return;
  }

  webGLContext.attachShader(program, vertShader);
  webGLContext.attachShader(program, fragShader);
  webGLContext.linkProgram(program);
  if (!webGLContext.getProgramParameter(program, webGLContext.LINK_STATUS)) {
    console.log(
      "ERROR linking program",
      webGLContext.getProgramInfoLog(program)
    );
    return;
  }
  webGLContext.validateProgram(program);
  if (
    !webGLContext.getProgramParameter(program, webGLContext.VALIDATE_STATUS)
  ) {
    console.log(
      "ERROR validating program",
      webGLContext.getProgramInfoLog(program)
    );
    return;
  }

  return program;
}

function getWebGLContext(canvasID) {
  canvas = document.getElementById(canvasID);
  var webGLContext = canvas.getContext("webgl");
  return webGLContext;
}

function setWebGLSettings(
  webGLContext,
  backgroundColor,
  frontFaceOrientation,
  cuttedFaces,
  setEnabled
) {
  //set background
  webGLContext.clearColor(
    backgroundColor[0],
    backgroundColor[1],
    backgroundColor[2],
    backgroundColor[3]
  );
  webGLContext.clear(
    webGLContext.COLOR_BUFFER_BIT | webGLContext.DEPTH_BUFFER_BIT
  );

  //set face orientation
  webGLContext.frontFace(frontFaceOrientation);
  webGLContext.cullFace(cuttedFaces);

  //enable chosen capabilities
  setEnabled.forEach((element) => {
    webGLContext.enable(element);
  });
}

function createSkyBoxVBO(webGLContext) {
  //TODO: hier weiter machen
}

function createSkyBoxTexture(
  webGLContext,
  topimageid,
  bottomimageid,
  frontimageid,
  backimageid,
  leftimageid,
  rightimageid
) {
  var boxTexture = webGLContext.createTexture();
  webGLContext.bindTexture(webGLContext.TEXTURE_CUBE_MAP, boxTexture);
  // getting the skybox images from the html document
  const skyBoxFaces = [
    {
      target: webGLContext.TEXTURE_CUBE_MAP_POSITIVE_X,
      image: document.getElementById(rightimageid),
    },
    {
      target: webGLContext.TEXTURE_CUBE_MAP_NEGATIVE_X,
      image: document.getElementById(leftimageid),
    },
    {
      target: webGLContext.TEXTURE_CUBE_MAP_POSITIVE_Y,
      image: document.getElementById(topimageid),
    },
    {
      target: webGLContext.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      image: document.getElementById(bottomimageid),
    },
    {
      target: webGLContext.TEXTURE_CUBE_MAP_POSITIVE_Z,
      image: document.getElementById(frontimageid),
    },
    {
      target: webGLContext.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      image: document.getElementById(backimageid),
    },
  ];
  skyBoxFaces.forEach((face) => {
    const { target, image } = face;
    webGLContext.texImage2D(
      target,
      0, //level of detail
      webGLContext.RGBA,
      webGLContext.RGBA,
      webGLContext.UNSIGNED_BYTE,
      image
    );
  });
  webGLContext.generateMipmap(webGLContext.TEXTURE_CUBE_MAP);
  webGLContext.texParameteri(
    webGLContext.TEXTURE_CUBE_MAP,
    webGLContext.TEXTURE_MIN_FILTER,
    webGLContext.LINEAR_MIPMAP_LINEAR
  );

  webGLContext.bindTexture(webGLContext.TEXTURE_CUBE_MAP, null); //unbind text mem
  return boxTexture;
}

//#region WebGL Program
var InitDemo = async function () {
  //getting shader src
  skyBoxFragShaderText = await getShaderSourceCode("skyBoxFragShader.glsl");
  skyBoxVertShaderText = await getShaderSourceCode("skyBoxVertShader.glsl");

  var gl = getWebGLContext("game-surface"); // get the context webgl context from canvas

  //initialize webgl
  setWebGLSettings(gl, [0.8, 0.8, 0.8, 1.0], gl.CCW, gl.FRONT, [
    gl.DEPTH_TEST,
    gl.CULL_FACE,
  ]);

  gl.disable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  var skyBoxShaderProgram = await createAndCompileShaderProg(
    gl,
    skyBoxVertShaderText,
    skyBoxFragShaderText
  );
  gl.useProgram(skyBoxShaderProgram);

  //create a buffer
  //create vertices write counterclockwise
  var skyboxVerts = [
    // X, Y, Z, w
    // Top
    -1.0, 1.0, -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
    -1.0, 1.0,

    // Left
    -1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0,
    -1.0, 1.0,

    // Right
    1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0,
    -1.0, 1.0,

    // Front
    1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
    1.0, 1.0,

    // Back
    1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0,
    -1.0, 1.0,

    // Bottom
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, -1.0,
    -1.0, 1.0,
  ];

  var boxVertices = [
    // X, Y, Z           R, G, B, A
    // Top
    -1.0, 1.0, -1.0, 0.5, 0.5, 0.5, 1.0, -1.0, 1.0, 1.0, 0.5, 0.5, 0.5, 1.0,
    1.0, 1.0, 1.0, 0.5, 0.5, 0.5, 1.0, 1.0, 1.0, -1.0, 0.5, 0.5, 0.5, 1.0,

    // Left
    -1.0, 1.0, 1.0, 0.75, 0.25, 0.5, 1.0, -1.0, -1.0, 1.0, 0.75, 0.25, 0.5, 1.0,
    -1.0, -1.0, -1.0, 0.75, 0.25, 0.5, 1.0, -1.0, 1.0, -1.0, 0.75, 0.25, 0.5,
    1.0,

    // Right
    1.0, 1.0, 1.0, 0.25, 0.25, 0.75, 1.0, 1.0, -1.0, 1.0, 0.25, 0.25, 0.75, 1.0,
    1.0, -1.0, -1.0, 0.25, 0.25, 0.75, 1.0, 1.0, 1.0, -1.0, 0.25, 0.25, 0.75,
    1.0,

    // Front
    1.0, 1.0, 1.0, 1.0, 0.0, 0.15, 1.0, 1.0, -1.0, 1.0, 1.0, 0.0, 0.15, 1.0,
    -1.0, -1.0, 1.0, 1.0, 0.0, 0.15, 1.0, -1.0, 1.0, 1.0, 1.0, 0.0, 0.15, 1.0,

    // Back
    1.0, 1.0, -1.0, 0.0, 1.0, 0.15, 1.0, 1.0, -1.0, -1.0, 0.0, 1.0, 0.15, 1.0,
    -1.0, -1.0, -1.0, 0.0, 1.0, 0.15, 1.0, -1.0, 1.0, -1.0, 0.0, 1.0, 0.15, 1.0,

    // Bottom
    -1.0, -1.0, -1.0, 0.5, 0.5, 1.0, 1.0, -1.0, -1.0, 1.0, 0.5, 0.5, 1.0, 1.0,
    1.0, -1.0, 1.0, 0.5, 0.5, 1.0, 1.0, 1.0, -1.0, -1.0, 0.5, 0.5, 1.0, 1.0,
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

  //------------------------------------------------
  //
  // Buffer
  //
  //------------------------------------------------

  //vbo skybox
  var skyboxVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVertexBufferObject); //bind the buffer
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(skyboxVerts), //need to specify the type for the shader since js does not require us to
    gl.STATIC_DRAW
  );

  //index buffer object
  var skyboxIndexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxIndexBufferObject);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(boxIndices),
    gl.STATIC_DRAW
  );

  // position attribute allocation

  var positionAttribLocation = gl.getAttribLocation(
    skyBoxShaderProgram,
    "vertPosition"
  );
  //var texCoordAttribLocation = gl.getAttribLocation(program, "vertTexCoord");
  gl.vertexAttribPointer(
    positionAttribLocation, //Attribute Location
    4, // number of elements per attribute
    gl.FLOAT, //type of elements
    gl.FALSE, //if data is normalized
    4 * Float32Array.BYTES_PER_ELEMENT, //Size of an individual vertex
    0 //offset from the beginning of a single vertex to out attribute
  );
  gl.enableVertexAttribArray(positionAttribLocation);

  //color attribute allocation
  //gl.vertexAttribPointer(
  //texCoordAttribLocation, //Attribute Location
  //2, // number of elements per attribute
  //gl.FLOAT, //type of elements
  //gl.FALSE, //if data is normalized
  //5 * Float32Array.BYTES_PER_ELEMENT, //Size of an individual vertex
  //3 * Float32Array.BYTES_PER_ELEMENT //offset from the beginning of a single vertex to out attribute
  //);
  //gl.enableVertexAttribArray(texCoordAttribLocation);

  //unbinding Buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, null); //unbind array buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); //unbind ibo

  //gl.vertexAttribPointer(
  //colorAttribLocation, //Attribute Location
  //3, // number of elements per attribute
  //gl.FLOAT, //type of elements
  //gl.FALSE, //if data is normalized
  //7 * Float32Array.BYTES_PER_ELEMENT, //Size of an individual vertex
  //3 * Float32Array.BYTES_PER_ELEMENT //offset from the beginning of a single vertex to out attribute
  //);
  //gl.enableVertexAttribArray(colorAttribLocation);

  var boxTexture = createSkyBoxTexture(
    gl,
    "top_view",
    "bottom_view",
    "front_view",
    "back_view",
    "left_view",
    "right_view"
  );
  //#region Matrices
  // get the transfrom matrices location from vertex shader
  var matWorldUniformLocation = gl.getUniformLocation(
    skyBoxShaderProgram,
    "mWorld"
  );
  var matViewUniformLocation = gl.getUniformLocation(
    skyBoxShaderProgram,
    "mView"
  );
  var matProjUniformLocation = gl.getUniformLocation(
    skyBoxShaderProgram,
    "mProj"
  );

  //create transform matrices
  var worldMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  var projMatrix = new Float32Array(16);

  glMatrix.mat4.identity(worldMatrix);
  //TODO(Konrad): Look at und perspective func selber einbinden
  glMatrix.mat4.lookAt(viewMatrix, [0, 0, -5], [0, 0, 0], [0, 1, 0]);
  glMatrix.mat4.perspective(
    projMatrix,
    Math.PI / 4,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000.0
  );

  //send matrices data to vertex shader
  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
  //#endregion

  //
  //
  //main
  //
  //

  //prepration for render loop
  var angle = 0; // allocate mem for angle (needed in loop)

  //create identity matrix
  var identityMatrix = new Float32Array(16);
  identity(identityMatrix);

  //TODO: Konrad tries stuff!

  gl.disable(gl.CULL_FACE);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Enable depth testing
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  //scale the skybox
  let scaleVal = 30;
  scale(worldMatrix, [scaleVal, scaleVal, scaleVal]);
  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

  //main render loop
  function loop() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
    //TODO: move camera around the cube.
    rotate(viewMatrix, identityMatrix, angle / 4, [0, 1, 0]);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    rotate(worldMatrix, identityMatrix, angle, [1, 1, 0]);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
};
