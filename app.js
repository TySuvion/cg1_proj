//------------------------------------------------
//
// main init webGL porgram
//
//------------------------------------------------
var InitDemo = async function () {
  setUpButtonControls();

  var gl = getWebGLContext("game-surface"); // get the context webgl context from canvas

  //initialize webgl
  setWebGLSettings(gl, [0.8, 0.8, 0.8, 1.0], gl.CCW, gl.FRONT, [gl.DEPTH_TEST]);

  //-------------------------------------------------------------------------
  // SHADER
  //-------------------------------------------------------------------------

  //getting shader src
  vertShaderText = await getShaderSourceCode("shaders/vertexShader.glsl");

  skyBoxFragShaderText = await getShaderSourceCode(
    "shaders/skyBoxFragShader.glsl"
  );
  skyBoxVertShaderText = await getShaderSourceCode(
    "shaders/skyBoxVertShader.glsl"
  );
  fragShaderTransparent = await getShaderSourceCode(
    "shaders/fragmentShaderTransparent.glsl"
  );
  vertShaderTeapotText = await getShaderSourceCode(
    "shaders/vertexShaderNormals.glsl"
  );
  fragShaderTeapotText = await getShaderSourceCode(
    "shaders/fragmentShaderNormals.glsl"
  );

  //creating and compiling the shader programs
  var teapotShaderProgram = await createAndCompileShaderProg(
    gl,
    vertShaderTeapotText,
    fragShaderTeapotText
  );

  var transparentShaderProgram = await createAndCompileShaderProg(
    gl,
    vertShaderText,
    fragShaderTransparent
  );

  var skyBoxShaderProgram = await createAndCompileShaderProg(
    gl,
    skyBoxVertShaderText,
    skyBoxFragShaderText
  );
  gl.useProgram(skyBoxShaderProgram);

  //-------------------------------------------------------------------------
  // BUFFER
  //-------------------------------------------------------------------------
  //create skybox vbo
  var skyboxVBO = createVBO(gl, skyboxVerts);
  //create general cube ibo
  var cubeIBO = createIBO(gl, boxIndices);
  //transparent Cube VBO
  var transCubeVBO = createVBO(gl, boxVertices);
  //teapotvbo
  var teapotVBO = createVBO(gl, utahVertices);
  //teapot normals vbo
  var teapotVBOnormals = createVBO(gl, utahNormals);
  //teapot ibo
  var teapotIBO = createIBO(gl, utahIndices);

  //-------------------------------------------------------------------------
  // TEXTURE
  //-------------------------------------------------------------------------
  var boxTexture = createSkyBoxTexture(
    gl,
    "top_view",
    "bottom_view",
    "front_view",
    "back_view",
    "left_view",
    "right_view"
  );

  //-------------------------------------------------------------------------
  // MATRICES
  //-------------------------------------------------------------------------
  //create transform matrices
  var identityMatrix = new Float32Array(16);
  var skyboxMatrix = new Float32Array(16);
  var cubeMatrix = new Float32Array(16);
  var teapotMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  var projMatrix = new Float32Array(16);

  transformMatrices(
    identityMatrix,
    [skyboxMatrix, cubeMatrix, teapotMatrix],
    viewMatrix,
    projMatrix
  );

  //prepration for render loop
  var angle = 0; // allocate mem for angle (needed in loop)

  //bind the skybox texture
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, boxTexture);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Enable depth testing
  gl.depthFunc(gl.LEQUAL);

  //-------------------------------------------------------------------------
  // skybox transforms
  //-------------------------------------------------------------------------
  //scale the skybox
  let skyboxScaleVal = 50;
  scale(skyboxMatrix, [skyboxScaleVal, skyboxScaleVal, skyboxScaleVal]);
  sendMatricesToShader(
    gl,
    skyBoxShaderProgram,
    skyboxMatrix,
    viewMatrix,
    projMatrix
  );

  //-------------------------------------------------------------------------
  // transparent cube transforms
  //-------------------------------------------------------------------------
  translate(cubeMatrix, [0, 0, 0]);
  scale(cubeMatrix, [1, 1, 1]);
  sendMatricesToShader(
    gl,
    transparentShaderProgram,
    cubeMatrix,
    viewMatrix,
    projMatrix
  );

  //-------------------------------------------------------------------------
  // teapot transforms
  //-------------------------------------------------------------------------
  let teapotScaleVal = 0.25;
  translate(teapotMatrix, [0, 0, 0]);
  rotate(teapotMatrix, identityMatrix, Math.PI / 2, [0, 1, 0]);
  scale(teapotMatrix, [teapotScaleVal, teapotScaleVal, teapotScaleVal]);
  sendMatricesToShader(
    gl,
    teapotShaderProgram,
    teapotMatrix,
    viewMatrix,
    projMatrix
  );
  //------------------------------------------------------------------------------------------------
  //
  // MAIN RENDER LOOP
  //
  //------------------------------------------------------------------------------------------------
  //main render loop
  function loop() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    angle = (performance.now() / 1000 / 6) * 2 * Math.PI;

    //-------------------------------------------------------------------------
    // skybox cube rendering
    //-------------------------------------------------------------------------
    bindSkyboxCubeBuffer(gl, skyboxVBO, cubeIBO, skyBoxShaderProgram);

    //camera rotation
    rotate(viewMatrix, identityMatrix, angle / 20, [0, 1, 0]);
    sendViewMatrixToShader(gl, skyBoxShaderProgram, viewMatrix);
    sendWorldMatrixToShader(gl, skyBoxShaderProgram, skyboxMatrix);

    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

    //-------------------------------------------------------------------------
    // teapot rendering                         TODO
    //-------------------------------------------------------------------------
    bindTeaPotBuffer(
      gl,
      teapotVBO,
      teapotVBOnormals,
      teapotIBO,
      teapotShaderProgram
    );
    // rotation controls
    if (cubeRotationAxis == "X") {
      rotate(
        teapotMatrix,
        identityMatrix,
        rotationAngleX * 2 * Math.PI,
        [1, 0, 0]
      );
      scale(teapotMatrix, [teapotScaleVal, teapotScaleVal, teapotScaleVal]);
    }
    if (cubeRotationAxis == "Y") {
      rotate(
        teapotMatrix,
        identityMatrix,
        rotationAngleY * 2 * Math.PI,
        [0, 1, 0]
      );
      scale(teapotMatrix, [teapotScaleVal, teapotScaleVal, teapotScaleVal]);
    }
    sendWorldMatrixToShader(gl, teapotShaderProgram, teapotMatrix);
    sendViewMatrixToShader(gl, teapotShaderProgram, viewMatrix);
    gl.drawElements(gl.TRIANGLES, utahIndices.length, gl.UNSIGNED_SHORT, 0);

    //-------------------------------------------------------------------------
    // transparent cube rendering
    //-------------------------------------------------------------------------
    bindTransCubeBuffer(gl, transCubeVBO, cubeIBO, transparentShaderProgram);
    // rotation controls
    if (cubeRotationAxis == "X") {
      rotate(
        cubeMatrix,
        identityMatrix,
        rotationAngleX * 2 * Math.PI,
        [1, 0, 0]
      );
    }
    if (cubeRotationAxis == "Y") {
      rotate(
        cubeMatrix,
        identityMatrix,
        rotationAngleY * 2 * Math.PI,
        [0, 1, 0]
      );
    }
    sendViewMatrixToShader(gl, transparentShaderProgram, viewMatrix);
    sendWorldMatrixToShader(gl, transparentShaderProgram, cubeMatrix);
    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
};

