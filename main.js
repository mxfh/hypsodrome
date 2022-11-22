import fragmentSource from './gl/fragment.js'
import vertexSource from './gl/vertex.js'
import {loadImage, setTextureParams} from './gl/helpers.js'
import {setupUi, PARAMS} from './ui.js'

mapboxgl.accessToken =
  "pk.eyJ1IjoibXhmaCIsImEiOiJjaXE5b2g2cjMwMDVraTNuczlpMjN3dWpqIn0.QDUPBG2py7JEHWMlkwPP_A";

const image = new Image();
image.src = "./palettes/color_texture.png";

const beforeMap = new mapboxgl.Map({
  container: "before",
  style: "mapbox://styles/mapbox/empty-v8",
  center: [145, -16],
  zoom: 0,
  hash: true,
  tilt: false,
  transformRequest: (r, t) => {
    return {url: r.replace("\@2x", "")}
  }
});
beforeMap.on("load", () => {
  const customlayer = new TextureLayer(
    "test",
    {
      type: "raster",
      url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    },
    setupLayer,
    render
  );
  beforeMap.addLayer(customlayer);
});

let program;

function setupLayer(map, gl) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexSource);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentSource);
  gl.compileShader(fragmentShader);

  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.validateProgram(program);

  program.aPos = gl.getAttribLocation(program, "aPos");
  program.uMatrix = gl.getUniformLocation(program, "uMatrix");
  program.uRampTexture = gl.getUniformLocation(program, "uRampTexture");
  program.uTexture = gl.getUniformLocation(program, "uTexture");

  program.rampIndex= gl.getUniformLocation(program, "rampIndex");
  program.invert = gl.getUniformLocation(program, "invert");
  program.shift = gl.getUniformLocation(program, "shift");
  program.interval= gl.getUniformLocation(program, "interval");
  program.seaLevel= gl.getUniformLocation(program, "seaLevel");
  program.repeats= gl.getUniformLocation(program, "repeats");

  const vertexArray = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);

  program.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, program.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
}

function render(gl, matrix, tiles) {
  gl.useProgram(program);
  gl.activeTexture(gl.TEXTURE0);
  loadImage(gl, image);
  gl.uniform1i(program.uRampTexture, 0);
  gl.uniform1f(program.rampIndex, PARAMS.colors / 255);
  gl.uniform1f(program.invert, PARAMS.invert);
  gl.uniform1f(program.shift, PARAMS.shift / 360);
  gl.uniform1f(program.interval, PARAMS.interval);
  gl.uniform1f(program.seaLevel, PARAMS.seaLevel);
  gl.uniform1f(program.repeats, PARAMS.repeats);

  tiles.forEach((tile) => {
    if (!tile.texture) return;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, tile.texture.texture);
    setTextureParams(gl);
    gl.bindBuffer(gl.ARRAY_BUFFER, program.vertexBuffer);
    gl.enableVertexAttribArray(program.a_pos);
    gl.vertexAttribPointer(program.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(program.uMatrix, false, tile.tileID.projMatrix);
    gl.uniform1i(program.uTexture, 1);
    gl.depthFunc(gl.LESS);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  });
}

const afterMap = new mapboxgl.Map({
  container: 'after',
  style: 'mapbox://styles/mapbox/satellite-v9',
  center: [0, 0],
  zoom: 0,
  tilt: false,
  hash: true
  });

// A selector or reference to HTML element
const container = '#comparison-container';
 
const map = new mapboxgl.Compare(beforeMap, afterMap, container, {
// Set this to enable comparing two maps by mouse movement:
// mousemove: true
});

map.setSlider(document.body.clientWidth * 1);

// Add UI

const pane = setupUi();

pane.on('change', () => {
  beforeMap.triggerRepaint();
});
