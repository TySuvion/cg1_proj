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

