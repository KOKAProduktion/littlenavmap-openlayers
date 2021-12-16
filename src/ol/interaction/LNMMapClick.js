import {
    Interaction
} from "ol/interaction";

import VectorSource from 'ol/source/Vector';
import {
    Vector as VectorLayer
} from 'ol/layer';
import Point from 'ol/geom/Point';
import {
    boundingExtent,
} from 'ol/extent';
import {
    add
} from 'ol/coordinate';
import {
    toLonLat,
    fromLonLat
} from 'ol/proj';

import Feature from 'ol/Feature';
import fetchText from '../../util/fetchText';

/**
 * Default LNM map click handler
 */
class LNMMapClick extends Interaction {
    constructor(opt_options = {
        layer: undefined,
        url: undefined
    }) {
        super(opt_options)
        // Apply params
        if (opt_options.layer) {
            this.layer = opt_options.layer;
            this.source = this.layer.getSource();
        }
        this.url = opt_options.url;
    }

    /**
     * @override
     */
    handleEvent(event) {
        switch (event.type) {
            case "click":

                // setup map if no layer provided
                if (!this.layer) {
                    this.source = new VectorSource();
                    this.layer = new VectorLayer({
                        source: this.source,
                    });
                    this.getMap().addLayer(this.layer);
                }

                // handle
                this.getFeaturesAtPixelListener(event);

                return false; // prevent event propagation
            default:
                return true; // allow event propagation
        }
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
        return this.getFeaturesAtCoordinates(this.getMap().getCoordinateFromPixel(pixel))
    }

    /**
     * Get features by lat/lon
     * 
     * @param {import('ol/coordinate').Coordinate} coords 
     * @param {number} range the size of the rect to query
     */
    getFeaturesAtCoordinates(coords, range = 1) { // Note: range of 1 as result seems to pad the rect ATOW

        this.source.clear();

        let extendCoords = [];

        extendCoords.push(add(coords.map(x => x), [-1 * range, -1 * range]));
        extendCoords.push(add(coords.map(x => x), [1 * range, -1 * range]));
        extendCoords.push(add(coords.map(x => x), [1 * range, 1 * range]));
        extendCoords.push(add(coords.map(x => x), [-1 * range, 1 * range]));

        const extent = boundingExtent(extendCoords);

        // display extent polygon. Result seems to pad the rect ATOW
        // let boundFeatures = [];
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

        const projection = this.getMap().getView().getProjection();
        const lefttop = toLonLat([extent[0], extent[1]], projection);
        const rightbottom = toLonLat([extent[0], extent[3]], projection);

        const url = this.url + 'api/map/features' + "?leftlon=" + lefttop[0] + "&toplat=" + lefttop[1] + "&rightlon=" + rightbottom[0] + "&bottomlat=" + rightbottom[1] + "&detailfactor=13";
        fetchText(url, (response) => {
                try {
                    const json = JSON.parse(response);

                    // Expose as event
                    this.getMap().littlenavmap.dispatch("map/features", json);

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


                    this.source.addFeatures(airportFeatures);
                    this.source.addFeatures(ndbFeatures);
                    this.source.addFeatures(vorFeatures);
                    this.source.addFeatures(markerFeatures);


                } catch (e) {
                    console.log(e);
                }
            },
            (error) => {
                console.log("error");
            }
        );


    }

}


export default LNMMapClick;