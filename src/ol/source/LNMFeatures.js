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
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import { Style } from 'ol/style';
import { Icon } from 'ol/style';
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

        this.setLoader((extent, resolution, projection, success, failure) => {
            extent = this.map.getView().calculateExtent(this.map.getSize());
            const margin = Math.abs(extent[2] - extent[0]) / 6.666666; // compensate for LNM returning rect bitmap with golden cut margin 
            const lefttop = toLonLat([extent[0] + margin, extent[1] + margin], projection);
            const rightbottom = toLonLat([extent[2] - margin, extent[3] - margin], projection);

            const url = this.url + 'api/map/features' + "?leftlon=" + lefttop[0] + "&toplat=" + lefttop[1] + "&rightlon=" + rightbottom[0] + "&bottomlat=" + rightbottom[1];
            this.fetch(url, (response) => {
                    try {
                        const json = JSON.parse(response);
                        console.log(json);

                        json.airports.result.forEach(airport => {

                            let airportFeature = new Feature({
                                geometry: new Point(fromLonLat([airport.position.lon, airport.position.lat], projection))
                            });

                            let airportFeatureStyle = new Style({
                                image: new Icon({
                                    src: UserAircraftIcon,
                                    anchor: [0.5, 0.5],
                                    anchorXUnits: 'fraction',
                                    anchorYUnits: 'fraction',
                                    scale: 0.5
                                }),
                            });

                            airportFeature.setStyle(airportFeatureStyle);

                            this.addFeature(airportFeature);
                        });

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