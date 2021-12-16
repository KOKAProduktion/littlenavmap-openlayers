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

import Map from 'ol/Map';

import LNMTileGrid from '../ol/source/LNMTileGrid';
import TileDebug from 'ol/source/TileDebug';
import OSM from 'ol/source/OSM';

import View from 'ol/View';
import Point from 'ol/geom/Point';
import {
    Tile as TileLayer,
    Vector as VectorLayer
} from 'ol/layer';
import VectorSource from 'ol/source/Vector';

import FollowControl from '../ol/control/FollowControl';
import RefreshControl from '../ol/control/RefreshControl';
import {
    Attribution
} from 'ol/control';

import {
    fromLonLat
} from 'ol/proj';

import fetchText from '../util/fetchText';
import LNMMapClick from '../ol/interaction/LNMMapClick';
import {
    defaults as defaultInteractions,
} from 'ol/interaction';
import LNMUserAircraft from '../ol/feature/LNMUserAircraft';
import LNMUserAircraftLabel from '../ol/feature/LNMUserAircraftLabel';
// import debounce from '../util/debounce';


/**
 * Littlenavmap - openlayers controller
 * 
 * - Inits and holds openlayers components and map
 * - Requests sim info from LNM html's
 * - Runs the refresh loop
 */
export default class LittleNavmap {
    constructor(url, target) {
        this.fetch = fetchText;
        this.url = url;
        this.target = target;
        this.refreshInterval = 1000;

        // ol sources
        this.sources = [new LNMTileGrid({
            url: this.url
        })];
        this.activesource = 0;

        // ol layers
        this.layers = [
            new TileLayer({
                source: this.sources[0],
                className: "lnm-layer-0",
                visible: true
            }),
            // new TileLayer({
            //   source: new OSM(),
            // }),
            // new TileLayer({
            //   source: new TileDebug(),
            // })
        ];

        // flags
        this.following = true;

        // proceed
        this.initMap();
    }

    /**
     * Setup and init ol map
     */
    initMap() {

        // controls
        const controls = [
            new FollowControl({
                handleFollow: () => {
                    this.following = !this.following;
                }
            }),
            new RefreshControl({
                handleRefresh: () => {
                    this.sources.forEach((source) => {
                        source.refresh();
                    });
                }
            }),
            new Attribution({
                collapsible: false
            })
        ];

        this.setupAircraftFeature();

        // init ol map
        this.map = new Map({
            controls: controls,
            interactions: defaultInteractions().extend([
                new LNMMapClick({
                    url: this.url
                })
            ]),
            layers: this.layers,
            target: this.target,
            view: new View({
                maxZoom: 19, // Remember source settings
                minZoom: 4
            })
        });

        // this.map.on("moveend", debounce((event)=>{
        //     console.log(this.map.getView().getZoom());
        // }, 1000));

        // Add feature selectability
        // const select = new Select();
        // select.on('select', (e) => {
        //     console.log(e);
        // })
        // this.map.addInteraction(select);

        // refresh tile at pixel (debugging)
        // this.map.on('click', function (event) {
        //     this.map.forEachLayerAtPixel(event.pixel, function (layer) {
        //         if (layer.getClassName() == "lnm-layer-0" || layer.getClassName() == "lnm-layer-1") {
        //             this.sources[activesource].updateTileAtPixel(event.pixel, this.map);
        //         }
        //     });
        // });

    }

    /**
     * Add layer of the users sim aircraft map feature
     */
    setupAircraftFeature() {

        // setup aircraft icon
        this.aircraftFeature = new LNMUserAircraft();

        // setup aircraft icon label
        this.aircraftLabelFeature = new LNMUserAircraftLabel();

        // assemble
        const vectorSource = new VectorSource({
            features: [this.aircraftFeature, this.aircraftLabelFeature],
        });

        const vectorLayer = new VectorLayer({
            source: vectorSource,
        });

        this.layers.push(vectorLayer);
    }

