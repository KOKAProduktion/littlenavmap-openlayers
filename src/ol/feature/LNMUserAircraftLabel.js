import {
    Feature
} from "ol";
import {
    Style,
    Fill,
    Stroke,
    Text
} from 'ol/style';

class LNMUserAircraftLabel extends Feature {
    constructor(opt_geometryOrProperties = {}) {
        super(opt_geometryOrProperties);

        this.defaultStyle = new Style({
            fill: new Fill({
                color: 'rgba(255,255,255,0.4)'
            }),
            stroke: new Stroke({
                color: '#3399CC',
                width: 1.25
            }),
            text: new Text({
                text: '1',
                textAlign: 'left',
                fill: new Fill({
                    color: '#000000'
                }),
                stroke: new Stroke({
                    color: '#FFFF99',
                    width: 3.5
                })
            })
        })

        this.setStyle(this.defaultStyle)
    }

    updateText(text) {
        this.getStyle().getText().setText(text);
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
}

export default LNMUserAircraftLabel;