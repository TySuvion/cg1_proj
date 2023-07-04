precision mediump float;
varying vec3 v_normal;
uniform samplerCube cubeText;

void main(){
    gl_FragColor = textureCube(cubeText, normalize(v_normal));
}