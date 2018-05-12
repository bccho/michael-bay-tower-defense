// Tower inherits from GameObject
function Tower(kwargs) {
    kwargs = kwargs || {};

    // Initialize member variables
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
        } else if (option === "arm_meshes") {
            this._arm_model = new THREE.Group();
            for (i = 0; i < value.length; i++) {
                this._arm_model.add(value[i]);
            }
        } else continue;
        // Delete option if dealt with here
        delete kwargs[option];
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

Tower.prototype.getArmAngle = function() {
    return this._arm_model.rotation.y;
};


// Simple tower for quick and dirty testing. Inherits from Tower
function SimpleTower() {
    var phong = new THREE.MeshPhongMaterial( {color: 0x444444, emissive: 0x222222, side: THREE.DoubleSide } );
    var tower_body = new THREE.Mesh(new THREE.BoxGeometry(10, 20, 10), phong);
    var tower_arm = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 15), phong);
    tower_body.position.set(0.0, 10.0, 0.0);
    tower_arm.position.set(0.0, 15.0, 7.5);

    var kwargs = {body_meshes: [tower_body], arm_meshes: [tower_arm]};
    Tower.call(this, kwargs);

    return this;
}

SimpleTower.prototype = new Tower();

SimpleTower.prototype.update = function(deltaT) {
    var nearestEnemy = GameEngine.findNearestGameObject(Enemy, this._position);
    if (nearestEnemy !== undefined) {
        var vecToEnemy = nearestEnemy._position.clone().sub(this._position);
        this.setArmAngle(Math.atan2(vecToEnemy.x, vecToEnemy.z));
        // this._arm_model.lookAt(vecToEnemy); // TODO: can handle vertical angle, but from global coordinates, not local!
    }

    // Call base method
    GameObject.prototype.update.call(this, deltaT);
};
