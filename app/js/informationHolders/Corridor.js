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


    setValues(intersectionAId, intersectionBId) {
        this.#dataValid = true;

        this.#intersectionAId = intersectionAId;
        this.#intersectionBId = intersectionBId;
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