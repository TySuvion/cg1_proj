//------------------------------------------------
//
// main init webGL porgram
//
//------------------------------------------------
var InitDemo = async function () {
  //getting shader src
  skyBoxFragShaderText = await getShaderSourceCode(
    "shaders/skyBoxFragShader.glsl"
  );
  skyBoxVertShaderText = await getShaderSourceCode(
    "shaders/skyBoxVertShader.glsl"
  );

  var gl = getWebGLContext("game-surface"); // get the context webgl context from canvas

  //initialize webgl
  setWebGLSettings(gl, [0.8, 0.8, 0.8, 1.0], gl.CCW, gl.FRONT, [gl.DEPTH_TEST]);

  var skyBoxShaderProgram = await createAndCompileShaderProg(
    gl,
    skyBoxVertShaderText,
    skyBoxFragShaderText
  );
  gl.useProgram(skyBoxShaderProgram);

  //create skybox vbo
  var { skyboxVBO, skyboxPosAttribPointer } = createSkyBoxVBO(
    gl,
    skyBoxShaderProgram,
    skyboxVerts
  );
  //create general cube ibo
  var cubeIBO = createCubeIBO(gl, boxIndices);

  //Texture
  var boxTexture = createSkyBoxTexture(
    gl,
    "top_view",
    "bottom_view",
    "front_view",
    "back_view",
    "left_view",
    "right_view"
  );

  //------------------------------------------------
  //
  // Matrices
  //
  //------------------------------------------------
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

  //------------------------------------------------
  //
  // main render loop
  //
  //------------------------------------------------

  function drawSkyBox() {
    //todo: hier weiter machen
  }

  //prepration for render loop
  var angle = 0; // allocate mem for angle (needed in loop)

  //create identity matrix
  var identityMatrix = new Float32Array(16);
  identity(identityMatrix);

  //binding necessary buffers
  //skybox buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVBO);
  gl.enableVertexAttribArray(skyboxPosAttribPointer);

  //generall cube ibo
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIBO);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, boxTexture);

  //gl.disable(gl.CULL_FACE);
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

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
};

//------------------------------------------------
//
// global variables
//
//------------------------------------------------
var canvas; // canvas that is displayed on the webpage
//vertex shader
var skyBoxVertShaderText = "";
//fragment shader
var skyBoxFragShaderText = "";
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
  // X, Y, Z           R, G, B, A
  // Top
  -1.0, 1.0, -1.0, 0.5, 0.5, 0.5, 1.0, -1.0, 1.0, 1.0, 0.5, 0.5, 0.5, 1.0, 1.0,
  1.0, 1.0, 0.5, 0.5, 0.5, 1.0, 1.0, 1.0, -1.0, 0.5, 0.5, 0.5, 1.0,

  // Left
  -1.0, 1.0, 1.0, 0.75, 0.25, 0.5, 1.0, -1.0, -1.0, 1.0, 0.75, 0.25, 0.5, 1.0,
  -1.0, -1.0, -1.0, 0.75, 0.25, 0.5, 1.0, -1.0, 1.0, -1.0, 0.75, 0.25, 0.5, 1.0,

  // Right
  1.0, 1.0, 1.0, 0.25, 0.25, 0.75, 1.0, 1.0, -1.0, 1.0, 0.25, 0.25, 0.75, 1.0,
  1.0, -1.0, -1.0, 0.25, 0.25, 0.75, 1.0, 1.0, 1.0, -1.0, 0.25, 0.25, 0.75, 1.0,

  // Front
  1.0, 1.0, 1.0, 1.0, 0.0, 0.15, 1.0, 1.0, -1.0, 1.0, 1.0, 0.0, 0.15, 1.0, -1.0,
  -1.0, 1.0, 1.0, 0.0, 0.15, 1.0, -1.0, 1.0, 1.0, 1.0, 0.0, 0.15, 1.0,

  // Back
  1.0, 1.0, -1.0, 0.0, 1.0, 0.15, 1.0, 1.0, -1.0, -1.0, 0.0, 1.0, 0.15, 1.0,
  -1.0, -1.0, -1.0, 0.0, 1.0, 0.15, 1.0, -1.0, 1.0, -1.0, 0.0, 1.0, 0.15, 1.0,

  // Bottom
  -1.0, -1.0, -1.0, 0.5, 0.5, 1.0, 1.0, -1.0, -1.0, 1.0, 0.5, 0.5, 1.0, 1.0,
  1.0, -1.0, 1.0, 0.5, 0.5, 1.0, 1.0, 1.0, -1.0, -1.0, 0.5, 0.5, 1.0, 1.0,
];

