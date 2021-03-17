import 'ol/ol.css';
import './index.css';
import Map from 'ol/Map';
import LNM from './ol/source/LNM';
import TileDebug from 'ol/source/TileDebug';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import {
    fromLonLat
} from 'ol/proj';
import View from 'ol/View';

import InitPointerOverlay from './msfs2020/InitPointerOverlay';
import LittleNavmap from './littlenavmap/LittleNavmap';

var source = new LNM();

var littlenavmap = new LittleNavmap();

// init ol map
var map = new Map({
    layers: [
        new TileLayer({
            source: source,
            className: "lnm-layer"
        }),
        // new TileLayer({
        //   source: new OSM(),
        // }),
        // new TileLayer({
        //   source: new TileDebug(),
        // })
    ],
    target: 'map',
    view: new View({
        maxZoom: 13,
        minZoom: 3
    }),
});


map.on('click', function(event) {
    map.forEachLayerAtPixel(event.pixel, function(layer) {
        if (layer.getClassName() == "lnm-layer") {
            source.updateTileAtPixel(event.pixel, map);
        }
    });
});

window.onload = () => {

    // init msfs iframe mouse event overlay
    InitPointerOverlay(map);

    // Set initial zoom
    map.getView().setZoom(2);

    map.getView().setCenter(fromLonLat([11.775111, 48.3536972]));

    setTimeout(refreshLoop, 1000); // delay first loop

};

function refreshLoop() {

    littlenavmap.getAircraftPosition((coords) => {

        const lonlat = fromLonLat(coords);

        map.getView().animate({
            center: lonlat,
            duration: 200
        })
        source.updateTileAtLonLat(lonlat, map);

    });
    setTimeout(refreshLoop, 1000);

}