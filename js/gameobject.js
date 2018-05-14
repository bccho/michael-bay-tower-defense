// General base class for independent object in game.
// Keeps track of meshes and object transforms
// Exposes update() for step updating, and getModel() to get model to add to scene for rendering

function GameObject(kwargs) {
    kwargs = kwargs || {};

    // Initialize member variables
    this._position = new THREE.Vector3(); // global position
    this._angle = 0; // global horizontal angle
    this._vangle = 0; // global vertical angle
    this._model = undefined; // Group object with all objects to render
    this._heightAboveGround = undefined; // if not undefined, pins position relative to ground level
    this._lifespan = undefined;

    this._creationTime = GameEngine.now(); // time of creation

    // Parse options
    for (var option in kwargs) {
        var value = kwargs[option];
        if (option === "position") {
            this._position = value;
        } else if (option === "angle") {
            this._angle = value;
        } else if (option === "vangle") {
            this._vangle = value;
        } else if (option === "lifespan") {
            this._lifespan = value;
        } else if (option === "meshes") {
            // Make new THREE.Group with meshes
            this._model = new THREE.Group();
            for (var i = 0; i < value.length; i++) {
                this._model.add(value[i]);
            }
        } else if (option === "heightAboveGround") {
            this._heightAboveGround = value;
        } else {
            console.log("Unknown option " + option + "! Make sure to register it!");
        }
    }

    return this;
}

GameObject.prototype.update = function() {
    if (this._heightAboveGround !== undefined) { // object is pinned to some height above ground
        var elev = Terrain.getElevation(this._position.x, this._position.z);
        if (elev === undefined) elev = 0;
        this._position.y = elev + this._heightAboveGround;
    }

    // Kill object if past lifespan
    if (this._lifespan !== undefined) {
        if (GameEngine.now() - this._creationTime > this._lifespan) {
            destroy(this);
        }
    }

    // Update model with position and rotation
    if (this._model !== undefined) {
        this._model.position.copy(this._position);
        this._model.rotation.y = this._angle;
        // TODO: vertical angle
    }
};

GameObject.prototype.getModel = function() {
    return this._model;
};



// GameObject with animated mesh. Inherits from GameObject
function AnimatedGameObject(kwargs) {
    kwargs = kwargs || {};

    // Initialize member variables
    this._animations = [];
    this._meshes = [];
    this._model_names = undefined;
    this._material = new THREE.MeshLambertMaterial({color: 0x606060, morphTargets: true, transparent:true, opacity:0.5});
    this._scale = new THREE.Vector3(1, 1, 1);

    // Parse options
    for (var option in kwargs) {
        var value = kwargs[option];
        if (option === "model_names") {
            this._model_names = value;
            delete kwargs.model_names;
        } else if (option === "material") {
            this._material = value;
            delete kwargs.material;
        } else if (option === "scale") {
            this._scale = value;
            delete kwargs.scale;
        }
    }

    // Need to call parent constructor first before adding animations
    GameObject.call(this, kwargs);

    // Load animations
    var material = this._material;

    if (this._model_names !== undefined) {
        // Manually create model
        this._model = new THREE.Group();
        for (var i = 0; i < this._model_names.length; i++) {
            // Load mesh from file
            var loadFunction = function(geometry) {
                var mesh = new THREE.Mesh(geometry, material);
                if (mesh !== undefined) {
                    // Make animation from mesh
                    mesh.scale.copy(this._scale);
                    var animation = new THREE.MorphAnimation(mesh);
                    // Add to lists of meshes and animations
                    this._meshes.push(mesh);
                    this._animations.push(animation);
                    this._model.add(mesh);
                    animation.play();
                }
            };
            var loader = new THREE.JSONLoader(true);
            loader.load(this._model_names[i], loadFunction.bind(this));
        }
    }

    return this;
}

AnimatedGameObject.prototype = new GameObject();

AnimatedGameObject.prototype.stop = function() {
    for (var i = 0; i < this._animations.length; i++) {
        this._animations[i].isPlaying = false;
    }
};

AnimatedGameObject.prototype.update = function(deltaT) {
    for (var i = 0; i < this._animations.length; i++) {
        if (!this._animations[i].isPlaying) continue;
        this._animations[i].update(deltaT * 1000.0);
    }

    // Call base method
    GameObject.prototype.update.call(this);
};
