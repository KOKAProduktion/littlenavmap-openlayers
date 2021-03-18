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