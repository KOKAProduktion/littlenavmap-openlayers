import XYZ from 'ol/source/XYZ';
import { toLonLat } from 'ol/proj';

// import proj4 from 'proj4';
// import { register } from 'ol/proj/proj4';

const LNM_ZOOM_DISTANCES_METERS = [
    40,
    50,
    110,
    200,
    400,
    900,
    1700,
    3400,
    6800,
    13600,
    27000,
    55000,
    109000,
    218000,
    436000,
    872000,
    1745000,
    3489000,
    6978000,
    13956000,
    19849000
];


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

        const res = [256, 256];
        const size = [256, 300];

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

        const extent = tileGrid.getTileCoordExtent(imageTile.getTileCoord()); //tileGrid.getTileCoordExtent(imageTile.getTileCoord());

        const center = tileGrid.getTileCoordCenter(imageTile.getTileCoord());

        const margin = Math.abs(extent[2] - extent[0]) / 6.6666;

        const lefttop = toLonLat([extent[0] + margin, extent[1] + margin], this.getProjection())
        const rightbottom = toLonLat([extent[2] - margin, extent[3] - margin], this.getProjection())

        const centerLonLat = toLonLat([center[0], center[1]], this.getProjection());

        // console.log(0, lefttop);
        // console.log(1, rightbottom);

        imageTile.getImage().src = src + "&leftlon=" + lefttop[0] + "&toplat=" + lefttop[1] + "&rightlon=" + rightbottom[0] + "&bottomlat=" + rightbottom[1] + ""; // "&lon="+center[0]*-1+"&lat="+center[1]*-1+"&distance=10";
        //imageTile.getImage().src = src + "&lon=" + centerLonLat[0] + "&lat=" + centerLonLat[1] + "&distance="+2000 / (imageTile.getTileCoord()[0] - 1);
    }
}