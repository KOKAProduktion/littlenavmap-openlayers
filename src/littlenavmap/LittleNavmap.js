export default class LittleNavmap {

    fetch(url, success, failure) {
        fetch(url).then(response => response.text())
            .then(data => success(data)).catch((error) => {
                failure(error);
            });
    }

    /**
     * Retrieve aircraft position from LNM
     * @param {Function} success 
     */
    getAircraftPosition(success) {

        this.fetch('http://littlenavmap.local/progress_doc.html', (data) => {

            // Using native parser (for ingame panel/iframe compatibility)
            const parser = new DOMParser();

            // fix incomplete LNM markup (missing table tag) before parsing
            data = data.replace("<h4>Position</h4>", "<table><h4>Position</h4>");

            // parse to document
            const html = parser.parseFromString(data, "text/html");

            // extract and parse position string
            var nodes = html.querySelectorAll('td');

            // DMS string is located inside the last td
            var coordstr = nodes[nodes.length - 1].textContent.replace(/,/g, "."); // swap , for .
            var coords = this.ParseDMS(coordstr);

            success(coords);

        }, (error) => {
            console.log(error);
        })
    }

    /**
     * Parses DMS string ("deg min sec dir, deg min sec dir") to decimal degrees (lon, lat)
     * @see https://stackoverflow.com/a/1140335
     */
    ParseDMS(input) {
        var parts = input.split(/[^\d\w!.]+/);

        var lat = this.ConvertDMSToDD(parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2]), parts[3]);
        var lon = this.ConvertDMSToDD(parseFloat(parts[4]), parseFloat(parts[5]), parseFloat(parts[6]), parts[7]);

        return [lon, lat];
    }

    /**
     * Converts DMS to decimal degrees
     * @see https://stackoverflow.com/a/1140335
     */
    ConvertDMSToDD(degrees, minutes, seconds, direction) {

        var dd = degrees + minutes / 60 + seconds / (60 * 60);

        if (direction == "S" || direction == "W") {
            dd = dd * -1;
        } // Don't do anything for N or E
        return dd;
    }


}