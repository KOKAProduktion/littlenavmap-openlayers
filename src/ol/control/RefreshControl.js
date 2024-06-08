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

import {
    Control
} from 'ol/control';
import RefreshSVG from '../../assets/svg/refresh-solid.svg';

class RefreshControl extends Control {

    #handleRefreshCallback;
    #element;

    constructor(opt_options) {
        var options = opt_options || {};

        var button = document.createElement('button');
        button.innerHTML = '<img src="' + RefreshSVG + '">';

        const element = document.createElement('div');
        element.className = 'refresh-control on ol-unselectable ol-control';
        element.appendChild(button);

        super({
            element: element,
            target: options.target,
        });

        this.#element = element;
        this.#handleRefreshCallback = opt_options.handleRefresh;

        button.addEventListener('click', this.handleRefresh.bind(this), false);
    }

    handleRefresh() {
        this.#handleRefreshCallback();
    }
}

export default RefreshControl;