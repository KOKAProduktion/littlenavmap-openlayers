import {
    Feature
} from "ol";
import {
    Icon,
    Style
} from "ol/style";
import UserAircraftIcon from '../../assets/svg/aircraft_small_user.svg';

class LNMUserAircraft extends Feature {
    constructor(opt_geometryOrProperties = {}) {
        super(opt_geometryOrProperties);

        this.defaultStyle = new Style({
            image: new Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: UserAircraftIcon,
                scale: 0.5
            }),
        })

        this.setStyle(this.defaultStyle)
    }

    isVisible() {
        return this.getStyle() != null
    }
    hide() {
        this.setStyle(null);
    }
    show() {
        this.setStyle(this.defaultStyle);
    }
    rotateImage(radians) {
        this.getStyle().getImage().setRotation(radians);
    }
}

export default LNMUserAircraft;