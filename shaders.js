const fragmentShaderTextOutside = `
precision mediump float;
varying vec3 fragColor;
void main(){
    gl_FragColor = vec4(fragColor, 1.0);
}
`;
const vertexShaderTransparent = `
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
const fragmentShaderTransparent = `
precision mediump float;
varying vec3 fragColor;

void main() {
    vec4 color = vec4(fragColor, 0.5); // Set alpha component to 0.5 for semi-transparency
    color.a = max(color.a, 0.01); // Set a minimum alpha value of 0.1
    gl_FragColor = color;
}
`;
