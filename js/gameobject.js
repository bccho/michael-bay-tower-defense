// General base class for independent object in game.
// Keeps track of meshes and object transforms
// Exposes update() for step updating, and getModel() to get model to add to scene for rendering

function GameObject(kwargs) {
    kwargs = kwargs || {};

    // Initialize member variables
    this._position = new THREE.Vector3(); // global position
    this._angle = 0; // global horizontal angle
    this._vangle = 0; // global vertical angle
    this._model = undefined; // Group object with all objects to render
    this._heightAboveGround = undefined; // if not undefined, pins position relative to ground level

    // Parse options
    for (var option in kwargs) {
        var value = kwargs[option];
        if (option === "position") {
            this._position = value;
        } else if (option === "angle") {
            this._angle = value;
        } else if (option === "vangle") {
            this._vangle = value;
        } else if (option === "meshes") {
            // Make new THREE.Group with meshes
            this._model = new THREE.Group();
            for (var i = 0; i < value.length; i++) {
                this._model.add(value[i]);
            }
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
        var elev = Terrain.getElevation(this._position.x, this._position.z);
        this._position.y = elev + this._heightAboveGround;
    }

    // Update model with position and rotation
    this._model.position.copy(this._position);
    this._model.rotation.y = this._angle;
    // TODO: vertical angle
};

GameObject.prototype.getModel = function() {
    return this._model;
};