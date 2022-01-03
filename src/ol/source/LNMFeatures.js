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
import VectorSource from 'ol/source/Vector';
import {
    all as loadingStrategy
} from 'ol/loadingstrategy';
import {
    toLonLat,
    fromLonLat
} from 'ol/proj';
import fetchText from '../../util/fetchText';
import {
    Feature
} from 'ol';
import Point from 'ol/geom/Point';
import {
    Style
} from 'ol/style';
import {
    Icon
} from 'ol/style';
import UserAircraftIcon from '../../assets/svg/aircraft_small_user.svg';

/**
 * @param {Extent} extent
 */
export default class LNMFeatures extends VectorSource {

    constructor(map, url, opt_options = {}) {

        opt_options.loadingStrategy = loadingStrategy;

        super(opt_options);

        this.fetch = fetchText;
        this.url = url;
        this.map = map;

        let airportFeatureStyle = new Style({
            image: new Icon({
                src: UserAircraftIcon,
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                scale: 0.5
            }),
        });

        this.setLoader((extent, resolution, projection, success, failure) => {
            extent = this.map.getView().calculateExtent(this.map.getSize());
            const margin = Math.abs(extent[2] - extent[0]) / 4; // compensate for LNM returning rect bitmap with golden cut margin 
            const lefttop = toLonLat([extent[0] + margin, extent[1] + margin], projection);
            const rightbottom = toLonLat([extent[2] - margin, extent[3] - margin], projection);

            const url = this.url + 'api/map/features' + "?leftlon=" + lefttop[0] + "&toplat=" + lefttop[1] + "&rightlon=" + rightbottom[0] + "&bottomlat=" + rightbottom[1] + "&detailfactor=13";
            this.fetch(url, (response) => {
                    try {
                        const json = JSON.parse(response);
                        console.log(json);

                        let airportFeatures = [];

                        json.airports.result.forEach(airport => {

                            let feature = new Feature({
                                geometry: new Point(fromLonLat([airport.position.lon, airport.position.lat], projection))
                            });
                            feature.setStyle(airportFeatureStyle);

                            airportFeatures.push(feature);
                        });

                        let ndbFeatures = [];

                        json.ndbs.result.forEach(ndb => {

                            let feature = new Feature({
                                geometry: new Point(fromLonLat([ndb.position.lon, ndb.position.lat], projection))
                            });
                            feature.setStyle(airportFeatureStyle);

                            ndbFeatures.push(feature);
                        });

                        let vorFeatures = [];

                        json.vors.result.forEach(vor => {

                            let feature = new Feature({
                                geometry: new Point(fromLonLat([vor.position.lon, vor.position.lat], projection))
                            });
                            feature.setStyle(airportFeatureStyle);

                            vorFeatures.push(feature);
                        });

                        let markerFeatures = [];

                        json.markers.result.forEach(marker => {

                            let feature = new Feature({
                                geometry: new Point(fromLonLat([marker.position.lon, marker.position.lat], projection))
                            });
                            feature.setStyle(airportFeatureStyle);

                            markerFeatures.push(feature);
                        });

                        let waypointFeatures = [];

                        json.waypoints.result.forEach(waypoint => {

                            let feature = new Feature({
                                geometry: new Point(fromLonLat([waypoint.position.lon, waypoint.position.lat], projection))
                            });
                            feature.setStyle(airportFeatureStyle);

                            waypointFeatures.push(feature);
                        });

                        this.addFeatures(airportFeatures);
                        this.addFeatures(ndbFeatures);
                        this.addFeatures(vorFeatures);
                        this.addFeatures(markerFeatures);
                        this.addFeatures(waypointFeatures);

                    } catch (e) {
                        console.log(e);
                    }
                },
                (error) => {
                    console.log("error");
                    failure();
                }
            );
        });

    }

}