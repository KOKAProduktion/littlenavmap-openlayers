import XYZ from 'ol/source/XYZ';
import { toLonLat } from 'ol/proj';

// import proj4 from 'proj4';
// import { register } from 'ol/proj/proj4';

const ATTRIBUTION =
    '&#169; ' +
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors. | <a href="https://albar965.github.io/littlenavmap.html" target="_blank">Little Navmap</a> ' +
    '';
export default class LNM extends XYZ {

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

        const res = [256, 256];
        const size = [256, 300]; // LNM appears to return non-square images disregarding 'res' height param

        const url =
            options.url !== undefined ?
            options.url :
            'http://littlenavmap.local/mapimage?format=png&quality=100&width=' + res[0] + '&height=' + res[1];

        super({
            attributions: attributions,
            attributionsCollapsible: false,
            cacheSize: options.cacheSize,
            crossOrigin: crossOrigin,
            imageSmoothing: options.imageSmoothing,
            maxZoom: options.maxZoom !== undefined ? options.maxZoom : 14,
            minZoom: options.minZoom !== undefined ? options.minZoom : 3,
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

    defaultTileLoadFunction(imageTile, src) {

        const tileGrid = this.getTileGrid();

        // get rect coordinates for tile
        const extent = tileGrid.getTileCoordExtent(imageTile.getTileCoord());
        const margin = Math.abs(extent[2] - extent[0]) / 6.6666; // compensate for LNM returning rect bitmap with golden cut margin 

        const lefttop = toLonLat([extent[0] + margin, extent[1] + margin], this.getProjection());
        const rightbottom = toLonLat([extent[2] - margin, extent[3] - margin], this.getProjection());

        // get image for tile
        imageTile.getImage().src = src + "&leftlon=" + lefttop[0] + "&toplat=" + lefttop[1] + "&rightlon=" + rightbottom[0] + "&bottomlat=" + rightbottom[1] + "&reload=" + Math.random();
    }

    getPixelRatio() {
        const size = this.tileGrid.getTileSize();
        return size[0] / size[1];
    }

    updateTileAtPixel(pixel, map) {

        // get lonlat
        const coordinate = map.getCoordinateFromPixel(pixel);

        // update
        this.updateTileAtLonLat(coordinate, map);

    }

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