//------------------------------------------------------------------------------------------------
//
// GLOBAL VARIABLES
//
//------------------------------------------------------------------------------------------------
var canvas; // canvas that is displayed on the webpage
//vertex shader
var skyBoxVertShaderText = "";
var vertShaderText = "";
//fragment shader
var skyBoxFragShaderText = "";
var fragShaderTransparent = "";
//vertecies and indecies
var skyboxVerts = [
  // X, Y, Z, w
  // Top
  -1.0, 1.0, -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
  1.0,

  // Left
  -1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0,
  -1.0, 1.0,

  // Right
  1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0,
  1.0,

  // Front
  1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
  1.0,

  // Back
  1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0,
  -1.0, 1.0,

  // Bottom
  -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, -1.0,
  -1.0, 1.0,
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
var boxVertices = [
  // X, Y, Z           R, G, B
  // Top
  -1.0, 1.0, -1.0, 0.5, 0.5, 0.5, -1.0, 1.0, 1.0, 0.5, 0.5, 0.5, 1.0, 1.0, 1.0,
  0.5, 0.5, 0.5, 1.0, 1.0, -1.0, 0.5, 0.5, 0.5,

  // Left
  -1.0, 1.0, 1.0, 0.75, 0.25, 0.5, -1.0, -1.0, 1.0, 0.75, 0.25, 0.5, -1.0, -1.0,
  -1.0, 0.75, 0.25, 0.5, -1.0, 1.0, -1.0, 0.75, 0.25, 0.5,

  // Right
  1.0, 1.0, 1.0, 0.25, 0.25, 0.75, 1.0, -1.0, 1.0, 0.25, 0.25, 0.75, 1.0, -1.0,
  -1.0, 0.25, 0.25, 0.75, 1.0, 1.0, -1.0, 0.25, 0.25, 0.75,

  // Front
  1.0, 1.0, 1.0, 1.0, 0.0, 0.15, 1.0, -1.0, 1.0, 1.0, 0.0, 0.15, -1.0, -1.0,
  1.0, 1.0, 0.0, 0.15, -1.0, 1.0, 1.0, 1.0, 0.0, 0.15,

  // Back
  1.0, 1.0, -1.0, 0.0, 1.0, 0.15, 1.0, -1.0, -1.0, 0.0, 1.0, 0.15, -1.0, -1.0,
  -1.0, 0.0, 1.0, 0.15, -1.0, 1.0, -1.0, 0.0, 1.0, 0.15,

  // Bottom
  -1.0, -1.0, -1.0, 0.5, 0.5, 1.0, -1.0, -1.0, 1.0, 0.5, 0.5, 1.0, 1.0, -1.0,
  1.0, 0.5, 0.5, 1.0, 1.0, -1.0, -1.0, 0.5, 0.5, 1.0,
];

var utahVertices = loadObjVertices("teapot.obj");
var utahIndices = loadObjIndices("teapot.obj");
var utahNormals = loadObjNormals("teapot.obj");

//rotation control vars
var cubeRotationAxis = "N";
var rotationAngleX = 0; // gets changed by button press
var rotationAngleY = 0;
var rotationSpeed = 0.02;

//------------------------------------------------------------------------------------------------
//
// FUNCTIONS
//
//------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------
// SET UP METHODS
//-------------------------------------------------------------------------
/**
 * Returns a WebGL Context from am HTML Canvas Element
 */
function getWebGLContext(canvasID) {
  canvas = document.getElementById(canvasID);
  var webGLContext = canvas.getContext("webgl");
  return webGLContext;
}

/**
 * Sets a few base settings for the webgl program.
 * the given values for set enabled will be set as enabled
 * for the rendering context.
 */
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
/**
 * sets up eventlistener for keydown and keyup events.
 */
function setUpButtonControls() {
  const body = document.querySelector("body");

  body.addEventListener("keydown", onKeyDown, false);
  body.addEventListener("keyup", onKeyUp, false);
}

//-------------------------------------------------------------------------
// EVENT CALL BACK METHODS
//-------------------------------------------------------------------------
/**
 * callback function for the keydown event
 */
function onKeyDown(event) {
  switch (event.key) {
    case "ArrowUp":
      cubeRotationAxis = "X";
      rotationAngleX += rotationSpeed;
      break;
    case "ArrowDown":
      cubeRotationAxis = "X";
      rotationAngleX -= rotationSpeed;
      break;
    case "ArrowLeft":
      cubeRotationAxis = "Y";
      rotationAngleY -= rotationSpeed;
      break;
    case "ArrowRight":
      cubeRotationAxis = "Y";
      rotationAngleY += rotationSpeed;
      break;
    default:
      break;
  }
}

/**
 * callback function for the key up event
 */
function onKeyUp(event) {
  cubeRotationAxis = "N";
}

//-------------------------------------------------------------------------
// SHADER METHODS
//-------------------------------------------------------------------------

/**
 * returns the source code as string from the file of the given url
 */
async function getShaderSourceCode(url) {
  let response = await fetch(url);
  sourceCode = await response.text();
  return sourceCode;
}

/**
 * creates and compiles a shader program with the given vertex and fragment shaders
 * @returns shaderProgram
 */
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

//-------------------------------------------------------------------------
// TEXTURE METHODS
//-------------------------------------------------------------------------
/**
 * Creates a CubeMap Texture with the linked images
 * from a html document
 */
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

  //webGLContext.bindTexture(webGLContext.TEXTURE_CUBE_MAP, null); //unbind text mem
  return boxTexture;
}

