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

import { defaults as defaultControls } from 'ol/control';

import FollowControl from './ol/control/FollowControl';

import InitPointerOverlay from './msfs2020/InitPointerOverlay';
import LittleNavmap from './littlenavmap/LittleNavmap';

// init ol components
var sources = [new LNM(), new LNM()];
var activesource = 0;
var layers = [

    new TileLayer({
        source: sources[0],
        className: "lnm-layer-0",
        visible: true
    }),
    new TileLayer({
        source: sources[1],
        className: "lnm-layer-1",
        visible: false,
    }),
    // new TileLayer({
    //   source: new OSM(),
    // }),
    // new TileLayer({
    //   source: new TileDebug(),
    // })

];
var following = true;

// init ol map
var map = new Map({
    controls: [new FollowControl({
        handleFollow: () => {
            following = !following;
        }
    })],
    layers: layers,
    target: 'map',
    view: new View({
        maxZoom: 13,
        minZoom: 3
    })
});

// init LNM handler
var littlenavmap = new LittleNavmap();

map.on('click', function(event) {
    map.forEachLayerAtPixel(event.pixel, function(layer) {
        if (layer.getClassName() == "lnm-layer-0" || layer.getClassName() == "lnm-layer-1") {
            sources[activesource].updateTileAtPixel(event.pixel, map);
        }
    });
});

window.onload = () => {

    // init msfs iframe mouse event overlay
    InitPointerOverlay(map);

    // Set initial zoom & center
    map.getView().setZoom(2);
    map.getView().setCenter(fromLonLat([11.775111, 48.3536972]));

    // start update loop
    setTimeout(refreshLoop, 1000); // delay first loop

};

function refreshLoop() {

    littlenavmap.getAircraftPosition((coords) => {

        // swap active source
        toggleActiveSource();

        // get map plane coords
        const lonlat = fromLonLat(coords);

        if (following) {
            // center to position
            map.getView().animate({
                center: lonlat,
                duration: 200
            })
        }

        // update image on hidden source (avoid flickering)
        sources[activesource == 0 ? 1 : 0].updateTileAtLonLat(lonlat, map);

    });
    setTimeout(refreshLoop, 1000);

}

function toggleActiveSource() {
    if (activesource < 1) {
        activesource = 1;
        layers[1].setVisible(true);
        layers[0].setVisible(false);

    } else {
        activesource = 0;
        layers[0].setVisible(true);
        layers[1].setVisible(false);
    }
}