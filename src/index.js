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

var sources = [new LNM(), new LNM()];

sources.forEach(source => {



});


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

var littlenavmap = new LittleNavmap();

// init ol map
var map = new Map({
    layers: layers,
    target: 'map',
    view: new View({
        maxZoom: 13,
        minZoom: 3
    }),
});


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

    // Set initial zoom
    map.getView().setZoom(2);

    map.getView().setCenter(fromLonLat([11.775111, 48.3536972]));

    setTimeout(refreshLoop, 1000); // delay first loop

};

function refreshLoop() {

    littlenavmap.getAircraftPosition((coords) => {


        toggleActiveSource();

        const lonlat = fromLonLat(coords);

        map.getView().animate({
            center: lonlat,
            duration: 200
        })
        sources[activesource == 0 ? 1 : 0].updateTileAtLonLat(lonlat, map);

    });
    setTimeout(refreshLoop, 1000);

}

function toggleActiveSource() {


    if (activesource < 1) {

        activesource = 1;
        layers[1].setVisible(true);

        layers[0].setVisible(false);
        //sources[0].refresh();
        console.log("tok");

    } else {

        activesource = 0;
        layers[0].setVisible(true);

        layers[1].setVisible(false);
        //sources[1].refresh();
        console.log("tik");
    }



}