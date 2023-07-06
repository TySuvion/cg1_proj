precision mediump float;
attribute vec4 vertPosition;
varying vec3 v_normal;
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
  v_normal = normalize(vertPosition.xyz);
    gl_Position = mProj * mView * mWorld * vec4(vertPosition);
}

