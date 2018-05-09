function GameObject (opts) {
    // Initialize member variables
    this._position = new THREE.Vector3();
    this._shapes = [];
    this._heightAboveGround = undefined;

    // Parse options
    for (var option in opts) {
        var value = opts[option];
        if (option === "position") {
            this._position = value;
        } else if (option === "heightAboveGround") {
                this._heightAboveGround = value;
        } else {
            console.log("Unknown option " + option + "! Make sure to register it!");
        }
    }

    return this;
}

GameObject.prototype.update = function() {
    if (this._heightAboveGround !== undefined) { // object is pinned to some height above ground
        this._position.y = this._heightAboveGround; // TODO: look up terrain height
    }
};

GameObject.prototype.getDrawableObjects = function() {
    return [];
};
