// Tower inherits from GameObject
function Tower(kwargs) {
    kwargs = kwargs || {};

    // Initialize member variables
    this._body_model = undefined;
    this._arm_model = undefined;
    this._range = 1000;
    this._cooldown = 1;  // in seconds
    this._timeSinceShot = 0;

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
        } else if (option === "range") {
            this._range = value;
        } else if (option === "cooldown") {
            this._cooldown = value;
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

Tower.prototype.setArmAngle = function(angle, vangle) {
    if (angle !== undefined) this._arm_model.rotation.y = angle;
    if (vangle !== undefined) this._arm_model.rotation.y = angle;
};

Tower.prototype.getArmAngle = function() {
    return this._arm_model.rotation.y;
};


// Simple tower for quick and dirty testing. Inherits from Tower
function SimpleTower() {
    this._height = 15;

    var phong = new THREE.MeshPhongMaterial( {color: 0x444444, emissive: 0x222222, side: THREE.DoubleSide } );
    var tower_body = new THREE.Mesh(new THREE.BoxGeometry(10, this._height + 5, 10), phong);
    var tower_arm = new THREE.Mesh(new THREE.BoxGeometry(5, 5, this._height), phong);
    tower_body.position.set(0.0, 10.0, 0.0);
    tower_arm.position.set(0.0, this._height, 7.5);

    var kwargs = {body_meshes: [tower_body], arm_meshes: [tower_arm]};
    Tower.call(this, kwargs);

    return this;
}

SimpleTower.prototype = new Tower();

SimpleTower.prototype.update = function(deltaT) {
    this._timeSinceShot += deltaT;

    var nearestEnemy = GameEngine.findNearestGameObject(HorseEnemy, this._position);
    //console.log(nearestEnemy);
    if (nearestEnemy !== undefined) {

        // aim at target
        var p = new THREE.Vector3(this._position.x, this._position.y + this._height, this._position.z);
        var vecToEnemy = nearestEnemy._position.clone().sub(p);
        this.setArmAngle(Math.atan2(vecToEnemy.x, vecToEnemy.z));

        // shoot at target if we can
        if (nearestEnemy._position.distanceTo(p) <= this._range && this._timeSinceShot >= this._cooldown) {
            var targetAngle = nearestEnemy._position.clone().sub(p).normalize();
            // Jitter target angle
            targetAngle.add(sampleSphere(0.1));
            // Create bullet
            create(Bullet, {
                "position": p.clone(),
                "velocity": targetAngle.multiplyScalar(250),
                "damage": 10,
                "emitter": Explosion,
                "emitter_kwargs": {lifespan: 0.3, explosionSpeed: 10, particlesFreq: 500}
            });
            this._timeSinceShot = 0;
        }
    }

    // Call base method
    GameObject.prototype.update.call(this, deltaT);
};
