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

import LNM from '../ol/source/LNM';
import TileDebug from 'ol/source/TileDebug';
import OSM from 'ol/source/OSM';
import UserAircraftIcon from '../assets/svg/aircraft_small_user.svg';

import View from 'ol/View';
import Point from 'ol/geom/Point';
import {
    Icon,
    Style
} from 'ol/style';
import {
    Tile as TileLayer,
    Vector as VectorLayer
} from 'ol/layer';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';

import {
    fromLonLat
} from 'ol/proj';

import FollowControl from '../ol/control/FollowControl';
import RefreshControl from '../ol/control/RefreshControl';
import {
    Attribution
} from 'ol/control';

import {
    tile as loadingStrategy
} from 'ol/loadingstrategy';
import {
    toLonLat,
    toUserCoordinate
} from 'ol/proj';

import {
    createXYZ
} from 'ol/tilegrid';

/**
 * Littlenavmap - openlayers controller
 * 
 * - Inits and holds openlayers components and map
 * - Requests sim info from LNM html's
 * - Runs the refresh loop
 */
export default class LittleNavmap {
    constructor(url, target) {
        this.url = url;
        this.target = target;
        this.refreshInterval = 1000;

        // ol sources
        this.sources = [new LNM({
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


        const vectorSource = new VectorSource({
            loader: (extent, resolution, projection, success, failure) => {
                // extent = this.map.getView().calculateExtent(this.map.getSize());
                const lefttop = toLonLat([extent[0], extent[1]], projection);
                const rightbottom = toLonLat([extent[2], extent[3]], projection);

                const url = this.url + 'api/map/features' + "?leftlon=" + lefttop[0] + "&toplat=" + lefttop[1] + "&rightlon=" + rightbottom[0] + "&bottomlat=" + rightbottom[1];
                this.fetch(url, (response) => {
                        try {
                            const json = JSON.parse(response);
                            console.log(json);

                            json.airports.result.forEach(airport => {

                                let airportFeature = new Feature({
                                    geometry: new Point(toLonLat([airport.position.lon * 100000, airport.position.lat * 100000], projection))
                                });

                                let airportFeatureStyle = new Style({
                                    image: new Icon({
                                        src: UserAircraftIcon,
                                        anchor: [0.5, 0.5],
                                        anchorXUnits: 'fraction',
                                        anchorYUnits: 'fraction',
                                        scale: 0.5
                                    }),
                                });

                                airportFeature.setStyle(airportFeatureStyle);

                                vectorSource.addFeature(airportFeature);
                            });

                        } catch (e) {
                            console.log(e);
                        }
                    },
                    (error) => {
                        console.log("error");
                        failure()
                    },
                );
            },
            strategy: loadingStrategy(
                createXYZ({
                    tileSize: 512,
                })
            ),
        });

        const vector = new VectorLayer({
            source: vectorSource
        });

        this.layers.push(vector);

        // init ol map
        this.map = new Map({
            controls: controls,
            layers: this.layers,
            target: this.target,
            view: new View({
                //maxZoom: 13, // Remember source settings
                minZoom: 4
            })
        });

        // refresh tile at pixel (debugging)
        // this.map.on('click', function (event) {
        //     this.map.forEachLayerAtPixel(event.pixel, function (layer) {
        //         if (layer.getClassName() == "lnm-layer-0" || layer.getClassName() == "lnm-layer-1") {
        //             this.sources[activesource].updateTileAtPixel(event.pixel, this.map);
        //         }
        //     });
        // });

    }

    setupAircraftFeature() {
        this.aircraftFeature = new Feature({
            geometry: new Point([0, 0]),
        });

        this.aircraftFeatureStyle = new Style({
            image: new Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: UserAircraftIcon,
                scale: 0.5,
                opacity: 0
            }),
        });

        this.aircraftFeature.setStyle(this.aircraftFeatureStyle);

        const vectorSource = new VectorSource({
            features: [this.aircraftFeature],
        });

        const vectorLayer = new VectorLayer({
            source: vectorSource,
        });

        this.layers.push(vectorLayer);
    }

    /**
     * Fetch implementation
     * 
     * @param {string} url 
     * @param {Function} success 
     * @param {Function} failure 
     */
    fetch(url, success, failure) {
        fetch(url).then(response => response.text())
            .then(data => success(data)).catch((error) => {
                failure(error);
            });
    }

    /**
     * Retrieve aircraft position from LNM
     * @param {Function} success 
     */
    getAircraftPosition(success) {

        this.fetch(this.url + 'api/sim/info', (data) => {
            try {
                const json = JSON.parse(data);
                if (json.active) {
                    this.setAircraftFeatureVisibility(true);
                    success([json.position.lon, json.position.lat], json.heading);
                } else {
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
     * Show/hide the user aircraft feature
     * @param {boolean} visible 
     */
    setAircraftFeatureVisibility(visible) {
        if (visible && this.aircraftFeature.getStyle().getImage().getOpacity() == 0) {
            this.aircraftFeature.getStyle().getImage().setOpacity(1);
        } else if (!visible && this.aircraftFeature.getStyle().getImage().getOpacity() == 1) {
            this.aircraftFeature.getStyle().getImage().setOpacity(0);
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

            this.aircraftFeature.setGeometry(new Point(lonlat))
            this.aircraftFeatureStyle.getImage().setRotation(this.degreesToRadians(heading));

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