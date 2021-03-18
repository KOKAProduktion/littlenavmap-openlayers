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

const FollowControl = /*@__PURE__*/ (function (Control) {

    var handleFollowCallback;
    var toggle = true;
    var element = document.createElement('div');

    function FollowControl(opt_options) {
        var options = opt_options || {};

        handleFollowCallback = opt_options.handleFollow;

        var button = document.createElement('button');
        button.innerHTML = '<img src="' + PlaneSVG + '" />';

        element.className = 'follow-control on ol-unselectable ol-control';
        element.appendChild(button);

        Control.call(this, {
            element: element,
            target: options.target,
        });

        button.addEventListener('click', this.handleFollow.bind(this), false);
    }

    if (Control) FollowControl.__proto__ = Control;
    FollowControl.prototype = Object.create(Control && Control.prototype);
    FollowControl.prototype.constructor = FollowControl;

    FollowControl.prototype.handleFollow = function handleFollow() {
        toggle = !toggle;
        if (toggle) {
            element.className = 'follow-control on ol-unselectable ol-control';
        } else {
            element.className = 'follow-control off ol-unselectable ol-control';
        }
        handleFollowCallback();
    };

    return FollowControl;
}(Control));

export default FollowControl;