//------------------------------------------------
//
// functions
//
//------------------------------------------------

/**
 * returns the source code as string from the file of the given url
 * @param {string} url
 * @returns {string} shadercode
 */
async function getShaderSourceCode(url) {
  let response = await fetch(url);
  sourceCode = await response.text();
  return sourceCode;
}

/**
 * creates and compiles a shader program with the given vertex and fragment shaders
 * @param {WebGLRenderingContext} webGLContext
 * @param {string} vertShaderCode
 * @param {string} fragShaderCode
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

/**
 * Returns a WebGL Context from am HTML Canvas Element
 * @param {HTMLCanvasElement} canvasID
 * @returns {WebGLRenderingContext} weGLcontext
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
 * @param {WebGLRenderingContext} webGLContext
 * @param {vec4} backgroundColor
 * @param {Number} frontFaceOrientation
 * @param {Number} cuttedFaces
 * @param {*} setEnabled
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
 * Creates a CubeMap Texture with the linked images
 * from a html document
 * @param {WebGLRenderingContext} webGLContext
 * @param {string} topimageid
 * @param {string} bottomimageid
 * @param {string} frontimageid
 * @param {string} backimageid
 * @param {string} leftimageid
 * @param {string} rightimageid
 * @returns boxTexture
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

/**
 * Create fill a Buffer for a SkyBox.
 * Note that the Buffer is unbinded in this function and
 * needs to be bound again before drawing.
 * @param {WebGLRenderingContext} webGLContext
 * @param {Shader Program} shaderProgram
 * @param {Float32Array} vertices
 * @returns {ArrayBuffer, AttribPointer} vbo, attribLoc
 */
function createSkyBoxVBO(webGLContext, shaderProgram, vertices) {
  //create vertices write counterclockwise

  //vbo skybox
  var vbo = webGLContext.createBuffer();
  webGLContext.bindBuffer(webGLContext.ARRAY_BUFFER, vbo); //bind the buffer
  webGLContext.bufferData(
    webGLContext.ARRAY_BUFFER,
    new Float32Array(vertices), //need to specify the type for the shader since js does not require us to
    webGLContext.STATIC_DRAW
  );

  //set attrib pointer
  var attribLoc = webGLContext.getAttribLocation(shaderProgram, "vertPosition");

  webGLContext.vertexAttribPointer(
    attribLoc, //Attribute Location
    4, // number of elements per attribute
    webGLContext.FLOAT, //type of elements
    webGLContext.FALSE, //if data is normalized
    4 * Float32Array.BYTES_PER_ELEMENT, //Size of an individual vertex
    0 //offset from the beginning of a single vertex to out attribute
  );
  webGLContext.enableVertexAttribArray(attribLoc);

  webGLContext.bindBuffer(webGLContext.ARRAY_BUFFER, null); //unbind array buffer

  return [vbo, attribLoc];
}

/**
 * creates and fills a element array buffer (ibo) for a cube
 * @param {WebGLRenderingContext} webGLContext
 * @param {Float32Array} cubeIndices
 * @returns index buffer object
 */
function createCubeIBO(webGLContext, cubeIndices) {
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
