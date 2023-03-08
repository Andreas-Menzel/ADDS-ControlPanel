
window.addEventListener('onload', setAppletWrapperHeightsWithControlPanel());
function setAppletWrapperHeightsWithControlPanel() {
    let appletWrappers = document.getElementsByClassName('appletWrapper');
    for (let i = 0; i < appletWrappers.length; ++i) {
        const appletWrapper = appletWrappers[i];

        let appletControlPanel = appletWrapper.getElementsByClassName('appletControlPanel');
        let chartWrapper = appletWrapper.getElementsByClassName('chartWrapper');
        let mapWrapper = appletWrapper.getElementsByClassName('mapWrapper');

        if (appletControlPanel.length == 1 && chartWrapper.length == 1) {
            const appletControlPanelHeight = appletControlPanel[0].offsetHeight;
            chartWrapper[0].style.height = 'calc(100% - ' + appletControlPanelHeight + 'px)';
        }
        if (appletControlPanel.length == 1 && mapWrapper.length == 1) {
            const appletControlPanelHeight = appletControlPanel[0].offsetHeight;
            mapWrapper[0].style.height = 'calc(100% - ' + appletControlPanelHeight + 'px)';
        }
    }
}



function toBoolean(stringValue) {
    if(typeof(stringValue) === 'string') {
        switch (stringValue?.toLowerCase()?.trim()) {
            case "true":
            case "yes":
            case "1":
                return true;
    
            case "false":
            case "no":
            case "0":
            case null:
            case undefined:
                return false;
    
            default:
                return JSON.parse(stringValue);
        }
    } else {
        return stringValue;
    }
}


const useLiveData = true;
const trafficControlUrl = 'http://adds-demo.an-men.de/';

let timeOffset = 0;



//document.getElementById('maxSeconds').innerHTML = demoFlightData.length;
//
//const timeStarted = Math.floor(Date.now() / 1000);
//setInterval(() => {
//    document.getElementById('secondsPassed').innerHTML = ((Math.floor(Date.now() / 1000) - timeStarted + timeOffset) + demoFlightData.length) % demoFlightData.length + 1;
//}, 1000);
//
//function back10secs() {
//    timeOffset -= 10;
//
//    document.getElementById('secondsPassed').innerHTML = timeOffset + 1;
//}
//
//function forward10secs() {
//    timeOffset += 10;
//
//    document.getElementById('secondsPassed').innerHTML = timeOffset + 1;
//}




// Initialize ALL applets (even though they may not be currently shown)
let mapApplet = new MapApplet();
let droneAltitudeApplet = new DroneAltitudeApplet();
let droneVelocityApplet = new DroneVelocityApplet();
let droneSoCApplet = new DroneSoCApplet();
let droneRemDistApplet = new DroneRemDistApplet();

let drones = {
    'demo_drone': new Drone('demo_drone'),
    //'demo_drone2': new Drone('demo_drone2'),
    //'demo_drone3': new Drone('demo_drone3'),
    //'demo_drone4': new Drone('demo_drone4')
}
//drones['demo_drone2'].setDemoIndex(20);
//drones['demo_drone3'].setDemoIndex(40);
//drones['demo_drone4'].setDemoIndex(60);

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