import { Control } from 'ol/control';
import PlaneSVG from '../../assets/svg/aircraft_small_user.svg';

const FollowControl = /*@__PURE__*/ (function(Control) {

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