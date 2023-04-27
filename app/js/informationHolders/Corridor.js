class Corridor {

    #id;

    #dataValid;

    #intersectionAId;
    #intersectionBId;

    #lockedBy;


    constructor(id) {
        this.#id = id;
        this.setDefaultValues();
    }


    setDefaultValues() {
        this.#dataValid = false;

        this.#intersectionAId = null;
        this.#intersectionBId = null;

        this.#lockedBy = null;
    }


    setValues(intersectionAId, intersectionBId, lockedBy) {
        this.#dataValid = true;

        this.#intersectionAId = intersectionAId;
        this.#intersectionBId = intersectionBId;

        this.#lockedBy = lockedBy;
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

    getLockedBy() {
        return this.#lockedBy;
    }

}