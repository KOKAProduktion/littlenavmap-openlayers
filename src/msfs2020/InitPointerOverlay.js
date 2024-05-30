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

/**
 * Required custom pointer overlay as ol canvas appears not to fire drag events
 * inside a MSFS2020 iframe.
 */
const InitPointerOverlay = (map) => {

    var view = map.getView();
    var zoom = 1;
    var previous_position = null;

    // flag mouse down state
    var mouseDown = false;
    document.body.onmousedown = function() {
        mouseDown = true;
    };
    document.body.onmouseup = function() {
        previous_position = null; // clear obsolete last position (end of drag)
        mouseDown = false;
    };

    // create mouse event overlay
    var pointer_overlay = document.createElement('div');
    pointer_overlay.classList.add("pointer_overlay");

    var padding = "50px";
    pointer_overlay.style.position = "absolute";
    pointer_overlay.style.left = padding;
    pointer_overlay.style.right = padding;
    pointer_overlay.style.top = padding;
    pointer_overlay.style.bottom = padding;
    // pointer_overlay.style.backgroundColor = "rgba(255, 0, 0, 0.5)";

    document.body.append(pointer_overlay);

    // propagate pan
    pointer_overlay.addEventListener('mousemove', function(e) {
        if (mouseDown) {
            if (previous_position) {

                // get offset in pixels
                var offset = [previous_position[0] - e.clientX, previous_position[1] - e.clientY];
                // get current coords from pixels
                var coords = map.getCoordinateFromPixel([e.clientX, e.clientY]);
                // get offset coords from pixels
                var offset_coords = map.getCoordinateFromPixel([e.clientX - offset[0], e.clientY - offset[1]]);

                // apply
                view.adjustCenter([coords[0] - offset_coords[0], coords[1] - offset_coords[1]]);

            }
            previous_position = [e.clientX, e.clientY];
        }
    });

    // propagate zoom
    pointer_overlay.addEventListener('wheel', function(e) {
        if (e.deltaY > 0 && zoom > view.getMinZoom()) {
            --zoom;
        } else if (e.deltaY < 0 && zoom < view.getMaxZoom()) {
            ++zoom;
        }
        view.animate({
            zoom: zoom,
            duration: 200
        });
    });

};

export default InitPointerOverlay;