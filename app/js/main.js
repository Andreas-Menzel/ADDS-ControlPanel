
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

intersections['EDMR-Landeplatz'] = new Intersection('EDMR-Landeplatz');
intersections['int_1'] = new Intersection('int_1');
intersections['int_2'] = new Intersection('int_2');
intersections['int_3'] = new Intersection('int_3');
intersections['int_4'] = new Intersection('int_4');
intersections['int_5'] = new Intersection('int_5');
intersections['int_6'] = new Intersection('int_6');
intersections['int_7'] = new Intersection('int_7');


corridors['cor_1'] = new Corridor('cor_1');
corridors['cor_2'] = new Corridor('cor_2');
corridors['cor_3'] = new Corridor('cor_3');
corridors['cor_4'] = new Corridor('cor_4');
corridors['cor_5'] = new Corridor('cor_5');
corridors['cor_6'] = new Corridor('cor_6');
corridors['cor_7'] = new Corridor('cor_7');
corridors['cor_8'] = new Corridor('cor_8');
corridors['cor_9'] = new Corridor('cor_9');
corridors['cor_10'] = new Corridor('cor_10');
corridors['cor_11'] = new Corridor('cor_11');
corridors['cor_12'] = new Corridor('cor_12');


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

    for(intersectionId in intersections) {
        intersections[intersectionId].updateValues();
    }
    for(corridorId in corridors) {
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

    setInterval(() => {
        updateDrones();
        updateInfrastructure(); // TODO: reduce update rate
        updateApplets();
    }, 1000);
}