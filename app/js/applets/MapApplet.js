class MapApplet {

    #active;

    #map;

    // List of drones currently shown.
    #drones = {};
    #droneVectors;

    #takeoffLocationVectors = [];
    #landingLocationVectors = [];

    #intersections = {};
    #intersectionVectors = [];

    #corridors = {};
    #corridorVectors = [];

    #preferredZoomLevel = 18;

    #autoAdjustEnabled = false;
    #autoAdjustPadding = 50;
    #autoAdjustDampener = 20; // set to 1 to disable

    #showInfrastructure = false;
    #showInfrastructureChanged = false;


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
        const btnShowInfrastructure = mapApplet.getElementsByClassName('btnShowInfrastructure')[0];

        btnAutoAdjust.addEventListener('click', () => {
            if (this.#autoAdjustEnabled) {
                this.#autoAdjustEnabled = false;
                btnAutoAdjust.innerHTML = 'Enable auto-adjust';
            } else {
                this.#autoAdjustEnabled = true;
                btnAutoAdjust.innerHTML = 'Disable auto-adjust';
            }

            this.update(this.#drones, this.#intersections, this.#corridors);
        });

        btnShowInfrastructure.addEventListener('click', () => {
            this.#showInfrastructureChanged = true;

            if (this.#showInfrastructure) {
                this.#showInfrastructure = false;
                btnShowInfrastructure.innerHTML = 'Show infrastructure';
            } else {
                this.#showInfrastructure = true;
                btnShowInfrastructure.innerHTML = 'Hide infrastructure';
            }

            this.update(this.#drones, this.#intersections, this.#corridors);
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


    update(drones, intersections, corridors) {
        if (this.#active) {
            this.#updateDrones(drones);

            if (this.#showInfrastructure) {
                this.#updateCorridors(corridors);
                this.#updateIntersections(intersections);

                this.#showInfrastructureChanged = false;
            } else {
                for (const intVec in this.#intersectionVectors) {
                    this.#map.removeLayer(this.#intersectionVectors[intVec]);
                }
                for (const corVec in this.#corridorVectors) {
                    this.#map.removeLayer(this.#corridorVectors[corVec]);
                }
            }

            if (this.#autoAdjustEnabled) this.#autoAdjust();
        }
    }

    #updateDrones(drones) {
        if (Object.keys(this.#drones).join(',') === Object.keys(drones).join(',')) {
            // Same drones, different values
            for (let i = 0; i < Object.keys(this.#drones).length; ++i) {
                let droneId = Object.keys(this.#drones)[i];
                let drone = this.#drones[droneId];

                this.#updateVectorPointCoordinates(this.#landingLocationVectors[i], drone.getLandingGpsLat(), drone.getLandingGpsLon());
                this.#updateVectorPointCoordinates(this.#takeoffLocationVectors[i], drone.getTakeoffGpsLat(), drone.getTakeoffGpsLon());

                this.#updateVectorPointCoordinates(this.#droneVectors[i], drone.getGpsLat(), drone.getGpsLon());
                this.#updateVectorPointRotation(this.#droneVectors[i], drone.getYaw(), drone.getDroneImageSource(), drone.getDroneImageScale());
            }
        } else {
            // Different drones
            this.#drones = drones;

            this.#droneVectors = [];

            for (const drone_id in this.#drones) {
                const drone = this.#drones[drone_id];

                this.#landingLocationVectors.push(this.#createAndAddVectorPoint(this.#map, drone.getLandingGpsLat(), drone.getLandingGpsLon(), drone.getLandingLocationImageSource(), drone.getLandingLocationImageScale()));
                this.#takeoffLocationVectors.push(this.#createAndAddVectorPoint(this.#map, drone.getTakeoffGpsLat(), drone.getTakeoffGpsLon(), drone.getTakeoffLocationImageSource(), drone.getTakeoffLocationImageScale()));

                this.#droneVectors.push(this.#createAndAddVectorPoint(this.#map, drone.getGpsLat(), drone.getGpsLon(), this.#drones[drone_id].getDroneImageSource()));
                // TODO: rotate drone
            }
        }
    }

    #updateIntersections(intersections) {
        // Tries to add an intersection to the map
        // index = -1 : push
        // index >= 0 : specify index
        const addIntersectionToMap = (intersection, index) => {
            if (intersection.getDataValid()) {
                if (index >= 0) {
                    this.#intersectionVectors[index] = this.#createAndAddVectorPoint(this.#map, intersection.getGpsLon(), intersection.getGpsLat(), intersection.getImageSource(), intersection.getImageScale());
                } else {
                    this.#intersectionVectors.push(this.#createAndAddVectorPoint(this.#map, intersection.getGpsLon(), intersection.getGpsLat(), intersection.getImageSource(), intersection.getImageScale()));
                }
            } else {
                // The data was not fetched yet.
                if (index >= 0) {
                    this.#intersectionVectors[index] = null;
                } else {
                    this.#intersectionVectors.push(null);
                }
            }
        };

        if (!this.#showInfrastructureChanged && Object.keys(this.#intersections).join(',') === Object.keys(intersections).join(',')) {
            // Same intersections(, different values)
            for (let i = 0; i < Object.keys(this.#intersections).length; ++i) {
                let intersectionId = Object.keys(this.#intersections)[i];
                let intersection = this.#intersections[intersectionId];

                if (this.#intersectionVectors[i] != null) {
                    this.#updateVectorPointCoordinates(this.#intersectionVectors[i], intersection.getGpsLon(), intersection.getGpsLat());
                } else {
                    // The data may have been fetched now. Try to add the
                    // intersection to the map.
                    addIntersectionToMap(intersection, i);
                }
            }
        } else {
            // Different intersections
            this.#intersections = intersections;

            this.#intersectionVectors = [];

            for (let intersectionId in this.#intersections) {
                const intersection = this.#intersections[intersectionId];

                // Try to add the intersection to the map
                addIntersectionToMap(intersection, -1);
            }
        }
    }

    #updateCorridors(corridors) {
        // Tries to add a corridor to the map
        // index = -1 : push
        // index >= 0 : specify index
        const addCorridorToMap = (corridor, index) => {
            if (corridor.getDataValid()) {
                let intersectionA = intersections[corridor.getIntersectionAId()];
                let intersectionB = intersections[corridor.getIntersectionBId()];

                // Make sure that both intersections have already fetched their data.
                if (intersectionA.getDataValid() && intersectionB.getDataValid()) {
                    const vector = this.#createAndAddVectorLineString(this.#map, intersectionA.getGpsLat(), intersectionA.getGpsLon(), intersectionB.getGpsLat(), intersectionB.getGpsLon());

                    if (index >= 0) {
                        this.#corridorVectors[index] = vector;
                    } else {
                        this.#corridorVectors.push(vector);
                    }
                } else {
                    // The data of one or both intersections was not fetched yet.
                    if (index >= 0) {
                        this.#corridorVectors[index] = null;
                    } else {
                        this.#corridorVectors.push(null);
                    }
                }
            } else {
                // The data was not fetched yet.
                if (index >= 0) {
                    this.#corridorVectors[index] = null;
                } else {
                    this.#corridorVectors.push(null);
                }
            }
        };

        if (!this.#showInfrastructureChanged && Object.keys(this.#corridors).join(',') === Object.keys(corridors).join(',')) {
            // Same corridors(, different values)
            for (let i = 0; i < Object.keys(this.#corridors).length; ++i) {
                let corridorId = Object.keys(this.#corridors)[i];
                let corridor = this.#corridors[corridorId];

                if (this.#corridorVectors[i] != null) {
                    // Both intersections have already fetched their values,
                    // because the corridor was already on the map.
                    let intersectionA = intersections[corridor.getIntersectionAId()];
                    let intersectionB = intersections[corridor.getIntersectionBId()];

                    this.#updateVectorLineStringCoordinates(this.#corridorVectors[i], intersectionA.getGpsLat(), intersectionA.getGpsLon(), intersectionB.getGpsLat(), intersectionB.getGpsLon());
                } else {
                    // The data may have been fetched. Try to add corridor to
                    // the map
                    addCorridorToMap(corridor, i);
                }
            }
        } else {
            // Different corridors
            this.#corridors = corridors;

            this.#corridorVectors = [];

            for (const corridorId in this.#corridors) {
                const corridor = this.#corridors[corridorId];

                // Try to add corridor to the map
                addCorridorToMap(corridor, -1);
            }
        }
    }


    #createVectorPoint(lat, lon, imageSource, imageScale) {
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
                    src: imageSource,
                    scale: imageScale
                }),
            })
        });
    }

    #createAndAddVectorPoint(map, lat, lon, imageSource, imageScale) {
        let vector = this.#createVectorPoint(lat, lon, imageSource, imageScale);
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


    #updateVectorPointRotation(vector, rotation, imageSource, imageScale) {
        let newStyle = new ol.style.Style({
            image: new ol.style.Icon({
                src: imageSource,
                scale: imageScale,
                rotation: rotation * (3.1415 / 180)
            }),
        })

        vector.setStyle(newStyle);
    }

    #createVectorLineString(latStart, lonStart, latEnd, lonEnd) {
        let points = [[lonStart, latStart], [lonEnd, latEnd]];

        points[0] = ol.proj.transform(points[0], 'EPSG:4326', 'EPSG:3857');
        points[1] = ol.proj.transform(points[1], 'EPSG:4326', 'EPSG:3857');

        let featureLine = new ol.Feature({
            geometry: new ol.geom.LineString(points)
        });

        let vectorLine = new ol.source.Vector({});
        vectorLine.addFeature(featureLine);

        let vectorLineLayer = new ol.layer.Vector({
            source: vectorLine,
            style: new ol.style.Style({
                fill: new ol.style.Fill({ color: '#000000', weight: 4 }),
                stroke: new ol.style.Stroke({ color: '#000000', width: 2 })
            })
        });

        return vectorLineLayer;
    }

    #createAndAddVectorLineString(map, latStart, lonStart, latEnd, lonEnd) {
        let vector = this.#createVectorLineString(latStart, lonStart, latEnd, lonEnd);
        this.#map.addLayer(vector);

        return vector;
    }

    #updateVectorLineStringCoordinates(vector, latStart, lonStart, latEnd, lonEnd) {
        let points = [[lonStart, latStart], [lonEnd, latEnd]];

        points[0] = ol.proj.transform(points[0], 'EPSG:4326', 'EPSG:3857');
        points[1] = ol.proj.transform(points[1], 'EPSG:4326', 'EPSG:3857');

        let featureLine = new ol.Feature({
            geometry: new ol.geom.LineString(points)
        });

        let vectorLine = new ol.source.Vector({});
        vectorLine.addFeature(featureLine);

        vector.setSource(vectorLine);
    }

    #autoAdjust() {
        let minX = null;
        let minY = null;
        let maxX = null;
        let maxY = null;

        for (const droneId in this.#drones) {
            const drone = this.#drones[droneId];

            // Make sure all drones are in focus.
            if (drone.getGpsValid()) {
                const droneCoordinates = ol.proj.fromLonLat([drone.getGpsLon(), drone.getGpsLat()]);

                if (minX == null || droneCoordinates[0] < minX) minX = droneCoordinates[0];
                if (maxX == null || droneCoordinates[0] > maxX) maxX = droneCoordinates[0];
                if (minY == null || droneCoordinates[1] < minY) minY = droneCoordinates[1];
                if (maxY == null || droneCoordinates[1] > maxY) maxY = droneCoordinates[1];
            }

            // Make sure all takeoff sites are in focus.
            if (drone.getTakeoffGpsValid()) {
                const takeoffCoordinates = ol.proj.fromLonLat([drone.getTakeoffGpsLon(), drone.getTakeoffGpsLat()]);

                if (minX == null || takeoffCoordinates[0] < minX) minX = takeoffCoordinates[0];
                if (maxX == null || takeoffCoordinates[0] > maxX) maxX = takeoffCoordinates[0];
                if (minY == null || takeoffCoordinates[1] < minY) minY = takeoffCoordinates[1];
                if (maxY == null || takeoffCoordinates[1] > maxY) maxY = takeoffCoordinates[1];
            }

            // Make sure all landing sites are in focus.
            if (drone.getLandingGpsValid()) {
                const landingCoordinates = ol.proj.fromLonLat([drone.getLandingGpsLon(), drone.getLandingGpsLat()]);

                if (minX == null || landingCoordinates[0] < minX) minX = landingCoordinates[0];
                if (maxX == null || landingCoordinates[0] > maxX) maxX = landingCoordinates[0];
                if (minY == null || landingCoordinates[1] < minY) minY = landingCoordinates[1];
                if (maxY == null || landingCoordinates[1] > maxY) maxY = landingCoordinates[1];
            }
        }

        // Make sure the infrastructure is in focus when it is shown.
        if (this.#showInfrastructure) {
            for (const intersectionId in this.#intersections) {
                const intersection = intersections[intersectionId];

                const intersectionCoordinates = ol.proj.fromLonLat([intersection.getGpsLon(), intersection.getGpsLat()]);

                if (minX == null || intersectionCoordinates[0] < minX) minX = intersectionCoordinates[0];
                if (maxX == null || intersectionCoordinates[0] > maxX) maxX = intersectionCoordinates[0];
                if (minY == null || intersectionCoordinates[1] < minY) minY = intersectionCoordinates[1];
                if (maxY == null || intersectionCoordinates[1] > maxY) maxY = intersectionCoordinates[1];
            }
        }

        if (minX != null && maxX != null && minY != null && maxY != null) {
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
