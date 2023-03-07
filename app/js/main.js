
window.addEventListener('onload', setAppletWrapperHeightsWithControlPanel());
function setAppletWrapperHeightsWithControlPanel() {
    let appletWrappers = document.getElementsByClassName('appletWrapper');
    for (let i = 0; i < appletWrappers.length; ++i) {
        const appletWrapper = appletWrappers[i];

        let appletControlPanel = appletWrapper.getElementsByClassName('appletControlPanel');
        let chartWrapper = appletWrapper.getElementsByClassName('chartWrapper');

        if (appletControlPanel.length == 1 && chartWrapper.length == 1) {
            const appletControlPanelHeight = appletControlPanel[0].offsetHeight;
            chartWrapper[0].style.height = 'calc(100% - ' + appletControlPanelHeight + 'px)';
        }
    }
}




const useLiveData = false;

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


    #batteryRemaining;
    #batteryRemainingPercent;

    #remainingFlightTime;
    #remainingFlightRadius;

    setDemoIndex(demoIndex) {
        this.#demoIndex = demoIndex;
    }


    constructor(drone_id) {
        this.#drone_id = drone_id;
        this.setDefaultValues();
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


        this.#batteryRemaining = 0;
        this.#batteryRemainingPercent = 0;
        this.#remainingFlightTime = 0;
        this.#remainingFlightRadius = 0;
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

    getDroneId() {
        return this.#drone_id;
    }

    getGpsValid() {
        return this.#gpsValid;
    }
    getGpsLat() { // TODO: incorrect order!
        return this.#gpsLon;
    }
    getGpsLon() { // TODO: incorrect order!
        return this.#gpsLat;
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

}


// Initialize ALL applets (even though they may not be currently shown)
let mapApplet = new MapApplet();
let droneAltitudeApplet = new DroneAltitudeApplet();
let droneVelocityApplet = new DroneVelocityApplet();
let droneSoCApplet = new DroneSoCApplet();
let droneRemDistApplet = new DroneRemDistApplet();

let drones = {
    'demo_drone': new Drone('demo_drone'),
    'demo_drone2': new Drone('demo_drone2'),
    'demo_drone3': new Drone('demo_drone3'),
    'demo_drone4': new Drone('demo_drone4')
}
drones['demo_drone2'].setDemoIndex(20);
drones['demo_drone3'].setDemoIndex(40);
drones['demo_drone4'].setDemoIndex(60);

function updateDrones() {
    // Update drone list
    // Add / remove drones
    // Update each drone
    if (useLiveData) {
        for (drone_id in drones) {
            drones[drone_id].updateValues();
        }
    } else {
        for (drone_id in drones) {
            drones[drone_id].updateValuesFromDemoFlight(timeOffset);
        }
    }
}

function updateApplets() {
    mapApplet.update(drones);
    droneAltitudeApplet.update(drones);
    droneVelocityApplet.update(drones);
    droneSoCApplet.update(drones);
    droneRemDistApplet.update(drones);
}


window.onload = () => {
    mapApplet.init();
    droneAltitudeApplet.init();
    droneVelocityApplet.init();
    droneSoCApplet.init();
    droneRemDistApplet.init();

    setInterval(() => {
        updateDrones();
        updateApplets();
    }, 1000);
}