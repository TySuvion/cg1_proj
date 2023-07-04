precision mediump float;
varying vec3 fragColor;

void main() {
    vec4 color = vec4(fragColor, 0.5); // Set alpha component to 0.5 for semi-transparency
    color.a = max(color.a, 0.01); // Set a minimum alpha value of 0.1
    gl_FragColor = color;
}