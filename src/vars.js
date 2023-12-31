//------------------------------------------------------------------------------------------------
//
// GLOBAL VARIABLES USED IN PROGRAM
//
//------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------
// VERTECIES AND INDECIES ARRAYS
//-------------------------------------------------------------------------
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
var cubeIndices = [
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
var cubeVertices = [
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
var teapotVertices = loadObjVertices("obj/teapot.obj");
var teapotIndices = loadObjIndices("obj/teapot.obj");
var teapotNormals = loadObjNormals("obj/teapot.obj");

//-------------------------------------------------------------------------
// GENERAL GLOBAL VARS
//-------------------------------------------------------------------------
var canvas;
//rotation control vars
var cubeRotationAxis = "N";
var rotationAngleX = 0;
var rotationAngleY = 0;
var rotationSpeed = 0.015;
