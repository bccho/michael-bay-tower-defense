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
        } else continue;
        // Delete option if dealt with here
        delete kwargs[option];
    }

    kwargs = setDefault(kwargs, "heightAboveGround", 0);
    GameObject.call(this, kwargs);

    return this;
}

Enemy.prototype = new GameObject();

Enemy.prototype.update = function(delta_t) {
    this._position.add(this._velocity.clone().multiplyScalar(delta_t));

    // Call base method
    GameObject.prototype.update.call(this);
};


// Simple enemy for quick and dirty testing. Inherits from Enemy
function SimpleEnemy(kwargs) {
    var radius = 10.0;
    var phong = new THREE.MeshPhongMaterial( {color: 0xFF0000} );
    var body = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), phong);
    body.position.set(0.0, radius, 0.0);

    kwargs = setDefault(kwargs, "meshes", [body]);
    Enemy.call(this, kwargs);

    return this;
}

SimpleEnemy.prototype = new Enemy();
