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
            this.#updateIdRangeSelector(true, true);
            this.#updateDatasetTableVisibility();
        });
        btnShowAircraftPower.addEventListener('click', () => {
            this.#dataVisible = 'AircraftPower';
            this.#updateButtons();
            this.#updateIdRangeSelector(true, true);
            this.#updateDatasetTableVisibility();
        });
        btnShowFlightData.addEventListener('click', () => {
            this.#dataVisible = 'FlightData';
            this.#updateButtons();
            this.#updateIdRangeSelector(true, true);
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

            let lastOptionSelected = false; // initialize with default value
            if (alwaysUpdate || ((response['executed'] && (idMin != idRangeSelectedMin || idMax != idRangeSelectedMax)))) {
                const datasetIdRangeSelector = document.getElementsByClassName('dataValidationApplet_datasetIdRangeSelector')[0];

                lastOptionSelected = datasetIdRangeSelector.options.selectedIndex == datasetIdRangeSelector.options.length - 1;

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
            }

            // !lastOptionSelected so that it doesn't get executed twice
            if (!lastOptionSelected && alwaysUpdateDatasetTableData) {
                this.#updateDatasetTableData();
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


        const datasetMinId = parseInt(datasetIdRangeSelecor.options[this.#aircraftLocationIdRangeSelectionIndex].dataset.min_id);
        const datasetMaxId = parseInt(datasetIdRangeSelecor.options[this.#aircraftLocationIdRangeSelectionIndex].dataset.max_id);
        for (let datasetId = datasetMinId; datasetId <= datasetMaxId; datasetId++) {
            let newDatasetEntry = document.createElement('tr');

            let datasetDataIntegrity = document.createElement('td');
            datasetDataIntegrity.style.backgroundColor = 'orange';
            datasetDataIntegrity.innerText = 'not checked yet';

            let datasetTimeCreated = document.createElement('td');
            datasetTimeCreated.innerText = 'time_created';

            let datasetTimeSent = document.createElement('td');
            datasetTimeSent.innerText = 'time_sent';

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

            newDatasetEntry.appendChild(datasetDataIntegrity);
            newDatasetEntry.appendChild(datasetTimeCreated);
            newDatasetEntry.appendChild(datasetTimeSent);
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
            const payloadTrafficControl = '{"drone_id": "' + this.#droneId + '","data_type": "aircraft_location", "data": {"data_id": ' + datasetId + '}}';
            const handleTrafficControlResponse = () => {
                const response = JSON.parse(xhttpTrafficControl.responseText);
                if (response['executed'] && response['response_data'] != null) {
                    datasetTimeCreated.innerText = unixTimeToString(response['response_data']['time_created']);
                    datasetTimeSent.innerText = unixTimeToString(response['response_data']['time_sent']);
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
                        datasetDataIntegrity.innerText = 'checking...';

                        const handleCChainLinkResponse = () => {
                            const response = JSON.parse(xhttpCChainLink.response);

                            if (response['executed']) {
                                if (response['response_data'] != null) {
                                    const responseTransactionUUID = response['response_data']['transaction_uuid'];
                                    const responseTransactionData = JSON.parse(response['response_data']['transaction_data']);

                                    let allDataValid = true;

                                    if (datasetTimeCreated.innerText != unixTimeToString(responseTransactionData['time_created'])) {
                                        allDataValid = false;
                                        datasetTimeCreated.innerHTML = '<s>' + datasetTimeCreated.innerText + '</s> / <b>' + unixTimeToString(responseTransactionData['time_created']) + '</b>';
                                    }
                                    if (datasetTimeSent.innerText != unixTimeToString(responseTransactionData['time_sent'])) {
                                        allDataValid = false;
                                        datasetTimeSent.innerHTML = '<s>' + datasetTimeSent.innerText + '</s> / <b>' + unixTimeToString(responseTransactionData['time_sent']) + '</b>';
                                    }
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
                                        datasetDataIntegrity.innerText = 'OK';
                                        datasetDataIntegrity.style.backgroundColor = 'green';
                                    } else {
                                        datasetDataIntegrity.innerText = 'DATA MANIPULATED';
                                        datasetDataIntegrity.style.backgroundColor = 'red';
                                    }
                                }
                            } else {
                                datasetDataIntegrity.innerText = 'ERROR';
                                // TODO: Show errors & warnings (on hover?)
                                datasetDataIntegrity.style.backgroundColor = 'red';
                            }
                        };

                        const xhttpCChainLink = new XMLHttpRequest();
                        xhttpCChainLink.onload = () => { handleCChainLinkResponse() };
                        xhttpCChainLink.timeout = 5000;
                        xhttpCChainLink.ontimeout = (e) => {
                            datasetDataIntegrity.innerText = 'C-Chain Link unreachable';
                            datasetDataIntegrity.style.backgroundColor = 'red';
                        };
                        xhttpCChainLink.onerror = (e) => {
                            datasetDataIntegrity.innerText = 'invalid response from C-Chain Link';
                            datasetDataIntegrity.style.backgroundColor = 'red';
                        };
                        xhttpCChainLink.open('GET', cChainLinkUrl + 'get_data?'
                                                    + 'chain_uuid=' + drones[this.#droneId].getChainUuidBlackbox()
                                                    + '&transaction_uuid=' + transactionUUID
                                                    + '&rand=' + new Date().getTime(), true);
                        xhttpCChainLink.send();
                    } else {
                        datasetDataIntegrity.innerText = 'not booked in blockchain';
                        datasetDataIntegrity.style.backgroundColor = 'red';
                    }
                }
            };
            const xhttpTrafficControl = new XMLHttpRequest();
            xhttpTrafficControl.onload = () => { handleTrafficControlResponse() };
            xhttpTrafficControl.open('GET', trafficControlUrl + 'ask/aircraft_location?payload=' + payloadTrafficControl + '&rand=' + new Date().getTime(), true);
            xhttpTrafficControl.send();
        }
    }

    #updateDatasetTableDataAircraftPower() {
        const datasetIdRangeSelecor = document.getElementsByClassName('dataValidationApplet_datasetIdRangeSelector')[0];

        const aircraftPowerTableWrapper = document.getElementsByClassName('dataValidationApplet_aircraftPowerTableWrapper')[0];

        const tableBody = aircraftPowerTableWrapper.querySelectorAll('tbody')[0];
        tableBody.innerHTML = '';


        const datasetMinId = parseInt(datasetIdRangeSelecor.options[this.#aircraftPowerIdRangeSelectionIndex].dataset.min_id);
        const datasetMaxId = parseInt(datasetIdRangeSelecor.options[this.#aircraftPowerIdRangeSelectionIndex].dataset.max_id);
        for (let datasetId = datasetMinId; datasetId <= datasetMaxId; datasetId++) {
            let newDatasetEntry = document.createElement('tr');

            let datasetDataIntegrity = document.createElement('td');
            datasetDataIntegrity.style.backgroundColor = 'orange';
            datasetDataIntegrity.innerText = 'not checked yet';

            let datasetTimeCreated = document.createElement('td');
            datasetTimeCreated.innerText = 'time_created'

            let datasetTimeSent = document.createElement('td');
            datasetTimeSent.innerText = 'time_sent'

            let datasetTransactionUUID = document.createElement('td');
            datasetTransactionUUID.innerText = 'transaction_uuid';

            let datasetTCId = document.createElement('td');
            datasetTCId.innerText = datasetId;

            let datasetDroneId = document.createElement('td');
            datasetDroneId.innerText = this.#droneId;

            let datasetBatteryRemaining = document.createElement('td');
            datasetBatteryRemaining.innerText = 'battery_remaining';

            let datasetBatteryRemainingPercent = document.createElement('td');
            datasetBatteryRemainingPercent.innerText = 'battery_remaining_percent';

            let datasetRemainingFlightTime = document.createElement('td');
            datasetRemainingFlightTime.innerText = 'remaining_flight_time';

            let datasetRemainingFlightRadius = document.createElement('td');
            datasetRemainingFlightRadius.innerText = 'remaining_flight_radius';

            newDatasetEntry.appendChild(datasetDataIntegrity);
            newDatasetEntry.appendChild(datasetTimeCreated);
            newDatasetEntry.appendChild(datasetTimeSent);
            newDatasetEntry.appendChild(datasetTransactionUUID);
            newDatasetEntry.appendChild(datasetTCId);
            newDatasetEntry.appendChild(datasetDroneId);
            newDatasetEntry.appendChild(datasetBatteryRemaining);
            newDatasetEntry.appendChild(datasetBatteryRemainingPercent);
            newDatasetEntry.appendChild(datasetRemainingFlightTime);
            newDatasetEntry.appendChild(datasetRemainingFlightRadius);

            tableBody.appendChild(newDatasetEntry);

            const payloadTrafficControl = '{"drone_id": "' + this.#droneId + '","data_type": "aircraft_power", "data": {"data_id": ' + datasetId + '}}';
            const handleTrafficControlResponse = () => {
                const response = JSON.parse(xhttpTrafficControl.responseText);
                if (response['executed'] && response['response_data'] != null) {
                    datasetTimeCreated.innerText = unixTimeToString(response['response_data']['time_created']);
                    datasetTimeSent.innerText = unixTimeToString(response['response_data']['time_sent']);
                    datasetTransactionUUID.innerText = response['response_data']['transaction_uuid'];
                    //datasetTCId.innerText = datasetId;
                    //datasetDroneId.innerText = response['response_data']['drone_id'];
                    datasetBatteryRemaining.innerText = response['response_data']['battery_remaining'];
                    datasetBatteryRemainingPercent.innerText = response['response_data']['battery_remaining_percent'];
                    datasetRemainingFlightTime.innerText = response['response_data']['remaining_flight_time'];
                    datasetRemainingFlightRadius.innerText = response['response_data']['remaining_flight_radius'];

                    const transactionUUID = response['response_data']['transaction_uuid']
                    if (transactionUUID != null && transactionUUID != '') {
                        datasetDataIntegrity.innerText = 'checking...';

                        const handleCChainLinkResponse = () => {
                            const response = JSON.parse(xhttpCChainLink.response);

                            if (response['executed']) {
                                if (response['response_data'] != null) {
                                    const responseTransactionUUID = response['response_data']['transaction_uuid'];
                                    const responseTransactionData = JSON.parse(response['response_data']['transaction_data']);

                                    let allDataValid = true;

                                    if (datasetTimeCreated.innerText != unixTimeToString(responseTransactionData['time_created'])) {
                                        allDataValid = false;
                                        datasetTimeCreated.innerHTML = '<s>' + datasetTimeCreated.innerText + '</s> / <b>' + unixTimeToString(responseTransactionData['time_created']) + '</b>';
                                    }
                                    if (datasetTimeSent.innerText != unixTimeToString(responseTransactionData['time_sent'])) {
                                        allDataValid = false;
                                        datasetTimeSent.innerHTML = '<s>' + datasetTimeSent.innerText + '</s> / <b>' + unixTimeToString(responseTransactionData['time_sent']) + '</b>';
                                    }
                                    if (datasetTransactionUUID.innerText != responseTransactionUUID) {
                                        allDataValid = false;
                                        datasetTransactionUUID.innerHTML = '<s>' + datasetTransactionUUID.innerText + '</s> / <b>' + responseTransactionUUID + '</b>';
                                    }
                                    if (datasetDroneId.innerText != responseTransactionData['drone_id']) {
                                        allDataValid = false;
                                        datasetDroneId.innerHTML = '<s>' + datasetDroneId.innerText + '</s> / <b>' + responseTransactionData['drone_id'] + '</b>';
                                    }
                                    if (datasetBatteryRemaining.innerText != responseTransactionData['data']['battery_remaining']) {
                                        allDataValid = false;
                                        datasetBatteryRemaining.innerHTML = '<s>' + datasetBatteryRemaining.innerText + '</s> / <b>' + responseTransactionData['data']['battery_remaining'] + '</b>';
                                    }
                                    if (datasetBatteryRemainingPercent.innerText != responseTransactionData['data']['battery_remaining_percent']) {
                                        allDataValid = false;
                                        datasetBatteryRemainingPercent.innerHTML = '<s>' + datasetBatteryRemainingPercent.innerText + '</s> / <b>' + responseTransactionData['data']['battery_remaining_percent'] + '</b>';
                                    }
                                    if (datasetRemainingFlightTime.innerText != responseTransactionData['data']['remaining_flight_time']) {
                                        allDataValid = false;
                                        datasetRemainingFlightTime.innerHTML = '<s>' + datasetRemainingFlightTime.innerText + '</s> / <b>' + responseTransactionData['data']['remaining_flight_time'] + '</b>';
                                    }
                                    if (datasetRemainingFlightRadius.innerText != responseTransactionData['data']['remaining_flight_radius']) {
                                        allDataValid = false;
                                        datasetRemainingFlightRadius.innerHTML = '<s>' + datasetRemainingFlightRadius.innerText + '</s> / <b>' + responseTransactionData['data']['remaining_flight_radius'] + '</b>';
                                    }

                                    if (allDataValid) {
                                        datasetDataIntegrity.innerText = 'OK';
                                        datasetDataIntegrity.style.backgroundColor = 'green';
                                    } else {
                                        datasetDataIntegrity.innerText = 'DATA MANIPULATED';
                                        datasetDataIntegrity.style.backgroundColor = 'red';
                                    }
                                }
                            } else {
                                datasetDataIntegrity.innerText = 'ERROR';
                                // TODO: Show errors & warnings (on hover?)
                                datasetDataIntegrity.style.backgroundColor = 'red';
                            }
                        };

                        const xhttpCChainLink = new XMLHttpRequest();
                        xhttpCChainLink.onload = () => { handleCChainLinkResponse() };
                        xhttpCChainLink.timeout = 5000;
                        xhttpCChainLink.ontimeout = (e) => {
                            datasetDataIntegrity.innerText = 'C-Chain Link unreachable';
                            datasetDataIntegrity.style.backgroundColor = 'red';
                        };
                        xhttpCChainLink.onerror = (e) => {
                            datasetDataIntegrity.innerText = 'invalid response from C-Chain Link';
                            datasetDataIntegrity.style.backgroundColor = 'red';
                        };
                        xhttpCChainLink.open('GET', cChainLinkUrl + 'get_data?transaction_uuid=' + transactionUUID + '&rand=' + new Date().getTime(), true);
                        xhttpCChainLink.send();
                    } else {
                        datasetDataIntegrity.innerText = 'not booked in blockchain';
                        datasetDataIntegrity.style.backgroundColor = 'red';
                    }
                }
            };
            const xhttpTrafficControl = new XMLHttpRequest();
            xhttpTrafficControl.onload = () => { handleTrafficControlResponse() };
            xhttpTrafficControl.open('GET', trafficControlUrl + 'ask/aircraft_power?payload=' + payloadTrafficControl + '&rand=' + new Date().getTime(), true);
            xhttpTrafficControl.send();
        }
    }

    #updateDatasetTableDataFlightData() {
        const datasetIdRangeSelecor = document.getElementsByClassName('dataValidationApplet_datasetIdRangeSelector')[0];

        const flightDataTableWrapper = document.getElementsByClassName('dataValidationApplet_flightDataTableWrapper')[0];

        const tableBody = flightDataTableWrapper.querySelectorAll('tbody')[0];
        tableBody.innerHTML = '';


        const datasetMinId = parseInt(datasetIdRangeSelecor.options[this.#flightDataIdRangeSelectionIndex].dataset.min_id);
        const datasetMaxId = parseInt(datasetIdRangeSelecor.options[this.#flightDataIdRangeSelectionIndex].dataset.max_id);
        for (let datasetId = datasetMinId; datasetId <= datasetMaxId; datasetId++) {
            let newDatasetEntry = document.createElement('tr');

            let datasetDataIntegrity = document.createElement('td');
            datasetDataIntegrity.style.backgroundColor = 'orange';
            datasetDataIntegrity.innerText = 'not checked yet';

            let datasetTimeCreated = document.createElement('td');
            datasetTimeCreated.innerText = 'time_created';

            let datasetTimeSent = document.createElement('td');
            datasetTimeSent.innerText = 'time_sent';

            let datasetTransactionUUID = document.createElement('td');
            datasetTransactionUUID.innerText = 'transaction_uuid';

            let datasetTCId = document.createElement('td');
            datasetTCId.innerText = datasetId;

            let datasetDroneId = document.createElement('td');
            datasetDroneId.innerText = this.#droneId;

            let datasetTakeoffTime = document.createElement('td');
            datasetTakeoffTime.innerText = 'takeoff_time';

            let datasetTakeoffGpsValid = document.createElement('td');
            datasetTakeoffGpsValid.innerText = 'takeoff_gps_valid';

            let datasetTakeoffGpsLat = document.createElement('td');
            datasetTakeoffGpsLat.innerText = 'takeoff_gps_lat';

            let datasetTakeoffGpsLon = document.createElement('td');
            datasetTakeoffGpsLon.innerText = 'takeoff_gps_lon';

            let datasetLandingTime = document.createElement('td');
            datasetLandingTime.innerText = 'landing_time';

            let datasetLandingGpsValid = document.createElement('td');
            datasetLandingGpsValid.innerText = 'landing_gps_valid';

            let datasetLandingGpsLat = document.createElement('td');
            datasetLandingGpsLat.innerText = 'landing_gps_lat';

            let datasetLandingGpsLon = document.createElement('td');
            datasetLandingGpsLon.innerText = 'landing_gps_lon';

            let datasetOperationModes = document.createElement('td');
            datasetOperationModes.innerText = 'operation_modes';

            newDatasetEntry.appendChild(datasetDataIntegrity);
            newDatasetEntry.appendChild(datasetTimeCreated);
            newDatasetEntry.appendChild(datasetTimeSent);
            newDatasetEntry.appendChild(datasetTransactionUUID);
            newDatasetEntry.appendChild(datasetTCId);
            newDatasetEntry.appendChild(datasetDroneId);
            newDatasetEntry.appendChild(datasetTakeoffTime);
            newDatasetEntry.appendChild(datasetTakeoffGpsValid);
            newDatasetEntry.appendChild(datasetTakeoffGpsLat);
            newDatasetEntry.appendChild(datasetTakeoffGpsLon);
            newDatasetEntry.appendChild(datasetLandingTime);
            newDatasetEntry.appendChild(datasetLandingGpsValid);
            newDatasetEntry.appendChild(datasetLandingGpsLat);
            newDatasetEntry.appendChild(datasetLandingGpsLon);
            newDatasetEntry.appendChild(datasetOperationModes);

            tableBody.appendChild(newDatasetEntry);

            const payloadTrafficControl = '{"drone_id": "' + this.#droneId + '","data_type": "flight_data", "data": {"data_id": ' + datasetId + '}}';
            const handleTrafficControlResponse = () => {
                const response = JSON.parse(xhttpTrafficControl.responseText);
                if (response['executed'] && response['response_data'] != null) {
                    datasetTimeCreated.innerText = unixTimeToString(response['response_data']['time_created']);
                    datasetTimeSent.innerText = unixTimeToString(response['response_data']['time_sent']);
                    datasetTransactionUUID.innerText = response['response_data']['transaction_uuid'];
                    //datasetTCId.innerText = datasetId;
                    //datasetDroneId.innerText = response['response_data']['drone_id'];
                    datasetTakeoffTime.innerText = response['response_data']['takeoff_time'];
                    datasetTakeoffGpsValid.innerText = response['response_data']['takeoff_gps_valid'] ? 'true' : 'false';
                    datasetTakeoffGpsLat.innerText = response['response_data']['takeoff_gps_lat'];
                    datasetTakeoffGpsLon.innerText = response['response_data']['takeoff_gps_lon'];
                    datasetLandingTime.innerText = response['response_data']['landing_time'];
                    datasetLandingGpsValid.innerText = response['response_data']['landing_gps_valid'] ? 'true' : 'false';
                    datasetLandingGpsLat.innerText = response['response_data']['landing_gps_lat'];
                    datasetLandingGpsLon.innerText = response['response_data']['landing_gps_lon'];
                    datasetOperationModes.innerText = response['response_data']['operation_modes'];

                    const transactionUUID = response['response_data']['transaction_uuid']
                    if (transactionUUID != null && transactionUUID != '') {
                        datasetDataIntegrity.innerText = 'checking...';

                        const handleCChainLinkResponse = () => {
                            const response = JSON.parse(xhttpCChainLink.response);

                            if (response['executed']) {
                                if (response['response_data'] != null) {
                                    const responseTransactionUUID = response['response_data']['transaction_uuid'];
                                    const responseTransactionData = JSON.parse(response['response_data']['transaction_data']);

                                    let allDataValid = true;

                                    if (datasetTimeCreated.innerText != unixTimeToString(responseTransactionData['time_created'])) {
                                        allDataValid = false;
                                        datasetTimeCreated.innerHTML = '<s>' + datasetTimeCreated.innerText + '</s> / <b>' + unixTimeToString(responseTransactionData['time_created']) + '</b>';
                                    }
                                    if (datasetTimeSent.innerText != unixTimeToString(responseTransactionData['time_sent'])) {
                                        allDataValid = false;
                                        datasetTimeSent.innerHTML = '<s>' + datasetTimeSent.innerText + '</s> / <b>' + unixTimeToString(responseTransactionData['time_sent']) + '</b>';
                                    }
                                    if (datasetTransactionUUID.innerText != responseTransactionUUID) {
                                        allDataValid = false;
                                        datasetTransactionUUID.innerHTML = '<s>' + datasetTransactionUUID.innerText + '</s> / <b>' + responseTransactionUUID + '</b>';
                                    }
                                    if (datasetDroneId.innerText != responseTransactionData['drone_id']) {
                                        allDataValid = false;
                                        datasetDroneId.innerHTML = '<s>' + datasetDroneId.innerText + '</s> / <b>' + responseTransactionData['drone_id'] + '</b>';
                                    }
                                    if (datasetTakeoffTime.innerText != responseTransactionData['data']['takeoff_time']) {
                                        allDataValid = false;
                                        datasetTakeoffTime.innerHTML = '<s>' + datasetTakeoffTime.innerText + '</s> / <b>' + responseTransactionData['data']['takeoff_time'] + '</b>';
                                    }
                                    if (toBoolean(datasetTakeoffGpsValid.innerText) != responseTransactionData['data']['takeoff_gps_valid']) {
                                        allDataValid = false;
                                        datasetTakeoffGpsValid.innerHTML = '<s>' + datasetTakeoffGpsValid.innerText + '</s> / <b>' + responseTransactionData['data']['takeoff_gps_valid'] + '</b>';
                                    }
                                    if (datasetTakeoffGpsLat.innerText != responseTransactionData['data']['takeoff_gps_lat']) {
                                        allDataValid = false;
                                        datasetTakeoffGpsLat.innerHTML = '<s>' + datasetTakeoffGpsLat.innerText + '</s> / <b>' + responseTransactionData['data']['takeoff_gps_lat'] + '</b>';
                                    }
                                    if (datasetTakeoffGpsLon.innerText != responseTransactionData['data']['takeoff_gps_lon']) {
                                        allDataValid = false;
                                        datasetTakeoffGpsLon.innerHTML = '<s>' + datasetTakeoffGpsLon.innerText + '</s> / <b>' + responseTransactionData['data']['takeoff_gps_lon'] + '</b>';
                                    }
                                    if (datasetLandingTime.innerText != responseTransactionData['data']['landing_time']) {
                                        allDataValid = false;
                                        datasetLandingTime.innerHTML = '<s>' + datasetLandingTime.innerText + '</s> / <b>' + responseTransactionData['data']['landing_time'] + '</b>';
                                    }
                                    if (toBoolean(datasetLandingGpsValid.innerText) != responseTransactionData['data']['landing_gps_valid']) {
                                        allDataValid = false;
                                        datasetLandingGpsValid.innerHTML = '<s>' + datasetLandingGpsValid.innerText + '</s> / <b>' + responseTransactionData['data']['landing_gps_valid'] + '</b>';
                                    }
                                    if (datasetLandingGpsLat.innerText != responseTransactionData['data']['landing_gps_lat']) {
                                        allDataValid = false;
                                        datasetLandingGpsLat.innerHTML = '<s>' + datasetLandingGpsLat.innerText + '</s> / <b>' + responseTransactionData['data']['landing_gps_lat'] + '</b>';
                                    }
                                    if (datasetLandingGpsLon.innerText != responseTransactionData['data']['landing_gps_lon']) {
                                        allDataValid = false;
                                        datasetLandingGpsLon.innerHTML = '<s>' + datasetLandingGpsLon.innerText + '</s> / <b>' + responseTransactionData['data']['landing_gps_lon'] + '</b>';
                                    }
                                    if (datasetOperationModes.innerText != responseTransactionData['data']['operation_modes']) {
                                        allDataValid = false;
                                        datasetOperationModes.innerHTML = '<s>' + datasetOperationModes.innerText + '</s> / <b>' + responseTransactionData['data']['operation_modes'] + '</b>';
                                    }

                                    if (allDataValid) {
                                        datasetDataIntegrity.innerText = 'OK';
                                        datasetDataIntegrity.style.backgroundColor = 'green';
                                    } else {
                                        datasetDataIntegrity.innerText = 'DATA MANIPULATED';
                                        datasetDataIntegrity.style.backgroundColor = 'red';
                                    }
                                }
                            } else {
                                datasetDataIntegrity.innerText = 'ERROR';
                                // TODO: Show errors & warnings (on hover?)
                                datasetDataIntegrity.style.backgroundColor = 'red';
                            }
                        };

                        const xhttpCChainLink = new XMLHttpRequest();
                        xhttpCChainLink.onload = () => { handleCChainLinkResponse() };
                        xhttpCChainLink.timeout = 5000;
                        xhttpCChainLink.ontimeout = (e) => {
                            datasetDataIntegrity.innerText = 'C-Chain Link unreachable';
                            datasetDataIntegrity.style.backgroundColor = 'red';
                        };
                        xhttpCChainLink.onerror = (e) => {
                            datasetDataIntegrity.innerText = 'invalid response from C-Chain Link';
                            datasetDataIntegrity.style.backgroundColor = 'red';
                        };
                        xhttpCChainLink.open('GET', cChainLinkUrl + 'get_data?transaction_uuid=' + transactionUUID + '&rand=' + new Date().getTime(), true);
                        xhttpCChainLink.send();
                    } else {
                        datasetDataIntegrity.innerText = 'not booked in blockchain';
                        datasetDataIntegrity.style.backgroundColor = 'red';
                    }
                }
            };
            const xhttpTrafficControl = new XMLHttpRequest();
            xhttpTrafficControl.onload = () => { handleTrafficControlResponse() };
            xhttpTrafficControl.open('GET', trafficControlUrl + 'ask/flight_data?payload=' + payloadTrafficControl + '&rand=' + new Date().getTime(), true);
            xhttpTrafficControl.send();
        }
    }


    #setDroneId(droneId) {
        this.#droneId = droneId;
        this.#updateIdRangeSelector(true, true);
    }

}