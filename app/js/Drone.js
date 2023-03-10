class Drone {

    #demoIndex = 0;

    #droneImageSource = './img/drone.svg';
    #droneImageScale = 1;
    #takeoffLocationImageSource = './img/TakeoffLocation.svg';
    #takeoffLocationImageScale = 2;
    #landingLocationImageSource = './img/LandingLocation.svg';
    #landingLocationImageScale = 2;

    #drone_id;

    #gpsSignalLevel;
    #gpsSatellitesConnected;

    #gpsValid;
    #gpsLat;
    #gpsLon;

    #altitude;

    #pitch;
    #yaw;
    #roll;

    #velocityX;
    #velocityY;
    #velocityZ;


    #batteryRemaining;
    #batteryRemainingPercent;

    #remainingFlightTime;
    #remainingFlightRadius;


    #takeoffTime;
    #takeoffGpsValid;
    #takeoffGpsLat;
    #takeoffGpsLon;

    #landingTime;
    #landingGpsValid;
    #landingGpsLat;
    #landingGpsLon;

    #operationModes;


    setDemoIndex(demoIndex) {
        this.#demoIndex = demoIndex;
    }


    constructor(drone_id) {
        this.#drone_id = drone_id;
        this.setDefaultValues();
    }


    setDefaultValues() {
        this.#gpsSignalLevel = 0;
        this.#gpsSatellitesConnected = 0;

        this.#gpsValid = false;
        this.#gpsLat = 0;
        this.#gpsLon = 0;

        this.#altitude = 0;

        this.#pitch = 0;
        this.#yaw = 0;
        this.#roll = 0;

        this.#velocityX = 0;
        this.#velocityY = 0;
        this.#velocityZ = 0;


        this.#batteryRemaining = 0;
        this.#batteryRemainingPercent = 0;
        this.#remainingFlightTime = 0;
        this.#remainingFlightRadius = 0;


        this.#takeoffTime = 0;
        this.#takeoffGpsValid = false;
        this.#takeoffGpsLat = 0;
        this.#takeoffGpsLon = 0;

        this.#landingTime = 0;
        this.#landingGpsValid = false;
        this.#landingGpsLat = 0;
        this.#landingGpsLon = 0;

        this.#operationModes = [];
    }

    updateValues() {
        // Update AircraftLocation data
        const payloadAircraftLocation = '{"drone_id": "' + this.#drone_id + '","data_type": "aircraft_location"}';
        const handleAircraftLocationResponse = () => {
            this.updateAircraftLocationValues(JSON.parse(xhttpAircraftLocation.responseText));
        };
        const xhttpAircraftLocation = new XMLHttpRequest();
        xhttpAircraftLocation.onload = () => { handleAircraftLocationResponse() };
        xhttpAircraftLocation.open('GET', trafficControlUrl + 'ask/aircraft_location?payload=' + payloadAircraftLocation, true);
        xhttpAircraftLocation.send();

        // Update AircraftPower data
        const payloadAircraftPower = '{"drone_id": "' + this.#drone_id + '","data_type": "aircraft_power"}';
        const handleAircraftPowerResponse = () => {
            this.updateAircraftPowerValues(JSON.parse(xhttpAircraftPower.responseText));
        };
        const xhttpAircraftPower = new XMLHttpRequest();
        xhttpAircraftPower.onload = () => { handleAircraftPowerResponse() };
        xhttpAircraftPower.open('GET', trafficControlUrl + 'ask/aircraft_power?payload=' + payloadAircraftPower, true);
        xhttpAircraftPower.send();

        // Update FlightData data
        const payloadFlightData = '{"drone_id": "' + this.#drone_id + '","data_type": "flight_data"}';
        const handleFlightDataResponse = () => {
            this.updateFlightDataValues(JSON.parse(xhttpFlightData.responseText));
        };
        const xhttpFlightData = new XMLHttpRequest();
        xhttpFlightData.onload = () => { handleFlightDataResponse() };
        xhttpFlightData.open('GET', trafficControlUrl + 'ask/flight_data?payload=' + payloadFlightData, true);
        xhttpFlightData.send();
    }

    updateValuesFromDemoFlight(timeOffset = 0) {
        this.#demoIndex = (this.#demoIndex + 1 + demoFlightData.length) % demoFlightData.length;

        const tmpIndex = (this.#demoIndex + timeOffset + demoFlightData.length) % demoFlightData.length;

        const data = demoFlightData[tmpIndex];

        this.#gpsValid = data['gps_valid'];
        this.#gpsLat = data['gps_lat'];
        this.#gpsLon = data['gps_lon'];

        this.#altitude = data['altitude'];

        this.#pitch = data['pitch'];
        this.#yaw = data['yaw'];
        this.#roll = data['roll'];

        this.#velocityX = data['velocity_x'];
        this.#velocityY = data['velocity_y'];
        this.#velocityZ = data['velocity_z'];


        // TODO
        this.#batteryRemaining -= 1;
        this.#batteryRemainingPercent -= 1;
        this.#remainingFlightTime -= 10;
        this.#remainingFlightRadius -= 100;
        if (this.#batteryRemaining <= 0) this.#batteryRemaining = Math.random() * 5000;
        if (this.#batteryRemainingPercent <= 0) this.#batteryRemainingPercent = Math.random() * 100;
        if (this.#remainingFlightTime <= 0) this.#remainingFlightTime = Math.random() * 1500;
        if (this.#remainingFlightRadius <= 0) this.#remainingFlightRadius = Math.random() * 7000;
    }

    updateAircraftLocationValues(response) {
        this.#gpsSignalLevel = response['response_data']['gps_signal_level'];
        this.#gpsSatellitesConnected = response['response_data']['gps_satellites_connected'];

        this.#gpsValid = toBoolean(response['response_data']['gps_valid']);
        if (this.#gpsValid) {
            this.#gpsLat = response['response_data']['gps_lat'];
            this.#gpsLon = response['response_data']['gps_lon'];
        }

        this.#altitude = response['response_data']['altitude'];

        this.#pitch = response['response_data']['pitch'];
        this.#yaw = response['response_data']['yaw'];
        this.#roll = response['response_data']['roll'];

        this.#velocityX = response['response_data']['velocity_x'];
        this.#velocityY = response['response_data']['velocity_y'];
        this.#velocityZ = response['response_data']['velocity_z'];
    }

    updateAircraftPowerValues(response) {
        this.#batteryRemaining = response['response_data']['battery_remaining'];
        this.#batteryRemainingPercent = response['response_data']['battery_remaining_percent'];

        this.#remainingFlightTime = response['response_data']['remaining_flight_time'];
        this.#remainingFlightRadius = response['response_data']['remaining_flight_radius'];
    }

    updateFlightDataValues(response) {
        this.#takeoffTime = response['response_data']['takeoff_time'];
        this.#takeoffGpsValid = response['response_data']['takeoff_gps_valid'];
        this.#takeoffGpsLat = response['response_data']['takeoff_gps_lat'];
        this.#takeoffGpsLon = response['response_data']['takeoff_gps_lon'];

        this.#landingTime = response['response_data']['landing_time'];
        this.#landingGpsValid = response['response_data']['landing_gps_valid'];
        this.#landingGpsLat = response['response_data']['landing_gps_lat'];
        this.#landingGpsLon = response['response_data']['landing_gps_lon'];

        this.#operationModes = response['response_data']['operation_modes'];
    }


    getDroneImageSource() {
        return this.#droneImageSource;
    }
    getDroneImageScale() {
        return this.#droneImageScale;
    }
    getTakeoffLocationImageSource() {
        return this.#takeoffLocationImageSource;
    }
    getTakeoffLocationImageScale() {
        return this.#takeoffLocationImageScale;
    }
    getLandingLocationImageSource() {
        return this.#landingLocationImageSource;
    }
    getLandingLocationImageScale() {
        return this.#landingLocationImageScale;
    }

    getDroneId() {
        return this.#drone_id;
    }

    getGpsSignalLevel() {
        return this.#gpsSignalLevel;
    }
    getGpsSatellitesConnected() {
        return this.#gpsSatellitesConnected;
    }

    getGpsValid() {
        return this.#gpsValid;
    }
    setGpsValid(gpsValid) {
        this.#gpsValid = gpsValid;
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

    getPitch() {
        return this.#pitch;
    }
    getYaw() {
        return this.#yaw;
    }
    getRoll() {
        return this.#roll;
    }

    getVelocityX() {
        return this.#velocityX;
    }
    getVelocityY() {
        return this.#velocityY;
    }
    getVelocityZ() {
        return this.#velocityZ;
    }


    getBatteryRemaining() {
        return this.#batteryRemaining;
    }
    getBatteryRemainingPercent() {
        return this.#batteryRemainingPercent;
    }

    getRemainingFlightTime() {
        return this.#remainingFlightTime;
    }
    getRemainingFlightRadius() {
        return this.#remainingFlightRadius;
    }


    getTakeoffTime() {
        return this.#takeoffTime;
    }
    getTakeoffGpsValid() {
        return this.#takeoffGpsValid;
    }
    getTakeoffGpsLat() {
        return this.#takeoffGpsLat;
    }
    getTakeoffGpsLon() {
        return this.#takeoffGpsLon;
    }

    getLandingTime() {
        return this.#landingTime;
    }
    getLandingGpsValid() {
        return this.#landingGpsValid;
    }
    getLandingGpsLat() {
        return this.#landingGpsLat;
    }
    getLandingGpsLon() {
        return this.#landingGpsLon;
    }

    getOperationModes() {
        return this.#operationModes;
    }

}
