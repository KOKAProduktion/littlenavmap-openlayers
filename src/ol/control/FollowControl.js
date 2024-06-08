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
import PlaneSVG from '../../assets/svg/aircraft_small_user.svg';

class FollowControl extends Control {

    #handleFollowCallback;
    #toggle = true;
    #element;

    constructor(opt_options) {
        const options = opt_options || {};

        const  button = document.createElement('button');
        button.innerHTML = '<img src="' + PlaneSVG + '">';

        const element = document.createElement('div');
        element.className = 'follow-control on ol-unselectable ol-control';
        element.appendChild(button);

        super({
            element: element,
            target: options.target
        });

        this.#element = element;
        this.#handleFollowCallback = opt_options.handleFollow;

        button.addEventListener('click', this.handleFollow.bind(this), false);
    }

    handleFollow() {
        this.#toggle = !this.#toggle;
        var add, remove;
        [add, remove] = this.#toggle ? ["on", "off"] : ["off", "on"];
        this.#element.classList.add(add);
        this.#element.classList.remove(remove);
        this.#handleFollowCallback();
    }
}

export default FollowControl;