precision mediump float;

uniform vec3 materialColor;
varying vec3 fragNormal;
varying vec3 fragColor;

void main(){

    vec3 ambientLightIntensity = vec3(0.4,0.4,0.5);
    vec3 sunlightIntensity = vec3(0.9,0.8,0.6);
    vec3 sunlightDirection = normalize(vec3(1.0,4.0,0.0));

    vec4 materialColor = vec4(0.8,0.6,0.6,1.0);

    vec3 lightIntensity = ambientLightIntensity +
        (sunlightIntensity)* max(dot(fragNormal, sunlightDirection), 0.0);

    gl_FragColor = vec4 (materialColor.rgb * lightIntensity, 1.0);
}