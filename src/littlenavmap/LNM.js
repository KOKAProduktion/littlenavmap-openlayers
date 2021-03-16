import Projection from 'ol/proj/projection';
import XYZ from 'ol/source/XYZ';
import TileGrid from 'ol/tileGrid/TileGrid';
import { toLonLat } from 'ol/proj';

const ATTRIBUTION =
    '&#169; ' +
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> ' +
    'contributors.';

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

        const res = 270;

        const url =
            options.url !== undefined ?
                options.url :
                'http://littlenavmap.local/mapimage?format=png&quality=100&width=' + res + '&height=' + res;

        super({
            attributions: attributions,
            attributionsCollapsible: false,
            cacheSize: options.cacheSize,
            crossOrigin: crossOrigin,
            imageSmoothing: options.imageSmoothing,
            maxZoom: options.maxZoom !== undefined ? options.maxZoom : 19,
            opaque: options.opaque !== undefined ? options.opaque : true,
            reprojectionErrorThreshold: options.reprojectionErrorThreshold,
            tileLoadFunction: options.tileLoadFunction ?
                options.tileLoadFunction : undefined,
            transition: options.transition,
            url: url,
            wrapX: options.wrapX,
            tileSize: [res, res],
            projection: "EPSG:3857"
        });

        this.setTileLoadFunction(this.defaultTileLoadFunction.bind(this));

    }

    defaultTileLoadFunction(imageTile, src) {
        const tileGrid = this.getTileGrid();

        const extent = tileGrid.getTileCoordExtent(imageTile.getTileCoord()); //tileGrid.getTileCoordExtent(imageTile.getTileCoord());

        const center = tileGrid.getTileCoordCenter(imageTile.getTileCoord());

        const lefttop = toLonLat([extent[0], extent[1]])
        const rightbottom = toLonLat([extent[2], extent[3]])

        const centerLonLat = toLonLat([center[0], center[1]]);

        console.log(0, lefttop);
        console.log(1, rightbottom);

        imageTile.getImage().src = src + "&leftlon=" + lefttop[0] + "&toplat=" + lefttop[1] + "&rightlon=" + rightbottom[0] + "&bottomlat=" + rightbottom[1] + ""; // "&lon="+center[0]*-1+"&lat="+center[1]*-1+"&distance=10";
        //imageTile.getImage().src = src + "&lon=" + centerLonLat[0] + "&lat=" + centerLonLat[1] + "&distance="+2000 / (imageTile.getTileCoord()[0] - 1);
    }
}