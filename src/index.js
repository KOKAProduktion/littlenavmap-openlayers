import 'ol/ol.css';
import './index.css';
import Map from 'ol/Map';
import LNM from './littlenavmap/LNM';
import TileDebug from 'ol/source/TileDebug';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import {
  DragPan,
  MouseWheelZoom,
  defaults
} from 'ol/interaction';
import View from 'ol/View';

import InitPointerOverlay from './msfs2020/InitPointerOverlay';

// init ol map
var map = new Map({
  interactions: defaults({
    dragPan: false,
    mouseWheelZoom: false
  }).extend([
    new DragPan({
      condition: () => true
    }),
    new MouseWheelZoom()
  ]),
  layers: [
    new TileLayer({
      source: new LNM(),
    }),
    new TileLayer({
      source: new TileDebug(),
    })
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// init msfs iframe mouse event overlay
window.onload = () => {
  InitPointerOverlay(map);
};