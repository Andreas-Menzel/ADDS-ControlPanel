class Corridor {

    #id;

    #dataValid;

    #intersectionAId;
    #intersectionBId;


    constructor(id) {
        this.#id = id;
        this.setDefaultValues();
    }


    setDefaultValues() {
        this.#dataValid = false;

        this.#intersectionAId = null;
        this.#intersectionBId = null;
    }


    updateValues() {
        const payload = '{"corridor_id": "' + this.#id + '","data_type": "corridor_location"}';
        const handleResponse = () => {
            const response = JSON.parse(xhttp.responseText);

            if(response['executed']) {
                this.#dataValid = true;

                this.#intersectionAId = response['response_data']['intersection_a'];
                this.#intersectionBId = response['response_data']['intersection_b'];
            }
        };
        const xhttp = new XMLHttpRequest();
        xhttp.onload = () => { handleResponse() };
        xhttp.open('GET', trafficControlUrl + 'ask/corridor_location?payload=' + payload, true);
        xhttp.send();
    }


    getId() {
        return this.#id;
    }

    getDataValid() {
        return this.#dataValid;
    }

    getIntersectionAId() {
        return this.#intersectionAId;
    }
    getIntersectionBId() {
        return this.#intersectionBId;
    }

}