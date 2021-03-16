import Projection from 'ol/proj/projection';
import XYZ from 'ol/source/XYZ';
import TileGrid from 'ol/tileGrid/TileGrid';
import { toLonLat } from 'ol/proj';

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

const ATTRIBUTION =
    '&#169; ' +
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> ' +
    'contributors.';

proj4.defs('EPSG:21781',
    '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 ' +
    '+x_0=600000 +y_0=200000 +ellps=bessel ' +
    '+towgs84=660.077,13.551,369.344,2.484,1.783,2.939,5.66 +units=m +no_defs');
proj4.defs(
    'EPSG:27700',
    '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
    '+x_0=400000 +y_0=-100000 +ellps=airy ' +
    '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
    '+units=m +no_defs'
);
proj4.defs(
    'EPSG:23032',
    '+proj=utm +zone=32 +ellps=intl ' +
    '+towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs'
);
proj4.defs(
    'EPSG:5479',
    '+proj=lcc +lat_1=-76.66666666666667 +lat_2=' +
    '-79.33333333333333 +lat_0=-78 +lon_0=163 +x_0=7000000 +y_0=5000000 ' +
    '+ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);
proj4.defs(
    'EPSG:21781',
    '+proj=somerc +lat_0=46.95240555555556 ' +
    '+lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel ' +
    '+towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs'
);
proj4.defs(
    'EPSG:3413',
    '+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +k=1 ' +
    '+x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs'
);
proj4.defs(
    'EPSG:2163',
    '+proj=laea +lat_0=45 +lon_0=-100 +x_0=0 +y_0=0 ' +
    '+a=6370997 +b=6370997 +units=m +no_defs'
);
proj4.defs(
    'ESRI:54009',
    '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 ' + '+units=m +no_defs'
);
register(proj4);

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
        const size = [256, 256];

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
            maxZoom: options.maxZoom !== undefined ? options.maxZoom : 19,
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



        console.log(this);
    }

    defaultTileLoadFunction(imageTile, src) {
        const tileGrid = this.getTileGrid();

        const extent = tileGrid.getTileCoordExtent(imageTile.getTileCoord()); //tileGrid.getTileCoordExtent(imageTile.getTileCoord());

        const center = tileGrid.getTileCoordCenter(imageTile.getTileCoord());

        const margin = 200000;

        const lefttop = toLonLat([extent[0] + margin, extent[1] + margin], this.getProjection())
        const rightbottom = toLonLat([extent[2] - margin, extent[3] - margin], this.getProjection())

        const centerLonLat = toLonLat([center[0], center[1]], this.getProjection());

        console.log(0, lefttop);
        console.log(1, rightbottom);

        imageTile.getImage().src = src + "&leftlon=" + lefttop[0] + "&toplat=" + lefttop[1] + "&rightlon=" + rightbottom[0] + "&bottomlat=" + rightbottom[1] + ""; // "&lon="+center[0]*-1+"&lat="+center[1]*-1+"&distance=10";
        //imageTile.getImage().src = src + "&lon=" + centerLonLat[0] + "&lat=" + centerLonLat[1] + "&distance="+2000 / (imageTile.getTileCoord()[0] - 1);
    }
}