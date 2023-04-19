
window.addEventListener('onload', setAppletWrapperHeightsWithControlPanel());
function setAppletWrapperHeightsWithControlPanel() {
    let appletWrappers = document.getElementsByClassName('appletWrapper');
    for (let i = 0; i < appletWrappers.length; ++i) {
        const appletWrapper = appletWrappers[i];

        let appletControlPanel = appletWrapper.getElementsByClassName('appletControlPanel');
        let chartWrapper = appletWrapper.getElementsByClassName('chartWrapper');
        let mapWrapper = appletWrapper.getElementsByClassName('mapWrapper');
        let tableWrapper = appletWrapper.getElementsByClassName('tableWrapper');

        if (appletControlPanel.length == 1 && chartWrapper.length == 1) {
            const appletControlPanelHeight = appletControlPanel[0].offsetHeight;
            chartWrapper[0].style.height = 'calc(100% - ' + appletControlPanelHeight + 'px)';
        }
        if (appletControlPanel.length == 1 && mapWrapper.length == 1) {
            const appletControlPanelHeight = appletControlPanel[0].offsetHeight;
            mapWrapper[0].style.height = 'calc(100% - ' + appletControlPanelHeight + 'px)';
        }
        if (appletControlPanel.length == 1 && tableWrapper.length == 1) {
            const appletControlPanelHeight = appletControlPanel[0].offsetHeight;
            tableWrapper[0].style.height = 'calc(100% - ' + appletControlPanelHeight + 'px)';
        }
    }
}



