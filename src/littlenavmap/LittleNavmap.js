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
import UserAircraftIcon from '../assets/svg/aircraft_small_user.svg';

import View from 'ol/View';
import Point from 'ol/geom/Point';
import {
    Icon,
    Style,
    Fill,
    Stroke,
    Text
} from 'ol/style';
import {
    Tile as TileLayer,
    Vector as VectorLayer
} from 'ol/layer';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';

import FollowControl from '../ol/control/FollowControl';
import RefreshControl from '../ol/control/RefreshControl';
import {
    Attribution
} from 'ol/control';

import {
    toLonLat,
    fromLonLat
} from 'ol/proj';

import fetchText from '../util/fetchText';
import {
    boundingExtent,
} from 'ol/extent';
import {
    add
} from 'ol/coordinate';


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
            layers: this.layers,
            target: this.target,
            view: new View({
                //maxZoom: 13, // Remember source settings
                minZoom: 4
            })
        });

        // Note: must be called after this.map initialization
        this.setupMapFeatures();

        // Add nearest objects call
        this.map.on('click', this.getFeaturesAtPixelListener.bind(this))

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
     * Setup layer of requested map features
     * Requires this.map already to be initialized
     */
    setupMapFeatures() {
        // Add extent dependent map features source
        this.featuresSource = new VectorSource();
        this.featuresLayer = new VectorLayer({
            source: this.featuresSource,
        });
        this.map.addLayer(this.featuresLayer);
    }

    /**
     * Add layer of the users sim aircraft map feature
     */
    setupAircraftFeature() {

        // setup aircraft icon
        this.aircraftFeature = new Feature({
            geometry: new Point([0, 0]),
        });

        this.aircraftFeatureStyle = new Style({
            image: new Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: UserAircraftIcon,
                scale: 0.5
            }),
        });

        this.aircraftFeature.setStyle(this.aircraftFeatureStyle);

        // setup aircraft icon label
        this.aircraftLabelFeature = new Feature({
            geometry: new Point([0, 0]),
        });

        this.aircraftLabelFeatureStyle = new Style({
            fill: new Fill({
                color: 'rgba(255,255,255,0.4)'
            }),
            stroke: new Stroke({
                color: '#3399CC',
                width: 1.25
            }),
            text: new Text({
                text: '1',
                textAlign: 'left',
                fill: new Fill({
                    color: '#000000'
                }),
                stroke: new Stroke({
                    color: '#FFFF99',
                    width: 3.5
                })
            })
        })

        this.aircraftLabelFeature.setStyle(this.aircraftLabelFeatureStyle);

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
        if (visible && this.aircraftFeature.getStyle() == null) {
            this.aircraftFeature.setStyle(this.aircraftFeatureStyle);
            this.aircraftLabelFeature.setStyle(this.aircraftLabelFeatureStyle);
        } else if (!visible && this.aircraftFeature.getStyle() != null) {
            this.aircraftFeature.setStyle(null);
            this.aircraftLabelFeature.setStyle(null);
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
     * Listener for clicks with screen coords (pixel)
     * @param {Event} event 
     * @returns 
     */
    getFeaturesAtPixelListener(event) {
        return this.getFeaturesAtPixel(event.pixel);
    }

    /**
     * Get features by screen coords
     * @param {number[]} pixel 
     * @returns 
     */
    getFeaturesAtPixel(pixel) {
        return this.getFeaturesAtCoordinates(this.map.getCoordinateFromPixel(pixel))
    }

    /**
     * Get features by lat/lon
     * 
     * @param {import('ol/coordinate').Coordinate} coords 
     * @param {number} range the size of the rect to query
     */
    getFeaturesAtCoordinates(coords, range = 1) { // Note: range of 1 as result seems to pad the rect ATOW

        this.featuresSource.clear();

        let boundFeatures = [];
        let extendCoords = [];

        extendCoords.push(add(coords.map(x => x), [-1 * range, -1 * range]));
        extendCoords.push(add(coords.map(x => x), [1 * range, -1 * range]));
        extendCoords.push(add(coords.map(x => x), [1 * range, 1 * range]));
        extendCoords.push(add(coords.map(x => x), [-1 * range, 1 * range]));

        const extent = boundingExtent(extendCoords);

        // display extent polygon. Result seems to pad the rect ATOW
        // let extentPolygonFeature;
        // extentPolygonFeature = new Feature({
        //     geometry: new Polygon([
        //         [
        //             [extent[0], extent[1]],
        //             [extent[2], extent[1]],
        //             [extent[2], extent[3]],
        //             [extent[0], extent[3]]
        //         ]
        //     ])
        // }, );
        // extentPolygonFeature.setStyle(new Style({
        //     stroke: new Stroke({
        //         color: 'blue',
        //         width: 3,
        //     }),
        //     fill: new Fill({
        //         color: 'rgba(0, 0, 255, 0.1)',
        //     }),
        // }));
        // boundFeatures.push(extentPolygonFeature);
        // this.featuresSource.addFeatures(boundFeatures);

        const projection = this.map.getView().getProjection();
        const lefttop = toLonLat([extent[0], extent[1]], projection);
        const rightbottom = toLonLat([extent[0], extent[3]], projection);

        const url = this.url + 'api/map/features' + "?leftlon=" + lefttop[0] + "&toplat=" + lefttop[1] + "&rightlon=" + rightbottom[0] + "&bottomlat=" + rightbottom[1] + "&detailfactor=13";
        fetchText(url, (response) => {
                try {
                    const json = JSON.parse(response);
                    console.log(json);

                    let airportFeatures = [];
                    let i = 0;
                    json.airports.result.forEach(airport => {

                        let feature = new Feature({
                            geometry: new Point(fromLonLat([airport.position.lon, airport.position.lat], projection))
                        }, );

                        airportFeatures.push(feature);
                        ++i;
                    });

                    let ndbFeatures = [];

                    json.ndbs.result.forEach(ndb => {

                        let feature = new Feature({
                            geometry: new Point(fromLonLat([ndb.position.lon, ndb.position.lat], projection))
                        });

                        ndbFeatures.push(feature);
                        ++i;
                    });

                    let vorFeatures = [];

                    json.vors.result.forEach(vor => {

                        let feature = new Feature({
                            geometry: new Point(fromLonLat([vor.position.lon, vor.position.lat], projection))
                        });

                        vorFeatures.push(feature);
                        ++i;
                    });

                    let markerFeatures = [];

                    json.markers.result.forEach(marker => {

                        let feature = new Feature({
                            geometry: new Point(fromLonLat([marker.position.lon, marker.position.lat], projection))
                        });

                        markerFeatures.push(feature);
                        ++i;
                    });


                    this.featuresSource.addFeatures(airportFeatures);
                    this.featuresSource.addFeatures(ndbFeatures);
                    this.featuresSource.addFeatures(vorFeatures);
                    this.featuresSource.addFeatures(markerFeatures);


                } catch (e) {
                    console.log(e);
                }
            },
            (error) => {
                console.log("error");
            }
        );


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
            this.aircraftFeatureStyle.getImage().setRotation(this.degreesToRadians(heading));

            // update aircraft label feature
            this.aircraftLabelFeature.setGeometry(new Point(lonlat));
            this.aircraftLabelFeatureStyle.getText().setText("GS " + this.simInfo.ground_speed.toFixed(0) + "kts\nALT " + this.simInfo.indicated_altitude.toFixed(0) + "ft")

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