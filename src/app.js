//------------------------------------------------------------------------------------------------
//
// MAIN WEBGL PROGRAM
//
//------------------------------------------------------------------------------------------------
async function main() {
  //-------------------------------------------------------------------------
  // SET UP
  //-------------------------------------------------------------------------
  setUpButtonControls();

  var gl = getWebGLContext("game-surface"); // get the context webgl context from canvas
  setWebGLSettings(gl, [0.8, 0.8, 0.8, 1.0], gl.CCW, gl.FRONT, [
    gl.DEPTH_TEST,
    gl.BLEND,
  ]);

  //-------------------------------------------------------------------------
  // SHADER
  //-------------------------------------------------------------------------

  //getting shader src
  vertShaderText = await getShaderSourceCode("src/shaders/vertexShader.glsl");

  skyBoxFragShaderText = await getShaderSourceCode(
    "src/shaders/skyBoxFragShader.glsl"
  );
  skyBoxVertShaderText = await getShaderSourceCode(
    "src/shaders/skyBoxVertShader.glsl"
  );
  fragShaderTransparent = await getShaderSourceCode(
    "src/shaders/fragmentShaderTransparent.glsl"
  );
  vertShaderTeapotText = await getShaderSourceCode(
    "src/shaders/vertexShaderNormals.glsl"
  );
  fragShaderTeapotText = await getShaderSourceCode(
    "src/shaders/fragmentShaderNormals.glsl"
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
  var cubeIBO = createIBO(gl, cubeIndices);
  //transparent Cube VBO
  var transCubeVBO = createVBO(gl, cubeVertices);
  //teapotvbo
  var teapotVBO = createVBO(gl, teapotVertices);
  //teapot normals vbo
  var teapotVBOnormals = createVBO(gl, teapotNormals);
  //teapot ibo
  var teapotIBO = createIBO(gl, teapotIndices);

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
  var cameraRotationAngle = 0; // allocate mem for angle (needed in loop)
  function loop() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    cameraRotationAngle = (performance.now() / 1000 / 6) * 2 * Math.PI;

    //-------------------------------------------------------------------------
    // skybox cube rendering
    //-------------------------------------------------------------------------
    bindSkyboxCubeBuffer(
      gl,
      skyboxVBO,
      cubeIBO,
      boxTexture,
      skyBoxShaderProgram
    );

    //camera rotation
    rotate(viewMatrix, identityMatrix, cameraRotationAngle / 20, [0, 1, 0]);
    sendViewMatrixToShader(gl, skyBoxShaderProgram, viewMatrix);
    sendWorldMatrixToShader(gl, skyBoxShaderProgram, skyboxMatrix);

    gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0);

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
    gl.drawElements(gl.TRIANGLES, teapotIndices.length, gl.UNSIGNED_SHORT, 0);

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
    gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
