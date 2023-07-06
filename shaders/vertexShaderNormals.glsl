precision mediump float;
attribute vec3 vertPosition;
attribute vec3 vertColor;
attribute vec3 vertNormal;
varying vec3 fragColor;
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform mat4 mNormalMatrix;
varying vec3 vNormal;

void main() {
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
    vNormal = normalize((mNormalMatrix * vec4(vertNormal, 0.0)).xyz);
}