//------------------------------------------------------------------------------------------------
//
// HELP FUNCTIONS USED IN INIT PROGRAM
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
  webGLContext.blendFunc(
    webGLContext.SRC_ALPHA,
    webGLContext.ONE_MINUS_SRC_ALPHA
  );
  webGLContext.depthFunc(webGLContext.LEQUAL);

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

  webGLContext.bindTexture(webGLContext.TEXTURE_CUBE_MAP, null); //unbind text mem
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
function bindSkyboxCubeBuffer(webGLContext, vbo, ibo, texture, program) {
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
  webGLContext.bindTexture(webGLContext.TEXTURE_CUBE_MAP, texture);
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
// MATRCIES METHODS
//-------------------------------------------------------------------------

/**
 * does the initial matrix transforms to but everything in window space.
 */
function transformMatrices(mIdentity, mWorld, mView, mProjection) {
  identity(mIdentity);
  mWorld.forEach((matrix) => {
    identity(matrix);
  });
  lookAt(mView, [0, 0, -7], [0, 0, 0], [0, 1, 0]);
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
