import XYZ from 'ol/source/XYZ';

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

        const url =
            options.url !== undefined ?
            options.url :
            'http://littlenavmap.local/mapimage?format=png&quality=100&width=256&height=256';

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
        });

        this.setTileLoadFunction(this.defaultTileLoadFunction.bind(this));

    }

    defaultTileLoadFunction(imageTile, src) {
        const tileGrid = this.getTileGrid();

        const center = tileGrid.getTileCoordCenter(imageTile.getTileCoord());
        const origin = tileGrid.getTileCoordForCoordAndZ(imageTile.getTileCoord(),imageTile.getTileCoord()[0]);

        const extent = tileGrid.getTileCoordExtent(imageTile.getTileCoord());



        console.log(extent);






        imageTile.getImage().src = src +  "&lon="+center[0]*-1+"&lat="+center[1]*-1+"&distance=1200";
        //imageTile.getImage().src = src + "&leftlon="+extent[0]*-1+"&toplat="+extent[1]*-1+"&rightlon="+extent[2]*-1+"&bottomlat="+extent[3]*-1+""; // "&lon="+center[0]*-1+"&lat="+center[1]*-1+"&distance=10";
        //imageTile.getImage().src = src + "&leftlon=" + (origin[0] + extent[0]) * -1 + "&toplat=" + (origin[1] +extent[1]) * -1 + "&rightlon=" + (origin[0] +extent[2]) * -1 + "&bottomlat=" + (origin[1] +extent[3]) * -1 + ""; // "&lon="+center[0]*-1+"&lat="+center[1]*-1+"&distance=10";
    }
}