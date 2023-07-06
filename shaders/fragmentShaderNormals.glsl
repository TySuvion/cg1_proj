precision mediump float;

uniform vec3 materialColor;
varying vec3 vNormal;

void main(){
    vec3 lightDirection = normalize(vec3(0.0, 1.0, 0.0)); //light direction
    float lightIntensity = dot(vNormal, lightDirection);

    vec3 shadingColor = vec3(lightIntensity);

    vec3 finalColor = shadingColor * materialColor;

    gl_FragColor = vec4(finalColor, 1.0);
}