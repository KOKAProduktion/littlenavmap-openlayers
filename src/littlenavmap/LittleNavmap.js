


export default class LittleNavmap {

    fetch(url, success, failure) {
        fetch(url).then(response => response.text())
            .then(data => success(data)).catch((error) => {
                failure(error);
            });
    }

    getAircraftPosition() {

        this.fetch('http://littlenavmap.local/progress_doc.html', (data) => {


          

            console.log(data);
        })
    }


}