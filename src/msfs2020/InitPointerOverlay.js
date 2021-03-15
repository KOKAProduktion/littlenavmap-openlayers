/**
 * Required custom pointer overlay as ol canvas appears not to fire drag events
 * inside a MSFS2020 iframe.
 */
const InitPointerOverlay = (map) => {

    var view = map.getView();
    var zoom = 1;
    var previous_position = null;

    // flag mouse down
    var mouseDown = false;
    document.body.onmousedown = function () {
        mouseDown = true;
    }
    document.body.onmouseup = function () {
        previous_position = null; // clear obsolete last position (end of drag)
        mouseDown = false;
    }

    // mouse event overlay
    var pointer_overlay = document.getElementById("pointer_overlay");

    // add pan
    pointer_overlay.addEventListener('mousemove', function (e) {
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

    // add zoom
    pointer_overlay.addEventListener('wheel', function (e) {
        if (e.deltaY > 0 && zoom < view.getMaxZoom()) {
            zoom += 1;
        } else if (e.deltaY < 0 && zoom > view.getMinZoom()) {
            zoom -= 1;
        }
        view.setZoom(zoom);
    });

}

export default InitPointerOverlay;