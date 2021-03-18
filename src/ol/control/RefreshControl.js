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

const RefreshControl = /*@__PURE__*/ (function (Control) {

    var handleRefreshCallback;
    var element = document.createElement('div');

    function RefreshControl(opt_options) {
        var options = opt_options || {};

        handleRefreshCallback = opt_options.handleRefresh;

        var button = document.createElement('button');
        button.innerHTML = '<img src="' + RefreshSVG + '" />';

        element.className = 'refresh-control on ol-unselectable ol-control';
        element.appendChild(button);

        Control.call(this, {
            element: element,
            target: options.target,
        });

        button.addEventListener('click', this.handleRefresh.bind(this), false);
    }

    if (Control) RefreshControl.__proto__ = Control;
    RefreshControl.prototype = Object.create(Control && Control.prototype);
    RefreshControl.prototype.constructor = RefreshControl;

    RefreshControl.prototype.handleRefresh = function handleRefresh() {
        handleRefreshCallback();
    };

    return RefreshControl;
}(Control));

export default RefreshControl;