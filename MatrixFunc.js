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
 * creates a projection matrix.
 * @param {Float32Array} out
 * @param {number} fovy
 * @param {number} aspect
 * @param {number} near
 * @param {number} far
 */
function perspective(out, fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy / 2);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;

  if (far != null && far != Infinity) {
    var nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }
}

/**
 * creates a view matrix
 * @param {Float32Array} out
 * @param {Float32Array} eye
 * @param {Float32Array} look
 * @param {Float32Array} up
 */
function lookAt(out, eye, look, up) {
  //n = eye - look (z achse)
  var n0 = eye[0] - look[0];
  var n1 = eye[1] - look[1];
  var n2 = eye[2] - look[1];
  //betrag von n berechnen
  var n_lenght = Math.hypot(n0, n1, n2);
  //normierung von n
  n0 /= n_lenght;
  n1 /= n_lenght;
  n2 /= n_lenght;
  //u = up x n (x achse)
  u0 = up[1] * n2 - up[2] * n1;
  u1 = up[2] * n0 - up[0] * n2;
  u2 = up[0] * n1 - up[1] * n0;
  //betrag von u berechen
  var u_length = Math.hypot(u0, u1, u2);
  //normierung von u
  u0 /= u_length;
  u1 /= u_length;
  u2 /= u_length;
  //v = n x u (y achse)
  v0 = n1 * u2 - n2 * u1;
  v1 = n2 * u0 - n0 * u2;
  v2 = n0 * u1 - n1 * u0;
  //betrag von v berechnen
  var v_length = Math.hypot(v0, v1, v2);
  //normierung von v
  v0 /= v_length;
  v1 /= v_length;
  v2 /= v_length;
  //matrix ausgabe
  out[0] = u0;
  out[1] = v0;
  out[2] = n0;
  out[3] = 0;

  out[4] = u1;
  out[5] = v1;
  out[6] = n1;
  out[7] = 0;

  out[8] = u2;
  out[9] = v2;
  out[10] = n2;
  out[11] = 0;
  //transformation ausmultiplizieren
  out[12] = -(u0 * eye[0] + u1 * eye[1] + u2 * eye[2]);
  out[13] = -(v0 * eye[0] + v1 * eye[1] + v2 * eye[2]);
  out[14] = -(n0 * eye[0] + n1 * eye[1] + n2 * eye[2]);
  out[15] = 1;
}

function multiply(out, matrix1, matrix2) {
  a00 = matrix1[0];
  a10 = matrix1[1];
  a20 = matrix1[2];
  a30 = matrix1[3];
  a01 = matrix1[4];
  a11 = matrix1[5];
  a21 = matrix1[6];
  a31 = matrix1[7];
  a02 = matrix1[8];
  a12 = matrix1[9];
  a22 = matrix1[10];
  a32 = matrix1[11];
  a03 = matrix1[12];
  a13 = matrix1[13];
  a23 = matrix1[14];
  a33 = matrix1[15];

  b00 = matrix2[0];
  b10 = matrix2[1];
  b20 = matrix2[2];
  b30 = matrix2[3];
  b01 = matrix2[4];
  b11 = matrix2[5];
  b21 = matrix2[6];
  b31 = matrix2[7];
  b02 = matrix2[8];
  b12 = matrix2[9];
  b22 = matrix2[10];
  b32 = matrix2[11];
  b03 = matrix2[12];
  b13 = matrix2[13];
  b23 = matrix2[14];
  b33 = matrix2[15];

  out[0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
  out[1] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
  out[2] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
  out[2] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;

  out[4] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
  out[5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
  out[6] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
  out[7] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;

  out[8] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
  out[9] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
  out[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
  out[11] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;

  out[12] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;
  out[13] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;
  out[14] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;
  out[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;
}