    /**
     * Retrieve aircraft position from LNM and populate this.simInfo
     * @param {Function} success 
     */
    getAircraftPosition(success) {

        this.fetch(this.url + 'api/sim/info', (data) => {
            try {
                const json = JSON.parse(data);
                if (json.active) {
                    // store sim info
                    this.simInfo = json;
                    // handle aircraft visibility
                    this.setAircraftFeatureVisibility(true);
                    // callback
                    success([json.position.lon, json.position.lat], json.heading);
                } else {
                    // reset sim info
                    this.simInfo = null;
                    // handle aircraft visibility
                    this.setAircraftFeatureVisibility(false);
                }
            } catch (e) {
                console.log(e);
            }
        }, (error) => {
            console.log(error);
        });
    }

    /**
     * Show/hide the user aircraft feature and label
     * @param {boolean} visible 
     */
    setAircraftFeatureVisibility(visible) {
        if (visible && !this.aircraftFeature.isVisible()) {
            this.aircraftFeature.show();
            this.aircraftLabelFeature.show();
        } else if (!visible && this.aircraftFeature.isVisible()) {
            this.aircraftFeature.hide();
            this.aircraftLabelFeature.hide();
        }
    }

    /**
     * Parse DMS string ("deg min sec dir, deg min sec dir") to decimal degrees (lon, lat)
     * @see https://stackoverflow.com/a/1140335
     * @param {string} input 
     * @returns 
     */
    ParseDMS(input) {
        var parts = input.split(/[^\d\w!.]+/);

        var lat = this.ConvertDMSToDD(parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2]), parts[3]);
        var lon = this.ConvertDMSToDD(parseFloat(parts[4]), parseFloat(parts[5]), parseFloat(parts[6]), parts[7]);

        return [lon, lat];
    }



    /**
     * Convert DMS to decimal degrees
     * @see https://stackoverflow.com/a/1140335
     * @param {number} degrees 
     * @param {number} minutes 
     * @param {number} seconds 
     * @param {string} direction 
     * @returns 
     */
    ConvertDMSToDD(degrees, minutes, seconds, direction) {

        var dd = degrees + minutes / 60 + seconds / (60 * 60);

        if (direction == "S" || direction == "W") {
            dd = dd * -1;
        } // Don't do anything for N or E
        return dd;
    }

    /**
     * Loop trigger
     */
    startRefreshLoop() {
        // start update loop
        setTimeout(this.refreshLoop.bind(this), this.refreshInterval); // delay first loop
    }

    /**
     * Loop
     */
    refreshLoop() {

        this.getAircraftPosition((coords, heading) => {

            // get map plane coords
            const lonlat = fromLonLat(coords);

            // update aircraft feature
            this.aircraftFeature.setGeometry(new Point(lonlat))
            this.aircraftFeature.rotateImage(this.degreesToRadians(heading));

            // update aircraft label feature
            this.aircraftLabelFeature.setGeometry(new Point(lonlat));
            this.aircraftLabelFeature.updateText("GS " + this.simInfo.ground_speed.toFixed(0) + "kts\nALT " + this.simInfo.indicated_altitude.toFixed(0) + "ft")

            if (this.following) {
                // center to position
                this.map.getView().animate({
                    center: lonlat,
                    duration: 200
                });
            }

        });
        setTimeout(this.refreshLoop.bind(this), this.refreshInterval);

    }

    degreesToRadians(degrees) {
        var pi = Math.PI;
        return degrees * (pi / 180);
    }

    /**
     * Toggle between sources
     */
    toggleActiveSource() {
        if (this.activesource < 1) {
            this.activesource = 1;
            this.layers[1].setVisible(true);
            this.layers[0].setVisible(false);

        } else {
            this.activesource = 0;
            this.layers[0].setVisible(true);
            this.layers[1].setVisible(false);
        }
    }
}