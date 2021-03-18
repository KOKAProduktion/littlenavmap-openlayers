import Map from 'ol/Map';

import LNM from '../ol/source/LNM';
import TileDebug from 'ol/source/TileDebug';
import OSM from 'ol/source/OSM';

import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';

import {
    fromLonLat
} from 'ol/proj';

import FollowControl from '../ol/control/FollowControl';
import RefreshControl from '../ol/control/RefreshControl';

/**
 * Littlenavmap - openlayers controller
 * 
 * - Inits and holds openlayers components and map
 * - Requests sim info
 * - Runs the refresh loop
 */
export default class LittleNavmap {


    constructor() {

        // ol components
        this.sources = [new LNM(), new LNM()];
        this.activesource = 0;
        this.layers = [

            new TileLayer({
                source: this.sources[0],
                className: "lnm-layer-0",
                visible: true
            }),
            new TileLayer({
                source: this.sources[1],
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
            })
        ];

        // init ol map
        this.map = new Map({
            controls: controls,
            layers: this.layers,
            target: 'map',
            view: new View({
                maxZoom: 13,
                minZoom: 3
            })
        });

        // Refresh tile at pixel (debugging purpose)
        // this.map.on('click', function (event) {
        //     this.map.forEachLayerAtPixel(event.pixel, function (layer) {
        //         if (layer.getClassName() == "lnm-layer-0" || layer.getClassName() == "lnm-layer-1") {
        //             this.sources[activesource].updateTileAtPixel(event.pixel, this.map);
        //         }
        //     });
        // });

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

        // note: This is a hack extracting the required info from html.
        this.fetch('http://littlenavmap.local/progress_doc.html', (data) => {

            // Using native parser (for ingame panel/iframe compatibility)
            const parser = new DOMParser();

            // fix incomplete LNM markup (missing table tag) before parsing
            data = data.replace("<h4>Position</h4>", "<table><h4>Position</h4>");

            // parse to document
            const html = parser.parseFromString(data, "text/html");

            // extract and parse position string
            var nodes = html.querySelectorAll('td');

            if (nodes.length > 0) {
                // DMS string is located inside the last td
                var coordstr = nodes[nodes.length - 1].textContent.replace(/,/g, "."); // swap , for .
                var coords = this.ParseDMS(coordstr);

                success(coords);
            }
        }, (error) => {
            console.log(error);
        });
    }

    /**
     * Parse DMS string ("deg min sec dir, deg min sec dir") to decimal degrees (lon, lat)
     * @see https://stackoverflow.com/a/1140335
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
        setTimeout(this.refreshLoop.bind(this), 1000); // delay first loop
    }

    /**
     * Loop
     */
    refreshLoop() {

        this.getAircraftPosition((coords) => {

            // swap active source
            this.toggleActiveSource();

            // get map plane coords
            const lonlat = fromLonLat(coords);

            if (this.following) {
                // center to position
                this.map.getView().animate({
                    center: lonlat,
                    duration: 200
                });
            }

            // update image on hidden source (avoid flickering)
            this.sources[this.activesource == 0 ? 1 : 0].updateTileAtLonLat(lonlat, this.map);

        });
        setTimeout(this.refreshLoop.bind(this), 1000);

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