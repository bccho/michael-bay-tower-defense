// Enemy inherits from GameObject
function Enemy(kwargs) {
    kwargs = kwargs || {};

    // Initialize member variables
    this._velocity = new THREE.Vector3();

    // Parse options
    for (var option in kwargs) {
        var value = kwargs[option];
        if (option === "velocity") {
            this._velocity = value;
        } else {
            console.log("Unknown option " + option + "! Make sure to register it!");
        }
    }

    kwargs = setDefault(kwargs, "heightAboveGround", 0);
    GameObject.call(this, kwargs);

    return this;
}

Enemy.prototype = new GameObject();

Enemy.prototype.update = function() {
    this._position.add(this._velocity);

    // Call base method
    GameObject.prototype.update.call(this);
};
