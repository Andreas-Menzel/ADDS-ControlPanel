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


    setValues(gpsLat, gpsLon, altitude) {
        this.#dataValid = true;

        this.#gpsLat = gpsLat;
        this.#gpsLon = gpsLon;

        this.#altitude = altitude;
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