function Tower(opts) {
    opts = opts || {};

    this._body_model = undefined;
    this._arm_model = undefined;

    // Parse options
    var i;
    for (var option in opts) {
        var value = opts[option];
        if (option === "body_meshes") {
            this._body_model = new THREE.Group();
            for (i = 0; i < value.length; i++) {
                this._body_model.add(value[i]);
            }
            delete opts.body_meshes;
        } else if (option === "arm_meshes") {
            this._arm_model = new THREE.Group();
            for (i = 0; i < value.length; i++) {
                this._arm_model.add(value[i]);
            }
            delete opts.arm_meshes;
        } else {
            console.log("Unknown option " + option + "! Make sure to register it!");
        }
    }

    opts = setDefault(opts, "heightAboveGround", 0);
    opts.meshes = [];
    if (this._body_model !== undefined) opts.meshes.push(this._body_model);
    if (this._arm_model  !== undefined) opts.meshes.push(this._arm_model);

    GameObject.call(this, opts);

    return this;
}

Tower.prototype = new GameObject();

Tower.prototype.setArmAngle = function(angle) {
    this._arm_model.rotation.y = angle;
};
