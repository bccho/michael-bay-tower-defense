function Tower(kwargs) {
    kwargs = kwargs || {};

    this._body_model = undefined;
    this._arm_model = undefined;

    // Parse options
    var i;
    for (var option in kwargs) {
        var value = kwargs[option];
        if (option === "body_meshes") {
            this._body_model = new THREE.Group();
            for (i = 0; i < value.length; i++) {
                this._body_model.add(value[i]);
            }
            delete kwargs.body_meshes;
        } else if (option === "arm_meshes") {
            this._arm_model = new THREE.Group();
            for (i = 0; i < value.length; i++) {
                this._arm_model.add(value[i]);
            }
            delete kwargs.arm_meshes;
        } else {
            console.log("Unknown option " + option + "! Make sure to register it!");
        }
    }

    kwargs = setDefault(kwargs, "heightAboveGround", 0);
    kwargs.meshes = [];
    if (this._body_model !== undefined) kwargs.meshes.push(this._body_model);
    if (this._arm_model  !== undefined) kwargs.meshes.push(this._arm_model);

    GameObject.call(this, kwargs);

    return this;
}

Tower.prototype = new GameObject();

Tower.prototype.setArmAngle = function(angle) {
    this._arm_model.rotation.y = angle;
};



function SimpleTower() {
    var phong = new THREE.MeshPhongMaterial( {color: 0x444444, emissive: 0x222222, side: THREE.DoubleSide } );
    var tower_body = new THREE.Mesh(new THREE.BoxGeometry(10, 20, 10), phong);
    var tower_arm = new THREE.Mesh(new THREE.BoxGeometry(20, 5, 5), phong);
    tower_body.position.set(0.0, 10.0, 0.0);
    tower_arm.position.set(7.5, 17.5, 0.0);

    var kwargs = {"body_meshes": [tower_body], "arm_meshes": [tower_arm]};
    Tower.call(this, kwargs);

    return this;
}

SimpleTower.prototype = new Tower();
