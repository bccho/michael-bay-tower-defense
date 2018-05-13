// Projectile inherits from GameObject
function Projectile(kwargs) {
    kwargs = kwargs || {};

    // Initialize member variables
    this._damage = 1;
    this._velocity = new THREE.Vector3();
    this._emitter = undefined;

    // Parse options
    for (var option in kwargs) {
        var value = kwargs[option];
        if (option === "velocity") {
            this._velocity = value;
        } else if (option === "damage") {
            this._damage = value;
        } else if (option === "emitter") {
            this._emitter = value;
        } else continue;
        // Delete option if dealt with here
        delete kwargs[option];
    }

    kwargs = setDefault(kwargs, "heightAboveGround", 0);
    GameObject.call(this, kwargs);

    return this;
}
Projectile.prototype = new GameObject();

Projectile.prototype.update = function(deltaT) {
    var p = this._position.clone();
    var v = this._velocity.clone();
    var nextPos = p.clone().add(v.clone().multiplyScalar(deltaT));
    var raycaster = new THREE.Raycaster(p.clone(), nextPos.clone().sub(p).normalize());
    var intersections = raycaster.intersectObjects(Scene._objects, false);
    if (intersections.length > 0) {
        if (intersections[0].distance <= p.distanceTo(nextPos)) {  // will collide this step
            if (this._emitter !== undefined)
                create(this._emitter, {"position": intersections[0].point});
            if (intersections[0].object instanceof Enemy)
                intersections[0].object.takeDamage(this._damage);
            destroy(this);
            return;
        }
    }

    this._position = nextPos;

    // Call base method
    GameObject.prototype.update.call(this, deltaT);
};



// Simple bullet for the simple tower. Inherits from projectile
function Bullet(kwargs) {
    kwargs = kwargs || {};

    var radius = 2.0;
    var phong = new THREE.MeshPhongMaterial( {color: 0xFFFFFF} );
    var body = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), phong);
    body.position.set(0.0, radius, 0.0);

    kwargs = setDefault(kwargs, "meshes", [body]);
    //kwargs = setDefault(kwargs, "emitter", Explosion);

    Projectile.call(this, kwargs);
    return this;
}
Bullet.prototype = new Projectile();
