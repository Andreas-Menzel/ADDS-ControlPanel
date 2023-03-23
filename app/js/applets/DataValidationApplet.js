class DataValidationApplet {

    #dataVisible = 'AircraftLocation';

    #droneId = null;

    #aircraftLocationIdRangeSelectedMin = 0;
    #aircraftLocationIdRangeSelectedMax = 0;
    #aircraftLocationIdRangeSelectionIndex = 0;

    #aircraftPowerIdRangeSelectedMin = 0;
    #aircraftPowerIdRangeSelectedMax = 0;
    #aircraftPowerIdRangeSelectionIndex = 0;

    #flightDataIdRangeSelectedMin = 0;
    #flightDataIdRangeSelectedMax = 0;
    #flightDataIdRangeSelectionIndex = 0;

    #droneIdsAvailable = [];


    init() {
        this.#initControlPanel();

        this.#updateButtons();
        this.#updateDatasetTableVisibility();
        this.update();
    }

    #initControlPanel() {
        const btnShowAircraftLocation = document.getElementsByClassName('btn_dataValidationApplet_showAircraftLocation')[0];
        const btnShowAircraftPower = document.getElementsByClassName('btn_dataValidationApplet_showAircraftPower')[0];
        const btnShowFlightData = document.getElementsByClassName('btn_dataValidationApplet_showFlightData')[0];

        const droneIdSelector = document.getElementsByClassName('dataValidationApplet_droneIdSelector')[0];
        const datasetIdRangeSelector = document.getElementsByClassName('dataValidationApplet_datasetIdRangeSelector')[0];

        btnShowAircraftLocation.addEventListener('click', () => {
            this.#dataVisible = 'AircraftLocation';
            this.#updateButtons();
            this.#updateIdRangeSelector(true);
            this.#updateDatasetTableVisibility();
        });
        btnShowAircraftPower.addEventListener('click', () => {
            this.#dataVisible = 'AircraftPower';
            this.#updateButtons();
            this.#updateIdRangeSelector(true);
            this.#updateDatasetTableVisibility();
        });
        btnShowFlightData.addEventListener('click', () => {
            this.#dataVisible = 'FlightData';
            this.#updateButtons();
            this.#updateIdRangeSelector(true);
            this.#updateDatasetTableVisibility();
        });

        droneIdSelector.addEventListener('change', () => {
            this.#aircraftLocationIdRangeSelectionIndex = 0;
            this.#aircraftPowerIdRangeSelectionIndex = 0;
            this.#flightDataIdRangeSelectionIndex = 0;

            this.#setDroneId(droneIdSelector.options[droneIdSelector.selectedIndex].dataset.drone_id);
        });
        datasetIdRangeSelector.addEventListener('change', () => {
            if (this.#dataVisible == 'AircraftLocation') {
                this.#aircraftLocationIdRangeSelectionIndex = datasetIdRangeSelector.selectedIndex;
            } else if (this.#dataVisible == 'AircraftPower') {
                this.#aircraftPowerIdRangeSelectionIndex = datasetIdRangeSelector.selectedIndex;
            } else if (this.#dataVisible == 'FlightData') {
                this.#flightDataIdRangeSelectionIndex = datasetIdRangeSelector.selectedIndex;
            }

            this.#updateDatasetTableData();
        });
    }


    #updateButtons() {
        const btnShowAircraftLocation = document.getElementsByClassName('btn_dataValidationApplet_showAircraftLocation')[0];
        const btnShowAircraftPower = document.getElementsByClassName('btn_dataValidationApplet_showAircraftPower')[0];
        const btnShowFlightData = document.getElementsByClassName('btn_dataValidationApplet_showFlightData')[0];

        if (this.#dataVisible == 'AircraftLocation') {
            btnShowAircraftLocation.classList.add('buttonActive');
            btnShowAircraftPower.classList.remove('buttonActive');
            btnShowFlightData.classList.remove('buttonActive');
        } else if (this.#dataVisible == 'AircraftPower') {
            btnShowAircraftLocation.classList.remove('buttonActive');
            btnShowAircraftPower.classList.add('buttonActive');
            btnShowFlightData.classList.remove('buttonActive');
        } else if (this.#dataVisible == 'FlightData') {
            btnShowAircraftLocation.classList.remove('buttonActive');
            btnShowAircraftPower.classList.remove('buttonActive');
            btnShowFlightData.classList.add('buttonActive');
        }
    }

    #updateDatasetTableVisibility() {
        const aircraftLocationTableWrapper = document.getElementsByClassName('dataValidationApplet_aircraftLocationTableWrapper')[0];
        const aircraftPowerTableWrapper = document.getElementsByClassName('dataValidationApplet_aircraftPowerTableWrapper')[0];
        const flightDataTableWrapper = document.getElementsByClassName('dataValidationApplet_flightDataTableWrapper')[0];

        if (this.#dataVisible == 'AircraftLocation') {
            aircraftLocationTableWrapper.style.display = 'block';
            aircraftPowerTableWrapper.style.display = 'none';
            flightDataTableWrapper.style.display = 'none';
        } else if (this.#dataVisible == 'AircraftPower') {
            aircraftLocationTableWrapper.style.display = 'none';
            aircraftPowerTableWrapper.style.display = 'block';
            flightDataTableWrapper.style.display = 'none';
        } else if (this.#dataVisible == 'FlightData') {
            aircraftLocationTableWrapper.style.display = 'none';
            aircraftPowerTableWrapper.style.display = 'none';
            flightDataTableWrapper.style.display = 'block';
        }
    }


    update() {
        this.#updateDroneSelector();
        this.#updateIdRangeSelector();
    }


    #updateDroneSelector() {
        const payload = '{"drone_id": "%","data_type": "drone_ids"}';
        const handleResponse = () => {
            const respone = JSON.parse(xhttp.responseText);
            let newDroneIds = [];
            if (respone['executed']) {
                newDroneIds = respone['response_data']['drone_ids'].sort();
            }

            if (this.#droneIdsAvailable.sort().join(',') !== newDroneIds.sort().join(',')) {
                this.#droneIdsAvailable = newDroneIds;

                const droneIdSelector = document.getElementsByClassName('dataValidationApplet_droneIdSelector')[0];
                droneIdSelector.innerHTML = '';

                for (let i_droneId of newDroneIds) {
                    let newOption = document.createElement('option');
                    newOption.innerText = i_droneId;
                    newOption.dataset.drone_id = i_droneId;

                    droneIdSelector.appendChild(newOption);
                }

                if (this.#droneId == null) {
                    this.#setDroneId(droneIdSelector.options[droneIdSelector.selectedIndex].dataset.drone_id);
                }
            }
        };
        const xhttp = new XMLHttpRequest();
        xhttp.onload = () => { handleResponse() };
        xhttp.open('GET', trafficControlUrl + 'ask/drone_ids?payload=' + payload + '&rand=' + new Date().getTime(), true);
        xhttp.send();
    }

    #updateIdRangeSelector(alwaysUpdate = false, alwaysUpdateDatasetTableData = false) {
        const datasetIdRangeSelector = document.getElementsByClassName('dataValidationApplet_datasetIdRangeSelector')[0];
        if (this.#droneId == null) {
            datasetIdRangeSelector.innerHTML = '';
            return;
        }

        let requestUrl = '';
        let payload = '';
        let idRangeSelectedMin = -1;
        let idRangeSelectedMax = -1;
        if (this.#dataVisible == 'AircraftLocation') {
            requestUrl = trafficControlUrl + 'ask/aircraft_location_ids';
            payload = '{"drone_id": "' + this.#droneId + '","data_type": "aircraft_location_ids"}';
            idRangeSelectedMin = this.#aircraftLocationIdRangeSelectedMin;
            idRangeSelectedMax = this.#aircraftLocationIdRangeSelectedMax;
        } else if (this.#dataVisible == 'AircraftPower') {
            requestUrl = trafficControlUrl + 'ask/aircraft_power_ids';
            payload = '{"drone_id": "' + this.#droneId + '","data_type": "aircraft_power_ids"}';
            idRangeSelectedMin = this.#aircraftPowerIdRangeSelectedMin;
            idRangeSelectedMax = this.#aircraftPowerIdRangeSelectedMax;
        } else if (this.#dataVisible == 'FlightData') {
            requestUrl = trafficControlUrl + 'ask/flight_data_ids';
            payload = '{"drone_id": "' + this.#droneId + '","data_type": "flight_data_ids"}';
            idRangeSelectedMin = this.#flightDataIdRangeSelectedMin;
            idRangeSelectedMax = this.#flightDataIdRangeSelectedMax;
        }

        const handleResponse = () => {
            const response = JSON.parse(xhttp.responseText);
            let idMin = -1;
            let idMax = -1;
            if (response['executed']) {
                idMin = response['response_data']['min_id'];
                idMax = response['response_data']['max_id'];
            }

            if (alwaysUpdate || ((response['executed'] && (idMin != idRangeSelectedMin || idMax != idRangeSelectedMax)))) {
                const datasetIdRangeSelector = document.getElementsByClassName('dataValidationApplet_datasetIdRangeSelector')[0];

                const lastOptionSelected = datasetIdRangeSelector.options.selectedIndex == datasetIdRangeSelector.options.length - 1;

                if (this.#dataVisible == 'AircraftLocation') {
                    this.#aircraftLocationIdRangeSelectedMin = idMin;
                    this.#aircraftLocationIdRangeSelectedMax = idMax;
                } else if (this.#dataVisible == 'AircraftPower') {
                    this.#aircraftPowerIdRangeSelectedMin = idMin;
                    this.#aircraftPowerIdRangeSelectedMax = idMax;
                } else if (this.#dataVisible == 'FlightData') {
                    this.#flightDataIdRangeSelectedMin = idMin;
                    this.#flightDataIdRangeSelectedMax = idMax;
                }

                datasetIdRangeSelector.innerHTML = '';

                const datasetsPerPage = 50;
                for (let i = 0; i <= idMax - idMin; i += datasetsPerPage) {
                    let tmpIdMin = i + idMin;
                    let tmpIdMax = i + idMin + datasetsPerPage - 1;
                    if (tmpIdMax > idMax) tmpIdMax = idMax;

                    let newOption = document.createElement('option');
                    newOption.innerText = tmpIdMin + ' - ' + tmpIdMax;
                    newOption.dataset.min_id = tmpIdMin;
                    newOption.dataset.max_id = tmpIdMax;

                    if (this.#dataVisible == 'AircraftLocation') {
                        if (i / datasetsPerPage == this.#aircraftLocationIdRangeSelectionIndex) {
                            newOption.selected = 'true';
                        }
                    } else if (this.#dataVisible == 'AircraftPower') {
                        if (i / datasetsPerPage == this.#aircraftPowerIdRangeSelectionIndex) {
                            newOption.selected = 'true';
                        }
                    } else if (this.#dataVisible == 'FlightData') {
                        if (i / datasetsPerPage == this.#flightDataIdRangeSelectionIndex) {
                            newOption.selected = 'true';
                        }
                    }

                    datasetIdRangeSelector.appendChild(newOption);
                }

                if (lastOptionSelected) {
                    this.#updateDatasetTableData();
                }
                if (alwaysUpdateDatasetTableData) {
                    this.#updateDatasetTableData();
                }
            }
        };
        const xhttp = new XMLHttpRequest();
        xhttp.onload = () => { handleResponse() };
        xhttp.open('GET', requestUrl + '?payload=' + payload + '&rand=' + new Date().getTime(), true);
        xhttp.send();
    }


    #updateDatasetTableData() {
        if (this.#dataVisible == 'AircraftLocation') {
            this.#updateDatasetTableDataAircraftLocation();
        } else if (this.#dataVisible == 'AircraftPower') {
            this.#updateDatasetTableDataAircraftPower();
        } else if (this.#dataVisible == 'FlightData') {
            this.#updateDatasetTableDataFlightData();
        }
    }

    #updateDatasetTableDataAircraftLocation() {
        const datasetIdRangeSelecor = document.getElementsByClassName('dataValidationApplet_datasetIdRangeSelector')[0];

        const aircraftLocationTableWrapper = document.getElementsByClassName('dataValidationApplet_aircraftLocationTableWrapper')[0];

        const tableBody = aircraftLocationTableWrapper.querySelectorAll('tbody')[0];
        tableBody.innerHTML = '';


        const datasetMinId = datasetIdRangeSelecor.options[this.#aircraftLocationIdRangeSelectionIndex].dataset.min_id;
        const datasetMaxId = datasetIdRangeSelecor.options[this.#aircraftLocationIdRangeSelectionIndex].dataset.max_id;
        for (let datasetId = datasetMinId; datasetId <= datasetMaxId; datasetId++) {
            let newDatasetEntry = document.createElement('tr');
            newDatasetEntry.dataset.dataset_id = datasetId;

            let datasetVefified = document.createElement('td');
            datasetVefified.style.backgroundColor = 'orange';
            datasetVefified.innerText = 'not checked yet';

            let datasetTransactionUUID = document.createElement('td');
            datasetTransactionUUID.innerText = 'transaction_uuid';

            let datasetTCId = document.createElement('td');
            datasetTCId.innerText = datasetId;

            let datasetDroneId = document.createElement('td');
            datasetDroneId.innerText = this.#droneId;

            let datasetGpsSignalLevel = document.createElement('td');
            datasetGpsSignalLevel.innerText = 'gps_signal_level';

            let datasetGpsSatellitesConnected = document.createElement('td');
            datasetGpsSatellitesConnected.innerText = 'gps_satellites_connected';

            let datasetGpsValid = document.createElement('td');
            datasetGpsValid.innerText = 'gps_valid';

            let datasetGpsLat = document.createElement('td');
            datasetGpsLat.innerText = 'gps_lat';

            let datasetGpsLon = document.createElement('td');
            datasetGpsLon.innerText = 'gps_lon';

            let datasetAltitude = document.createElement('td');
            datasetAltitude.innerText = 'altitude';

            let datasetVelocityX = document.createElement('td');
            datasetVelocityX.innerText = 'velocity_x';

            let datasetVelocityY = document.createElement('td');
            datasetVelocityY.innerText = 'velocity_y';

            let datasetVelocityZ = document.createElement('td');
            datasetVelocityZ.innerText = 'velocity_z';

            let datasetPitch = document.createElement('td');
            datasetPitch.innerText = 'pitch';

            let datasetYaw = document.createElement('td');
            datasetYaw.innerText = 'yaw';

            let datasetRoll = document.createElement('td');
            datasetRoll.innerText = 'roll';

            newDatasetEntry.appendChild(datasetVefified);
            newDatasetEntry.appendChild(datasetTransactionUUID);
            newDatasetEntry.appendChild(datasetTCId);
            newDatasetEntry.appendChild(datasetDroneId);
            newDatasetEntry.appendChild(datasetGpsSignalLevel);
            newDatasetEntry.appendChild(datasetGpsSatellitesConnected);
            newDatasetEntry.appendChild(datasetGpsValid);
            newDatasetEntry.appendChild(datasetGpsLat);
            newDatasetEntry.appendChild(datasetGpsLon);
            newDatasetEntry.appendChild(datasetAltitude);
            newDatasetEntry.appendChild(datasetVelocityX);
            newDatasetEntry.appendChild(datasetVelocityY);
            newDatasetEntry.appendChild(datasetVelocityZ);
            newDatasetEntry.appendChild(datasetPitch);
            newDatasetEntry.appendChild(datasetYaw);
            newDatasetEntry.appendChild(datasetRoll);

            tableBody.appendChild(newDatasetEntry);


            // Update AircraftLocation data
            const payloadAircraftLocation = '{"drone_id": "' + this.#droneId + '","data_type": "aircraft_location", "data": {"data_id": ' + datasetId + '}}';
            const handleTrafficControlResponse = () => {
                const response = JSON.parse(xhttpTrafficControl.responseText);
                // response_data is null if no data has been recorded yet
                if (response['executed'] && response['response_data'] != null) {
                    datasetTransactionUUID.innerText = response['response_data']['transaction_uuid'];
                    //datasetTCId.innerText = datasetId;
                    //datasetDroneId.innerText = response['response_data']['drone_id'];
                    datasetGpsSignalLevel.innerText = response['response_data']['gps_signal_level'];
                    datasetGpsSatellitesConnected.innerText = response['response_data']['gps_satellites_connected'];
                    datasetGpsValid.innerText = response['response_data']['gps_valid'] ? 'true' : 'false';
                    datasetGpsLat.innerText = response['response_data']['gps_lat'];
                    datasetGpsLon.innerText = response['response_data']['gps_lon'];
                    datasetAltitude.innerText = response['response_data']['altitude'];
                    datasetVelocityX.innerText = response['response_data']['velocity_x'];
                    datasetVelocityY.innerText = response['response_data']['velocity_y'];
                    datasetVelocityZ.innerText = response['response_data']['velocity_z'];
                    datasetPitch.innerText = response['response_data']['pitch'];
                    datasetYaw.innerText = response['response_data']['yaw'];
                    datasetRoll.innerText = response['response_data']['roll'];

                    const transactionUUID = response['response_data']['transaction_uuid']
                    if (transactionUUID != null && transactionUUID != '') {
                        datasetVefified.innerText = 'checking...';

                        const handleCChainLinkResponse = () => {
                            const response = JSON.parse(xhttpCChainLink.response);

                            if (response['executed']) {
                                if (response['response_data'] != null) {
                                    const responseTransactionUUID = response['response_data']['transaction_uuid'];
                                    const responseTransactionData = JSON.parse(response['response_data']['transaction_data']);

                                    let allDataValid = true;

                                    if (datasetTransactionUUID.innerText != responseTransactionUUID) {
                                        allDataValid = false;
                                        datasetTransactionUUID.innerHTML = '<s>' + datasetTransactionUUID.innerText + '</s> / <b>' + responseTransactionUUID + '</b>';
                                    }
                                    if (datasetDroneId.innerText != responseTransactionData['drone_id']) {
                                        allDataValid = false;
                                        datasetDroneId.innerHTML = '<s>' + datasetDroneId.innerText + '</s> / <b>' + responseTransactionData['drone_id'] + '</b>';
                                    }
                                    if (datasetGpsSignalLevel.innerText != responseTransactionData['data']['gps_signal_level']) {
                                        allDataValid = false;
                                        datasetGpsSignalLevel.innerHTML = '<s>' + datasetGpsSignalLevel.innerText + '</s> / <b>' + responseTransactionData['data']['gps_signal_level'] + '</b>';
                                    }
                                    if (datasetGpsSatellitesConnected.innerText != responseTransactionData['data']['gps_satellites_connected']) {
                                        allDataValid = false;
                                        datasetGpsSatellitesConnected.innerHTML = '<s>' + datasetGpsSatellitesConnected.innerText + '</s> / <b>' + responseTransactionData['data']['gps_satellites_connected'] + '</b>';
                                    }
                                    if (toBoolean(datasetGpsValid.innerText) != responseTransactionData['data']['gps_valid']) {
                                        allDataValid = false;
                                        datasetGpsValid.innerHTML = '<s>' + datasetGpsValid.innerText + '</s> / <b>' + responseTransactionData['data']['gps_valid'] + '</b>';
                                    }
                                    if (datasetGpsLat.innerText != responseTransactionData['data']['gps_lat']) {
                                        allDataValid = false;
                                        datasetGpsLat.innerHTML = '<s>' + datasetGpsLat.innerText + '</s> / <b>' + responseTransactionData['data']['gps_lat'] + '</b>';
                                    }
                                    if (datasetGpsLon.innerText != responseTransactionData['data']['gps_lon']) {
                                        allDataValid = false;
                                        datasetGpsLon.innerHTML = '<s>' + datasetGpsLon.innerText + '</s> / <b>' + responseTransactionData['data']['gps_lon'] + '</b>';
                                    }
                                    if (datasetAltitude.innerText != responseTransactionData['data']['altitude']) {
                                        allDataValid = false;
                                        datasetAltitude.innerHTML = '<s>' + datasetAltitude.innerText + '</s> / <b>' + responseTransactionData['data']['altitude'] + '</b>';
                                    }
                                    if (datasetVelocityX.innerText != responseTransactionData['data']['velocity_x']) {
                                        allDataValid = false;
                                        datasetVelocityX.innerHTML = '<s>' + datasetVelocityX.innerText + '</s> / <b>' + responseTransactionData['data']['velocity_x'] + '</b>';
                                    }
                                    if (datasetVelocityY.innerText != responseTransactionData['data']['velocity_y']) {
                                        allDataValid = false;
                                        datasetVelocityY.innerHTML = '<s>' + datasetVelocityY.innerText + '</s> / <b>' + responseTransactionData['data']['velocity_y'] + '</b>';
                                    }
                                    if (datasetVelocityZ.innerText != responseTransactionData['data']['velocity_z']) {
                                        allDataValid = false;
                                        datasetVelocityZ.innerHTML = '<s>' + datasetVelocityZ.innerText + '</s> / <b>' + responseTransactionData['data']['velocity_z'] + '</b>';
                                    }
                                    if (datasetPitch.innerText != responseTransactionData['data']['pitch']) {
                                        allDataValid = false;
                                        datasetPitch.innerHTML = '<s>' + datasetPitch.innerText + '</s> / <b>' + responseTransactionData['data']['pitch'] + '</b>';
                                    }
                                    if (datasetYaw.innerText != responseTransactionData['data']['yaw']) {
                                        allDataValid = false;
                                        datasetYaw.innerHTML = '<s>' + datasetYaw.innerText + '</s> / <b>' + responseTransactionData['data']['yaw'] + '</b>';
                                    }
                                    if (datasetRoll.innerText != responseTransactionData['data']['roll']) {
                                        allDataValid = false;
                                        datasetRoll.innerHTML = '<s>' + datasetRoll.innerText + '</s> / <b>' + responseTransactionData['data']['roll'] + '</b>';
                                    }

                                    if (allDataValid) {
                                        datasetVefified.innerText = 'OK';
                                        datasetVefified.style.backgroundColor = 'green';
                                    } else {
                                        datasetVefified.innerText = 'DATA MANIPULATED';
                                        datasetVefified.style.backgroundColor = 'red';
                                    }
                                }
                            } else {
                                datasetVefified.innerText = 'ERROR';
                                // TODO: Show errors & warnings (on hover?)
                                datasetVefified.style.backgroundColor = 'red';
                            }
                        };

                        const xhttpCChainLink = new XMLHttpRequest();
                        xhttpCChainLink.onload = () => { handleCChainLinkResponse() };
                        xhttpCChainLink.timeout = 5000;
                        xhttpCChainLink.ontimeout = (e) => {
                            datasetVefified.innerText = 'C-Chain Link unreachable';
                            datasetVefified.style.backgroundColor = 'red';
                        };
                        xhttpCChainLink.onerror = (e) => {
                            datasetVefified.innerText = 'invalid response from C-Chain Link';
                            datasetVefified.style.backgroundColor = 'red';
                        };
                        xhttpCChainLink.open('GET', cChainLinkUrl + 'get_data?transaction_uuid=' + transactionUUID + '&rand=' + new Date().getTime(), true);
                        xhttpCChainLink.send();
                    } else {
                        datasetVefified.innerText = 'not booked in blockchain';
                        datasetVefified.style.backgroundColor = 'red';
                    }
                }
            };
            const xhttpTrafficControl = new XMLHttpRequest();
            xhttpTrafficControl.onload = () => { handleTrafficControlResponse() };
            xhttpTrafficControl.open('GET', trafficControlUrl + 'ask/aircraft_location?payload=' + payloadAircraftLocation + '&rand=' + new Date().getTime(), true);
            xhttpTrafficControl.send();
        }
    }

    #updateDatasetTableDataAircraftPower() {

    }

    #updateDatasetTableDataFlightData() {

    }


    #setDroneId(droneId) {
        this.#droneId = droneId;
        this.#updateIdRangeSelector(true, true);
    }

}