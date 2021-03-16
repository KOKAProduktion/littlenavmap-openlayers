import 'ol/ol.css';
import './index.css';
import Map from 'ol/Map';
import LNM from './ol/source/LNM';
import TileDebug from 'ol/source/TileDebug';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat } from 'ol/proj';
import View from 'ol/View';

import InitPointerOverlay from './msfs2020/InitPointerOverlay';

// init ol map
var map = new Map({
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

window.onload = () => {

    // init msfs iframe mouse event overlay
    InitPointerOverlay(map);

    // Set initial zoom
    map.getView().setZoom(2);

    map.getView().setCenter(fromLonLat([11.775111, 48.3536972]));
};