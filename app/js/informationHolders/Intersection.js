class Intersection {

    #imageSourceName = './img/Intersection_';
    #imageSourceFileType = '.svg';
    #imageScale = 1.2;

    #id;

    #dataValid;

    #gpsLat;
    #gpsLon;

    #altitude;

    #lockedBy;


    constructor(id) {
        this.#id = id;
        this.setDefaultValues();
    }


    setDefaultValues() {
        this.#dataValid = false;

        this.#gpsLat = 0;
        this.#gpsLon = 0;

        this.#altitude = 0;

        this.#lockedBy = null;
    }


    setValues(gpsLat, gpsLon, altitude, lockedBy) {
        this.#dataValid = true;

        this.#gpsLat = gpsLat;
        this.#gpsLon = gpsLon;

        this.#altitude = altitude;

        this.#lockedBy = lockedBy;
    }


    getImageSource(color) {
        return this.#imageSourceName + color + this.#imageSourceFileType;
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

    getLockedBy() {
        return this.#lockedBy;
    }

}