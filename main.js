import 'ol/ol.css';
import './main.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import { DragPan, MouseWheelZoom, defaults } from 'ol/interaction';
import { platformModifierKeyOnly } from 'ol/events/condition';
import View from 'ol/View';

const pan = ({ state, originX, originY }) => {
  state.transformation.translateX += originX;
  state.transformation.translateY += originY;
  state.element.style.transform =
    getMatrix({ scale: state.transformation.scale, translateX: state.transformation.translateX, translateY: state.transformation.translateY });
};

var map = new Map({
  interactions: defaults({ dragPan: false, mouseWheelZoom: false }).extend([
    new DragPan({ condition: () => true }),
    new MouseWheelZoom()]),
  layers: [
    new TileLayer({
      source: new OSM(),
    })],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// required pointer overlay as ol canvas doesn't seem to fire drag events
const InitPointerOverlay = () => {

  var view = map.getView();
  var zoom = 1;
  var previous_position = [0, 0];
  var adjust = false;

  // flag mouse button
  var mouseDown = 0;
  document.body.onmousedown = function () {
    adjust = false; // skip first adjustment (position difference between 2 drags)
    ++mouseDown;
  }
  document.body.onmouseup = function () {
    --mouseDown;
  }

  // mouse event overlay
  var pointer_overlay = document.getElementById("pointer_overlay");

  // add pan
  pointer_overlay.addEventListener('mousemove', function (e) {
    if (mouseDown) {
      if (previous_position) {

        var offset = [previous_position[0] - e.clientX, previous_position[1] - e.clientY];

        if (adjust) {
          var coords = map.getCoordinateFromPixel([e.clientX, e.clientY]);
          var offset_coords = map.getCoordinateFromPixel([e.clientX - offset[0], e.clientY - offset[1]]);
          view.adjustCenter([coords[0] - offset_coords[0], coords[1] - offset_coords[1]]);

        }

        adjust = true; // sdjust all after first skip
      }
      previous_position = [e.clientX, e.clientY];
    }
  });

  // add zoom
  pointer_overlay.addEventListener('wheel', function (e) {
    if (e.deltaY > 0 && zoom < view.getMaxZoom()) {
      zoom += 1;
    } else if (e.deltaY < 0 && zoom > view.getMinZoom()) {
      zoom -= 1;
    }
    view.setZoom(zoom);
  });

}

// init
window.onload = () => {
  InitPointerOverlay();
};
