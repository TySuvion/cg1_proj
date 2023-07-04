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

function setWebGLSettings(webGLContext) {
  webGLContext.clearColor(0.8, 0.8, 0.8, 1.0);
  webGLContext.clear(
    webGLContext.COLOR_BUFFER_BIT | webGLContext.DEPTH_BUFFER_BIT
  );
  webGLContext.enable(webGLContext.DEPTH_TEST);
  webGLContext.enable(webGLContext.CULL_FACE);
  webGLContext.frontFace(webGLContext.CCW);
  webGLContext.cullFace(webGLContext.FRONT);
}

//#region WebGL Program
var InitDemo = async function () {
  //getting shader src
  skyBoxFragShaderText = await getShaderSourceCode("skyBoxFragShader.glsl");
  skyBoxVertShaderText = await getShaderSourceCode("skyBoxVertShader.glsl");

  var gl = getWebGLContext("game-surface"); // get the context webgl context from canvas

  //initialize webgl
  setWebGLSettings(gl);

  var skyBoxShaderProgram = await createAndCompileShaderProg(
    gl,
    skyBoxVertShaderText,
    skyBoxFragShaderText
  );
  gl.useProgram(skyBoxShaderProgram);

  //#region Buffer

  //#region Buffer Data
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

  //#endregion
  //#region Buffer Objects

  //vertex buffer object for skybox
  var skyboxVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVertexBufferObject); //bind the buffer
  //give buffer data
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
  //#endregion

  //#region Attribute Location
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
  //#endregion
  //#endregion

  //#region Textures

  var boxTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, boxTexture);
  // getting the skybox images from the html document
  const skyBoxFaces = [
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      image: document.getElementById("right_view"),
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      image: document.getElementById("left_view"),
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      image: document.getElementById("top_view"),
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      image: document.getElementById("bottom_view"),
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      image: document.getElementById("front_view"),
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      image: document.getElementById("back_view"),
    },
  ];
  skyBoxFaces.forEach((face) => {
    const { target, image } = face;
    gl.texImage2D(
      target,
      0, //level of detail
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image
    );
  });
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  gl.texParameteri(
    gl.TEXTURE_CUBE_MAP,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR_MIPMAP_LINEAR
  );

  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null); //unbind text mem
  //#endregion

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

  //binding necessary buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVertexBufferObject);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxIndexBufferObject);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, boxTexture);
  //TODO: Konrad tries stuff!

  gl.disable(gl.CULL_FACE);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Enable depth testing
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  //main render loop
  function loop() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
    //TODO: move camera around the cube.
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);

    //TODO: inner box rendering
    //skybox rendering

    //rotation of the cube
    rotate(worldMatrix, identityMatrix, angle / 4, [0, 1, 0]);
    //scaling of the cube
    //scale(worldMatrix, [10, 10, 10]);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
};

//#endregion

//#region Matrix Functions

/**
 * turns the given out into the identity matrix
 * @param {Float32Array} out
 */
function identity(out) {
  // x
  out[0] = 1.0;
  out[1] = 0.0;
  out[2] = 0.0;
  out[3] = 0.0;
  // y
  out[4] = 0.0;
  out[5] = 1.0;
  out[6] = 0.0;
  out[7] = 0.0;
  // z
  out[8] = 0.0;
  out[9] = 0.0;
  out[10] = 1.0;
  out[11] = 0.0;
  // w
  out[12] = 0.0;
  out[13] = 0.0;
  out[14] = 0.0;
  out[15] = 1.0;
}

/**
 * Multiplies the ins Matrix with a translation matrix T(v)
 * and puts the result in out.
 * @param {Float32Array} out
 * @param {Float32Array} v
 */
function translate(out, v) {
  var x = v[0];
  var y = v[1];
  var z = v[2];
  out[12] += out[0] * x + out[4] * y + out[8] * z;
  out[13] += out[1] * x + out[5] * y + out[9] * z;
  out[14] += out[2] * x + out[6] * y + out[10] * z;
  out[15] += out[3] * x + out[7] * y + out[11] * z;
}

/**
 * scales the out matrix by the vec v
 * @param {Float32Array} out
 * @param {Float32Array} v
 */
function scale(out, v) {
  out[0] *= v[0];
  out[1] *= v[0];
  out[2] *= v[0];
  out[3] *= v[0];
  out[4] *= v[1];
  out[5] *= v[1];
  out[6] *= v[1];
  out[7] *= v[1];
  out[8] *= v[2];
  out[9] *= v[2];
  out[10] *= v[2];
  out[11] *= v[2];
}
/**
 * multiplies the inserted matrix with a axis dependend rotation matrix.
 * the result is saved in out.
 * @param {Float32Array} out
 * @param {Float32Array} ins
 * @param {*} angle
 * @param {Float32Array} v
 * @returns
 */
function rotate(out, ins, angle, v) {
  const EPSILON = 0.000001;
  var x = v[0];
  var y = v[1];
  var z = v[2];
  var len = Math.hypot(x, y, z);
  if (len < EPSILON) {
    return 0;
  } // break when no rotation axis selected
  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;

  // calculate cos, sin and tan
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const tan = 1 - cos;

  // create rotation matrix
  const b01 = x * x * tan + cos;
  const b02 = y * x * tan + z * sin;
  const b03 = z * x * tan - y * sin;
  const b11 = x * y * tan - z * sin;
  const b12 = y * y * tan + cos;
  const b13 = z * y * tan + x * sin;
  const b21 = x * z * tan + y * sin;
  const b22 = y * z * tan - x * sin;
  const b23 = z * z * tan + cos;

  //create final matrix
  out[0] = ins[0] * b01 + ins[4] * b02 + ins[8] * b03;
  out[1] = ins[1] * b01 + ins[5] * b02 + ins[9] * b03;
  out[2] = ins[2] * b01 + ins[6] * b02 + ins[10] * b03;
  out[3] = ins[3] * b01 + ins[7] * b02 + ins[11] * b03;
  out[4] = ins[0] * b11 + ins[4] * b12 + ins[8] * b13;
  out[5] = ins[1] * b11 + ins[5] * b12 + ins[9] * b13;
  out[6] = ins[2] * b11 + ins[6] * b12 + ins[10] * b13;
  out[7] = ins[3] * b11 + ins[7] * b12 + ins[11] * b13;
  out[8] = ins[0] * b21 + ins[4] * b22 + ins[8] * b23;
  out[9] = ins[1] * b21 + ins[5] * b22 + ins[9] * b23;
  out[10] = ins[2] * b21 + ins[6] * b22 + ins[10] * b23;
  out[11] = ins[3] * b21 + ins[7] * b22 + ins[11] * b23;
}
//#endregion
