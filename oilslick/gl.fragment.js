export default `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D uRampTexture; 
uniform sampler2D uTexture;
uniform float rampIndex; 
uniform float shift; 
uniform float interval;
uniform float seaLevel;
uniform float repeats;

void main() {
    vec4 color = texture2D(uTexture, vTexCoord);
    float elevationInM = clamp(-10000.0 + (color.r * 255.0 * 256.0 + color.g * 255.0 + color.b) * 25.6, seaLevel, seaLevel + repeats * interval);
    float mapToU = mod(-seaLevel + elevationInM + shift * interval, interval) / interval;
    gl_FragColor = texture2D(uRampTexture, vec2(mapToU, rampIndex));
}           
`;