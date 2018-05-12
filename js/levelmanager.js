// LevelManager inherits from GameObject
function LevelManager(kwargs) {
    kwargs = kwargs || {};

    // Initialize member variables
    this._cooldown = undefined;   // in milliseconds
    this._maxEnemies = undefined;
    this._currentCooldown = 0;

    kwargs = setDefault(kwargs, "cooldown", 1500);
    kwargs = setDefault(kwargs, "maxEnemies", 10);

    // Parse options
    for (var option in kwargs) {
        var value = kwargs[option];
        if (option === "cooldown") {
            this._cooldown = value;
        } else if (option === "maxEnemies") {
            this._maxEnemies = value;
        } else continue;
        // Delete option if dealt with here
        delete kwargs[option];
    }

    GameObject.call(this, kwargs);

    return this;
}

LevelManager.prototype = new GameObject();

LevelManager.prototype.update = function(deltaT) {
    this._currentCooldown += deltaT;
    if (this._currentCooldown >= this._cooldown && GameEngine.numGameObject(SimpleEnemy) <= this._maxEnemies) {
        var x = -(Terrain._width * Terrain._unitSize / 2);
        var z = Math.random() * x;
        create(SimpleEnemy, {"position": new THREE.Vector3(x, 0, z)});  // place randomly on left of terrain
        this._currentCooldown = 0;
    }

    // Call base method
    GameObject.prototype.update.call(this);
};
