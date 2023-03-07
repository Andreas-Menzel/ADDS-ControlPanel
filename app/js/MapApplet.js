class MapApplet {

    #active;

    #map;
    #droneVectors;

    #preferredZoomLevel = 18;

    #autoAdjustEnabled = true;
    #autoAdjustPadding = 50;
    #autoAdjustDampener = 20; // set to 1 to disable

    #showFlightPath = false;

    // List of drones currently shown.
    #drones = [];


    constructor() {
        this.#active = false;
    }


    init() {
        this.#initControlPanel();
        this.#initMap();
    }

    #initControlPanel() {
        const mapApplet = document.getElementById('mapApplet');
        const btnAutoAdjust = mapApplet.getElementsByClassName('btnAutoAdjust')[0];
        const btnShowFlightPath = mapApplet.getElementsByClassName('btnShowFlightPath')[0];

        btnAutoAdjust.addEventListener('click', () => {
            if (this.#autoAdjustEnabled) {
                this.#autoAdjustEnabled = false;
                btnAutoAdjust.innerHTML = 'Enable auto-adjust';
            } else {
                this.#autoAdjustEnabled = true;
                btnAutoAdjust.innerHTML = 'Disable auto-adjust';
            }

            this.update(this.#drones);
        });

        btnShowFlightPath.addEventListener('click', () => {
            if (this.#showFlightPath) {
                this.#showFlightPath = false;
                btnShowFlightPath.innerHTML = 'Show flight path';
            } else {
                this.#showFlightPath = true;
                btnShowFlightPath.innerHTML = 'Hide flight path';
            }

            this.update(this.#drones);
        });
    }

    #initMap() {
        // Just in case the MapApplet is re-initialized when it is already
        // active.
        this.#active = false;

        this.#map = new ol.Map({
            target: 'mapApplet_map',
            view: new ol.View({
                center: ol.proj.fromLonLat([11.65236, 48.05466]),
                zoom: this.#preferredZoomLevel
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
            if (Object.keys(this.#drones).join(',') === Object.keys(drones).join(',')) {
                // Same drones, different values
                for (let i = 0; i < Object.keys(drones).length; ++i) {
                    let droneId = Object.keys(drones)[i];
                    let drone = drones[droneId];

                    this.#updateVectorPointCoordinates(this.#droneVectors[i], drone.getGpsLat(), drone.getGpsLon());
                    this.#updateVectorPointRotation(this.#droneVectors[i], drone.getYaw());
                }
            } else {
                // Different drones
                this.#drones = drones;

                this.#droneVectors = [];

                for (drone_id in drones) {
                    const drone = drones[drone_id];

                    this.#droneVectors.push(this.#createAndAddVectorPoint(this.#map, drone.getGpsLat(), drone.getGpsLon()));
                }
            }

            if (this.#autoAdjustEnabled) this.#autoAdjust();
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

    #autoAdjust() {
        let minX = null;
        let minY = null;
        let maxX = null;
        let maxY = null;

        for (const droneId in drones) {
            const drone = drones[droneId];

            const droneCoordinates = ol.proj.fromLonLat([drone.getGpsLat(), drone.getGpsLon()]);

            if (minX == null || droneCoordinates[0] < minX) minX = droneCoordinates[0];
            if (maxX == null || droneCoordinates[0] > maxX) maxX = droneCoordinates[0];
            if (minY == null || droneCoordinates[1] < minY) minY = droneCoordinates[1];
            if (maxY == null || droneCoordinates[1] > maxY) maxY = droneCoordinates[1];
        }


        minX -= this.#autoAdjustPadding;
        minY -= this.#autoAdjustPadding;
        maxX += this.#autoAdjustPadding;
        maxY += this.#autoAdjustPadding;

        // Dampen the auto-adjust
        minX = Math.round(minX / this.#autoAdjustDampener) * this.#autoAdjustDampener;
        minY = Math.round(minY / this.#autoAdjustDampener) * this.#autoAdjustDampener;
        maxX = Math.round(maxX / this.#autoAdjustDampener) * this.#autoAdjustDampener;
        maxY = Math.round(maxY / this.#autoAdjustDampener) * this.#autoAdjustDampener;

        const extent = [minX, minY, maxX, maxY];

        const center = ol.extent.getCenter(extent);
        const resolution = this.#map.getView().getResolutionForExtent(extent);
        const zoom = this.#map.getView().getZoomForResolution(resolution);

        this.#map.getView().animate(
            {
                duration: 900,
                center: center,
                zoom: zoom
            }
        );
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