//-------------------------------------------------------------------------
// CREATE BUFFER METHODS
//-------------------------------------------------------------------------

/**
 * Create fill a Buffer for a SkyBox.
 * Note that the Buffer is unbinded in this function and
 * needs to be bound again before drawing.
 */
function createVBO(webGLContext, vertices) {
  //vbo skybox
  var vbo = webGLContext.createBuffer();
  webGLContext.bindBuffer(webGLContext.ARRAY_BUFFER, vbo); //bind the buffer
  webGLContext.bufferData(
    webGLContext.ARRAY_BUFFER,
    new Float32Array(vertices), //need to specify the type for the shader since js does not require us to
    webGLContext.STATIC_DRAW
  );

  webGLContext.bindBuffer(webGLContext.ARRAY_BUFFER, null); //unbind array buffer

  return vbo;
}

/**
 * creates and fills a element array buffer (ibo) for a cube
 * @returns index buffer object
 */
function createIBO(webGLContext, cubeIndices) {
  //box indices

  var ibo = webGLContext.createBuffer();
  webGLContext.bindBuffer(webGLContext.ELEMENT_ARRAY_BUFFER, ibo);
  webGLContext.bufferData(
    webGLContext.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(cubeIndices),
    webGLContext.STATIC_DRAW
  );

  webGLContext.bindBuffer(webGLContext.ELEMENT_ARRAY_BUFFER, null); //unbind ibo
  return ibo;
}
//-------------------------------------------------------------------------
// BIND BUFFER METHODS
//-------------------------------------------------------------------------
/**
 * binds the transcube buffer and enables the attriblocs
 */
