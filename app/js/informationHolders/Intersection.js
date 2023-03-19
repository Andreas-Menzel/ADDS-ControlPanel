class Intersection {

    #imageSource = './img/intersection.svg';
    #imageScale = 1;

    #id;

    #dataValid;

    #gpsLat;
    #gpsLon;

    #altitude;


    constructor(id) {
        this.#id = id;
        this.setDefaultValues();
    }


    setDefaultValues() {
        this.#dataValid = false;

        this.#gpsLat = 0;
        this.#gpsLon = 0;

        this.#altitude = 0;
    }


    updateValues() {
        const payload = '{"intersection_id": "' + this.#id + '","data_type": "intersection_location"}';
        const handleResponse = () => {
            const response = JSON.parse(xhttp.responseText);
            if(response['executed']) {
                this.#dataValid = true;

                this.#gpsLat = response['response_data']['gps_lat'];
                this.#gpsLon = response['response_data']['gps_lon'];
    
                this.#altitude = response['response_data']['altitude'];
            }
        };
        const xhttp = new XMLHttpRequest();
        xhttp.onload = () => { handleResponse() };
        xhttp.open('GET', trafficControlUrl + 'ask/intersection_location?payload=' + payload + '&rand=' + new Date().getTime(), true);
        xhttp.send();
    }


    getImageSource() {
        return this.#imageSource;
    }
    getImageScale() {
        return this.#imageScale;
    }


    getId() {
        return this.#id;
    }

    getDataValid() {
        return this.#dataValid;
    }

    getGpsLat() {
        return this.#gpsLat;
    }
    getGpsLon() {
        return this.#gpsLon;
    }

    getAltitude() {
        return this.#altitude;
    }

}