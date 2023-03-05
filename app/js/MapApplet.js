class MapApplet {

    #active;

    #map;
    #droneVectors;

    // List of drone IDs currently shown.
    #droneIds = [];


    constructor() {
        this.#active = false;
    }


    init() {
        // Just in case the MapApplet is re-initialized when it is already
        // active.
        this.#active = false;

        this.#map = new ol.Map({
            target: 'mapApplet_map',
            view: new ol.View({
                center: ol.proj.fromLonLat([demoFlightData[0]['gps_lon'], demoFlightData[0]['gps_lat']]),
                zoom: 19
            }),
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ]
        });

        this.#active = true;
    }


    update(drones) {
        if (this.#active) {
            if (this.#droneIds.join(',') === Object.keys(drones).join(',')) {
                // Same drones, different values
                for (let i = 0; i < Object.keys(drones).length; ++i) {
                    let droneId = Object.keys(drones)[i];
                    let drone = drones[droneId];

                    this.#updateVectorPointCoordinates(this.#droneVectors[i], drone.getGpsLat(), drone.getGpsLon());
                    this.#updateVectorPointRotation(this.#droneVectors[i], drone.getYaw());

                    //updateMapCenter(this.#map, gps_lat, gps_lon)
                }
            } else {
                // Different drones
                this.#droneIds = Object.keys(drones);

                this.#droneVectors = [];

                for (drone_id in drones) {
                    const drone = drones[drone_id];

                    this.#droneVectors.push(this.#createAndAddVectorPoint(this.#map, drone.getGpsLat(), drone.getGpsLon()));
                }
            }
        }
    }


    #createVectorPoint(lat, lon) {
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
    
    #createAndAddVectorPoint(map, lat, lon) {
        let vector = this.#createVectorPoint(lat, lon);
        this.#map.addLayer(vector);
        return vector;
    }
    
    
    #updateVectorPointCoordinates(vector, lat, lon) {
        let newSource = new ol.source.Vector({
            features: [
                new ol.Feature({
                    geometry: new ol.geom.Point(ol.proj.fromLonLat([lat, lon]))
                })
            ]
        });
    
        vector.setSource(newSource);
    }
    
    
    #updateVectorPointRotation(vector, rotation) {
        let newStyle = new ol.style.Style({
            image: new ol.style.Icon({
                src: './img/drone.svg',
                rotation: rotation * (3.1415 / 180),
                scale: 1.5
            }),
        })
    
        vector.setStyle(newStyle);
    }


    isActive() {
        return this.#active;
    }

    deactivate() {
        this.#active = false;
    }

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