function bindTransCubeBuffer(webGLContext, vbo, ibo, program) {
  webGLContext.useProgram(program);
  webGLContext.bindBuffer(webGLContext.ARRAY_BUFFER, vbo);
  var vertPositionLoc = webGLContext.getAttribLocation(program, "vertPosition");
  webGLContext.vertexAttribPointer(
    vertPositionLoc, //Attribute Location
    3, // number of elements per attribute
    webGLContext.FLOAT, //type of elements
    webGLContext.FALSE, //if data is normalized
    6 * Float32Array.BYTES_PER_ELEMENT, //Size of an individual vertex
    0 * Float32Array.BYTES_PER_ELEMENT //offset from the beginning of a single vertex to out attribute
  );
  webGLContext.enableVertexAttribArray(vertPositionLoc);

  webGLContext.bindBuffer(webGLContext.ARRAY_BUFFER, vbo);
  var vertColorLoc = webGLContext.getAttribLocation(program, "vertColor");

  webGLContext.vertexAttribPointer(
    vertColorLoc, //Attribute Location
    3, // number of elements per attribute
    webGLContext.FLOAT, //type of elements
    webGLContext.FALSE, //if data is normalized
    6 * Float32Array.BYTES_PER_ELEMENT, //Size of an individual vertex
    3 * Float32Array.BYTES_PER_ELEMENT
  );
  webGLContext.enableVertexAttribArray(vertColorLoc);

  webGLContext.bindBuffer(webGLContext.ELEMENT_ARRAY_BUFFER, ibo);
}

/**
 * binds the skybox buffer and enables the attriblocs
 */
function bindSkyboxCubeBuffer(webGLContext, vbo, ibo, program) {
  webGLContext.useProgram(program);
  webGLContext.bindBuffer(webGLContext.ARRAY_BUFFER, vbo);
  var vertPositionLoc = webGLContext.getAttribLocation(program, "vertPosition");
  webGLContext.vertexAttribPointer(
    vertPositionLoc, //Attribute Location
    4, // number of elements per attribute
    webGLContext.FLOAT, //type of elements
    webGLContext.FALSE, //if data is normalized
    4 * Float32Array.BYTES_PER_ELEMENT, //Size of an individual vertex
    0 * Float32Array.BYTES_PER_ELEMENT //offset from the beginning of a single vertex to out attribute
  );
  webGLContext.enableVertexAttribArray(vertPositionLoc);

  webGLContext.bindBuffer(webGLContext.ELEMENT_ARRAY_BUFFER, ibo);
}

