import 'ol/ol.css';
import './index.css';
import {
    fromLonLat
} from 'ol/proj';

import InitPointerOverlay from './msfs2020/InitPointerOverlay';
import LittleNavmap from './littlenavmap/LittleNavmap';



// init LNM handler
var littlenavmap = new LittleNavmap();

window.onload = () => {

    // init msfs iframe mouse event overlay
    InitPointerOverlay(littlenavmap.map);

    // Set initial zoom & center
    littlenavmap.map.getView().setZoom(2);
    littlenavmap.map.getView().setCenter(fromLonLat([0, 0]));

    littlenavmap.startRefreshLoop();

};