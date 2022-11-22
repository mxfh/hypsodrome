import CMAP_ATLAS from './cmap_atlas.js'

export const PARAMS = {
  colors: 94,
  invert: false,
  interval: 500, // in meters
  shift: 0,
  seaLevel: 0, // minimum
  repeats: 20, // number of repeats of interval
  animateShift: false,
  shiftSpeed: 0.3,
  animateSeaLevel: false,
  seaLevelSpeed: 1,
  maxSeaLevel: 500,
};

const pane = new Tweakpane.Pane({title: "Elevation Settings"});
const ramps = CMAP_ATLAS.rows.filter(v => v[3] == 256).map(([text,value])=> ({text, value}));

export function setupUi() {

const fp = pane.addFolder({
    title: 'Palette',
    expanded: true,
  });
  
  fp.addInput(PARAMS, 'colors', {label: "Color Ramp", options: ramps});
  fp.addInput(PARAMS, 'invert', {label: "invert"});
  fp.addInput(PARAMS, 'shift', { min: 0, max: 360, step: 1 });
  
  const fi = pane.addFolder({
    title: 'Elevation (in meters)',
    expanded: true,
  });
  fi.addInput(PARAMS, 'interval', { min: 1, max: 1000, step: 1, label: "Interval" });
  fi.addInput(PARAMS, 'seaLevel', { min: -1000, max: 8000, label: "Sea Level" });
  fi.addInput(PARAMS, 'repeats', { min: 1, max: 20, label: "Repeats", step:1.5});
  
  const fa = pane.addFolder({
    title: 'Animation',
    expanded: true,
  });
  fa.addInput(PARAMS, 'animateShift', { label: 'Shift' });
  fa.addInput(PARAMS, 'shiftSpeed', { min:-2, max: 2, step: 0.1, label: "Speed" });
  fa.addInput(PARAMS, 'animateSeaLevel', { label: 'SeaLevel' });
  fa.addInput(PARAMS, 'seaLevelSpeed', { min:-2, max: 2, step: 0.1, label: "Speed" });
  fa.addInput(PARAMS, 'maxSeaLevel', { min:0, max: 9000, step: 0.1, label: "max. Sea Level" });
  pane.on('change', () => {
    beforeMap.triggerRepaint();
  });
  
  function updateShift() {
    if (PARAMS.animateShift) {
      PARAMS.shift = ((PARAMS.shift + PARAMS.shiftSpeed) % 360 + 360) % 360;
      pane.refresh();
    }
    if (PARAMS.animateSeaLevel) {
  
      if (PARAMS.seaLevel > PARAMS.maxSeaLevel) {
        PARAMS.seaLevel = PARAMS.maxSeaLevel;
        PARAMS.seaLevelSpeed *= -1;
      }
      if (PARAMS.seaLevel < -PARAMS.interval ) {
        PARAMS.seaLevel = -PARAMS.interval;
        PARAMS.seaLevelSpeed *= -1;
      }
      PARAMS.seaLevel = PARAMS.seaLevel + PARAMS.seaLevelSpeed;
      pane.refresh();
    }
    requestAnimationFrame(updateShift);
  }
  requestAnimationFrame(updateShift);

}