/**
 * bind all necessary buffers and set all pointers for the teapot
 */
function bindTeaPotBuffer(webGLContext, vbo, vboNormals, ibo, program) {
  webGLContext.useProgram(program);
  //first bind the vbo an set the position pointer
  webGLContext.bindBuffer(webGLContext.ARRAY_BUFFER, vbo);
  //and bind the ibo
  webGLContext.bindBuffer(webGLContext.ELEMENT_ARRAY_BUFFER, ibo);
  //set attribPointer for verPosition
  let positionAttribLocation = webGLContext.getAttribLocation(
    program,
    "vertPosition"
  );
  webGLContext.vertexAttribPointer(
    positionAttribLocation,
    3,
    webGLContext.FLOAT,
    webGLContext.FALSE,
    0 * Float32Array.BYTES_PER_ELEMENT,
    0 * Float32Array.BYTES_PER_ELEMENT
  );
  webGLContext.enableVertexAttribArray(positionAttribLocation);
  //now do the normal vbo
  webGLContext.bindBuffer(webGLContext.ARRAY_BUFFER, vboNormals);
  //set the normal attrib Pointer
  let normalAttribLocation = webGLContext.getAttribLocation(
    program,
    "vertNormal"
  );
  webGLContext.vertexAttribPointer(
    normalAttribLocation,
    3,
    webGLContext.FLOAT,
    webGLContext.FALSE,
    0 * Float32Array.BYTES_PER_ELEMENT,
    0 * Float32Array.BYTES_PER_ELEMENT
  );
  webGLContext.enableVertexAttribArray(normalAttribLocation);
}

//-------------------------------------------------------------------------
// MATRCIES FUNCTIONS
//-------------------------------------------------------------------------

/**
 * does the initial matrix transforms to but everything in window space.
 */
function transformMatrices(mIdentity, mWorld, mView, mProjection) {
  identity(mIdentity);
  mWorld.forEach((matrix) => {
    identity(matrix);
  });
  lookAt(mView, [0, 0, -6], [0, 0, 0], [0, 1, 0]);
  perspective(
    mProjection,
    Math.PI / 4,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000.0
  );
}

/**
 * sends all 3 matrices (world, view, projection) to the shader
 */
function sendMatricesToShader(
  webGLContext,
  shaderProgram,
  mWorld,
  mView,
  mProj
) {
  webGLContext.useProgram(shaderProgram);
  var matWorldUniformLocation = webGLContext.getUniformLocation(
    shaderProgram,
    "mWorld"
  );
  var matViewUniformLocation = webGLContext.getUniformLocation(
    shaderProgram,
    "mView"
  );
  var matProjUniformLocation = webGLContext.getUniformLocation(
    shaderProgram,
    "mProj"
  );

  //send matrices data to vertex shader
  webGLContext.uniformMatrix4fv(
    matWorldUniformLocation,
    webGLContext.FALSE,
    mWorld
  );
  webGLContext.uniformMatrix4fv(
    matViewUniformLocation,
    webGLContext.FALSE,
    mView
  );
  webGLContext.uniformMatrix4fv(
    matProjUniformLocation,
    webGLContext.FALSE,
    mProj
  );
}

/**
 * sends the world matrix to the shader program
 */
function sendWorldMatrixToShader(webGLContext, shaderProgram, mWorld) {
  webGLContext.useProgram(shaderProgram);
  var matWorldUniformLocation = webGLContext.getUniformLocation(
    shaderProgram,
    "mWorld"
  );
  webGLContext.uniformMatrix4fv(
    matWorldUniformLocation,
    webGLContext.FALSE,
    mWorld
  );
}

/**
 * Sends the view Matrix to the Shader Program
 */
function sendViewMatrixToShader(webGLContext, shaderProgram, mView) {
  webGLContext.useProgram(shaderProgram);
  var matWorldUniformLocation = webGLContext.getUniformLocation(
    shaderProgram,
    "mView"
  );
  webGLContext.uniformMatrix4fv(
    matWorldUniformLocation,
    webGLContext.FALSE,
    mView
  );
}
