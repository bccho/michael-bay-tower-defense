// Enemy inherits from AnimatedGameObject
function Enemy(kwargs) {
    kwargs = kwargs || {};

    // Initialize member variables
    this._velocity = new THREE.Vector3();

    // Parse options
    for (var option in kwargs) {
        var value = kwargs[option];
        if (option === "velocity") {
            this._velocity = value;
        } else continue;
        // Delete option if dealt with here
        delete kwargs[option];
    }

    kwargs = setDefault(kwargs, "heightAboveGround", 0);
    AnimatedGameObject.call(this, kwargs);

    return this;
}
Enemy.prototype = new AnimatedGameObject();

Enemy.prototype.update = function(deltaT) {
    this._position.add(this._velocity.clone().multiplyScalar(deltaT));

    // Do damage if reached other side of map
    if (this._position.z > Terrain._max.z) {
        // TODO: set damage to parameter
        LevelManager.takeDamage(1);
        destroy(this);
    }

    // Call base method
    AnimatedGameObject.prototype.update.call(this, deltaT);
};


// Simple enemy for quick and dirty testing. Inherits from Enemy
function SimpleEnemy(kwargs) {
    kwargs = kwargs || {};
    var radius = 10.0;
    var phong = new THREE.MeshPhongMaterial( {color: 0xFF0000} );
    var body = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), phong);
    body.position.set(0.0, radius, 0.0);

    kwargs = setDefault(kwargs, "meshes", [body]);
    Enemy.call(this, kwargs);

    return this;
}
SimpleEnemy.prototype = new Enemy();


// Horse animated enemy
function HorseEnemy(kwargs) {
    kwargs = kwargs || {};
    kwargs = setDefault(kwargs, "model_names", ["animated_models/horse.js"]);
    Enemy.call(this, kwargs);
}
HorseEnemy.prototype = new Enemy();
