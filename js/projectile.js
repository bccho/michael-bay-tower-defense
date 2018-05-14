// Projectile inherits from GameObject
function Projectile(kwargs) {
    kwargs = kwargs || {};

    // Initialize member variables
    this._damage = 0;
    this._blastRadius = 0;
    this._velocity = new THREE.Vector3();
    this._emitter = undefined;
    this._emitter_kwargs = undefined;

    // Parse options
    for (var option in kwargs) {
        var value = kwargs[option];
        if (option === "velocity") {
            this._velocity = value;
        } else if (option === "damage") {
            this._damage = value;
        } else if (option === "blastRadius") {
            this._blastRadius = value;
        } else if (option === "emitter") {
            this._emitter = value;
        } else if (option === "emitter_kwargs") {
            this._emitter_kwargs = value;
        } else continue;
        // Delete option if dealt with here
        delete kwargs[option];
    }

    kwargs = setDefault(kwargs, "heightAboveGround", undefined);
    GameObject.call(this, kwargs);

    return this;
}
Projectile.prototype = new GameObject();

Projectile.prototype.update = function(deltaT) {
    // compute next position
    var p = this._position.clone();
    var v = this._velocity.clone();
    var nextPos = p.clone().add(v.clone().multiplyScalar(deltaT));

    // initialize raycaster
    var raycaster = new THREE.Raycaster(p.clone(), nextPos.clone().sub(p).normalize());

    // make list of gameobject models to intersect (and a map for converting back to gameobjects)
    // TODO: do more efficiently? Use THREE.Group?
    var enemies = GameEngine.findAllGameObjects(Enemy);
    var objectsToIntersect = [];
    for (var i = 0; i < enemies.length; i++) {
        objectsToIntersect.push(enemies[i].getModel());
    }
    objectsToIntersect.push(Terrain.getModel());

    // intersect the objects - if collision occurs, create emitter.  if collision near enemy, do damage
    var intersections = raycaster.intersectObjects(objectsToIntersect, true);
    if (intersections.length > 0) {
        if (intersections[0].distance <= p.distanceTo(nextPos)) {  // will collide this step
            // Make explosion
            if (this._emitter !== undefined) {
                this._emitter_kwargs = this._emitter_kwargs || {};
                setDefault(this._emitter_kwargs, "position", intersections[0].point);
                create(this._emitter, this._emitter_kwargs);
            }

            // Hit everything in blast radius proportional to distance
            for (i = 0; i < enemies.length; i++) {
                var dist = enemies[i]._position.distanceTo(nextPos);
                if (dist < this._blastRadius) {
                    enemies[i].takeDamage(((this._blastRadius - dist) / this._blastRadius) * this._damage);
                }
            }

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
    kwargs = setDefault(kwargs, "blastRadius", 10);
    kwargs = setDefault(kwargs, "lifespan", 5); // 5 second lifespan
    //kwargs = setDefault(kwargs, "emitter", Explosion);

    Projectile.call(this, kwargs);
    return this;
}
Bullet.prototype = new Projectile();
