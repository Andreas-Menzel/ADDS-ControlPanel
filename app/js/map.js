let gps_lat = getDemoLat();
let gps_lon = getDemoLon();


function initMap() {
    const map = new ol.Map({
        target: 'map',
        view: new ol.View({
            center: ol.proj.fromLonLat([gps_lat, gps_lon]),
            zoom: 19
        }),
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ]
    });

    let drone1 = createAndAddVectorPoint(map, gps_lat, gps_lon);

    let demoFlightIndex = 0;
    setInterval(() => {
        gps_lat = getDemoLat();
        gps_lon = getDemoLon();
        rot = getDemoYaw();

        // Update marker location
        updateVectorPointCoordinates(drone1, gps_lat, gps_lon);
        updateVectorPointRotation(drone1, rot);

        //updateMapCenter(map, gps_lat, gps_lon)
    }, updateInterval);
}


function updateMapCenterAndZoom(map, lat, lon, zoom) {
    let newView = new ol.View({
        center: ol.proj.fromLonLat([lat, lon]),
        zoom: zoom
    })
    map.setView(newView);
}

function updateMapCenter(map, lat, lon) {
    updateMapCenterAndZoom(map, lat, lon, map.getView().getZoom());
}


function createVectorPoint(lat, lon) {
    return new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [
                new ol.Feature({
                    geometry: new ol.geom.Point(ol.proj.fromLonLat([lat, lon]))
                })
            ]
        }),
        style: new ol.style.Style({
            image: new ol.style.Icon({
                src: './img/drone.svg',
                rotation: 30,
                scale: 1.5
            }),
        })
    });
}

function createAndAddVectorPoint(map, lat, lon) {
    let vector = createVectorPoint(lat, lon);
    map.addLayer(vector);
    return vector;
}


function updateVectorPointCoordinates(vector, lat, lon) {
    let newSource = new ol.source.Vector({
        features: [
            new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([lat, lon]))
            })
        ]
    });

    vector.setSource(newSource);
}


function updateVectorPointRotation(vector, rotation) {
    let newStyle = new ol.style.Style({
        image: new ol.style.Icon({
            src: './img/drone.svg',
            rotation: rotation * (3.1415 / 180),
            scale: 1.5
        }),
    })

    vector.setStyle(newStyle);
}



initMap();