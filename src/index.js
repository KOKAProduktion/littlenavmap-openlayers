import 'ol/ol.css';
import './index.css';
import Map from 'ol/Map';
import LNM from './littlenavmap/LNM';
import TileDebug from 'ol/source/TileDebug';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat } from 'ol/proj';
import {
  DragPan,
  MouseWheelZoom,
  defaults
} from 'ol/interaction';
import View from 'ol/View';

import InitPointerOverlay from './msfs2020/InitPointerOverlay';
import Layer from 'ol/layer/layer';

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
    // new TileLayer({
    //   source: new OSM(),
    // }),
    // new TileLayer({
    //   source: new TileDebug(),
    // })
  ],
  target: 'map',
  view: new View(),
});



// init msfs iframe mouse event overlay
window.onload = () => {
  var overlay = InitPointerOverlay(map);
  map.getView().setCenter(fromLonLat([11.775111, 48.3536972]));
  map.getView().setZoom(10);
};