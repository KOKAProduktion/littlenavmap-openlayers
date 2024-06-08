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

import XYZ from 'ol/source/XYZ';
import {
    toLonLat
} from 'ol/proj';

// import proj4 from 'proj4';
// import { register } from 'ol/proj/proj4';

const ATTRIBUTION =
    '&#169; ' +
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> | &#169; <a href="https://opentopomap.org" target="_blank">OpenTopoMap</a> | <a href="https://albar965.github.io/littlenavmap.html" target="_blank">Little Navmap</a> ' +
    '';

/**
 * Custom openlayers tiled source implementation for 
 * the Little Navmap server
 * 
 * - handling map grid and tiles
 * - translating ol tile coordinates to LNM rect URL's
 * - refreshing single tiles
 */
export default class LNMTileGrid extends XYZ {

    constructor(opt_options) {
        const options = opt_options || {};

        let attributions;
        if (options.attributions !== undefined) {
            attributions = options.attributions;
        } else {
            attributions = [ATTRIBUTION];
        }

        const crossOrigin =
            options.crossOrigin !== undefined ? options.crossOrigin : undefined;

        const res = [256, 256]; // requested resolution
        const size = [256, 300]; // returning resolution : LNM appears to return non-square images disregarding 'res' height param

        const url =
            options.url !== undefined ?
            options.url + 'api/map/image?format=png&quality=0&width=' + res[0] + '&height=' + res[1] :
            undefined;

        super({
            attributions: attributions,
            attributionsCollapsible: false,
            cacheSize: options.cacheSize,
            crossOrigin: crossOrigin,
            imageSmoothing: options.imageSmoothing,
            maxZoom: options.maxZoom !== undefined ? options.maxZoom : 19,  // Remember view settings
            minZoom: options.minZoom !== undefined ? options.minZoom : 4,   // see index.js defaults
            opaque: options.opaque !== undefined ? options.opaque : true,
            reprojectionErrorThreshold: options.reprojectionErrorThreshold,
            tileLoadFunction: options.tileLoadFunction ?
                options.tileLoadFunction : undefined,
            transition: options.transition,
            url: url,
            wrapX: options.wrapX,
            tileSize: [size[0], size[1]],
            projection: "EPSG:3857"
        });

        this.setTileLoadFunction(this.defaultTileLoadFunction.bind(this));
    }

    /**
     * Generate rect url from tile extent and update the tile's img src
     * @param {ImageTile} imageTile 
     * @param {string} src 
     */
    defaultTileLoadFunction(imageTile, src) {

        const tileGrid = this.getTileGrid();

        // get rect coordinates for tile
        const extent = tileGrid.getTileCoordExtent(imageTile.getTileCoord());
        const margin = Math.abs(extent[2] - extent[0]) / 6.6666; // compensate for LNM returning rect bitmap with golden cut margin 

        const lefttop = toLonLat([extent[0] + margin, extent[1] + margin], this.getProjection());
        const rightbottom = toLonLat([extent[2] - margin, extent[3] - margin], this.getProjection());

        // get image for tile
        imageTile.getImage().src = src + "&leftlon=" + lefttop[0] + "&toplat=" + lefttop[1] + "&rightlon=" + rightbottom[0] + "&bottomlat=" + rightbottom[1] + "&detailfactor=10" + "&reload=" + Math.random();
    }

    /**
     * Get aspect ratio of tile size
     * @returns number
     */
    getPixelRatio() {
        const size = this.tileGrid.getTileSize();
        return size[0] / size[1];
    }

    /**
     * Refresh tile at map/screen pixel
     * @param {array} pixel 
     * @param {Map} map 
     */
    updateTileAtPixel(pixel, map) {

        // get lonlat
        const coordinate = map.getCoordinateFromPixel(pixel);

        // update
        this.updateTileAtLonLat(coordinate, map);

    }

    /**
     * Refresh tile at ol coordinate
     * @param {array} coordinate 
     * @param {Map} map 
     */
    updateTileAtLonLat(coordinate, map) {

        // get tile
        const tileCoord = this.tileGrid.getTileCoordForCoordAndZ(coordinate, Math.round(map.getView().getZoom()));
        const tile = this.getTile(tileCoord[0], tileCoord[1], tileCoord[2], this.getPixelRatio(), this.getProjection());

        // update tile
        this.defaultTileLoadFunction(tile, this.getUrls()[0]);

        // re-render
        setTimeout(() => {
            map.renderSync();
        }, 200);

    }
}