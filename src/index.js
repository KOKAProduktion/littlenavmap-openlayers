/* 
 * Copyright 2021 Kosma Kaczmarski <info@koka-produktion.de>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import 'ol/ol.css';
import './index.css';
import {
    fromLonLat
} from 'ol/proj';

import InitPointerOverlay from './msfs2020/InitPointerOverlay';
import LittleNavmap from './littlenavmap/LittleNavmap';

// LNM URL's
var LNM_URL = {
    production: "/", // Served inside LNM built-in server
    development: "http://localhost:8965/" // Local LNM Web API
};

// check environment mode
var environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';

console.log("Starting " + environment + " mode:", LNM_URL[environment]);

// init LNM controller
var littlenavmap = new LittleNavmap(LNM_URL[environment], 'map');

window.onload = () => {

    // init msfs iframe mouse event overlay
    // InitPointerOverlay(littlenavmap.map);

    // Set initial zoom & center
    littlenavmap.map.getView().setZoom(9);
    littlenavmap.map.getView().setCenter(fromLonLat([0, 0]));

    // start refreshing (disabled)
    littlenavmap.startRefreshLoop();

};