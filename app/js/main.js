
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


const useLiveData = true;
const trafficControlUrl = 'http://adds-demo.an-men.de/';

let timeOffset = 0;




// Initialize ALL applets (even though they may not be currently shown)
let mapApplet = new MapApplet();
let droneAltitudeApplet = new DroneAltitudeApplet();
let droneVelocityApplet = new DroneVelocityApplet();
let droneSoCApplet = new DroneSoCApplet();
let droneRemDistApplet = new DroneRemDistApplet();


let drones = {};
let intersections = {};
let corridors = {};

// DEMO ONLY
drones['demo_drone'] = new Drone('demo_drone');
//
//intersections['EDMR-Landeplatz'] = new Intersection('EDMR-Landeplatz');
//intersections['int_1'] = new Intersection('int_1');
//intersections['int_2'] = new Intersection('int_2');
//intersections['int_3'] = new Intersection('int_3');
//intersections['int_4'] = new Intersection('int_4');
//intersections['int_5'] = new Intersection('int_5');
//intersections['int_6'] = new Intersection('int_6');
//intersections['int_71'] = new Intersection('int_71');
//
//
//corridors['cor_1'] = new Corridor('cor_1');
//corridors['cor_2'] = new Corridor('cor_2');
//corridors['cor_3'] = new Corridor('cor_3');
//corridors['cor_4'] = new Corridor('cor_4');
//corridors['cor_5'] = new Corridor('cor_5');
//corridors['cor_6'] = new Corridor('cor_6');
//corridors['cor_7'] = new Corridor('cor_7');
//corridors['cor_8'] = new Corridor('cor_8');
//corridors['cor_9'] = new Corridor('cor_9');
//corridors['cor_10'] = new Corridor('cor_10');
//corridors['cor_11'] = new Corridor('cor_11');
//corridors['cor_12'] = new Corridor('cor_12');


function updateDroneList() {

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

            for (newIntId of intersectionsToAdd) {
                intersections[newIntId] = new Intersection(newIntId);
            }
            for (remIntId of intersectionsToRemove) {
                delete intersections[remIntId];
            }

            for (intId of intersectionIds) {
                const gpsLat = response['response_data'][intId]['gps_lat'];
                const gpsLon = response['response_data'][intId]['gps_lon'];
                const altitude = response['response_data'][intId]['altitude'];

                intersections[intId].setValues(gpsLat, gpsLon, altitude);
            }
        }
    };
    const xhttp = new XMLHttpRequest();
    xhttp.onload = () => { handleResponse() };
    xhttp.open('GET', trafficControlUrl + 'ask/intersection_list?payload=' + payload, true);
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

            for (newCorId of corridorsToAdd) {
                corridors[newCorId] = new Corridor(newCorId);
            }
            for (remCorId of corridorsToRemove) {
                delete corridors[remCorId];
            }

            for (corId of corridorIds) {
                const intersectionAId = response['response_data'][corId]['intersection_a'];
                const intersectionBId = response['response_data'][corId]['intersection_b'];

                corridors[corId].setValues(intersectionAId, intersectionBId);
            }
        }
    };
    const xhttp = new XMLHttpRequest();
    xhttp.onload = () => { handleResponse() };
    xhttp.open('GET', trafficControlUrl + 'ask/corridor_list?payload=' + payload, true);
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

function updateInfrastructure() {
    // TODO: Update infrastructure list
    // TODO: Add / remove intersections / corridors

    for (intersectionId in intersections) {
        intersections[intersectionId].updateValues();
    }
    for (corridorId in corridors) {
        corridors[corridorId].updateValues();
    }
}


function updateApplets() {
    mapApplet.update(drones, intersections, corridors);
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

    updateDrones();
    updateApplets();
    setInterval(() => {
        updateDrones();
        updateApplets();
    }, 1000);

    updateDroneList();
    updateIntersectionList();
    updateCorridorList();
    updateInfrastructure();
    setInterval(() => {
        updateDroneList();
        updateIntersectionList();
        updateCorridorList();

        updateInfrastructure();
    }, 5000);
}