function toBoolean(stringValue) {
    if (typeof (stringValue) === 'string') {
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

// Function taken and adapted from https://stackoverflow.com/a/6078873
function unixTimeToString(UNIX_timestamp){
    let time = '';

    if(UNIX_timestamp != null && UNIX_timestamp != 0) {
        let a = new Date(UNIX_timestamp * 1000);
        let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        let year = a.getFullYear();
        let month = months[a.getMonth()];
        let date = a.getDate();
        let hour = a.getHours();
        let min = a.getMinutes();
        let sec = a.getSeconds();
        let mil = a.getMilliseconds();
        time = date + '. ' + month + ' ' + year + ' - ' + hour + ':' + min + ':' + sec + '-' + mil;
    } else {
        time = '?';
    }

    return time;
  }


const useLiveData = true;
const flightControlUrl = 'http://adds-demo.an-men.de/';
const cChainLinkUrl = 'http://adds-demo.an-men.de:8080/';

let timeOffset = 0;




// Initialize ALL applets (even though they may not be currently shown)
let mapApplet = new MapApplet();
let dataValidationApplet = new DataValidationApplet();
let droneAltitudeApplet = new DroneAltitudeApplet();
let droneVelocityApplet = new DroneVelocityApplet();
let droneSoCApplet = new DroneSoCApplet();
let droneRemDistApplet = new DroneRemDistApplet();
let infrastructureManagementApplet = new InfrastructureManagementApplet();


let drones = {};
let intersections = {};
let corridors = {};


function updateDroneList() {
    const payload = '{"drone_id": "%","data_type": "drone_list"}';
    const handleResponse = () => {
        const response = JSON.parse(xhttp.responseText);
        if (response['executed']) {
            const droneIds = Object.keys(response['response_data']);
            const myDroneIds = Object.keys(drones);

            const dronesToAdd = droneIds.filter(x => !myDroneIds.includes(x));
            const dronesToRemove = myDroneIds.filter(x => !droneIds.includes(x));

            for (let newDroneId of dronesToAdd) {
                drones[newDroneId] = new Drone(newDroneId);
            }
            for (let remDroneId of dronesToRemove) {
                delete drones[remDroneId];
            }

            for (let droneId of droneIds) {
                const active = response['response_data'][droneId]['active'];
                const chain_uuid_mission = response['response_data'][droneId]['chain_uuid_mission'];
                const chain_uuid_blackbox = response['response_data'][droneId]['chain_uuid_blackbox'];

                drones[droneId].setValues(active, chain_uuid_mission, chain_uuid_blackbox);
            }
        }
    };
    const xhttp = new XMLHttpRequest();
    xhttp.onload = () => { handleResponse() };
    xhttp.open('GET', flightControlUrl + 'ask/drone_list?payload=' + payload, true);
    xhttp.send();
}

function updateIntersectionList() {
    const payload = '{"intersection_id": "%","data_type": "intersection_list"}';
    const handleResponse = () => {
        const response = JSON.parse(xhttp.responseText);
        if (response['executed']) {
            const intersectionIds = Object.keys(response['response_data']);
            const myIntersectionIds = Object.keys(intersections);

            const intersectionsToAdd = intersectionIds.filter(x => !myIntersectionIds.includes(x));
            const intersectionsToRemove = myIntersectionIds.filter(x => !intersectionIds.includes(x));

            for (let newIntId of intersectionsToAdd) {
                intersections[newIntId] = new Intersection(newIntId);
            }
            for (let remIntId of intersectionsToRemove) {
                delete intersections[remIntId];
            }

            for (let intId of intersectionIds) {
                const gpsLat = response['response_data'][intId]['gps_lat'];
                const gpsLon = response['response_data'][intId]['gps_lon'];
                const altitude = response['response_data'][intId]['altitude'];

                intersections[intId].setValues(gpsLat, gpsLon, altitude);
            }

            infrastructureManagementApplet.updateIntersections(intersections);
        }
    };
    const xhttp = new XMLHttpRequest();
    xhttp.onload = () => { handleResponse() };
    xhttp.open('GET', flightControlUrl + 'ask/intersection_list?payload=' + payload, true);
    xhttp.send();
}

function updateCorridorList() {
    const payload = '{"corridor_id": "%","data_type": "corridor_list"}';
    const handleResponse = () => {
        const response = JSON.parse(xhttp.responseText);
        if (response['executed']) {
            const corridorIds = Object.keys(response['response_data']);
            const myCorridorIds = Object.keys(corridors);

            const corridorsToAdd = corridorIds.filter(x => !myCorridorIds.includes(x));
            const corridorsToRemove = myCorridorIds.filter(x => !corridorIds.includes(x));

            for (let newCorId of corridorsToAdd) {
                corridors[newCorId] = new Corridor(newCorId);
            }
            for (let remCorId of corridorsToRemove) {
                delete corridors[remCorId];
            }

            for (let corId of corridorIds) {
                const intersectionAId = response['response_data'][corId]['intersection_a'];
                const intersectionBId = response['response_data'][corId]['intersection_b'];

                corridors[corId].setValues(intersectionAId, intersectionBId);
            }

            infrastructureManagementApplet.updateCorridors(corridors);
        }
    };
    const xhttp = new XMLHttpRequest();
    xhttp.onload = () => { handleResponse() };
    xhttp.open('GET', flightControlUrl + 'ask/corridor_list?payload=' + payload, true);
    xhttp.send();
}


function updateDrones() {
    // TODO: Update drone list
    // TODO: Add / remove drones

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


function updateApplets1s() {
    mapApplet.update(drones, intersections, corridors);
    droneAltitudeApplet.update(drones);
    droneVelocityApplet.update(drones);
    droneSoCApplet.update(drones);
    droneRemDistApplet.update(drones);
}

function updateApplets5s() {
    dataValidationApplet.update();
}


window.onload = () => {
    mapApplet.init();
    dataValidationApplet.init();
    droneAltitudeApplet.init();
    droneVelocityApplet.init();
    droneSoCApplet.init();
    droneRemDistApplet.init();
    infrastructureManagementApplet.init();

    if (true) {
        updateDrones();
        updateApplets1s();
        setInterval(() => {
            updateDrones();
            updateApplets1s();
        }, 1000);

        updateDroneList();
        updateApplets5s();
        updateIntersectionList();
        updateCorridorList();
        setInterval(() => {
            updateDroneList();
            updateApplets5s();

            updateIntersectionList();
            updateCorridorList();
        }, 5000);
    }
}
