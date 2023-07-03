//#region Shader Source Code
//vertex shader
var vertexShaderText = `
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

//fragment shader
var fragmentShaderText = `
precision mediump float;
varying vec3 fragColor;
void main(){
    gl_FragColor = vec4(fragColor, 1.0);
}
`;
//#endregion

//#region WebGL Program
var InitDemo = function () {
  //#region Getting Context
  var canvas = document.getElementById("game-surface"); // get the canvas object from the html doc
  var gl = canvas.getContext("webgl"); // get the context webgl context from canvas
  //#endregion

  //#region Init WebGL
  //initialize webgl
  gl.clearColor(0.8, 0.8, 0.8, 1.0); //setting background color (R,G,B,A)
  //out is not acually doing the painting just choosing the paint
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // do the actual painting of the background, by clearing the color buffer
  gl.enable(gl.DEPTH_TEST); // activate the z-buffer algorithm
  //gl.enable(gl.CULL_FACE); //enable backface culling
  //gl.frontFace(gl.CCW); // front facing primitves are drawn counter clock wise
  //gl.cullFace(gl.BACK); // cut away the back faces.
  //#endregion

  //#region Create and Compile Shader Program
  //create shader
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  // set our shader source code
  gl.shaderSource(vertexShader, vertexShaderText);
  gl.shaderSource(fragmentShader, fragmentShaderText);

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
  //#endregion

  //#region Buffer

  //#region Buffer Data
  //create a buffer
  //create vertices write counterclockwise
  var skyboxVerts = [
    // X, Y, Z           R, G, B
    // Top
    -1.0, 1.0, -1.0, 0.6, 0.6, 1, -1.0, 1.0, 1.0, 0.6, 0.6, 1, 1.0, 1.0, 1.0,
    0.6, 0.6, 1, 1.0, 1.0, -1.0, 0.6, 0.6, 1,

    // Left
    -1.0, 1.0, 1.0, 0.6, 0.6, 1, -1.0, -1.0, 1.0, 0.6, 0.6, 1, -1.0, -1.0, -1.0,
    0.6, 0.6, 1, -1.0, 1.0, -1.0, 0.6, 0.6, 1,

    // Right
    1.0, 1.0, 1.0, 0.6, 0.6, 1, 1.0, -1.0, 1.0, 0.6, 0.6, 1, 1.0, -1.0, -1.0,
    0.6, 0.6, 1, 1.0, 1.0, -1.0, 0.6, 0.6, 1,

    // Front
    1.0, 1.0, 1.0, 0.6, 0.6, 1, 1.0, -1.0, 1.0, 0.6, 0.6, 1, -1.0, -1.0, 1.0,
    0.6, 0.6, 1, -1.0, 1.0, 1.0, 0.6, 0.6, 1,

    // Back
    1.0, 1.0, -1.0, 0.6, 0.6, 1, 1.0, -1.0, -1.0, 0.6, 0.6, 1, -1.0, -1.0, -1.0,
    0.6, 0.6, 1, -1.0, 1.0, -1.0, 0.6, 0.6, 1,

    // Bottom
    -1.0, -1.0, -1.0, 0.6, 0.6, 1, -1.0, -1.0, 1.0, 0.6, 0.6, 1, 1.0, -1.0, 1.0,
    0.6, 0.6, 1, 1.0, -1.0, -1.0, 0.6, 0.6, 1,
  ];

  var boxIndices = [
    // Top
    0, 1, 2, 0, 2, 3,

    // Left
    5, 4, 6, 6, 4, 7,

    // Right
    8, 9, 10, 8, 10, 11,

    // Front
    13, 12, 14, 15, 14, 12,

    // Back
    16, 17, 18, 16, 18, 19,

    // Bottom
    21, 20, 22, 22, 20, 23,
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
  var boxIndexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(boxIndices),
    gl.STATIC_DRAW
  );
  //#endregion

  //#region Attribute Location
  // position attribute allocation
  var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
  var colorAttribLocation = gl.getAttribLocation(program, "vertColor");
  gl.vertexAttribPointer(
    positionAttribLocation, //Attribute Location
    3, // number of elements per attribute
    gl.FLOAT, //type of elements
    gl.FALSE, //if data is normalized
    6 * Float32Array.BYTES_PER_ELEMENT, //Size of an individual vertex
    0 //offset from the beginning of a single vertex to out attribute
  );
  gl.enableVertexAttribArray(positionAttribLocation);

  //color attribute allocation
  gl.vertexAttribPointer(
    colorAttribLocation, //Attribute Location
    3, // number of elements per attribute
    gl.FLOAT, //type of elements
    gl.FALSE, //if data is normalized
    6 * Float32Array.BYTES_PER_ELEMENT, //Size of an individual vertex
    3 * Float32Array.BYTES_PER_ELEMENT //offset from the beginning of a single vertex to out attribute
  );
  gl.enableVertexAttribArray(colorAttribLocation);
  //#endregion
  //#endregion

  //#region Matrices
  // get the transfrom matrices location from vertex shader
  var matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
  var matViewUniformLocation = gl.getUniformLocation(program, "mView");
  var matProjUniformLocation = gl.getUniformLocation(program, "mProj");

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

  //send matrices data to vertex shader
  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
  //#endregion

  //#region Textures

  //#endregion
  // preperation for main render loop
  var angle = 0; // allocate mem for angle (needed in loop)

  //create identity matrix
  var identityMatrix = new Float32Array(16);
  identity(identityMatrix);

  //main render loop
  function loop() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
    //TODO: move camera around the cube.
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);

    //TODO: inner box rendering
    //skybox rendering
    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVertexBufferObject);

    //rotation of the cube
    rotate(worldMatrix, identityMatrix, angle, [0, 1, 0]);
    //scaling of the cube
    scale(worldMatrix, [1, 1, 1]);

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
