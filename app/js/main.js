let timeOffset = 0;



document.getElementById('maxSeconds').innerHTML = demoFlightData.length;

const timeStarted = Math.floor(Date.now() / 1000);
setInterval(() => {
    document.getElementById('secondsPassed').innerHTML = ((Math.floor(Date.now() / 1000) - timeStarted + timeOffset) + demoFlightData.length) % demoFlightData.length + 1;
}, 1000);

function back10secs() {
    timeOffset -= 10;

    document.getElementById('secondsPassed').innerHTML = timeOffset + 1;
}

function forward10secs() {
    timeOffset += 10;

    document.getElementById('secondsPassed').innerHTML = timeOffset + 1;
}



class Drone {

    #demoIndex = 0;

    #drone_id;

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

    setDemoIndex(demoIndex) {
        this.#demoIndex = demoIndex;
    }


    constructor(drone_id) {
        this.#drone_id = drone_id;
        this.setDefaultValues();

        this.#altitude = Math.random() * 10 + 5;
        this.#velocityX = Math.random() * 10 - 5;
        this.#velocityY = Math.random() * 10 - 5;
        this.#velocityZ = Math.random() * 10 - 5;
    }


    setDefaultValues() {
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
    }

    updateValues() {
        // Send request to Traffic Control
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

        console.log(data['altitude']);
    }

    getDroneId() {
        return this.#drone_id;
    }

    getGpsValid() {
        return this.#gpsValid;
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

}


// Initialize ALL applets (even though they may not be currently shown)
let droneAltitudeApplet = new DroneAltitudeApplet();
let droneVelocityApplet = new DroneVelocityApplet();

let drones = {
    'demo_drone': new Drone('demo_drone'),
    //'demo_drone2': new Drone('demo_drone2')
}

function updateDrones() {
    // Update drone list
    // Add / remove drones
    // Update each drone
    for (drone_id in drones) {
        drones[drone_id].updateValuesFromDemoFlight(timeOffset);
    }
}

function updateApplets() {
    droneAltitudeApplet.update(drones);
    droneVelocityApplet.update(drones);
}


window.onload = () => {
    droneAltitudeApplet.init();
    droneVelocityApplet.init();

    setInterval(() => {
        updateDrones();
        updateApplets();
    }, 1000);
}