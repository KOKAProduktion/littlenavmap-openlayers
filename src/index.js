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
    development: "http://littlenavmap.local/" // Proxy to avoid CORS issues
};

// check environment mode
var environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';

console.log("Starting " + environment + " mode:", LNM_URL[environment]);

// init LNM controller
var littlenavmap = new LittleNavmap(LNM_URL[environment], 'map');

window.onload = () => {

    // init msfs iframe mouse event overlay
    InitPointerOverlay(littlenavmap.map);
    
    
    // default values
    var lnmOlDefaults = {
        zoom: 2,
        lonLat: [0, 0]
    };
    
    // try get current values and validate
    var lnmOl = sessionStorage.getItem("lnm-ol");
    try {
        lnmOl = JSON.parse(lnmOl);
        if(lnmOl === null || Array.isArray(lnmOl)) {
            lnmOl = lnmOlDefaults;
        } else {
            if(typeof lnmOl.zoom !== "number") {
                lnmOl.zoom = lnmOlDefaults.zoom;
            }
            if(!Array.isArray(lnmOl.lonLat) || lnmOl.lonLat.length !== 2 || typeof lnmOl.lonLat[0] !== "number" || typeof lnmOl.lonLat[1] !== "number") {
                lnmOl.lonLat = lnmOlDefaults.lonLat;
            }
        }
    } catch(e) {
        lnmOl = lnmOlDefaults;
    }


    // Set initial zoom & center
    littlenavmap.map.getView().setZoom(lnmOl.zoom);
    littlenavmap.map.getView().setCenter(fromLonLat(lnmOl.lonLat));

    // start refreshing
    littlenavmap.startRefreshLoop();

};