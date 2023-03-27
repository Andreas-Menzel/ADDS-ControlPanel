class InfrastructureManagementApplet {

    #dataVisible = 'intersections';

    #intersections = {};
    #corridors = {};


    init() {
        this.#initControlPanel();

        this.#updateButtons();
        this.#updateInfrastructureTableVisibility();
        this.#updateTableContents();
    }

    #initControlPanel() {
        const btnShowIntersections = document.getElementsByClassName('btn_infrastructureManagementApplet_showIntersections')[0];
        const btnShowCorridors = document.getElementsByClassName('btn_infrastructureManagementApplet_showCorridors')[0];

        btnShowIntersections.addEventListener('click', () => {
            this.#dataVisible = 'intersections';
            this.#updateButtons();
            this.#updateInfrastructureTableVisibility();
        });

        btnShowCorridors.addEventListener('click', () => {
            this.#dataVisible = 'corridors';
            this.#updateButtons();
            this.#updateInfrastructureTableVisibility();
        });
    }


    #updateButtons() {
        const btnShowIntersections = document.getElementsByClassName('btn_infrastructureManagementApplet_showIntersections')[0];
        const btnShowCorridors = document.getElementsByClassName('btn_infrastructureManagementApplet_showCorridors')[0];

        if (this.#dataVisible == 'intersections') {
            btnShowIntersections.classList.add('buttonActive');
            btnShowCorridors.classList.remove('buttonActive');
        } else if (this.#dataVisible == 'corridors') {
            btnShowIntersections.classList.remove('buttonActive');
            btnShowCorridors.classList.add('buttonActive');
        }
    }

    #updateInfrastructureTableVisibility() {
        const intersectionsTableWrapper = document.getElementsByClassName('infrastructureManagementApplet_intersectionsTableWrapper')[0];
        const corridorsTableWrapper = document.getElementsByClassName('infrastructureManagementApplet_corridorsTableWrapper')[0];

        if (this.#dataVisible == 'intersections') {
            intersectionsTableWrapper.style.display = 'block';
            corridorsTableWrapper.style.display = 'none';
        } else if (this.#dataVisible == 'corridors') {
            intersectionsTableWrapper.style.display = 'none';
            corridorsTableWrapper.style.display = 'block';
        }
    }


    #updateTableContents(dataType = 'both') {
        if (dataType == 'intersections') {
            this.#updateIntersectionsTableContent();
        } else if (dataType == 'corridors') {
            this.#updateCorridorsTableContent();
        } else if (dataType == 'both') {
            this.#updateIntersectionsTableContent();
            this.#updateCorridorsTableContent();
        }
    }

    #updateIntersectionsTableContent() {
        const intersectionsTableWrapper = document.getElementsByClassName('infrastructureManagementApplet_intersectionsTableWrapper')[0];

        const tableBody = intersectionsTableWrapper.querySelectorAll('tbody')[0];
        tableBody.innerHTML = '';

        let tmpIntersections = { ...this.#intersections };
        tmpIntersections['NEW_INTERSECTION_ID'] = new Intersection('NEW_INTERSECTION_ID');

        for (let intersectionId in tmpIntersections) {
            let newIntersectionEntry = document.createElement('tr');
            newIntersectionEntry.dataset.intersection_id = intersectionId;

            let entryId = document.createElement('td');
            let entryIdInput = document.createElement('input');
            entryIdInput.setAttribute('type', 'text');
            entryIdInput.value = tmpIntersections[intersectionId].getId();
            entryIdInput.disabled = true;
            entryId.appendChild(entryIdInput);

            let entryGpsLat = document.createElement('td');
            let entryGpsLatInput = document.createElement('input');
            entryGpsLatInput.setAttribute('type', 'number');
            entryGpsLatInput.value = tmpIntersections[intersectionId].getGpsLat();
            entryGpsLat.appendChild(entryGpsLatInput);

            let entryGpsLon = document.createElement('td');
            let entryGpsLonInput = document.createElement('input');
            entryGpsLonInput.setAttribute('type', 'number');
            entryGpsLonInput.value = tmpIntersections[intersectionId].getGpsLon();
            entryGpsLon.appendChild(entryGpsLonInput);

            let entryAltitude = document.createElement('td');
            let entryAltitudeInput = document.createElement('input');
            entryAltitudeInput.setAttribute('type', 'number');
            entryAltitudeInput.value = tmpIntersections[intersectionId].getAltitude();
            entryAltitude.appendChild(entryAltitudeInput);

            let entryDataSource = document.createElement('td');
            entryDataSource.style.width = '0';
            let entryDataSourceButton = document.createElement('button');
            entryDataSourceButton.classList.add('standardButton');
            entryDataSourceButton.innerText = 'Load from setup_drone';
            entryDataSourceButton.onclick = () => {
                const payload = {
                    'drone_id': 'setup_drone',
                    'data_type': 'aircraft_location'
                };
                const handleResponse = () => {
                    const response = JSON.parse(xhttp.response);

                    if (response['executed']) {
                        console.log(response);
                        if (response['response_data']['gps_valid']) {
                            const setupDroneGpsLat = response['response_data']['gps_lat'];
                            const setupDroneGpsLon = response['response_data']['gps_lon'];
                            const setupDroneAltitude = response['response_data']['altitude'];

                            entryGpsLatInput.value = setupDroneGpsLat;
                            entryGpsLonInput.value = setupDroneGpsLon;
                            entryAltitudeInput.value = setupDroneAltitude;

                            entryBtnSave.disabled = false;
                        }
                    } else {
                        alert('Could not load data from drone with id "setup_drone".');
                    }
                };
                const xhttp = new XMLHttpRequest();
                xhttp.onload = () => { handleResponse() };
                xhttp.open('GET', trafficControlUrl + 'ask/aircraft_location?payload=' + JSON.stringify(payload) + '&rand=' + new Date().getTime(), true);
                xhttp.send();
            };

            entryDataSource.appendChild(entryDataSourceButton);

            let entryBtnSave = document.createElement('button');
            entryBtnSave.innerText = 'Save';
            entryBtnSave.classList.add('standardButton');
            entryBtnSave.style.width = '0';
            entryBtnSave.disabled = true;
            entryBtnSave.onclick = () => {
                if (entryIdInput.value == 'NEW_INTERSECTION_ID') {
                    alert('Please set (another) intersection id!');
                    return;
                }

                // Deactivate all input fields
                let everythingToDisable = intersectionsTableWrapper.querySelectorAll('input, select, button');
                for (let input of everythingToDisable) {
                    input.disabled = true;
                }

                const payload = {
                    'intersection_id': entryIdInput.value,
                    'data_type': 'intersection_location',
                    'data': {
                        'gps_lat': entryGpsLatInput.value,
                        'gps_lon': entryGpsLonInput.value,
                        'altitude': entryAltitudeInput.value
                    }
                };
                const handleResponse = () => {
                    const response = JSON.parse(xhttp.response);

                    if (response['executed']) {
                        delete tmpIntersections[intersectionId];
                        this.#intersections[entryIdInput.value] = new Intersection(entryIdInput.value);
                        this.#intersections[entryIdInput.value].setValues(entryGpsLatInput.value, entryGpsLonInput.value, entryAltitudeInput.value);

                        this.#updateTableContents();
                    }
                };
                const xhttp = new XMLHttpRequest();
                xhttp.onload = () => { handleResponse() };
                xhttp.open('GET', trafficControlUrl + 'tell/intersection_location?payload=' + JSON.stringify(payload) + '&rand=' + new Date().getTime(), true);
                xhttp.send();
            };

            entryIdInput.oninput = () => {
                entryBtnSave.disabled = false;
            }
            entryGpsLatInput.oninput = () => {
                entryBtnSave.disabled = false;
            }
            entryGpsLonInput.oninput = () => {
                entryBtnSave.disabled = false;
            }
            entryAltitudeInput.oninput = () => {
                entryBtnSave.disabled = false;
            }

            newIntersectionEntry.appendChild(entryId);
            newIntersectionEntry.appendChild(entryGpsLat);
            newIntersectionEntry.appendChild(entryGpsLon);
            newIntersectionEntry.appendChild(entryAltitude);
            newIntersectionEntry.appendChild(entryDataSource);
            newIntersectionEntry.appendChild(entryBtnSave);

            tableBody.appendChild(newIntersectionEntry);
        }

        // Enable id input for new intersection 
        tableBody.children[tableBody.children.length - 1].children[0].children[0].disabled = false;
    }

    #updateCorridorsTableContent() {
        const corridorsTableWrapper = document.getElementsByClassName('infrastructureManagementApplet_corridorsTableWrapper')[0];

        const tableBody = corridorsTableWrapper.querySelectorAll('tbody')[0];
        tableBody.innerHTML = '';

        let tmpCorridors = { ...this.#corridors };
        tmpCorridors['NEW_CORRIDOR_ID'] = new Corridor('NEW_CORRIDOR_ID');

        for (let corridorId in tmpCorridors) {
            const disableSelectedIntersectionOptions = () => {
                for (let opt of entryIntersectionBSelect.options) {
                    if (opt.value == entryIntersectionASelect.value) {
                        opt.disabled = true;
                    } else {
                        opt.disabled = false;
                    }
                }

                for (let opt of entryIntersectionASelect.options) {
                    if (opt.value == entryIntersectionBSelect.value) {
                        opt.disabled = true;
                    } else {
                        opt.disabled = false;
                    }
                }
            };

            let cor = tmpCorridors[corridorId];

            let newCorridorEntry = document.createElement('tr');
            newCorridorEntry.dataset.corridorId = corridorId;

            let entryId = document.createElement('td');
            let entryIdInput = document.createElement('input');
            entryIdInput.setAttribute('type', 'text');
            entryIdInput.value = tmpCorridors[corridorId].getId();
            entryIdInput.disabled = true;
            entryId.appendChild(entryIdInput);

            let entryIntersectionA = document.createElement('td');
            entryIntersectionA.style.width = '0';

            let entryIntersectionASelect = document.createElement('select');
            entryIntersectionA.appendChild(entryIntersectionASelect);
            for (let intId in this.#intersections) {
                let newOption = document.createElement('option');
                newOption.value = intId;
                newOption.innerText = intId;
                if (cor.getIntersectionAId() == intId) {
                    newOption.selected = true;
                }
                entryIntersectionASelect.appendChild(newOption);
            }

            let entryIntersectionB = document.createElement('td');
            entryIntersectionB.style.width = '0';

            let entryIntersectionBSelect = document.createElement('select');
            entryIntersectionB.appendChild(entryIntersectionBSelect);
            for (let intId in this.#intersections) {
                let newOption = document.createElement('option');
                newOption.value = intId;
                newOption.innerText = intId;
                if (cor.getIntersectionBId() == intId) {
                    newOption.selected = true;
                }
                entryIntersectionBSelect.appendChild(newOption);
            }

            disableSelectedIntersectionOptions();

            let entryBtnSave = document.createElement('button');
            entryBtnSave.innerText = 'Save';
            entryBtnSave.classList.add('standardButton');
            entryBtnSave.style.width = '0';
            entryBtnSave.disabled = true;
            entryBtnSave.onclick = () => {
                if (entryIdInput.value == 'NEW_CORRIDOR_ID') {
                    alert('Please set (another) corridor id!');
                    return;
                }

                // Deactivate all input fields
                let everythingToDisable = corridorsTableWrapper.querySelectorAll('input, select, button');
                for (let input of everythingToDisable) {
                    input.disabled = true;
                }

                const payload = {
                    'corridor_id': entryIdInput.value,
                    'data_type': 'corridor_location',
                    'data': {
                        'intersection_a': entryIntersectionASelect.value,
                        'intersection_b': entryIntersectionBSelect.value
                    }
                };
                const handleResponse = () => {
                    const response = JSON.parse(xhttp.response);

                    if (response['executed']) {
                        delete tmpCorridors[corridorId];
                        this.#corridors[entryIdInput.value] = new Corridor(entryIdInput.value);
                        this.#corridors[entryIdInput.value].setValues(entryIntersectionASelect.value, entryIntersectionBSelect.value);

                        this.#updateTableContents();
                    }
                };
                const xhttp = new XMLHttpRequest();
                xhttp.onload = () => { handleResponse() };
                xhttp.open('GET', trafficControlUrl + 'tell/corridor_location?payload=' + JSON.stringify(payload) + '&rand=' + new Date().getTime(), true);
                xhttp.send();
            };

            entryIdInput.oninput = () => {
                entryBtnSave.disabled = false;
            }
            entryIntersectionASelect.onchange = () => {
                disableSelectedIntersectionOptions();

                entryBtnSave.disabled = false;
            }
            entryIntersectionBSelect.onchange = () => {
                disableSelectedIntersectionOptions();

                entryBtnSave.disabled = false;
            }

            newCorridorEntry.appendChild(entryId);
            newCorridorEntry.appendChild(entryIntersectionA);
            newCorridorEntry.appendChild(entryIntersectionB);
            newCorridorEntry.appendChild(entryBtnSave);

            tableBody.appendChild(newCorridorEntry);
        }

        // Enable id input for new corridor 
        tableBody.children[tableBody.children.length - 1].children[0].children[0].disabled = false;
    }


    updateIntersections(intersections) {
        if (Object.keys(this.#intersections).join(',') !== Object.keys(intersections).join(',')) {
            this.#intersections = { ...intersections }; // Copy so that we can detect a change

            this.#updateTableContents('intersections');
        }
    }

    updateCorridors(corridors) {
        if (Object.keys(this.#corridors).join(',') !== Object.keys(corridors).join(',')) {
            this.#corridors = { ...corridors }; // Copy so that we can detect a change

            this.#updateTableContents('corridors');
        }
    }

}